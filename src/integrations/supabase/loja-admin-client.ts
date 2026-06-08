// Admin-side Supabase client for the loja schema.
// Shares the same auth storage as the main client so admin requests
// carry the logged-in user's JWT for has_role() checks via RLS.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const lojaAdminSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: "loja" as never },
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "sb-portalayurveda-auth",
  },
});
