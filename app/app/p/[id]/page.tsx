import type { Metadata } from "next";
import PollClient from "./PollClient";
import { getPoll } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const poll = await getPoll(params.id).catch(()=>null);
  const title = poll ? `${poll.title} — PollPop` : "PollPop — Which one?";
  const description = poll?.context || "Tap to vote — live results, no signup. Create your own in 15s.";
  const og = `/api/polls/${encodeURIComponent(params.id)}/og`;
  // absolute URL left relative; Next will resolve against NEXT_PUBLIC_APP_URL or request host for crawlers.
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: og, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <PollClient id={params.id} />;
}
