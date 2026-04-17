import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Users, BarChart3, TrendingUp } from "lucide-react";

/* ============================================================
   Design tokens — alinhado ao resto do portal
============================================================ */
const C = {
  primary: "#352F54",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#4ADE80",
  accent: "#FACC15",
  bg: "#FAF8F4",
  card: "#ffffff",
  border: "#EDE8F5",
  muted: "#7C7189",
  akasha: "#9b73ad",
};
const SERIF = "'Roboto Serif', serif";
const SANS = "'DM Sans', sans-serif";
const LEAF = "24px 4px 24px 4px";

/* ============================================================
   Catálogo das 36 regras (R##) com narrativa do briefing
============================================================ */
type AbaDosha = "geral" | "vata" | "pitta" | "kapha";

interface RuleMeta {
  id: string;
  titulo: string;
  insight: string;
  emoji?: string;
}

const RULES: Record<AbaDosha, RuleMeta[]> = {
  geral: [
    { id: "R13", titulo: "Vata lidera o colapso digestivo", insight: "Quando a digestão é caótica, é Vata que aparece em primeiro lugar." },
    { id: "R09", titulo: "Bomba relógio: score crítico + Agni Irregular", insight: "Desequilíbrio total somado a digestão irregular." },
    { id: "R37", titulo: "Vata adoece antes de Pitta", insight: "Vata Adoecido enquanto Pitta ainda está só em acúmulo." },
    { id: "R07", titulo: "Pitta Fixado já contaminou Vata", insight: "Quando Pitta fixa, Vata já está comprometido." },
    { id: "R33", titulo: "Inflamação acumulando dos 13 aos 49", insight: "Metade dos jovens e adultos já acumula Pitta." },
    { id: "R22", titulo: "Fase Vata da vida: 50+ com Agni Irregular", insight: "A digestão começa a falhar com a idade." },
    { id: "R49", titulo: "Dieta dos 3 doshas = score 36 pontos maior", insight: "Comer de tudo não equilibra — descompensa." },
    { id: "R47", titulo: "Paradoxo: Vata Fixado com Agni Forte", insight: "Combinação clínica raríssima — quase incompatível." },
    { id: "R48", titulo: "Paradoxo: IMC magro com Agni Fraco", insight: "Magro não é Kapha. Combinação praticamente inexistente." },
  ],
  vata: [
    { id: "R03", titulo: "Agni Irregular nível 3 → Vata Adoecido", insight: "Quase uma regra absoluta. 98.7% adoecem." },
    { id: "R44", titulo: "Vata Normal já tem Agni Irregular", insight: "Sinal precoce: o desequilíbrio começa antes do score subir." },
    { id: "R45", titulo: "Vata Normal já tem 4+ sintomas", insight: "O corpo avisa antes dos números." },
    { id: "R14", titulo: "Vata Fixado absoluto", insight: "Vata maior que Pitta + Kapha juntos. Dominância total." },
    { id: "R17", titulo: "Vata Fixado evita alimentos Pitta", insight: "Falta calor pra equilibrar o vento — só piora." },
    { id: "R21", titulo: "Vata Acúmulo evita alimentos Pitta", insight: "Padrão alimentar que antecede o colapso." },
    { id: "R39", titulo: "Vata Fixado com 5+ sintomas Pitta", insight: "Vento que pegou fogo. O Vata contaminou Pitta." },
    { id: "R41", titulo: "Vata Adoecido → Pitta Acúmulo", insight: "Progressão natural Vata → Pitta. 41.6% seguem o caminho." },
    { id: "R40", titulo: "50+ com Vata Adoecido", insight: "Quase metade dos mais velhos já chegou no estágio crítico." },
  ],
  pitta: [
    { id: "R04", titulo: "Agni Forte nível 3 → Pitta Adoecido", insight: "Fogo intenso demais queima o próprio dosha." },
    { id: "R02", titulo: "Pitta Fixado sem Agni Forte = Agni Irregular", insight: "Pitta fixado tem digestão caótica, não força." },
    { id: "R06", titulo: "Pitta Fixado sem Agni Forte → Vata Adoecido", insight: "Inflamação com raiz em Vata. 83.8% mostram esse padrão." },
    { id: "R10", titulo: "Tríade destrutiva: Pitta Fixado + Vata Adoecido + Agni Irregular", insight: "Quando os três se somam, o quadro vira complexo." },
    { id: "R11", titulo: "Pitta Fixado com 5+ sintomas Vata: burnout", insight: "O fogo que esgota o vento — padrão de exaustão." },
    { id: "R26", titulo: "Agni Forte nível 2 + Pitta Adoecido → Vata Acúmulo", insight: "Fogo médio-alto já contamina Vata." },
    { id: "R46", titulo: "Pitta oculto: score normal + 4+ sintomas", insight: "Quase 1 em 4 tem Pitta escondido nos sintomas." },
    { id: "R30", titulo: "Pitta Acúmulo evita alimentos Vata", insight: "Falta leveza pra resfriar o fogo." },
    { id: "R34", titulo: "Pitta Pouco sem Agni Forte: dieta apaga o fogo", insight: "Apagando o fogo que já era fraco — espiral pra baixo." },
  ],
  kapha: [
    { id: "R24", titulo: "Agni Fraco nível 2/3 → Kapha Acúmulo", insight: "Fogo fraco alimenta a estagnação." },
    { id: "R12", titulo: "Kapha Acúmulo + 5+ sintomas Vata", insight: "Corpo pesado, mente dispersa: o paradoxo Kapha." },
    { id: "R25", titulo: "Tripla confirmação Kapha: IMC alto + Agni Fraco + 4 sintomas", insight: "Quando os três se somam, o diagnóstico fecha." },
    { id: "R23", titulo: "Kapha Acúmulo evita alimentos Pitta", insight: "Falta fogo pra queimar a estagnação." },
    { id: "R19", titulo: "6+ sintomas Kapha + dieta pobre em Pitta", insight: "Sintomas gritando, dieta não responde." },
    { id: "R27", titulo: "Agni Fraco + Kapha Acúmulo → Pitta Normal ou abaixo", insight: "Kapha e Pitta não convivem bem no alto." },
    { id: "R28", titulo: "IMC alto + Agni Fraco evita alimentos Vata", insight: "Sem leveza, sem movimento, sem saída." },
    { id: "R31", titulo: "6+ sintomas Kapha + dieta pobre em Vata", insight: "Corpo estagnado sem o vento pra mover." },
    { id: "R32", titulo: "Kapha Acúmulo evita alimentos Vata", insight: "Metade da base Kapha sem leveza na dieta." },
  ],
};

