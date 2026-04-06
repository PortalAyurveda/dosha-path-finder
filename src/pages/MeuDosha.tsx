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
  Vata: 'hsl(213, 94%, 78%)',
  Pitta: 'hsl(0, 94%, 82%)',
  Kapha: 'hsl(142, 77%, 73%)',
};

const DOSHA_ROUTES: Record<string, string> = {
  Vata: '/biblioteca/vata',
  Pitta: '/biblioteca/pitta',
  Kapha: '/biblioteca/kapha',
};

// Severity levels for each dosha
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

const LEVEL_COLORS: Record<string, string> = {
  Fixado: 'bg-red-500',
  Adoecido: 'bg-orange-500',
  'Acúmulo': 'bg-yellow-500',
  Normal: 'bg-emerald-500',
  Pouco: 'bg-blue-400',
  Reduzido: 'bg-blue-400',
};

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

// Vertical bar chart for a single dosha
const DoshaVerticalBar = ({ name, score, emoji, color }: { name: string; score: number; emoji: string; color: string }) => {
  const levels = DOSHA_LEVELS[name] || VATA_LEVELS;
  const currentLevel = getLevel(score, levels);

  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="text-center mb-1">
        <p className="text-xs font-bold text-foreground">{emoji} {name}</p>
        <p className="text-lg font-bold" style={{ color }}>{score}</p>
        <p className="text-[10px] text-muted-foreground">pts</p>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white mt-0.5 inline-block", LEVEL_COLORS[currentLevel])}>
          {currentLevel}
        </span>
      </div>
      <div className="flex flex-col gap-[2px] w-full">
        {levels.map((level) => {
          const isActive = currentLevel === level.label;
          return (
            <div
              key={level.label}
              className={cn(
                "rounded-sm px-1.5 py-1 text-[9px] leading-tight transition-all border",
                isActive
                  ? cn(LEVEL_COLORS[level.label], "text-white font-bold border-transparent shadow-sm")
                  : "bg-muted/30 text-muted-foreground/60 border-transparent"
              )}
            >
              <span className="block font-medium">{level.label}</span>
              <span className="block opacity-80">{level.range}</span>
            </div>
          );
        })}
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

const TagsSection = ({ title, content, icon }: { title: string; content: string | null; icon: string }) => {
  if (!content || content.trim().length < 5) return null;
  const stripped = stripHtml(content);
  // Split by common separators
  const tags = stripped.split(/[,\n•·–—|]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 60);
  if (tags.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-muted-foreground uppercase">{icon} {title}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {tag}
          </span>
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
      {name} ({value})
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
    { name: 'Vata', score: result.vatascore || 0, emoji: '💨' },
    { name: 'Pitta', score: result.pittascore || 0, emoji: '🔥' },
    { name: 'Kapha', score: result.kaphascore || 0, emoji: '🪨' },
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

          {/* Row 1: Pie Chart + Vertical Bars */}
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
              <div className="flex gap-3 text-[10px] text-muted-foreground mt-1">
                {doshaScores.map(d => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[d.name] }} />
                    {d.emoji} {d.name}: {d.score}
                  </span>
                ))}
              </div>
            </div>

            {/* Vertical Bars */}
            <div>
              <h2 className="font-serif font-bold text-foreground text-sm mb-2 text-center">Quadro Clínico</h2>
              <div className="flex gap-2">
                {doshaScores.map(d => (
                  <DoshaVerticalBar
                    key={d.name}
                    name={d.name}
                    score={d.score}
                    emoji={d.emoji}
                    color={PIE_COLORS[d.name]}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Agni + Agravamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Agni */}
            {result.agniPrincipal && (
              <div className="bg-surface-sun rounded-lg border border-border p-3">
                <h3 className="font-serif font-bold text-foreground text-sm mb-1">🔥 Fogo Digestivo (Agni)</h3>
                <p className="text-xs text-muted-foreground">{result.agniPrincipal}</p>
              </div>
            )}

            {/* Agravamentos */}
            {(result.agravVataTags || result.agravPittaTags || result.agravKaphaTags) && (
              <div className="bg-card rounded-lg border border-border p-3 space-y-2">
                <h3 className="font-serif font-bold text-foreground text-sm">⚠️ Agravamentos</h3>
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

            {/* O que é */}
            <ExpandableSection title="O que é?" content={glossario.oque} icon="🧬" />

            {/* Tags sections */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <TagsSection title="Atributos" content={glossario.atributos} icon="✨" />
              <TagsSection title="Equilíbrio" content={glossario.caracteristicasPrincipais} icon="⚖️" />
              <TagsSection title="Desequilíbrio" content={glossario.manifestacoesComuns} icon="🔻" />
            </div>

            {/* Expandable detail sections */}
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
                  {d.emoji} Biblioteca {d.name} <ExternalLink className="w-3 h-3 ml-1" />
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
