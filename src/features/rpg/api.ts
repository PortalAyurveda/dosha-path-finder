// Gateway de API do módulo RPG.
// - rpg(fn,args): RPC pública sem auth (rpg_play).
// - webhooks n8n: /rpg-cena, /rpg-acao, /rpg-npc (narração + estado).
// - Legacy helpers pro AdminDashboard (rpg_rpc / rpg_admin_select / postGerarTudo / chatlog).
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://fwezkasjfguarjmjxifh.supabase.co";
const PUBLISHABLE =
  "sb_publishable_B-AA5YM5VnjbAKgmKkq10g_jtVZLtiK";
const WEBHOOK_BASE = "https://n8n.portalayurveda.com/webhook";

// ---------- Storage / identidade ----------
export const STORAGE = {
  userId: "rpg_user_id",
  playerId: "rpg_player_id",
  partyId: "rpg_party_id",
  joinCode: "rpg_join_code",
  onboarding: "rpg_onboarding_seen",
} as const;

function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE.userId);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(STORAGE.userId, id);
  }
  return id;
}

export const store = {
  get: (k: string) => (typeof window === "undefined" ? null : localStorage.getItem(k)),
  set: (k: string, v: string | null) => {
    if (typeof window === "undefined") return;
    if (v === null || v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  },
};

// ---------- RPC público ----------
export async function rpg<T = any>(fn: string, args: Record<string, any> = {}): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpg_play`, {
    method: "POST",
    headers: {
      apikey: PUBLISHABLE,
      Authorization: `Bearer ${PUBLISHABLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _fn: fn, _args: args }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

// ---------- Webhooks n8n (narração) ----------
async function webhook<T = any>(path: string, body: any, timeoutMs = 60_000): Promise<T> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${WEBHOOK_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    let data: any = null;
    try {
      data = await r.json();
    } catch {
      return { ok: false, erro: "resposta invalida" } as any;
    }
    if (!r.ok) return { ok: false, erro: data?.erro || data?.error || `HTTP ${r.status}` } as any;
    return data as T;
  } catch (e: any) {
    return { ok: false, erro: e?.message || "falha de rede" } as any;
  } finally {
    clearTimeout(tid);
  }
}

export const webhookCena = (player_id: string) => webhook("/rpg-cena", { player_id }, 30_000);
export const webhookAcao = (player_id: string, acao: any) =>
  webhook("/rpg-acao", { player_id, acao }, 60_000);
export const webhookNpc = (player_id: string, npc_id: string, interacao_id: string) =>
  webhook("/rpg-npc", { player_id, npc_id, interacao_id }, 30_000);

// ---------- Tradução de erros ----------
const ERROR_MAP: Array<[RegExp, string]> = [
  [/codigo\s+invalido|join.*invalido|not\s+found.*(code|codigo)/i, "Código não encontrado"],
  [/(party|mesa).*(cheia|full)/i, "Mesa cheia"],
  [/mana.*insuficiente/i, "Mana insuficiente"],
  [/(fora\s+de\s+alcance|out\s+of\s+range|longe\s+demais)/i, "Longe demais — mova-se para perto"],
  [/ouro.*insuficiente|gold.*insufficient/i, "Ouro insuficiente"],
  [/nao\s+e\s+seu\s+turno|not\s+your\s+turn/i, "Não é seu turno"],
  [/cooldown/i, "Skill em recarga"],
  [/estoque|out\s+of\s+stock/i, "Sem estoque"],
  [/ja\s+existe|classe.*ocupada|slot.*taken/i, "Essa classe já foi escolhida"],
  [/orphan|nao\s+existe|inexistente/i, "Personagem não existe mais"],
];

export function translateError(msg: string | undefined | null): string {
  if (!msg) return "Algo deu errado, tente de novo";
  for (const [re, out] of ERROR_MAP) if (re.test(msg)) return out;
  return msg.length < 80 ? msg : "Algo deu errado, tente de novo";
}

// ---------- Legacy helpers usados pelo AdminDashboard ----------
type RpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function rpgRpc<T = any>(fn: string, args: Record<string, unknown> = {}): Promise<RpcResult<T>> {
  const { data, error } = await (supabase as any).rpc("rpg_rpc", { _fn: fn, _args: args });
  if (error) return { ok: false, error: error.message || "Erro no RPG" };
  if (data?.ok === false && typeof data.error === "string") return { ok: false, error: data.error };
  return { ok: true, data: data as T };
}

export async function adminSelect<T = any>(table: string): Promise<RpcResult<T[]>> {
  const { data, error } = await (supabase as any).rpc("rpg_admin_select", { _table: table });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (Array.isArray(data) ? data : []) as T[] };
}

async function postJson<T>(path: string, body: unknown, timeoutMs = 60_000): Promise<RpcResult<T>> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${WEBHOOK_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: "Resposta nao JSON" };
    }
    if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
    return { ok: true, data: data as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha de rede" };
  } finally {
    clearTimeout(tid);
  }
}

export const postGerarTudo = (historia: string) =>
  postJson<{ ok: boolean; campaign_id?: string; nome?: string; error?: string }>(
    "/rpg-gerar-tudo",
    { historia },
    10 * 60_000,
  );

export const rpcChatlog = (party_id: string) => rpgRpc("chatlog", { p_party_id: party_id });
