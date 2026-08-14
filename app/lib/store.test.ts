// lib/store.test.ts — P0 validation + dedup + burst
import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

function resetMock() {
  // clear in-memory mock
  (globalThis as unknown as Record<string, unknown>).__pollpop_mock = undefined;
  // clear file fallback so tests are deterministic
  try {
    const file = path.join(process.cwd(), ".pollpop-mock.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const appFile = path.join(process.cwd(), "app", ".pollpop-mock.json");
    if (fs.existsSync(appFile)) fs.unlinkSync(appFile);
  } catch {}
}

describe("store — createPoll validation", () => {
  beforeEach(() => {
    resetMock();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("creates poll with 2, 3, 4 opts, label≤24, title≤80", async () => {
    const { createPoll } = await import("./store");
    const mkOpts = (n: number) =>
      Array.from({ length: n }, (_, i) => ({
        label: `Opt ${i + 1}`,
        image_url: `https://picsum.photos/seed/test${i}/600/600`,
      }));

    for (const n of [2, 3, 4]) {
      resetMock();
      const { createPoll: cp } = await import("./store");
      // re-import after reset is not needed — getMock reads fresh global, but we re-import for isolation
      void cp;
      const mod = await import("./store");
      const res = await mod.createPoll({
        title: "A".repeat(80),
        context: "ctx",
        category: "Test",
        options: mkOpts(n),
        creator_cookie: "cid-1",
        ip: "1.1.1.1",
      });
      expect("poll" in res, `expected poll for n=${n}, got ${JSON.stringify(res)}`).toBe(true);
      if ("poll" in res) {
        expect(res.poll.options.length).toBe(n);
        expect(res.poll.title.length).toBeLessThanOrEqual(80);
        for (const o of res.poll.options) expect(o.label.length).toBeLessThanOrEqual(24);
      }
    }
  });

  it("rejects 0/1/5 opts, empty title, label>24, title>80", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const good2 = [
      { label: "A", image_url: "https://picsum.photos/seed/a/600/600" },
      { label: "B", image_url: "https://picsum.photos/seed/b/600/600" },
    ];
    // empty title
    expect(await createPoll({ title: "", options: good2, creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
    expect(await createPoll({ title: "   ", options: good2, creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
    // title too long
    expect(await createPoll({ title: "A".repeat(81), options: good2, creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
    // 0 opts
    expect(await createPoll({ title: "ok", options: [], creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
    // 1 opt
    expect(
      await createPoll({ title: "ok", options: [{ label: "A", image_url: "https://picsum.photos/seed/a/600/600" }], creator_cookie: null, ip: "2.2.2.2" })
    ).toMatchObject({ status: 400 });
    // 5 opts
    const five = Array.from({ length: 5 }, (_, i) => ({ label: `O${i}`, image_url: `https://picsum.photos/seed/${i}/600/600` }));
    expect(await createPoll({ title: "ok", options: five, creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
    // label empty
    expect(
      await createPoll({
        title: "ok",
        options: [
          { label: "", image_url: "https://picsum.photos/seed/a/600/600" },
          { label: "B", image_url: "https://picsum.photos/seed/b/600/600" },
        ],
        creator_cookie: null,
        ip: "2.2.2.2",
      })
    ).toMatchObject({ status: 400 });
    // label >24
    expect(
      await createPoll({
        title: "ok",
        options: [
          { label: "X".repeat(25), image_url: "https://picsum.photos/seed/a/600/600" },
          { label: "B", image_url: "https://picsum.photos/seed/b/600/600" },
        ],
        creator_cookie: null,
        ip: "2.2.2.2",
      })
    ).toMatchObject({ status: 400 });
  });

  it("hash dedup last-wins: change vote updates not duplicates", async () => {
    resetMock();
    const { createPoll, voteOnPoll, getPoll } = await import("./store");
    const c = await createPoll({
      title: "dedup test",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/dedupa/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/dedupb/600/600" },
      ],
      creator_cookie: "creator1",
      ip: "3.3.3.3",
    });
    expect("poll" in c).toBe(true);
    if (!("poll" in c)) return;
    const poll = c.poll;
    const [optA, optB] = poll.options;

    const voter = "voter-cookie-123";
    const ip = "9.9.9.9";

    const r1 = await voteOnPoll({ poll_id: poll.id, option_id: optA.id, voter_cookie: voter, ip });
    expect("counts" in r1).toBe(true);
    if (!("counts" in r1)) return;
    expect(r1.total).toBe(1);
    expect(r1.counts[optA.id]).toBe(1);
    expect(r1.counts[optB.id]).toBe(0);

    // change vote to B — should not create duplicate, total stays 1, counts shift
    const r2 = await voteOnPoll({ poll_id: poll.id, option_id: optB.id, voter_cookie: voter, ip });
    expect("counts" in r2).toBe(true);
    if (!("counts" in r2)) return;
    expect(r2.total).toBe(1);
    expect(r2.counts[optA.id]).toBe(0);
    expect(r2.counts[optB.id]).toBe(1);

    // change back to A
    const r3 = await voteOnPoll({ poll_id: poll.id, option_id: optA.id, voter_cookie: voter, ip });
    if (!("counts" in r3)) return;
    expect(r3.counts[optA.id]).toBe(1);
    expect(r3.counts[optB.id]).toBe(0);
    expect(r3.total).toBe(1);

    // verify internal store still has exactly one vote row for this voter
    const fresh = await getPoll(poll.id);
    expect(fresh?.options.find((o) => o.id === optA.id)?.votes).toBe(1);
    expect(fresh?.options.find((o) => o.id === optB.id)?.votes).toBe(0);
  });

  it("burst tally is additive: 50 concurrent distinct voters = 50 votes", async () => {
    resetMock();
    const { createPoll, voteOnPoll } = await import("./store");
    const c = await createPoll({
      title: "burst test",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/bursta/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/burstb/600/600" },
      ],
      creator_cookie: null,
      ip: "4.4.4.4",
    });
    expect("poll" in c).toBe(true);
    if (!("poll" in c)) return;
    const poll = c.poll;
    const optA = poll.options[0];

    const N = 50;
    const results = await Promise.all(
      Array.from({ length: N }, (_, i) =>
        voteOnPoll({
          poll_id: poll.id,
          option_id: optA.id,
          voter_cookie: `burst-voter-${i}`,
          ip: `10.0.${Math.floor(i / 250)}.${i % 250}`,
        })
      )
    );

    // all should succeed
    for (const r of results) expect("counts" in r).toBe(true);

    // final tally should be exactly N (no lost increments)
    const lastOk = results[results.length - 1] as { counts: Record<string, number>; total: number };
    expect(lastOk.total).toBe(N);
    expect(lastOk.counts[optA.id]).toBe(N);

    // additional additive check: ordering doesn't matter, concurrent bursts don't undercount
    const { getPoll } = await import("./store");
    const fresh = await getPoll(poll.id);
    const total = fresh?.options.reduce((a, o) => a + o.votes, 0);
    expect(total).toBe(N);
  });

  it("mock fallback: Storage upload NOT taken — data URL kept as data: and poll still creates", async () => {
    resetMock();
    // isSupabaseConfigured is false in this suite (env deleted in beforeEach) — mock path.
    // Documents: data URL stays verbatim, no Storage upload is attempted in mock mode.
    const TINY_PNG_DATA_URL =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    const { createPoll } = await import("./store");
    const res = await createPoll({
      title: "mock fallback data URL",
      options: [
        { label: "A", image_url: TINY_PNG_DATA_URL },
        { label: "B", image_url: "https://picsum.photos/seed/mock-fallback-b/600/600" },
      ],
      creator_cookie: "mock-fallback-cid",
      ip: "5.5.5.5",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    expect(res.poll.options).toHaveLength(2);
    const optA = res.poll.options.find((o) => o.label === "A");
    expect(optA).toBeDefined();
    // Storage upload path is NOT taken in mock mode — image_url still starts with data:
    expect(optA!.image_url.startsWith("data:")).toBe(true);
    expect(optA!.image_url).toBe(TINY_PNG_DATA_URL);
    const optB = res.poll.options.find((o) => o.label === "B");
    expect(optB!.image_url).toBe("https://picsum.photos/seed/mock-fallback-b/600/600");
  });

  it("enforces 5/hr create rate limit per IP in mock mode (5 succeed, 6th 429 RATE_LIMITED)", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const ip = "6.6.6.6";
    const mkOpts = [
      { label: "A", image_url: "https://picsum.photos/seed/rateA/600/600" },
      { label: "B", image_url: "https://picsum.photos/seed/rateB/600/600" },
    ];
    for (let i = 0; i < 5; i++) {
      const res = await createPoll({
        title: `rate limit test ${i + 1}`,
        options: mkOpts,
        creator_cookie: null,
        ip,
      });
      expect("poll" in res, `expected poll on create ${i + 1}, got ${JSON.stringify(res)}`).toBe(true);
    }
    const limited = await createPoll({
      title: "rate limit test 6 — should be throttled",
      options: mkOpts,
      creator_cookie: null,
      ip,
    });
    expect(limited).toMatchObject({ status: 429, code: "RATE_LIMITED" });
  });

  it("enforces 10/poll/IP/24h vote rate limit in mock mode (10 succeed, 11th 429 RATE_LIMITED)", async () => {
    resetMock();
    const { createPoll, voteOnPoll } = await import("./store");
    const c = await createPoll({
      title: "vote rate limit test",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/voterateA/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/voterateB/600/600" },
      ],
      creator_cookie: null,
      ip: "7.7.7.7",
    });
    expect("poll" in c, `expected poll, got ${JSON.stringify(c)}`).toBe(true);
    if (!("poll" in c)) return;
    const poll = c.poll;
    const opt = poll.options[0];
    const ip = "10.0.0.99";
    for (let i = 0; i < 10; i++) {
      const r = await voteOnPoll({
        poll_id: poll.id,
        option_id: opt.id,
        voter_cookie: `rate-vote-voter-${i}`,
        ip,
      });
      expect("counts" in r, `expected vote ${i + 1} to succeed, got ${JSON.stringify(r)}`).toBe(true);
    }
    const limited = await voteOnPoll({
      poll_id: poll.id,
      option_id: opt.id,
      voter_cookie: "rate-vote-voter-10",
      ip,
    });
    expect(limited).toMatchObject({ status: 429, code: "RATE_LIMITED", retry_after: 86400 });
  });

  it("rejects data URL >6MB in mock mode (400) — 6MB guard", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    // just over 6MB raw bytes → ~8MB base64, deterministic, mock mode only
    const bigBuf = Buffer.alloc(6 * 1024 * 1024 + 1, 0);
    const bigB64 = bigBuf.toString("base64");
    const bigDataUrl = `data:image/png;base64,${bigB64}`;
    const res = await createPoll({
      title: "6MB guard test",
      options: [
        { label: "A", image_url: bigDataUrl },
        { label: "B", image_url: "https://picsum.photos/seed/guard-b/600/600" },
      ],
      creator_cookie: "guard-cid",
      ip: "8.8.8.8",
    });
    expect(res).toMatchObject({ status: 400 });
    if ("error" in (res as { error: string; status: number })) {
      expect((res as { error: string }).error).toMatch(/6 MB|too large/i);
    }
    // exactly 6MB should still be accepted (boundary)
    resetMock();
    const buf6 = Buffer.alloc(6 * 1024 * 1024, 0);
    const b64_6 = buf6.toString("base64");
    const url6 = `data:image/png;base64,${b64_6}`;
    const ok = await createPoll({
      title: "6MB boundary ok",
      options: [
        { label: "A", image_url: url6 },
        { label: "B", image_url: "https://picsum.photos/seed/guard-b2/600/600" },
      ],
      creator_cookie: "guard-cid2",
      ip: "8.8.8.9",
    });
    expect("poll" in ok, `expected poll at exactly 6MB, got ${JSON.stringify(ok).slice(0, 200)}`).toBe(true);
  });

  it("rejects data URL with non-image mime (text/plain) 400 — store defense-in-depth (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const goodB = { label: "B", image_url: "https://picsum.photos/seed/nonimg-b/600/600" };
    const goodA = { label: "A", image_url: "https://picsum.photos/seed/nonimg-a/600/600" };

    // base64 text/plain — must be 400 Only image data URLs are allowed (route guards, store also guards)
    const r1 = await createPoll({
      title: "non-image mime base64",
      options: [
        { label: "A", image_url: "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==" },
        goodB,
      ],
      creator_cookie: null,
      ip: "18.18.18.1",
    });
    expect(r1).toMatchObject({ status: 400 });
    if ("error" in (r1 as { error: string; status: number })) {
      expect((r1 as { error: string }).error).toMatch(/Only image data URLs are allowed/i);
    }

    // non-base64 text/plain — also 400 (same mime guard)
    const r2 = await createPoll({
      title: "non-image mime plain",
      options: [
        goodA,
        { label: "B", image_url: "data:text/plain,hello" },
      ],
      creator_cookie: null,
      ip: "18.18.18.2",
    });
    expect(r2).toMatchObject({ status: 400 });
    if ("error" in (r2 as { error: string; status: number })) {
      expect((r2 as { error: string }).error).toMatch(/Only image data URLs are allowed/i);
    }

    // text/html base64 — also non-image, 400
    const r3 = await createPoll({
      title: "non-image mime html",
      options: [
        { label: "A", image_url: "data:text/html;base64,PGgxPkhlbGxvPC9oMT4=" },
        goodB,
      ],
      creator_cookie: null,
      ip: "18.18.18.3",
    });
    expect(r3).toMatchObject({ status: 400 });
    if ("error" in (r3 as { error: string; status: number })) {
      expect((r3 as { error: string }).error).toMatch(/Only image data URLs are allowed/i);
    }

    // control: image/png data URL still succeeds after rejects (proves guard not over-broad)
    const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    const ok = await createPoll({
      title: "non-image guard control ok",
      options: [
        { label: "A", image_url: TINY_PNG },
        goodB,
      ],
      creator_cookie: null,
      ip: "18.18.18.4",
    });
    expect("poll" in ok, `expected poll for image/png control, got ${JSON.stringify(ok)}`).toBe(true);
    if ("poll" in ok) {
      expect(ok.poll.options[0].image_url).toBe(TINY_PNG);
      expect(ok.poll.options[1].image_url).toBe(goodB.image_url);
    }
  });

  it("poll with 3 options has positions 0,1,2 in order and votes start at 0", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const res = await createPoll({
      title: "3-opt ordering test",
      options: [
        { label: "Alpha", image_url: "https://picsum.photos/seed/orderA/600/600" },
        { label: "Beta", image_url: "https://picsum.photos/seed/orderB/600/600" },
        { label: "Gamma", image_url: "https://picsum.photos/seed/orderC/600/600" },
      ],
      creator_cookie: "order-cid",
      ip: "9.9.9.10",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    expect(res.poll.options).toHaveLength(3);
    // positions must be 0,1,2 in input order, votes 0
    res.poll.options.forEach((o, i) => {
      expect(o.position).toBe(i);
      expect(o.votes).toBe(0);
    });
    expect(res.poll.options.map((o) => o.label)).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(res.poll.options.map((o) => o.position)).toEqual([0, 1, 2]);
    // verify persisted order via getPoll (mock store keeps insertion order + position)
    const fresh = await getPoll(res.poll.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.options.map((o) => o.position)).toEqual([0, 1, 2]);
    expect(fresh!.options.map((o) => o.votes)).toEqual([0, 0, 0]);
    expect(fresh!.options.map((o) => o.label)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("poll with 4 options (max) has positions 0,1,2,3 votes 0 and labels preserved", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const labels = ["Sneaker A", "Sneaker B", "Sneaker C", "Sneaker D"];
    const res = await createPoll({
      title: "4-opt max ordering test",
      options: labels.map((label, i) => ({
        label,
        image_url: `https://picsum.photos/seed/max4-${i}/600/600`,
      })),
      creator_cookie: "max4-cid",
      ip: "9.9.9.11",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    expect(res.poll.options).toHaveLength(4);
    // positions 0,1,2,3 in input order, votes 0, labels preserved verbatim (trimmed)
    res.poll.options.forEach((o, i) => {
      expect(o.position).toBe(i);
      expect(o.votes).toBe(0);
      expect(o.label).toBe(labels[i]);
    });
    expect(res.poll.options.map((o) => o.position)).toEqual([0, 1, 2, 3]);
    expect(res.poll.options.map((o) => o.label)).toEqual(labels);
    expect(res.poll.options.map((o) => o.votes)).toEqual([0, 0, 0, 0]);
    // persisted order via getPoll
    const fresh = await getPoll(res.poll.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.options.map((o) => o.position)).toEqual([0, 1, 2, 3]);
    expect(fresh!.options.map((o) => o.votes)).toEqual([0, 0, 0, 0]);
    expect(fresh!.options.map((o) => o.label)).toEqual(labels);
    // ids are distinct and poll_id consistent
    const ids = fresh!.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(4);
    for (const o of fresh!.options) expect(o.poll_id).toBe(fresh!.id);
  });

  it("create→fetch round-trip: 2 options, getPoll by id returns same poll with votes 0/0", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const res = await createPoll({
      title: "Round-trip 2-opt",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/rt-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/rt-b/600/600" },
      ],
      creator_cookie: "rt-cid",
      ip: "9.9.9.12",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    expect(res.poll.options).toHaveLength(2);
    // initial votes are 0 on create response
    expect(res.poll.options[0].votes).toBe(0);
    expect(res.poll.options[1].votes).toBe(0);
    expect(res.poll.options[0].label).toBe("A");
    expect(res.poll.options[1].label).toBe("B");
    expect(res.poll.options[0].position).toBe(0);
    expect(res.poll.options[1].position).toBe(1);
    // fetch via getPoll with correct id
    const fetched = await getPoll(res.poll.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(res.poll.id);
    expect(fetched!.title).toBe("Round-trip 2-opt");
    expect(fetched!.options).toHaveLength(2);
    expect(fetched!.options.map((o) => o.votes)).toEqual([0, 0]);
    expect(fetched!.options.map((o) => o.label)).toEqual(["A", "B"]);
    expect(fetched!.options.map((o) => o.position)).toEqual([0, 1]);
    expect(fetched!.options.map((o) => o.poll_id)).toEqual([res.poll.id, res.poll.id]);
    // ids distinct
    expect(fetched!.options[0].id).not.toBe(fetched!.options[1].id);
    // unknown id returns null
    expect(await getPoll("no-such-id-xyz")).toBeNull();
  });

  it("returns 404/null for unknown poll id (explicit unknown-id handling via voteOnPoll + getPoll)", async () => {
    resetMock();
    const { getPoll, voteOnPoll } = await import("./store");
    // getPoll unknown id is null (standalone, not just as side-effect of round-trip)
    expect(await getPoll("unknown-poll-id-zzz-999")).toBeNull();
    expect(await getPoll("")).toBeNull();
    expect(await getPoll("no-such-id-xyz-does-not-exist")).toBeNull();
    // voteOnPoll with unknown poll_id must be 404 Poll not found (fresh IP/cookie, mock mode)
    const r = await voteOnPoll({
      poll_id: "unknown-poll-id-zzz-999",
      option_id: "opt-does-not-matter",
      voter_cookie: "test-voter-unknown-404",
      ip: "9.9.9.99",
    });
    expect(r).toMatchObject({ status: 404 });
    if ("error" in (r as { error: string; status: number })) {
      expect((r as { error: string }).error).toMatch(/not found/i);
    }
    // empty poll_id also 404
    const r2 = await voteOnPoll({
      poll_id: "",
      option_id: "x",
      voter_cookie: "voter2-unknown-404",
      ip: "9.9.9.98",
    });
    expect(r2).toMatchObject({ status: 404 });
  });

  it("rejects title with blocked words via word-boundary (profanity filter) — 'fuck this fit' 400, 'xxx hot' 400, but 'xxxa' not blocked", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const good2 = [
      { label: "A", image_url: "https://picsum.photos/seed/prof-a/600/600" },
      { label: "B", image_url: "https://picsum.photos/seed/prof-b/600/600" },
    ];
    // blocked: word-boundary match for "fuck"
    const r1 = await createPoll({ title: "fuck this fit", options: good2, creator_cookie: null, ip: "10.10.10.1" });
    expect(r1).toMatchObject({ status: 400 });
    if ("error" in (r1 as { error: string; status: number })) {
      expect((r1 as { error: string }).error).toMatch(/blocked/i);
    }
    // blocked: word-boundary match for "xxx"
    const r2 = await createPoll({ title: "xxx hot", options: good2, creator_cookie: null, ip: "10.10.10.2" });
    expect(r2).toMatchObject({ status: 400 });
    if ("error" in (r2 as { error: string; status: number })) {
      expect((r2 as { error: string }).error).toMatch(/blocked/i);
    }
    // NOT blocked: "xxxa" is substring without word boundary — should create poll
    const ok = await createPoll({ title: "xxxa", options: good2, creator_cookie: null, ip: "10.10.10.3" });
    expect("poll" in ok, `expected poll for word-boundary non-block "xxxa", got ${JSON.stringify(ok)}`).toBe(true);
    if ("poll" in ok) {
      expect(ok.poll.title).toBe("xxxa");
    }
    // verify rate limit not interfering — different IP for second blocked check
    const r3 = await createPoll({ title: "fuck this fit", options: good2, creator_cookie: null, ip: "10.10.10.4" });
    expect(r3).toMatchObject({ status: 400 });
  });

  it("initial state for 2-option poll: status active, created_at ISO string, og_image_url null", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const res = await createPoll({
      title: "Which one?",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/init-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/init-b/600/600" },
      ],
      creator_cookie: "init-cid",
      ip: "11.11.11.11",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    const p = res.poll;
    expect(p.options).toHaveLength(2);
    expect(p.status).toBe("active");
    expect(p.og_image_url).toBeNull();
    // created_at must be ISO 8601 string — deterministic, mock path
    expect(typeof p.created_at).toBe("string");
    expect(Date.parse(p.created_at)).not.toBeNaN();
    expect(new Date(p.created_at).toISOString()).toBe(p.created_at);
    expect(p.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    // persisted state matches via getPoll
    const fresh = await getPoll(p.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.status).toBe("active");
    expect(fresh!.og_image_url).toBeNull();
    expect(fresh!.created_at).toBe(p.created_at);
    expect(new Date(fresh!.created_at).toISOString()).toBe(fresh!.created_at);
    // each option votes start at 0, positions 0/1
    expect(fresh!.options.map((o) => o.votes)).toEqual([0, 0]);
    expect(fresh!.options.map((o) => o.position)).toEqual([0, 1]);
  });

  it("rejects empty image_url — Each option needs an image (label ok but image empty 400)", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const goodB = { label: "B", image_url: "https://picsum.photos/seed/empty-img-b/600/600" };
    const goodA = { label: "A", image_url: "https://picsum.photos/seed/empty-img-a/600/600" };

    // first option empty string — label valid, image blank → 400
    const r1 = await createPoll({
      title: "empty image test",
      options: [
        { label: "A", image_url: "" },
        goodB,
      ],
      creator_cookie: null,
      ip: "12.12.12.1",
    });
    expect(r1).toMatchObject({ status: 400 });
    if ("error" in (r1 as { error: string; status: number })) {
      expect((r1 as { error: string }).error).toMatch(/Each option needs an image/i);
    }

    // whitespace only → 400
    const r2 = await createPoll({
      title: "empty image whitespace",
      options: [
        goodA,
        { label: "B", image_url: "   " },
      ],
      creator_cookie: null,
      ip: "12.12.12.2",
    });
    expect(r2).toMatchObject({ status: 400 });
    if ("error" in (r2 as { error: string; status: number })) {
      expect((r2 as { error: string }).error).toMatch(/Each option needs an image/i);
    }

    // second option empty in 3-opt — also 400
    const r3 = await createPoll({
      title: "empty image 3-opt",
      options: [
        goodA,
        { label: "B", image_url: "" },
        { label: "C", image_url: "https://picsum.photos/seed/empty-img-c/600/600" },
      ],
      creator_cookie: null,
      ip: "12.12.12.3",
    });
    expect(r3).toMatchObject({ status: 400 });
    if ("error" in (r3 as { error: string; status: number })) {
      expect((r3 as { error: string }).error).toMatch(/Each option needs an image/i);
    }

    // valid after rejects — same IPs fresh but not rate-limited, should succeed
    const ok = await createPoll({
      title: "empty image guard ok",
      options: [goodA, goodB],
      creator_cookie: null,
      ip: "12.12.12.4",
    });
    expect("poll" in ok, `expected poll after empty-image rejects, got ${JSON.stringify(ok)}`).toBe(true);
    if ("poll" in ok) {
      expect(ok.poll.options).toHaveLength(2);
      expect(ok.poll.options[0].image_url).toBe(goodA.image_url);
      expect(ok.poll.options[1].image_url).toBe(goodB.image_url);
    }
  });

  it("rejects invalid image_url non-URL — 'not-a-url' → 400 Invalid image URL (mock mode)", async () => {
    resetMock();
    const { createPoll } = await import("./store");
    const goodB = { label: "B", image_url: "https://picsum.photos/seed/invalid-url-b/600/600" };
    const goodA = { label: "A", image_url: "https://picsum.photos/seed/invalid-url-a/600/600" };

    // first option is bare string "not-a-url" (no scheme, not a URL) → 400
    const r1 = await createPoll({
      title: "invalid url first opt",
      options: [
        { label: "A", image_url: "not-a-url" },
        goodB,
      ],
      creator_cookie: null,
      ip: "13.13.13.1",
    });
    expect(r1).toMatchObject({ status: 400 });
    if ("error" in (r1 as { error: string; status: number })) {
      expect((r1 as { error: string }).error).toMatch(/Invalid image URL/i);
    }

    // second option invalid — also 400
    const r2 = await createPoll({
      title: "invalid url second opt",
      options: [
        goodA,
        { label: "B", image_url: "not-a-url" },
      ],
      creator_cookie: null,
      ip: "13.13.13.2",
    });
    expect(r2).toMatchObject({ status: 400 });
    if ("error" in (r2 as { error: string; status: number })) {
      expect((r2 as { error: string }).error).toMatch(/Invalid image URL/i);
    }

    // other non-URL shapes — also 400 (no scheme / not parseable by new URL)
    const r3 = await createPoll({
      title: "invalid url shape",
      options: [
        goodA,
        { label: "B", image_url: "://missing-scheme" },
      ],
      creator_cookie: null,
      ip: "13.13.13.3",
    });
    expect(r3).toMatchObject({ status: 400 });
    if ("error" in (r3 as { error: string; status: number })) {
      expect((r3 as { error: string }).error).toMatch(/Invalid image URL/i);
    }

    // valid https URLs still succeed (control — proves validation not over-broad)
    const ok = await createPoll({
      title: "invalid url guard ok",
      options: [goodA, goodB],
      creator_cookie: null,
      ip: "13.13.13.4",
    });
    expect("poll" in ok, `expected poll after invalid-URL rejects, got ${JSON.stringify(ok)}`).toBe(true);
    if ("poll" in ok) {
      expect(ok.poll.options).toHaveLength(2);
      expect(ok.poll.options[0].image_url).toBe(goodA.image_url);
      expect(ok.poll.options[1].image_url).toBe(goodB.image_url);
    }
  });

  it("creates 2-option poll with 8-char nanoid id and persists creator_cookie (mock mode)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const creator_cookie = "test-creator-cookie-xyz-8char";
    const res = await createPoll({
      title: "Pick one",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/nanoid-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/nanoid-b/600/600" },
      ],
      creator_cookie,
      ip: "14.14.14.14",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    const p = res.poll;
    expect(p.options).toHaveLength(2);
    // poll id is 8-char nanoid: customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8)
    expect(p.id).toMatch(/^[0-9a-z]{8}$/);
    expect(p.id).toHaveLength(8);
    expect(p.creator_cookie).toBe(creator_cookie);
    // persisted via getPoll
    const fresh = await getPoll(p.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.id).toBe(p.id);
    expect(fresh!.creator_cookie).toBe(creator_cookie);
    expect(fresh!.options).toHaveLength(2);
    for (const o of fresh!.options) expect(o.poll_id).toBe(p.id);
  });

  it("allows minimal poll with null creator_cookie and null context/category (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    // minimal poll: only required fields — title + 2 valid options, null creator_cookie,
    // no context/category (undefined) → should succeed and persist as nulls
    const res = await createPoll({
      title: "Minimal poll — null cookie/context/category",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/minimal-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/minimal-b/600/600" },
      ],
      creator_cookie: null,
      ip: "15.15.15.15",
    });
    expect("poll" in res, `expected poll for minimal null fields, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    const p = res.poll;
    expect(p.options).toHaveLength(2);
    expect(p.title).toBe("Minimal poll — null cookie/context/category");
    // null creator_cookie is allowed — not coerced to empty string
    expect(p.creator_cookie).toBeNull();
    // omitted context/category collapse to null (store trims or nulls)
    expect(p.context).toBeNull();
    expect(p.category).toBeNull();
    expect(p.status).toBe("active");
    expect(p.og_image_url).toBeNull();
    expect(typeof p.created_at).toBe("string");
    // persisted nulls via getPoll
    const fresh = await getPoll(p.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.creator_cookie).toBeNull();
    expect(fresh!.context).toBeNull();
    expect(fresh!.category).toBeNull();
    expect(fresh!.title).toBe(p.title);
    expect(fresh!.options).toHaveLength(2);
    // also verify explicit undefined/null context/category pass — same IP offset to avoid rate coupling
    const res2 = await createPoll({
      title: "Minimal explicit nulls",
      context: undefined,
      category: undefined,
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/minimal2-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/minimal2-b/600/600" },
      ],
      creator_cookie: null,
      ip: "15.15.15.16",
    });
    expect("poll" in res2, `expected poll for explicit undefined context/category, got ${JSON.stringify(res2)}`).toBe(true);
    if (!("poll" in res2)) return;
    expect(res2.poll.context).toBeNull();
    expect(res2.poll.category).toBeNull();
    expect(res2.poll.creator_cookie).toBeNull();
  });

  it("persists category and context via getPoll — trimmed, round-trip (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    const res = await createPoll({
      title: "Category/context persistence",
      context: "  Help me pick for dinner — vote!  ",
      category: "  Food & Drink  ",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/catctx-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/catctx-b/600/600" },
      ],
      creator_cookie: "catctx-cid",
      ip: "15.15.15.17",
    });
    expect("poll" in res, `expected poll with category/context, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    // store trims context/category (store.ts: input.context?.trim() || null)
    expect(res.poll.context).toBe("Help me pick for dinner — vote!");
    expect(res.poll.category).toBe("Food & Drink");
    expect(res.poll.title).toBe("Category/context persistence");
    expect(res.poll.creator_cookie).toBe("catctx-cid");
    // persisted via getPoll — same trimmed values
    const fresh = await getPoll(res.poll.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.context).toBe("Help me pick for dinner — vote!");
    expect(fresh!.category).toBe("Food & Drink");
    expect(fresh!.title).toBe(res.poll.title);
    expect(fresh!.creator_cookie).toBe("catctx-cid");
    expect(fresh!.options).toHaveLength(2);
    // second poll on different IP — distinct category/context, no cross-pollution
    const res2 = await createPoll({
      title: "Second catctx",
      context: "Need winner before I publish",
      category: "Design",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/catctx2-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/catctx2-b/600/600" },
      ],
      creator_cookie: null,
      ip: "15.15.15.18",
    });
    expect("poll" in res2, `expected second poll, got ${JSON.stringify(res2)}`).toBe(true);
    if (!("poll" in res2)) return;
    expect(res2.poll.context).toBe("Need winner before I publish");
    expect(res2.poll.category).toBe("Design");
    const fresh2 = await getPoll(res2.poll.id);
    expect(fresh2!.context).toBe("Need winner before I publish");
    expect(fresh2!.category).toBe("Design");
    // first poll still unchanged after second create
    const refetch1 = await getPoll(res.poll.id);
    expect(refetch1!.context).toBe("Help me pick for dinner — vote!");
    expect(refetch1!.category).toBe("Food & Drink");
  });

  it("minimal poll with only title+2 options no context/category — category null and context null not empty string (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    // minimal poll: only required fields — title + 2 options, no context/category keys at all
    const res = await createPoll({
      title: "Which one? — minimal null check",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/nullcheck-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/nullcheck-b/600/600" },
      ],
      creator_cookie: null,
      ip: "15.15.15.19",
    });
    expect("poll" in res, `expected poll for minimal no-context/category, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    const p = res.poll;
    expect(p.options).toHaveLength(2);
    expect(p.title).toBe("Which one? — minimal null check");
    // category and context must be null — explicitly not empty string (store trims or nulls: input.context?.trim() || null)
    expect(p.context).toBeNull();
    expect(p.category).toBeNull();
    expect(p.context).not.toBe("");
    expect(p.category).not.toBe("");
    expect(typeof p.context).not.toBe("string");
    expect(typeof p.category).not.toBe("string");
    expect(p.status).toBe("active");
    // persisted via getPoll — still null, not ""
    const fresh = await getPoll(p.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.context).toBeNull();
    expect(fresh!.category).toBeNull();
    expect(fresh!.context).not.toBe("");
    expect(fresh!.category).not.toBe("");
    // empty string inputs also collapse to null (defense-in-depth — same store path: "".trim() || null)
    const res2 = await createPoll({
      title: "Empty string collapses to null",
      context: "",
      category: "",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/nullcheck2-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/nullcheck2-b/600/600" },
      ],
      creator_cookie: null,
      ip: "15.15.15.20",
    });
    expect("poll" in res2, `expected poll for empty string context/category, got ${JSON.stringify(res2)}`).toBe(true);
    if (!("poll" in res2)) return;
    expect(res2.poll.context).toBeNull();
    expect(res2.poll.category).toBeNull();
    expect(res2.poll.context).not.toBe("");
    const fresh2 = await getPoll(res2.poll.id);
    expect(fresh2!.context).toBeNull();
    expect(fresh2!.category).toBeNull();
  });

  it("voteOnPoll with unknown option_id returns 400 Option not found (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, voteOnPoll, getPoll } = await import("./store");
    const res = await createPoll({
      title: "Option validation test",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/opt-val-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/opt-val-b/600/600" },
      ],
      creator_cookie: null,
      ip: "16.16.16.16",
    });
    expect("poll" in res, `expected poll, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    const poll = res.poll;
    expect(poll.options).toHaveLength(2);
    // valid poll, unknown option_id → 400 Option not found
    const bad = await voteOnPoll({
      poll_id: poll.id,
      option_id: "unknown-option-id-zzz-999",
      voter_cookie: "opt-val-voter-1",
      ip: "16.16.16.17",
    });
    expect(bad).toMatchObject({ status: 400 });
    if ("error" in (bad as { error: string; status: number })) {
      expect((bad as { error: string }).error).toMatch(/Option not found/i);
    }
    // empty option_id also 400 Option not found (not 404, poll exists)
    const badEmpty = await voteOnPoll({
      poll_id: poll.id,
      option_id: "",
      voter_cookie: "opt-val-voter-2",
      ip: "16.16.16.18",
    });
    expect(badEmpty).toMatchObject({ status: 400 });
    if ("error" in (badEmpty as { error: string; status: number })) {
      expect((badEmpty as { error: string }).error).toMatch(/Option not found/i);
    }
    // cross-poll option_id (option belongs to different poll) → also 400
    resetMock();
    const { createPoll: cp2, voteOnPoll: vote2, getPoll: get2 } = await import("./store");
    void cp2; void vote2; void get2;
    const mod = await import("./store");
    const r1 = await mod.createPoll({
      title: "Poll A for cross-opt check",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/cross-a/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/cross-b/600/600" },
      ],
      creator_cookie: null,
      ip: "16.16.16.19",
    });
    expect("poll" in r1).toBe(true);
    if (!("poll" in r1)) return;
    const r2 = await mod.createPoll({
      title: "Poll B for cross-opt check",
      options: [
        { label: "C", image_url: "https://picsum.photos/seed/cross-c/600/600" },
        { label: "D", image_url: "https://picsum.photos/seed/cross-d/600/600" },
      ],
      creator_cookie: null,
      ip: "16.16.16.20",
    });
    expect("poll" in r2).toBe(true);
    if (!("poll" in r2)) return;
    const crossOptId = r2.poll.options[0].id; // belongs to r2, not r1
    const cross = await mod.voteOnPoll({
      poll_id: r1.poll.id,
      option_id: crossOptId,
      voter_cookie: "opt-val-voter-cross",
      ip: "16.16.16.21",
    });
    expect(cross).toMatchObject({ status: 400 });
    if ("error" in (cross as { error: string; status: number })) {
      expect((cross as { error: string }).error).toMatch(/Option not found/i);
    }
    // verify no vote counted on either poll after rejected votes
    const freshA = await mod.getPoll(r1.poll.id);
    expect(freshA).not.toBeNull();
    expect(freshA!.options.map((o) => o.votes)).toEqual([0, 0]);
    const freshB = await mod.getPoll(r2.poll.id);
    expect(freshB).not.toBeNull();
    expect(freshB!.options.map((o) => o.votes)).toEqual([0, 0]);
    // valid vote still succeeds after rejections (proves poll not poisoned)
    const ok = await mod.voteOnPoll({
      poll_id: r1.poll.id,
      option_id: r1.poll.options[0].id,
      voter_cookie: "opt-val-voter-ok",
      ip: "16.16.16.22",
    });
    expect("counts" in ok).toBe(true);
    if (!("counts" in ok)) return;
    expect(ok.total).toBe(1);
    expect(ok.counts[r1.poll.options[0].id]).toBe(1);
  });

  it("valid https image_url (picsum) is accepted and persisted verbatim via getPoll — picsum URL persistence (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    // valid https picsum URLs — the happy path for option images (non-data URL branch, new URL check only)
    const picsumA = "https://picsum.photos/seed/pollpop-persist-a/600/600";
    const picsumB = "https://picsum.photos/seed/pollpop-persist-b/600/600";
    const res = await createPoll({
      title: "Valid https picsum persistence",
      options: [
        { label: "A", image_url: picsumA },
        { label: "B", image_url: picsumB },
      ],
      creator_cookie: null,
      ip: "19.19.19.1",
    });
    expect("poll" in res, `expected poll for valid https picsum URLs, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    // immediate response: image_urls stored verbatim (trimmed), not rewritten
    expect(res.poll.options).toHaveLength(2);
    expect(res.poll.options[0].image_url).toBe(picsumA);
    expect(res.poll.options[1].image_url).toBe(picsumB);
    expect(res.poll.options[0].label).toBe("A");
    expect(res.poll.options[1].label).toBe("B");
    expect(res.poll.options[0].position).toBe(0);
    expect(res.poll.options[1].position).toBe(1);
    expect(res.poll.options[0].votes).toBe(0);
    expect(res.poll.options[1].votes).toBe(0);
    // persisted via getPoll — same verbatim URLs, order and polling intact
    const fresh = await getPoll(res.poll.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.id).toBe(res.poll.id);
    expect(fresh!.options).toHaveLength(2);
    expect(fresh!.options[0].image_url).toBe(picsumA);
    expect(fresh!.options[1].image_url).toBe(picsumB);
    expect(fresh!.options.map((o) => o.position)).toEqual([0, 1]);
    expect(fresh!.options.map((o) => o.votes)).toEqual([0, 0]);
    expect(fresh!.options.map((o) => o.label)).toEqual(["A", "B"]);
    // distinct option ids, correct poll_id linkage — proves createPoll mapped correctly
    expect(fresh!.options[0].id).not.toBe(fresh!.options[1].id);
    for (const o of fresh!.options) expect(o.poll_id).toBe(fresh!.id);
  });

  it("accepts image_url with query params (picsum ?w=600) for 2-option poll — query-param regression (mock mode, deterministic)", async () => {
    resetMock();
    const { createPoll, getPoll } = await import("./store");
    // picsum URLs with query params must pass `new URL(...)` validation and persist verbatim
    // — covers real unfurl/CDN resize shape `?w=600` / `?w=600&h=800` (not stripped or 400)
    const picsumQa = "https://picsum.photos/seed/pollpop-query-a/600/600?w=600";
    const picsumQb = "https://picsum.photos/seed/pollpop-query-b/600/600?w=600&h=800&fit=crop";
    const res = await createPoll({
      title: "Query params picsum — ?w=600",
      options: [
        { label: "A", image_url: picsumQa },
        { label: "B", image_url: picsumQb },
      ],
      creator_cookie: null,
      ip: "19.19.19.22",
    });
    expect("poll" in res, `expected poll for picsum ?w=600 query-param URLs, got ${JSON.stringify(res)}`).toBe(true);
    if (!("poll" in res)) return;
    // immediate response: 2 options, query strings preserved verbatim (trimmed), not normalized away
    expect(res.poll.options).toHaveLength(2);
    expect(res.poll.options[0].image_url).toBe(picsumQa);
    expect(res.poll.options[1].image_url).toBe(picsumQb);
    expect(res.poll.options[0].image_url).toContain("?w=600");
    expect(res.poll.options[1].image_url).toContain("?w=600");
    expect(res.poll.options[0].position).toBe(0);
    expect(res.poll.options[1].position).toBe(1);
    expect(res.poll.options.map((o) => o.votes)).toEqual([0, 0]);
    // persisted via getPoll — same verbatim URLs with query params, not stripped
    const fresh = await getPoll(res.poll.id);
    expect(fresh).not.toBeNull();
    expect(fresh!.id).toBe(res.poll.id);
    expect(fresh!.options).toHaveLength(2);
    expect(fresh!.options[0].image_url).toBe(picsumQa);
    expect(fresh!.options[1].image_url).toBe(picsumQb);
    expect(fresh!.options[0].image_url).toContain("?w=600");
    expect(fresh!.options[1].image_url).toContain("?w=600&h=800&fit=crop");
    expect(fresh!.options.map((o) => o.position)).toEqual([0, 1]);
    expect(fresh!.options.map((o) => o.votes)).toEqual([0, 0]);
    for (const o of fresh!.options) expect(o.poll_id).toBe(fresh!.id);
  });
});
