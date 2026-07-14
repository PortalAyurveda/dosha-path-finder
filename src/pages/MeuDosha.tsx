import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trackPixel } from "@/lib/metaPixel";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, ChevronUp, Calendar, CalendarDays, Play, Video as VideoIcon, BookOpen, Brain, LineChart, Lock, RefreshCw, ChevronRight } from "lucide-react";
import EvolucaoSheet from "@/components/meudosha/EvolucaoSheet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import MetricasTab from "@/components/meudosha/MetricasTab";
import type { InsightAyurvedico } from "@/components/meudosha/MetricasTab";
import ArtigosTab from "@/components/meudosha/ArtigosTab";
import DiagnosticoCompleto from "@/components/meudosha/DiagnosticoCompleto";
import VideosTab from "@/components/meudosha/VideosTab";
import AkashaTab from "@/components/meudosha/AkashaTab";
import RetesteCard from "@/components/meudosha/RetesteCard";
import PraVoceRail from "@/components/meudosha/PraVoceRail";
import ClaimLock from "@/components/meudosha/ClaimLock";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useUser } from "@/contexts/UserContext";
import { useEscolaAluno } from "@/hooks/useEscolaAluno";
import { getPaletteBranding } from "@/data/landingPalettes";
import { formatModuloFimDeSemana, formatModuloHorarios } from "@/lib/escolaModuloDatas";

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
  created_at: string | null;
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
  Vata: '#6B8AFF',
  Pitta: '#FF7676',
  Kapha: '#9ED88B',
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
  { label: 'Normal', range: '17-24', min: 17, max: 24 },
  { label: 'Pouco', range: '0-16', min: 0, max: 16 },
];

