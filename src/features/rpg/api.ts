// API helpers do modulo RPG.
// - rpgRpc: chama funcoes Postgres do schema `rpg` (PostgREST).
// - webhooks: chama n8n; SEMPRE com fallback para RPC quando o webhook cair.
import { supabase } from "@/integrations/supabase/client";
import { rpgRpc as rpgRpcRaw } from "@/integrations/supabase/rpg-client";

const WEBHOOK_BASE = "https://n8n.portalayurveda.com/webhook";

export const CAMPANHA_MOLDE_ID = "aaaaaaaa-0000-0000-0000-000000000002";

type RpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const rpgRpc = rpgRpcRaw;

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

// ----- Webhooks principais -----
export const postAcao = (player_id: string, acao: any) =>
  postJson<any>("/rpg-acao", { player_id, acao }, 45_000);

export const postDiscursiva = (player_id: string, texto: string) =>
  postJson<any>("/rpg-discursiva", { player_id, texto }, 60_000);

export const postCena = (player_id: string) =>
  postJson<any>("/rpg-cena", { player_id }, 30_000);

export const postNpc = (player_id: string, npc_id: string, interacao_id: string) =>
  postJson<{ ok: boolean; narrativa?: string; tipo?: string; npc?: any; loja?: any; dica?: string; error?: string }>(
    "/rpg-npc",
    { player_id, npc_id, interacao_id },
    30_000,
  );

// Pipeline COMPLETO de geracao — pode levar 5-8 min.
export const postGerarTudo = (historia: string) =>
  postJson<{ ok: boolean; campaign_id?: string; nome?: string; error?: string }>(
    "/rpg-gerar-tudo",
    { historia },
    10 * 60_000,
  );

// ----- Atalhos RPC mais usados -----
export const rpcMeusPersonagens = (user_id: string) => rpgRpc("meus_personagens", { p_user_id: user_id });
export const rpcCampanhasJogaveis = () =>
  rpgRpc<Array<{ id: string; nome: string; resumo?: string }>>("campanhas_jogaveis", {});
export const rpcSalasAbertas = () =>
  rpgRpc<Array<any>>("salas_abertas", {});
export const rpcCriarParty = (
  host_user_id: string,
  campaign_id: string,
  is_public: boolean = true,
) =>
  rpgRpc<{ ok: boolean; party_id: string; join_code: string }>("criar_party", {
    p_campaign_id: campaign_id,
    p_host_user_id: host_user_id,
    p_max: 4,
    p_is_public: is_public,
  });
export const rpcSairParty = (player_id: string) =>
  rpgRpc<{ ok: boolean }>("sair_party", { p_player_id: player_id });
export const rpcDeclararAcao = (player_id: string, acao: any) =>
  rpgRpc<any>("declarar_acao", { p_player_id: player_id, p_acao: acao });
export const postRound = (party_id: string) =>
  postJson<any>("/rpg-round", { party_id }, 60_000);

export const rpcEnviarChat = (player_id: string, mensagem: string) =>
  rpgRpc("enviar_chat", { p_player_id: player_id, p_mensagem: mensagem });
export const rpcChatMesa = (party_id: string) =>
  rpgRpc<Array<{ quando: string; player_id: string; nome: string; classe?: string; mensagem: string }>>(
    "chat_mesa",
    { p_party_id: party_id },
  );

export const rpcEntrarParty = (join_code: string) =>
  rpgRpc<{ ok: boolean; party_id?: string; vagas?: number; erro?: string }>("entrar_party", {
    p_join_code: join_code.toUpperCase().trim(),
  });
export const rpcEstadoParty = (party_id: string) => rpgRpc("estado_party", { p_party_id: party_id });
export const rpcMarcarPronto = (player_id: string, ready: boolean) =>
  rpgRpc("marcar_pronto", { p_player_id: player_id, p_ready: ready });
export const rpcIniciarJogo = (party_id: string, host_user_id: string) =>
  rpgRpc("iniciar_jogo", { p_party_id: party_id, p_host_user_id: host_user_id });
export const rpcCenaAtual = (player_id: string) => rpgRpc("cena_atual", { p_player_id: player_id });
export const rpcClasseConfig = (classe: string) =>
  rpgRpc<{ base: Record<string, number>; caps: Record<string, number>; pontos_livres: number; base_hp: number; base_mp: number }>(
    "classe_config",
    { p_classe: classe },
  );
export const rpcCriarPersonagem = (
  party_id: string,
  user_id: string,
  nome: string,
  classe: string,
  pontos: Record<string, number>,
) =>
  rpgRpc<{ ok: boolean; player_id: string; seat: number }>("criar_personagem", {
    p_party_id: party_id,
    p_user_id: user_id,
    p_nome: nome,
    p_classe: classe,
    p_pontos: pontos,
  });
export const rpcInventario = (player_id: string) => rpgRpc("inventario", { p_player_id: player_id });
export const rpcEquipar = (player_id: string, item_instance_id: string) =>
  rpgRpc("equipar", { p_player_id: player_id, p_item_instance_id: item_instance_id });
export const rpcDesequipar = (player_id: string, item_instance_id: string) =>
  rpgRpc("desequipar", { p_player_id: player_id, p_item_instance_id: item_instance_id });
export const rpcMapa = (player_id: string) => rpgRpc("mapa", { p_player_id: player_id });
export const rpcChatlog = (party_id: string) => rpgRpc("chatlog", { p_party_id: party_id });
export const rpcEventoPendente = (player_id: string) => rpgRpc("evento_pendente", { p_player_id: player_id });

// Admin (leitura de tabelas rpg.* via funcao publica criada anteriormente).
export const adminSelect = async <T = any>(table: string): Promise<RpcResult<T[]>> => {
  const { data, error } = await (supabase as any).rpc("rpg_admin_select", { _table: table });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (Array.isArray(data) ? data : []) as T[] };
};
