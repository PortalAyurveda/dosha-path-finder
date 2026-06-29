// Store central do jogo. Context + useReducer + polling de cena_atual.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { rpcCenaAtual, rpcEstadoParty, postAcao, postDiscursiva, rpcDeclararAcao, postRound } from "./api";

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
  jaDecidiNesteRound: boolean;
}

type Action =
  | { type: "set_player"; player: PlayerSave }
  | { type: "set_party"; party_id: string }
  | { type: "set_estado"; estado: Estado }
  | { type: "set_loading"; loading: boolean }
  | { type: "set_error"; error: string | null }
  | { type: "set_response"; narrativa?: string; resultado?: any; estado?: Estado }
  | { type: "set_decidi"; v: boolean }
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
  jaDecidiNesteRound: false,
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
    case "set_decidi":
      return { ...state, jaDecidiNesteRound: a.v };
    case "clear_session":
      persistSave(null);
      return { ...initial };
  }
}

interface GameApi extends GameState {
  setPlayer: (p: PlayerSave) => void;
  setPartyOnly: (party_id: string) => void;
  clearSession: () => void;
  setSceneNarrativa: (text: string) => void;
  refresh: () => Promise<void>;
  acao: (acao: any) => Promise<void>;
  discursiva: (texto: string) => Promise<void>;
  declararAcao: (acao: any) => Promise<void>;
  dispararRound: () => Promise<void>;
  mode: Mode | null;
}

const GameCtx = createContext<GameApi | null>(null);

function isOrphanError(msg?: string | null) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return /(player|jogador|party|mesa).*(nao existe|inexistente|not found|nao encontrad)/.test(m);
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (s) => {
    const save = loadSave();
    return save ? { ...s, player: save, party_id: save.party_id } : s;
  });

  const refresh = useCallback(async () => {
    if (state.player?.player_id) {
      const r = await rpcCenaAtual(state.player.player_id);
      if (r.ok) dispatch({ type: "set_estado", estado: r.data });
      else if (isOrphanError(r.error)) dispatch({ type: "clear_session" });
    } else if (state.party_id) {
      const r = await rpcEstadoParty(state.party_id);
      if (r.ok) dispatch({ type: "set_estado", estado: { modo: "lobby", party: r.data } });
      else if (isOrphanError(r.error)) dispatch({ type: "clear_session" });
    }
  }, [state.player?.player_id, state.party_id]);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!state.player?.player_id && !state.party_id) return;
    const tick = () => refreshRef.current();
    tick();
    const id = window.setInterval(tick, 2500);
    return () => window.clearInterval(id);
  }, [state.player?.player_id, state.party_id]);

  const acao = useCallback(
    async (acao: any) => {
      if (!state.player?.player_id) return;
      dispatch({ type: "set_loading", loading: true });
      dispatch({ type: "set_error", error: null });
      const r: any = await postAcao(state.player.player_id, acao);
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
      const r: any = await postDiscursiva(state.player.player_id, texto);
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

  // ----- ROUND COOPERATIVO -----
  const roundFiringRef = useRef(false);

  const dispararRound = useCallback(async () => {
    if (roundFiringRef.current) return;
    const pid = state.party_id;
    if (!pid) return;
    roundFiringRef.current = true;
    try {
      const r: any = await postRound(pid);
      if (r.ok && r.data?.narrativa) {
        dispatch({
          type: "set_response",
          narrativa: r.data.narrativa,
          resultado: r.data.fatos,
          estado: r.data.estado ?? undefined,
        });
      }
    } finally {
      roundFiringRef.current = false;
      await refreshRef.current();
    }
  }, [state.party_id]);

  const declararAcao = useCallback(
    async (a: any) => {
      if (!state.player?.player_id) return;
      dispatch({ type: "set_loading", loading: true });
      dispatch({ type: "set_error", error: null });
      const r: any = await rpcDeclararAcao(state.player.player_id, a);
      if (r.ok) {
        dispatch({ type: "set_decidi", v: true });
        if (r.data?.round_completo) {
          // dispara sem aguardar
          dispararRound();
        }
      } else {
        dispatch({ type: "set_error", error: r.error });
      }
      dispatch({ type: "set_loading", loading: false });
      await refreshRef.current();
    },
    [state.player?.player_id, dispararRound],
  );

  // Auto-fire round quando completo ou deadline estourou; reset jaDecidi quando fecha.
  const round = state.estado?.round;
  const roundAberto = round?.aberto ?? false;
  const roundCompleto = round?.round_completo ?? false;
  const roundResolvido = round?.resolvido ?? false;
  const roundDeadline = round?.deadline ?? null;
  useEffect(() => {
    if (!roundAberto) {
      if (state.jaDecidiNesteRound) dispatch({ type: "set_decidi", v: false });
      return;
    }
    if (roundResolvido) return;
    const deadlineMs = roundDeadline ? new Date(roundDeadline).getTime() : 0;
    if (roundCompleto || (deadlineMs && Date.now() > deadlineMs)) {
      dispararRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundAberto, roundCompleto, roundResolvido, roundDeadline]);

  const setPlayer = useCallback((p: PlayerSave) => dispatch({ type: "set_player", player: p }), []);
  const setPartyOnly = useCallback((party_id: string) => dispatch({ type: "set_party", party_id }), []);
  const clearSession = useCallback(() => dispatch({ type: "clear_session" }), []);
  const setSceneNarrativa = useCallback((t: string) => dispatch({ type: "set_response", narrativa: t }), []);

  const api = useMemo<GameApi>(
    () => ({
      ...state,
      mode: (state.estado?.modo as Mode) ?? null,
      setPlayer,
      setPartyOnly,
      clearSession,
      setSceneNarrativa,
      refresh,
      acao,
      discursiva,
      declararAcao,
      dispararRound,
    }),
    [state, refresh, acao, discursiva, declararAcao, dispararRound, setPlayer, setPartyOnly, clearSession, setSceneNarrativa],
  );

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame fora do GameProvider");
  return ctx;
}
