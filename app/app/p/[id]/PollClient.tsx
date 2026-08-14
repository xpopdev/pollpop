"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { VoteGrid } from "@/components/VoteGrid";
import { ResultsBars } from "@/components/ResultsBars";
import { ShareRow } from "@/components/ShareRow";
import { CTACard } from "@/components/CTACard";
import { ensureClientId, persistClientId } from "@/lib/dedup";
import { beacon } from "@/lib/analytics";
import type { Poll } from "@/lib/types";

export default function PollClient({ id }: { id: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState("");
  const votedRef = useRef(false);

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      // support both shapes: { poll } or poll directly; poll has options array
      const p: Poll = data.poll || data;
      setPoll(p);
      // restore previous vote from localStorage
      const prev = localStorage.getItem(`pollpop_vote_${id}`);
      if (prev && p.options.find(o=>o.id===prev)) {
        setSelected(prev);
        setHasVoted(true);
        setShowResults(true);
      }
    } catch (e: unknown) {
      setErr((e as Error).message);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchPoll(); }, [fetchPoll]);

  // poll_view once per mount
  useEffect(() => {
    if (!poll) return;
    const k = `pollpop_view_${id}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k,"1");
    let cid = "";
    try { cid = ensureClientId(); } catch {}
    beacon("poll_view", id);
    // also set cid cookie for server attribution
    try { persistClientId(cid); } catch {}
  }, [poll, id]);

  // realtime fallback: poll every 5s when showing results
  useEffect(() => {
    if (!showResults) return;
    const iv = setInterval(fetchPoll, 5000);
    return () => clearInterval(iv);
  }, [showResults, fetchPoll]);

  // Supabase Realtime if configured (client subscribes to poll_options changes)
  useEffect(() => {
    if (!showResults || !poll) return;
    let channel: unknown = null;
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase");
        const client = createClient();
        if (!client) return;
        // subscribe to poll_options changes for this poll
        const ch = client.channel(`poll:${id}`)
          .on("postgres_changes", { event:"*", schema:"public", table:"poll_options", filter:`poll_id=eq.${id}` }, () => fetchPoll())
          .subscribe();
        channel = ch;
      } catch {}
    })();
    return () => {
      try {
        const c = channel as { unsubscribe?: ()=>void };
        c?.unsubscribe?.();
      } catch {}
    };
  }, [showResults, poll, id, fetchPoll]);

  const onSelect = async (optionId: string) => {
    if (!poll || votedRef.current) return;
    votedRef.current = true;
    const cid = ensureClientId(); persistClientId(cid);
    // optimistic
    const prevSelected = selected;
    setSelected(optionId);
    setHasVoted(true);
    setShowResults(true);
    localStorage.setItem(`pollpop_vote_${id}`, optionId);
    // animate bars optimistically if we have counts
    setPoll(p => {
      if (!p) return p;
      const opts = p.options.map(o => {
        if (prevSelected && o.id === prevSelected) return { ...o, votes: Math.max(0, o.votes - 1) };
        if (o.id === optionId) return { ...o, votes: o.votes + (prevSelected ? 0 : 1) } as typeof o;
        return o;
      });
      // if prevSelected existed it was a move, not new vote — net 0 change except counts shift
      // we did +/-1 above; for new vote just +1
      return { ...p, options: opts };
    });
    beacon("vote", id, { meta: { option_id: optionId } as unknown as Record<string,unknown> });

    try {
      const res = await fetch(`/api/polls/${encodeURIComponent(id)}/vote`, {
        method: "POST",
        headers: { "content-type":"application/json", "x-pollpop-cid": cid },
        body: JSON.stringify({ option_id: optionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed");
      // reconcile with server counts
      if (data.counts) {
        setPoll(p => p ? ({ ...p, options: p.options.map(o => ({ ...o, votes: data.counts[o.id] ?? o.votes })) }) : p);
      } else {
        fetchPoll();
      }
      setToast("Vote counted ✓");
      setTimeout(()=>setToast(""), 1800);
    } catch (e: unknown) {
      setToast((e as Error).message || "Vote failed");
      setTimeout(()=>setToast(""), 2200);
      // revert on 429 so user isn't stuck
      if ((e as Error).message?.includes("Too many")) {
        // keep selection but inform
      }
    } finally {
      votedRef.current = false;
    }
  };

  if (loading) return <div className="poll-wrap"><div className="card" style={{padding:18, textAlign:"center", color:"var(--muted)", fontWeight:700}}>Loading poll…</div></div>;
  if (err || !poll) return <div className="poll-wrap"><div className="card" style={{padding:18}}><b>Poll not found</b><p style={{color:"var(--muted)",fontSize:13}}>{err || "No poll with that id."} <a href="/" style={{textDecoration:"underline"}}>Create one →</a></p></div></div>;

  const total = poll.options.reduce((a,o)=>a+o.votes,0);
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const justCreated = search?.get("created") === "1";

  return (
    <div className="poll-wrap">
      {justCreated && <div style={{background:"linear-gradient(135deg,#ecfdf5,#f0fdfa)",border:"1px solid #a7f3d0",padding:"10px 12px",borderRadius:12,marginBottom:12,fontSize:13,fontWeight:700}}>Your poll is live — share the link below to start getting votes 🎉</div>}

      <div className="breadcrumb"><a href="/">← Home</a> <span>·</span> <span>p/{poll.id}</span></div>

      <div className="poll-header">
        <div className="poll-kicker">
          {poll.category && <span className="tag">{poll.category}</span>}
          <span className="tag">{poll.options.length} options</span>
          <span className="tag">{total} votes</span>
        </div>
        <h1>{poll.title}</h1>
        {poll.context && <p>{poll.context}</p>}
        <div className="poll-meta">
          <span className="avatar">{(poll.title[0]||"P").toUpperCase()}</span>
          <span>{poll.id} · {new Date(poll.created_at).toLocaleDateString()}</span>
          <span style={{marginLeft:"auto", fontWeight:800}}>{total} total</span>
        </div>
      </div>

      {!showResults ? (
        <>
          <div style={{marginTop:10, fontSize:12, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:"var(--muted)"}}>Tap to vote — no signup</div>
          <VoteGrid options={poll.options} selectedId={selected} onSelect={onSelect} />
          <div style={{textAlign:"center", marginTop:10}}>
            <button className="link-muted" onClick={()=>{ setShowResults(true); beacon("poll_view", id); }}>See results without voting →</button>
          </div>
        </>
      ) : (
        <>
          <VoteGrid options={poll.options} selectedId={selected} onSelect={onSelect} disabled={false} />
          <div className="results">
            <div className="results-head">
              <h3>Live results {hasVoted ? "· you voted" : ""}</h3>
              <p>{total} votes · updates live</p>
            </div>
            <ResultsBars options={poll.options} total={total} selectedId={selected} />
            <ShareRow poll={poll} />
          </div>
        </>
      )}

      <CTACard pollId={poll.id} />

      <div className={`toast ${toast ? "show":""}`}>{toast}</div>
    </div>
  );
}
