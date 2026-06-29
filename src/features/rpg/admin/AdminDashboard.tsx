// Dashboard admin do modulo RPG (so leitura) + 1 acao de escrita: Forjar Mundo.
// Leitura via rpc('rpg_admin_select', { _table: '<table>' }).
// Gerar via webhook /rpg-gerar-tudo (pipeline completo, ~5-8 min).
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Castle, Eye, Loader2, Map as MapIcon, MessageSquare, NotebookPen, ScrollText, Skull, Sparkles, Users, CheckCircle2 } from "lucide-react";
import { adminSelect, postGerarTudo, rpcChatlog, rpgRpc } from "../api";
import { Progress } from "@/components/ui/progress";

type TabId = "forja" | "mapa" | "quests" | "cidades" | "bestiario" | "parties" | "chatlog" | "devlog";
const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: "forja", label: "Forjar Mundo", Icon: Sparkles },
  { id: "mapa", label: "Mapa", Icon: MapIcon },
  { id: "quests", label: "Quests", Icon: ScrollText },
  { id: "cidades", label: "Cidades & NPCs", Icon: Castle },
  { id: "bestiario", label: "Bestiario", Icon: Skull },
  { id: "parties", label: "Parties", Icon: Users },
  { id: "chatlog", label: "Chatlog", Icon: MessageSquare },
  { id: "devlog", label: "Devlog", Icon: NotebookPen },
];

