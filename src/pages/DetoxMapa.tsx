import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";

const DoshaPieChart = lazy(() => import("@/components/charts/DoshaPieChart"));
const DETOX_LOGO = "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-detox300x.webp";
const DRAFT_KEY = "jornada_primavera_noite_1";

type Respostas = { q1: string; q2: string; q3: string };
type AgniData = { agniPrincipal: string | null; agniforte: number | null; agnifraco: number | null; agniirregular: number | null };

const EMPTY_ANSWERS: Respostas = { q1: "", q2: "", q3: "" };
const QUESTIONS: Array<{ key: keyof Respostas; text: string }> = [
  { key: "q1", text: "Você conseguiu identificar o local de origem dos seus agravamentos?" },
  { key: "q2", text: "Se você identificou a origem, conseguiu entender para onde esses desequilíbrios foram, e porquê?" },
  { key: "q3", text: "Considerando o que você aprendeu hoje, há quanto tempo você estima que essas toxinas estejam em você?" },
];

const JourneyButton = ({ to, children, outline = false }: { to: string; children: React.ReactNode; outline?: boolean }) => (
  <Button
    asChild
    variant={outline ? "outline" : "default"}
    className={`min-h-[60px] rounded-full px-7 text-sm font-bold uppercase ${outline ? "border-2 border-detox-purple bg-transparent text-detox-purple hover:bg-detox-purple/10 hover:text-detox-purple" : "bg-detox-button text-primary-foreground hover:bg-detox-button/90"}`}
  >
    <Link to={to}>{children}</Link>
  </Button>
);

