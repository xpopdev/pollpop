import { NextRequest } from "next/server";
import { getPoll } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────
// P0-4 OG — PNG vs SVG note (PROD TODO, mock-safe fallback)
// ─────────────────────────────────────────────────────────────────────
// Current: edge-rendered SVG collage (1200×630) — works in mock mode with
// zero deps, never 500, previews in browser and some crawlers.
// Problem: WhatsApp / Discord / iMessage / Telegram unfurl typically
// require `image/png` or `image/jpeg`; they strip or ignore `image/svg+xml`
// → OG appears broken in chat previews despite correct meta.
// TODO(P0-4) prod: switch this route to `runtime = "nodejs"` and render PNG via
//   - `vercel/og` (ImageResponse, edge-friendly, preferred on Vercel) OR
//   - `sharp` (svg → png, already in dependencies, Node-only) OR
//   - pre-render at create time and upload PNG to Supabase Storage `poll-images`
//     bucket, then serve/redirect to that PNG here.
// Fallback note: if `vercel/og` / `sharp` not installed or import fails, keep
// this SVG fallback so mock/local never breaks. Check presence via dynamic
// import + try/catch, return SVG with `x-pollpop-og: svg-*` header when PNG
// unavailable. Do not throw — OG must never 500.
// Reference: `lib/og.ts` is the seam for future PNG impl without caller changes.
// ─────────────────────────────────────────────────────────────────────

function escapeXml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g, "&#39;");
}

// Edge OG: try to serve PNG (WhatsApp/Discord require image/png) via sharp,
// fallback to SVG with correct headers so we never 500.
// sharp is Node-native and not available on edge runtime — dynamic import
// will fail there and we gracefully fall back to SVG.

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const poll = await getPoll(params.id);
    const title = escapeXml((poll?.title || "PollPop — Which one?").slice(0, 80));
    const context = escapeXml((poll?.context || "Vote, see live results, create your own — 15s").slice(0, 120));
    const opts = poll?.options || [];
    const colors = opts.map(o=>o.color || "#7c3aed");

    const blocks = opts.length ? opts.map((o, i) => {
      const x = 24 + i * ( (1200 - 48) / opts.length );
      const w = (1200 - 48) / opts.length - 12;
      const label = escapeXml(o.label.slice(0,18));
      return `<g>
        <rect x="${x}" y="220" rx="16" ry="16" width="${w}" height="280" fill="${colors[i]}" opacity="0.95"/>
        <text x="${x + w/2}" y="370" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="white">${label}</text>
        <text x="${x + w/2}" y="395" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,.85)">${o.votes} votes</text>
      </g>`;
    }).join("") : `<text x="600" y="350" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="white">PollPop — which one? Create yours in 15s → pollpop.app</text>`;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b82"/><stop offset="50%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="18" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="1200" height="630" rx="0" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="630" fill="black" opacity="0.14"/>
  <text x="36" y="48" font-family="Inter, sans-serif" font-size="13" font-weight="800" letter-spacing="4" fill="rgba(255,255,255,.88)">POLLPOP • WHICH ONE?</text>
  <text x="36" y="98" font-family="Inter, sans-serif" font-size="42" font-weight="900" letter-spacing="-1.5" fill="white">${title}</text>
  <text x="36" y="132" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,.88)">${context}</text>
  <text x="36" y="195" font-family="Inter, sans-serif" font-size="12" font-weight="800" letter-spacing="6" fill="rgba(255,255,255,.72)">${opts.length ? opts.length + " OPTIONS • TAP TO VOTE" : "CREATE IN 15s — NO SIGNUP"}</text>
  ${blocks}
  <rect x="36" y="540" rx="999" ry="999" width="280" height="42" fill="white" filter="url(#shadow)"/>
  <text x="176" y="567" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#121214">Vote now → pollpop.app/p/${escapeXml(params.id)}</text>
  <text x="1160" y="610" text-anchor="end" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="rgba(255,255,255,.66)">OG • 1200×630 • poll ${escapeXml(params.id)}</text>
</svg>`;

    // Node runtime: attempt PNG via sharp (WhatsApp/Discord require image/png).
    // sharp is Node-native — dynamic import stays in try/catch so missing dep
    // never 500s; webpack no longer hits node:crypto since we are off edge.
    try {
      const mod: any = await import("sharp");
      const sharp = mod.default ?? mod;
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      return new Response(png as BodyInit, {
        headers: {
          "content-type": "image/png",
          "cache-control": "public, max-age=3600",
          "x-pollpop-og": "png-sharp",
          "x-content-type-options": "nosniff",
          "content-security-policy": "default-src 'none'",
        },
      });
    } catch {
      // sharp not available/bundled — fall through to SVG fallback below
    }

    return new Response(svg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "x-pollpop-og": "svg-nodejs",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'",
      },
    });
  } catch {
    // Absolute fallback: minimal SVG that never throws, ensures never 500
    const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?><svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#7c3aed"/><text x="600" y="315" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="900" fill="white">PollPop</text></svg>`;
    return new Response(fallbackSvg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "x-pollpop-og": "svg-fallback-error",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'",
      },
    });
  }
}
