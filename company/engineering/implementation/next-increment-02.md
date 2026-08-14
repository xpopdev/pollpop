# Next increment 02 — Prod smoke: Storage 004 live proof

**Picked:** (c) prod smoke for data URL upload — proves 004 works live. Defers (a) gradient polish and (b) Realtime probe (needs data first).

**Why:** 004 applied but never verified live; RT-BUG-18 26 MB data URL risk stays ESTIMATE until poll-images bucket exercised.

**What to build**
- Create poll on `pollpop-five.vercel.app` with one data URL image (FileReader path) + one https URL.
- Confirm `poll_options.image_url` is `https://.../poll-images/...` (not `data:`) and object exists in `poll-images` bucket via Supabase Storage list.
- Vote on that poll → counts update → verify `/metrics` shows `poll_create` and `vote`.

**Acceptance**
- Prod create→bucket exists→vote→metrics succeeds; no `data:` persisted; no 500/413; 5 MB limit enforced.

**Risk:** 004 not applied or bucket RLS misconfig → upload 500; mitigation: check dashboard + retry with `service_role`.
**Estimate:** 1–2h. **Out of scope:** gradient, Realtime bench, perf bench fill.
