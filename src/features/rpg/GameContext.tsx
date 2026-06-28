// Store central do jogo. Context + useReducer + polling de cena_atual.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { rpcCenaAtual, rpcEstadoParty, postAcao, postDiscursiva } from "./api";
import { supabase } from "@/integrations/supabase/client";

type Estado = any | null;
type Mode = "lobby" | "exploracao" | "cidade" | "quest" | "combate" | "derrota" | string;

interface PlayerSave {
  player_id: string;
  party_id: string;
  user_id: string;
}

interface GameState {
  player: PlayerSave | null;
  party_id: string | null;
  estado: Estado;
  loading: boolean;
  lastError: string | null;
  lastNarrativa: string | null;
  lastResultado: any | null;
}

type Action =
  | { type: "set_player"; player: PlayerSave }
  | { type: "set_party"; party_id: string }
  | { type: "set_estado"; estado: Estado }
  | { type: "set_loading"; loading: boolean }
  | { type: "set_error"; error: string | null }
  | { type: "set_response"; narrativa?: string; resultado?: any; estado?: Estado }
  | { type: "clear_session" };

const STORAGE_KEY = "rpg.save";

const initial: GameState = {
  player: null,
  party_id: null,
  estado: null,
  loading: false,
  lastError: null,
  lastNarrativa: null,
  lastResultado: null,
};

function loadSave(): PlayerSave | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function persistSave(p: PlayerSave | null) {
  if (typeof window === "undefined") return;
  if (p) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  else localStorage.removeItem(STORAGE_KEY);
}

function reducer(state: GameState, a: Action): GameState {
  switch (a.type) {
    case "set_player":
      persistSave(a.player);
      return { ...state, player: a.player, party_id: a.player.party_id };
    case "set_party":
      return { ...state, party_id: a.party_id };
    case "set_estado":
      return { ...state, estado: a.estado };
    case "set_loading":
      return { ...state, loading: a.loading };
    case "set_error":
      return { ...state, lastError: a.error };
    case "set_response":
      return {
        ...state,
        lastNarrativa: a.narrativa ?? state.lastNarrativa,
        lastResultado: a.resultado ?? state.lastResultado,
        estado: a.estado ?? state.estado,
      };
    case "clear_session":
      persistSave(null);
      return { ...initial };
  }
}

interface GameApi extends GameState {
  setPlayer: (p: PlayerSave) => void;
  setPartyOnly: (party_id: string) => void;
  clearSession: () => void;
  refresh: () => Promise<void>;
  acao: (acao: any) => Promise<void>;
  discursiva: (texto: string) => Promise<void>;
  mode: Mode | null;
}

const GameCtx = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (s) => {
    const save = loadSave();
    return save ? { ...s, player: save, party_id: save.party_id } : s;
  });

  const refresh = useCallback(async () => {
    if (state.player?.player_id) {
      const r = await rpcCenaAtual(state.player.player_id);
      if (r.ok) dispatch({ type: "set_estado", estado: r.data });
    } else if (state.party_id) {
      const r = await rpcEstadoParty(state.party_id);
      if (r.ok) dispatch({ type: "set_estado", estado: { modo: "lobby", party: r.data } });
    }
  }, [state.player?.player_id, state.party_id]);

  // Polling adaptativo: 2.5s no jogo, 2s no lobby.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!state.player?.player_id && !state.party_id) return;
    const tick = () => refreshRef.current();
    tick();
    const id = window.setInterval(tick, 2500);
    return () => window.clearInterval(id);
  }, [state.player?.player_id, state.party_id]);

  // Realtime: escuta mudancas nas tabelas-chave da party (best-effort).
  useEffect(() => {
    if (!state.party_id) return;
    const ch = supabase
      .channel(`rpg-party-${state.party_id}`)
      .on("postgres_changes", { event: "*", schema: "rpg", table: "parties", filter: `id=eq.${state.party_id}` }, () => refreshRef.current())
      .on("postgres_changes", { event: "*", schema: "rpg", table: "player_state", filter: `party_id=eq.${state.party_id}` }, () => refreshRef.current())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [state.party_id]);

  const acao = useCallback(
    async (acao: any) => {
      if (!state.player?.player_id) return;
      dispatch({ type: "set_loading", loading: true });
      dispatch({ type: "set_error", error: null });
      const r = await postAcao(state.player.player_id, acao);
      if (r.ok) {
        dispatch({
          type: "set_response",
          narrativa: r.data?.narrativa,
          resultado: r.data?.resultado,
          estado: r.data?.estado ?? undefined,
        });
        if (!r.data?.estado) await refreshRef.current();
      } else {
        dispatch({ type: "set_error", error: r.error });
        await refreshRef.current();
      }
      dispatch({ type: "set_loading", loading: false });
    },
    [state.player?.player_id],
  );

  const discursiva = useCallback(
    async (texto: string) => {
      if (!state.player?.player_id) return;
      dispatch({ type: "set_loading", loading: true });
      const r = await postDiscursiva(state.player.player_id, texto);
      if (r.ok) {
        dispatch({
          type: "set_response",
          narrativa: r.data?.narrativa,
          resultado: r.data?.resultado,
          estado: r.data?.estado ?? undefined,
        });
        if (!r.data?.estado) await refreshRef.current();
      } else {
        dispatch({ type: "set_error", error: r.error });
      }
      dispatch({ type: "set_loading", loading: false });
    },
    [state.player?.player_id],
  );

  const api = useMemo<GameApi>(
    () => ({
      ...state,
      mode: (state.estado?.modo as Mode) ?? null,
      setPlayer: (p) => dispatch({ type: "set_player", player: p }),
      setPartyOnly: (party_id) => dispatch({ type: "set_party", party_id }),
      clearSession: () => dispatch({ type: "clear_session" }),
      refresh,
      acao,
      discursiva,
    }),
    [state, refresh, acao, discursiva],
  );

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame fora do GameProvider");
  return ctx;
}
