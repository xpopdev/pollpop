"use client";
import type { Poll } from "@/lib/types";

export function PollCard({ poll }: { poll: Poll }) {
  const total = poll.options.reduce((a, o) => a + o.votes, 0);
  return (
    <a href={`/p/${poll.id}`} className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="card-media" style={{ position: "relative", aspectRatio: "1.15", overflow: "hidden", background: "var(--bg2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poll.options[0]?.image_url || "https://picsum.photos/seed/pollpop-fallback/600/600"}
          alt={poll.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 55%)",
            display: "flex",
            alignItems: "flex-end",
            padding: 14,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,.92)",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            {poll.category || "Poll"} · {poll.options.length} options
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(18,18,20,.78)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          <i style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3b30", display: "inline-block" }} /> LIVE
        </div>
      </div>
      <div style={{ padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <h3 style={{ fontSize: 17, fontWeight: 850, letterSpacing: "-.02em", lineHeight: 1.15, margin: 0 }}>{poll.title}</h3>
        {poll.context && (
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.45,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {poll.context}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: "auto",
            paddingTop: 10,
            borderTop: "1px solid var(--line2)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--accent2),var(--accent))",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {(poll.title[0] || "P").toUpperCase()}
            </span>
            {poll.id}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
            {total} votes
          </span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 999,
            background: "var(--ink)",
            color: "white",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          Vote now →
        </span>
      </div>
    </a>
  );
}
