"use client";
import { useEffect, useState, useCallback } from "react";
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
    <div className="px-5 py-3.5 flex gap-2 flex-wrap items-center border-t border-[#cccbc8] mt-2 bg-[#e3dacc]">
      <span className="text-[12px] font-sans tracking-[-0.24px] text-[#b0aea5] font-normal w-full mb-0.5">Share — link unfurls in WhatsApp / iMessage / Discord</span>
      <button className="inline-flex items-center gap-2 px-4 py-2 min-h-[32px] rounded-b-[8px] rounded-t-none bg-[#faf9f5] text-[#141413] border border-[#cccbc8] hover:border-[#87867f] font-medium font-sans text-[12px] tracking-[-0.24px] cursor-pointer transition-colors" onClick={onCopy}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>
      {canNative && (
        <button className="inline-flex items-center gap-2 px-4 py-2 min-h-[32px] rounded-[12px] bg-transparent border border-[#87867f] hover:border-[#141413] font-medium font-sans text-[12px] tracking-[-0.24px] text-[#141413] cursor-pointer transition-colors" onClick={onNative}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51 15.42 17.49" />
            <path d="M15.41 6.51 8.59 10.49" />
          </svg>
          Share…
        </button>
      )}
      <span className="font-mono text-[12px] tracking-[-0.24px] text-[#b0aea5] break-all">{url}</span>
    </div>
  );
}