const TAB_COLOR: Record<AbaDosha, string> = {
  geral: C.primary,
  vata: C.vata,
  pitta: C.pitta,
  kapha: C.kapha,
};

const TAB_LABEL: Record<AbaDosha, string> = {
  geral: "Geral",
  vata: "Vata",
  pitta: "Pitta",
  kapha: "Kapha",
};

/* ============================================================
   Hooks de dados
============================================================ */
type Snapshot = {
  metrica_id: string;
  familia: string;
  categoria: string;
  descricao: string;
  percentual: number | null;
  n_base: number | null;
  data_calculo: string;
};

const useLatestDate = () =>
  useQuery({
    queryKey: ["metricas-latest-date"],
    queryFn: async () => {
      const { data } = await supabase
        .from("metricas_snapshot")
        .select("data_calculo")
        .order("data_calculo", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.data_calculo ?? null) as string | null;
    },
    staleTime: 30 * 60 * 1000,
  });

const useSnapshot = (date: string | null, ids: string[] | "akasha") =>
  useQuery({
    queryKey: ["metricas-snapshot", date, ids],
    enabled: !!date,
    queryFn: async () => {
      let q = supabase
        .from("metricas_snapshot")
        .select("metrica_id, familia, categoria, descricao, percentual, n_base, data_calculo")
        .eq("data_calculo", date!);
      if (ids === "akasha") q = q.in("familia", ["Akasha", "Temporal"]);
      else q = q.in("metrica_id", ids);
      const { data } = await q;
      return (data ?? []) as Snapshot[];
    },
    staleTime: 30 * 60 * 1000,
  });

