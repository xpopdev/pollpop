# Smoke retry 2026-08-14 — prod 04d5571

**Prod:** https://pollpop-five.vercel.app (04d5571, test 11/11 e2e 2/2 VERIFIED)
**Supabase:** dgurslguhkatnshlzvfcy migrations 001-004 (poll-images bucket) on disk VERIFIED

**1. Code path** VERIFIED: `app/app/api/polls/route.ts:79-108` checks `data:` → `parseDataUrl` (mime/6MB), then `supa.storage.from("poll-images").upload(path, buffer)` + `getPublicUrl` when `isSupabaseConfigured`. 004_storage.sql VERIFIED public bucket + RLS.

**2. POST picsum×2 (normal)** VERIFIED 500 `{"error":"TypeError: fetch failed"}` — not 201. `createPoll` Supabase insert fails (same as prior smoke). INFERRED Vercel→Supabase connectivity/auth, not RLS (no insert reaches DB).

**3. POST dataURL(1×1 png)+picsum** VERIFIED 500 `{"error":"Image upload failed — try again"}` — route.ts:100 branch hit, so DATA_URL upload path is live, but `storage.from("poll-images").upload` throws. INFERRED bucket missing or service_role key not set in Vercel env / storage RLS.

**4. GET /api/metrics** VERIFIED 200 `totals all 0` — healthy but empty DB consistent with (2).

**5. GET /p/fit-check** VERIFIED 200 HTML shell (Next.js, needs client fetch).

**Verdict:** Fix NOT live-effective — reads green, writes blocked. Check Vercel `SUPABASE_URL/SERVICE_ROLE_KEY` + `vercel logs --follow` for `[poll-images upload] failed` / DB fetch detail, and Supabase Dashboard Storage → poll-images exists.
