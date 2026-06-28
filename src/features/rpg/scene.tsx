// Componentes compartilhados do loop de jogo:
// - useSayHello: dispara postCena 1x por cena (abre a narracao da cena nova).
// - ChoiceMenu: renderiza as "esperadas" da cena (cardapio_discursiva) como botoes.
// - Cronica: painel recolhivel com chatlog da mesa.
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, ScrollText } from "lucide-react";
import { postCena, rpgRpc } from "./api";
import { useGame } from "./GameContext";

function sceneKey(estado: any, mode: string | null) {
  if (!estado) return "";
  return [
    mode ?? "",
    estado?.local?.id ?? estado?.local?.nome ?? "",
    estado?.sala_atual?.id ?? estado?.sala_atual?.ordem ?? "",
    estado?.quest?.id ?? "",
  ].join("|");
}

// 1x por cena, dispara o narrador para abrir a cena.
export function useSayHello() {
  const { player, estado, mode } = useGame();
  const sentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!player?.player_id) return;
    if (!estado) return;
    if (!mode || mode === "lobby") return;
    const key = sceneKey(estado, mode);
    if (!key) return;
    if (sentRef.current === key) return;
    sentRef.current = key;
    postCena(player.player_id).catch(() => {
      // se falhar, libera para nova tentativa na proxima troca
      sentRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.player_id, mode, estado?.local?.id, estado?.local?.nome, estado?.sala_atual?.id, estado?.sala_atual?.ordem]);
}

type Esperada = { id: string; intencao: string; dimensao?: string };

function meuTurno(estado: any) {
  return !!estado?.party?.meu_turno || estado?.party == null;
}

const DIM_LABEL: Record<string, string> = {
  frente: "linha de frente",
  meio: "meio",
  fundo: "fundo / apoio",
  acoes: "acoes",
};

// Cardapio de acoes da cena (ja filtrado pela classe do jogador no backend).
export function ChoiceMenu() {
  const { player, estado, acao, loading } = useGame();
  const [data, setData] = useState<{ esperadas?: Esperada[] } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const key = sceneKey(estado, (estado?.modo as string) ?? null);

  useEffect(() => {
    if (!player?.player_id) return;
    let alive = true;
    setCarregando(true);
    rpgRpc<any>("cardapio_discursiva", { p_player_id: player.player_id }).then((r) => {
      if (!alive) return;
      if (r.ok) setData(r.data ?? null);
      setCarregando(false);
    });
    return () => {
      alive = false;
    };
  }, [player?.player_id, key]);

  const esperadas = (data?.esperadas ?? []) as Esperada[];
  if (!esperadas.length) {
    if (carregando) {
      return (
        <div className="rpg-ink-soft text-xs flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> lendo o ambiente...
        </div>
      );
    }
    return null;
  }

  const grupos = new Map<string, Esperada[]>();
  for (const e of esperadas) {
    const dim = e.dimensao || "acoes";
    if (!grupos.has(dim)) grupos.set(dim, []);
    grupos.get(dim)!.push(e);
  }

  const podeAgir = meuTurno(estado);

  return (
    <div className="rpg-card p-3 space-y-2">
      <div className="rpg-title text-sm">Escolhas</div>
      {[...grupos.entries()].map(([dim, lista]) => (
        <div key={dim}>
          {grupos.size > 1 ? (
            <div className="rpg-ink-soft text-xs uppercase tracking-wider mb-1">{DIM_LABEL[dim] ?? dim}</div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {lista.map((e) => (
              <button
                key={e.id}
                className="rpg-btn text-sm"
                disabled={loading || !podeAgir}
                onClick={() => acao({ tipo: "discursiva_controlada", esperada_id: e.id })}
                title={e.dimensao ?? undefined}
              >
                {e.intencao}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Cronica da mesa: chatlog, recolhivel, com layout estilo conversa.
export function Cronica() {
  const { player, estado } = useGame();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const party_id = player?.party_id ?? estado?.party?.id ?? null;

  useEffect(() => {
    if (!party_id) return;
    let alive = true;
    const tick = async () => {
      const r = await rpgRpc<any>("chatlog", { p_party_id: party_id });
      if (!alive) return;
      if (r.ok) {
        const raw = r.data;
        const arr = Array.isArray(raw) ? raw : (raw?.entradas ?? raw?.logs ?? raw?.itens ?? []);
        setEntradas(Array.isArray(arr) ? arr : []);
      }
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [party_id]);

  const meuId = player?.player_id;

  return (
    <div className="rpg-card">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="inline-flex items-center gap-2">
          <ScrollText size={14} /> Cronica da mesa
          <span className="rpg-ink-soft text-xs">· {entradas.length}</span>
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open ? (
        <ol className="px-3 pb-3 space-y-2 max-h-80 overflow-y-auto">
          {entradas.map((e: any, i: number) => {
            const tipo = e.tipo || (e.player_id ? (e.player_id === meuId ? "eu" : "parceiro") : "narrador");
            const isEu = tipo === "eu" || e.player_id === meuId;
            const isNarr = tipo === "narrador" || tipo === "llm" || (!e.player_id && tipo !== "parceiro");
            const align = isNarr ? "items-center text-center" : isEu ? "items-end text-right" : "items-start text-left";
            const bg = isNarr
              ? "hsl(41 70% 50% / 0.14)"
              : isEu
                ? "hsl(130 30% 28% / 0.14)"
                : "hsl(348 55% 32% / 0.10)";
            const autor = isNarr
              ? "Narrador"
              : `${e.nome ?? "Aventureiro"}${e.classe ? ` · ${e.classe}` : ""}`;
            const acaoLabel = e.acao_label ?? e.intencao ?? (typeof e.acao === "string" ? e.acao : null);
            const texto = e.narrativa ?? e.texto ?? "";
            return (
              <li key={e.id ?? i} className={`flex flex-col ${align}`}>
                <div className="text-[11px] rpg-ink-soft">
                  {autor}
                  {acaoLabel ? ` · ${acaoLabel}` : ""}
                </div>
                <div
                  className={`text-sm px-3 py-1 rounded mt-0.5 max-w-[85%] ${isNarr ? "italic" : ""}`}
                  style={{ background: bg }}
                >
                  {texto || (acaoLabel ?? "")}
                </div>
              </li>
            );
          })}
          {!entradas.length ? (
            <li className="rpg-ink-soft text-xs italic">Sem registros ainda.</li>
          ) : null}
        </ol>
      ) : null}
    </div>
  );
}
