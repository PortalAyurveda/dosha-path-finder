// Telas não-combate: Landing, Criação de personagem, Lobby, Exploração, Cidade, Quest.
import { useEffect, useMemo, useState } from "react";
import { rpg, store, STORAGE, translateError } from "./api";
import { useRpg } from "./store";
import type { Cena, Skill } from "./types";

/* ================= Landing ================= */
export function LandingScreen() {
  const { userId, setPlayer, setPartyOnly, toast } = useRpg();
  const [mode, setMode] = useState<"menu" | "criar" | "entrar">("menu");
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [partyReadyId, setPartyReadyId] = useState<string | null>(null);
  const [partyReadyCode, setPartyReadyCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await rpg<any[]>("campanhas_jogaveis", {});
        setCampanhas(Array.isArray(d) ? d : []);
      } catch {}
    })();
  }, []);

  async function criarMesa(campaign_id: string) {
    setLoading(true);
    try {
      const d = await rpg<any>("criar_party", {
        p_campaign_id: campaign_id,
        p_host_user_id: userId,
        p_max: 4,
        p_is_public: true,
      });
      if (d?.ok === false) {
        toast(translateError(d.erro), "error");
        return;
      }
      setPartyOnly(d.party_id, d.join_code);
      setPartyReadyId(d.party_id);
      setPartyReadyCode(d.join_code);
    } finally {
      setLoading(false);
    }
  }

  async function entrarMesa() {
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const d = await rpg<any>("entrar_party", { p_join_code: codigo.trim().toUpperCase() });
      if (d?.ok === false) {
        toast(translateError(d.erro || d.error), "error");
        return;
      }
      setPartyOnly(d.party_id, codigo.trim().toUpperCase());
      setPartyReadyId(d.party_id);
      setPartyReadyCode(codigo.trim().toUpperCase());
    } finally {
      setLoading(false);
    }
  }

  if (partyReadyId) {
    return <CreateCharacterScreen partyId={partyReadyId} joinCode={partyReadyCode} />;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="rpg-panel p-6 max-w-md w-full">
        <h1 className="rpg-narration text-2xl mb-1 text-center">Portal Ayurveda</h1>
        <div className="rpg-system text-xs text-center opacity-70 mb-6">um RPG narrado</div>

        {mode === "menu" && (
          <div className="space-y-3">
            <button className="rpg-btn rpg-btn-primary w-full py-3" onClick={() => setMode("criar")}>
              Criar Mesa
            </button>
            <button className="rpg-btn w-full py-3" onClick={() => setMode("entrar")}>
              Entrar com Código
            </button>
          </div>
        )}

        {mode === "criar" && (
          <div>
            <div className="rpg-system text-xs mb-3 opacity-70">Escolha uma campanha:</div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {campanhas.length === 0 && (
                <div className="rpg-system text-xs opacity-60">Nenhuma campanha disponível.</div>
              )}
              {campanhas.map((c) => (
                <button
                  key={c.id}
                  disabled={loading}
                  onClick={() => criarMesa(c.id)}
                  className="rpg-btn w-full text-left"
                >
                  <div className="font-semibold">{c.nome}</div>
                  {c.resumo && <div className="text-xs opacity-70 mt-0.5 rpg-narration">{c.resumo}</div>}
                </button>
              ))}
            </div>
            <button className="rpg-btn rpg-btn-ghost w-full mt-4" onClick={() => setMode("menu")}>
              ← voltar
            </button>
          </div>
        )}

        {mode === "entrar" && (
          <div>
            <label className="rpg-system text-xs opacity-70">Código de 6 letras</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 6))}
              className="w-full mt-1 mb-3 px-3 py-2 rpg-panel-dark rpg-narration text-2xl text-center tracking-widest uppercase"
              placeholder="ABC123"
              autoFocus
            />
            <button
              className="rpg-btn rpg-btn-primary w-full"
              disabled={loading || codigo.length < 4}
              onClick={entrarMesa}
            >
              Entrar
            </button>
            <button className="rpg-btn rpg-btn-ghost w-full mt-2" onClick={() => setMode("menu")}>
              ← voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Criação de personagem ================= */
