// Telas do jogo: exploracao, mapa, cidade, quest, combate, derrota.
// Em exploracao/quest os jogadores DECLARAM acoes (round cooperativo).
// Na cidade as acoes sao pessoais e livres. Combate continua turn-based.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BedDouble, Clock, DoorOpen, Home, Loader2, MessageSquare, Shield, Swords, Zap } from "lucide-react";
import { useGame } from "../GameContext";
import { rpcEventoPendente, rpcMapa, rpcSairParty } from "../api";
import { EntityIcon, FichaButton, Hud, NarrativaPainel, NodeIcon, PartyBar } from "../ui";
import { ChoiceMenu, Cronica, useSayHello } from "../scene";

function meuTurno(estado: any) {
  return !!estado?.party?.meu_turno || estado?.party == null;
}
function TurnoBanner({ estado }: { estado: any }) {
  if (meuTurno(estado)) return null;
  const turno = (estado?.party?.herois ?? []).find((h: any) => h.player_id === estado?.party?.turno_de);
  return (
    <div className="rpg-card p-2 text-sm text-center" style={{ background: "hsl(38 60% 96%)" }}>
      Vez de <b>{turno?.nome ?? "outro jogador"}</b>... aguarde.
    </div>
  );
}

// Painel da rodada cooperativa (exploracao/quest).
function RoundPanel() {
  const { estado, declararAcao, jaDecidiNesteRound, loading } = useGame();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const round = estado?.round;
  if (!round?.aberto) return null;
  const deadlineMs = round.deadline ? new Date(round.deadline).getTime() : 0;
  const restante = deadlineMs ? Math.max(0, Math.ceil((deadlineMs - now) / 1000)) : null;
  const declaracoes: Array<{ player_id: string; nome: string; classe?: string; acao?: string }> =
    round.declaracoes_publicas ?? [];
  const aguardando: string[] = round.aguardando ?? [];
  return (
    <div className="rpg-card p-3 text-sm space-y-2" style={{ background: "hsl(38 60% 96%)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="rpg-title text-sm">Rodada em curso</div>
        {round.resolvido ? (
          <span className="rpg-ink-soft inline-flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> Narrando a rodada...</span>
        ) : restante != null ? (
          <span className="rpg-ink-soft inline-flex items-center gap-1"><Clock size={12}/> resolvendo em {restante}s</span>
        ) : null}
      </div>
      <ul className="space-y-1 text-xs">
        {declaracoes.map((d) => (
          <li key={`d-${d.player_id}`} className="px-2 py-1 rounded" style={{ background: "hsl(130 30% 28% / 0.18)" }}>
            <b>{d.nome}</b>
            {d.classe ? <span className="rpg-ink-soft"> · {d.classe}</span> : null}
            {d.acao ? <> — {d.acao}</> : null} <span className="rpg-gold">✓</span>
          </li>
        ))}
        {aguardando.map((n) => (
          <li key={`a-${n}`} className="px-2 py-1 rounded rpg-ink-soft" style={{ background: "hsl(28 22% 30% / 0.12)" }}>
            ⏳ {n} <span>— pensando...</span>
          </li>
        ))}
      </ul>
      {!jaDecidiNesteRound && !round.resolvido ? (
        <button className="rpg-btn text-xs" disabled={loading} onClick={() => declararAcao({ tipo: "passar" })}>Passar a vez</button>
      ) : null}
    </div>
  );
}

function DiscursivaInput({ mode = "round" }: { mode?: "round" | "livre" }) {
  const { discursiva, declararAcao, loading, jaDecidiNesteRound } = useGame();
  const [texto, setTexto] = useState("");
  const desabilitado = loading || (mode === "round" && jaDecidiNesteRound);
  return (
    <form
      className="flex gap-2 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = texto.trim();
        if (!t || desabilitado) return;
        if (mode === "round") declararAcao({ tipo: "discursiva", texto: t });
        else discursiva(t);
        setTexto("");
      }}
    >
      <input
        className="flex-1 px-3 py-2"
        placeholder={mode === "round"
          ? "Declarar acao... descreva (ex: arrombo a porta com o ombro)"
          : "Acao livre (ex: falar com o ferreiro)"}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={desabilitado}
      />
      <button type="submit" className="rpg-btn inline-flex items-center gap-1" disabled={desabilitado || !texto.trim()}>
        <MessageSquare size={14}/> {mode === "round" ? "Declarar" : "Enviar"}
      </button>
    </form>
  );
}

