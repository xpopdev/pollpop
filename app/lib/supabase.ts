import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Env detection — if not set, we run in mock mode (zero config dev).
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Browser client (anon key) — safe to expose, respects RLS (anon can read/insert polls/options/votes)
export function supaAnon() {
  if (!isSupabaseConfigured) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client (service_role) — bypasses RLS, server-only. Use via lib/supabase-admin.ts for clarity.
export function supaService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

// Browser client (anon). Returns null in mock mode.
export function createClient() {
  return supaAnon();
}

// Server-only helper — re-export for callers that want explicit server boundary
export const createServerClient = supaService;
