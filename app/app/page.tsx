import { CreateForm } from "@/components/CreateForm";

export const dynamic = "force-dynamic";

export default function Home({ searchParams }: { searchParams?: { ref?: string } }) {
  const ref = searchParams?.ref || null;

  return (
    <main style={{background:"#f0eee6", minHeight:"100vh"}}>
      <div className="hero" style={{background:"#f0eee6"}}>
        <div className="eyebrow" style={{background:"#f5e3c7", border:"1px solid #cccbc8", color:"#141413"}}><span className="dot" style={{background:"#d97757"}} /> Live — no signup · mock mode works offline</div>
        <h1 style={{fontFamily:"var(--font-anthropic-sans, ui-sans-serif, system-ui, sans-serif)", fontSize:"61px", fontWeight:700, color:"#141413", lineHeight:"1.1", letterSpacing:"-0.12px", margin:"14px 0 10px"}}>Turn any <em style={{fontStyle:"normal", color:"#d97757"}}>“which one?”</em><br />into a poll — in 15s.</h1>
        <p style={{fontFamily:"var(--font-anthropic-serif, ui-serif, Georgia, serif)", fontSize:"20px", lineHeight:1.4, color:"#141413", maxWidth:560, margin:"10px 0 0"}}>Two to four images, one link, tap to vote, live bars. Share anywhere — unfurls in WhatsApp, iMessage, Discord. The viral loop: your voters become creators.</p>
      </div>

      <div className="form-shell" style={{background:"#f0eee6"}}>
        <div className="card form-card" style={{background:"#faf9f5", border:"1px solid #cccbc8", borderRadius:"24px"}}>
          <div className="form-head">
            <h2 style={{fontFamily:"var(--font-anthropic-serif)", color:"#141413"}}>Create your poll</h2>
            <p style={{fontFamily:"var(--font-anthropic-sans)", fontSize:"16px", color:"#87867f", letterSpacing:"-0.08px"}}>2–4 images · drag, paste, or URL · labels ≤24 chars</p>
          </div>
          {ref && <div style={{marginTop:10, fontSize:12, background:"#e3dacc", border:"1px solid #cccbc8", padding:"8px 10px", borderRadius:12, color:"#141413", fontFamily:"var(--font-anthropic-sans, ui-sans-serif, system-ui, sans-serif)"}}>Referred from <span className="mono" style={{color:"#141413"}}>{ref}</span> — you’ll be counted in the viral K-factor</div>}
          <div style={{marginTop:14}}>
            <CreateForm initialRef={ref} />
          </div>
        </div>

        <div className="card" style={{marginTop:14, padding:"14px 16px", background:"#faf9f5", border:"1px solid #cccbc8", borderRadius:"24px"}}>
          <div style={{fontSize:12, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:"#b0aea5", fontFamily:"var(--font-anthropic-sans, ui-sans-serif, system-ui, sans-serif)"}}>Try an example</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:10}}>
            {["fit-check","brunch-crew","logo-battle","thumbnail-wars"].map(id=>(
              <a key={id} href={`/p/${id}`} style={{display:"inline-flex", alignItems:"center", padding:"9px 16px", background:"#faf9f5", border:"1px solid #cccbc8", borderRadius:"0 0 8px 8px", fontFamily:"var(--font-anthropic-sans, ui-sans-serif, system-ui, sans-serif)", fontSize:12, fontWeight:500, letterSpacing:"-0.24px", color:"#141413", textDecoration:"none"}}>{id}</a>
            ))}
          </div>
          <div style={{marginTop:10, fontSize:12, color:"#b0aea5", fontWeight:500, fontFamily:"var(--font-anthropic-sans, ui-sans-serif, system-ui, sans-serif)", letterSpacing:"-0.24px"}}>Seed polls work even in mock mode — perfect for testing the vote → results → CTA loop.</div>
        </div>
      </div>
    </main>
  );
}
