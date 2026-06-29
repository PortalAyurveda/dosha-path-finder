// Componentes compartilhados do loop de jogo:
// - useSayHello: dispara postCena 1x por cena e captura a narrativa de abertura.
// - ChoiceMenu: renderiza as "esperadas" da cena (cardapio_discursiva) com
//   chance/atributo/rotulo para testes e tag "sem risco" para acoes livres.
// - Cronica: painel recolhivel com chatlog da mesa (dado + banda + acao livre).
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, ScrollText } from "lucide-react";
import { postCena, rpgRpc } from "./api";
import { useGame } from "./GameContext";
import { BandBadge, Dice } from "./ui";

function sceneKey(estado: any, mode: string | null) {
  if (!estado) return "";
  return [
    mode ?? "",
    estado?.local?.id ?? estado?.local?.nome ?? "",
    estado?.sala_atual?.id ?? estado?.sala_atual?.ordem ?? "",
    estado?.quest?.id ?? "",
  ].join("|");
}

// 1x por cena, dispara o narrador para abrir a cena e captura a narrativa.
export function useSayHello() {
  const { player, estado, mode, setSceneNarrativa } = useGame();
  const sentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!player?.player_id) return;
    if (!estado) return;
    if (!mode || mode === "lobby") return;
    const key = sceneKey(estado, mode);
    if (!key) return;
    if (sentRef.current === key) return;
    sentRef.current = key;
    postCena(player.player_id)
      .then((r: any) => {
        if (r?.ok && r.data?.narrativa) setSceneNarrativa(r.data.narrativa);
      })
      .catch(() => {
        // libera para nova tentativa
        sentRef.current = null;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.player_id, mode, estado?.local?.id, estado?.local?.nome, estado?.sala_atual?.id, estado?.sala_atual?.ordem]);
}

type Esperada = {
  id: string;
  intencao: string;
  dimensao?: string;
  rola?: boolean;
  chance?: number | null;
  rotulo?: string;
  atributo?: string;
  dificuldade?: number;
};

const DIM_FALLBACK: Record<string, string> = {
  frente: "linha de frente",
  meio: "meio",
  fundo: "fundo / apoio",
  acoes: "acoes",
};

const ROTULO_STYLE: Record<string, { bg: string; fg: string }> = {
  "Favoravel": { bg: "hsl(130 35% 32%)", fg: "#fff" },
  "Incerto": { bg: "hsl(46 75% 50%)", fg: "#1a1208" },
  "Arriscado": { bg: "hsl(24 75% 45%)", fg: "#fff" },
  "Quase impossivel": { bg: "hsl(348 60% 38%)", fg: "#fff" },
};

// Cardapio de acoes da cena (ja filtrado pela classe do jogador no backend).
export function ChoiceMenu() {
  const { player, estado, declararAcao, loading, jaDecidiNesteRound } = useGame();
  const [data, setData] = useState<{ esperadas?: Esperada[]; cena?: any } | null>(null);
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
  const cena = data?.cena;
  const dimLabels: Record<string, string> = { ...DIM_FALLBACK, ...(cena?.dimensoes ?? {}) };

  if (!esperadas.length && !cena?.descricao) {
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

  const desabilitado = loading || jaDecidiNesteRound;

  return (
    <div className="space-y-2">
      {cena?.descricao ? (
        <div className="rpg-card-scroll p-3 text-sm leading-relaxed whitespace-pre-wrap italic">
          {cena.descricao}
        </div>
      ) : null}
      {esperadas.length ? (
        <div className="rpg-card p-3 space-y-2">
          <div className="rpg-title text-sm flex items-center justify-between">
            <span>Escolhas</span>
            {jaDecidiNesteRound ? (
              <span className="rpg-ink-soft text-xs italic">escolhido — aguardando a mesa</span>
            ) : null}
          </div>
          {[...grupos.entries()].map(([dim, lista]) => (
            <div key={dim}>
              {grupos.size > 1 ? (
                <div className="rpg-ink-soft text-xs uppercase tracking-wider mb-1">{dimLabels[dim] ?? dim}</div>
              ) : null}
              <div className="flex flex-col gap-2">
                {lista.map((e) => {
                  const livre = e.rola === false || e.rotulo === "Automatico";
                  const style = e.rotulo ? ROTULO_STYLE[e.rotulo] : undefined;
                  return (
                    <button
                      key={e.id}
                      className="rpg-btn text-sm text-left flex items-center justify-between gap-3"
                      disabled={desabilitado}
                      onClick={() =>
                        declararAcao({ tipo: "discursiva_controlada", esperada_id: e.id, texto: e.intencao })
                      }
                      title={e.atributo ? `${e.atributo} CD ${e.dificuldade ?? "?"}` : undefined}
                      style={jaDecidiNesteRound ? { opacity: 0.55 } : undefined}
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{livre ? "👁" : "🎲"}</span>
                        <span>{e.intencao}</span>
                      </span>
                      {livre ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={{ background: "hsl(210 14% 88%)", color: "hsl(210 18% 30%)" }}
                        >
                          sem risco
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {typeof e.chance === "number" ? (
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded"
                              style={style ? { background: style.bg, color: style.fg } : { background: "hsl(28 22% 30%)", color: "#fff" }}
                              title={e.rotulo}
                            >
                              {e.chance}%
                            </span>
                          ) : null}
                          {e.atributo ? (
                            <span className="text-[10px] rpg-ink-soft uppercase">{e.atributo}</span>
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
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
            const dado = e.dado;
            const livre = e.resultado?.livre === true || e.resultado?.banda === "auto";
            const banda = e.resultado?.banda;
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
                {!isNarr && (livre || typeof dado === "number" || banda) ? (
                  <div className={`mt-1 flex items-center gap-2 ${isEu ? "justify-end" : "justify-start"}`}>
                    {livre ? (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={{ background: "hsl(210 14% 88%)", color: "hsl(210 18% 30%)" }}
                      >
                        acao livre
                      </span>
                    ) : (
                      <>
                        {typeof dado === "number" ? (
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <span aria-hidden>🎲</span>
                            <Dice value={dado} />
                          </span>
                        ) : null}
                        {banda ? <BandBadge banda={banda} /> : null}
                      </>
                    )}
                  </div>
                ) : null}
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