/* ============================================================
   Components
============================================================ */
const fmtPct = (v: number | null) => (v == null ? "—" : `${v.toFixed(1).replace(".", ",")}%`);
const fmtN = (n: number | null) => (n == null ? "—" : n.toLocaleString("pt-BR"));
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const MainTab = ({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-semibold transition-all"
    style={{
      fontFamily: SANS,
      borderRadius: LEAF,
      background: active ? color : "transparent",
      color: active ? "#fff" : C.primary,
      border: `1.5px solid ${active ? color : C.border}`,
      boxShadow: active ? `0 8px 24px -10px ${color}80` : "none",
    }}
  >
    {icon}
    {label}
  </button>
);

const SubTab = ({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="px-5 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap"
    style={{
      fontFamily: SANS,
      background: active ? color : "transparent",
      color: active ? "#fff" : C.primary,
      border: `1px solid ${active ? color : C.border}`,
    }}
  >
    {label}
  </button>
);

const RuleCard = ({
  rule,
  snap,
  color,
  index,
}: {
  rule: RuleMeta;
  snap: Snapshot | undefined;
  color: string;
  index: number;
}) => {
  const pct = snap?.percentual ?? null;
  // R49 = score difference (não é %), tratar como número absoluto sem barra %
  const isScoreDiff = rule.id === "R49";
  const fillPct = pct == null ? 0 : isScoreDiff ? 100 : Math.min(100, Math.max(2, pct));

  return (
    <article
      className="relative p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: LEAF,
        boxShadow: "0 2px 12px -8px rgba(53,47,84,0.18)",
        animationDelay: `${index * 40}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Header: ID + título */}
      <header className="flex items-start gap-3">
        <span
          className="shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold tabular-nums"
          style={{ background: `${color}1A`, color, fontFamily: SANS }}
        >
          {rule.id}
        </span>
        <h3
          className="font-bold leading-snug flex-1"
          style={{ fontFamily: SERIF, color: C.primary, fontSize: "15px" }}
        >
          {rule.titulo}
        </h3>
      </header>

      {/* Percentual gigante */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-bold tabular-nums leading-none"
          style={{ fontFamily: SERIF, color, fontSize: "40px" }}
        >
          {isScoreDiff ? "+36" : fmtPct(pct)}
        </span>
        {isScoreDiff && (
          <span className="text-xs font-semibold" style={{ color: C.muted, fontFamily: SANS }}>
            pontos de score
          </span>
        )}
      </div>

      {/* Barra visual */}
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: `${color}1A` }}>
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${fillPct}%`, background: color }}
        />
      </div>

      {/* Insight */}
      <p
        className="leading-relaxed flex-1"
        style={{ fontFamily: SANS, fontSize: "13px", color: `${C.primary}CC` }}
      >
        {rule.insight}
      </p>

      {/* n_base */}
      <footer
        className="text-[11px] font-medium tabular-nums uppercase tracking-wider pt-2 border-t"
        style={{ color: C.muted, fontFamily: SANS, borderColor: C.border }}
      >
        Base: {fmtN(snap?.n_base ?? null)} registros
      </footer>
    </article>
  );
};

const RuleSkeleton = () => (
  <div
    className="h-[260px] animate-pulse"
    style={{ background: `${C.border}80`, borderRadius: LEAF }}
  />
);

