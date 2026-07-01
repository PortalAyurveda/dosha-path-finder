// Componentes compartilhados da mesa: Header, Bússola, PartyList, Stage, NarrationLog, StonePath, DiceLegend.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Book,
  HelpCircle,
  Menu,
  Map as MapIcon,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useRpg } from "./store";
import type { Cena, CombatUnit, Heroi } from "./types";
import { rpg } from "./api";

/* ---------------- Header ---------------- */
export function RpgHeader({
  onOpenJournal,
  onOpenHelp,
  onToggleLeft,
  onToggleRight,
}: {
  onOpenJournal: () => void;
  onOpenHelp: () => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}) {
  const { cena, clearSession } = useRpg();
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const rel = cena?.relogio;
  const relogio = rel
    ? `Dia ${rel.dia ?? "?"} · ${String(rel.hora ?? 0).padStart(2, "0")}h · ${rel.fase ?? ""}`
    : "";

  return (
    <header
      className="h-14 shrink-0 flex items-center px-3 gap-3 rpg-panel"
      style={{ borderBottomWidth: 2, borderTop: 0, borderLeft: 0, borderRight: 0 }}
    >
      <button
        className="rpg-btn rpg-btn-ghost md:hidden !px-2"
        onClick={onToggleLeft}
        title="Heróis"
        aria-label="Heróis"
      >
        <Users size={18} />
      </button>
      <div className="rpg-narration text-lg font-bold" style={{ color: "var(--leather)" }}>
        Portal Ayurveda RPG
      </div>
      <div className="hidden md:block text-sm rpg-system opacity-70">·</div>
      <div className="hidden md:block text-sm truncate flex-1">
        {cena?.local?.nome ? `${cena.local.nome}` : ""}
      </div>
      <div className="md:hidden flex-1" />
      <div className="hidden sm:block rpg-system text-xs opacity-80">{relogio}</div>
      <button className="rpg-btn !py-1 !px-2 text-xs" onClick={onOpenJournal} title="Diário">
        <Book size={14} className="inline mr-1" />
        Diário
      </button>
      <button className="rpg-btn rpg-btn-ghost !p-1" onClick={onOpenHelp} title="Ajuda">
        <HelpCircle size={16} />
      </button>
      <span
        className={`rpg-badge ${online ? "" : "opacity-60"}`}
        title={online ? "Conectado" : "Sem conexão"}
      >
        {online ? <Wifi size={12} className="inline" /> : <WifiOff size={12} className="inline" />}
      </span>
      <button
        className="rpg-btn rpg-btn-ghost md:hidden !px-2"
        onClick={onToggleRight}
        title="Caminho"
        aria-label="Caminho"
      >
        <MapIcon size={18} />
      </button>
      {cena && (
        <button
          className="rpg-btn rpg-btn-ghost !p-1 hidden md:inline-flex"
          onClick={() => {
            if (confirm("Sair da mesa? Você poderá reconectar com o mesmo dispositivo.")) clearSession();
          }}
          title="Sair"
        >
          <X size={14} />
        </button>
      )}
    </header>
  );
}

