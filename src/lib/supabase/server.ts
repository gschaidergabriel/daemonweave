import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/[\r\n\t\s]/g, "");

const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  .trim()
  .replace(/[\r\n\t\s]/g, "");

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Component — ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}
