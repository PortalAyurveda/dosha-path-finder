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
  caracteristicasPrincipais: string | null;
  manifestacoesComuns: string | null;
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

// Severity levels for each dosha (top to bottom: Fixado → Pouco)
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

// Color scales per dosha (level 1=lightest to 5=darkest)
const DOSHA_COLOR_SCALE: Record<string, string[]> = {
  Vata: ['#D6E0FF', '#A3C1FF', '#709AFF', '#4F75FF', '#2A4BCC'],
  Pitta: ['#FFE0E0', '#FFB3B3', '#FF8585', '#FF5C5C', '#CC3333'],
  Kapha: ['#D1F4E0', '#9AE6B8', '#5ED58F', '#22C55E', '#15803D'],
};

function getLevelIndex(score: number, levels: typeof VATA_LEVELS): number {
  // levels are ordered top(5) to bottom(1), reversed array index
  // level 5=Fixado(idx 0), level 1=Pouco(idx 4)
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].min && score <= levels[i].max) return levels.length - i; // 1-based level
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

// Y-axis labels (shared across all 3 columns)
const LEVEL_LABELS = ['Fixado', 'Adoecido', 'Acúmulo', 'Normal', 'Pouco'];

// Thermometer component with progressive fill
const ClinicalThermometer = ({ doshaScores }: { doshaScores: { name: string; score: number }[] }) => {
  const doshaData = doshaScores.map(d => {
    const levels = DOSHA_LEVELS[d.name] || VATA_LEVELS;
    const currentLevel = getLevelIndex(d.score, levels);
    const colors = DOSHA_COLOR_SCALE[d.name];
    return { ...d, currentLevel, colors, levels };
  });

  return (
    <div>
      <h2 className="font-serif font-bold text-foreground text-sm mb-3 text-center">Quadro Clínico</h2>
      {/* Score summary */}
      <div className="flex justify-center gap-4 mb-3">
        {doshaData.map(d => (
          <div key={d.name} className="text-center">
            <p className="text-xs font-bold text-foreground">{d.name}</p>
            <p className="text-lg font-bold" style={{ color: PIE_COLORS[d.name] }}>{d.score}</p>
            <p className="text-[10px] text-muted-foreground">pts</p>
          </div>
        ))}
      </div>

      {/* Thermometer grid: [Y-axis] [Vata] [Pitta] [Kapha] */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1 gap-y-[2px]">
        {LEVEL_LABELS.map((label, rowIdx) => {
          // rowIdx 0=Fixado(level 5), 1=Adoecido(level 4), ...4=Pouco(level 1)
          const levelNum = 5 - rowIdx; // 5,4,3,2,1
          const levelData = doshaData[0].levels[rowIdx]; // get range from first dosha for label

          return (
            <div key={label} className="contents">
              {/* Y-axis label */}
              <div className="flex flex-col justify-center items-end pr-1.5 h-12">
                <span className="text-[10px] font-semibold text-muted-foreground leading-none">{label}</span>
                <span className="text-[8px] text-muted-foreground/60 leading-none mt-0.5">
                  {doshaData[0].levels[rowIdx].range}
                </span>
              </div>

              {/* 3 dosha columns */}
              {doshaData.map(d => {
                const isFilled = levelNum <= d.currentLevel;
                const isActiveLevel = levelNum === d.currentLevel;
                const bgColor = isFilled ? d.colors[levelNum - 1] : undefined;

                return (
                  <div
                    key={d.name}
                    className={cn(
                      "h-12 rounded-sm transition-all",
                      isFilled ? "shadow-sm" : "bg-muted/20",
                      isActiveLevel && "ring-2 ring-offset-1 ring-foreground/20"
                    )}
                    style={isFilled ? { backgroundColor: bgColor } : undefined}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Column headers below */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1 mt-1">
        <div />
        {doshaData.map(d => (
          <p key={d.name} className="text-[10px] font-bold text-center" style={{ color: PIE_COLORS[d.name] }}>
            {d.name}
          </p>
        ))}
      </div>
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

// 3-column tags grid: Atributos / Equilíbrio / Desequilíbrio
const ThreeColumnTags = ({ atributos, equilibrio, desequilibrio }: {
  atributos: string | null;
  equilibrio: string | null;
  desequilibrio: string | null;
}) => {
  const parseTags = (content: string | null): string[] => {
    if (!content || content.trim().length < 5) return [];
    const stripped = stripHtml(content);
    return stripped.split(/[,\n•·–—|]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 60).slice(0, 5);
  };

  const cols = [
    { title: 'Atributos', icon: '✨', tags: parseTags(atributos) },
    { title: 'Equilíbrio', icon: '⚖️', tags: parseTags(equilibrio) },
    { title: 'Desequilíbrio', icon: '🔻', tags: parseTags(desequilibrio) },
  ];

  if (cols.every(c => c.tags.length === 0)) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="grid grid-cols-3 gap-3">
        {cols.map(col => (
          <div key={col.title} className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase text-center">{col.icon} {col.title}</p>
            <div className="flex flex-col gap-1.5">
              {col.tags.map((tag, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-center leading-tight">
                  {tag}
                </span>
              ))}
            </div>
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
    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[11px] font-medium">
      {name}
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

  return (
    <PageContainer title={`Meu Dosha — ${result.nome}`} description={`Resultado do teste de dosha de ${result.nome}: ${result.doshaprincipal}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ===== HEADER: Name + Badge ===== */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Resultado de</p>
          <h1 className="font-serif text-3xl font-bold text-foreground">{result.nome}</h1>
          <div className={cn("inline-block px-5 py-2 rounded-full border-2 font-bold text-lg", badgeClass)}>
            {result.doshaprincipal}
          </div>
        </div>

        {/* ===== CLINICAL DASHBOARD CARD ===== */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">

          {/* Row 1: Pie Chart + Thermometer Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Pie Chart */}
            <div className="flex flex-col items-center">
              <h2 className="font-serif font-bold text-foreground text-sm mb-2 text-center">Pontuação dos Doshas</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
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
              {/* Color legend only (no scores) */}
              <div className="flex gap-3 text-[10px] text-muted-foreground mt-1">
                {doshaScores.map(d => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[d.name] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Thermometer Bars */}
            <ClinicalThermometer doshaScores={doshaScores} />
          </div>

          {/* Row 2: Agni + Agravamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Agni */}
            {result.agniPrincipal && (
              <div className="bg-surface-sun rounded-lg border border-border p-3">
                <h3 className="font-serif font-bold text-foreground text-sm mb-1">Fogo Digestivo (Agni)</h3>
                <p className="text-xs text-muted-foreground">{result.agniPrincipal}</p>
              </div>
            )}

            {/* Agravamentos */}
            {(result.agravVataTags || result.agravPittaTags || result.agravKaphaTags) && (
              <div className="bg-card rounded-lg border border-border p-3 space-y-2">
                <h3 className="font-serif font-bold text-foreground text-sm">Agravamentos</h3>
                {result.agravVataTags && (
                  <div>
                    <p className="text-[10px] font-bold text-vata uppercase mb-0.5">Vata</p>
                    <div className="flex flex-wrap gap-1">
                      {result.agravVataTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-vata/10 text-vata border border-vata/30">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.agravPittaTags && (
                  <div>
                    <p className="text-[10px] font-bold text-pitta uppercase mb-0.5">Pitta</p>
                    <div className="flex flex-wrap gap-1">
                      {result.agravPittaTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-pitta/10 text-pitta border border-pitta/30">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.agravKaphaTags && (
                  <div>
                    <p className="text-[10px] font-bold text-kapha uppercase mb-0.5">Kapha</p>
                    <div className="flex flex-wrap gap-1">
                      {result.agravKaphaTags.split(',').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-kapha/10 text-kapha border border-kapha/30">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== GLOSSARY INFO PACK ===== */}
        {glossario && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="font-serif font-bold text-foreground text-xl">
                Seu Dosha principal é: {glossario.doshaNome || glossario.Title}
              </h2>
              <p className="text-muted-foreground text-sm">O que isso significa?</p>
            </div>

            <ExpandableSection title="O que é?" content={glossario.oque} icon="🧬" />

            {/* 3-column tags grid */}
            <ThreeColumnTags
              atributos={glossario.atributos}
              equilibrio={glossario.caracteristicasPrincipais}
              desequilibrio={glossario.manifestacoesComuns}
            />

            <ExpandableSection title="Principais Causas" content={glossario.principaisCausas} icon="⚡" />
            <ExpandableSection title="Principais Enfermidades" content={glossario.principaisDoencas} icon="🩺" />
            <ExpandableSection title="Caminhos de Equilíbrio" content={glossario.caminhosEquilibrio} icon="🌿" />
            <ExpandableSection title="Dicas: O que Fazer" content={glossario.dicasGeraisFazer} icon="👍" />
            <ExpandableSection title="Alimentos a Evitar" content={glossario.alimentosEvitar} icon="🚫" />
            <ExpandableSection title="Rotinas de Equilíbrio" content={glossario.rotinasEquilibrar} icon="🌅" />
            <ExpandableSection title="Dicas: Não Fazer" content={glossario.dicasGeraisNaoFazer} icon="👎" />
            <ExpandableSection title="Alimentos a Priorizar" content={glossario.alimentosPriorizar} icon="✅" />
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
