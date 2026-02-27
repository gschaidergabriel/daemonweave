import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/[\r\n\t\s]/g, "");

const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  .trim()
  .replace(/[\r\n\t\s]/g, "");

export function createClient() {
  return createSupabaseClient(url, key);
}
