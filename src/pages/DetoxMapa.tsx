import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Lock, Loader2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { ensureAnonSession, currentUserId } from "@/lib/anonSession";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";
import { getPalette } from "@/data/landingPalettes";
import { MARCA_GRUPOS } from "@/data/detoxLingua";
import { optimizeImageToJpeg } from "@/lib/imageOptimize";

const DoshaPieChart = lazy(() => import("@/components/charts/DoshaPieChart"));
const BussolaDetox = lazy(() => import("@/components/detox/BussolaDetox"));
const DETOX_PALETTE = getPalette("detox-primavera");
const DETOX_THEME = {
  "--detox-primary": DETOX_PALETTE.branding.primaryColor,
  "--detox-primary-soft": `${DETOX_PALETTE.branding.primaryColor}26`,
  "--detox-dark": DETOX_PALETTE.branding.darkColor,
  "--detox-light": DETOX_PALETTE.branding.lightColor,
  "--detox-accent": DETOX_PALETTE.branding.accentColor,
  "--detox-page": DETOX_PALETTE.branding.warmBg,
  "--detox-focus": `${DETOX_PALETTE.branding.primaryColor}2E`,
} as CSSProperties;
const DRAFT_KEY = "jornada_primavera_noite_1";

type Respostas = { q1: string; q2: string; q3: string };
type AgniData = {
  agniPrincipal: string | null;
  agniforte: number | null;
  agnifraco: number | null;
  agniirregular: number | null;
  email?: string | null;
  agravVataTags?: string | null;
  agravPittaTags?: string | null;
  agravKaphaTags?: string | null;
};

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
    className={`min-h-[60px] rounded-full px-7 text-sm font-bold uppercase ${outline ? "border-2 border-detox-purple bg-transparent text-detox-purple hover:bg-detox-light hover:text-detox-purple" : "bg-detox-primary text-primary-foreground hover:bg-detox-dark"}`}
  >
    <Link to={to}>{children}</Link>
  </Button>
);

