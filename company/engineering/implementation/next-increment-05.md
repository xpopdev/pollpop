# Next increment 05 — Competitor watch §25 refresh (viral-loop note)

**Picked:** (b) competitor_watch.md note. Defers (a) verify-06am.sh unit tests and (c) nightly WebFetch workflow — both file-based but heavier. Docs-only, no prod DB, no P0 flip.

**Why:** §25 requires current watch; e2e 2/2 now covers viral loop (create→vote→share→revote) vs IG/Strawpoll gap in competitors/instagram_polls.md. Keeps record current while prod POST 500 blocked until 06:00 per done_later.md prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM; HttpOnly + x-vercel + Storage mock ~18 tests green.

**What:** Add dated line to competitor_watch.md: `2026-08-14 — no price change (WebFetch 403, still INFERRED per §29); viral loop covered by e2e 2/2; threat Low; re-verify when fetch recovers.` Bump header last-checked date.

**Acceptance:** diff shows dated viral-loop + INFERRED line; no code change; `rg INFERRED` present; `npm test` still 11/11+ green; build OK.

**Risk:** None — docs-only; reversible. **Estimate:** 10 min. **Out of scope:** VERIFIED pricing, RLS/Storage/OG.
