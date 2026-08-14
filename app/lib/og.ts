// og.ts — OG collage helpers
// For MVP we do NOT bundle sharp. OG route renders via HTML/CSS on the edge
// (Next.js dynamic image via inline SVG/HTML) and falls back to a static gradient
// with poll title when images are unavailable.

export function ogImageUrlForPoll(origin: string, pollId: string) {
  return `${origin}/api/polls/${encodeURIComponent(pollId)}/og`;
}

export function absoluteUrl(reqUrl: string, path: string) {
  try {
    const u = new URL(reqUrl);
    return `${u.protocol}//${u.host}${path}`;
  } catch {
    return path;
  }
}
