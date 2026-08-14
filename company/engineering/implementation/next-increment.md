# Next increment — Phase B slice

**Picked:** Enable e2e in CI against mock (not perf bench, not Storage upload).

**Why:** Fastest §33 flip (e2e coverage). `e2e: if: false` in `.github/workflows/test.yml` means CI never validates the loop. Mock mode already works (no Supabase env). Perf bench and Storage upload are larger and don't unblock quality-bar.

**What to build**
- Flip `e2e.if: false` → `if: true` (or remove gate).
- Pin CI to mock: `PLAYWRIGHT_BASE_URL=http://localhost:${PORT}` so `webServer` (`npm run dev`) serves deterministic mock, not prod `pollpop-five.vercel.app`.
- Keep `npx playwright install --with-deps chromium` + `npm run test:e2e`.

**Acceptance**
- `git push main` → both jobs green: `test` (vitest 11/11 + build) and `e2e` (chromium, 1 worker, 2 retries).
- Local `PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e` passes (create→vote→results→share→CTA path).
- quality-bar e2e item moves from unchecked to checked; §33 count 8/17 → 9/17.

**Risk**
- Flake if prod fallback or `webServer` slow start → pin LOCAL_URL, `reuseExistingServer: false` in CI, 120s timeout.
- Browser install +2min CI → ok; cache later.

**Estimate:** 2–4h. **Out of scope:** real Supabase e2e, Storage upload, perf bench.
