import { NextRequest, NextResponse } from "next/server";
import { getPoll, recordEvent } from "@/lib/store";
import { getCookieFromHeader } from "@/lib/dedup";
import type { EventName } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: Set<EventName> = new Set([
  "poll_view","vote","cta_view","cta_click","poll_create","poll_create_start","poll_create_complete","share_copy","share_native","poll_create_error"
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(()=>({}));
    const name = String(body.name || "") as EventName;
    if (!ALLOWED.has(name)) return NextResponse.json({ error: "invalid event name" }, { status: 400 });
    const poll_id = body.poll_id ? String(body.poll_id) : null;
    const ref = body.ref ? String(body.ref).slice(0, 120) : (body.ref === null ? null : (new URL(req.url).searchParams.get("ref") || null));
    const meta = body.meta && typeof body.meta === "object" ? body.meta as Record<string, unknown> : null;
    const cookie = getCookieFromHeader(req.headers.get("cookie")) || (req.headers.get("x-pollpop-cid") ? String(req.headers.get("x-pollpop-cid")) : null);

    // RT-BUG-06: validate poll_id exists if provided (global events have poll_id=null)
    if (poll_id) {
      const exists = await getPoll(poll_id);
      if (!exists) return NextResponse.json({ error: "unknown poll_id" }, { status: 400 });
    }

    // basic dedup: don't double-count poll_view/cta_view within same session tick — but allow votes
    await recordEvent({ name, poll_id, cookie, ref, meta });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
