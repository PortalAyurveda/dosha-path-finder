// Telas de Lobby: continuar, entrar/criar mesa, criar personagem, sala de espera.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, Crown, Loader2, Plus, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGame } from "../GameContext";
import {
  rpcCampanhasJogaveis,
  rpcClasseConfig,
  rpcCriarParty,
  rpcCriarPersonagem,
  rpcEntrarParty,
  rpcEstadoParty,
  rpcIniciarJogo,
  rpcMarcarPronto,
  rpcMeusPersonagens,
  rpcSairParty,
  rpcSalasAbertas,
} from "../api";


type Step =
  | { name: "loading" }
  | { name: "no_auth" }
  | { name: "saves"; saves: any[] }
  | { name: "entry" }
  | { name: "char" }
  | { name: "wait" };

export function LobbyFlow() {
  const params = useParams();
  const navigate = useNavigate();
  const { player, party_id, estado, setPlayer, setPartyOnly, clearSession } = useGame();
  const [step, setStep] = useState<Step>({ name: "loading" });
  const [user, setUser] = useState<any>(null);

  // 1. checa sessao
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        setStep({ name: "no_auth" });
      } else {
        setUser(data.user);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. com user: se ja temos player no save e party iniciada → jogo; senao tela inicial.
  useEffect(() => {
    if (!user) return;
    if (step.name !== "loading") return;
    (async () => {
      // se veio via /rpg/lobby/:code, tenta entrar direto
      const code = (params as any).code as string | undefined;
      if (code && !player) {
        const r: any = await rpcEntrarParty(code);
        if (r.ok && (r.data as any).ok && (r.data as any).party_id) {
          setPartyOnly((r.data as any).party_id);
          setStep({ name: "char" });
          return;
        }
      }
      // se ja tem save → vamos para sala de espera ou jogo
      if (player) {
        setStep({ name: "wait" });
        return;
      }
      const r = await rpcMeusPersonagens(user.id);
      const saves = r.ok && Array.isArray(r.data) ? (r.data as any[]) : [];
      setStep(saves.length ? { name: "saves", saves } : { name: "entry" });
    })();
  }, [user, params, player]);

  // 3. quando estado vira jogo (modo != lobby), navega pra "modo de jogo"
  useEffect(() => {
    if (estado?.modo && estado.modo !== "lobby" && step.name === "wait") {
      // o RpgApp ja re-renderiza pela mudanca de mode
    }
  }, [estado?.modo, step.name]);

  if (step.name === "loading") {
    return (
      <div className="rpg-ink-soft flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> carregando...
      </div>
    );
  }

  if (step.name === "no_auth") {
    return (
      <div className="rpg-card-scroll p-6 max-w-md">
        <h2 className="rpg-title text-xl mb-2">Entre na taverna</h2>
        <p className="rpg-ink-soft mb-4">Para gravar seu personagem e jogar com a mesa, voce precisa estar autenticado.</p>
        <button className="rpg-btn rpg-btn-primary" onClick={() => navigate("/entrar?redirect=/rpg")}>Entrar</button>
      </div>
    );
  }

  if (step.name === "saves") {
    return (
      <SavesScreen
        saves={step.saves}
        onPick={(s) => {
          setPlayer({ player_id: s.player_id, party_id: s.party_id, user_id: user.id });
          setStep({ name: "wait" });
        }}
        onNew={() => setStep({ name: "entry" })}
      />
    );
  }

  if (step.name === "entry") {
    return (
      <EntryScreen
        user={user}
        onCreated={(party_id) => {
          setPartyOnly(party_id);
          setStep({ name: "char" });
        }}
      />
    );
  }

  if (step.name === "char") {
    return (
      <CharCreateScreen
        user={user}
        party_id={party_id!}
        onCreated={(player_id) => {
          setPlayer({ player_id, party_id: party_id!, user_id: user.id });
          setStep({ name: "wait" });
        }}
      />
    );
  }

  return (
    <WaitRoom
      user={user}
      onLeave={() => {
        clearSession();
        setStep({ name: "entry" });
      }}
    />
  );
}

