# engineering/tests/

Test strategy and results across all layers (master protocol §18), maintained by the qa-lead and red-team-reviewer agents.

## 06:00 manual unblock verification

After completing `company/history/done_later.md` steps 1-3 (Vercel env, Supabase `poll-images` bucket, tables/RPC/Realtime), run the smoke verifier:

```bash
chmod +x scripts/verify-06am.sh   # executable bit stored in git (100755); emulated storage masks it, so use bash scripts/verify-06am.sh if needed
bash scripts/verify-06am.sh        # or ./scripts/verify-06am.sh
# — without args it hits https://pollpop-five.vercel.app and prints [PASS]/[FAIL] per check
```

What it does (53 lines, `set -e`, `curl -s -w` for status, `jq` if available else `grep`):
1. Echoes `Check Vercel Dashboard env: NEXT_PUBLIC_SUPABASE_URL etc for prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM`
2. `POST /api/polls` with 2 `picsum.photos` URLs → expect `201`, captures `id`
3. `POST /api/polls` with 1 `data:image/png;base64` (1×1) + 1 picsum → expect `201` and `poll-images` in returned `image_url`
4. `GET /api/polls/<id>` → expect `200` with 2 options
5. `GET /api/metrics` → expect `200` with `totals`
6. `GET /api/polls/<id>/og` → expect `200`, `content-type: image/png` or `image/svg+xml`, and `x-pollpop-og` header

CI: `test` 11/11 + `e2e` 2/2 green at b161b4b via mock `webServer` (`PLAYWRIGHT_BASE_URL=http://localhost:3000`, no Supabase — `Running 2 tests ... 2 passed (12.0s)` on run 31822972048). Prod `POST` still 500 until 06:00 env/bucket fix above — see `qa-2026-08-14-phaseB.md` and `smoke-2026-08-14-retry.md` for blocked status.
