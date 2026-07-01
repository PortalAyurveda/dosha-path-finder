// Store central do RPG.
// - identidade UUID em localStorage
// - cache: cena_atual, estado_party, skills_da_classe (por classe)
// - polling adaptativo (cena in-game ~1.5s, estado_party no lobby)
// - toasts
// - narração log (mestre + jogadores)
// - cache de skills por classe (skills_da_classe)
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getOrCreateUserId,
  rpg,
  store,
  STORAGE,
  translateError,
  webhookAcao,
  webhookCena,
  webhookNpc,
} from "./api";
import type { Cena, LogEntry, Skill } from "./types";

type Toast = { id: string; message: string; kind: "info" | "success" | "error" };

interface RpgStore {
  userId: string;
  playerId: string | null;
  partyId: string | null;
  joinCode: string | null;
  cena: Cena | null;
  partyState: any | null;
  loading: boolean;
  toasts: Toast[];
  log: LogEntry[];
  skillsCache: Record<string, Record<string, Skill>>;
  overlayObject: null | { nome: string; glyph?: string; narrativa: string };
  overlayRevelacao: null | { texto: string };

  setPlayer: (playerId: string, partyId: string, joinCode?: string) => Promise<void>;
  setPartyOnly: (partyId: string, joinCode?: string) => void;
  clearSession: () => void;
  refreshCena: () => Promise<void>;
  refreshParty: () => Promise<void>;

  acaoWebhook: (acao: any) => Promise<any>;
  acaoRpc: (fn: string, args: Record<string, any>) => Promise<any>;
  npcInteract: (npc_id: string, interacao_id: string) => Promise<any>;

