# Seeding Plan — 7-Day CTR Validation (2026-08-15 → 2026-08-22)

Goal: Flip quality-bar `validation` unchecked→checked by measuring H-001 binding CTR `cta_click / poll_view ≥0.08` (per `decisions/approved.md` VERIFIED). Prod is VERIFIED ready (5/5 PASS 2026-08-15 `pollpop-five.vercel.app` per `done_later.md`).

Templates: Recreate 8 shapes from `pollpop-validation/data/polls.json` as live polls via prod `POST /api/polls` (VERIFIED): fit-check, brunch-crew, logo-battle, thumbnail-wars, sneaker-drop, living-room, album-cover, airbnb-pick. Each = title ≤80, 2–4 labeled images (picsum seeds), OG 1200×630 auto-generated. ESTIMATE 10 min to recreate all 8.

Seeding: 12–15 real group chats — 4 friend circles (WhatsApp/iMessage), 3 team channels (Slack), 3 classroom Discords, 2–3 extended family/interest WhatsApp. Anti-spam: 1 poll per chat per day max, natural framing "which one? — vote settles it" + `p/{id}` link only (no @everyone, no cross-post same day). Seed 2–3 polls/day rotating shapes. HYPOTHESIS: taste-help framing avoids spam reports.

Metrics (P0-6 per `requirements.md`): Binding `CTR = cta_click / poll_view` (primary), diagnostic `cta_click/cta_view`, `cta_click/vote`. Health `voters_per_poll` (KILL if <3 across >10 polls, per approved.md). `unfurl suppression` >50% vs direct → KILL (H-003). `K-factor = polls_created_via_cta / poll_view` via `?ref=poll_{id}` attribution (ESTIMATE), `referred retention` = referred creators with 2nd poll in 7d (HYPOTHESIS).

Daily check (09:00 UTC): `GET /api/metrics` + `/metrics.html` — verify event counts monotonic, crawler hits vs poll_view. No interim verdict before day 7.

Verdict day 7: ≥0.08 → PASS | 0.03–0.08 → INCONCLUSIVE (one CTA/copy retry) | <0.03 → KILL (per approved.md). On PASS → `gate-check` CEO gate → `history/milestones/` → §40 continuous improvement.
