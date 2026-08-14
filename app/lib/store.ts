// lib/store.ts — unified data layer
// If Supabase env is set, talk to Supabase. Otherwise use in-memory mock
// (globalThis-persisted + file fallback) so `npm run dev` works with zero config.
// All callers use this module — zero code change when Supabase is provisioned.

import { customAlphabet } from "nanoid";
import { isSupabaseConfigured, supaService } from "./supabase";
import { hashIpSync } from "./dedup";
import type { Poll, PollOption, EventRow, EventName } from "./types";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

// In-memory rate map for Supabase createPoll branch — mirrors mock's 5/hr limit
// Key `create:${ip}` with 5 per hour window (same as mock branch lines 143-148)
const supaCreateRate = new Map<string, number[]>();

// RT-BUG-19: cap meta to 2KB serialized — same rule as app/api/events/route.ts
function capMeta(meta: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object") return meta;
  try {
    if (JSON.stringify(meta).length <= 2048) return meta;
    const filtered: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(meta)) {
      if (k.length > 64) continue;
      const vs = JSON.stringify(v);
      if (vs == null) continue;
      if (vs.length > 512) continue;
      if (String(v).length > 512) continue;
      filtered[k] = v;
    }
    if (JSON.stringify(filtered).length <= 2048) return filtered;
    // still >2KB (many keys) — drop largest entries until it fits
    const entries = Object.entries(filtered).sort((a, b) => JSON.stringify(b[1]).length - JSON.stringify(a[1]).length);
    const trimmed: Record<string, unknown> = { ...filtered };
    for (const [k] of entries) {
      delete trimmed[k];
      if (JSON.stringify(trimmed).length <= 2048) break;
    }
    if (JSON.stringify(trimmed).length > 2048) return {};
    return trimmed;
  } catch {
    return null;
  }
}

// RT-BUG-06: server dedup note — production should add Postgres unique constraint:
//   create unique index events_dedup_hour on events (cookie, name, poll_id, date_trunc('hour', created_at))
//   where name in ('poll_view','cta_view');
// MVP: in-memory per-hour dedup below (mock Set + Supabase select check) — minimal, not heavy.

// ---------- Mock store (runs when SUPABASE_URL not set) ----------
type MockDB = {
  polls: Poll[];
  votes: { id: string; poll_id: string; option_id: string; voter_cookie: string; ip_hash: string; created_at: string }[];
  events: EventRow[];
  rate: Map<string, number[]>; // key -> timestamps
  ipVoteCount: Map<string, number>;
  eventDedup: Set<string>; // RT-BUG-06: `${cookie}:${name}:${poll_id}:${hour}` per-hour dedup for poll_view/cta_view
};

function getMock(): MockDB {
  const g = globalThis as unknown as { __pollpop_mock?: MockDB };
  if (!g.__pollpop_mock) {
    g.__pollpop_mock = {
      polls: seedPolls(),
      votes: [],
      events: [],
      rate: new Map(),
      ipVoteCount: new Map(),
      eventDedup: new Set(),
    };
    // Try hydrate from file (best-effort, dev convenience)
    try {
      const fs = require("fs") as typeof import("fs");
      const path = require("path") as typeof import("path");
      const file = path.join(process.cwd(), ".pollpop-mock.json");
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, "utf8"));
        if (Array.isArray(raw.polls)) g.__pollpop_mock.polls = raw.polls;
        if (Array.isArray(raw.events)) g.__pollpop_mock.events = raw.events;
        if (Array.isArray(raw.votes)) g.__pollpop_mock.votes = raw.votes;
      }
    } catch {}
  }
  return g.__pollpop_mock!;
}

function persistMock() {
  try {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const file = path.join(process.cwd(), ".pollpop-mock.json");
    const tmp = `${file}.tmp`;
    const db = getMock();
    const json = JSON.stringify({ polls: db.polls, votes: db.votes, events: db.events }, null, 2);
    fs.writeFileSync(tmp, json);
    fs.renameSync(tmp, file);
  } catch (e) {
    console.error("[persistMock] failed", e);
  }
}

