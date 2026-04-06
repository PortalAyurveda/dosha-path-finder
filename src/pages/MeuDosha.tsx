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
  oque: string | null;
  caracteristicasPrincipais: string | null;
  manifestacoesComuns: string | null;
  principaisCausas: string | null;
  caminhosEquilibrio: string | null;
  alimentosEvitar: string | null;
  alimentosPriorizar: string | null;
  rotinasEquilibrar: string | null;
  rotinasInadequadas: string | null;
  dicasGeraisFazer: string | null;
  dicasGeraisNaoFazer: string | null;
  atributos: string | null;
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

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const ExpandableSection = ({ title, content, icon }: { title: string; content: string | null; icon: string }) => {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;

  const plainText = stripHtml(content);
  const preview = plainText.slice(0, 200);
  const needsExpand = plainText.length > 200;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <h3 className="font-serif font-bold text-foreground text-base flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {expanded ? plainText : preview + (needsExpand ? '...' : '')}
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

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
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
          .eq('Title', registro.doshaprincipal)
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-muted-foreground text-sm">Resultado de</p>
          <h1 className="font-serif text-3xl font-bold text-foreground">{result.nome}</h1>
          <div className={cn("inline-block px-5 py-2 rounded-full border-2 font-bold text-lg", badgeClass)}>
            {result.doshaprincipal}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h2 className="font-serif font-bold text-foreground text-lg text-center">Pontuação dos Doshas</h2>
          <div className="w-full flex justify-center">
            <ResponsiveContainer width={280} height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {doshaScores.map(d => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[d.name] }} />
                {d.emoji} {d.name}: {d.score}
              </span>
            ))}
          </div>
        </div>

        {/* Agni */}
        {result.agniPrincipal && (
          <div className="bg-surface-sun rounded-xl border border-border p-5">
            <h2 className="font-serif font-bold text-foreground text-lg mb-1">🔥 Fogo Digestivo (Agni)</h2>
            <p className="text-sm text-muted-foreground">{result.agniPrincipal}</p>
          </div>
        )}

        {/* Agravamentos */}
        {(result.agravVataTags || result.agravPittaTags || result.agravKaphaTags) && (
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h2 className="font-serif font-bold text-foreground text-lg">⚠️ Agravamentos Detectados</h2>
            {result.agravVataTags && (
              <div>
                <p className="text-xs font-bold text-vata uppercase mb-1">Vata</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.agravVataTags.split(',').map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-vata/10 text-vata border border-vata/30">{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {result.agravPittaTags && (
              <div>
                <p className="text-xs font-bold text-pitta uppercase mb-1">Pitta</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.agravPittaTags.split(',').map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-pitta/10 text-pitta border border-pitta/30">{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {result.agravKaphaTags && (
              <div>
                <p className="text-xs font-bold text-kapha uppercase mb-1">Kapha</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.agravKaphaTags.split(',').map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-kapha/10 text-kapha border border-kapha/30">{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portal Glossário Content */}
        {glossario && (
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-foreground text-xl text-center mt-6">
              📖 Guia {glossario.Title}
            </h2>
            <ExpandableSection title="O que é?" content={glossario.oque} icon="🧬" />
            <ExpandableSection title="Características Principais" content={glossario.caracteristicasPrincipais} icon="📋" />
            <ExpandableSection title="Atributos" content={glossario.atributos} icon="✨" />
            <ExpandableSection title="Manifestações Comuns" content={glossario.manifestacoesComuns} icon="🔍" />
            <ExpandableSection title="Principais Causas" content={glossario.principaisCausas as string | null} icon="⚡" />
            <ExpandableSection title="Caminhos de Equilíbrio" content={glossario.caminhosEquilibrio} icon="🧘" />
            <ExpandableSection title="Alimentos a Priorizar" content={glossario.alimentosPriorizar} icon="✅" />
            <ExpandableSection title="Alimentos a Evitar" content={glossario.alimentosEvitar} icon="🚫" />
            <ExpandableSection title="Rotinas de Equilíbrio" content={glossario.rotinasEquilibrar} icon="🌅" />
            <ExpandableSection title="Rotinas Inadequadas" content={glossario.rotinasInadequadas} icon="⛔" />
            <ExpandableSection title="O que Fazer" content={glossario.dicasGeraisFazer} icon="👍" />
            <ExpandableSection title="O que NÃO Fazer" content={glossario.dicasGeraisNaoFazer} icon="👎" />
          </div>
        )}

        {/* Links */}
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