const PITTA_LEVELS = [
  { label: 'Fixado', range: '50+', min: 50, max: 999 },
  { label: 'Adoecido', range: '41-49', min: 41, max: 49 },
  { label: 'Acúmulo', range: '31-40', min: 31, max: 40 },
  { label: 'Normal', range: '20-30', min: 20, max: 30 },
  { label: 'Pouco', range: '0-19', min: 0, max: 19 },
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
  Vata: ['#D6E0FF', '#A3C1FF', '#709AFF', '#6B8AFF', '#2A4BCC'],
  Pitta: ['#FFE0E0', '#FFB3B3', '#FF8585', '#FF7676', '#CC3333'],
  Kapha: ['#D1F4E0', '#9AE6B8', '#5ED58F', '#9ED88B', '#15803D'],
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

type Modulo = {
  id: string;
  numero: number;
  semestre: number | null;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  zoom_url: string | null;
  slug: string | null;
  liberado: boolean;
};

const pickCurrentModulo = (mods: Modulo[]): Modulo | null => {
  if (mods.length === 0) return null;
  const now = Date.now();
  const emCurso = mods.find((m) => {
    const start = new Date(m.data_inicio).getTime();
    const end = new Date(m.data_fim).getTime();
    return start <= now && now <= end;
  });
  if (emCurso) return emCurso;
  const futuros = mods
    .filter((m) => new Date(m.data_inicio).getTime() > now)
    .sort((a, b) => +new Date(a.data_inicio) - +new Date(b.data_inicio));
  if (futuros[0]) return futuros[0];
  const passados = mods
    .filter((m) => new Date(m.data_fim).getTime() < now)
    .sort((a, b) => +new Date(b.data_fim) - +new Date(a.data_fim));
  return passados[0] ?? mods[0];
};

const FormacaoDestaqueCard = () => {
  const { aluno } = useEscolaAluno();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!aluno) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("escola_modulos")
      .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,zoom_url,slug,liberado")
      .order("numero", { ascending: true });
    setModulos((data ?? []) as Modulo[]);
    setLoading(false);
  }, [aluno]);

  useEffect(() => {
    load();
  }, [load]);

  if (!aluno || loading) return null;

  const atual = pickCurrentModulo(modulos);
  const theme = getPaletteBranding("formacao-azul");

  return (
    <div
      className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white"
      style={{ borderColor: `${theme.primaryColor}33` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: theme.primaryColor }}
      />
      <img
        src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo-mono.webp"
        alt=""
        aria-hidden
        className="absolute right-0 top-1/2 -translate-y-1/2 h-[110%] w-auto opacity-[0.09] pointer-events-none"
      />
      <div className="relative p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Formação em Ayurveda</span>
        </div>
        <h2
          className="font-serif text-xl md:text-2xl font-bold italic leading-snug"
          style={{ color: theme.darkColor }}
        >
          Sua Formação em Ayurveda
        </h2>
        {atual ? (
          <div className="space-y-1">
            <p className="text-sm text-foreground/80">
              Próximo módulo: <span className="font-semibold" style={{ color: theme.darkColor }}>{atual.titulo}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatModuloFimDeSemana(atual.data_inicio)} · {formatModuloHorarios(atual.tipo)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Acesse a Área do Aluno para ver seus módulos.</p>
        )}
        <Button
          asChild
          className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm h-11 px-5"
          style={{ background: theme.primaryColor, color: "#fff" }}
        >
          <Link to="/escola/aluno">
            Entrar na Área do Aluno <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

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
  const { user, profile, doshaResult, loading: authLoading } = useUser();
  const isPremium = !!profile?.is_premium;
  const navigate = useNavigate();
  const [evolucaoOpen, setEvolucaoOpen] = useState(false);

  // Já existe revisão concluída? -> botão vira "Ver revisão"
  const { data: hasRevisaoConcluida } = useQuery({
    queryKey: ["meudosha-revisao-concluida", user?.email],
    enabled: !!user?.email,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("reteste_sessao" as any)
        .select("id")
        .eq("user_email", user!.email!)
        .eq("status", "concluido")
        .limit(1)
        .maybeSingle();
      return !!data;
    },
  });

  // Se o usuário logado caiu em /meu-dosha sem ?id, redireciona para o id do
  // seu teste personalizado, preservando outros parâmetros (tab, mode).
  useEffect(() => {
    if (!id && doshaResult?.idPublico) {
      const params = new URLSearchParams(searchParams);
      params.set('id', doshaResult.idPublico);
      navigate(`/meu-dosha?${params.toString()}`, { replace: true });
    }
  }, [id, doshaResult?.idPublico]);

  // ── Registro (doshas_registros) ──
  const { data: registroRaw, isLoading: registroLoading } = useQuery({
    queryKey: ['meudosha-registro', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doshas_registros')
        .select('id, nome, doshaprincipal, vatascore, pittascore, kaphascore, agniPrincipal, agravVataTags, agravPittaTags, agravKaphaTags, imc, idade, conhecimentoAyurveda, email, altura, peso, estado, cidade, pais, created_at')
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
    created_at: (registroRaw as any).created_at ?? null,
  } : null;
  const registroUuid = registroRaw?.id || null;

  // Meta Pixel: dispara CompleteRegistration uma única vez quando os resultados carregam
  const pixelTestePixelFiredRef = useRef(false);
  useEffect(() => {
    if (result && !pixelTestePixelFiredRef.current) {
      pixelTestePixelFiredRef.current = true;
      trackPixel("CompleteRegistration", { content_name: "Teste de Dosha" });
    }
  }, [result]);

  // (Glossário antigo removido — substituído por DiagnosticoCompleto)


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

  const visitorGuess = !!id && !user;

  if (registroLoading) {
    return (
      <PageContainer title="Meu Dosha" description="Carregando resultado..." noindex={visitorGuess}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!id || !result) {
    return (
      <PageContainer title="Meu Dosha" description="Resultado não encontrado." noindex={visitorGuess}>
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

  const handleRefazerTeste = () => {
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
  };

  const formattedNome = result.nome
    ? result.nome
        .split(" ")
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ")
    : "";

  // ===== Gate de login: deslogado vê só prévia (retrato clínico) =====
  if (authLoading) {
    return (
      <PageContainer title="Meu Dosha" description="Carregando..." noindex={visitorGuess}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const isVisitor = !user;




  return (
    <PageContainer
      title={`Meu Dosha — ${formattedNome}`}
      description={`Resultado do teste de dosha de ${formattedNome}: ${result.doshaprincipal}`}
      noindex={isVisitor}
    >

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="sr-only">
          {formattedNome ? `Resultado do teste de dosha de ${formattedNome}` : "Resultado do teste de dosha"}
          {result.doshaprincipal ? ` — Dosha ${result.doshaprincipal}` : ""}
        </h1>

        {!isVisitor && <FormacaoDestaqueCard />}

        {!isVisitor && (
          <div id="reteste-anchor" className="rounded-2xl transition-shadow">
            <RetesteCard />
          </div>
        )}

        {!isVisitor && <MinhaCaminhadaSection />}

        {!isVisitor && <PraVoceRail doshaPrincipal={result?.doshaprincipal} />}




        {/* ===== Vitrine da Rotina ===== */}
        {(() => {
          const doshaNome = result?.doshaprincipal || "seu dosha";
          const vitrineCard = (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/10 p-5 md:p-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
                SUA ROTINA AYURVEDA
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-primary leading-tight mb-2">
                Você descobriu seu dosha. E agora?
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Ayurveda sem rotina é teoria. Receba um plano diário pro seu {doshaNome} — café, almoço, chás, prática e tônico da noite, revisado todo mês.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">R$30</span> · sua rotina mensal
                </p>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/minha-rotina")}
                  className="self-start sm:self-auto"
                >
                  Conhecer minha rotina →
                </Button>
              </div>
            </div>
          );

          if (isVisitor) {
            return <ClaimLock idPublico={id!}>{vitrineCard}</ClaimLock>;
          }

          const temAcessoRotina =
            profile?.is_premium === true ||
            (profile?.subscription_status === "active" &&
              ["rotina", "mensal", "anual"].includes(profile?.plano ?? "") &&
              (!profile?.premium_until || new Date(profile.premium_until) > new Date()));

          if (temAcessoRotina) {
            return (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 px-5 py-4">
                <span className="text-sm font-medium text-foreground">
                  Sua rotina de hoje está pronta
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/minha-rotina")}
                  className="self-start sm:self-auto"
                >
                  Ver minha rotina →
                </Button>
              </div>
            );
          }

          return vitrineCard;
        })()}



        {/* ===== TABS ===== */}
        <Tabs
          value={initialTab}
          onValueChange={(v) => {
            const params = new URLSearchParams(searchParams);
            params.set('tab', v);
            navigate(`/meu-dosha?${params.toString()}`, { replace: true });
          }}
          className="w-full"
        >
          <div className="sticky top-16 z-40 py-2 flex justify-center">
          <TabsList className="grid grid-cols-5 h-auto max-w-6xl w-full mx-4 rounded-full bg-muted/95 backdrop-blur-sm shadow-sm gap-0.5 sm:gap-0 p-1">
            <TabsTrigger value="perfil" className="text-xs sm:text-sm py-1 flex items-center gap-1 bg-[#E8EEFF] sm:bg-transparent text-[#352F54] rounded-full">
              <span className="hidden sm:inline-flex">
                <DoshaMiniPie vata={result.vatascore ?? 0} pitta={result.pittascore ?? 0} kapha={result.kaphascore ?? 0} />
              </span>
              Perfil
            </TabsTrigger>
            <TabsTrigger value="metricas" className="text-xs sm:text-sm py-1 flex items-center gap-1 bg-[#FFE8E8] sm:bg-transparent text-[#352F54] rounded-full">
              <span aria-hidden="true" className="hidden sm:inline">📊</span>
              Métricas
            </TabsTrigger>
            <TabsTrigger value="artigos" className="text-xs sm:text-sm py-1 flex items-center gap-1 bg-[#E8F5E0] sm:bg-transparent text-[#352F54] rounded-full">
              <span aria-hidden="true" className="hidden sm:inline">📖</span>
              Artigos
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm py-1 flex items-center gap-1 bg-[#FFF3D6] sm:bg-transparent text-[#352F54] rounded-full">
              <span aria-hidden="true" className="hidden sm:inline">▶️</span>
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="akasha" className="text-xs sm:text-sm py-1 flex items-center gap-1 bg-[#F0E6F5] sm:bg-transparent text-[#352F54] rounded-full">
              Akasha
              <img src="https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png" alt="" className="w-4 h-4 object-contain hidden sm:inline-block" />
            </TabsTrigger>
          </TabsList>
          </div>

          {/* ===== TAB: PERFIL ===== */}
          <TabsContent forceMount value="perfil" className="space-y-6 mt-4 data-[state=inactive]:hidden" tabIndex={-1}>
            {/* Clinical Dashboard */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">
                <div className="flex flex-col items-center">
                  <h2 className="font-serif font-bold text-foreground text-base mb-2 text-center">
                    Seu Dosha agravado é: <span style={{ color: PIE_COLORS[primaryDosha] }}>{result.doshaprincipal}</span>
                  </h2>
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
                  <div className="w-full mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleRefazerTeste}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Recomeçar o teste
                    </button>
                    {!isVisitor && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isPremium) setEvolucaoOpen(true);
                          else navigate("/assinar");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors text-foreground"
                        aria-label={isPremium ? "Ver gráficos de evolução" : "Recurso premium — gráficos de evolução"}
                      >
                        {isPremium ? <LineChart className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        Gráficos
                      </button>
                      {(() => {
                        const createdAt = result.created_at ? new Date(result.created_at) : null;
                        const liberaEm = createdAt ? new Date(createdAt.getTime() + 30 * 24 * 3600 * 1000) : null;
                        const disponivel = liberaEm ? Date.now() >= liberaEm.getTime() : false;
                        const liberaStr = liberaEm
                          ? `${String(liberaEm.getDate()).padStart(2, '0')}/${String(liberaEm.getMonth() + 1).padStart(2, '0')}`
                          : '';
                        const baseClass = "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors";
                        if (disponivel || hasRevisaoConcluida) {
                          const jaConcluiu = !!hasRevisaoConcluida;
                          return (
                            <button
                              type="button"
                              onClick={() => navigate(jaConcluiu ? "/revisao?ver=ultima" : "/revisao")}
                              className={`${baseClass} border-akasha/60 bg-akasha/10 text-akasha hover:bg-akasha/20 ${jaConcluiu ? '' : 'animate-glow-pulse'}`}
                              aria-label={jaConcluiu ? "Ver sua última revisão" : "Iniciar revisão — novidade"}
                              title={jaConcluiu ? "Ver sua última revisão" : "Sua revisão está disponível"}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {jaConcluiu ? 'Ver revisão' : 'Revisão'}
                              {!jaConcluiu && (
                                <span className="ml-1 text-[9px] uppercase tracking-wider font-bold bg-akasha text-white px-1 py-0.5 rounded">novo</span>
                              )}
                            </button>
                          );
                        }
                        return (
                          <button
                            type="button"
                            disabled
                            className={`${baseClass} border-border bg-muted/40 text-muted-foreground cursor-not-allowed opacity-70`}
                            title={liberaStr ? `Sua revisão libera dia ${liberaStr}` : 'Sua revisão ainda não está disponível'}
                            aria-label={liberaStr ? `Revisão libera em ${liberaStr}` : 'Revisão indisponível'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Revisão
                            <Lock className="w-3 h-3" />
                          </button>
                        );
                      })()}
                    </div>
                    )}
                  </div>
                </div>
                <ClinicalThermometer doshaScores={doshaScores} />
              </div>
            </div>

            {/* ===== Diagnóstico clínico completo (substitui glossário + Recomeçar o Teste) ===== */}
            <DiagnosticoCompleto
              email={result.email}
              doshaPrincipal={primaryDosha}
              doshaPrincipalCompleto={result.doshaprincipal || primaryDosha}
              refazerTeste={handleRefazerTeste}
              isPremium={isPremium}
            />
          </TabsContent>

          {/* ===== TAB: MÉTRICAS ===== */}
          <TabsContent forceMount value="metricas" className="data-[state=inactive]:hidden" tabIndex={-1}>
            {isVisitor ? (
              <ClaimLock idPublico={id!}>
                <MetricasTab registroUuid={registroUuid} insights={insights} isLoading={insightsLoading} />
              </ClaimLock>
            ) : (
              <MetricasTab registroUuid={registroUuid} insights={insights} isLoading={insightsLoading} />
            )}
          </TabsContent>

          {/* ===== TAB: ARTIGOS ===== */}
          <TabsContent forceMount value="artigos" className="data-[state=inactive]:hidden" tabIndex={-1}>
            {isVisitor ? (
              <ClaimLock idPublico={id!}>
                <ArtigosTab
                  doshaprincipal={result.doshaprincipal}
                  agravVataTags={result.agravVataTags}
                  agravPittaTags={result.agravPittaTags}
                  agravKaphaTags={result.agravKaphaTags}
                  initialMode={initialMode === 'personalizado' ? 'personalizado' : 'geral'}
                />
              </ClaimLock>
            ) : (
              <ArtigosTab
                doshaprincipal={result.doshaprincipal}
                agravVataTags={result.agravVataTags}
                agravPittaTags={result.agravPittaTags}
                agravKaphaTags={result.agravKaphaTags}
                initialMode={initialMode === 'personalizado' ? 'personalizado' : 'geral'}
              />
            )}
          </TabsContent>

          {/* ===== TAB: VÍDEOS ===== */}
          <TabsContent forceMount value="videos" className="data-[state=inactive]:hidden" tabIndex={-1}>
            {isVisitor ? (
              <ClaimLock idPublico={id!}>
                <VideosTab
                  doshaprincipal={result.doshaprincipal}
                  agravVataTags={result.agravVataTags}
                  agravPittaTags={result.agravPittaTags}
                  agravKaphaTags={result.agravKaphaTags}
                  initialMode={initialMode}
                />
              </ClaimLock>
            ) : (
              <VideosTab
                doshaprincipal={result.doshaprincipal}
                agravVataTags={result.agravVataTags}
                agravPittaTags={result.agravPittaTags}
                agravKaphaTags={result.agravKaphaTags}
                initialMode={initialMode}
              />
            )}
          </TabsContent>

          {/* ===== TAB: AKASHA ===== */}
          <TabsContent forceMount value="akasha" className="data-[state=inactive]:hidden" tabIndex={-1}>
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
              initialPergunta={searchParams.get('pergunta') || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
      <EvolucaoSheet open={evolucaoOpen} onOpenChange={setEvolucaoOpen} registroUuid={registroUuid} />
    </PageContainer>
  );
};

export default MeuDosha;
