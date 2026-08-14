export type Poll = {
  id: string;
  title: string;
  context: string | null;
  category: string | null;
  creator_cookie: string | null;
  created_at: string;
  og_image_url: string | null;
  status: string;
  options: PollOption[];
  totalVotes?: number;
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
  image_url: string;
  thumb_url: string | null;
  position: number;
  votes: number;
  color?: string;
};

export type VoteRow = {
  id: string;
  poll_id: string;
  option_id: string;
  voter_cookie: string;
  ip_hash: string;
  created_at: string;
};

export type EventName =
  | "poll_view"
  | "vote"
  | "cta_view"
  | "cta_click"
  | "poll_create"
  | "poll_create_start"
  | "poll_create_complete"
  | "share_copy"
  | "share_native"
  | "poll_create_error";

export type EventRow = {
  id: string;
  name: EventName;
  poll_id: string | null;
  cookie: string | null;
  ref: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};