export default function AdminRpgDashboard() {
  const [tab, setTab] = useState<TabId>("forja");
  return (
    <div data-rpg-theme className="min-h-screen">
      <Helmet><title>Admin · RPG</title></Helmet>
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <header className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h1 className="rpg-title text-2xl">Admin · RPG</h1>
          <div className="text-xs rpg-ink-soft">painel de inspecao (so leitura) + forja de mundo</div>
        </header>
        <nav className="flex gap-2 flex-wrap mb-4 border-b pb-2" style={{ borderColor: "hsl(41 70% 50% / 0.3)" }}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rpg-btn text-sm inline-flex items-center gap-1 ${tab === id ? "rpg-btn-primary" : ""}`}
            >
              <Icon size={14}/> {label}
            </button>
          ))}
        </nav>
        {tab === "forja" && <ForjaTab />}
        {tab === "mapa" && <Table table="map_nodes" columns={["ordem", "nome", "tipo", "tier", "liberado"]} order="ordem"/>}
        {tab === "quests" && <Table table="quests" columns={["titulo", "tier", "salas_total"]} />}
        {tab === "cidades" && <CidadesTab/>}
        {tab === "bestiario" && <Table table="encounters" columns={["nome", "hp", "dano", "defesa", "tier"]} />}
        {tab === "parties" && <Table table="parties" columns={["id", "join_code", "status", "max_players"]} />}
        {tab === "chatlog" && <ChatlogTab/>}
        {tab === "devlog" && <Table table="devlog" columns={["created_at", "titulo", "decisao"]} order="-created_at"/>}
      </div>
    </div>
  );
}

// ---------- Forjar Mundo (escrita) ----------
type ForjaStatus = {
  existe?: boolean;
  campaign_id?: string;
  nome?: string;
  quests?: number;
  salas?: number;
  nos?: number;
  cidades?: number;
  finalizada?: boolean;
};

const META = { quests: 8, salas: 40, nos: 12, cidades: 4 };

function ForjaTab() {
  const [historia, setHistoria] = useState("");
  const [phase, setPhase] = useState<"idle" | "disparando" | "iniciando" | "gerando" | "pronto" | "erro">("idle");
  const [errMsg, setErrMsg] = useState<string>("");
  const [status, setStatus] = useState<ForjaStatus>({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (pollRef.current) window.clearInterval(pollRef.current);
  }, []);

  const startPolling = () => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    const tick = async () => {
      const r: any = await rpgRpc<ForjaStatus>("status_geracao", {});
      if (!r.ok || !r.data) return;
      const s: ForjaStatus = r.data;
      const novoNasceu = !!s.campaign_id && s.campaign_id !== prevIdRef.current;
      if (!novoNasceu) {
        // Ainda e a campanha velha; ignora finalizada.
        setPhase("iniciando");
        return;
      }
      setStatus(s);
      setPhase(s.finalizada ? "pronto" : "gerando");
      if (s.finalizada) {
        if (pollRef.current) window.clearInterval(pollRef.current);
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    };
    tick();
    pollRef.current = window.setInterval(tick, 8000);
  };

  const gerar = async () => {
    setPhase("disparando");
    setErrMsg("");
    setStatus({});
    setElapsed(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);

    // 1) Snapshot do id atual (campanha velha) ANTES de disparar.
    const prev: any = await rpgRpc<ForjaStatus>("status_geracao", {});
    prevIdRef.current = prev.ok && prev.data?.campaign_id ? prev.data.campaign_id : null;

    // 2) Dispara webhook (n8n responde NA HORA).
    const r: any = await postGerarTudo(historia.trim());
    if (!r.ok) {
      setPhase("erro");
      setErrMsg(r.error || "Falha ao disparar webhook");
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    setPhase("iniciando");
    startPolling();
  };

  const pct = (n: number | undefined, alvo: number) =>
    Math.min(100, Math.round(((n ?? 0) / alvo) * 100));

  const loading = phase === "disparando" || phase === "iniciando" || phase === "gerando";

  return (
    <div className="rpg-card-scroll p-4 md:p-6 max-w-3xl">
      <h2 className="rpg-title text-xl mb-2">Forjar novo mundo</h2>
      <p className="rpg-ink-soft text-sm mb-3">
        Descreva a premissa. O webhook dispara o pipeline (bioma → cidades → NPCs → quests → salas → mapa → bestiario → cardapio v3 → eventos)
        e responde NA HORA. O painel acompanha o progresso por polling (~8-10 min ate finalizar).
      </p>
      <textarea
        rows={8}
        className="w-full px-3 py-2 mb-3 min-h-[10rem]"
        value={historia}
        disabled={loading}
        onChange={(e) => setHistoria(e.target.value)}
        placeholder="Ex: Um arquipelago vulcanico onde tribos disputam o controle de fontes termais sagradas que estao secando..."
      />
      <div className="flex flex-wrap items-center gap-3">
        <button className="rpg-btn rpg-btn-primary inline-flex items-center gap-2" disabled={loading || !historia.trim()} onClick={gerar}>
          {loading ? <><Loader2 className="animate-spin" size={14}/> {phase === "disparando" ? "Disparando..." : `Forjando (${Math.floor(elapsed/60)}m ${elapsed % 60}s)`}</> : <><Sparkles size={14}/> Forjar mundo</>}
        </button>
        {phase === "iniciando" ? <span className="text-sm rpg-ink-soft">Iniciando a forja...</span> : null}
        {phase === "gerando" ? <span className="text-sm rpg-ink-soft">Pacientemente fiando o tear...</span> : null}
      </div>

      {phase === "erro" ? (
        <div className="mt-3 text-sm" style={{ color: "hsl(348 55% 32%)" }}>{errMsg}</div>
      ) : null}

      {phase === "gerando" ? (
        <div className="mt-4 space-y-3">
          {status.nome ? <div className="text-sm">Forjando: <b>{status.nome}</b></div> : null}
          {(["quests","salas","nos","cidades"] as const).map((k) => (
            <div key={k}>
              <div className="flex justify-between text-xs rpg-ink-soft mb-1">
                <span className="uppercase">{k}</span>
                <span>{status[k] ?? 0} / ~{META[k]}</span>
              </div>
              <Progress value={pct(status[k], META[k])} />
            </div>
          ))}
        </div>
      ) : null}

      {phase === "pronto" ? (
        <div className="mt-4 p-3 rounded text-sm space-y-2" style={{ background: "hsl(130 30% 90%)", color: "hsl(130 30% 20%)" }}>
          <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={16}/> Mundo pronto!</div>
          {status.nome ? <div>"{status.nome}"</div> : null}
          {status.campaign_id ? <div className="font-mono text-xs">{status.campaign_id}</div> : null}
          <div className="text-xs">quests: {status.quests ?? 0} · salas: {status.salas ?? 0} · nos: {status.nos ?? 0} · cidades: {status.cidades ?? 0}</div>
          <div className="flex gap-2 pt-1">
            <a href="/rpg" className="rpg-btn rpg-btn-primary text-xs">Jogar</a>
            <button className="rpg-btn text-xs" onClick={() => { setPhase("idle"); setStatus({}); setHistoria(""); prevIdRef.current = null; }}>Forjar outro</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


// ---------- Tabela generica ----------
function Table({ table, columns, order }: { table: string; columns: string[]; order?: string }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    setRows(null); setErr(null);
    adminSelect(table).then((r: any) => {
      if (!r.ok) { setErr(r.error); return; }
      let data = [...r.data];
      if (order) {
        const desc = order.startsWith("-");
        const key = desc ? order.slice(1) : order;
        data.sort((a, b) => {
          const va = a?.[key]; const vb = b?.[key];
          if (va == null) return 1; if (vb == null) return -1;
          if (va < vb) return desc ? 1 : -1;
          if (va > vb) return desc ? -1 : 1;
          return 0;
        });
      }
      setRows(data);
    });
  }, [table, order]);

  if (err) return <div className="rpg-card p-3 text-sm" style={{ color: "hsl(348 55% 32%)" }}>Erro: {err}</div>;
  if (!rows) return <div className="rpg-ink-soft text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> carregando...</div>;
  if (!rows.length) return <div className="rpg-ink-soft text-sm">Tabela vazia (rpg.{table}).</div>;
  return (
    <div className="rpg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>{columns.map((c) => <th key={c} className="text-left p-2 rpg-ink-soft uppercase text-xs border-b" style={{ borderColor: "hsl(41 70% 50% / 0.3)" }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-[hsl(41_70%_50%_/_0.05)]">
              {columns.map((c) => (
                <td key={c} className="p-2 border-b align-top" style={{ borderColor: "hsl(41 70% 50% / 0.15)" }}>
                  <Cell value={r[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs rpg-ink-soft p-2">total: {rows.length}</div>
    </div>
  );
}

function Cell({ value }: { value: any }) {
  if (value == null) return <span className="rpg-ink-soft">—</span>;
  if (typeof value === "boolean") return <span>{value ? "✓" : "·"}</span>;
  if (typeof value === "object") return <code className="text-xs font-mono break-all">{JSON.stringify(value).slice(0, 80)}</code>;
  const s = String(value);
  return <span title={s}>{s.length > 80 ? s.slice(0, 80) + "..." : s}</span>;
}

// ---------- Cidades & NPCs ----------
function CidadesTab() {
  const [cidades, setCidades] = useState<any[] | null>(null);
  const [npcs, setNpcs] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminSelect("cities"), adminSelect("npcs")]).then(([a, b]: [any, any]) => {
      if (!a.ok) return setErr(a.error);
      if (!b.ok) return setErr(b.error);
      setCidades(a.data); setNpcs(b.data);
    });
  }, []);

  const npcsByCity = useMemo(() => {
    if (!npcs) return new Map();
    const m = new Map<string, any[]>();
    npcs.forEach((n) => {
      const k = n.city_id ?? n.cidade_id ?? "—";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    });
    return m;
  }, [npcs]);

  if (err) return <div className="rpg-card p-3 text-sm" style={{ color: "hsl(348 55% 32%)" }}>Erro: {err}</div>;
  if (!cidades) return <div className="rpg-ink-soft text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> carregando...</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {cidades.map((c) => (
        <div key={c.id} className="rpg-card p-3">
          <div className="rpg-title text-base">{c.nome ?? c.name}</div>
          <div className="rpg-ink-soft text-xs mb-2">{c.resumo ?? c.descricao}</div>
          <ul className="space-y-1 text-sm">
            {(npcsByCity.get(c.id) ?? []).map((n: any) => (
              <li key={n.id}><b>{n.name ?? n.nome}</b> <span className="rpg-ink-soft">· {n.role}</span> — {n.resumo}</li>
            ))}
            {!(npcsByCity.get(c.id) ?? []).length ? <li className="rpg-ink-soft">sem NPCs cadastrados</li> : null}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------- Chatlog ----------
function ChatlogTab() {
  const [partyId, setPartyId] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const carregar = async () => {
    if (!partyId.trim()) return;
    setBusy(true); setErr(null); setRows(null);
    const r: any = await rpcChatlog(partyId.trim());
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setRows(Array.isArray(r.data) ? r.data : []);
  };

  return (
    <div className="space-y-3">
      <div className="rpg-card p-3 flex flex-wrap gap-2 items-center">
        <input className="flex-1 px-3 py-2 font-mono" placeholder="party_id (uuid)" value={partyId} onChange={(e) => setPartyId(e.target.value)} />
        <button className="rpg-btn inline-flex items-center gap-1" disabled={busy} onClick={carregar}>
          {busy ? <Loader2 className="animate-spin" size={14}/> : <Eye size={14}/>} Inspecionar
        </button>
      </div>
      {err ? <div className="rpg-card p-3 text-sm" style={{ color: "hsl(348 55% 32%)" }}>{err}</div> : null}
      {rows ? (
        <div className="rpg-card-scroll p-3 space-y-2 max-h-[70vh] overflow-y-auto text-sm">
          {!rows.length ? <div className="rpg-ink-soft">sem eventos</div> : rows.map((row, i) => (
            <div key={i} className="border-b pb-2" style={{ borderColor: "hsl(41 70% 50% / 0.15)" }}>
              <div className="rpg-ink-soft text-xs">{row.created_at} · {row.actor ?? row.tipo}</div>
              <div className="font-semibold">{row.acao ?? row.tipo}</div>
              {row.dado ? <div className="text-xs">dado: {JSON.stringify(row.dado)}</div> : null}
              {row.resultado ? <div className="text-xs">resultado: {JSON.stringify(row.resultado)}</div> : null}
              {row.narrativa ? <div className="italic mt-1">"{row.narrativa}"</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
