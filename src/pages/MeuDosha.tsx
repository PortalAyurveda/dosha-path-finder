import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DoshaResult {
  nome: string | null;
  doshaprincipal: string | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  imc: number | null;
  idade: number | null;
  conhecimentoAyurveda: string | null;
}

interface PortalGlossario {
  Title: string | null;
  doshaNome: string | null;
  oque: string | null;
  equilibrio: string | null;
  desequilibrio: string | null;
  principaisCausas: string | null;
  principaisDoencas: string | null;
  alimentosEvitar: string | null;
  alimentosPriorizar: string | null;
  rotinasEquilibrar: string | null;
  rotinasInadequadas: string | null;
  dicasGeraisFazer: string | null;
  dicasGeraisNaoFazer: string | null;
  atributos: string | null;
  caminhosEquilibrio: string | null;
}

const DOSHA_COLORS_BADGE: Record<string, string> = {
  Vata: 'bg-vata/20 text-vata border-vata',
  Pitta: 'bg-pitta/20 text-pitta border-pitta',
  Kapha: 'bg-kapha/20 text-kapha border-kapha',
};

const PIE_COLORS: Record<string, string> = {
  Vata: '#4F75FF',
  Pitta: '#FF5C5C',
  Kapha: '#22C55E',
};

const DOSHA_ROUTES: Record<string, string> = {
  Vata: '/biblioteca/vata',
  Pitta: '/biblioteca/pitta',
  Kapha: '/biblioteca/kapha',
};

const VATA_LEVELS = [
  { label: 'Fixado', range: '50+', min: 50, max: 999 },
  { label: 'Adoecido', range: '36-49', min: 36, max: 49 },
  { label: 'Acúmulo', range: '25-35', min: 25, max: 35 },
  { label: 'Normal', range: '15-24', min: 15, max: 24 },
  { label: 'Pouco', range: '0-14', min: 0, max: 14 },
];

const PITTA_LEVELS = [
  { label: 'Fixado', range: '50+', min: 50, max: 999 },
  { label: 'Adoecido', range: '41-49', min: 41, max: 49 },
  { label: 'Acúmulo', range: '31-40', min: 31, max: 40 },
  { label: 'Normal', range: '15-30', min: 15, max: 30 },
  { label: 'Pouco', range: '0-14', min: 0, max: 14 },
];

const KAPHA_LEVELS = [
  { label: 'Fixado', range: '60+', min: 60, max: 999 },
  { label: 'Adoecido', range: '51-59', min: 51, max: 59 },
  { label: 'Acúmulo', range: '36-50', min: 36, max: 50 },
  { label: 'Normal', range: '15-35', min: 15, max: 35 },
  { label: 'Pouco', range: '0-14', min: 0, max: 14 },
];

const DOSHA_LEVELS: Record<string, typeof VATA_LEVELS> = {
  Vata: VATA_LEVELS,
  Pitta: PITTA_LEVELS,
  Kapha: KAPHA_LEVELS,
};

const DOSHA_COLOR_SCALE: Record<string, string[]> = {
  Vata: ['#D6E0FF', '#A3C1FF', '#709AFF', '#4F75FF', '#2A4BCC'],
  Pitta: ['#FFE0E0', '#FFB3B3', '#FF8585', '#FF5C5C', '#CC3333'],
  Kapha: ['#D1F4E0', '#9AE6B8', '#5ED58F', '#22C55E', '#15803D'],
};

