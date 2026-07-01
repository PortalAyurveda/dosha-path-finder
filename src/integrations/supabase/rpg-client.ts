// Leitura administrativa das tabelas do schema `rpg` via RPC pública.
import { supabase } from "@/integrations/supabase/client";

export async function rpgAdminSelect<T = Record<string, unknown>>(table: string) {
  const { data, error } = await (supabase as any).rpc("rpg_admin_select", {
    _table: table,
  });
  return {
    data: (Array.isArray(data) ? data : []) as T[],
    error: error?.message ? String(error.message) : null,
  };
}
