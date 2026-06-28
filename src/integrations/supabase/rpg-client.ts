// Client somente leitura para o schema `rpg`. Compartilha a sessão admin.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const rpgSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: "rpg" as never },
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "sb-portalayurveda-auth",
  },
});
