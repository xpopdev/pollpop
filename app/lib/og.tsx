// lib/og.tsx — OG collage helper (TSX stub + re-export)
// For MVP the edge route at /api/polls/[id]/og renders an SVG directly.
// This module is the seam to swap to sharp / vercel/og later without changing callers.
// Kept as .tsx per spec; re-exports from og.ts for convenience.

export { ogImageUrlForPoll, absoluteUrl } from "./og";

// Future: import { ImageResponse } from "next/og" or vercel/og here
// export function renderOgImage(poll: Poll) { return new ImageResponse(<div>...</div>) }
