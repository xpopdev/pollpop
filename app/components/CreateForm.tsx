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
    // MVP-only: data URL path is temporary — will be replaced by Supabase Storage upload (poll-images bucket) in P1.
    // For MVP mock we create an object URL and treat it as imageUrl (client-side preview).
    // Real Supabase path would upload to Storage; mock keeps the data URL. Server now guards data URLs (400).
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
      // ensure cookie exists
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
      // beacon
      fetch("/api/events", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ name:"poll_create_complete", poll_id:id, ref: initialRef || null }) }).catch(()=>{});
      // redirect after short delay so user sees success + copy affordance
      setTimeout(()=>{ window.location.href = `/p/${id}?created=1`; }, 900);
    } catch (e: unknown) {
      setError((e as Error).message || "Couldn’t create — retry.");
    } finally { setSubmitting(false); }
  };

  // fire poll_create_start on mount once
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="success">
        <h3>Your poll is live! 🎉</h3>
        <p style={{wordBreak:"break-all"}}><a href={success.url} style={{textDecoration:"underline"}}>{success.url}</a></p>
        <div className="row">
          <button className="btn primary small" onClick={async()=>{
            try{ await navigator.clipboard.writeText(success.url);}catch{
              const ta=document.createElement("textarea"); ta.value=success.url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
            }
          }}>Copy link</button>
          <a className="btn small" href={`/p/${success.id}`}>Open poll →</a>
        </div>
        <p>Redirecting…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="title">Title — what are you choosing? <span style={{fontWeight:600, textTransform:"none", letterSpacing:0}}>{title.length}/80</span></label>
        <input id="title" ref={titleRef} value={title} onChange={e=>setTitle(e.target.value.slice(0,80))} placeholder="Which fit for date night?" autoFocus />
        {!showContext && <button type="button" onClick={()=>setShowContext(true)} style={{background:"none",border:"none",color:"var(--accent)",fontWeight:800,fontSize:12,cursor:"pointer",textAlign:"left",padding:0}}>+ Add context line (optional)</button>}
        {showContext && <textarea value={context} onChange={e=>setContext(e.target.value.slice(0,120))} placeholder="Help me not embarrass myself…" rows={2} />}
      </div>

      <div style={{marginTop:14}}>
        <label style={{fontSize:11,fontWeight:800,letterSpacing:".07em",textTransform:"uppercase",color:"var(--muted)"}}>Options — 2 to 4 images</label>
        <div className="uploader-grid">
          {opts.map((o, i) => (
            <div key={i} className={`uploader-card ${o.preview ? "has-image":""}`} onDragOver={onDragOver} onDrop={(e)=>onDrop(i,e)} onPaste={(e)=>onPaste(i,e)}>
              <div className="img-area">
                {o.preview
                  ? <img className="preview" src={o.preview} alt={o.label || `option ${i+1}`} />
                  : <div className="placeholder"><div><b>Drop, paste, or upload</b><br/>PNG / JPG / WebP — or paste image URL below</div>
                      <label className="btn small" style={{cursor:"pointer"}}>Choose file<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e=>onFile(i, e.target.files?.[0]||null)} /></label>
                    </div>
                }
                {o.preview && <button className="remove" title="Remove image" onClick={()=>updateOpt(i,{ preview:null, imageUrl:""})}>×</button>}
              </div>
              <div className="label-row">
                <input value={o.label} onChange={e=>updateOpt(i,{label:e.target.value.slice(0,24)})} placeholder={`Label — e.g. ${i===0?"Fit A":"Fit B"}`} />
                <span style={{fontSize:10,color:"var(--muted2)",fontWeight:800}}>{o.label.length}/24</span>
              </div>
              <div style={{padding:"6px 8px", background:"var(--card)"}}>
                <input className="url-input" value={o.imageUrl.startsWith("data:") ? "" : o.imageUrl} onChange={e=>onPasteUrl(i,e.target.value)} placeholder="Or paste image URL https://…" />
              </div>
              {opts.length > 2 && <button title="Remove option" onClick={()=>setOpts(prev=>prev.filter((_,idx)=>idx!==i))} style={{position:"absolute", top:8, left:8, fontSize:10, padding:"4px 8px", borderRadius:999, border:"1px solid var(--line)", background:"rgba(255,255,255,.9)", cursor:"pointer", fontWeight:800}}>Remove</button>}
            </div>
          ))}
        </div>
        <button className="add-option" disabled={!canAdd} onClick={()=>setOpts(prev=>[...prev,{label:"",imageUrl:"",preview:null}])}>{canAdd ? "+ Add option" : "Max 4 options"}</button>
        <div style={{marginTop:8, fontSize:11, color:"var(--muted2)", fontWeight:600}}>Tip: drag & drop, paste (Ctrl+V) an image, or paste a URL. Labels ≤24 chars.</div>
      </div>

      {error && <div className="error" style={{marginTop:12,background:"#fef2f2",border:"1px solid #fca5a5",padding:"10px 12px",borderRadius:12,color:"#991b1b",fontWeight:700,fontSize:13}}>{error}</div>}

      <button className="submit" disabled={!canSubmit || submitting} onClick={submit}>
        {submitting ? <><span className="spinner" /> Creating…</> : "Create & get link →"}
      </button>
      <div style={{textAlign:"center",marginTop:8,fontSize:11,color:"var(--muted2)",fontWeight:600}}>15s · No signup · Link unfurls everywhere</div>
    </div>
  );
}
