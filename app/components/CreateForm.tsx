"use client";
import { useState, useRef } from "react";
import { ensureClientId, persistClientId } from "@/lib/dedup";

type OptDraft = { label: string; imageUrl: string; preview: string | null };

export function CreateForm({ initialRef }: { initialRef?: string | null }) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [opts, setOpts] = useState<OptDraft[]>([
    { label: "", imageUrl: "", preview: null },
    { label: "", imageUrl: "", preview: null },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; url: string } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const canAdd = opts.length < 4;
  const canSubmit = title.trim().length > 0 && title.trim().length <= 80 && opts.filter(o=>o.imageUrl.trim()).length >= 2 && opts.every(o=> !o.label || o.label.length <= 24) && opts.filter(o=>o.imageUrl.trim()).every(o=> o.label.trim().length>0);

  const updateOpt = (i: number, patch: Partial<OptDraft>) => setOpts(prev => prev.map((o, idx) => idx===i ? { ...o, ...patch } : o));

  const onFile = (i: number, f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Each image ≤5 MB. Try a smaller file."); return; }
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(f.type) && !f.type.startsWith("image/")) { setError("JPEG / PNG / WebP only."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateOpt(i, { preview: dataUrl, imageUrl: dataUrl });
      setError(null);
    };
    reader.readAsDataURL(f);
  };

  const onPasteUrl = (i:number, url:string) => {
    const v = url.trim();
    if (!v) { updateOpt(i, { imageUrl: "", preview: null }); return; }
    try { new URL(v); } catch { setError("Paste a valid https:// image URL."); return; }
    updateOpt(i, { imageUrl: v, preview: v });
    setError(null);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (i:number, e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(i, f);
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (!f && url) onPasteUrl(i, url);
  };

  const onPaste = (i:number, e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const it of Array.from(items)) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) { e.preventDefault(); onFile(i, f); return; }
      }
    }
  };

  const submit = async () => {
    setError(null);
    if (!canSubmit) { setError("Add a title and at least 2 images with labels (≤24 chars)."); return; }
    setSubmitting(true);
    try {
      let cid = "";
      try { cid = ensureClientId(); persistClientId(cid); } catch {}
      const payload = {
        title: title.trim(),
        context: context.trim() || undefined,
        options: opts.filter(o=>o.imageUrl.trim()).map(o=>({ label: o.label.trim(), image_url: o.imageUrl.trim() })),
        ref: initialRef || undefined,
      };
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "content-type": "application/json", "x-pollpop-cid": cid },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      const id = data.id as string;
      const url = `${window.location.origin}/p/${id}`;
      setSuccess({ id, url });
      fetch("/api/events", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ name:"poll_create_complete", poll_id:id, ref: initialRef || null }) }).catch(()=>{});
      setTimeout(()=>{ window.location.href = `/p/${id}?created=1`; }, 900);
    } catch (e: unknown) {
      setError((e as Error).message || "Couldn’t create — retry.");
    } finally { setSubmitting(false); }
  };

  const _startFired = (() => {
    if (typeof window !== "undefined") {
      const k = "pollpop_create_start_fired";
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k,"1");
        fetch("/api/events",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"poll_create_start"})}).catch(()=>{});
      }
    }
    return true;
  })();

  if (success) {
    return (
      <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 space-y-3">
        <h3 className="font-serif text-[17px] font-medium tracking-[-0.02em] text-[#141413]">Your poll is live!</h3>
        <p className="break-all text-sm"><a href={success.url} className="underline decoration-[#cccbc8] underline-offset-2 text-[#141413] hover:text-[#b0aea5]">{success.url}</a></p>
        <div className="flex gap-2 flex-wrap">
          <button className="bg-[#faf9f5] hover:bg-[#faf9f5] text-[#141413] border border-[#cccbc8] hover:border-[#87867f] rounded-b-[8px] rounded-t-none px-4 py-2 text-[12px] font-medium tracking-[-0.24px] font-sans uppercase transition-colors inline-flex items-center gap-2" onClick={async()=>{
            try{ await navigator.clipboard.writeText(success.url);}catch{
              const ta=document.createElement("textarea"); ta.value=success.url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
            }
          }}>Copy link</button>
          <a className="bg-transparent border border-[#87867f] hover:border-[#141413] rounded-[12px] px-4 py-2 text-[12px] font-medium font-sans tracking-[-0.24px] uppercase text-[#141413] transition-colors inline-flex items-center" href={`/p/${success.id}`}>Open poll →</a>
        </div>
        <p className="text-[12px] font-sans tracking-[-0.24px] text-[#b0aea5]">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="font-sans text-[12px] font-semibold uppercase tracking-[-0.24px] text-[#141413] flex items-center justify-between gap-2">
          <span>Title — what are you choosing?</span>
          <span className="normal-case tracking-[-0.24px] font-medium text-[#b0aea5] text-[12px] font-sans">{title.length}/80</span>
        </label>
        <input
          id="title"
          ref={titleRef}
          value={title}
          onChange={e=>setTitle(e.target.value.slice(0,80))}
          placeholder="Which fit for date night?"
          autoFocus
          className="w-full bg-[#faf9f5] border border-[#cccbc8] rounded-[8px] px-3.5 py-[11px] text-[16px] font-normal font-sans tracking-[-0.08px] text-[#141413] placeholder:text-[#b0aea5] focus:outline-none focus:border-[#d97757] focus:ring-[3px] focus:ring-[#d97757]/15 transition-colors"
        />
        {!showContext && (
          <button
            type="button"
            onClick={()=>setShowContext(true)}
            className="bg-transparent border-0 p-0 text-[#d97757] font-semibold font-sans text-[12px] tracking-[-0.24px] cursor-pointer text-left hover:text-[#c6613f] transition-colors"
          >
            + Add context line (optional)
          </button>
        )}
        {showContext && (
          <textarea
            value={context}
            onChange={e=>setContext(e.target.value.slice(0,120))}
            placeholder="Help me not embarrass myself…"
            rows={2}
            className="w-full bg-[#faf9f5] border border-[#cccbc8] rounded-[8px] px-3.5 py-2.5 text-[20px] font-normal font-serif leading-[1.4] text-[#141413] placeholder:text-[#b0aea5] focus:outline-none focus:border-[#d97757] focus:ring-[3px] focus:ring-[#d97757]/15 transition-colors resize-y min-h-[56px]"
          />
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="font-sans text-[12px] font-semibold uppercase tracking-[-0.24px] text-[#141413]">Options — 2 to 4 images</label>
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          {opts.map((o, i) => (
            <div
              key={i}
              className={`relative flex flex-col overflow-hidden rounded-[24px] border bg-[#faf9f5] min-h-[190px] transition-colors ${o.preview ? "border-[#cccbc8] border-solid" : "border-dashed border-[#cccbc8] bg-[#faf9f5]"}`}
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(i,e)}
              onPaste={(e)=>onPaste(i,e)}
            >
              <div className="flex-1 relative overflow-hidden grid place-items-center min-h-[148px] bg-[#e3dacc]">
                {o.preview
                  ? <img className="w-full h-full object-cover absolute inset-0" src={o.preview} alt={o.label || `option ${i+1}`} />
                  : <div className="grid place-items-center gap-2.5 p-5 text-center text-[12px] font-normal font-sans tracking-[-0.24px] leading-[1.4] text-[#b0aea5]">
                      <div><b className="font-serif font-medium text-[14px] tracking-[-0.01em] text-[#141413]">Drop, paste, or upload</b><br/>PNG / JPG / WebP — or paste image URL below</div>
                      <label className="bg-[#faf9f5] border border-[#cccbc8] hover:border-[#87867f] rounded-b-[8px] rounded-t-none px-3.5 py-2 text-[12px] font-medium font-sans tracking-[-0.24px] cursor-pointer transition-colors inline-flex items-center text-[#141413]">
                        Choose file
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e=>onFile(i, e.target.files?.[0]||null)} />
                      </label>
                    </div>
                }
                {o.preview && <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#141413] text-[#faf9f5] border border-[#3d3d3a] grid place-items-center cursor-pointer text-[16px] leading-none hover:bg-[#3d3d3a] transition-colors" title="Remove image" onClick={()=>updateOpt(i,{ preview:null, imageUrl:""})}>×</button>}
              </div>
              <div className="p-2.5 bg-[#faf9f5] border-t border-[#cccbc8] flex gap-2 items-center">
                <input
                  value={o.label}
                  onChange={e=>updateOpt(i,{label:e.target.value.slice(0,24)})}
                  placeholder={`Label — e.g. ${i===0?"Fit A":"Fit B"}`}
                  className="flex-1 px-2.5 py-2 rounded-[8px] border border-[#cccbc8] text-[12px] font-normal font-sans tracking-[-0.24px] bg-[#faf9f5] text-[#141413] placeholder:text-[#b0aea5] focus:outline-none focus:border-[#d97757] focus:ring-[3px] focus:ring-[#d97757]/15 transition-colors"
                />
                <span className="text-[10px] text-[#b0aea5] font-bold shrink-0 font-sans">{o.label.length}/24</span>
              </div>
              <div className="px-2 py-1.5 bg-[#faf9f5]">
                <input
                  className="w-full px-2.5 py-2 rounded-[8px] border border-[#cccbc8] text-[12px] font-sans bg-[#faf9f5] text-[#141413] placeholder:text-[#b0aea5] focus:outline-none focus:border-[#d97757] focus:ring-[3px] focus:ring-[#d97757]/15 transition-colors"
                  value={o.imageUrl.startsWith("data:") ? "" : o.imageUrl}
                  onChange={e=>onPasteUrl(i,e.target.value)}
                  placeholder="Or paste image URL https://…"
                />
              </div>
              {opts.length > 2 && <button title="Remove option" onClick={()=>setOpts(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-[12px] border border-[#87867f] bg-[#faf9f5] cursor-pointer font-bold font-sans tracking-[-0.24px] text-[#141413] hover:border-[#141413] transition-colors">Remove</button>}
            </div>
          ))}
        </div>
        <button className="w-full mt-3 py-3 rounded-[12px] border border-dashed border-[#cccbc8] bg-[#faf9f5] font-medium font-sans text-[12px] tracking-[-0.24px] text-[#b0aea5] cursor-pointer hover:border-[#d97757] hover:text-[#d97757] hover:bg-[#f5e3c7] disabled:opacity-45 disabled:cursor-not-allowed transition-colors" disabled={!canAdd} onClick={()=>setOpts(prev=>[...prev,{label:"",imageUrl:"",preview:null}])}>{canAdd ? "+ Add option" : "Max 4 options"}</button>
        <div className="text-[12px] font-sans tracking-[-0.24px] text-[#b0aea5] font-medium">Tip: drag & drop, paste (Ctrl+V) an image, or paste a URL. Labels ≤24 chars.</div>
      </div>

      {error && <div className="mt-3 bg-[#faf9f5] border border-[#cccbc8] px-3 py-2.5 rounded-[8px] text-[#c6613f] font-medium font-sans text-[12px] tracking-[-0.24px]">{error}</div>}

      <button className="w-full mt-5 px-5 py-3 min-h-[44px] rounded-b-[8px] rounded-t-none bg-[#faf9f5] hover:bg-[#faf9f5] text-[#141413] border border-[#cccbc8] hover:border-[#87867f] font-medium font-sans text-[16px] tracking-[-0.08px] cursor-pointer transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed" disabled={!canSubmit || submitting} onClick={submit}>
        {submitting ? <><span className="w-4 h-4 border-2 border-[#141413]/20 border-t-[#141413] rounded-full animate-spin" /> Creating…</> : "Create & get link →"}
      </button>
      <div className="text-center mt-2 text-[12px] font-sans tracking-[-0.24px] text-[#b0aea5] font-medium">15s · No signup · Link unfurls everywhere</div>
    </div>
  );
}
