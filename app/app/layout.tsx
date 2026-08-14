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
      <body className="bg-[#f0eee6] text-[#141413] font-serif antialiased">
        <nav className="sticky top-0 z-40 bg-[#f0eee6] border-b border-[#141413]">
          <div className="max-w-[1080px] mx-auto flex items-center justify-between px-6 py-3.5 gap-4">
            <a className="flex items-center gap-2.5 leading-none text-[#141413]" href="/" aria-label="PollPop home">
              <span className="w-7 h-7 rounded-none bg-[#141413] text-[#faf9f5] grid place-items-center font-serif font-semibold text-[14px] leading-none border border-[#3d3d3a]">P</span>
              <span className="font-sans font-bold text-[12px] tracking-[-0.24px] uppercase text-[#141413]">PollPop</span>
              <small className="font-sans font-medium text-[12px] tracking-[-0.24px] uppercase text-[#b0aea5] ml-2">beta</small>
            </a>
            <div className="flex gap-2 items-center">
              <a className="px-4 py-2 rounded-[12px] border border-[#87867f] bg-transparent font-sans text-[12px] font-medium tracking-[-0.24px] uppercase text-[#141413] hover:border-[#141413] transition-colors" href="/metrics">Metrics</a>
              <a className="px-4 py-2 rounded-b-[8px] rounded-t-none bg-[#faf9f5] text-[#141413] border border-[#cccbc8] hover:border-[#87867f] font-sans text-[12px] font-medium tracking-[-0.24px] uppercase transition-colors" href="/">Create poll</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="max-w-[1080px] mx-auto px-6 py-6 border-t border-[#cccbc8] text-[#b0aea5] text-[12px] font-sans tracking-[-0.24px] font-normal flex items-center justify-between gap-3 flex-wrap bg-transparent">
          <span>PollPop — one link, one tap, live results. No signup.</span>
          <span><a className="text-[#b0aea5] underline underline-offset-[3px] decoration-[#cccbc8] hover:text-[#141413] transition-colors" href="/metrics">Metrics</a> · <a className="text-[#b0aea5] underline underline-offset-[3px] decoration-[#cccbc8] hover:text-[#141413] transition-colors" href="https://github.com">GitHub</a></span>
        </footer>
      </body>
    </html>
  );
}
