"use client";
import { useEffect, useRef, useState } from "react";
import { beacon } from "@/lib/analytics";

export function CTACard({ pollId, compact }: { pollId: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem("pollpop_cta_dismissed") === "1") setDismissed(true); } catch {}
  }, []);

  const onDismiss = () => {
    try { sessionStorage.setItem("pollpop_cta_dismissed", "1"); } catch {}
    setDismissed(true);
  };

  useEffect(() => {
    if (fired.current) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !fired.current) {
        fired.current = true;
        beacon("cta_view", pollId);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [pollId]);

  const onClick = () => {
    beacon("cta_click", pollId, { ref: `poll_${pollId}` });
    window.location.href = `/?ref=poll_${encodeURIComponent(pollId)}`;
  };

  if (dismissed) return null;

  if (compact) {
    return (
      <div ref={ref} className="relative overflow-hidden bg-[#f5e3c7] rounded-[24px] p-6">
        <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#faf9f5] text-[#b0aea5] border border-[#cccbc8] grid place-items-center cursor-pointer text-[16px] leading-none hover:border-[#87867f] hover:text-[#141413] transition-colors z-[2]" aria-label="Dismiss" onClick={onDismiss}>×</button>
        <div className="inline-flex items-center gap-1.5 bg-[#faf9f5] border border-[#cccbc8] px-2.5 py-1.5 rounded-[0px] font-sans text-[12px] font-semibold tracking-[-0.24px] uppercase text-[#141413]">Viral loop · 15s</div>
        <h3 className="font-serif text-[16px] font-medium tracking-[-0.02em] leading-[1.1] text-[#141413] mt-2">Create your own — 15s</h3>
        <div className="flex gap-2.5 flex-wrap mt-2.5">
          <button className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[36px] rounded-b-[8px] rounded-t-none bg-[#d97757] hover:bg-[#c6613f] text-white font-medium font-sans text-[12px] tracking-[-0.24px] border border-[#d97757] hover:border-[#c6613f] cursor-pointer transition-colors" onClick={onClick}>Create your poll →</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative overflow-hidden bg-[#f5e3c7] rounded-[24px] p-8 mt-4 max-[640px]:p-6">
      <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#faf9f5] text-[#b0aea5] border border-[#cccbc8] grid place-items-center cursor-pointer text-[16px] leading-none hover:border-[#87867f] hover:text-[#141413] transition-colors z-[2]" aria-label="Dismiss" onClick={onDismiss}>×</button>
      <div className="relative inline-flex items-center gap-1.5 bg-[#faf9f5] border border-[#cccbc8] px-2.5 py-1.5 rounded-[0px] font-sans text-[12px] font-semibold tracking-[-0.24px] uppercase text-[#141413]">✦ Turn any “which one?” into a poll</div>
      <h3 className="relative font-serif text-[24px] font-medium tracking-[-0.02em] leading-[1.1] text-[#141413] mt-3.5 mb-2">Create your own — 15s</h3>
      <p className="relative m-0 text-[#141413] font-serif text-[20px] leading-[1.4] max-w-[58ch]">Got a fit, menu, logo, or Airbnb to settle? Make a visual poll and share one link. No signup.</p>
      <div className="relative flex gap-2.5 flex-wrap mt-5">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-b-[8px] rounded-t-none bg-[#d97757] hover:bg-[#c6613f] text-white font-medium font-sans text-[16px] tracking-[-0.08px] border border-[#d97757] hover:border-[#c6613f] cursor-pointer transition-colors flex-1 min-w-[180px] text-center" onClick={onClick}>Create your poll →</button>
        <a className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-[12px] bg-transparent text-[#141413] border border-[#87867f] font-medium font-sans text-[12px] tracking-[-0.24px] cursor-pointer hover:border-[#141413] hover:text-[#141413] transition-colors" href={`/p/${pollId}`} onClick={(e)=>e.preventDefault()}>How it works</a>
      </div>
      <div className="relative mt-3 text-[12px] font-sans tracking-[-0.24px] text-[#b0aea5] font-normal">Link carries <span className="font-mono text-[16px] tracking-[-0.08px] text-[#141413]">?ref=poll_{pollId.slice(0,6)}</span> so you’re credited in metrics.</div>
    </div>
  );
}
