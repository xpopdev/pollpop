"use client";
import type { PollOption } from "@/lib/types";

export function ResultsBars({ options, total, selectedId }: { options: PollOption[]; total: number; selectedId?: string | null }) {
  if (total === 0) {
    return <div className="px-4 py-3.5 text-[#b0aea5] text-[12px] font-medium font-sans tracking-[-0.24px]">Be the first to vote — results appear live as people weigh in.</div>;
  }
  const maxVotes = Math.max(...options.map(o=>o.votes));
  return (
    <div className="px-5 pt-4 pb-2 grid gap-4">
      {[...options].sort((a,b)=>b.votes - a.votes).map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        const winner = o.votes === maxVotes && total > 1;
        const isSelected = o.id === selectedId;
        const fillColor = winner || isSelected ? "#d97757" : "#141413";
        return (
          <div key={o.id} className="grid gap-2" aria-label={`${o.label}: ${o.votes} votes, ${pct} percent`}>
            <div className="flex items-center justify-between gap-2.5 text-[12px]">
              <b className="font-sans font-medium tracking-[-0.24px] flex items-center gap-1.5 text-[#141413] text-[12px]">
                {o.label} {winner && <span className="text-[11px]">👑</span>} {isSelected && <span className="text-[10px] bg-[#d97757] text-white px-1.5 py-0.5 rounded-none font-medium tracking-normal font-sans">your pick</span>}
              </b>
              <span className="font-sans font-medium text-[12px] tracking-[-0.24px] text-[#b0aea5] tabular-nums">{o.votes} · {pct}%</span>
            </div>
            <div className="h-2 bg-[#e3dacc] overflow-hidden relative" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${pct}%`, background: fillColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
