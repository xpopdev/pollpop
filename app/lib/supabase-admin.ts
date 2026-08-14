// supabase-admin.ts — server-only service role client
// Use only in API routes / server actions. Never import from client components.
// Requires SUPABASE_SERVICE_ROLE_KEY (server-only, not NEXT_PUBLIC_).
import { createClient } from "@supabase/supabase-js";

export function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Alias for callers that expect `supabase-admin` naming
export const getServiceClient = supaAdmin;
