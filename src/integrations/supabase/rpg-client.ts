// Helpers para chamar o modulo RPG sem expor o schema `rpg` no PostgREST.
// O browser chama apenas funcoes public.*; a ponte public.rpg_rpc valida auth
// e repassa para as funcoes internas do schema rpg via SECURITY DEFINER.
import { supabase } from "@/integrations/supabase/client";

type RpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function rpgRpc<T = any>(
  fn: string,
  args: Record<string, unknown> = {},
): Promise<RpcResult<T>> {
  const { data, error } = await (supabase as any).rpc("rpg_rpc", {
    _fn: fn,
    _args: args,
  });

  if (error) return { ok: false, error: error.message || "Erro no RPG" };
  if (data?.ok === false && typeof data.error === "string") {
    return { ok: false, error: data.error };
  }
  return { ok: true, data: data as T };
}

// Mantido: leitura administrativa via RPC pública.
export async function rpgAdminSelect<T = Record<string, unknown>>(table: string) {
  const { data, error } = await (supabase as any).rpc("rpg_admin_select", {
    _table: table,
  });

  return {
    data: (Array.isArray(data) ? data : []) as T[],
    error: error?.message ? String(error.message) : null,
  };
}
