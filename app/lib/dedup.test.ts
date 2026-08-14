// lib/dedup.test.ts — cookie + ip_hash + header parsing
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { hashIpSync, clientIpFromHeaders, getCookieFromHeader, COOKIE_NAME, LS_KEY } from "./dedup";

describe("dedup helpers", () => {
  beforeEach(() => {
    // jsdom: clear storage/cookies
    try {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    } catch {}
  });

  afterEach(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  it("pollpop_cid cookie generation is uuid-shaped", async () => {
    // exercise persist + ensure path without mocking crypto.randomUUID shape
    const { ensureClientId, persistClientId } = await import("./dedup");
    // ensure a fresh id is generated
    let cid = "";
    try {
      cid = ensureClientId();
    } catch {}
    // in jsdom, ensureClientId should return a uuid string
    expect(cid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // second call should return same id (persisted via localStorage)
    const cid2 = ensureClientId();
    expect(cid2).toBe(cid);

    // persist a known uuid and read back
    const known = "123e4567-e89b-12d3-a456-426614174000";
    persistClientId(known);
    expect(localStorage.getItem("pollpop_cid")).toBe(known);
    expect(document.cookie).toContain(COOKIE_NAME);
    expect(document.cookie).toContain(known);
  });

  it("hashIpSync deterministic with same salt", async () => {
    const h1 = hashIpSync("1.2.3.4", "test-salt-123");
    const h2 = hashIpSync("1.2.3.4", "test-salt-123");
    const h3 = hashIpSync("1.2.3.4", "different-salt");
    const h4 = hashIpSync("5.6.7.8", "test-salt-123");
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toBe(h4);
    // hex string, 64 chars for sha256
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    // same input always same output across multiple calls (burst determinism)
    const burst = Array.from({ length: 20 }, () => hashIpSync("9.9.9.9", "burst-salt"));
    expect(new Set(burst).size).toBe(1);
  });

  it("clientIpFromHeaders prefers x-vercel-forwarded-for > x-real-ip > x-forwarded-for", () => {
    const h1 = new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3" });
    expect(clientIpFromHeaders(h1)).toBe("1.1.1.1");

    const h2 = new Headers({ "x-forwarded-for": "  4.4.4.4  , 5.5.5.5" });
    expect(clientIpFromHeaders(h2)).toBe("4.4.4.4");

    const h3 = new Headers({ "x-real-ip": "6.6.6.6" });
    expect(clientIpFromHeaders(h3)).toBe("6.6.6.6");

    // x-real-ip takes precedence over x-forwarded-for (RT-SEC-04: trust x-vercel first, then x-real, then xff fallback)
    const h4 = new Headers({ "x-forwarded-for": "7.7.7.7", "x-real-ip": "8.8.8.8" });
    expect(clientIpFromHeaders(h4)).toBe("8.8.8.8");

    // x-vercel-forwarded-for is most trusted (Vercel-verified)
    const h4b = new Headers({ "x-vercel-forwarded-for": "10.10.10.10", "x-forwarded-for": "7.7.7.7", "x-real-ip": "8.8.8.8" });
    expect(clientIpFromHeaders(h4b)).toBe("10.10.10.10");

    const h5 = new Headers({});
    expect(clientIpFromHeaders(h5)).toBe("0.0.0.0");

    // single entry without comma
    const h6 = new Headers({ "x-forwarded-for": "9.9.9.9" });
    expect(clientIpFromHeaders(h6)).toBe("9.9.9.9");
  });

  it("COOKIE_NAME is pollpop_cid and hashIpSync uses salt correctly", () => {
    // COOKIE_NAME constant must be pollpop_cid — route + store + client must agree
    expect(COOKIE_NAME).toBe("pollpop_cid");
    expect(LS_KEY).toBe("pollpop_cid");
    // hash is salt-isolated: same ip+salt deterministic, different salt => different, different ip => different
    const h1 = hashIpSync("10.0.0.1", "prod-salt-xyz");
    const h2 = hashIpSync("10.0.0.1", "prod-salt-xyz");
    const h3 = hashIpSync("10.0.0.1", "other-salt");
    const h4 = hashIpSync("10.0.0.2", "prod-salt-xyz");
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toBe(h4);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    // empty salt vs non-empty must differ (salt not ignored)
    const noSalt = hashIpSync("1.2.3.4", "");
    const withSalt = hashIpSync("1.2.3.4", "s");
    expect(noSalt).not.toBe(withSalt);
  });

  it("getCookieFromHeader parses pollpop_cid correctly from various Cookie headers", () => {
    expect(getCookieFromHeader(null)).toBeNull();
    expect(getCookieFromHeader("")).toBeNull();
    // single cookie
    expect(getCookieFromHeader("pollpop_cid=abc-123")).toBe("abc-123");
    // multiple cookies
    expect(getCookieFromHeader("other=1; pollpop_cid=abc-123; foo=bar")).toBe("abc-123");
    // leading spaces and semicolon variations
    expect(getCookieFromHeader("pollpop_cid=first; pollpop_cid=second")).toBe("first");
    expect(getCookieFromHeader("other=1; pollpop_cid=space-trim")).toBe("space-trim");
    // encoded value
    expect(getCookieFromHeader("pollpop_cid=hello%20world")).toBe("hello world");
    // uuid-shaped value
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    expect(getCookieFromHeader(`pollpop_cid=${uuid}`)).toBe(uuid);
    // wrong name must not match
    expect(getCookieFromHeader("other_cid=abc; foo=bar")).toBeNull();
    expect(getCookieFromHeader("pollpop_cid_wrong=abc")).toBeNull();
    // pollpop_cid among many with similar prefix
    expect(getCookieFromHeader("pollpop_cid_wrong=bad; pollpop_cid=good")).toBe("good");
  });
});
