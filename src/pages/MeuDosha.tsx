import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

interface GlossarioEntry {
  doshanome: string | null;
  oque: string | null;
  caracteristicasprincipais: string | null;
  alimentospriorizar: string | null;
  alimentosevitar: string | null;
  rotinasequilibrar: string | null;
  rotinasinadequadas: string | null;
  dicasgeraisfazer: string | null;
  dicasgeraisnaofazer: string | null;
  remediosAyurvedicos: string | null;
  receitasAyurvedicas: string | null;
}

const DOSHA_COLORS: Record<string, string> = {
  Vata: 'bg-vata/20 text-vata border-vata',
  Pitta: 'bg-pitta/20 text-pitta border-pitta',
  Kapha: 'bg-kapha/20 text-kapha border-kapha',
};

const DOSHA_BAR_COLORS: Record<string, string> = {
  Vata: 'bg-vata',
  Pitta: 'bg-pitta',
  Kapha: 'bg-kapha',
};

const DOSHA_ROUTES: Record<string, string> = {
  Vata: '/biblioteca/vata',
  Pitta: '/biblioteca/pitta',
  Kapha: '/biblioteca/kapha',
};

const MeuDosha = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DoshaResult | null>(null);
  const [glossario, setGlossario] = useState<GlossarioEntry[]>([]);
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

      // Fetch glossario for the doshas in doshaprincipal
      if (registro.doshaprincipal) {
        const doshaNames = registro.doshaprincipal.split('-').map((d: string) => d.trim());
        const { data: glossData } = await supabase
          .from('glossario_v2')
          .select('*')
          .in('doshanome', doshaNames);
        if (glossData) setGlossario(glossData);
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

  const maxScore = Math.max(result.vatascore || 0, result.pittascore || 0, result.kaphascore || 0, 1);
  const doshaScores = [
    { name: 'Vata', score: result.vatascore || 0, emoji: '💨' },
    { name: 'Pitta', score: result.pittascore || 0, emoji: '🔥' },
    { name: 'Kapha', score: result.kaphascore || 0, emoji: '🪨' },
  ];

  const primaryDosha = result.doshaprincipal?.split('-')[0] || 'Vata';
  const badgeClass = DOSHA_COLORS[primaryDosha] || DOSHA_COLORS.Vata;

  const renderTextSection = (title: string, content: string | null, icon?: string) => {
    if (!content) return null;
    return (
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <h3 className="font-serif font-bold text-foreground text-base flex items-center gap-2">
          {icon && <span>{icon}</span>} {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    );
  };

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

        {/* Score Bars */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-serif font-bold text-foreground text-lg">Pontuação dos Doshas</h2>
          {doshaScores.map(d => (
            <div key={d.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{d.emoji} {d.name}</span>
                <span className="text-muted-foreground font-mono">{d.score} pts</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", DOSHA_BAR_COLORS[d.name])}
                  style={{ width: `${(d.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
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

        {/* Glossário Tips */}
        {glossario.map((g, i) => (
          <div key={i} className="space-y-3">
            <h2 className="font-serif font-bold text-foreground text-xl text-center mt-6">
              📖 Guia {g.doshanome}
            </h2>
            {renderTextSection('O que é?', g.oque, '🧬')}
            {renderTextSection('Características Principais', g.caracteristicasprincipais, '📋')}
            {renderTextSection('Alimentos para Priorizar', g.alimentospriorizar, '✅')}
            {renderTextSection('Alimentos para Evitar', g.alimentosevitar, '🚫')}
            {renderTextSection('Rotinas para Equilibrar', g.rotinasequilibrar, '🧘')}
            {renderTextSection('Rotinas Inadequadas', g.rotinasinadequadas, '⛔')}
            {renderTextSection('O que Fazer', g.dicasgeraisfazer, '👍')}
            {renderTextSection('O que NÃO Fazer', g.dicasgeraisnaofazer, '👎')}
            {renderTextSection('Remédios Ayurvédicos', g.remediosAyurvedicos, '🌿')}
            {renderTextSection('Receitas Ayurvédicas', g.receitasAyurvedicas, '🍲')}
          </div>
        ))}

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
