import { NextRequest, NextResponse } from "next/server";
import { getMetrics } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const m = await getMetrics();
  return NextResponse.json(m, { headers: { "cache-control": "no-store" } });
}
