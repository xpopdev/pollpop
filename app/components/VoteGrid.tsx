"use client";
import type { PollOption } from "@/lib/types";

export function VoteGrid({
  options,
  selectedId,
  onSelect,
  disabled,
}: {
  options: PollOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const cols = options.length === 3 ? "cols-3" : options.length === 4 ? "cols-4" : "cols-2";
  return (
    <div className={`vote-grid ${cols}`}>
      {options.map((o) => {
        const selected = o.id === selectedId;
        return (
          <div
            key={o.id}
            className={`opt ${selected ? "selected" : ""} ${disabled ? "voted" : ""}`}
            onClick={() => !disabled && onSelect(o.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(o.id); }}
            aria-pressed={selected}
          >
            <div className="opt-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image_url} alt={o.label} loading="lazy" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}} />
              <div style={{position:"absolute", top:8, right:8}} className="check">{selected ? "✓" : ""}</div>
            </div>
            <div className="opt-label">
              <b>{o.label}</b>
              {selected && <span className="pct">selected</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