/* ---------------- Bússola ---------------- */
export function Compass() {
  const { cena } = useRpg();
  const [objetos, setObjetos] = useState<{ total: number; feitos: number } | null>(null);
  const { partyId } = useRpg();

  useEffect(() => {
    if (!partyId) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await rpg<any>("estado_porta", { p_party_id: partyId });
        if (cancelled) return;
        const arr = d?.objetos_detalhe ?? d?.objetos ?? [];
        if (Array.isArray(arr)) {
          setObjetos({ total: arr.length || 3, feitos: arr.filter((x: any) => x.coletado).length });
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [partyId, cena?.local?.nome, cena?.modo]);

  const dica = deriveDica(cena);
  const [flash, setFlash] = useState(false);
  const lastDica = useRef(dica);
  useEffect(() => {
    if (lastDica.current !== dica) {
      setFlash(true);
      lastDica.current = dica;
      const t = setTimeout(() => setFlash(false), 3200);
      return () => clearTimeout(t);
    }
  }, [dica]);

  return (
    <div
      className={`h-9 shrink-0 flex items-center justify-between px-4 text-sm rpg-panel-dark ${
        flash ? "rpg-compass-flash" : ""
      }`}
      style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
    >
      <div className="truncate">
        <span className="rpg-system opacity-70 mr-1">›</span>
        <span className="rpg-narration">{dica}</span>
      </div>
      {objetos && (
        <div className="rpg-system text-xs shrink-0 ml-3">
          Objetos: {objetos.feitos}/{objetos.total}
        </div>
      )}
    </div>
  );
}

function nomeDoTurno(cena: Cena | null): string | null {
  const id = cena?.party?.turno_de;
  if (!id) return null;
  return cena?.party?.herois?.find((h) => h.player_id === id)?.nome ?? null;
}

function deriveDica(cena: Cena | null): string {
  if (!cena) return "Aguardando a mesa…";
  if (cena.dica) return cena.dica;
  const eu = cena.eu?.id;
  const turno = cena.party?.turno_de;
  const nome = nomeDoTurno(cena);
  switch (cena.modo) {
    case "combate":
      if (turno === eu) return "Seu turno! Escolha uma ação.";
      return nome ? `Aguarde ${nome}…` : "Aguarde o turno…";
    case "cidade":
      return "Compre, fale com NPCs ou marque Pronto.";
    case "exploracao":
      return "Avance ou escolha um verbo.";
    case "quest":
      return "Escolha uma ação de sala.";
    case "lobby":
      return "Convide seus amigos com o código e clique em Pronto.";
    case "derrota":
      return "A party caiu.";
    default:
      return "Seu próximo passo aguarda.";
  }
}

/* ---------------- Party List ---------------- */
export function PartyList() {
  const { cena } = useRpg();
  const herois = cena?.party?.herois ?? [];
  const turno = cena?.party?.turno_de;
  const eu = cena?.eu?.id;

  return (
    <div className="h-full overflow-y-auto p-2 flex flex-col gap-2">
      <div className="rpg-system text-xs opacity-70 px-1">Grupo de Heróis</div>
      {herois.length === 0 && (
        <div className="rpg-system text-xs opacity-50 px-1">Sem heróis ainda.</div>
      )}
      {herois.map((h) => (
        <HeroCard key={h.player_id} h={h} eu={h.player_id === eu} ativo={h.player_id === turno} />
      ))}
    </div>
  );
}

function classColor(classe?: string) {
  const c = classe?.toLowerCase();
  if (c === "mago") return "cls-mago";
  if (c === "guerreiro") return "cls-guerreiro";
  if (c === "arqueiro") return "cls-verde cls-arqueiro";
  return "";
}

function HeroCard({ h, eu, ativo }: { h: Heroi; eu: boolean; ativo: boolean }) {
  const hpPct = h.max_hp ? Math.max(0, Math.min(100, (h.hp / h.max_hp) * 100)) : 0;
  const mpPct = h.max_mp ? Math.max(0, Math.min(100, (h.mp / h.max_mp) * 100)) : 0;
  return (
    <div
      className={`rpg-card p-2 ${ativo ? "ring-2" : ""}`}
      style={{ borderColor: ativo ? "var(--gold)" : undefined }}
    >
      <div className="flex items-center gap-2">
        <span className={`rpg-glyph ${classColor(h.classe)} ${ativo ? "rpg-pulse" : ""}`}>
          {h.glyph || "🧝"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">
            {h.nome} {eu && <span className="rpg-badge ml-1">eu</span>}
          </div>
          <div className="rpg-system text-[11px] opacity-70">
            {h.classe} · Lv {h.level ?? 1}
          </div>
        </div>
        {!h.vivo && <span className="rpg-badge" style={{ background: "#a83232", color: "#fff" }}>KO</span>}
      </div>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center gap-1">
          <span className="rpg-system text-[10px] w-6 opacity-70">HP</span>
          <div className="rpg-bar flex-1"><div className="rpg-bar-fill-hp" style={{ width: `${hpPct}%` }} /></div>
          <span className="rpg-system text-[10px] w-10 text-right">{h.hp}/{h.max_hp}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="rpg-system text-[10px] w-6 opacity-70">MP</span>
          <div className="rpg-bar flex-1"><div className="rpg-bar-fill-mp" style={{ width: `${mpPct}%` }} /></div>
          <span className="rpg-system text-[10px] w-10 text-right">{h.mp}/{h.max_mp}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Stage (palco) ---------------- */
export function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="shrink-0 relative overflow-hidden border-b-2"
      style={{
        height: "42%",
        background: "var(--parchment-soft)",
        borderColor: "var(--leather)",
      }}
    >
      {children}
    </div>
  );
}

export function UnitSprite({
  u,
  large,
  pulsing,
  onClick,
  targetable,
}: {
  u: CombatUnit;
  large?: boolean;
  pulsing?: boolean;
  onClick?: () => void;
  targetable?: boolean;
}) {
  const hpPct = u.max_hp ? (u.hp / u.max_hp) * 100 : 0;
  return (
    <div
      className={`flex flex-col items-center gap-1 ${targetable ? "cursor-pointer" : ""}`}
      onClick={onClick}
      style={{ minWidth: 60 }}
    >
      <div
        className={`${large ? "rpg-glyph-xl" : "rpg-glyph-lg"} ${pulsing ? "rpg-pulse" : ""}`}
        title={u.nome}
      >
        {u.glyph || "❓"}
      </div>
      <div className="rpg-system text-[10px] text-center max-w-[80px] truncate">{u.nome}</div>
      <div className="rpg-bar w-16"><div className="rpg-bar-fill-hp" style={{ width: `${Math.max(0, hpPct)}%` }} /></div>
      {u.is_boss && u.fases ? (
        <div className="rpg-system text-[10px] opacity-70">
          fase {u.fase_idx ?? 1}/{u.fases}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Narration log ---------------- */
export function NarrationLog() {
  const { log } = useRpg();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log.length]);
  return (
    <div ref={ref} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
      {log.length === 0 && (
        <div className="rpg-system text-xs opacity-50 text-center py-8">
          O mestre se prepara para narrar…
        </div>
      )}
      {log.map((e) => (
        <div key={e.id} className="text-sm">
          <span
            className={`rpg-system text-[11px] mr-2 ${
              e.quem === "Mestre" ? "" : ""
            }`}
            style={{ color: e.tipo === "erro" ? "#a83232" : "var(--gold)" }}
          >
            [{e.quem}]
          </span>
          <span className={e.tipo === "narrativa" ? "rpg-narration" : "rpg-system"}>{e.texto}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Caminho das Pedras (StonePath) ---------------- */
const NODE_GLYPH: Record<string, string> = {
  cidade: "🍺",
  quest: "🐺",
  descanso: "🏕️",
  exploracao: "⛰️",
  chefe: "💀",
  boss: "💀",
  oculto: "❓",
};

export function StonePath() {
  const { playerId } = useRpg();
  const [nodes, setNodes] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await rpg<any>("mapa", { p_player_id: playerId });
        if (cancelled) return;
        const arr = Array.isArray(d?.nos) ? d.nos : Array.isArray(d) ? d : [];
        arr.sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0));
        setNodes(arr);
        const atual = arr.find((n: any) => n.atual)?.id ?? null;
        setCurrent(atual);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const total = nodes.length || 1;
  const done = nodes.filter((n) => n.limpo).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center p-2 gap-1">
      <div className="rpg-system text-[10px] opacity-70">Caminho</div>
      {nodes.map((n, i) => (
        <div key={n.id ?? i} className="flex flex-col items-center">
          <div
            className={`path-node ${n.limpo ? "done" : ""} ${current === n.id || n.atual ? "active" : ""}`}
            title={n.nome || n.tipo}
          >
            {NODE_GLYPH[n.tipo] || "•"}
          </div>
          {i < nodes.length - 1 && <div className="path-connector" />}
        </div>
      ))}
      {nodes.length === 0 && <div className="rpg-system text-[10px] opacity-50 px-1">—</div>}
      <div className="mt-auto pt-2 rpg-system text-[10px] opacity-80">{pct}%</div>
    </div>
  );
}

/* ---------------- Toaster ---------------- */
export function RpgToaster() {
  const { toasts, dismissToast } = useRpg();
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[70] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rpg-toast pointer-events-auto"
          style={{
            borderColor:
              t.kind === "error" ? "#a83232" : t.kind === "success" ? "#166534" : "var(--leather)",
          }}
          onClick={() => dismissToast(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Ajuda (legenda) ---------------- */
export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="rpg-overlay" onClick={onClose}>
      <div className="rpg-overlay-panel" onClick={(e) => e.stopPropagation()}>
        <h2 className="rpg-narration text-xl mb-3">Como jogar</h2>
        <p className="text-sm mb-3">
          Este é um RPG por turnos narrado pelo Mestre. Cada ação rola um d20 (dado de 20 faces):
        </p>
        <ul className="text-sm space-y-1 mb-4">
          <li><span className="rpg-badge" style={{ background: "#7f1d1d", color: "#fff" }}>1</span> Erro crítico — zero dano</li>
          <li><span className="rpg-badge">2–6</span> Fraco</li>
          <li><span className="rpg-badge">7–12</span> Mediano</li>
          <li><span className="rpg-badge" style={{ background: "#d4a72b" }}>13–19</span> Forte</li>
          <li><span className="rpg-badge" style={{ background: "#b8860b", color: "#fff" }}>20</span> Especial — acerto crítico</li>
        </ul>
        <h3 className="rpg-narration text-lg mt-4 mb-2">Atributos</h3>
        <ul className="text-sm space-y-1 mb-4">
          <li><b>Força</b> — dano corpo a corpo</li>
          <li><b>Destreza</b> — mira, esquiva</li>
          <li><b>Intelecto</b> — dano de magia, mana</li>
          <li><b>Vitalidade</b> — HP</li>
          <li><b>Carisma</b> — barganha, diálogo</li>
        </ul>
        <p className="text-xs opacity-70 mb-4">
          Atributos não sobem ao subir de nível — você evolui escolhendo <b>skills</b> da árvore da sua classe.
        </p>
        <button className="rpg-btn rpg-btn-primary w-full" onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  );
}
