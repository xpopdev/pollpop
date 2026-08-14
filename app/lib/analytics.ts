// analytics.ts — tiny beacon helper (client + server types)
import type { EventName } from "./types";

export async function beacon(
  name: EventName,
  poll_id?: string | null,
  extra?: { ref?: string | null; meta?: Record<string, unknown> }
) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        poll_id: poll_id ?? null,
        ref: extra?.ref ?? null,
        meta: extra?.meta ?? null,
      }),
      keepalive: true,
    });
  } catch {
    // silent — analytics must never break UX
  }
}

// Also available as sendBeacon fallback for unload cases
export function beaconSend(name: EventName, poll_id?: string | null, meta?: Record<string, unknown>) {
  try {
    const url = "/api/events";
    const body = JSON.stringify({ name, poll_id: poll_id ?? null, meta: meta ?? null });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      beacon(name, poll_id, { meta });
    }
  } catch {}
}