const SectionHeading = ({ eyebrow, badge, title, children }: { eyebrow: string; badge?: string; title: string; children?: React.ReactNode }) => (
  <div className="mb-5">
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <p className="text-xs font-bold uppercase text-detox-brown">{eyebrow}</p>
      {badge && <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge === "Aberta hoje" ? "bg-kapha-1 text-kapha-5" : "bg-muted text-muted-foreground"}`}>{badge}</span>}
    </div>
    <h2 className="font-serif text-2xl font-bold text-detox-title md:text-3xl">{title}</h2>
    {children}
  </div>
);

const LockedNight = ({ eyebrow, badge, title, children }: { eyebrow: string; badge: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-detox-title/15 pt-[26px]">
    <SectionHeading eyebrow={eyebrow} badge={badge} title={title} />
    <div className="flex items-start gap-4 rounded-[32px] bg-card p-6 shadow-sm md:p-8">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Lock className="h-4 w-4" /></div>
      <p className="text-sm leading-relaxed text-detox-text md:text-base">{children}</p>
    </div>
  </section>
);

const DetoxMapa = () => {
  const { user, isAnonymous, doshaResult } = useUser();
  const { toast } = useToast();
  const accountUser = user && !isAnonymous ? user : null;
  const [answers, setAnswers] = useState<Respostas>(EMPTY_ANSWERS);
  const [agni, setAgni] = useState<AgniData | null>(null);
  const [loadingFicha, setLoadingFicha] = useState(true);
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    if (!doshaResult?.idPublico) {
      setAgni(null);
      return () => { active = false; };
    }
    void (async () => {
      const { data } = await supabase.rpc("resultado_teste", { p_idpublico: doshaResult.idPublico });
      const row = Array.isArray(data) ? data[0] : null;
      if (active && row) setAgni(row as AgniData);
    })();
    return () => { active = false; };
  }, [doshaResult?.idPublico]);

  useEffect(() => {
    let active = true;
    hydrated.current = false;
    void (async () => {
      let local: Respostas | null = null;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) local = { ...EMPTY_ANSWERS, ...JSON.parse(raw) };
      } catch { localStorage.removeItem(DRAFT_KEY); }

      if (!accountUser) {
        if (active) {
          setAnswers(local ?? EMPTY_ANSWERS);
          setLoadingFicha(false);
          hydrated.current = true;
        }
        return;
      }

      const { data } = await supabase
        .from("jornada_ficha")
        .select("respostas")
        .eq("user_id", accountUser.id)
        .eq("noite", 1)
        .maybeSingle();

      const remote = data?.respostas && typeof data.respostas === "object" && !Array.isArray(data.respostas)
        ? { ...EMPTY_ANSWERS, ...(data.respostas as Record<string, string>) }
        : null;
      const restored = local ?? remote ?? EMPTY_ANSWERS;

      if (local) {
        const { error } = await supabase.from("jornada_ficha").upsert({
          user_id: accountUser.id,
          email: accountUser.email ?? null,
          noite: 1,
          respostas: local,
          dosha_id_publico: doshaResult?.idPublico ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,noite" });
        if (!error) localStorage.removeItem(DRAFT_KEY);
      }

      if (active) {
        setAnswers(restored);
        setLoadingFicha(false);
        hydrated.current = true;
      }
    })();
    return () => { active = false; };
  }, [accountUser?.id, accountUser?.email, doshaResult?.idPublico]);

  const saveAnswers = useCallback(async (showToast: boolean) => {
    if (!accountUser) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      if (showToast) toast({ title: "Salvo" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("jornada_ficha").upsert({
      user_id: accountUser.id,
      email: accountUser.email ?? null,
      noite: 1,
      respostas: answers,
      dosha_id_publico: doshaResult?.idPublico ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,noite" });
    setSaving(false);
    if (error) {
      if (showToast) toast({ title: "Não foi possível salvar", description: "Tente novamente em instantes.", variant: "destructive" });
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    if (showToast) toast({ title: "Salvo" });
  }, [accountUser, answers, doshaResult?.idPublico, toast]);

  useEffect(() => {
    if (!hydrated.current) return;
    if (!accountUser) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      return;
    }
    const timer = window.setTimeout(() => { void saveAnswers(false); }, 2000);
    return () => window.clearTimeout(timer);
  }, [answers, accountUser, saveAnswers]);

  const doshaKey = (doshaResult?.doshaprincipal?.toLowerCase().match(/vata|pitta|kapha/)?.[0] || "vata") as DoshaNome;
  const principalScore = doshaKey === "vata" ? doshaResult?.vatascore : doshaKey === "pitta" ? doshaResult?.pittascore : doshaResult?.kaphascore;
  const principalLabel = `${doshaKey[0].toUpperCase()}${doshaKey.slice(1)}, em ${getFaixa(doshaKey, principalScore).toLowerCase()}`;
  const scores = {
    vata: doshaResult?.vatascore ?? 0,
    pitta: doshaResult?.pittascore ?? 0,
    kapha: doshaResult?.kaphascore ?? 0,
  };

  return (
    <div className="min-h-screen bg-detox-page text-detox-text">
      <Helmet>
        <title>Mapa da Jornada — Portal Ayurveda</title>
        <meta name="description" content="Seu mapa pessoal da Jornada da Primavera, com Teste de Dosha e respostas das três noites." />
      </Helmet>

      <header className="border-b border-detox-yellow bg-detox-cream">
        <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
          <Link to="/detox" className="text-sm font-semibold text-detox-brown hover:underline">← Voltar para a sala de aula</Link>
          <div className="mt-5 flex items-center gap-3">
            <img src={DETOX_LOGO} alt="" className="h-9 w-auto" />
            <h1 className="font-serif text-3xl font-bold text-detox-title md:text-4xl">Mapa da Jornada</h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-detox-text md:text-base">O que você responder aqui fica salvo na sua conta e acompanha você nas três noites.</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-[26px] px-4 py-8 sm:px-6 md:py-12">
        <section>
          <SectionHeading eyebrow="Seu ponto de partida" title="Seu Teste de Dosha" />
          {doshaResult ? (
            <div className="rounded-[32px] bg-card p-6 shadow-sm md:p-8">
              <div className="grid items-center gap-6 sm:grid-cols-[240px_1fr]">
                <div className="h-[240px]">
                  <Suspense fallback={<Skeleton className="h-full w-full rounded-full" />}><DoshaPieChart vata={scores.vata} pitta={scores.pitta} kapha={scores.kapha} variant="full" /></Suspense>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-detox-title">{principalLabel}</h3>
                  {agni?.agniPrincipal && <p className="mt-2 text-sm leading-relaxed text-detox-text">{agni.agniPrincipal}</p>}
                  <p className="mt-3 text-sm font-semibold text-detox-text">Forte {agni?.agniforte ?? 0} · Fraco {agni?.agnifraco ?? 0} · Irregular {agni?.agniirregular ?? 0}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-vata-1 px-4 py-2 text-sm font-bold text-vata-5">Vata {scores.vata}</span>
                <span className="rounded-full bg-pitta-1 px-4 py-2 text-sm font-bold text-pitta-5">Pitta {scores.pitta}</span>
                <span className="rounded-full bg-kapha-1 px-4 py-2 text-sm font-bold text-kapha-5">Kapha {scores.kapha}</span>
              </div>
              <div className="mt-6"><JourneyButton to="/meu-dosha" outline>Ver meu mapa completo</JourneyButton></div>
            </div>
          ) : accountUser ? (
            <div className="rounded-[32px] border border-detox-yellow bg-detox-cream p-6 shadow-sm md:p-8">
              <h3 className="font-serif text-2xl font-bold text-detox-title">Você ainda não fez o teste</h3>
              <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">São oito minutos, e é ele que dá sentido às três noites. Dá pra fazer agora, durante a aula.</p>
              <div className="mt-5"><JourneyButton to="/teste-de-dosha">Fazer o meu teste</JourneyButton></div>
            </div>
          ) : (
            <div className="rounded-[32px] border border-detox-yellow bg-detox-cream p-6 shadow-sm md:p-8">
              <h3 className="font-serif text-2xl font-bold text-detox-title">Entre para guardar o seu mapa</h3>
              <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">Sem conta, o que você escrever aqui se perde quando fechar a página.</p>
              <div className="mt-5"><JourneyButton to="/entrar?redirect=/detox/mapa">Entrar com meu e-mail</JourneyButton></div>
            </div>
          )}
        </section>

        <section className="border-t border-detox-title/15 pt-[26px]">
          <SectionHeading eyebrow="Noite 1" badge="Aberta hoje" title="Três perguntas sobre você">
            <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">Responda com as suas palavras, do jeito que vier. Não tem resposta certa, e você pode voltar e mudar depois.</p>
          </SectionHeading>
          <div className="rounded-[32px] bg-card p-6 shadow-sm md:p-8">
            {loadingFicha ? <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div> : (
              <div className="space-y-8">
                {QUESTIONS.map((question, index) => (
                  <div key={question.key}>
                    <label htmlFor={question.key} className="block">
                      <span className="text-xs font-bold uppercase text-detox-brown">Pergunta {index + 1}</span>
                      <span className="mt-2 block font-serif text-lg font-bold leading-snug text-detox-title md:text-xl">{question.text}</span>
                    </label>
                    <Textarea id={question.key} value={answers[question.key]} onChange={(event) => setAnswers((current) => ({ ...current, [question.key]: event.target.value }))} placeholder="Escreva aqui…" className="mt-3 min-h-[104px] resize-y rounded-[10px] border-0 bg-detox-orange/15 text-base text-detox-text placeholder:text-detox-text/55 focus-visible:ring-detox-orange" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-5 border-t border-detox-title/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-detox-text">Salva sozinho enquanto você escreve. Fica na sua conta, ninguém mais vê.</p>
              <Button onClick={() => void saveAnswers(true)} disabled={saving || loadingFicha} className="min-h-[60px] shrink-0 rounded-full bg-detox-button px-7 text-sm font-bold uppercase text-primary-foreground hover:bg-detox-button/90">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar minhas respostas
              </Button>
            </div>
          </div>
        </section>

        <LockedNight eyebrow="Noite 2" badge="Abre amanhã, 19h" title="A leitura da sua língua">
          Abre na <strong>quarta, 23 de setembro, às 19h</strong>. O que você escreveu hoje continua aqui.
        </LockedNight>

        <LockedNight eyebrow="Noite 3" badge="Abre quinta, 19h" title="O seu caminho">
          Abre na <strong>quinta, 24 de setembro, às 19h</strong>. Depende das duas noites anteriores, por isso vem por último.
        </LockedNight>
      </main>
    </div>
  );
};

export default DetoxMapa;