// ----- Saves -----
function SavesScreen({ saves, onPick, onNew }: { saves: any[]; onPick: (s: any) => void; onNew: () => void }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-baseline justify-between">
        <h1 className="rpg-title text-2xl">Continuar aventura</h1>
        <button className="rpg-btn inline-flex items-center gap-1" onClick={onNew}><Plus size={14}/> Nova</button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {saves.map((s) => (
          <li key={s.player_id}>
            <button className="rpg-card p-3 text-left w-full hover:opacity-90" onClick={() => onPick(s)}>
              <div className="font-semibold">{s.nome ?? "Sem nome"} <span className="rpg-ink-soft">· {s.classe} · lv {s.level ?? 1}</span></div>
              <div className="text-xs rpg-ink-soft mt-1">
                mesa {s.join_code ?? "?"} {s.posicao ? `· no ${s.posicao}` : ""}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----- Entrada -----
function EntryScreen({ user, onCreated }: { user: any; onCreated: (party_id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [campanhas, setCampanhas] = useState<Array<{ id: string; nome: string; resumo?: string }>>([]);
  const [campanhaId, setCampanhaId] = useState<string>("");
  const [isPublic, setIsPublic] = useState(true);
  const [salas, setSalas] = useState<any[]>([]);

  useEffect(() => {
    rpcCampanhasJogaveis().then((r) => {
      if (r.ok && Array.isArray(r.data)) {
        setCampanhas(r.data);
        if (r.data.length && !campanhaId) setCampanhaId(r.data[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const r = await rpcSalasAbertas();
      if (!alive) return;
      if (r.ok && Array.isArray(r.data)) setSalas(r.data);
    };
    tick();
    const id = window.setInterval(tick, 4000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  const campanhaSel = campanhas.find((c) => c.id === campanhaId);

  const criar = async () => {
    setBusy(true); setErr(null);
    const r: any = await rpcCriarParty(user.id, campanhaId || undefined, isPublic);
    if (!r.ok) { setErr(r.error); setBusy(false); return; }
    const d = r.data as any;
    setJoinCode(d.join_code);
    onCreated(d.party_id);
    setBusy(false);
  };

  const entrar = async () => {
    setBusy(true); setErr(null);
    const r: any = await rpcEntrarParty(code);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    const d = r.data as any;
    if (!d.ok || !d.party_id) return setErr(d.erro || "Codigo invalido");
    onCreated(d.party_id);
  };

  const entrarSala = async (jc: string) => {
    setBusy(true); setErr(null);
    const r: any = await rpcEntrarParty(jc);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    const d = r.data as any;
    if (!d.ok || !d.party_id) return setErr(d.erro || "Mesa indisponivel");
    onCreated(d.party_id);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rpg-card-scroll p-5">
          <h2 className="rpg-title text-xl mb-3 inline-flex items-center gap-2"><Sparkles size={18}/> Criar mesa</h2>
          <label className="text-xs rpg-ink-soft uppercase block mb-1">Campanha</label>
          <select
            className="w-full px-2 py-2 mb-2"
            value={campanhaId}
            onChange={(e) => setCampanhaId(e.target.value)}
            disabled={busy || !campanhas.length}
          >
            {campanhas.length === 0 ? <option value="">(sem campanhas)</option> : null}
            {campanhas.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {campanhaSel?.resumo ? (
            <p className="rpg-ink-soft text-xs mb-3 italic">{campanhaSel.resumo}</p>
          ) : null}
          <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            <span>{isPublic ? "Mesa publica (aparece no saguao)" : "Mesa privada (so por codigo)"}</span>
          </label>
          <button className="rpg-btn rpg-btn-primary" disabled={busy || !campanhaId} onClick={criar}>
            {busy ? <Loader2 className="animate-spin" size={14}/> : "Criar mesa"}
          </button>
          {joinCode ? (
            <div className="mt-3 text-sm">
              Codigo: <span className="font-mono font-bold">{joinCode}</span>
            </div>
          ) : null}
        </div>
        <div className="rpg-card-scroll p-5">
          <h2 className="rpg-title text-xl mb-3 inline-flex items-center gap-2"><Users size={18}/> Entrar com codigo</h2>
          <input
            className="w-full px-3 py-2 mb-3 font-mono uppercase tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EX: 46F9A9"
            maxLength={8}
          />
          <button className="rpg-btn" disabled={busy || !code.trim()} onClick={entrar}>
            {busy ? <Loader2 className="animate-spin" size={14}/> : "Entrar"}
          </button>
          {err ? <div className="text-sm mt-2" style={{ color: "hsl(348 55% 32%)" }}>{err}</div> : null}
        </div>
      </div>

      <div className="rpg-card-scroll p-5">
        <h2 className="rpg-title text-lg mb-3 inline-flex items-center gap-2"><Users size={16}/> Mesas abertas</h2>
        {salas.length === 0 ? (
          <p className="rpg-ink-soft text-sm">Nenhuma mesa publica aberta no momento.</p>
        ) : (
          <ul className="space-y-2">
            {salas.map((s) => (
              <li key={s.party_id} className="rpg-card p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  <div className="font-semibold">
                    {s.campanha ?? "Campanha"} <span className="rpg-ink-soft">· {s.n_jogadores}/{s.max}</span>
                  </div>
                  <div className="rpg-ink-soft text-xs">
                    host: {s.host ?? "?"}{Array.isArray(s.jogadores) && s.jogadores.length ? " · " + s.jogadores.map((j: any) => `${j.nome}·${j.classe}`).join(", ") : ""}
                  </div>
                </div>
                <button className="rpg-btn text-xs" disabled={busy || (s.vagas ?? 0) <= 0} onClick={() => entrarSala(s.join_code)}>
                  {(s.vagas ?? 0) <= 0 ? "Cheia" : "Entrar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// ----- Criar personagem -----
const CLASSES: { id: "guerreiro" | "arqueiro" | "mago"; nome: string; desc: string }[] = [
  { id: "guerreiro", nome: "Guerreiro", desc: "Tanque, FOR, HP alto." },
  { id: "arqueiro", nome: "Arqueiro", desc: "Alcance e esquiva, DES." },
  { id: "mago", nome: "Mago", desc: "Burst magico, INT, fragil." },
];

function CharCreateScreen({ user, party_id, onCreated }: { user: any; party_id: string; onCreated: (player_id: string) => void }) {
  const [classe, setClasse] = useState<"guerreiro" | "arqueiro" | "mago" | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [pontos, setPontos] = useState<Record<string, number>>({});
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [classesEmUso, setClassesEmUso] = useState<string[]>([]);

  useEffect(() => {
    if (!party_id) return;
    let alive = true;
    const tick = async () => {
      const r = await rpcEstadoParty(party_id);
      if (!alive || !r.ok) return;
      const usadas = (((r.data as any)?.jogadores ?? []) as any[])
        .filter((j) => j.user_id !== user?.id && !!j.classe)
        .map((j) => String(j.classe).toLowerCase());
      setClassesEmUso(usadas);
      if (classe && usadas.includes(classe)) setClasse(null);
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => { alive = false; window.clearInterval(id); };
  }, [party_id, user?.id, classe]);

  useEffect(() => {
    if (!classe) return;
    setConfig(null);
    rpcClasseConfig(classe).then((r) => {
      if (r.ok) {
        setConfig(r.data);
        setPontos({ ...(r.data.base as any) });
      }
    });
  }, [classe]);

  const livres = config?.pontos_livres ?? 8;
  const baseSum = config ? Object.values(config.base as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
  const sum = Object.values(pontos).reduce((a, b) => a + (b || 0), 0);
  const usados = sum - baseSum;
  const restantes = livres - usados;

  const inc = (k: string, d: number) => {
    if (!config) return;
    const next = (pontos[k] ?? 0) + d;
    const base = (config.base as any)[k] ?? 0;
    const cap = (config.caps as any)[k] ?? 10;
    if (next < base || next > cap) return;
    const futureSum = sum - (pontos[k] ?? 0) + next;
    if (futureSum - baseSum > livres) return;
    setPontos({ ...pontos, [k]: next });
  };

  const hpPreview = config ? config.base_hp + (pontos.VIG ?? 0) * 2 : 0;
  const mpPreview = config ? config.base_mp + Math.floor((pontos.INT ?? 0) / 2) : 0;

  const confirmar = async () => {
    if (!classe) return;
    if (restantes !== 0) return setErr(`Distribua todos os pontos (${restantes} restantes)`);
    if (!nome.trim()) return setErr("Escolha um nome");
    setBusy(true); setErr(null);
    const r: any = await rpcCriarPersonagem(party_id, user.id, nome.trim(), classe, pontos);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    const d = r.data as any;
    if (!d.ok || !d.player_id) return setErr("Falha ao criar personagem");
    onCreated(d.player_id);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="rpg-title text-2xl">Forje sua ficha</h1>
      <div>
        <h3 className="rpg-title text-base mb-2">1. Classe</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CLASSES.map((c) => {
            const emUso = classesEmUso.includes(c.id);
            return (
              <button
                key={c.id}
                className={`rpg-card p-3 text-left ${classe === c.id ? "rpg-pulse" : ""}`}
                onClick={() => !emUso && setClasse(c.id)}
                disabled={emUso}
                style={{
                  ...(classe === c.id ? { borderColor: "hsl(41 70% 50%)" } : {}),
                  ...(emUso ? { opacity: 0.45, cursor: "not-allowed" } : {}),
                }}
              >
                <div className="rpg-title text-lg">{c.nome}</div>
                <div className="text-sm rpg-ink-soft">{emUso ? "ja escolhida por outro jogador" : c.desc}</div>
              </button>
            );
          })}
        </div>
        {classesEmUso.length ? (
          <div className="rpg-ink-soft text-xs mt-2">Cada classe so pode aparecer uma vez na mesa.</div>
        ) : null}
      </div>


      {classe && config ? (
        <>
          <div>
            <h3 className="rpg-title text-base mb-2">2. Atributos <span className="rpg-ink-soft text-sm">(restantes: {restantes})</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.keys(config.base as any).map((k) => (
                <div key={k} className="rpg-card p-2 text-sm flex items-center justify-between">
                  <span className="font-semibold">{k}</span>
                  <div className="flex items-center gap-2">
                    <button className="rpg-btn px-2" onClick={() => inc(k, -1)}>-</button>
                    <span className="w-6 text-center">{pontos[k] ?? 0}</span>
                    <button className="rpg-btn px-2" onClick={() => inc(k, +1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="rpg-title text-base mb-2">3. Preview & nome</h3>
            <div className="rpg-card p-3 text-sm space-y-2">
              <div>HP: <b>{hpPreview}</b> · MP: <b>{mpPreview}</b></div>
              <input
                className="w-full px-3 py-2"
                placeholder="Nome do personagem"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <button className="rpg-btn rpg-btn-primary" disabled={busy} onClick={confirmar}>
                {busy ? <Loader2 className="animate-spin" size={14}/> : "Confirmar ficha"}
              </button>
              {err ? <div style={{ color: "hsl(348 55% 32%)" }}>{err}</div> : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ----- Sala de espera -----
function WaitRoom({ user, onLeave }: { user: any; onLeave: () => void }) {
  const { player, party_id, refresh } = useGame();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!party_id) return;
    const tick = async () => {
      const r = await rpcEstadoParty(party_id);
      if (r.ok) setData(r.data);
    };
    tick();
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [party_id]);

  if (!data) {
    return <div className="rpg-ink-soft flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> entrando na mesa...</div>;
  }

  const meEntry = (data.jogadores || []).find((j: any) => j.player_id === player?.player_id);
  const isHost = !!meEntry?.is_host;
  const todosProntos = (data.jogadores || []).length > 0 && (data.jogadores || []).every((j: any) => j.ready);
  const link = `${window.location.origin}/rpg/lobby/${data.join_code}`;

  const toggleReady = async () => {
    if (!player) return;
    setBusy(true);
    await rpcMarcarPronto(player.player_id, !meEntry?.ready);
    setBusy(false);
  };
  const comecar = async () => {
    if (!party_id) return;
    setBusy(true);
    await rpcIniciarJogo(party_id, user.id);
    await refresh();
    setBusy(false);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="rpg-title text-2xl">Sala de espera</h1>
      <div className="rpg-card p-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="rpg-ink-soft text-xs uppercase">Codigo</div>
          <div className="font-mono font-bold text-xl">{data.join_code}</div>
        </div>
        <button className="rpg-btn inline-flex items-center gap-1" onClick={() => navigator.clipboard.writeText(link)}>
          <Copy size={14}/> copiar link
        </button>
      </div>
      <ul className="space-y-2">
        {(data.jogadores || []).map((j: any) => (
          <li key={j.player_id} className="rpg-card p-2 flex items-center justify-between text-sm">
            <span className="font-semibold inline-flex items-center gap-1">
              {j.is_host ? <Crown size={12} className="rpg-gold"/> : null}
              {j.nome} <span className="rpg-ink-soft">· {j.classe}</span>
            </span>
            <span>{j.ready ? "✓ pronto" : "⏳"}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 flex-wrap">
        <button className="rpg-btn" disabled={busy} onClick={toggleReady}>
          {meEntry?.ready ? "Marcar nao pronto" : "Estou pronto"}
        </button>
        {isHost ? (
          <button className="rpg-btn rpg-btn-primary" disabled={busy || !todosProntos} onClick={comecar}>
            {todosProntos ? "Comecar aventura" : "Aguardando todos prontos..."}
          </button>
        ) : null}
        <button
          className="rpg-btn"
          disabled={busy}
          onClick={async () => {
            if (!confirm("Sair da mesa? Voce perde este personagem.")) return;
            setBusy(true);
            if (player) await rpcSairParty(player.player_id);
            setBusy(false);
            onLeave();
          }}
        >
          Sair da mesa
        </button>
      </div>
    </div>
  );
}