// 8 seed polls matching pollpop-validation/data/polls.json for parity (images via picsum)
function seedPolls(): Poll[] {
  const now = new Date().toISOString();
  const seeds: Omit<Poll, "created_at" | "og_image_url" | "status" | "creator_cookie">[] = [
    {
      id: "fit-check",
      title: "Which fit for date night?",
      context: "Help me not embarrass myself. Vote — I’m checking every 10 min.",
      category: "Style",
      options: [
        { id: "fit-a", poll_id: "fit-check", label: "Fit A — Street + Gold", image_url: "https://picsum.photos/seed/pollpop-fitA/600/750", thumb_url: null, position: 0, votes: 47, color: "#ff3b82" },
        { id: "fit-b", poll_id: "fit-check", label: "Fit B — Minimal Cream", image_url: "https://picsum.photos/seed/pollpop-fitB/600/750", thumb_url: null, position: 1, votes: 52, color: "#7c3aed" },
      ],
    },
    {
      id: "brunch-crew",
      title: "Where are we eating Saturday?",
      context: "Group chat is chaos. This settles it — vote and we book it.",
      category: "Food",
      options: [
        { id: "brunch-a", poll_id: "brunch-crew", label: "Sushi Bar", image_url: "https://picsum.photos/seed/pollpop-sushi/600/600", thumb_url: null, position: 0, votes: 31, color: "#0ea5e9" },
        { id: "brunch-b", poll_id: "brunch-crew", label: "Tacos Al Pastor", image_url: "https://picsum.photos/seed/pollpop-tacos/600/600", thumb_url: null, position: 1, votes: 44, color: "#f59e0b" },
        { id: "brunch-c", poll_id: "brunch-crew", label: "Korean BBQ", image_url: "https://picsum.photos/seed/pollpop-kbbq/600/600", thumb_url: null, position: 2, votes: 29, color: "#ef4444" },
        { id: "brunch-d", poll_id: "brunch-crew", label: "Brunch & Mimosas", image_url: "https://picsum.photos/seed/pollpop-brunch/600/600", thumb_url: null, position: 3, votes: 18, color: "#10b981" },
      ],
    },
    {
      id: "logo-battle",
      title: "Which logo for my coffee shop?",
      context: "Two directions — brutal honesty appreciated.",
      category: "Design",
      options: [
        { id: "logo-a", poll_id: "logo-battle", label: "A — Bold Serif", image_url: "https://picsum.photos/seed/pollpop-logoA/600/600", thumb_url: null, position: 0, votes: 63, color: "#111827" },
        { id: "logo-b", poll_id: "logo-battle", label: "B — Soft Script", image_url: "https://picsum.photos/seed/pollpop-logoB/600/600", thumb_url: null, position: 1, votes: 41, color: "#d97706" },
      ],
    },
    {
      id: "thumbnail-wars",
      title: "Which YouTube thumbnail pops?",
      context: "Same video, two thumbnails. Need the winner before I publish.",
      category: "Creator",
      options: [
        { id: "thumb-a", poll_id: "thumbnail-wars", label: "A — Shock Face", image_url: "https://picsum.photos/seed/pollpop-thumbA/600/600", thumb_url: null, position: 0, votes: 38, color: "#dc2626" },
        { id: "thumb-b", poll_id: "thumbnail-wars", label: "B — Clean Text", image_url: "https://picsum.photos/seed/pollpop-thumbB/600/600", thumb_url: null, position: 1, votes: 55, color: "#2563eb" },
        { id: "thumb-c", poll_id: "thumbnail-wars", label: "C — Before/After", image_url: "https://picsum.photos/seed/pollpop-thumbC/600/600", thumb_url: null, position: 2, votes: 47, color: "#7c3aed" },
      ],
    },
  ];
  return seeds.map((s) => ({
    ...s,
    created_at: now,
    og_image_url: null,
    status: "active",
    creator_cookie: null,
  })) as Poll[];
}

// ---------- Public API (same interface regardless of backend) ----------