interface GameShellProps {
  children: React.ReactNode;
  showCardapio?: boolean;
  showRound?: boolean;
  showTurnoBanner?: boolean;
  freeMode?: "round" | "livre";
}

export function SessionBar() {
  const { player, clearSession } = useGame();
  const navigate = useNavigate();
  const sair = async () => {
    if (!player) return;
    if (!confirm("Sair da mesa? Voce perde este personagem.")) return;
    await rpcSairParty(player.player_id);
    clearSession();
    navigate("/rpg");
  };
  return (
    <div className="flex justify-end gap-2 text-xs">
      <button className="rpg-btn inline-flex items-center gap-1" onClick={() => navigate("/")}>
        <Home size={12}/> Voltar ao menu
      </button>
      <button className="rpg-btn inline-flex items-center gap-1" onClick={sair}>
        <DoorOpen size={12}/> Sair da mesa
      </button>
    </div>
  );
}

export function GameShell({
  children,
  showCardapio = true,
  showRound = true,
  showTurnoBanner = false,
  freeMode = "round",
}: GameShellProps) {
  const { estado, loading } = useGame();
  useSayHello();
  if (!estado) {
    return (
      <div className="rpg-ink-soft flex items-center gap-2">
        <Loader2 className="animate-spin" size={16}/> tecendo a cena...
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <SessionBar />
      <Hud />
      <PartyBar />
      {showTurnoBanner ? <TurnoBanner estado={estado} /> : null}
      <NarrativaPainel />
      {showRound ? <RoundPanel /> : null}
      <div className="flex gap-2 flex-wrap">
        <FichaButton />
        {estado?.dica ? (
          <div className="rpg-card px-3 py-1 text-xs">"{estado.dica}"</div>
        ) : null}
        {loading ? <span className="inline-flex items-center gap-1 text-xs rpg-ink-soft"><Loader2 size={12} className="animate-spin"/> resolvendo...</span> : null}
      </div>
      {showCardapio ? <ChoiceMenu /> : null}
      {children}
      <DiscursivaInput mode={freeMode} />
      <Cronica />
    </div>
  );
}

// ------------- Exploracao ------------
export function Exploration() {
  const { estado, acao, player } = useGame();
  const [evento, setEvento] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const roundAberto = !!estado?.round?.aberto;
  const moveBlocked = roundAberto;

  useEffect(() => {
    if (!player) return;
    rpcEventoPendente(player.player_id).then((r) => {
      if (r.ok) setEvento((r.data as any)?.evento ?? null);
    });
  }, [player, estado?.local?.nome]);

  return (
    <GameShell>
      {evento ? (
        <div className="rpg-card-scroll p-4 space-y-2">
          <div className="rpg-title text-base inline-flex items-center gap-1"><Zap size={16} className="rpg-gold"/> Evento</div>
          <p className="text-sm">{evento.narrativa}</p>
          <div className="flex gap-2">
            {evento.modo === "automatico" ? (
              <button className="rpg-btn" disabled={moveBlocked} onClick={() => { setEvento(null); acao({ tipo: "evento" }); }}>Continuar</button>
            ) : (
              <>
                <button className="rpg-btn rpg-btn-primary" disabled={moveBlocked} onClick={() => { setEvento(null); acao({ tipo: "evento", aceitar: true }); }}>Encarar</button>
                <button className="rpg-btn" disabled={moveBlocked} onClick={() => { setEvento(null); acao({ tipo: "evento", aceitar: false }); }}>Evitar</button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button className="rpg-btn" disabled={moveBlocked} onClick={() => acao({ tipo: "mover", direcao: "frente" })}>
          <ArrowRight size={14} className="inline"/> Avancar
        </button>
        <button className="rpg-btn" disabled={moveBlocked} onClick={() => acao({ tipo: "mover", direcao: "tras" })}>
          <ArrowLeft size={14} className="inline"/> Voltar
        </button>
        {estado?.local?.tipo === "quest" ? (
          <button className="rpg-btn rpg-btn-primary" disabled={moveBlocked} onClick={() => acao({ tipo: "entrar_quest" })}>
            Entrar na missao
          </button>
        ) : null}
        <button className="rpg-btn" disabled={moveBlocked} onClick={() => acao({ tipo: "descansar" })}>
          <BedDouble size={14} className="inline"/> Descansar
        </button>
        <button className="rpg-btn" onClick={() => setShowMap((s) => !s)}>{showMap ? "Esconder mapa" : "Mapa"}</button>
      </div>

      {showMap ? <MapTimeline onTravel={(node_id) => acao({ tipo: "viajar", node_id })} blocked={moveBlocked} /> : null}
    </GameShell>
  );
}

// ------------- Mapa timeline ------------
function MapTimeline({ onTravel, blocked }: { onTravel: (node_id: string) => void; blocked?: boolean }) {
  const { player } = useGame();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (!player) return;
    rpcMapa(player.player_id).then((r) => r.ok && setData(r.data));
  }, [player]);
  if (!data) return <div className="rpg-ink-soft text-sm flex items-center gap-2"><Loader2 size={12} className="animate-spin"/> abrindo mapa...</div>;
  return (
    <ol className="relative pl-10 py-3 space-y-3" style={{ borderLeft: "2px dashed hsl(41 70% 50% / 0.6)" }}>
      {(data.nos ?? []).map((n: any, i: number) => (
        <li key={n.id} className={`relative ${i % 2 ? "ml-6" : ""}`}>
          <div className="absolute -left-12 top-0">
            <NodeIcon tipo={n.tipo} locked={!n.liberado} atual={n.atual} limpo={n.limpo} />
          </div>
          <button
            className="rpg-card p-2 text-left text-sm w-full hover:opacity-90 disabled:cursor-not-allowed"
            disabled={!n.liberado || n.atual || blocked}
            onClick={() => onTravel(n.id)}
          >
            <div className="font-semibold">
              <EntityIcon dominio="lugar" chave={n.tipo} label={n.nome} />
              {n.atual ? <span className="rpg-gold ml-2 text-xs">(atual)</span> : null}
            </div>
            <div className="rpg-ink-soft text-xs">
              {n.tipo} · tier {n.tier ?? "?"} {n.objetivo ? `· ${n.objetivo}` : ""}
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}

// ------------- Cidade (hub de NPCs) ------------
export function City() {
  const { estado, acao, discursiva } = useGame();
  const npcs: any[] = estado?.npcs ?? [];
  const partyReady = estado?.painel_pronto ?? null;
  const todosProntos = estado?.todos_prontos ?? false;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = npcs.find((n) => n.id === selectedId) ?? null;
  const loja = selected?.loja ?? null;

  return (
    <GameShell showCardapio={false} showRound={false} freeMode="livre">
      <section className="rpg-card-scroll p-3">
        <h3 className="rpg-title text-base mb-2">Pessoas pela cidade</h3>
        {npcs.length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {npcs.map((n: any) => (
              <li key={n.id}>
                <button
                  className={`rpg-card p-2 text-sm w-full text-left hover:opacity-90 ${selectedId === n.id ? "rpg-pulse" : ""}`}
                  style={selectedId === n.id ? { borderColor: "hsl(41 70% 50%)" } : undefined}
                  onClick={() => setSelectedId((cur) => (cur === n.id ? null : n.id))}
                >
                  <div className="font-semibold"><EntityIcon dominio="npc" chave={n.role} label={n.name} /></div>
                  <div className="rpg-ink-soft text-xs">{n.role}{n.resumo ? ` — ${n.resumo}` : ""}</div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rpg-ink-soft text-sm">Sem ninguem por aqui.</div>
        )}
      </section>

      {selected ? (
        <section className="rpg-card-scroll p-3 space-y-3">
          <div>
            <div className="rpg-title text-base">
              <EntityIcon dominio="npc" chave={selected.role} label={selected.name} />
            </div>
            <div className="rpg-ink-soft text-xs">{selected.role}{selected.resumo ? ` — ${selected.resumo}` : ""}</div>
          </div>

          {Array.isArray(selected.interacoes) && selected.interacoes.length ? (
            <div>
              <div className="rpg-ink-soft text-xs uppercase tracking-wider mb-1">Conversa</div>
              <div className="flex flex-wrap gap-2">
                {selected.interacoes.map((it: any, i: number) => {
                  const label = typeof it === "string" ? it : (it.label ?? it.texto ?? "Interagir");
                  const texto = typeof it === "string" ? it : (it.texto ?? it.label ?? label);
                  return (
                    <button
                      key={i}
                      className="rpg-btn text-xs"
                      onClick={() => discursiva(`${selected.name}: ${texto}`)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {loja ? (
            <div>
              <div className="rpg-ink-soft text-xs uppercase tracking-wider mb-1">
                Loja{loja.nome ? ` · ${loja.nome}` : ""}
              </div>
              <ul className="space-y-2">
                {(loja.itens ?? []).map((it: any) => (
                  <li key={it.shop_item_id} className="flex items-center justify-between text-sm rpg-card p-2">
                    <span>
                      <EntityIcon dominio="item" chave={it.slot || it.nome} label={it.nome} />{" "}
                      <span className="rpg-ink-soft">· {it.preco}g</span>
                    </span>
                    <button
                      className="rpg-btn text-xs"
                      onClick={() => acao({ tipo: "comprar", shop_item_id: it.shop_item_id, npc_id: selected.id })}
                    >
                      Comprar
                    </button>
                  </li>
                ))}
                {!(loja.itens ?? []).length ? <li className="rpg-ink-soft text-sm">Estoque vazio.</li> : null}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="rpg-ink-soft text-xs italic">Clique em alguem para conversar ou comerciar.</div>
      )}

      <div className="rpg-card p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Pronto para partir:</span>
          <button className="rpg-btn rpg-btn-primary" onClick={() => acao({ tipo: "pronto_cidade", ready: true })}>Estou pronto</button>
          <button className="rpg-btn" onClick={() => acao({ tipo: "pronto_cidade", ready: false })}>Aguardar</button>
          {todosProntos ? (
            <button className="rpg-btn rpg-btn-primary" onClick={() => acao({ tipo: "mover", direcao: "frente" })}>Partir</button>
          ) : null}
        </div>
        {partyReady ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {partyReady.map((p: any) => (
              <li key={p.nome} className="text-xs px-2 py-0.5 rounded" style={{ background: p.pronto ? "hsl(130 30% 28%)" : "hsl(28 22% 30%)", color: "#fff" }}>
                {p.pronto ? "✓" : "·"} {p.nome}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </GameShell>
  );
}

// ------------- Quest / sala / puzzle ------------
export function Quest() {
  const { estado, acao } = useGame();
  const quest = estado?.quest ?? {};
  const sala = estado?.sala_atual ?? {};
  const acoesClasse = sala.acoes_classe ?? {};
  const [resposta, setResposta] = useState("");
  const [erros, setErros] = useState(0);
  const roundAberto = !!estado?.round?.aberto;
  const moveBlocked = roundAberto;

  return (
    <GameShell>
      <div className="rpg-card-scroll p-3">
        <div className="rpg-title text-lg">{quest.titulo} <span className="rpg-ink-soft text-sm">· tier {quest.tier ?? "?"}</span></div>
        <div className="rpg-ink-soft text-xs">Sala {sala.ordem} de {estado?.salas_total ?? "?"}</div>
        <div className="rpg-divider"/>
        <div className="font-semibold"><EntityIcon dominio="cena" chave={sala.tipo} label={sala.nome} /></div>
        <p className="text-sm mt-1 whitespace-pre-wrap">{sala.resumo}</p>
      </div>

      {sala.tipo === "puzzle" ? (
        <div className="rpg-card p-3 text-sm space-y-2">
          <input className="w-full px-3 py-2" value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Digite sua resposta" />
          <button
            className="rpg-btn rpg-btn-primary"
            disabled={!resposta.trim()}
            onClick={() => { acao({ tipo: "puzzle", resposta, veredito: null }); setErros((n) => n + 1); setResposta(""); }}
          >Tentar</button>
          {erros >= 2 ? <div className="text-xs rpg-ink-soft italic">"Um sussurro lembra: ...releia a sala com atencao."</div> : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {acoesClasse.ataca ? (
          <button className="rpg-btn" disabled={moveBlocked} onClick={() => acao({ tipo: "iniciar_combate" })}>
            <Swords size={14} className="inline"/> Atacar
          </button>
        ) : null}
        {acoesClasse.protege ? (
          <button className="rpg-btn" onClick={() => acao({ tipo: "combate", acao: { tipo: "defender" } })}>
            <Shield size={14} className="inline"/> Defender
          </button>
        ) : null}
        {acoesClasse.afeto_1 ? (
          <button className="rpg-btn" onClick={() => acao({ tipo: "teste", atributo: acoesClasse.afeto_1.atributo ?? "INT", dificuldade: acoesClasse.afeto_1.dificuldade ?? 12 })}>
            {acoesClasse.afeto_1.label ?? "Afeto 1"}
          </button>
        ) : null}
        {acoesClasse.afeto_2 ? (
          <button className="rpg-btn" onClick={() => acao({ tipo: "teste", atributo: acoesClasse.afeto_2.atributo ?? "DES", dificuldade: acoesClasse.afeto_2.dificuldade ?? 12 })}>
            {acoesClasse.afeto_2.label ?? "Afeto 2"}
          </button>
        ) : null}
        <button className="rpg-btn rpg-btn-primary" disabled={moveBlocked} onClick={() => acao({ tipo: "avancar_sala" })}>Avancar sala</button>
      </div>
    </GameShell>
  );
}

// ------------- Combate ------------
export function Combat() {
  const { estado, acao } = useGame();
  const isMine = meuTurno(estado);
  const combate = estado?.combate ?? {};
  const inimigos = combate.inimigos ?? [];
  const herois = combate.herois ?? estado?.party?.herois ?? [];
  const skills = estado?.skills ?? [];
  const [targeting, setTargeting] = useState<null | { tipo: "arma" | "skill"; skill?: string; alcance: number }>(null);

  const meuHeroi = herois.find((h: any) => h.player_id === estado?.eu?.id);
  const meuTile = meuHeroi?.tile ?? 0;

  const podeAlvejar = (alvoTile: number, alcance: number) => Math.abs(meuTile - alvoTile) <= alcance;

  const escolherAlvo = (idx: number) => {
    if (!targeting) return;
    const acaoEnv =
      targeting.tipo === "arma"
        ? { tipo: "combate", acao: { tipo: "atacar", metodo: "arma", alvo: idx } }
        : { tipo: "combate", acao: { tipo: "atacar", metodo: "skill", skill: targeting.skill, alvo: idx } };
    setTargeting(null);
    acao(acaoEnv);
  };

  return (
    <GameShell showCardapio={false} showRound={false} showTurnoBanner>
      <div className="rpg-card-scroll p-3">
        <h3 className="rpg-title text-base mb-2">Round {combate.round ?? "?"}</h3>
        {[0, 1, 2].map((tile) => (
          <div key={tile} className="grid grid-cols-2 gap-2 py-2 border-b last:border-0" style={{ borderColor: "hsl(41 70% 50% / 0.2)" }}>
            <div className="space-y-1">
              <div className="rpg-ink-soft text-xs uppercase">Tile {tile === 0 ? "frente" : tile === 1 ? "meio" : "fundo"} · herois</div>
              {herois.filter((h: any) => h.tile === tile).map((h: any) => (
                <div key={h.player_id} className={`text-sm ${h.player_id === combate.turno_de ? "rpg-pulse" : ""}`}>
                  <b>{h.nome}</b> <span className="rpg-ink-soft">· {h.hp}/{h.max_hp}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="rpg-ink-soft text-xs uppercase">Inimigos</div>
              {inimigos.filter((i: any) => i.tile === tile).map((i: any) => {
                const alcancavel = !!targeting && podeAlvejar(i.tile, targeting.alcance);
                return (
                  <button
                    key={i.idx}
                    disabled={!targeting || !alcancavel}
                    onClick={() => escolherAlvo(i.idx)}
                    className={`block w-full text-left rpg-card p-1 text-sm ${alcancavel ? "rpg-pulse" : ""}`}
                    style={{ opacity: targeting && !alcancavel ? 0.4 : 1 }}
                  >
                    <EntityIcon dominio="mob" chave={i.nome} label={i.nome} /> <span className="rpg-ink-soft">· {i.hp}/{i.max_hp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {targeting ? (
        <div className="rpg-card p-2 text-sm flex items-center justify-between">
          <span>Selecione um alvo em alcance...</span>
          <button className="rpg-btn text-xs" onClick={() => setTargeting(null)}>Cancelar</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button className="rpg-btn" disabled={!isMine} onClick={() => setTargeting({ tipo: "arma", alcance: estado?.eu?.classe === "arqueiro" ? 2 : 1 })}>
            <Swords size={14} className="inline"/> Atacar
          </button>
          <button className="rpg-btn" disabled={!isMine} onClick={() => acao({ tipo: "combate", acao: { tipo: "defender" } })}>
            <Shield size={14} className="inline"/> Defender
          </button>
          <button className="rpg-btn" disabled={!isMine} onClick={() => acao({ tipo: "combate", acao: { tipo: "fugir" } })}>
            Fugir
          </button>
          <button className="rpg-btn" disabled={!isMine} onClick={() => {
            const tile = meuTile < 2 ? meuTile + 1 : meuTile - 1;
            acao({ tipo: "combate", acao: { tipo: "mover", tile } });
          }}>Mover tile</button>
          {skills.map((s: any) => (
            <button
              key={s.name}
              className="rpg-btn col-span-2"
              disabled={!isMine || (estado?.eu?.mp ?? 0) < (s.mana_cost ?? 0)}
              onClick={() => {
                if (s.target === "self" || s.target === "area") {
                  acao({ tipo: "combate", acao: { tipo: "atacar", metodo: "skill", skill: s.name } });
                } else {
                  setTargeting({ tipo: "skill", skill: s.name, alcance: s.effect?.alcance ?? 1 });
                }
              }}
            >
              {s.name} <span className="rpg-ink-soft text-xs">({s.mana_cost ?? 0} MP)</span>
            </button>
          ))}
        </div>
      )}
    </GameShell>
  );
}

// ------------- Derrota / failsafe estalagem ------------
export function Defeat() {
  const { lastNarrativa, refresh } = useGame();
  return (
    <GameShell showCardapio={false} showRound={false}>
      <div className="rpg-card-scroll p-6 text-center">
        <h2 className="rpg-title text-2xl mb-2">Voces despertam feridos mas vivos</h2>
        <p>{lastNarrativa ?? "A taverna esta quieta. Alguem cuidou de voces na ultima cidade."}</p>
        <button className="rpg-btn rpg-btn-primary mt-4" onClick={() => refresh()}>Retomar</button>
      </div>
    </GameShell>
  );
}
