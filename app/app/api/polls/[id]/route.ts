import { NextRequest, NextResponse } from "next/server";
import { getPoll } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const poll = await getPoll(params.id);
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  // also include OG url for client meta
  const og = `/api/polls/${encodeURIComponent(poll.id)}/og`;

  return NextResponse.json({ poll, og }, {
    headers: { "cache-control": "public, max-age=0, must-revalidate" },
  });
}
