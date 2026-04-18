import { useMemo, useState } from "react";
import { C, SERIF, SANS, LEAF, fmtPct, fmtN } from "@/components/metricas/theme";
import { useLatestDate, useSnapshot, type Snapshot } from "@/components/metricas/useMetricasData";
import MetricasShell from "@/components/metricas/MetricasShell";

type AbaDosha = "geral" | "vata" | "pitta" | "kapha";

interface RuleMeta {
  id: string;
  titulo: string;
  insight: string;
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
      <header className="flex items-start gap-3">
        <span
          className="shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold tabular-nums"
          style={{ background: `${color}1A`, color, fontFamily: SANS }}
        >
          {rule.id}
        </span>
        <h3 className="font-bold leading-snug flex-1" style={{ fontFamily: SERIF, color: C.primary, fontSize: "15px" }}>
          {rule.titulo}
        </h3>
      </header>

      <div className="flex items-baseline gap-2">
        <span className="font-bold tabular-nums leading-none" style={{ fontFamily: SERIF, color, fontSize: "40px" }}>
          {isScoreDiff ? "+36" : fmtPct(pct)}
        </span>
        {isScoreDiff && (
          <span className="text-xs font-semibold" style={{ color: C.muted, fontFamily: SANS }}>
            pontos de score
          </span>
        )}
      </div>

      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: `${color}1A` }}>
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${fillPct}%`, background: color }}
        />
      </div>

      <p className="leading-relaxed flex-1" style={{ fontFamily: SANS, fontSize: "13px", color: `${C.primary}CC` }}>
        {rule.insight}
      </p>

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
  <div className="h-[260px] animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
);

const Metricas = () => {
  const { data: date } = useLatestDate();
  const [aba, setAba] = useState<AbaDosha>("geral");
  const ids = useMemo(() => RULES[aba].map((r) => r.id), [aba]);
  const { data: snaps, isLoading } = useSnapshot(date ?? null, ids);
  const map = useMemo(() => new Map(snaps?.map((s) => [s.metrica_id, s]) ?? []), [snaps]);
  const color = TAB_COLOR[aba];

  return (
    <MetricasShell
      title="Métricas Clínicas | Portal Ayurveda"
      description="Padrões clínicos reais cruzados com milhares de diagnósticos: Vata, Pitta, Kapha e Agni."
      canonicalPath="/metricas"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(["geral", "vata", "pitta", "kapha"] as AbaDosha[]).map((k) => (
            <SubTab key={k} active={aba === k} onClick={() => setAba(k)} label={TAB_LABEL[k]} color={TAB_COLOR[k]} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <RuleSkeleton key={i} />)
            : RULES[aba].map((r, i) => <RuleCard key={r.id} rule={r} snap={map.get(r.id)} color={color} index={i} />)}
        </div>
      </div>
    </MetricasShell>
  );
};

export default Metricas;