/* ============================================================
   Aba Métricas (Geral/Vata/Pitta/Kapha)
============================================================ */
const MetricasContent = ({ date }: { date: string | null }) => {
  const [aba, setAba] = useState<AbaDosha>("geral");
  const ids = useMemo(() => RULES[aba].map((r) => r.id), [aba]);
  const { data: snaps, isLoading } = useSnapshot(date, ids);
  const map = useMemo(() => new Map(snaps?.map((s) => [s.metrica_id, s]) ?? []), [snaps]);
  const color = TAB_COLOR[aba];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-navegação */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(["geral", "vata", "pitta", "kapha"] as AbaDosha[]).map((k) => (
          <SubTab
            key={k}
            active={aba === k}
            onClick={() => setAba(k)}
            label={TAB_LABEL[k]}
            color={TAB_COLOR[k]}
          />
        ))}
      </div>

      {/* Grade 3×3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <RuleSkeleton key={i} />)
          : RULES[aba].map((r, i) => (
              <RuleCard key={r.id} rule={r} snap={map.get(r.id)} color={color} index={i} />
            ))}
      </div>
    </div>
  );
};

/* ============================================================
   Aba Akasha — KPIs + barras temporais
============================================================ */
type TempPoint = { dia: string; msgs: number; usuarios: number };

const AkashaContent = ({ date }: { date: string | null }) => {
  const { data: snaps, isLoading } = useSnapshot(date, "akasha");

  const kpis = useMemo(() => {
    const get = (id: string) => snaps?.find((s) => s.metrica_id === id);
    return {
      total: get("AKASHA_01"),
      users: get("AKASHA_02"),
      avg: get("AKASHA_03"),
      peak: get("AKASHA_04"),
    };
  }, [snaps]);

  const temporal: TempPoint[] = useMemo(() => {
    const t = snaps?.find((s) => s.metrica_id === "TEMPORAL_AKASHA");
    if (!t?.descricao) return [];
    try {
      const arr = JSON.parse(t.descricao);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [snaps]);

  const max = Math.max(1, ...temporal.map((d) => d.msgs));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
          ))}
        </div>
        <div className="h-80 animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
      </div>
    );
  }

  const KpiCard = ({
    icon,
    label,
    value,
    sub,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
  }) => (
    <div
      className="p-5 flex flex-col gap-2"
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: LEAF }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.akasha, fontFamily: SANS }}>
          {label}
        </span>
        <span style={{ color: C.akasha }}>{icon}</span>
      </div>
      <span
        className="font-bold tabular-nums leading-none"
        style={{ fontFamily: SERIF, color: C.primary, fontSize: "32px" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: C.muted, fontFamily: SANS }}>
          {sub}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Mensagens"
          value={fmtN(kpis.total?.n_base ?? null)}
          sub="total de perguntas humanas"
        />
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          label="Usuários únicos"
          value={fmtN(kpis.users?.n_base ?? null)}
          sub="conversaram com a Akasha"
        />
        <KpiCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Média / usuário"
          value={kpis.avg?.percentual != null ? kpis.avg.percentual.toFixed(1).replace(".", ",") : "—"}
          sub="msgs por usuário"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Pico"
          value={fmtN(kpis.peak?.n_base ?? null)}
          sub="maior usuário individual"
        />
      </div>

      {/* Gráfico temporal */}
      <section
        className="p-5 md:p-7"
        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: LEAF }}
      >
        <header className="mb-5">
          <h2
            className="font-bold mb-1"
            style={{ fontFamily: SERIF, color: C.primary, fontSize: "20px" }}
          >
            Mensagens por dia
          </h2>
          <p className="text-sm" style={{ color: C.muted, fontFamily: SANS }}>
            Últimos {temporal.length} dias de conversas com a Akasha
          </p>
        </header>

        <div className="flex items-end gap-1 md:gap-1.5" style={{ height: 240 }}>
          {temporal.map((d, i) => {
            const h = (d.msgs / max) * 100;
            return (
              <div
                key={d.dia}
                className="flex-1 flex flex-col items-center gap-1 group min-w-0"
              >
                <span
                  className="text-[10px] font-semibold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: C.akasha, fontFamily: SANS }}
                >
                  {d.msgs}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${h}%`,
                    minHeight: 3,
                    background: C.akasha,
                    opacity: 0.55 + (d.msgs / max) * 0.45,
                  }}
                  title={`${d.dia}: ${d.msgs} msgs · ${d.usuarios} usuários`}
                />
              </div>
            );
          })}
        </div>

        {/* Eixo X */}
        {temporal.length > 0 && (
          <div className="flex justify-between mt-3 text-[10px]" style={{ color: C.muted, fontFamily: SANS }}>
            <span>{temporal[0].dia.slice(5)}</span>
            <span>{temporal[Math.floor(temporal.length / 2)].dia.slice(5)}</span>
            <span>{temporal[temporal.length - 1].dia.slice(5)}</span>
          </div>
        )}
      </section>
    </div>
  );
};

/* ============================================================
   Página
============================================================ */
type Aba = "metricas" | "akasha";

const Metricas = () => {
  const [aba, setAba] = useState<Aba>("metricas");
  const { data: date } = useLatestDate();

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Helmet>
        <title>Métricas Ayurvédicas | Portal Ayurveda</title>
        <meta
          name="description"
          content="Dados em tempo real de mais de 1.700 diagnósticos ayurvédicos: padrões de Vata, Pitta, Kapha e insights da IA Akasha."
        />
        <link rel="canonical" href="https://dosha-path-finder.lovable.app/metricas" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Hero */}
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <h1
            className="font-bold leading-tight"
            style={{ fontFamily: SERIF, color: C.primary, fontSize: "clamp(28px,5vw,42px)" }}
          >
            O que os dados revelam
          </h1>
          <p className="text-sm md:text-base" style={{ color: C.muted, fontFamily: SANS }}>
            Padrões reais cruzados a partir de mais de 1.700 diagnósticos da nossa base. Cada
            número é uma regra clínica observada na prática.
          </p>
        </header>

        {/* Tabs principais */}
        <nav className="flex gap-3 max-w-md mx-auto">
          <MainTab
            active={aba === "metricas"}
            onClick={() => setAba("metricas")}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Métricas"
            color={C.primary}
          />
          <MainTab
            active={aba === "akasha"}
            onClick={() => setAba("akasha")}
            icon={<MessageCircle className="w-4 h-4" />}
            label="Akasha"
            color={C.akasha}
          />
        </nav>

        {/* Conteúdo */}
        {aba === "metricas" ? <MetricasContent date={date ?? null} /> : <AkashaContent date={date ?? null} />}

        {/* Rodapé */}
        <footer className="text-center pt-4 border-t" style={{ borderColor: C.border }}>
          <p className="text-xs" style={{ color: C.muted, fontFamily: SANS }}>
            Dados atualizados em <strong style={{ color: C.primary }}>{fmtDate(date ?? null)}</strong>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Metricas;