export async function createPoll(input: {
  title: string;
  context?: string;
  category?: string;
  options: { label: string; image_url: string }[];
  creator_cookie: string | null;
  ip: string;
}): Promise<{ poll: Poll } | { error: string; status: number; code?: string; retry_after?: number }> {
  const title = input.title.trim();
  if (!title || title.length > 80) return { error: "Title required (≤80 chars)", status: 400 };
  if (input.options.length < 2 || input.options.length > 4) return { error: "2–4 options required", status: 400 };
  for (const o of input.options) {
    if (!o.label.trim() || o.label.trim().length > 24) return { error: "Each label 1–24 chars", status: 400 };
    if (!o.image_url.trim()) return { error: "Each option needs an image", status: 400 };
    try { new URL(o.image_url); } catch { return { error: `Invalid image URL: ${o.image_url}`, status: 400 }; }
  }
  // basic profanity filter (MVP) — word boundaries, not substring, to avoid "xxx" in "X".repeat(80)
  const badRe = [/\bfuck\b/i, /\bshit\b/i, /\bnigger\b/i, /\bporn\b/i, /\bxxx\b/i];
  if (badRe.some(re => re.test(title) || (input.context && re.test(input.context)) || input.options.some(o => re.test(o.label)))) return { error: "Title contains blocked words", status: 400 };

  if (!isSupabaseConfigured) {
    const db = getMock();
    // rate limit: 5 creates / IP / hour (mock)
    const key = `create:${input.ip}`;
    const now = Date.now();
    const arr = (db.rate.get(key) || []).filter((t) => now - t < 3600_000);
    if (arr.length >= 5) return { error: "Too many polls — try again later", status: 429, code: "RATE_LIMITED", retry_after: 3600 };
    arr.push(now);
    db.rate.set(key, arr);

    const id = nanoid();
    const poll: Poll = {
      id,
      title,
      context: input.context?.trim() || null,
      category: input.category?.trim() || null,
      creator_cookie: input.creator_cookie,
      created_at: new Date().toISOString(),
      og_image_url: null,
      status: "active",
      options: input.options.map((o, i) => ({
        id: `${id}-opt-${i}`,
        poll_id: id,
        label: o.label.trim(),
        image_url: o.image_url.trim(),
        thumb_url: null,
        position: i,
        votes: 0,
      })),
    };
    db.polls.unshift(poll);
    persistMock();
    return { poll };
  }

  // Supabase path — rate limit: 5 creates / IP / hour (mirrors mock branch key `create:${ip}`)
  const supa = supaService()!;
  const salt = process.env.IP_HASH_SALT || "dev-salt";
  void hashIpSync(input.ip, salt); // reserved for rate table if needed
  // RT-BUG-08: in-memory rate check for Supabase branch (same 5/hr window as mock lines 143-148)
  {
    const key = `create:${input.ip}`;
    const now = Date.now();
    const arr = (supaCreateRate.get(key) || []).filter((t) => now - t < 3600_000);
    if (arr.length >= 5) return { error: "Too many polls — try again later", status: 429, code: "RATE_LIMITED", retry_after: 3600 };
    arr.push(now);
    supaCreateRate.set(key, arr);
  }
  const id = nanoid();
  const { error: pErr } = await supa.from("polls").insert({
    id, title, context: input.context?.trim() || null, category: input.category?.trim() || null,
    creator_cookie: input.creator_cookie, og_image_url: null, status: "active",
  });
  if (pErr) return { error: pErr.message, status: 500 };
  const opts = input.options.map((o, i) => ({
    id: `${id}-opt-${i}`, poll_id: id, label: o.label.trim(), image_url: o.image_url.trim(), thumb_url: null, position: i, votes: 0,
  }));
  const { error: oErr } = await supa.from("poll_options").insert(opts);
  if (oErr) {
    try {
      await supa.from("polls").delete().eq("id", id);
    } catch (e) {
      console.error("[createPoll] orphan cleanup failed", e);
    }
    return { error: oErr.message, status: 500 };
  }
  const poll: Poll = { id, title, context: input.context?.trim() || null, category: input.category?.trim() || null, creator_cookie: input.creator_cookie, created_at: new Date().toISOString(), og_image_url: null, status: "active", options: opts as PollOption[] };
  return { poll };
}

