// Leitura administrativa do conteúdo RPG.
// Usa o client principal para reaproveitar exatamente a mesma sessão admin.
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
