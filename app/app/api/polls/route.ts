import { NextRequest, NextResponse } from "next/server";
import { createPoll } from "@/lib/store";
import { getCookieFromHeader, clientIpFromHeaders, hashIpSync } from "@/lib/dedup";
import { isSupabaseConfigured, supaService } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body.title || "");
    const context = body.context ? String(body.context) : undefined;
    const category = body.category ? String(body.category) : undefined;
    const options = Array.isArray(body.options) ? body.options.map((o: unknown) => {
      const obj = o as { label?: unknown; image_url?: unknown; imageUrl?: unknown };
      return {
        label: String(obj.label || ""),
        image_url: String(obj.image_url || obj.imageUrl || ""),
      };
    }) : [];
    const ref = body.ref ? String(body.ref) : null;

    // cookie dedup + ip
    const cookieHeader = req.headers.get("cookie");
    const cidHeader = req.headers.get("x-pollpop-cid");
    const creator_cookie = getCookieFromHeader(cookieHeader) || (cidHeader ? String(cidHeader) : null) || null;
    const ip = clientIpFromHeaders(req.headers);

    // RT-BUG-18: accept data URLs up to 6 MB, upload to Supabase Storage when configured.
    // Non-data URLs keep the 2048 cap. Data URLs are converted to Buffer and uploaded
    // to bucket `poll-images`; mock fallback (no Supabase) keeps the data URL as before.
    const DATA_URL_MAX_BYTES = 6 * 1024 * 1024;
    function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
      const m = dataUrl.match(/^data:([^;,]+)(;base64)?,(.*)$/);
      if (!m) return null;
      const mime = m[1].trim();
      const isBase64 = !!m[2];
      const data = m[3];
      try {
        const buffer = isBase64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data), "utf-8");
        return { mime, buffer };
      } catch {
        return null;
      }
    }
    function mimeToExt(mime: string): string {
      const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };
      return map[mime.toLowerCase()] || "jpg";
    }

    for (const opt of options) {
      if (opt.image_url.startsWith("data:")) {
        const parsed = parseDataUrl(opt.image_url);
        if (!parsed) {
          return NextResponse.json({ error: "Invalid image data URL" }, { status: 400 });
        }
        if (!parsed.mime.startsWith("image/")) {
          return NextResponse.json({ error: "Only image data URLs are allowed" }, { status: 400 });
        }
        if (parsed.buffer.length > DATA_URL_MAX_BYTES) {
          return NextResponse.json({ error: "Image too large — max 6 MB" }, { status: 400 });
        }
        if (parsed.buffer.length === 0) {
          return NextResponse.json({ error: "Empty image upload" }, { status: 400 });
        }
      } else if (opt.image_url.length > 2048) {
        return NextResponse.json({ error: "Image URL too long — upload to Storage" }, { status: 400 });
      }
    }

    // Upload any data URLs to Supabase Storage when configured; mock keeps data URL
    const hasDataUrl = options.some((o) => o.image_url.startsWith("data:"));
    if (hasDataUrl && isSupabaseConfigured) {
      const supa = supaService();
      if (supa) {
        for (let i = 0; i < options.length; i++) {
          const url = options[i].image_url;
          if (!url.startsWith("data:")) continue;
          const parsed = parseDataUrl(url);
          if (!parsed) {
            return NextResponse.json({ error: "Invalid image data URL" }, { status: 400 });
          }
          // re-check size defensively (already validated above)
          if (parsed.buffer.length > DATA_URL_MAX_BYTES) {
            return NextResponse.json({ error: "Image too large — max 6 MB" }, { status: 400 });
          }
          const ext = mimeToExt(parsed.mime);
          const rand = Math.random().toString(36).slice(2, 8);
          const path = `polls/${Date.now()}-${i}-${rand}.${ext}`;
          const { error: upErr } = await supa.storage.from("poll-images").upload(path, parsed.buffer, {
            contentType: parsed.mime,
            upsert: false,
          });
          if (upErr) {
            console.error("[poll-images upload] failed", upErr);
            return NextResponse.json({ error: "Image upload failed — try again" }, { status: 500 });
          }
          const { data } = supa.storage.from("poll-images").getPublicUrl(path);
          options[i].image_url = data.publicUrl;
        }
      }
    }

    const res = await createPoll({ title, context, category, options, creator_cookie, ip });
    if ("error" in res) {
      const body: Record<string, unknown> = { error: res.error, status: res.status };
      if ("code" in res && res.code) body.code = res.code;
      if ("retry_after" in res && res.retry_after) body.retry_after = res.retry_after;
      const headers: Record<string, string> = {};
      if ("retry_after" in res && res.retry_after) headers["retry-after"] = String(res.retry_after);
      return NextResponse.json(body, { status: res.status, headers: Object.keys(headers).length ? headers : undefined });
    }
    const poll = res.poll;

    // also record poll_create_complete event attributed via ref
    const { recordEvent } = await import("@/lib/store");
    await recordEvent({ name: "poll_create_complete", poll_id: poll.id, cookie: creator_cookie, ref, meta: { title: poll.title } });
    await recordEvent({ name: "poll_create", poll_id: poll.id, cookie: creator_cookie, ref, meta: null });

    const origin = req.nextUrl.origin;
    return NextResponse.json({ id: poll.id, url: `${origin}/p/${poll.id}`, poll }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, usage: "POST /api/polls {title, context, options:[{label,image_url}]}" });
}