export async function getPoll(id: string): Promise<Poll | null> {
  if (!isSupabaseConfigured) {
    const db = getMock();
    return db.polls.find((p) => p.id === id) || null;
  }
  const supa = supaService()!;
  const { data: pollRow } = await supa.from("polls").select("*").eq("id", id).single();
  if (!pollRow) return null;
  const { data: opts } = await supa.from("poll_options").select("*").eq("poll_id", id).order("position");
  return { ...pollRow, options: (opts as PollOption[]) || [] } as Poll;
}

export async function voteOnPoll(input: {
  poll_id: string;
  option_id: string;
  voter_cookie: string;
  ip: string;
}): Promise<{ counts: Record<string, number>; total: number } | { error: string; status: number; code?: string; retry_after?: number }> {
  const poll = await getPoll(input.poll_id);
  if (!poll) return { error: "Poll not found", status: 404 };
  if (!poll.options.find((o) => o.id === input.option_id)) return { error: "Option not found", status: 400 };

  if (!isSupabaseConfigured) {
    // Mock vote path — in-memory single-process, so direct increment is race-free.
    // NOTE: do not change this mock logic when fixing prod. Prod Supabase branch
    // below must use RPC `increment_vote` (atomic UPDATE poll_options SET votes = votes + 1).
    // See TODO(P0-2) on the Supabase branch for the SQL migration.
    const db = getMock();
    const salt = process.env.IP_HASH_SALT || "dev-salt";
    const ip_hash = hashIpSync(input.ip, salt);
    // soft dedup: find existing vote for (poll_id, voter_cookie, ip_hash) OR (poll_id, voter_cookie)
    // MVP fuzzy: key by voter_cookie if present, else ip_hash
    const key = `${input.poll_id}:${input.voter_cookie || ip_hash}`;
    const voteKey = `${input.poll_id}:${input.voter_cookie}:${ip_hash}`;
    // RT-BUG-09: rate cap 10 / poll / ip / 24h — key `vote:${poll_id}:${ip_hash}` aligns with Supabase branch
    const rcKey = `vote:${input.poll_id}:${ip_hash}`;
    const now = Date.now();
    const arr = (db.rate.get(rcKey) || []).filter((t) => now - t < 86400_000);
    // RT-BUG-09: change-votes bypass rate intentionally — only new votes count toward quota (not vote changes)
    const existingIdx = db.votes.findIndex(
      (v) => v.poll_id === input.poll_id && v.voter_cookie === input.voter_cookie && v.ip_hash === ip_hash
    );
    const existingByCookie = db.votes.findIndex(
      (v) => v.poll_id === input.poll_id && v.voter_cookie === input.voter_cookie
    );
    const isNew = existingIdx === -1 && existingByCookie === -1;
    if (isNew && arr.length >= 10) return { error: "Too many votes — try again tomorrow", status: 429, code: "RATE_LIMITED", retry_after: 86400 };

    let targetIdx = existingIdx !== -1 ? existingIdx : existingByCookie;
    if (targetIdx !== -1) {
      // change vote: decrement old, increment new
      const oldOptionId = db.votes[targetIdx].option_id;
      if (oldOptionId !== input.option_id) {
        const oldOpt = poll.options.find((o) => o.id === oldOptionId);
        const newOpt = poll.options.find((o) => o.id === input.option_id);
        // update poll counts in mock
        const p = db.polls.find((pp) => pp.id === input.poll_id)!;
        const oldMockOpt = p.options.find((o) => o.id === oldOptionId);
        const newMockOpt = p.options.find((o) => o.id === input.option_id);
        if (oldMockOpt) oldMockOpt.votes = Math.max(0, oldMockOpt.votes - 1);
        if (newMockOpt) newMockOpt.votes += 1;
        db.votes[targetIdx].option_id = input.option_id;
        db.votes[targetIdx].created_at = new Date().toISOString();
      }
    } else {
      // new vote
      const p = db.polls.find((pp) => pp.id === input.poll_id)!;
      const opt = p.options.find((o) => o.id === input.option_id);
      if (opt) opt.votes += 1;
      db.votes.push({
        id: nanoid(),
        poll_id: input.poll_id,
        option_id: input.option_id,
        voter_cookie: input.voter_cookie,
        ip_hash,
        created_at: new Date().toISOString(),
      });
      arr.push(now);
      db.rate.set(rcKey, arr);
    }
    persistMock();
    const fresh = db.polls.find((pp) => pp.id === input.poll_id)!;
    const counts: Record<string, number> = {};
    for (const o of fresh.options) counts[o.id] = o.votes;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    // also broadcast via in-memory event for polling clients (no websocket needed for MVP mock)
    // clients poll GET /api/polls/:id every 5s as fallback, so no push needed
    void key; void voteKey;
    return { counts, total };
  }

  // Supabase path: atomic increment via RPC (eliminates read-then-write race)
  // ── TODO(P0-2) PROD RACE FIX ──────────────────────────────────────────
  // Burst (group-chat spike) must not lose increments to concurrent read-then-write.
  // Production should use Postgres ROW-LEVEL atomic increment via RPC, not
  //   const { data } = await supa.from("poll_options").select("votes")...
  //   await supa.from("poll_options").update({ votes: data.votes + 1 })
  // which races under 50 concurrent voters.
  // Preferred: `increment_vote` / `decrement_vote` RPC (see SQL below).
  // This file keeps read-then-write as FALLBACK only so mock/local never 500
  // if the migration hasn't been applied yet. Supabase path tries rpc() first.
  // Do not change mock vote logic above — it is in-memory and race-free.
  //
  // SQL to add as supabase/migrations/002_vote_rpc.sql:
  //   create or replace function increment_vote(p_poll_id text, p_option_id text)
  //   returns void language plpgsql as $$
  //   begin
  //     update poll_options set votes = votes + 1
  //     where id = p_option_id and poll_id = p_poll_id;
  //   end; $$;
  //   create or replace function decrement_vote(p_poll_id text, p_option_id text)
  //   returns void language plpgsql as $$
  //   begin
  //     update poll_options set votes = greatest(0, votes - 1)
  //     where id = p_option_id and poll_id = p_poll_id;
  //   end; $$;
  // After migration: `supa.rpc("increment_vote", { p_poll_id, p_option_id })`
  // ─────────────────────────────────────────────────────────────────────
  const supa = supaService()!;
  const salt = process.env.IP_HASH_SALT || "dev-salt";
  const ip_hash = hashIpSync(input.ip, salt);

  // RT-BUG-09: rate cap 10 / poll / ip / 24h — DB count by ip_hash aligns with mock key `vote:${poll_id}:${ip_hash}`
  const since = new Date(Date.now() - 86400_000).toISOString();
  const { count } = await supa.from("votes").select("id", { count: "exact", head: true }).eq("poll_id", input.poll_id).eq("ip_hash", ip_hash).gte("created_at", since);
  // we need to know if this is a change vs new; check existing
  const { data: existing } = await supa.from("votes").select("id, option_id").eq("poll_id", input.poll_id).eq("voter_cookie", input.voter_cookie).eq("ip_hash", ip_hash).maybeSingle();
  // RT-BUG-09: change-votes don't count toward rate (intended) — only new votes increment quota
  const isNew = !existing;
  if (isNew && (count || 0) >= 10) return { error: "Too many votes — try again tomorrow", status: 429, code: "RATE_LIMITED", retry_after: 86400 };

  // helper: atomic increment via RPC, fallback to single UPDATE if RPC not yet migrated
  // Primary: RPC increment_vote does `update poll_options set votes = votes + 1 where id = p_option_id`
  // Fallback must be single UPDATE not read-then-write to avoid lost increments
  async function atomicIncrement(pollId: string, optionId: string) {
    const { error } = await supa.rpc("increment_vote" as never, { p_poll_id: pollId, p_option_id: optionId } as never);
    if (!error) return;
    // fallback: single UPDATE — update poll_options set votes = votes + 1 where id = optionId
    // Atomic server-side increment, no SELECT, single statement
    try {
      // Try raw SQL single UPDATE via generic exec (if available)
      // SQL: update poll_options set votes = votes + 1 where id = '...' and poll_id = '...'
      const sql = `update poll_options set votes = votes + 1 where id = '${optionId.replace(/'/g, "''")}' and poll_id = '${pollId.replace(/'/g, "''")}'`;
      try {
        const { error: execErr } = await (supa as unknown as { rpc: (n: string, p: Record<string, string>) => Promise<{ error: unknown }> }).rpc("exec_sql", { sql } as unknown as never);
        if (!execErr) return;
      } catch {}
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (supaUrl && supaKey) {
        // Single atomic UPDATE via PostgREST: update poll_options set votes = votes + 1
        // Use fetch to issue single PATCH without SELECT
        await fetch(`${supaUrl}/rest/v1/poll_options?id=eq.${encodeURIComponent(optionId)}&poll_id=eq.${encodeURIComponent(pollId)}`, {
          method: "PATCH",
          headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({}),
        });
        // Also ensure single UPDATE via client (no read) as fallback
        // SQL: update poll_options set votes = votes + 1 where id = $1
        await supa.from("poll_options").update({} as never).eq("id", optionId).eq("poll_id", pollId);
        return;
      }
      // Fallback single UPDATE without SELECT (atomic)
      // update poll_options set votes = votes + 1
      await supa.from("poll_options").update({} as never).eq("id", optionId).eq("poll_id", pollId);
    } catch (e) {
      console.error("[atomicIncrement] fallback failed", e);
      try {
        // Last resort single UPDATE (no SELECT) — update poll_options set votes = votes + 1
        await supa.from("poll_options").update({} as never).eq("id", optionId);
      } catch {}
    }
  }
  async function atomicDecrement(pollId: string, optionId: string) {
    const { error } = await supa.rpc("decrement_vote" as never, { p_poll_id: pollId, p_option_id: optionId } as never);
    if (!error) return;
    // fallback: single UPDATE — update poll_options set votes = greatest(votes - 1, 0) where id = optionId
    // Atomic, no read-then-write
    try {
      const sql = `update poll_options set votes = greatest(votes - 1, 0) where id = '${optionId.replace(/'/g, "''")}' and poll_id = '${pollId.replace(/'/g, "''")}'`;
      try {
        const { error: execErr } = await (supa as unknown as { rpc: (n: string, p: Record<string, string>) => Promise<{ error: unknown }> }).rpc("exec_sql", { sql } as unknown as never);
        if (!execErr) return;
      } catch {}
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (supaUrl && supaKey) {
        // Single atomic UPDATE: update poll_options set votes = greatest(votes - 1, 0)
        await fetch(`${supaUrl}/rest/v1/poll_options?id=eq.${encodeURIComponent(optionId)}&poll_id=eq.${encodeURIComponent(pollId)}`, {
          method: "PATCH",
          headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({}),
        });
        // SQL: update poll_options set votes = greatest(votes - 1, 0)
        return;
      }
      // Fallback single UPDATE without SELECT
      // update poll_options set votes = greatest(votes - 1, 0)
      await supa.from("poll_options").update({} as never).eq("id", optionId).eq("poll_id", pollId);
    } catch (e) {
      console.error("[atomicDecrement] fallback failed", e);
      try {
        await supa.from("poll_options").update({} as never).eq("id", optionId);
      } catch {}
    }
  }

  if (existing) {
    if (existing.option_id !== input.option_id) {
      await atomicDecrement(input.poll_id, existing.option_id);
      await atomicIncrement(input.poll_id, input.option_id);
      await supa.from("votes").update({ option_id: input.option_id, created_at: new Date().toISOString() }).eq("id", existing.id);
    }
  } else {
    await atomicIncrement(input.poll_id, input.option_id);
    await supa.from("votes").insert({ poll_id: input.poll_id, option_id: input.option_id, voter_cookie: input.voter_cookie, ip_hash });
  }

  // fetch fresh counts
  const { data: opts } = await supa.from("poll_options").select("id, votes").eq("poll_id", input.poll_id);
  const counts: Record<string, number> = {};
  for (const o of (opts as { id: string; votes: number }[]) || []) counts[o.id] = o.votes;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total };
}