const CLASSES = ["guerreiro", "arqueiro", "mago"];
const ATTR_ORDER = ["forca", "destreza", "intelecto", "vitalidade", "carisma"];

export function CreateCharacterScreen({
  partyId,
  joinCode,
}: {
  partyId: string;
  joinCode?: string | null;
}) {
  const { userId, setPlayer, partyState, refreshParty, toast, loadSkillsForClass } = useRpg();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [classe, setClasse] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [config, setConfig] = useState<any>(null);
  const [attrInfo, setAttrInfo] = useState<any>(null);
  const [pontos, setPontos] = useState<Record<string, number>>({});
  const [pontosLivres, setPontosLivres] = useState(0);
  const [skillsArv, setSkillsArv] = useState<Skill[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [playerCreated, setPlayerCreated] = useState<string | null>(null);

  // classes ocupadas na mesa
  const takenClasses = useMemo(() => {
    const jog: any[] = partyState?.jogadores ?? partyState?.players ?? [];
    return new Set(jog.map((j: any) => j.classe).filter(Boolean));
  }, [partyState]);

  useEffect(() => {
    refreshParty();
  }, [refreshParty]);

  useEffect(() => {
    if (!classe) return;
    (async () => {
      try {
        const cfg = await rpg<any>("classe_config", { p_classe: classe });
        setConfig(cfg);
        setPontos({ ...(cfg?.base ?? {}) });
        setPontosLivres(cfg?.pontos_livres ?? 8);
        const info = await rpg<any>("atributos_info", {}).catch(() => null);
        setAttrInfo(info);
        const arv = await rpg<Skill[]>("skills_da_classe", { p_classe: classe }).catch(() => []);
        setSkillsArv(Array.isArray(arv) ? arv : []);
        loadSkillsForClass(classe);
      } catch {}
    })();
  }, [classe, loadSkillsForClass]);

  const totalHp = (config?.base_hp ?? 20) + (pontos.vitalidade ?? 0) * 4;
  const totalMp = (config?.base_mp ?? 5) + (pontos.intelecto ?? 0) * 3;

  function bumpAttr(a: string, d: 1 | -1) {
    if (!config) return;
    const base = config.base?.[a] ?? 0;
    const cap = config.caps?.[a] ?? 20;
    setPontos((p) => {
      const cur = p[a] ?? base;
      if (d === 1) {
        if (pontosLivres <= 0) return p;
        if (cur >= cap) return p;
        setPontosLivres((v) => v - 1);
        return { ...p, [a]: cur + 1 };
      } else {
        if (cur <= base) return p;
        setPontosLivres((v) => v + 1);
        return { ...p, [a]: cur - 1 };
      }
    });
  }

  async function submitPersonagem() {
    if (!classe || !nome.trim()) return;
    setCreating(true);
    try {
      const d = await rpg<any>("criar_personagem", {
        p_party_id: partyId,
        p_user_id: userId,
        p_nome: nome.trim(),
        p_classe: classe,
        p_pontos: pontos,
      });
      if (d?.ok === false) {
        toast(translateError(d.erro), "error");
        setCreating(false);
        return;
      }
      const pid: string = d.player_id;
      // 3 skills iniciais
      for (const s of chosen) {
        await rpg("escolher_skill", { p_player_id: pid, p_skill: s }).catch(() => null);
      }
      await setPlayer(pid, partyId, joinCode || undefined);
      setPlayerCreated(pid);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto rpg-panel p-5">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="rpg-narration text-xl">Criar Herói</h2>
          {joinCode && <div className="rpg-system text-xs opacity-70">Mesa: {joinCode}</div>}
        </div>
        <div className="flex gap-2 mb-4 text-xs rpg-system">
          <span className={step >= 1 ? "" : "opacity-40"}>① Classe</span>
          <span>·</span>
          <span className={step >= 2 ? "" : "opacity-40"}>② Atributos</span>
          <span>·</span>
          <span className={step >= 3 ? "" : "opacity-40"}>③ Skills</span>
        </div>

        {step === 1 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {CLASSES.map((c) => {
                const taken = takenClasses.has(c);
                return (
                  <button
                    key={c}
                    disabled={taken}
                    onClick={() => setClasse(c)}
                    className={`rpg-card p-4 text-center ${
                      classe === c ? "ring-2" : ""
                    } ${taken ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{ borderColor: classe === c ? "var(--gold)" : undefined }}
                  >
                    <div className={`rpg-glyph-lg ${c === "mago" ? "cls-mago" : c === "guerreiro" ? "cls-guerreiro" : "cls-arqueiro"}`}>
                      {c === "mago" ? "🧙" : c === "guerreiro" ? "🛡️" : "🏹"}
                    </div>
                    <div className="rpg-narration text-lg mt-1 capitalize">{c}</div>
                    {taken && <div className="rpg-system text-[10px] opacity-70 mt-1">ocupada</div>}
                  </button>
                );
              })}
            </div>
            <label className="rpg-system text-xs opacity-70">Nome do herói</label>
            <input
              className="w-full mt-1 mb-4 px-3 py-2 rpg-panel-dark"
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 20))}
              placeholder="Como será chamado?"
            />
            <div className="flex gap-2 justify-end">
              <button
                className="rpg-btn rpg-btn-primary"
                disabled={!classe || !nome.trim()}
                onClick={() => setStep(2)}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {step === 2 && config && (
          <div>
            <div className="rpg-system text-xs opacity-70 mb-2">
              Distribua <b>{pontosLivres}</b> ponto{pontosLivres === 1 ? "" : "s"} — travados pelos caps da classe.
              <br/>Atributos não sobem com o nível; você evolui escolhendo skills.
            </div>
            <div className="space-y-2 mb-4">
              {ATTR_ORDER.map((a) => {
                const base = config.base?.[a] ?? 0;
                const cap = config.caps?.[a] ?? 20;
                const cur = pontos[a] ?? base;
                const info = attrInfo?.[a] || {};
                return (
                  <div key={a} className="rpg-card p-2 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="capitalize font-semibold text-sm">{a}</div>
                      <div className="rpg-system text-[11px] opacity-70">
                        {info.efeito || info.descricao || ""}
                      </div>
                    </div>
                    <button className="rpg-btn !py-0.5 !px-2" onClick={() => bumpAttr(a, -1)} disabled={cur <= base}>−</button>
                    <div className="w-14 text-center rpg-narration text-lg">
                      {cur}
                      <span className="rpg-system text-[10px] opacity-50"> /{cap}</span>
                    </div>
                    <button className="rpg-btn !py-0.5 !px-2" onClick={() => bumpAttr(a, 1)} disabled={cur >= cap || pontosLivres <= 0}>+</button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between rpg-system text-xs mb-4">
              <div>HP: <b className="text-red-700">{totalHp}</b> · MP: <b className="text-blue-700">{totalMp}</b></div>
              <div>Livres: <b>{pontosLivres}</b></div>
            </div>
            <div className="flex gap-2 justify-between">
              <button className="rpg-btn rpg-btn-ghost" onClick={() => setStep(1)}>← voltar</button>
              <button className="rpg-btn rpg-btn-primary" onClick={() => setStep(3)}>Continuar →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="rpg-system text-xs opacity-70 mb-3">
              Escolha <b>3 skills</b> iniciais da árvore. Escolhidas: {chosen.length}/3
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 max-h-96 overflow-y-auto">
              {skillsArv.map((s) => {
                const sel = chosen.includes(s.name);
                const alcance = s.alcance || (s as any).effect?.alcance;
                return (
                  <button
                    key={s.name}
                    onClick={() => {
                      setChosen((prev) => {
                        if (prev.includes(s.name)) return prev.filter((x) => x !== s.name);
                        if (prev.length >= 3) return prev;
                        return [...prev, s.name];
                      });
                    }}
                    className={`rpg-card p-2 text-left ${sel ? "ring-2" : ""}`}
                    style={{ borderColor: sel ? "var(--gold)" : undefined }}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="rpg-badge">{s.type}</span>
                    </div>
                    <div className="rpg-system text-[11px] opacity-70 mt-0.5">
                      {alcance ? `${alcance}` : "—"}
                      {s.mana_cost != null && ` · ${s.mana_cost} MP`}
                    </div>
                    {s.descricao && <div className="rpg-narration text-xs mt-1">{s.descricao}</div>}
                  </button>
                );
              })}
              {skillsArv.length === 0 && (
                <div className="rpg-system text-xs opacity-50">Sem skills disponíveis.</div>
              )}
            </div>
            <div className="flex gap-2 justify-between">
              <button className="rpg-btn rpg-btn-ghost" onClick={() => setStep(2)}>← voltar</button>
              <button
                className="rpg-btn rpg-btn-primary"
                disabled={chosen.length !== 3 || creating}
                onClick={submitPersonagem}
              >
                {creating ? "Criando…" : "Concluir criação"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Lobby ================= */
export function LobbyScreen() {
  const { partyState, partyId, userId, joinCode, refreshParty, toast, refreshCena, playerId } = useRpg();
  const jogadores: any[] = partyState?.jogadores ?? partyState?.players ?? [];
  const status = partyState?.status;
  const meu = jogadores.find((j) => j.user_id === userId || j.player_id === playerId);
  const isHost = partyState?.host_user_id === userId || meu?.is_host || meu?.role === "host";
  const allReady = jogadores.length > 0 && jogadores.every((j) => j.ready);

  async function marcarPronto() {
    if (!playerId) return;
    const d = await rpg<any>("marcar_pronto", { p_player_id: playerId, p_ready: !meu?.ready });
    if (d?.ok === false) toast(translateError(d.erro), "error");
    refreshParty();
  }

  async function iniciar() {
    if (!partyId) return;
    const d = await rpg<any>("iniciar_jogo", { p_party_id: partyId, p_host_user_id: userId });
    if (d?.ok === false) return toast(translateError(d.erro), "error");
    await refreshCena();
  }

  function copy() {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast("Código copiado", "success");
    }
  }

  useEffect(() => {
    if (status === "playing") refreshCena();
  }, [status, refreshCena]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="rpg-panel p-6 max-w-lg w-full">
        <h2 className="rpg-narration text-xl mb-3">Lobby</h2>
        <div className="rpg-card p-4 text-center mb-4">
          <div className="rpg-system text-xs opacity-70 mb-1">Código da mesa</div>
          <div className="rpg-narration text-4xl tracking-widest">{joinCode || "…"}</div>
          <button className="rpg-btn !py-1 !text-xs mt-2" onClick={copy}>Copiar</button>
        </div>
        <div className="space-y-2 mb-4">
          {jogadores.map((j) => (
            <div key={j.player_id || j.user_id} className="rpg-card p-2 flex items-center gap-2">
              <span className="rpg-glyph">{j.glyph || "🧝"}</span>
              <div className="flex-1">
                <div className="text-sm">
                  {j.nome || "Herói"} {(j.is_host || j.role === "host") && <span title="host">👑</span>}
                </div>
                <div className="rpg-system text-[11px] opacity-70">{j.classe || "—"}</div>
              </div>
              {j.ready ? (
                <span className="rpg-badge" style={{ background: "#166534", color: "#fff" }}>Pronto</span>
              ) : (
                <span className="rpg-badge opacity-60">aguardando</span>
              )}
            </div>
          ))}
          {jogadores.length === 0 && (
            <div className="rpg-system text-xs opacity-60 text-center py-4">Compartilhe o código para outros heróis entrarem.</div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="rpg-btn flex-1" onClick={marcarPronto} disabled={!playerId}>
            {meu?.ready ? "Cancelar Pronto" : "Estou Pronto"}
          </button>
          {isHost && (
            <button
              className="rpg-btn rpg-btn-primary flex-1"
              disabled={!allReady}
              onClick={iniciar}
            >
              Iniciar Jogo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Exploração ================= */
export function ExplorationStage() {
  const { cena } = useRpg();
  const prox = cena?.proximo;
  const glyph =
    ({
      cidade: "🍺",
      quest: "🐺",
      descanso: "🏕️",
      exploracao: "⛰️",
      chefe: "💀",
      oculto: "❓",
    } as Record<string, string>)[prox?.tipo || ""] || "🗺️";
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <div className="rpg-glyph-xl">{glyph}</div>
      <div className="rpg-narration text-2xl">{prox?.nome || cena?.local?.nome || "Caminho"}</div>
      <div className="rpg-system text-xs opacity-70">
        {prox?.tipo}
        {prox?.tier ? ` · tier ${prox.tier}` : ""}
      </div>
    </div>
  );
}

export function ExplorationActions() {
  const { cena, acaoWebhook } = useRpg();
  const verbos = Array.from(new Set(cena?.verbos ?? []));
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        className="rpg-btn rpg-btn-primary"
        disabled={!cena?.pode_frente}
        title={cena?.pode_frente ? "Avançar" : "Caminho bloqueado"}
        onClick={() => acaoWebhook({ tipo: "mover", direcao: "frente" })}
      >
        Avançar →
      </button>
      <button
        className="rpg-btn"
        disabled={!cena?.pode_tras}
        title={cena?.pode_tras ? "Voltar" : "Não há por onde voltar"}
        onClick={() => acaoWebhook({ tipo: "mover", direcao: "tras" })}
      >
        ← Voltar
      </button>
      {verbos.map((v) => (
        <button key={v} className="rpg-btn" onClick={() => acaoWebhook({ tipo: v })}>
          {v}
        </button>
      ))}
    </div>
  );
}

/* ================= Cidade ================= */
export function CityStage() {
  const { cena } = useRpg();
  const npcs = cena?.npcs ?? [];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="rpg-narration text-xl">{cena?.cidade?.name || cena?.local?.nome || "Cidade"}</div>
      <div className="flex gap-4 items-end">
        {npcs.slice(0, 6).map((n: any) => (
          <div key={n.id} className="flex flex-col items-center gap-1">
            <div className="rpg-glyph-lg">{n.glyph || "👤"}</div>
            <div className="rpg-system text-[10px]">{n.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CityActions() {
  const { cena, acaoWebhook, npcInteract, toast } = useRpg();
  const npcs = cena?.npcs ?? [];
  const loja: any[] = cena?.loja?.itens ?? [];
  const painel = cena?.painel_pronto;
  const todosProntos = cena?.todos_prontos;
  const [showLoja, setShowLoja] = useState(false);
  const [showNpc, setShowNpc] = useState<any | null>(null);
  const goldEu = cena?.eu?.gold ?? 0;
  const classeEu = cena?.eu?.classe;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {npcs.map((n: any) => (
          <button key={n.id} className="rpg-btn" onClick={() => setShowNpc(n)}>
            Falar com {n.name}
          </button>
        ))}
        {loja.length > 0 && (
          <button className="rpg-btn" onClick={() => setShowLoja(true)}>Loja ({loja.length})</button>
        )}
        <button className="rpg-btn" onClick={() => acaoWebhook({ tipo: "descansar" })}>
          🏕️ Descansar
        </button>
        <button
          className="rpg-btn rpg-btn-primary"
          onClick={() => acaoWebhook({ tipo: "pronto_cidade", ready: !todosProntos })}
        >
          Estou Pronto
        </button>
      </div>
      {painel?.checklist && (
        <div className="rpg-system text-xs opacity-70">
          {painel.checklist.map((it: any, i: number) => (
            <div key={i}>
              {it.pronto ? "✓" : "○"} {it.nome}
            </div>
          ))}
        </div>
      )}

      {showLoja && (
        <div className="rpg-overlay" onClick={() => setShowLoja(false)}>
          <div className="rpg-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="rpg-narration text-xl">Loja</h3>
              <div className="rpg-system text-xs">Seu ouro: <b>{goldEu} 🪙</b></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {loja.map((it: any) => {
                const semEstoque = it.estoque === 0;
                const restrClasse =
                  it.class_restriction && it.class_restriction !== classeEu;
                const semOuro = goldEu < (it.preco ?? 0);
                const disabled = semEstoque || restrClasse || semOuro;
                const tt = semEstoque
                  ? "Sem estoque"
                  : restrClasse
                  ? `Só ${it.class_restriction}`
                  : semOuro
                  ? "Ouro insuficiente"
                  : "Comprar";
                return (
                  <div key={it.shop_item_id} className="rpg-card p-2 flex items-center gap-2">
                    <div className="rpg-glyph">{it.glyph || "📦"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{it.nome}</div>
                      <div className="rpg-system text-[10px] opacity-70">
                        {it.slot || it.categoria}
                        {it.estoque === -1 ? " · ∞" : it.estoque != null ? ` · x${it.estoque}` : ""}
                      </div>
                    </div>
                    <div className="rpg-system text-sm">{it.preco} 🪙</div>
                    <button
                      className="rpg-btn !py-1 !px-2 text-xs"
                      disabled={disabled}
                      title={tt}
                      onClick={async () => {
                        const r = await acaoWebhook({ tipo: "comprar", shop_item_id: it.shop_item_id });
                        if (r?.ok !== false) toast("Item comprado", "success");
                      }}
                    >
                      Comprar
                    </button>
                  </div>
                );
              })}
            </div>
            <button className="rpg-btn rpg-btn-ghost w-full mt-4" onClick={() => setShowLoja(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {showNpc && (
        <NpcDialog npc={showNpc} onClose={() => setShowNpc(null)} />
      )}
    </div>
  );
}

function NpcDialog({ npc, onClose }: { npc: any; onClose: () => void }) {
  const { npcInteract } = useRpg();
  const interacoes: any[] = npc?.interacoes?.interacoes ?? [];
  return (
    <div className="rpg-overlay" onClick={onClose}>
      <div className="rpg-overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="rpg-glyph-lg">{npc.glyph || "👤"}</div>
          <div>
            <div className="rpg-narration text-xl">{npc.name}</div>
            <div className="rpg-system text-xs opacity-70">{npc.role}</div>
          </div>
        </div>
        {npc.resumo && <div className="rpg-narration text-sm mb-3">{npc.resumo}</div>}
        <div className="space-y-2">
          {interacoes.length === 0 && (
            <div className="rpg-system text-xs opacity-60">Sem interações.</div>
          )}
          {interacoes.map((it: any) => (
            <button
              key={it.id || it.label}
              className="rpg-btn w-full text-left"
              disabled={it.disponivel === false}
              title={it.disponivel === false ? "Indisponível agora" : it.label}
              onClick={async () => {
                await npcInteract(npc.id, it.id);
              }}
            >
              {it.label || it.nome}
            </button>
          ))}
        </div>
        <button className="rpg-btn rpg-btn-ghost w-full mt-4" onClick={onClose}>
          Sair
        </button>
      </div>
    </div>
  );
}

/* ================= Quest ================= */
export function QuestStage() {
  const { cena } = useRpg();
  const sala = cena?.sala_atual;
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <div className="rpg-system text-xs opacity-70">
        {cena?.quest?.titulo} · Sala {sala?.ordem}/{cena?.salas_total}
      </div>
      <div className="rpg-narration text-2xl">{sala?.nome}</div>
      {sala?.tem_boss && <span className="rpg-badge" style={{ background: "#7f1d1d", color: "#fff" }}>BOSS</span>}
      {sala?.resumo && <div className="rpg-narration text-sm max-w-lg text-center px-4">{sala.resumo}</div>}
    </div>
  );
}

export function QuestActions() {
  const { cena, acaoWebhook } = useRpg();
  const sala = cena?.sala_atual;
  const ac = sala?.acoes_classe;
  const buttons: Array<{ tipo: string; label: string; sub?: string[] }> = [];
  if (ac) {
    for (const k of ["ataca", "afeto_1", "afeto_2", "protege"]) {
      const a = (ac as any)[k];
      if (a?.label) buttons.push({ tipo: k, label: a.label, sub: a.sub });
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rpg-btn rpg-btn-primary" onClick={() => acaoWebhook({ tipo: "avancar_sala" })}>
        Avançar →
      </button>
      {buttons.map((b) => {
        if (b.sub?.length) {
          return b.sub.map((metodo) => (
            <button
              key={b.tipo + metodo}
              className="rpg-btn"
              onClick={() => acaoWebhook({ tipo: b.tipo, metodo })}
            >
              {b.label} ({metodo})
            </button>
          ));
        }
        return (
          <button key={b.tipo} className="rpg-btn" onClick={() => acaoWebhook({ tipo: b.tipo })}>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}
