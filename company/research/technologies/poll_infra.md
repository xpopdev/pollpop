# Technology Notes: Poll Infrastructure (Candidate 003 PollPop)

Date: 2026-08-14 | Confidence per §29.

**PollPop needs:** 15-sec creation (2-4 image options) → persistent link → vote → live results → "Create your own" CTA. No AI required for MVP.

### Core infra (trivial)
- **Stack:** Any web framework (Next.js / SvelteKit) + DB (Postgres/Supabase) + image storage (S3/R2/Cloudinary) + real-time (Supabase Realtime / Pusher / SSE) (VERIFIED all exist). No model inference, no GPU cost — gross margin is infra pennies.
- **Real-time tally:** Vote → increment counter transactionally → broadcast via websocket/SSE. VERIFIED pattern. Must handle burst voting (share goes viral in group chat) — optimistic counts + debounce (INFERRED best practice).
- **Image handling:** Upload 2-4 images, resize/compress (Sharp/Cloudinary), generate OG image for link preview (VERIFIED — OG card is critical for share click-through in WhatsApp/Discord/iMessage).
- **OG / link preview:** Dynamic OG image per poll (option collage + tally) drives CTR when link unfurls. VERIFIED technique. Without this, share is dead.

### Anti-abuse & dedup (must-have)
- **Vote dedup:** Anonymous voter = cookie + localStorage + IP fingerprint (fuzzy, not strict). Prevent double-vote without forcing login (INFERRED tradeoff: strict auth kills virality, so allow revote but count once per browser+IP window, ESTIMATE).
- **Rate limiting:** Per-IP and per-poll caps to block brigading (VERIFIED pattern).
- **Moderation:** Image polls need NSFW check — Cloudflare Images / AWS Rekognition or LLM vision filter (VERIFIED services exist). Risk is low vs video UGC but non-zero (INFERRED).

### Optional AI later (not MVP)
- Suggest poll options/images from context ("we can't decide dinner" → suggest 4 cuisines + stock images) via LLM (INFERRED easy add, not needed to validate loop).

### Viral CTA plumbing
- **Voter → creator conversion:** Results page must show "Create your own poll — 15s" with one-tap prefilled from viewed poll (VERIFIED pattern from Strawpoll/Poll-Maker gaps). Measure creator_conversion_rate (INFERRED critical metric).

### Recommendation for MVP
Supabase (DB + Realtime + Auth + Storage) + OG image rendering + soft dedup + NSFW filter. Cheapest/fastest to validate of all three candidates (1-2 week MVP). Validate voters_per_poll and creator_conversion_rate before adding discovery/leaderboard.

Re-verification 2026-08-14: Retried WebSearch "Supabase pricing 2026 database realtime storage" → 400 max_uses error; WebFetch supabase.com/pricing + supabase.com → haiku model error — all failed (see research_log.md). No VERIFIED pricing delta; free-tier limits and paid $/mo remain INFERRED/ESTIMATE. Do not base gross-margin model on these numbers until live check succeeds.

