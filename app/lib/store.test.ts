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
        title: "X".repeat(80),
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
    expect(await createPoll({ title: "X".repeat(81), options: good2, creator_cookie: null, ip: "2.2.2.2" })).toMatchObject({ status: 400 });
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
});