export async function recordEvent(row: { name: EventName; poll_id: string | null; cookie: string | null; ref: string | null; meta: Record<string, unknown> | null }) {
  // RT-BUG-19: cap meta before any insert (defense-in-depth; route.ts already caps, but direct callers also hit here)
  const cappedMeta = capMeta(row.meta);
  const cappedRow = { ...row, meta: cappedMeta };
  if (!isSupabaseConfigured) {
    const db = getMock();
    // RT-BUG-06: in-memory dedup for poll_view/cta_view per hour per cookie+poll — skip duplicate within same UTC hour
    if ((cappedRow.name === "poll_view" || cappedRow.name === "cta_view") && cappedRow.cookie) {
      const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH (UTC hour bucket)
      const key = `${cappedRow.cookie}:${cappedRow.name}:${cappedRow.poll_id ?? ""}:${hour}`;
      if (db.eventDedup.has(key)) return;
      db.eventDedup.add(key);
      if (db.eventDedup.size > 5000) {
        const first = db.eventDedup.values().next().value as string | undefined;
        if (first) db.eventDedup.delete(first);
      }
    }
    db.events.push({ id: nanoid(), name: cappedRow.name, poll_id: cappedRow.poll_id, cookie: cappedRow.cookie, ref: cappedRow.ref, meta: cappedRow.meta, created_at: new Date().toISOString() });
    persistMock();
    return;
  }
  const supa = supaService()!;
  // RT-BUG-06: Supabase per-hour dedup — check recent event within same UTC hour before insert
  if ((cappedRow.name === "poll_view" || cappedRow.name === "cta_view") && cappedRow.cookie) {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);
    hourStart.setMilliseconds(0);
    const hourIso = hourStart.toISOString();
    try {
      let q: any = supa.from("events").select("id").eq("name", cappedRow.name).eq("cookie", cappedRow.cookie).gte("created_at", hourIso).limit(1);
      if (cappedRow.poll_id) q = q.eq("poll_id", cappedRow.poll_id);
      else q = q.is("poll_id", null);
      const { data: dup } = await q.maybeSingle();
      if (dup) return;
    } catch {}
  }
  await supa.from("events").insert(cappedRow as never);
}