// Dosha level interpretations
const DOSHA_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Vata: {
    'Pouco': 'Dosha em déficit. Falta movimento ou leveza. Precisa ser estimulado suavemente para não estagnar a mente e a comunicação do corpo.',
    'Normal': 'Sob controle. Seu foco é a prevenção. Mantenha a rotina aterrada para não agravar com excessos de estímulos secos, frios e arritmia no dia a dia.',
    'Acúmulo': 'Problema recorrente (gases, ansiedade leve). Requer ao menos 3 ações umectantes e aterradoras por dia para reduzir a secura e o vento excessivo.',
    'Adoecido': 'O desequilíbrio se espalhou (insônia, dores articulares, constipação). Requer remover as influências erradas, nutrir o sistema nervoso, tempo e constância.',
    'Fixado': 'Estado grave. A secura e o desgaste afetaram múltiplos tecidos, ossos e a mente profunda. Tratamento intensivo e umectante urgente (5+ ações diárias).',
  },
  Pitta: {
    'Pouco': 'Dosha em déficit. Fogo metabólico baixo e falta de capacidade de transformação. Precisa ser estimulado com especiarias e calor.',
    'Normal': 'Sob controle. Seu foco é a prevenção. Evite excesso de estresse, atritos e alimentos muito quentes/picantes para não inflamar o dia a dia.',
    'Acúmulo': 'Problema recorrente (azia, irritabilidade, calor). Requer ao menos 3 ações refrescantes específicas por dia para reduzir o excesso de fogo.',
    'Adoecido': 'A inflamação se espalhou (pele, gastrite crônica, queimação). Requer remover alimentos ácidos, focar em resfriar os tecidos, tempo e constância.',
    'Fixado': 'Estado crítico. A inflamação já comprometeu órgãos como fígado, sangue e visão. Tratamento intensivo e anti-inflamatório urgente (5+ ações diárias).',
  },
  Kapha: {
    'Pouco': 'Dosha em déficit. Falta estabilidade física e resistência imunológica. Precisa ser nutrido para proteger e lubrificar os tecidos.',
    'Normal': 'Sob controle. Seu foco é a prevenção. Mantenha o corpo em movimento e evite excesso de alimentos densos, doces e frios no dia a dia.',
    'Acúmulo': 'Problema recorrente (letargia, retenção de líquido, muco leve). Requer ao menos 3 ações termogênicas e estimulantes por dia para secar o excesso.',
    'Adoecido': 'O peso e o muco se espalharam (digestão lenta, pulmão carregado, ganho de peso). Requer remover doces/laticínios, inserir especiarias quentes e constância.',
    'Fixado': 'Estado grave. Estagnação profunda afetando múltiplos tecidos (obesidade instalada, síndrome metabólica). Tratamento intensivo termogênico urgente (5+ ações diárias).',
  },
};

function getLevelIndex(score: number, levels: typeof VATA_LEVELS): number {
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].min && score <= levels[i].max) return levels.length - i;
  }
  return 1;
}

