// dedup.ts — cookie + ip_hash soft-dedup (P0-2)
// Client helpers + server helpers. 24h window, last write wins.

export const COOKIE_NAME = "pollpop_cid";
export const LS_KEY = "pollpop_cid";

export function ensureClientId(): string {
  if (typeof window === "undefined") return "";
  let cid = localStorage.getItem(LS_KEY);
  if (cid) return cid;
  // also try cookie
  const m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)"));
  if (m) {
    cid = decodeURIComponent(m[1]);
    localStorage.setItem(LS_KEY, cid);
    return cid;
  }
  cid = crypto.randomUUID();
  persistClientId(cid);
  return cid;
}

export function persistClientId(cid: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, cid);
  // JS-writable cookie (httpOnly false) + 1y expiry
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cid)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function getCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// Server: sha256(ip + salt) — only ip_hash is persisted.
export async function hashIp(ip: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(ip + salt);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Fallback sync version for Node (no subtle in some runtimes) — use node crypto if available
export function hashIpSync(ip: string, salt: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  try {
    const nodeCrypto = require("crypto") as typeof import("crypto");
    return nodeCrypto.createHash("sha256").update(ip + salt).digest("hex");
  } catch {
    // fallback (not cryptographically strong but ok for mock dev)
    let h = 0;
    const s = ip + salt;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(16, "0");
  }
}

export function clientIpFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}
