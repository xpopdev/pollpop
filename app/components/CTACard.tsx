"use client";
import { useEffect, useRef } from "react";
import { beacon } from "@/lib/analytics";

export function CTACard({ pollId, compact }: { pollId: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

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
    // preserve ref attribution
    window.location.href = `/?ref=poll_${encodeURIComponent(pollId)}`;
  };

  if (compact) {
    return (
      <div ref={ref} className="cta-card" style={{ padding: "14px" }}>
        <div className="cta-badge">Viral loop · 15s</div>
        <h3 style={{ fontSize: 16 }}>Create your own — 15s</h3>
        <div className="cta-actions" style={{ marginTop: 10 }}>
          <button className="cta-primary" onClick={onClick} style={{ padding: "11px 14px", fontSize: 13 }}>Create your poll →</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="cta-card">
      <div className="cta-badge">✦ Turn any “which one?” into a poll</div>
      <h3>Create your own — 15s</h3>
      <p>Got a fit, menu, logo, or Airbnb to settle? Make a visual poll and share one link. No signup.</p>
      <div className="cta-actions">
        <button className="cta-primary" onClick={onClick}>Create your poll →</button>
        <a className="cta-secondary" href={`/p/${pollId}`} onClick={(e)=>e.preventDefault()}>How it works</a>
      </div>
      <div className="micro">Link carries <span className="mono">?ref=poll_{pollId.slice(0,6)}</span> so you’re credited in metrics.</div>
    </div>
  );
}
