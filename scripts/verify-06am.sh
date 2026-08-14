#!/usr/bin/env bash
set -e
# 06:00 manual unblock verifier — see company/history/done_later.md steps 1-4
# chmod +x scripts/verify-06am.sh && ./scripts/verify-06am.sh
BASE="https://pollpop-five.vercel.app"
echo "Check Vercel Dashboard env: NEXT_PUBLIC_SUPABASE_URL etc for prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM"
echo "BASE=$BASE"
HAS_JQ=0; command -v jq >/dev/null 2>&1 && HAS_JQ=1
jget() { if [ "$HAS_JQ" = 1 ]; then jq -r "$1" 2>/dev/null; else grep -oE "$2" 2>/dev/null | head -n1; fi; }

echo "--- 1) POST /api/polls (2 picsum) -> 201 ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/polls" -H "Content-Type: application/json" \
  -d '{"title":"smoke","options":[{"label":"A","image_url":"https://picsum.photos/seed/s1/600/600"},{"label":"B","image_url":"https://picsum.photos/seed/s2/600/600"}]}')
CODE=$(echo "$RESP" | tail -n1); BODY=$(echo "$RESP" | sed '$d')
if [ "$CODE" = "201" ]; then echo "[PASS] POST picsum 201"; else echo "[FAIL] POST picsum code=$CODE body=$(echo "$BODY" | head -c 300)"; exit 1; fi
if [ "$HAS_JQ" = 1 ]; then ID=$(echo "$BODY" | jq -r '.poll.id // .id // empty'); else ID=$(echo "$BODY" | grep -oE '"id"[[:space:]]*:[[:space:]]*"[^"]+"' | head -n1 | grep -oE '"[^"]+"$' | tr -d '"'); fi
[ -n "$ID" ] || { echo "[FAIL] no id in response"; exit 1; }
echo "  id=$ID"

echo "--- 2) POST /api/polls (1 data: png + 1 picsum) -> 201 poll-images ---"
B64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
RESP2=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/polls" -H "Content-Type: application/json" \
  -d "{\"title\":\"smoke-data\",\"options\":[{\"label\":\"A\",\"image_url\":\"data:image/png;base64,$B64\"},{\"label\":\"B\",\"image_url\":\"https://picsum.photos/seed/s3/600/600\"}]}")
CODE2=$(echo "$RESP2" | tail -n1); BODY2=$(echo "$RESP2" | sed '$d')
if [ "$CODE2" = "201" ]; then echo "[PASS] POST data: 201"; else echo "[FAIL] POST data: code=$CODE2 body=$(echo "$BODY2" | head -c 400)"; exit 1; fi
if echo "$BODY2" | grep -q "poll-images"; then echo "[PASS] data: image_url contains poll-images"; else echo "[FAIL] data: image_url missing poll-images body=$(echo "$BODY2" | head -c 400)"; exit 1; fi

echo "--- 3) GET /api/polls/\$ID -> 200 with 2 options ---"
RESP3=$(curl -s -w "\n%{http_code}" "$BASE/api/polls/$ID")
CODE3=$(echo "$RESP3" | tail -n1); BODY3=$(echo "$RESP3" | sed '$d')
if [ "$CODE3" = "200" ]; then echo "[PASS] GET poll 200"; else echo "[FAIL] GET poll code=$CODE3"; exit 1; fi
if echo "$BODY3" | grep -q '"options"'; then
  CNT=""; if [ "$HAS_JQ" = 1 ]; then CNT=$(echo "$BODY3" | jq '[.poll.options // .options // []] | length'); else CNT=$(echo "$BODY3" | grep -o '"image_url"' | wc -l); fi
  if [ "$CNT" = "2" ] || echo "$BODY3" | grep -q '"image_url".*"image_url"'; then echo "[PASS] GET poll has 2 options"; else echo "[FAIL] GET poll options count=$CNT"; exit 1; fi
else echo "[FAIL] GET poll no options key"; exit 1; fi

echo "--- 4) GET /api/metrics -> 200 totals ---"
RESP4=$(curl -s -w "\n%{http_code}" "$BASE/api/metrics")
CODE4=$(echo "$RESP4" | tail -n1); BODY4=$(echo "$RESP4" | sed '$d')
if [ "$CODE4" = "200" ]; then echo "[PASS] GET metrics 200"; else echo "[FAIL] GET metrics code=$CODE4"; exit 1; fi
if echo "$BODY4" | grep -q '"totals"'; then echo "[PASS] metrics has totals"; else echo "[FAIL] metrics missing totals body=$(echo "$BODY4" | head -c 300)"; exit 1; fi

echo "--- 5) GET /api/polls/\$ID/og -> 200 image + x-pollpop-og ---"
HDR=$(mktemp); IMG=$(mktemp)
CODE5=$(curl -s -D "$HDR" -o "$IMG" -w "%{http_code}" "$BASE/api/polls/$ID/og")
CTYPE=$(grep -i "^content-type:" "$HDR" | tr -d '\r' | head -n1)
OGH=$(grep -i "^x-pollpop-og:" "$HDR" | tr -d '\r' | head -n1)
echo "  $CTYPE | $OGH | code=$CODE5"
if [ "$CODE5" = "200" ]; then echo "[PASS] GET og 200"; else echo "[FAIL] GET og code=$CODE5"; cat "$HDR"; exit 1; fi
if echo "$CTYPE" | grep -qiE "image/(png|svg\+xml)"; then echo "[PASS] og content-type $CTYPE"; else echo "[FAIL] og content-type $CTYPE"; exit 1; fi
if echo "$OGH" | grep -qi "x-pollpop-og:"; then echo "[PASS] og x-pollpop-og header present"; else echo "[FAIL] og missing x-pollpop-og header"; cat "$HDR"; exit 1; fi
rm -f "$HDR" "$IMG"
echo "All checks PASS"
