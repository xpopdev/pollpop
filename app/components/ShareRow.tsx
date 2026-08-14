"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Poll } from "@/lib/types";

export function ShareRow({ poll }: { poll: Poll }) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/p/${poll.id}` : `/p/${poll.id}`;

  useEffect(() => {
    setCanNative(!!(navigator as unknown as { share?: unknown }).share);
  }, []);

  const fire = useCallback((name: string) => {
    fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, poll_id: poll.id }),
    }).catch(() => {});
  }, [poll.id]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    setCopied(true); setTimeout(()=>setCopied(false), 1800);
    fire("share_copy");
  };

  const onNative = async () => {
    try {
      await (navigator as unknown as { share: (d: unknown)=>Promise<void> }).share({ title: poll.title, url });
      fire("share_native");
    } catch {}
  };

  return (
    <div className="share-row">
      <span className="hint">Share — link unfurls in WhatsApp / iMessage / Discord</span>
      <button className="btn primary small" onClick={onCopy}>{copied ? "Copied!" : "Copy link"}</button>
      {canNative && <button className="btn small" onClick={onNative}>Share…</button>}
      <span className="mono" style={{fontSize:11, color:"var(--muted)", wordBreak:"break-all"}}>{url}</span>
    </div>
  );
}
