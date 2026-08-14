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
});
