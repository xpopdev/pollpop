import { CreateForm } from "@/components/CreateForm";

export const dynamic = "force-dynamic";

export default function Home({ searchParams }: { searchParams?: { ref?: string } }) {
  const ref = searchParams?.ref || null;

  return (
    <main>
      <div className="hero">
        <div className="eyebrow"><span className="dot" /> Live — no signup · mock mode works offline</div>
        <h1>Turn any <em>“which one?”</em><br />into a poll — in 15s.</h1>
        <p style={{color:"var(--muted)", fontSize:14, lineHeight:1.5, maxWidth:560, margin:"10px 0 0"}}>Two to four images, one link, tap to vote, live bars. Share anywhere — unfurls in WhatsApp, iMessage, Discord. The viral loop: your voters become creators.</p>
      </div>

      <div className="form-shell">
        <div className="card form-card">
          <div className="form-head">
            <h2>Create your poll</h2>
            <p>2–4 images · drag, paste, or URL · labels ≤24 chars</p>
          </div>
          {ref && <div style={{marginTop:10, fontSize:12, background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.18)", padding:"8px 10px", borderRadius:12}}>Referred from <span className="mono">{ref}</span> — you’ll be counted in the viral K-factor 💜</div>}
          <div style={{marginTop:14}}>
            <CreateForm initialRef={ref} />
          </div>
        </div>

        <div className="card" style={{marginTop:14, padding:"14px 16px"}}>
          <div style={{fontSize:12, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:"var(--muted)"}}>Try an example</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:10}}>
            {["fit-check","brunch-crew","logo-battle","thumbnail-wars"].map(id=>(
              <a key={id} className="pill" href={`/p/${id}`}>{id}</a>
            ))}
          </div>
          <div style={{marginTop:10, fontSize:12, color:"var(--muted)", fontWeight:600}}>Seed polls work even in mock mode — perfect for testing the vote → results → CTA loop.</div>
        </div>
      </div>
    </main>
  );
}
