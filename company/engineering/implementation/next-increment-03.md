# Next increment 03 — PollCard flat manilla/oat

**Picked:** PollCard gradient → flat. Defers prod smoke (blocked until 06:00 Vercel logs + bucket per `done_later.md`) and competitor/bench re-verify.

**Why:** Unblocked, no prod DB. Cleans Medium `design exact — Don't use gradients`: `linear-gradient` violates spec `Surfaces — flat, no gradients` (globals.css:74). Small, committable, no P0 risk.

**What to build**
- `app/components/PollCard.tsx:20` `linear-gradient(to top, rgba(0,0,0,.55)…)` → flat scrim `rgba(18,18,20,.42)` or `var(--color-oat-warm)` with solid border; keep legibility.
- `app/components/PollCard.tsx:99` `linear-gradient(135deg,var(--accent2),var(--accent))` avatar → `background: var(--color-oat-warm)` or `var(--color-manilla)` + `border:1px solid var(--color-stone)`.
- No `globals.css` changes needed.

**Acceptance**
- `grep -r "gradient" app/components/PollCard.tsx` → 0 hits; `npm run build` + `npm test` green (11/11).
- Visual: card legible on light/dark picsum, avatar contrast AA.

**Risk:** Flat scrim less contrast → mitigate by keeping dark pill badge + testing both image types.
**Estimate:** 1h. **Out of scope:** perf bench fill, prod smoke, OG/realtime.
