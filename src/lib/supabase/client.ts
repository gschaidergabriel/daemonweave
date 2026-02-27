import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return createSupabaseClient(url, key);
}
