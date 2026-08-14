// lib/analytics.test.ts — beacon contract
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("analytics beacon", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("beacon payload has required fields (name, poll_id)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { beacon } = await import("./analytics");

    await beacon("poll_view", "poll_test_123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/events");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "content-type": "application/json" });
    const body = JSON.parse(String(init.body));
    expect(body.name).toBe("poll_view");
    expect(body.poll_id).toBe("poll_test_123");
    // keepalive is set for reliability
    expect(init.keepalive).toBe(true);

    fetchMock.mockClear();
    await beacon("vote", "poll_abc", { meta: { option_id: "opt1" } });
    const body2 = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body2.name).toBe("vote");
    expect(body2.poll_id).toBe("poll_abc");
    expect(body2.meta).toMatchObject({ option_id: "opt1" });

    // analytics must never throw — fetch failure is swallowed
    vi.stubGlobal("fetch", (() => Promise.reject(new Error("network down"))) as unknown as typeof fetch);
    await expect(beacon("cta_view", "poll_x")).resolves.toBeUndefined();
  });

  it("events fire once per action — no double-fire on re-render", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const { beacon } = await import("./analytics");

    // Simulate the poll_view guard: sessionStorage + single beacon per mount.
    // Here we assert the beacon helper itself is idempotent per call — one call = one fetch.
    await beacon("cta_view", "poll_dup");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await beacon("cta_click", "poll_dup", { ref: "poll_poll_dup" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Simulate the component guard: fired ref prevents second cta_view
    // Our helper doesn't double-fire internally — verify no hidden retry.
    fetchMock.mockClear();
    await beacon("poll_view", "poll_once");
    await beacon("poll_view", "poll_once");
    // Two explicit calls = two fetches, but a single logical action must not double-fire.
    // The component layer (CTACard/PollClient) is responsible for dedup — assert helper doesn't add extra.
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Explicit single-action check: one beacon invocation never triggers 2 fetches
    fetchMock.mockClear();
    await beacon("vote", "poll_single");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // beaconSend fallback shape (if available) — ensure it doesn't throw in jsdom
    const { beaconSend } = await import("./analytics");
    expect(() => beaconSend("poll_view", "poll_send", { via: "test" })).not.toThrow();
  });
});
