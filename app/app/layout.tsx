import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PollPop — Which one? Vote in 2 seconds.",
  description: "Turn any 'which one?' into a visual poll. 15s to create, tap to vote, live results, one share link.",
  openGraph: {
    title: "PollPop — Which one?",
    description: "Turn any 'which one?' into a visual poll — 15s to create, tap to vote, live results.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://picsum.photos" />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a className="brand" href="/" aria-label="PollPop home">
              <span className="brand-mark">P</span> PollPop <small>beta</small>
            </a>
            <div className="nav-actions">
              <a className="pill" href="/metrics">Metrics</a>
              <a className="pill primary" href="/">Create poll</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <span>PollPop — one link, one tap, live results. No signup.</span>
          <span><a href="/metrics">Metrics</a> · <a href="https://github.com">GitHub</a></span>
        </footer>
      </body>
    </html>
  );
}