function getLevel(score: number, levels: typeof VATA_LEVELS) {
  for (const l of levels) {
    if (score >= l.min && score <= l.max) return l.label;
  }
  return 'Normal';
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isValidContent(content: string | null): boolean {
  if (!content) return false;
  const stripped = stripHtml(content);
  if (stripped.length < 30) return false;
  if (/^[a-f0-9-]{36}$/i.test(stripped)) return false;
  return true;
}

const LEVEL_LABELS = ['Fixado', 'Adoecido', 'Acúmulo', 'Normal', 'Pouco'];

const ClinicalThermometer = ({ doshaScores }: { doshaScores: { name: string; score: number }[] }) => {
  const doshaData = doshaScores.map(d => {
    const levels = DOSHA_LEVELS[d.name] || VATA_LEVELS;
    const currentLevel = getLevelIndex(d.score, levels);
    const colors = DOSHA_COLOR_SCALE[d.name];
    return { ...d, currentLevel, colors, levels };
  });

  return (
    <div>
      <h2 className="font-serif font-bold text-foreground text-base mb-3 text-center">Quadro Clínico</h2>
      {/* Score summary */}
      <div className="flex justify-center gap-6 mb-4">
        {doshaData.map(d => (
          <div key={d.name} className="text-center">
            <p className="text-sm font-bold text-foreground">{d.name}</p>
            <p className="text-2xl font-bold" style={{ color: PIE_COLORS[d.name] }}>{d.score}</p>
            <p className="text-xs text-muted-foreground">{getLevel(d.score, d.levels)}</p>
          </div>
        ))}
      </div>

      {/* Thermometer grid: [Y-axis] [Vata] [Pitta] [Kapha] */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1.5 gap-y-[3px]">
        {LEVEL_LABELS.map((label, rowIdx) => {
          const levelNum = 5 - rowIdx; // 5=Fixado, 1=Pouco

          return (
            <div key={label} className="contents">
              {/* Y-axis label */}
              <div className="flex flex-col justify-center items-end pr-2 h-14">
                <span className="text-xs font-semibold text-muted-foreground leading-none">{label}</span>
              </div>

              {/* 3 dosha columns — each with its own range inside */}
              {doshaData.map(d => {
                const isFilled = levelNum <= d.currentLevel;
                const isActiveLevel = levelNum === d.currentLevel;
                const bgColor = isFilled ? d.colors[levelNum - 1] : undefined;
                const doshaLevelData = d.levels[rowIdx]; // range for this specific dosha at this row

                return (
                  <div
                    key={d.name}
                    className={cn(
                      "h-14 rounded-sm transition-all flex items-center justify-center",
                      isFilled ? "shadow-sm" : "bg-muted/20",
                      isActiveLevel && "ring-2 ring-offset-1 ring-foreground/20"
                    )}
                    style={isFilled ? { backgroundColor: bgColor } : undefined}
                  >
                    <span className={cn(
                      "text-[11px] font-semibold",
                      isFilled ? "text-foreground/80" : "text-muted-foreground/40"
                    )}>
                      {doshaLevelData.range}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Column headers below */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1.5 mt-1.5">
        <div />
        {doshaData.map(d => (
          <p key={d.name} className="text-xs font-bold text-center" style={{ color: PIE_COLORS[d.name] }}>
            {d.name}
          </p>
        ))}
      </div>
    </div>
  );
};

// Level interpretation bullets below thermometer
const DoshaLevelBullets = ({ doshaScores }: { doshaScores: { name: string; score: number }[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {doshaScores.map(d => {
        const levels = DOSHA_LEVELS[d.name] || VATA_LEVELS;
        const levelLabel = getLevel(d.score, levels);
        const levelIdx = getLevelIndex(d.score, levels);
        const color = DOSHA_COLOR_SCALE[d.name]?.[levelIdx - 1] || PIE_COLORS[d.name];
        const interpretation = DOSHA_INTERPRETATIONS[d.name]?.[levelLabel] || '';

        return (
          <div
            key={d.name}
            className="rounded-lg border p-3 space-y-1.5"
            style={{ borderColor: color, backgroundColor: `${color}15` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <p className="text-sm font-bold" style={{ color }}>
                {d.name} — {levelLabel}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {interpretation}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const ExpandableSection = ({ title, content, icon }: { title: string; content: string | null; icon: string }) => {
  const [expanded, setExpanded] = useState(false);
  if (!isValidContent(content)) return null;

  const plainText = stripHtml(content!);
  const lines = plainText.split('\n').filter(l => l.trim());
  const previewLines = lines.slice(0, 4).join('\n');
  const needsExpand = lines.length > 4;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <h3 className="font-serif font-bold text-foreground text-base flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {expanded ? plainText : previewLines + (needsExpand ? '...' : '')}
      </p>
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
        >
          {expanded ? (
            <>Recolher <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Saiba mais <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

// 3-column table: Atributos / Equilíbrio / Desequilíbrio
const ThreeColumnTable = ({ atributos, equilibrio, desequilibrio }: {
  atributos: string | null;
  equilibrio: string | null;
  desequilibrio: string | null;
}) => {
  const parseTags = (content: string | null): string[] => {
    if (!content || content.trim().length < 3) return [];
    const stripped = stripHtml(content);
    // Split by newline first, then fallback to other separators
    const items = stripped.split(/\n/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 80);
    if (items.length >= 2) return items.slice(0, 5);
    // Fallback: comma/bullet separated
    return stripped.split(/[,•·–—|]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 80).slice(0, 5);
  };

  const attrTags = parseTags(atributos);
  const eqTags = parseTags(equilibrio);
  const desTags = parseTags(desequilibrio);

  const maxRows = Math.max(attrTags.length, eqTags.length, desTags.length, 5);
  if (maxRows === 0) return null;

  // Pad arrays to same length
  const pad = (arr: string[], len: number) => {
    const result = [...arr];
    while (result.length < len) result.push('');
    return result;
  };

  const rows = pad(attrTags, maxRows).map((_, i) => ({
    attr: pad(attrTags, maxRows)[i],
    eq: pad(eqTags, maxRows)[i],
    des: pad(desTags, maxRows)[i],
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase text-center">Atributos</p>
        <p className="text-xs font-bold text-muted-foreground uppercase text-center">Equilíbrio</p>
        <p className="text-xs font-bold text-muted-foreground uppercase text-center">Desequilíbrio</p>
      </div>
      {/* Rows */}
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <span className="text-xs px-2 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-center leading-tight min-h-[28px] flex items-center justify-center">
              {row.attr || '—'}
            </span>
            <span className="text-xs px-2 py-1.5 rounded-md bg-kapha/10 text-kapha border border-kapha/20 text-center leading-tight min-h-[28px] flex items-center justify-center">
              {row.eq || '—'}
            </span>
            <span className="text-xs px-2 py-1.5 rounded-md bg-pitta/10 text-pitta border border-pitta/20 text-center leading-tight min-h-[28px] flex items-center justify-center">
              {row.des || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
      {name} {value}
    </text>
  );
};

const MeuDosha = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DoshaResult | null>(null);
  const [glossario, setGlossario] = useState<PortalGlossario | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const fetchData = async () => {
      const { data: registro, error } = await supabase
        .from('doshas_registros2')
        .select('nome, doshaprincipal, vatascore, pittascore, kaphascore, agniPrincipal, agravVataTags, agravPittaTags, agravKaphaTags, imc, idade, conhecimentoAyurveda')
        .eq('idPublico', id)
        .maybeSingle();

      if (error || !registro) {
        setLoading(false);
        return;
      }

      setResult(registro);

      if (registro.doshaprincipal) {
        const doshaName = registro.doshaprincipal.split('-')[0];
        const { data: glossData } = await supabase
          .from('portal_glossario')
          .select('*')
          .eq('doshaNome', registro.doshaprincipal)
          .maybeSingle();
        if (glossData) setGlossario(glossData as unknown as PortalGlossario);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PageContainer title="Meu Dosha" description="Carregando resultado...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!id || !result) {
    return (
      <PageContainer title="Meu Dosha" description="Resultado não encontrado.">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
          <p className="text-xl font-serif text-foreground">Resultado não encontrado</p>
          <p className="text-muted-foreground">Faça o teste para descobrir seu dosha.</p>
          <Button asChild><Link to="/teste-de-dosha">Fazer o Teste</Link></Button>
        </div>
      </PageContainer>
    );
  }

  const doshaScores = [
    { name: 'Vata', score: result.vatascore || 0 },
    { name: 'Pitta', score: result.pittascore || 0 },
    { name: 'Kapha', score: result.kaphascore || 0 },
  ];

  const pieData = doshaScores.map(d => ({ name: d.name, value: d.score }));
  const totalScore = doshaScores.reduce((s, d) => s + d.score, 0);

  const primaryDosha = result.doshaprincipal?.split('-')[0] || 'Vata';
  const badgeClass = DOSHA_COLORS_BADGE[primaryDosha] || DOSHA_COLORS_BADGE.Vata;

  const hasAgrav = result.agravVataTags || result.agravPittaTags || result.agravKaphaTags;

  return (
    <PageContainer title={`Meu Dosha — ${result.nome}`} description={`Resultado do teste de dosha de ${result.nome}: ${result.doshaprincipal}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ===== HEADER ===== */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Seu Dosha principal é: <span style={{ color: PIE_COLORS[primaryDosha] }}>{result.doshaprincipal}</span>
          </h1>
          <p className="text-muted-foreground text-sm">O que isso significa, {result.nome}?</p>
        </div>

        {/* ===== CLINICAL DASHBOARD ===== */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">

          {/* Row 1: Pie Chart + Thermometer */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">

            {/* Pie Chart + Fogo Digestivo */}
            <div className="flex flex-col items-center">
              <h2 className="font-serif font-bold text-foreground text-base mb-2 text-center">Pontuação dos Doshas</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={40}
                    dataKey="value"
                    label={CustomPieLabel}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} pts (${totalScore > 0 ? Math.round((value / totalScore) * 100) : 0}%)`, name]}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Fogo Digestivo below pie */}
              {result.agniPrincipal && (
                <div className="w-full bg-surface-sun rounded-lg border border-border p-3 mt-3">
                  <h3 className="font-serif font-bold text-foreground text-sm mb-1">Fogo Digestivo (Agni)</h3>
                  <p className="text-xs text-muted-foreground">{result.agniPrincipal}</p>
                </div>
              )}
            </div>

            {/* Thermometer */}
            <ClinicalThermometer doshaScores={doshaScores} />
          </div>

          {/* Level Interpretation Bullets — inside dashboard */}
          <div className="border-t border-border pt-4">
            <DoshaLevelBullets doshaScores={doshaScores} />
          </div>

          {/* Agravamentos in 3 vertical columns below */}
          {hasAgrav && (
            <div className="border-t border-border pt-4">
              <h3 className="font-serif font-bold text-foreground text-sm mb-3">Agravamentos Detectados</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Vata */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-vata uppercase text-center">Vata</p>
                  {result.agravVataTags ? (
                    <div className="flex flex-col gap-1">
                      {result.agravVataTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-vata/10 text-vata border border-vata/30 text-center">{t.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground text-center">—</p>
                  )}
                </div>
                {/* Pitta */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-pitta uppercase text-center">Pitta</p>
                  {result.agravPittaTags ? (
                    <div className="flex flex-col gap-1">
                      {result.agravPittaTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-pitta/10 text-pitta border border-pitta/30 text-center">{t.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground text-center">—</p>
                  )}
                </div>
                {/* Kapha */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-kapha uppercase text-center">Kapha</p>
                  {result.agravKaphaTags ? (
                    <div className="flex flex-col gap-1">
                      {result.agravKaphaTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-kapha/10 text-kapha border border-kapha/30 text-center">{t.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground text-center">—</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== GLOSSARY INFO PACK ===== */}
        {glossario && (
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-foreground text-xl text-center">
              Sobre o Dosha {glossario.doshaNome || glossario.Title}
            </h2>

            <ExpandableSection title="O que é?" content={glossario.oque} icon="🧬" />

            {/* 3-column table */}
            <ThreeColumnTable
              atributos={glossario.atributos}
              equilibrio={glossario.equilibrio}
              desequilibrio={glossario.desequilibrio}
            />

            <ExpandableSection title="Principais Causas" content={glossario.principaisCausas} icon="⚡" />
            <ExpandableSection title="Principais Enfermidades" content={glossario.principaisDoencas} icon="🩺" />
            <ExpandableSection title="Caminhos de Equilíbrio" content={glossario.caminhosEquilibrio} icon="🌿" />
            <ExpandableSection title="Alimentos a Priorizar" content={glossario.alimentosPriorizar} icon="✅" />
            <ExpandableSection title="Alimentos a Evitar" content={glossario.alimentosEvitar} icon="🚫" />
            <ExpandableSection title="Rotinas de Equilíbrio" content={glossario.rotinasEquilibrar} icon="🌅" />
            <ExpandableSection title="Dicas: O que Fazer" content={glossario.dicasGeraisFazer} icon="👍" />
            <ExpandableSection title="Dicas: Não Fazer" content={glossario.dicasGeraisNaoFazer} icon="👎" />
          </div>
        )}

        {/* ===== LINKS ===== */}
        <div className="space-y-3 pb-8">
          <h2 className="font-serif font-bold text-foreground text-lg text-center">Aprofunde-se</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {doshaScores.map(d => (
              <Button key={d.name} variant="outline" asChild className="w-full">
                <Link to={DOSHA_ROUTES[d.name]}>
                  Biblioteca {d.name} <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink} className="flex-1">
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copiado!' : 'Compartilhar Resultado'}
            </Button>
            <Button asChild className="flex-1">
              <Link to="/teste-de-dosha">Refazer Teste</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MeuDosha;