  toast: (msg: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;

  pushLog: (entry: Omit<LogEntry, "id" | "ts">) => void;

  loadSkillsForClass: (classe: string) => Promise<void>;
  getSkill: (classe: string, name: string) => Skill | undefined;
}

const Ctx = createContext<RpgStore | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function RpgProvider({ children }: { children: React.ReactNode }) {
  const userId = useMemo(() => getOrCreateUserId(), []);
  const [playerId, setPlayerId] = useState<string | null>(() => store.get(STORAGE.playerId));
  const [partyId, setPartyId] = useState<string | null>(() => store.get(STORAGE.partyId));
  const [joinCode, setJoinCode] = useState<string | null>(() => store.get(STORAGE.joinCode));
  const [cena, setCena] = useState<Cena | null>(null);
  const [partyState, setPartyState] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [skillsCache, setSkillsCache] = useState<Record<string, Record<string, Skill>>>({});
  const [overlayObject, setOverlayObject] = useState<RpgStore["overlayObject"]>(null);
  const [overlayRevelacao, setOverlayRevelacao] = useState<RpgStore["overlayRevelacao"]>(null);

  const toast = useCallback((message: string, kind: Toast["kind"] = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushLog = useCallback((entry: Omit<LogEntry, "id" | "ts">) => {
    setLog((l) => [...l.slice(-80), { id: uid(), ts: Date.now(), ...entry }]);
  }, []);

  const refreshCena = useCallback(async () => {
    if (!playerId) return;
    try {
      const data = await rpg<Cena>("cena_atual", { p_player_id: playerId });
      if ((data as any)?.ok === false) {
        const erro = (data as any).erro || "";
        if (/nao\s+existe|orphan/i.test(erro)) {
          store.set(STORAGE.playerId, null);
          store.set(STORAGE.partyId, null);
          store.set(STORAGE.joinCode, null);
          setPlayerId(null);
          setPartyId(null);
          setJoinCode(null);
          setCena(null);
        }
        return;
      }
      setCena(data);
    } catch {
      // silencioso — próximo tick tenta de novo
    }
  }, [playerId]);

  const refreshParty = useCallback(async () => {
    if (!partyId) return;
    try {
      const data = await rpg<any>("estado_party", { p_party_id: partyId });
      setPartyState(data);
    } catch {}
  }, [partyId]);

  // Polling adaptativo
  const refreshCenaRef = useRef(refreshCena);
  const refreshPartyRef = useRef(refreshParty);
  refreshCenaRef.current = refreshCena;
  refreshPartyRef.current = refreshParty;

  useEffect(() => {
    let visible = true;
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (!document.hidden) await refreshCenaRef.current();
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [playerId]);

  useEffect(() => {
    if (!partyId || playerId) return; // enquanto sem player, polling de estado_party (lobby)
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (!document.hidden) await refreshPartyRef.current();
    };
    tick();
    const id = window.setInterval(tick, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [partyId, playerId]);

  // Reconexão: se há partyId sem playerId (aluno acabou de entrar no lobby),
  // poll estado_party. Se há playerId, poll cena_atual.

  const setPlayer = useCallback(
    async (pid: string, party: string, code?: string) => {
      store.set(STORAGE.playerId, pid);
      store.set(STORAGE.partyId, party);
      if (code) store.set(STORAGE.joinCode, code);
      setPlayerId(pid);
      setPartyId(party);
      if (code) setJoinCode(code);
      await refreshCena();
    },
    [refreshCena],
  );

  const setPartyOnly = useCallback((party: string, code?: string) => {
    store.set(STORAGE.partyId, party);
    if (code) store.set(STORAGE.joinCode, code);
    setPartyId(party);
    if (code) setJoinCode(code);
  }, []);

  const clearSession = useCallback(() => {
    store.set(STORAGE.playerId, null);
    store.set(STORAGE.partyId, null);
    store.set(STORAGE.joinCode, null);
    setPlayerId(null);
    setPartyId(null);
    setJoinCode(null);
    setCena(null);
    setPartyState(null);
    setLog([]);
  }, []);

  const handleResp = useCallback(
    (resp: any) => {
      if (!resp) return;
      if (resp.ok === false) {
        const msg = translateError(resp.erro || resp.error);
        toast(msg, "error");
        return;
      }
      if (typeof resp.narrativa === "string" && resp.narrativa.trim()) {
        pushLog({ quem: "Mestre", texto: resp.narrativa, tipo: "narrativa" });
      }
      if (resp.estado) setCena(resp.estado);
      // beat de objeto
      const obj = resp.resultado?.objeto_entregue || resp.objeto_entregue;
      if (obj?.nome) {
        setOverlayObject({
          nome: obj.nome,
          glyph: obj.glyph,
          narrativa: resp.narrativa || "Você segura em mãos algo que não deveria existir.",
        });
      }
      if (resp.revelacao_cena) {
        setOverlayRevelacao({ texto: String(resp.revelacao_cena) });
      }
    },
    [toast, pushLog],
  );

  const acaoWebhook = useCallback(
    async (acao: any) => {
      if (!playerId) return;
      setLoading(true);
      const resp = await webhookAcao(playerId, acao);
      handleResp(resp);
      // Sempre re-fetch pra estado autoritativo
      await refreshCena();
      setLoading(false);
      return resp;
    },
    [playerId, handleResp, refreshCena],
  );

  const acaoRpc = useCallback(
    async (fn: string, args: Record<string, any>) => {
      setLoading(true);
      try {
        const data = await rpg<any>(fn, args);
        if (data?.ok === false) {
          toast(translateError(data.erro || data.error), "error");
        }
        await refreshCena();
        return data;
      } catch (e: any) {
        toast(translateError(e?.message), "error");
      } finally {
        setLoading(false);
      }
    },
    [refreshCena, toast],
  );

  const npcInteract = useCallback(
    async (npc_id: string, interacao_id: string) => {
      if (!playerId) return;
      setLoading(true);
      const resp = await webhookNpc(playerId, npc_id, interacao_id);
      handleResp(resp);
      await refreshCena();
      setLoading(false);
      return resp;
    },
    [playerId, handleResp, refreshCena],
  );

  const loadSkillsForClass = useCallback(async (classe: string) => {
    if (skillsCache[classe]) return;
    try {
      const data = await rpg<Skill[] | { ok: false }>("skills_da_classe", { p_classe: classe });
      if (Array.isArray(data)) {
        const map: Record<string, Skill> = {};
        for (const s of data) map[s.name] = s;
        setSkillsCache((c) => ({ ...c, [classe]: map }));
      }
    } catch {}
  }, [skillsCache]);

  const getSkill = useCallback(
    (classe: string, name: string) => skillsCache[classe]?.[name],
    [skillsCache],
  );

  // Autoload skills quando entrar em cena com uma classe
  useEffect(() => {
    const c = cena?.eu?.classe;
    if (c && !skillsCache[c]) loadSkillsForClass(c);
  }, [cena?.eu?.classe, skillsCache, loadSkillsForClass]);

  const value: RpgStore = {
    userId,
    playerId,
    partyId,
    joinCode,
    cena,
    partyState,
    loading,
    toasts,
    log,
    skillsCache,
    overlayObject,
    overlayRevelacao,
    setPlayer,
    setPartyOnly,
    clearSession,
    refreshCena,
    refreshParty,
    acaoWebhook,
    acaoRpc,
    npcInteract,
    toast,
    dismissToast,
    pushLog,
    loadSkillsForClass,
    getSkill,
  };

  // limpar overlays externamente
  (value as any)._clearOverlayObject = () => setOverlayObject(null);
  (value as any)._clearOverlayRevelacao = () => setOverlayRevelacao(null);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRpg(): RpgStore & {
  _clearOverlayObject: () => void;
  _clearOverlayRevelacao: () => void;
} {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRpg fora do RpgProvider");
  return ctx as any;
}
