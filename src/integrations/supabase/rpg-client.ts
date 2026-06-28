// Helpers para chamar RPCs do schema `rpg` via PostgREST.
// supabase-js valida o nome do schema contra os Database types e dispara
// "Invalid schema: rpg". Para evitar isso, batemos direto em /rest/v1/rpc
// passando os headers Content-Profile/Accept-Profile = 'rpg'.
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type RpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function rpgRpc<T = any>(
  fn: string,
  args: Record<string, unknown> = {},
): Promise<RpcResult<T>> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token ?? SUPABASE_ANON;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Profile": "rpg",
        "Accept-Profile": "rpg",
      },
      body: JSON.stringify(args),
    });
    let body: any = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    if (!res.ok) {
      const msg =
        (body && typeof body === "object" && (body.message || body.error || body.hint)) ||
        (typeof body === "string" ? body : `HTTP ${res.status}`);
      return { ok: false, error: String(msg) };
    }
    return { ok: true, data: body as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha de rede" };
  }
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
