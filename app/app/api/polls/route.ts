import { NextRequest, NextResponse } from "next/server";
import { createPoll } from "@/lib/store";
import { getCookieFromHeader, clientIpFromHeaders, hashIpSync } from "@/lib/dedup";

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

    const res = await createPoll({ title, context, category, options, creator_cookie, ip });
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: res.status });
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
