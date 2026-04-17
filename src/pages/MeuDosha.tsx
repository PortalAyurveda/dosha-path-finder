import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import MetricasTab from "@/components/meudosha/MetricasTab";
import type { InsightAyurvedico } from "@/components/meudosha/MetricasTab";
import ArtigosTab from "@/components/meudosha/ArtigosTab";
import VideosTab from "@/components/meudosha/VideosTab";
import AkashaTab from "@/components/meudosha/AkashaTab";
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
  email: string | null;
  altura: string | null;
  peso: string | null;
  estado: string | null;
  cidade: string | null;
  pais: string | null;
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

// Fixed orientation: Vata at 12h → clockwise → Pitta → Kapha. Donut shape, same in all sizes.
const DoshaMiniPie = ({ vata, pitta, kapha, size = 18 }: { vata: number; pitta: number; kapha: number; size?: number }) => {
  const total = (vata || 0) + (pitta || 0) + (kapha || 0);
  if (total === 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const innerR = r * 0.45;
  const slices = [
    { pct: (vata || 0) / total, color: PIE_COLORS.Vata },
    { pct: (pitta || 0) / total, color: PIE_COLORS.Pitta },
    { pct: (kapha || 0) / total, color: PIE_COLORS.Kapha },
  ].filter((s) => s.pct > 0);

  if (slices.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block shrink-0 overflow-visible">
        <circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
        <circle cx={cx} cy={cy} r={innerR} fill="hsl(var(--card))" />
      </svg>
    );
  }

  let cumAngle = -90; // 12 o'clock
  const paths = slices.map((s, i) => {
    const angle = s.pct * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    const x1Outer = cx + r * Math.cos(startRad);
    const y1Outer = cy + r * Math.sin(startRad);
    const x2Outer = cx + r * Math.cos(endRad);
    const y2Outer = cy + r * Math.sin(endRad);
    const x1Inner = cx + innerR * Math.cos(endRad);
    const y1Inner = cy + innerR * Math.sin(endRad);
    const x2Inner = cx + innerR * Math.cos(startRad);
    const y2Inner = cy + innerR * Math.sin(startRad);
    const large = angle > 180 ? 1 : 0;
    const d = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${r} ${r} 0 ${large} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x2Inner} ${y2Inner}`,
      "Z",
    ].join(" ");
    cumAngle += angle;
    return <path key={i} d={d} fill={s.color} />;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block shrink-0 overflow-visible">
      {paths}
    </svg>
  );
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
  const radius = outerRadius + 14;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[11px] font-semibold">
      {name} {value}
    </text>
  );
};

const CACHE_STALE = 30 * 60 * 1000;
const CACHE_GC = 60 * 60 * 1000;

const MeuDosha = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const tabParam = searchParams.get('tab');
  const modeParam = searchParams.get('mode');
  const initialTab = ['perfil', 'metricas', 'artigos', 'videos', 'akasha'].includes(tabParam || '')
    ? (tabParam as string)
    : 'perfil';
  const initialMode = modeParam === 'personalizado' ? 'personalizado' : 'gerais';
  const queryClient = useQueryClient();

  // ── Registro (doshas_registros) ──
  const { data: registroRaw, isLoading: registroLoading } = useQuery({
    queryKey: ['meudosha-registro', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doshas_registros')
        .select('id, nome, doshaprincipal, vatascore, pittascore, kaphascore, agniPrincipal, agravVataTags, agravPittaTags, agravKaphaTags, imc, idade, conhecimentoAyurveda, email, altura, peso, estado, cidade, pais')
        .eq('idPublico', id!)
        .maybeSingle();
      if (error || !data) return null;
      return data;
    },
    enabled: !!id,
    staleTime: CACHE_STALE,
    gcTime: CACHE_GC,
    refetchOnWindowFocus: false,
  });

  const result: DoshaResult | null = registroRaw ? {
    nome: registroRaw.nome,
    doshaprincipal: registroRaw.doshaprincipal,
    vatascore: registroRaw.vatascore,
    pittascore: registroRaw.pittascore,
    kaphascore: registroRaw.kaphascore,
    agniPrincipal: registroRaw.agniPrincipal,
    agravVataTags: registroRaw.agravVataTags,
    agravPittaTags: registroRaw.agravPittaTags,
    agravKaphaTags: registroRaw.agravKaphaTags,
    imc: registroRaw.imc,
    idade: registroRaw.idade,
    conhecimentoAyurveda: registroRaw.conhecimentoAyurveda,
    email: registroRaw.email,
    altura: registroRaw.altura,
    peso: registroRaw.peso,
    estado: registroRaw.estado,
    cidade: registroRaw.cidade,
    pais: registroRaw.pais,
  } : null;
  const registroUuid = registroRaw?.id || null;

  // ── Glossário (portal_glossario) ──
  const { data: glossario } = useQuery({
    queryKey: ['meudosha-glossario', result?.doshaprincipal],
    queryFn: async () => {
      const { data } = await supabase
        .from('portal_glossario')
        .select('*')
        .eq('doshanome', result!.doshaprincipal!)
        .maybeSingle();
      return (data as unknown as PortalGlossario) || null;
    },
    enabled: !!result?.doshaprincipal,
    staleTime: CACHE_STALE,
    gcTime: CACHE_GC,
    refetchOnWindowFocus: false,
  });

  // ── Insights RPC ──
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights-ayurvedicos', registroUuid],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('gerar_insights_ayurvedicos', { p_registro_id: registroUuid! });
      return (data as unknown as InsightAyurvedico[]) || [];
    },
    enabled: !!registroUuid,
    staleTime: CACHE_STALE,
    gcTime: CACHE_GC,
    refetchOnWindowFocus: false,
  });

  // Realtime: update query cache on row changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`meu-dosha-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'doshas_registros',
        filter: `idPublico=eq.${id}`,
      }, (payload) => {
        queryClient.setQueryData(['meudosha-registro', id], (old: any) => ({
          ...(old || {}),
          ...payload.new,
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  // ── Prefetch tab data after registro loads (idle, low-priority) ──
  useEffect(() => {
    if (!result) return;

    const TABLE_MAP: Record<string, "portal_vata" | "portal_pitta" | "portal_kapha"> = {
      Vata: "portal_vata",
      Pitta: "portal_pitta",
      Kapha: "portal_kapha",
    };

    const run = () => {
      // Articles (no search filters)
      queryClient.prefetchQuery({
        queryKey: ["meudosha-artigos", "", false],
        queryFn: async () => {
          const { data } = await supabase
            .from("portal_conteudo")
            .select("id, title, summary, link_do_artigo, meta_description, tags, image_url, created_at")
            .order("created_at", { ascending: false });
          return data || [];
        },
        staleTime: 15 * 60 * 1000,
      });

      // General videos for the user's primary dosha(s)
      const doshas = (result.doshaprincipal || "Vata")
        .split("-")
        .map((d) => d.trim())
        .filter((d) => TABLE_MAP[d]);
      queryClient.prefetchQuery({
        queryKey: ["meudosha-videos-general", result.doshaprincipal],
        queryFn: async () => {
          const results: any[] = [];
          for (const dosha of doshas) {
            const table = TABLE_MAP[dosha];
            const { data } = await supabase
              .from(table)
              .select("video_id, novo_titulo, mini_resumo, tags")
              .order("criado_em", { ascending: false })
              .limit(3);
            if (data) results.push(...data);
          }
          return results;
        },
        staleTime: 15 * 60 * 1000,
      });
    };

    const w = window as any;
    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(run, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(handle);
    } else {
      const t = setTimeout(run, 600);
      return () => clearTimeout(t);
    }
  }, [result, queryClient]);

  if (registroLoading) {
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

        {/* ===== TABS ===== */}
        <Tabs defaultValue={initialTab} className="w-full">
          <div className="sticky top-0 z-[60] -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
          <TabsList className="w-full grid grid-cols-5 h-auto max-w-6xl mx-auto">
            <TabsTrigger value="perfil" className="text-xs sm:text-sm py-2 flex items-center gap-1">
              <DoshaMiniPie vata={result.vatascore ?? 0} pitta={result.pittascore ?? 0} kapha={result.kaphascore ?? 0} />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="metricas" className="text-xs sm:text-sm py-2">Métricas</TabsTrigger>
            <TabsTrigger value="artigos" className="text-xs sm:text-sm py-2">Artigos</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm py-2">Vídeos</TabsTrigger>
            <TabsTrigger value="akasha" className="text-xs sm:text-sm py-2 flex items-center gap-1">
              Akasha
              <img src="https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png" alt="" className="w-4 h-4 object-contain" />
            </TabsTrigger>
          </TabsList>
          </div>

          {/* ===== TAB: PERFIL ===== */}
          <TabsContent value="perfil" className="space-y-6 mt-4" tabIndex={-1}>
            {/* Clinical Dashboard */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">
                <div className="flex flex-col items-center">
                  <h2 className="font-serif font-bold text-foreground text-base mb-2 text-center">Pontuação dos Doshas</h2>
                  <div className="w-full" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={32} dataKey="value" startAngle={90} endAngle={-270} label={CustomPieLabel} labelLine={false} strokeWidth={2} stroke="hsl(var(--card))">
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
                  </div>
                  {result.agniPrincipal && (
                    <div className="w-full bg-surface-sun rounded-lg border border-border p-3 mt-3">
                      <h3 className="font-serif font-bold text-foreground text-sm mb-1">Fogo Digestivo (Agni)</h3>
                      <p className="text-xs text-muted-foreground">{result.agniPrincipal}</p>
                    </div>
                  )}
                </div>
                <ClinicalThermometer doshaScores={doshaScores} />
              </div>
              <div className="border-t border-border pt-4">
                <DoshaLevelBullets doshaScores={doshaScores} />
              </div>
              {hasAgrav && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-serif font-bold text-foreground text-sm mb-3">Agravamentos Detectados</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-vata uppercase text-center">Vata</p>
                      {result.agravVataTags ? (
                        <div className="flex flex-col gap-1">
                          {result.agravVataTags.split(',').map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-vata/10 text-vata border border-vata/30 text-center">{t.trim()}</span>
                          ))}
                        </div>
                      ) : <p className="text-[10px] text-muted-foreground text-center">—</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-pitta uppercase text-center">Pitta</p>
                      {result.agravPittaTags ? (
                        <div className="flex flex-col gap-1">
                          {result.agravPittaTags.split(',').map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-pitta/10 text-pitta border border-pitta/30 text-center">{t.trim()}</span>
                          ))}
                        </div>
                      ) : <p className="text-[10px] text-muted-foreground text-center">—</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-kapha uppercase text-center">Kapha</p>
                      {result.agravKaphaTags ? (
                        <div className="flex flex-col gap-1">
                          {result.agravKaphaTags.split(',').map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-1 rounded-md bg-kapha/10 text-kapha border border-kapha/30 text-center">{t.trim()}</span>
                          ))}
                        </div>
                      ) : <p className="text-[10px] text-muted-foreground text-center">—</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Glossary */}
            {glossario && (
              <div className="space-y-4">
                <h2 className="font-serif font-bold text-foreground text-xl text-center">
                  Sobre o Dosha {glossario.doshaNome || glossario.Title}
                </h2>
                <ExpandableSection title="O que é?" content={glossario.oque} icon="🧬" />
                <ThreeColumnTable atributos={glossario.atributos} equilibrio={glossario.equilibrio} desequilibrio={glossario.desequilibrio} />
                <ExpandableSection title="Principais Causas" content={glossario.principaisCausas} icon="⚡" />
                <ExpandableSection title="Principais Enfermidades" content={glossario.principaisDoencas} icon="🩺" />
                <ExpandableSection title="Caminhos de Equilíbrio" content={glossario.caminhosEquilibrio} icon="🌿" />
                <ExpandableSection title="Alimentos a Priorizar" content={glossario.alimentosPriorizar} icon="✅" />
                <ExpandableSection title="Alimentos a Evitar" content={glossario.alimentosEvitar} icon="🚫" />
              </div>
            )}

            {/* Links */}
            <div className="space-y-3 pb-8">
              <h2 className="font-serif font-bold text-foreground text-lg text-center">O que deseja fazer?</h2>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (result) {
                    localStorage.setItem('dosha_test_info', JSON.stringify({
                      nome: result.nome || '',
                      idade: result.idade?.toString() || '',
                      nivel: result.conhecimentoAyurveda || 'Iniciante',
                      email: result.email || '',
                      altura: result.altura || '',
                      peso: result.peso || '',
                      estado: result.estado || '',
                      cidade: result.cidade || '',
                      paisCidade: result.pais || '',
                    }));
                  }
                  window.location.href = '/teste-de-dosha';
                }}
              >
                Refazer Teste
              </Button>
            </div>
          </TabsContent>

          {/* ===== TAB: MÉTRICAS ===== */}
          <TabsContent value="metricas" tabIndex={-1}>
            <MetricasTab registroUuid={registroUuid} insights={insights} isLoading={insightsLoading} />
          </TabsContent>

          {/* ===== TAB: ARTIGOS ===== */}
          <TabsContent value="artigos" tabIndex={-1}>
            <ArtigosTab
              doshaprincipal={result.doshaprincipal}
              agravVataTags={result.agravVataTags}
              agravPittaTags={result.agravPittaTags}
              agravKaphaTags={result.agravKaphaTags}
              initialMode={initialMode === 'personalizado' ? 'personalizado' : 'geral'}
            />
          </TabsContent>

          {/* ===== TAB: VÍDEOS ===== */}
          <TabsContent value="videos" tabIndex={-1}>
            <VideosTab
              doshaprincipal={result.doshaprincipal}
              agravVataTags={result.agravVataTags}
              agravPittaTags={result.agravPittaTags}
              agravKaphaTags={result.agravKaphaTags}
              initialMode={initialMode}
            />
          </TabsContent>

          {/* ===== TAB: AKASHA ===== */}
          <TabsContent value="akasha" tabIndex={-1}>
            <AkashaTab
              idPublico={id}
              nome={result.nome}
              doshaprincipal={result.doshaprincipal}
              imc={result.imc}
              idade={result.idade}
              vatascore={result.vatascore}
              pittascore={result.pittascore}
              kaphascore={result.kaphascore}
              agniPrincipal={result.agniPrincipal}
              conhecimentoAyurveda={result.conhecimentoAyurveda}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default MeuDosha;
