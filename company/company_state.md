# Company state

> Single source of truth for "what phase are we in and what's happening right now." The COO
> agent keeps this current; every agent should read it before starting work.

**Autonomy mode:** UNATTENDED

**Current phase:** PHASE 3 — BUILD (004 Storage applied, perf bench next)

**Last updated:** 2026-08-14

**Active department / agent:** Engineering (perf bench) + QA

**Summary:** 004_storage.sql applied per user (poll-images bucket public + RLS service write, anon read). Prior 003 RLS, 002 RPC done. CI 9eaefad docs + 0194cd8 all green (test 11/11 + e2e 2/2 + build + pages). Design exact 56c2bcf, prod pollpop-five live. Handoff 2026-08-14_build_to_build written. Auto loop Phase B — next perf bench (15s/500ms/2s) → quality-bar → §40.

**In flight:** Perf bench stub (engineering/performance) + next hardening

**Blocked on:** nothing — auto loop, 004 now applied so data URL → Storage path live in prod

**Next action:** Perf bench → quality-bar re-score → growth metrics → loop
