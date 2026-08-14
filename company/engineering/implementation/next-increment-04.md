# Next increment 04 — HttpOnly cookie + trusted IP (RT-SEC-05/RT-BUG-17)

**Picked:** (a) HttpOnly cookie + x-vercel-forwarded-for. Defers prod smoke (blocked 06:00 per done_later.md) and perf probe. Unblocks security PARTIAL→PASS, file-only, no DB.

**Why:** RT-SEC-05 JS-readable pollpop_cid + x-pollpop-cid → dedup takeover; RT-SEC-04 x-forwarded-for first-entry spoof → rate bypass (RT-SEC-02). 003/004 done.

**What to build**
- app/lib/dedup.ts: clientIpFromHeaders trusts x-vercel-forwarded-for then x-real-ip; drop x-forwarded-for.
- middleware.ts (or vote/route.ts + polls/route.ts): Set-Cookie pollpop_cid HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000 server-side. x-pollpop-cid only fallback when cookie missing, then rotate.

**Acceptance**
- grep -r "x-forwarded-for" app/ →0; grep "x-vercel-forwarded-for" app/lib/dedup.ts →1; Set-Cookie has HttpOnly; Secure; build + test 11/11 green.

**Risk:** Secure breaks http localhost → gate on NODE_ENV=production.
**Estimate:** 1–2h. **Out of scope:** RLS, Storage, Redis, OG.
