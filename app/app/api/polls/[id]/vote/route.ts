import { NextRequest, NextResponse } from "next/server";
import { voteOnPoll, recordEvent } from "@/lib/store";
import { getCookieFromHeader, clientIpFromHeaders, COOKIE_NAME } from "@/lib/dedup";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const option_id = String(body.option_id || body.optionId || "");
    if (!option_id) return NextResponse.json({ error: "option_id required" }, { status: 400 });

    let voter_cookie = getCookieFromHeader(req.headers.get("cookie"));
    const cidHeader = req.headers.get("x-pollpop-cid");
    if (!voter_cookie && cidHeader) voter_cookie = String(cidHeader);
    // if still missing, create one and set cookie
    let setCookie: string | null = null;
    if (!voter_cookie) {
      voter_cookie = randomUUID();
      setCookie = `${COOKIE_NAME}=${encodeURIComponent(voter_cookie)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
    const ip = clientIpFromHeaders(req.headers);

    const res = await voteOnPoll({ poll_id: params.id, option_id, voter_cookie, ip });
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: res.status, headers: setCookie ? { "set-cookie": setCookie } : undefined });
    }

    await recordEvent({ name: "vote", poll_id: params.id, cookie: voter_cookie, ref: null, meta: { option_id } });

    const headers: Record<string,string> = {};
    if (setCookie) headers["set-cookie"] = setCookie;

    return NextResponse.json({ counts: res.counts, total: res.total }, { headers });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Vote failed" }, { status: 500 });
  }
}
