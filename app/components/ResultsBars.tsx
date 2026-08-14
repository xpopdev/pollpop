"use client";
import type { PollOption } from "@/lib/types";

export function ResultsBars({ options, total, selectedId }: { options: PollOption[]; total: number; selectedId?: string | null }) {
  if (total === 0) {
    return <div style={{ padding: "14px 16px", color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>Be the first to vote — results appear live as people weigh in.</div>;
  }
  const maxVotes = Math.max(...options.map(o=>o.votes));
  return (
    <div className="bar-list">
      {[...options].sort((a,b)=>b.votes - a.votes).map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        const winner = o.votes === maxVotes && total > 1;
        const isSelected = o.id === selectedId;
        return (
          <div key={o.id} className={`bar-row ${winner ? "winner" : ""}`} aria-label={`${o.label}: ${o.votes} votes, ${pct} percent`}>
            <div className="bar-top">
              <b>{o.label} {winner && <span className="crown">👑</span>} {isSelected && <span style={{fontSize:10, background:"var(--accent)", color:"#fff", padding:"2px 6px", borderRadius:999}}>your pick</span>}</b>
              <span>{o.votes} · {pct}%</span>
            </div>
            <div className="bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="bar-fill" style={{ width: `${pct}%`, background: o.color ? `linear-gradient(90deg, ${o.color}, ${o.color}cc)` : undefined }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
