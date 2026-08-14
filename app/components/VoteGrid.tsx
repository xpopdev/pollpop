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
  const cols = options.length === 3 ? "grid-cols-3" : options.length === 4 ? "grid-cols-2" : "grid-cols-2";
  return (
    <div className={`grid gap-4 mt-4 ${cols} max-[640px]:!grid-cols-2 max-[380px]:!grid-cols-1`}>
      {options.map((o) => {
        const selected = o.id === selectedId;
        return (
          <div
            key={o.id}
            className={`group relative overflow-hidden flex flex-col cursor-pointer transition-colors bg-[#faf9f5] border rounded-[24px] ${
              selected
                ? "border-[#d97757] border-[1px] bg-[#faf9f5]"
                : "border-[#cccbc8] hover:border-[#87867f]"
            } ${disabled ? "cursor-default" : ""}`}
            onClick={() => !disabled && onSelect(o.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) onSelect(o.id); }}
            aria-pressed={selected}
          >
            <div className="relative aspect-square overflow-hidden bg-[#e3dacc]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image_url} alt={o.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}} />
              <div className="absolute top-2 right-2">
                <span className={`w-[22px] h-[22px] rounded-full border-[1.5px] grid place-items-center text-[11px] shrink-0 transition-colors ${selected ? "bg-[#d97757] border-[#d97757] text-white" : "bg-[#faf9f5] border-[#cccbc8] text-transparent"}`}>
                  {selected ? "✓" : ""}
                </span>
              </div>
            </div>
            <div className="px-3 py-3 flex items-center justify-between gap-2 border-t border-[#cccbc8]">
              <b className="font-sans text-[12px] font-medium tracking-[-0.24px] leading-[1.1] text-[#141413]">{o.label}</b>
              {selected && <span className="text-[12px] font-medium font-sans tracking-[-0.24px] text-[#b0aea5]">selected</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