const SectionHeading = ({ eyebrow, badge, title, children }: { eyebrow: string; badge?: string; title: string; children?: React.ReactNode }) => (
  <div className="mb-5">
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <p className="text-xs font-bold uppercase text-detox-dark">{eyebrow}</p>
      {badge && <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge === "Aberta hoje" ? "bg-kapha-1 text-kapha-5" : "bg-muted text-muted-foreground"}`}>{badge}</span>}
    </div>
    <h2 className="font-serif text-2xl font-bold text-detox-text md:text-3xl">{title}</h2>
    {children}
  </div>
);

const LockedNight = ({ eyebrow, badge, title, children }: { eyebrow: string; badge: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-detox-divider pt-[26px]">
    <SectionHeading eyebrow={eyebrow} badge={badge} title={title} />
    <div className="flex items-start gap-4 rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Lock className="h-4 w-4" /></div>
      <p className="text-sm leading-relaxed text-detox-muted md:text-base">{children}</p>
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
  const [justSaved, setJustSaved] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [fotoPath, setFotoPath] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [subindoFoto, setSubindoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState(false);
  const [salvandoLeitura, setSalvandoLeitura] = useState(false);
  const [leituraSalva, setLeituraSalva] = useState(false);
  const marcasHidratadas = useRef(false);
  const hydrated = useRef(false);
  const savedTimer = useRef<number | null>(null);
  const agniEmail = agni?.email ?? null;

  const markSaved = useCallback(() => {
    setJustSaved(true);
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 3000);
  }, []);

  useEffect(() => () => {
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
  }, []);

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

  const persist = useCallback(async (uid: string, value: Respostas, email: string | null) => {
    return supabase.from("jornada_ficha").upsert({
      user_id: uid,
      email,
      noite: 1,
      respostas: value,
      dosha_id_publico: doshaResult?.idPublico ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,noite" });
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

      const uid = accountUser?.id ?? (await currentUserId());
      if (active) setUid(uid);

      if (!uid) {
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
        .eq("user_id", uid)
        .eq("noite", 1)
        .maybeSingle();

      const remote = data?.respostas && typeof data.respostas === "object" && !Array.isArray(data.respostas)
        ? { ...EMPTY_ANSWERS, ...(data.respostas as Record<string, string>) }
        : null;
      const restored = local ?? remote ?? EMPTY_ANSWERS;

      if (local) {
        const { error } = await persist(uid, local, accountUser?.email ?? agniEmail);
        if (!error) localStorage.removeItem(DRAFT_KEY);
      }

      if (active) {
        setAnswers(restored);
        setLoadingFicha(false);
        hydrated.current = true;
      }
    })();
    return () => { active = false; };
  }, [accountUser?.id, accountUser?.email, agniEmail, persist]);

  const saveAnswers = useCallback(async (showToast: boolean) => {
    setSaving(true);
    const uid = accountUser?.id ?? (await currentUserId()) ?? (await ensureAnonSession());

    if (!uid) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      setSaving(false);
      markSaved();
      if (showToast) toast({ title: "Salvo" });
      return;
    }

    const { error } = await persist(uid, answers, accountUser?.email ?? agniEmail);
    setSaving(false);
    if (error) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      if (showToast) toast({ title: "Não foi possível salvar", description: "Tente novamente em instantes.", variant: "destructive" });
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    markSaved();
    if (showToast) toast({ title: "Salvo" });
  }, [accountUser, agniEmail, answers, markSaved, persist, toast]);

  useEffect(() => {
    if (!hydrated.current) return;
    const hasText = Boolean(answers.q1.trim() || answers.q2.trim() || answers.q3.trim());
    if (!hasText) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    const timer = window.setTimeout(() => { void saveAnswers(false); }, 2000);
    return () => window.clearTimeout(timer);
  }, [answers, saveAnswers]);

  const assinarFoto = useCallback(async (path: string) => {
    const { data } = await supabase.storage.from("linguas-jornada").createSignedUrl(path, 3600);
    if (data?.signedUrl) setFotoUrl(data.signedUrl);
  }, []);

  useEffect(() => {
    let active = true;
    marcasHidratadas.current = false;
    if (!uid) {
      setMarcas([]);
      setFotoPath(null);
      setFotoUrl(null);
      return () => { active = false; };
    }
    void (async () => {
      const { data } = await supabase
        .from("jornada_ficha")
        .select("respostas")
        .eq("user_id", uid)
        .eq("noite", 2)
        .maybeSingle();
      const row = data?.respostas && typeof data.respostas === "object" && !Array.isArray(data.respostas)
        ? (data.respostas as { marcas?: unknown; foto_path?: unknown })
        : null;
      if (!active) return;
      setMarcas(Array.isArray(row?.marcas) ? (row!.marcas as string[]).filter((m) => typeof m === "string") : []);
      const path = typeof row?.foto_path === "string" ? row.foto_path : null;
      setFotoPath(path);
      if (path) void assinarFoto(path);
      marcasHidratadas.current = true;
    })();
    return () => { active = false; };
  }, [uid, assinarFoto]);

  const persistNoite2 = useCallback(async (listaMarcas: string[], path: string | null) => {
    const alvo = uid ?? (await currentUserId()) ?? (await ensureAnonSession());
    if (!alvo) return { error: new Error("sem sessão"), uid: null as string | null };
    if (alvo !== uid) setUid(alvo);
    const { error } = await supabase.from("jornada_ficha").upsert({
      user_id: alvo,
      email: accountUser?.email ?? agniEmail,
      noite: 2,
      respostas: { marcas: listaMarcas, foto_path: path },
      dosha_id_publico: doshaResult?.idPublico ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,noite" });
    return { error, uid: alvo };
  }, [accountUser?.email, agniEmail, doshaResult?.idPublico, uid]);

  useEffect(() => {
    if (!marcasHidratadas.current || !marcas.length) return;
    const timer = window.setTimeout(() => { void persistNoite2(marcas, fotoPath); }, 1500);
    return () => window.clearTimeout(timer);
  }, [marcas, fotoPath, persistNoite2]);

  const alternarMarca = (slug: string) => {
    marcasHidratadas.current = true;
    setLeituraSalva(false);
    setMarcas((atual) => (atual.includes(slug) ? atual.filter((m) => m !== slug) : [...atual, slug]));
  };

  const salvarLeitura = async () => {
    setSalvandoLeitura(true);
    const { error } = await persistNoite2(marcas, fotoPath);
    setSalvandoLeitura(false);
    if (error) {
      toast({ title: "Não foi possível salvar", description: "Tente novamente em instantes.", variant: "destructive" });
      return;
    }
    setLeituraSalva(true);
    toast({ title: "Salvo" });
  };

  const enviarFoto = async (arquivo: File | null | undefined) => {
    if (!arquivo) return;
    setErroFoto(false);
    setSubindoFoto(true);
    try {
      const alvo = uid ?? (await currentUserId()) ?? (await ensureAnonSession());
      if (!alvo) throw new Error("sem sessão");
      if (alvo !== uid) setUid(alvo);
      const { file } = await optimizeImageToJpeg(arquivo, { maxWidth: 1600, quality: 0.85 });
      const path = `${alvo}/noite2.jpg`;
      const { error } = await supabase.storage.from("linguas-jornada").upload(path, file, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      marcasHidratadas.current = true;
      setFotoPath(path);
      await assinarFoto(path);
      await persistNoite2(marcas, path);
    } catch {
      setErroFoto(true);
    } finally {
      setSubindoFoto(false);
    }
  };


  const doshaKey = (doshaResult?.doshaprincipal?.toLowerCase().match(/vata|pitta|kapha/)?.[0] || "vata") as DoshaNome;
  const principalScore = doshaKey === "vata" ? doshaResult?.vatascore : doshaKey === "pitta" ? doshaResult?.pittascore : doshaResult?.kaphascore;
  const principalLabel = `${doshaKey[0].toUpperCase()}${doshaKey.slice(1)}, em ${getFaixa(doshaKey, principalScore).toLowerCase()}`;
  const scores = {
    vata: doshaResult?.vatascore ?? 0,
    pitta: doshaResult?.pittascore ?? 0,
    kapha: doshaResult?.kaphascore ?? 0,
  };

  return (
    <div className="detox-theme min-h-screen bg-detox-page text-detox-text" style={DETOX_THEME}>
      <Helmet>
        <title>Mapa da Jornada — Portal Ayurveda</title>
        <meta name="description" content="Seu mapa pessoal da Jornada da Primavera, com Teste de Dosha e respostas das três noites." />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6">
        <Link to="/detox" className="inline-flex items-center gap-2 text-sm font-semibold text-detox-dark hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para a sala de aula
        </Link>
      </div>
      <header className="mt-4 border-b border-detox-card-border bg-detox-page">
        <div className="mx-auto flex min-h-[84px] max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-detox-primary-soft text-detox-dark">
            <Map className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-[1.35rem] font-bold leading-tight text-detox-text">Mapa da Jornada</h1>
            <p className="mt-1 truncate text-xs text-detox-muted sm:text-sm">O que você responder aqui fica salvo na sua conta.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-[26px] px-4 py-8 sm:px-6 md:py-12">
        <section>
          <SectionHeading eyebrow="Seu ponto de partida" title="Seu Teste de Dosha" />
          {doshaResult ? (
            <div className="rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8">
              <div className="grid items-center gap-6 sm:grid-cols-[240px_1fr]">
                <div className="h-[240px]">
                  <Suspense fallback={<Skeleton className="h-full w-full rounded-full" />}><DoshaPieChart vata={scores.vata} pitta={scores.pitta} kapha={scores.kapha} variant="full" /></Suspense>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-detox-text">{principalLabel}</h3>
                  {agni?.agniPrincipal && <p className="mt-2 text-sm leading-relaxed text-detox-muted">{agni.agniPrincipal}</p>}
                  <p className="mt-3 text-sm font-semibold text-detox-muted">Forte {agni?.agniforte ?? 0} · Fraco {agni?.agnifraco ?? 0} · Irregular {agni?.agniirregular ?? 0}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-vata-1 px-4 py-2 text-sm font-bold text-vata-5">Vata {scores.vata}</span>
                <span className="rounded-full bg-pitta-1 px-4 py-2 text-sm font-bold text-pitta-5">Pitta {scores.pitta}</span>
                <span className="rounded-full bg-kapha-1 px-4 py-2 text-sm font-bold text-kapha-5">Kapha {scores.kapha}</span>
              </div>
              <div className="mt-6"><JourneyButton to="/meu-dosha" outline>Ver meu mapa completo</JourneyButton></div>
            </div>
          ) : (
            <div className="rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8">
              <h3 className="font-serif text-2xl font-bold text-detox-text">Comece pelo seu Teste de Dosha</h3>
              <p className="mt-2 text-sm leading-relaxed text-detox-muted md:text-base">São oito minutos, e é ele que dá sentido às três noites. Não precisa de senha nem de e-mail para começar.</p>
              <div className="mt-5"><JourneyButton to="/teste-de-dosha?redirect=/detox/mapa">Fazer o meu teste</JourneyButton></div>
            </div>
          )}
        </section>

        <section className="border-t border-detox-divider pt-[26px]">
          <SectionHeading eyebrow="Noite 1" badge="Aberta hoje" title="Três perguntas sobre você">
            <p className="mt-2 text-sm leading-relaxed text-detox-muted md:text-base">Responda com as suas palavras, do jeito que vier. Não tem resposta certa, e você pode voltar e mudar depois.</p>
          </SectionHeading>
          <div className="rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8">
            {loadingFicha ? <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div> : (
              <div>
                {QUESTIONS.map((question, index) => (
                  <div key={question.key} className={`${index > 0 ? "border-t border-detox-divider" : ""} py-7 first:pt-0 last:pb-0`}>
                    <label htmlFor={question.key} className="block">
                      <span className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-detox-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                        <span className="block pt-0.5 font-serif text-lg font-bold leading-relaxed text-detox-text md:text-xl">{question.text}</span>
                      </span>
                    </label>
                    <Textarea id={question.key} rows={6} value={answers[question.key]} onChange={(event) => { setJustSaved(false); setAnswers((current) => ({ ...current, [question.key]: event.target.value })); }} placeholder="Escreva aqui…" className="mt-5 min-h-[148px] resize-y rounded-[10px] border-[1.5px] border-detox-field-border bg-detox-card px-4 py-3 text-base leading-relaxed text-detox-text placeholder:text-detox-muted focus-visible:border-detox-primary focus-visible:ring-[3px] focus-visible:ring-[var(--detox-focus)] focus-visible:ring-offset-0" />
                    <p className="mt-1.5 text-right text-xs text-detox-muted">{answers[question.key].length} caracteres</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-5 border-t border-detox-divider pt-6 sm:flex-row sm:items-center sm:justify-between">
              {accountUser ? (
                <p className="flex max-w-md items-center gap-2 text-sm leading-relaxed text-detox-muted">
                  {justSaved && <Check className="h-4 w-4 shrink-0 text-detox-dark" aria-hidden="true" />}
                  Salva sozinho enquanto você escreve. Fica na sua conta, ninguém mais vê.
                </p>
              ) : (
                <div className="max-w-md">
                  <p className="flex items-center gap-2 text-sm leading-relaxed text-detox-muted">
                    {justSaved && <Check className="h-4 w-4 shrink-0 text-detox-dark" aria-hidden="true" />}
                    Já está salvo. Para guardar para sempre e abrir de outro aparelho, confirme o seu e-mail.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3 rounded-full border border-detox-field-border bg-transparent px-4 text-xs font-bold uppercase text-detox-dark hover:bg-detox-light hover:text-detox-dark">
                    <Link to="/entrar?redirect=/detox/mapa">Confirmar meu e-mail</Link>
                  </Button>
                </div>
              )}
              <Button onClick={() => void saveAnswers(true)} disabled={saving || loadingFicha} className="min-h-[60px] shrink-0 rounded-full bg-detox-primary px-7 text-sm font-bold uppercase text-primary-foreground hover:bg-detox-dark">
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