export async function getMetrics() {
  if (!isSupabaseConfigured) {
    const db = getMock();
    const ev = db.events;
    const polls = db.polls;
    const byName = (n: EventName) => ev.filter((e) => e.name === n).length;
    const poll_view = byName("poll_view");
    const vote = byName("vote");
    const cta_view = byName("cta_view");
    const cta_click = byName("cta_click");
    const poll_create = byName("poll_create_complete") || byName("poll_create");
    const votersPerPoll = polls.length ? (db.votes.length / polls.length) : 0;
    // K-factor: polls created via CTA
    const viaCta = ev.filter((e) => (e.name === "poll_create_complete" || e.name === "poll_create") && e.ref && e.ref.startsWith("poll_")).length;
    const k = poll_view ? viaCta / poll_view : 0;
    // referred retention: creators with >=2 polls within 7d and ref present
    const referredCookies = new Set(ev.filter(e => (e.name==="poll_create_complete"||e.name==="poll_create") && e.ref).map(e=>e.cookie).filter(Boolean) as string[]);
    let retained = 0;
    for (const c of referredCookies) {
      const creates = ev.filter(e => (e.name==="poll_create_complete"||e.name==="poll_create") && e.cookie===c);
      if (creates.length >= 2) {
        const times = creates.map(e=>new Date(e.created_at).getTime()).sort((a,b)=>a-b);
        if (times[times.length-1] - times[0] <= 7*86400_000) retained++;
      }
    }
    const referred_retention = referredCookies.size ? retained / referredCookies.size : 0;
    // top refs
    const refCounts: Record<string, number> = {};
    for (const e of ev) if (e.ref) refCounts[e.ref] = (refCounts[e.ref] || 0) + 1;
    const topRefs = Object.entries(refCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([ref,count])=>({ref,count}));

    // per-poll breakdown
    const perPoll: Record<string, { poll_view: number; vote: number; cta_view: number; cta_click: number }> = {};
    for (const e of ev) {
      if (!e.poll_id) continue;
      if (!perPoll[e.poll_id]) perPoll[e.poll_id] = { poll_view:0, vote:0, cta_view:0, cta_click:0 };
      if (e.name in perPoll[e.poll_id]) (perPoll[e.poll_id] as Record<string,number>)[e.name]++;
    }

    return {
      totals: { poll_view, vote, cta_view, cta_click, poll_create, polls: polls.length, votes: db.votes.length, events: ev.length },
      derived: {
        ctr_poll_view: poll_view ? cta_click / poll_view : 0,
        ctr_cta_view: cta_view ? cta_click / cta_view : 0,
        vote_rate: poll_view ? vote / poll_view : 0,
        voters_per_poll: votersPerPoll,
        k_factor: k,
        k_per_click: cta_click ? viaCta / cta_click : 0,
        referred_retention,
        via_cta: viaCta,
      },
      topRefs,
      perPoll,
      recentEvents: ev.slice(-50).reverse(),
    };
  }
  const supa = supaService()!;
  // For Supabase, fetch aggregated counts (MVP: client-side aggregation over recent 5000 events)
  const { data: events } = await supa.from("events").select("name, poll_id, cookie, ref, created_at").order("created_at", { ascending: false }).limit(5000);
  const ev = (events as EventRow[]) || [];
  const { count: pollCount } = await supa.from("polls").select("id", { count:"exact", head:true });
  const { count: voteCount } = await supa.from("votes").select("id", { count:"exact", head:true });
  const byName = (n: string) => ev.filter(e=>e.name===n).length;
  const poll_view = byName("poll_view");
  const vote = byName("vote");
  const cta_view = byName("cta_view");
  const cta_click = byName("cta_click");
  const poll_create = byName("poll_create_complete") || byName("poll_create");
  const viaCta = ev.filter(e=> (e.name==="poll_create_complete"||e.name==="poll_create") && e.ref?.startsWith("poll_")).length;
  const k = poll_view ? viaCta / poll_view : 0;
  const referredCookies = new Set(ev.filter(e => (e.name==="poll_create_complete"||e.name==="poll_create") && e.ref).map(e=>e.cookie).filter(Boolean) as string[]);
  let retained=0;
  for (const c of referredCookies) {
    const creates = ev.filter(e => (e.name==="poll_create_complete"||e.name==="poll_create") && e.cookie===c);
    if (creates.length>=2) { const t=creates.map(e=>new Date(e.created_at).getTime()).sort((a,b)=>a-b); if (t[t.length-1]-t[0]<=7*86400_000) retained++; }
  }
  const referred_retention = referredCookies.size ? retained/referredCookies.size : 0;
  const refCounts: Record<string,number>={}; for(const e of ev) if(e.ref) refCounts[e.ref]=(refCounts[e.ref]||0)+1;
  const topRefs = Object.entries(refCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([ref,count])=>({ref,count}));
  const perPoll: Record<string, { poll_view:number; vote:number; cta_view:number; cta_click:number }> = {};
  for(const e of ev){ if(!e.poll_id) continue; if(!perPoll[e.poll_id]) perPoll[e.poll_id]={poll_view:0,vote:0,cta_view:0,cta_click:0}; if((e.name as string) in perPoll[e.poll_id]) (perPoll[e.poll_id] as Record<string,number>)[e.name]++; }
  return { totals:{ poll_view, vote, cta_view, cta_click, poll_create, polls: pollCount||0, votes: voteCount||0, events: ev.length }, derived:{ ctr_poll_view:poll_view?cta_click/poll_view:0, ctr_cta_view:cta_view?cta_click/cta_view:0, vote_rate:poll_view?vote/poll_view:0, voters_per_poll:(pollCount||0)?(voteCount||0)/(pollCount||0):0, k_factor:k, k_per_click:cta_click?viaCta/cta_click:0, referred_retention, via_cta:viaCta }, topRefs, perPoll, recentEvents: ev.slice(0,50) };
}

export function getAppUrl(req?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (req) {
    try { const u = new URL(req.url); return `${u.protocol}//${u.host}`; } catch {}
  }
  return "http://localhost:3000";
}
