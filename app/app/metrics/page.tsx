"use client";
import { useEffect, useState } from "react";

type Metrics = {
  totals: { poll_view: number; vote: number; cta_view: number; cta_click: number; poll_create: number; polls: number; votes: number; events: number };
  derived: { ctr_poll_view: number; ctr_cta_view: number; vote_rate: number; voters_per_poll: number; k_factor: number; k_per_click: number; referred_retention: number; via_cta: number };
  topRefs: { ref:string; count:number }[];
  perPoll: Record<string, { poll_view:number; vote:number; cta_view:number; cta_click:number }>;
  recentEvents: { id:string; name:string; poll_id:string|null; ref:string|null; created_at:string }[];
};

export default function MetricsPage(){
  const [data,setData]=useState<Metrics|null>(null);
  const [err,setErr]=useState<string|null>(null);
  const load=async()=>{
    try{
      const r=await fetch("/api/metrics",{cache:"no-store"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Failed");
      setData(j);
    }catch(e:unknown){ setErr((e as Error).message); }
  };
  useEffect(()=>{ load(); const iv=setInterval(load,5000); return()=>clearInterval(iv); },[]);

  if(err) return <div className="metrics-wrap"><div className="card" style={{padding:16}}><b>Metrics error</b><p style={{color:"var(--muted)",fontSize:13}}>{err}</p></div></div>;
  if(!data) return <div className="metrics-wrap"><div className="card" style={{padding:16,textAlign:"center",color:"var(--muted)",fontWeight:700}}>Loading metrics…</div></div>;

  const ctr = data.derived.ctr_poll_view;
  const verdict = ctr >= 0.08 ? "pass" : ctr >= 0.03 ? "retry" : ctr>0 ? "kill" : "retry";
  const verdictLabel = verdict==="pass" ? "PASS — keep building" : verdict==="retry" ? "RETRY — tweak CTA/copy" : "KILL — loop not compounding";

  return (
    <div className="metrics-wrap">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <h1 style={{margin:0,fontSize:22,letterSpacing:"-.03em",fontWeight:900}}>Metrics <span style={{color:"var(--muted)",fontWeight:700,fontSize:13}}>hidden · ESTIMATE until H-001 resolves</span></h1>
        <button className="pill" onClick={load}>Refresh</button>
      </div>

      <div className={`verdict ${verdict}`}>
        <div><b>{verdictLabel}</b><br/><span>Binding CTR = cta_click / poll_view = {ctr.toFixed(3)} · threshold ≥0.08 per approved.md</span></div>
        <span className="mono" style={{fontSize:12}}>{data.totals.cta_click} / {data.totals.poll_view}</span>
      </div>

      <div className="kpi-grid">
        <div className="kpi ctr"><label>CTR (binding)</label><b>{(data.derived.ctr_poll_view*100).toFixed(1)}%</b><span>cta_click / poll_view · ESTIMATE</span></div>
        <div className="kpi"><label>CTR (diag)</label><b>{(data.derived.ctr_cta_view*100).toFixed(1)}%</b><span>cta_click / cta_view</span></div>
        <div className="kpi"><label>K-factor</label><b>{data.derived.k_factor.toFixed(3)}</b><span>polls_via_cta / poll_view · ESTIMATE</span></div>
        <div className="kpi"><label>Voters / poll</label><b>{data.derived.voters_per_poll.toFixed(1)}</b><span>votes / polls (≥10 views gate in prod)</span></div>
        <div className="kpi"><label>Referred retention</label><b>{(data.derived.referred_retention*100).toFixed(0)}%</b><span>referred creators with 2nd poll in 7d</span></div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(4,1fr)", marginTop:12}}>
        <div className="kpi"><label>poll_view</label><b>{data.totals.poll_view}</b></div>
        <div className="kpi"><label>vote</label><b>{data.totals.vote}</b><span>{(data.derived.vote_rate*100).toFixed(1)}% vote rate</span></div>
        <div className="kpi"><label>cta_view</label><b>{data.totals.cta_view}</b></div>
        <div className="kpi"><label>cta_click</label><b>{data.totals.cta_click}</b><span>{data.derived.via_cta} polls via CTA</span></div>
      </div>

      <div className="table-wrap">
        <h3>Per-poll breakdown</h3>
        <table className="table">
          <thead><tr><th>poll</th><th>views</th><th>votes</th><th>cta_view</th><th>cta_click</th><th>ctr</th></tr></thead>
          <tbody>
            {Object.entries(data.perPoll).length===0 ? <tr><td colSpan={6} style={{color:"var(--muted)", textAlign:"center"}}>No poll-scoped events yet — vote and click CTA to generate data.</td></tr> :
              Object.entries(data.perPoll).sort((a,b)=>b[1].poll_view-a[1].poll_view).map(([pid,row])=>(
                <tr key={pid}><td className="mono"><a href={`/p/${pid}`} style={{textDecoration:"underline"}}>{pid}</a></td><td>{row.poll_view}</td><td>{row.vote}</td><td>{row.cta_view}</td><td>{row.cta_click}</td><td>{row.poll_view? (row.cta_click/row.poll_view).toFixed(3):"—"}</td></tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <h3>Top refs (viral attribution)</h3>
        <table className="table">
          <thead><tr><th>ref</th><th>count</th></tr></thead>
          <tbody>
            {data.topRefs.length===0 ? <tr><td colSpan={2} style={{color:"var(--muted)", textAlign:"center"}}>No refs yet — create via ?ref=poll_xxx to see K-factor.</td></tr> :
              data.topRefs.map(r=><tr key={r.ref}><td className="mono">{r.ref}</td><td>{r.count}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <h3>Recent events (last 50)</h3>
        <div style={{maxHeight:320, overflow:"auto"}}>
          <table className="table">
            <thead><tr><th>time</th><th>name</th><th>poll</th><th>ref</th></tr></thead>
            <tbody>
              {data.recentEvents.length===0 ? <tr><td colSpan={4} style={{color:"var(--muted)", textAlign:"center"}}>No events yet.</td></tr> :
                data.recentEvents.map(e=>(
                  <tr key={e.id}><td className="mono" style={{fontSize:11}}>{new Date(e.created_at).toLocaleString()}</td><td>{e.name}</td><td className="mono">{e.poll_id || "—"}</td><td className="mono">{e.ref || "—"}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{marginTop:14, padding:"10px 12px", background:"var(--card)", border:"1px solid var(--line)", borderRadius:12, fontSize:12, color:"var(--muted)", fontWeight:600}}>
        Labels: CTR/K/referred retention are ESTIMATE until metered on real traffic per requirements P0-6. Raw IP never stored — only ip_hash. <a href="/" style={{textDecoration:"underline"}}>← Back to create</a>
      </div>
    </div>
  );
}
