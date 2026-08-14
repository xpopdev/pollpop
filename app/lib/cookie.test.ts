// lib/cookie.test.ts — HttpOnly cookie fix: Set-Cookie header formation (Phase B)
// File-based, no live Supabase. Mocks NextRequest and calls POST /api/polls via direct import
// (like storage.test.ts does for Supabase mock). Asserts HttpOnly; Secure; SameSite=Lax.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

function resetMock() {
  (globalThis as unknown as Record<string, unknown>).__pollpop_mock = undefined;
  try {
    const file = path.join(process.cwd(), ".pollpop-mock.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const appFile = path.join(process.cwd(), "app", ".pollpop-mock.json");
    if (fs.existsSync(appFile)) fs.unlinkSync(appFile);
  } catch {}
}

function makeReq(body: unknown, extraHeaders: Record<string, string> = {}) {
  const url = "http://localhost:3000/api/polls";
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

function validBody(title = "Cookie test") {
  return {
    title,
    options: [
      { label: "A", image_url: "https://picsum.photos/seed/cookie-a/600/600" },
      { label: "B", image_url: "https://picsum.photos/seed/cookie-b/600/600" },
    ],
  };
}

describe("POST /api/polls — Set-Cookie HttpOnly; Secure; SameSite=Lax", () => {
  beforeEach(() => {
    resetMock();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    // do not reset modules globally — each test imports POST lazily; but clear mock state
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("with no cookie, sets HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000", async () => {
    const { POST } = await import("@/app/api/polls/route");
    const req = makeReq(validBody("No cookie HttpOnly"), { "x-forwarded-for": "11.11.11.11" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const setCookie = res.headers.get("set-cookie") ?? res.headers.get("Set-Cookie");
    expect(setCookie, "Set-Cookie must be present when no cookie was sent").toBeTruthy();
    const sc = String(setCookie);
    expect(sc).toContain("pollpop_cid=");
    expect(sc).toContain("HttpOnly");
    expect(sc).toContain("Secure");
    expect(sc).toContain("SameSite=Lax");
    expect(sc).toContain("Path=/");
    expect(sc).toContain("Max-Age=31536000");
    // value should be uuid-shaped
    const m = sc.match(/pollpop_cid=([^;]+)/);
    expect(m, "pollpop_cid value present").toBeTruthy();
    const val = decodeURIComponent(m![1]);
    expect(val).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("with existing pollpop_cid cookie, does not set Set-Cookie (no rotation)", async () => {
    const { POST } = await import("@/app/api/polls/route");
    const cid = "123e4567-e89b-12d3-a456-426614174000";
    const req = makeReq(validBody("Existing cookie"), {
      cookie: `pollpop_cid=${cid}`,
      "x-forwarded-for": "22.22.22.22",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const setCookie = res.headers.get("set-cookie") ?? res.headers.get("Set-Cookie");
    // When client already sent a valid pollpop_cid cookie, server must not issue a new one
    expect(setCookie).toBeNull();
  });

  it("with x-pollpop-cid fallback (no cookie), sets HttpOnly rotation containing that cid", async () => {
    const { POST } = await import("@/app/api/polls/route");
    const fallback = "fallback-uuid-0000-1111-aaaa-000000000001";
    const req = makeReq(validBody("Fallback HttpOnly"), {
      "x-pollpop-cid": fallback,
      "x-forwarded-for": "33.33.33.33",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const setCookie = res.headers.get("set-cookie") ?? res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    const sc = String(setCookie);
    expect(sc).toContain(encodeURIComponent(fallback));
    expect(sc).toContain("HttpOnly");
    expect(sc).toContain("Secure");
    expect(sc).toContain("SameSite=Lax");
    expect(sc).toContain("Path=/");
    expect(sc).toContain("Max-Age=31536000");
  });
});
