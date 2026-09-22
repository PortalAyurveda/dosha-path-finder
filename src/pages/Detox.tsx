import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, ExternalLink, PenLine, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LiveChat from "@/components/aula/LiveChat";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";
import { getPalette } from "@/data/landingPalettes";

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

interface DetoxAula {
  titulo: string;
  youtube_url: string;
  starts_at: string | null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/embed/")[1];
    else if (u.pathname.startsWith("/live/")) id = u.pathname.split("/live/")[1];
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?rel=0`;
  } catch {
    return null;
  }
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

const Countdown = ({ target }: { target: number }) => {
  const now = useNow(1000);
  const diff = Math.max(0, target - now);
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex min-w-[68px] flex-col items-center justify-center rounded-xl border border-detox-card-border bg-detox-card px-4 py-3 shadow-detox">
      <span className="font-serif text-3xl font-bold leading-none text-detox-text tabular-nums md:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[11px] uppercase text-detox-dark">{label}</span>
    </div>
  );

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs uppercase text-detox-dark">A aula começa em</p>
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {days > 0 && <Box value={days} label="dias" />}
        <Box value={hours} label="horas" />
        <Box value={mins} label="min" />
        <Box value={secs} label="seg" />
      </div>
    </div>
  );
};

const JourneyButton = ({ to, children, purple = false }: { to: string; children: React.ReactNode; purple?: boolean }) => (
  <Button
    asChild
    className={`min-h-[60px] w-full rounded-full px-7 text-sm font-bold uppercase lg:w-auto ${purple ? "bg-detox-purple hover:bg-detox-purple/90" : "bg-detox-primary hover:bg-detox-dark"} text-primary-foreground`}
  >
    <Link to={to}>{children}</Link>
  </Button>
);

const Detox = () => {
  const { user, isAnonymous, doshaResult } = useUser();
  const [aula, setAula] = useState<DetoxAula | null>(null);
  const [loading, setLoading] = useState(true);
  const now = useNow(1000);
  const isVisitor = !user || isAnonymous;

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("aulas_ao_vivo")
        .select("titulo, youtube_url, starts_at")
        .eq("slug", "detox")
        .eq("is_active", true)
        .maybeSingle();
      if (active) {
        setAula(data as DetoxAula | null);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const startTs = useMemo(() => aula?.starts_at ? new Date(aula.starts_at).getTime() : null, [aula?.starts_at]);
  const embed = aula ? getYouTubeEmbedUrl(aula.youtube_url) : null;
  const isLive = startTs === null || now >= startTs;
  const principal = (doshaResult?.doshaprincipal?.split("-")[0]?.trim().toLowerCase() || "vata") as DoshaNome;
  const score = principal === "vata" ? doshaResult?.vatascore : principal === "pitta" ? doshaResult?.pittascore : doshaResult?.kaphascore;
  const emailPrefix = user?.email?.split("@")[0]?.trim().toLocaleLowerCase("pt-BR") || "";
  const resultName = doshaResult?.nome?.trim() || "";
  const firstName = resultName.split(/\s+/)[0] || "";
  const hasPersonalName = Boolean(firstName) && !emailPrefix.startsWith(firstName.toLocaleLowerCase("pt-BR"));
  const resultTitle = hasPersonalName
    ? `${firstName}, ${principal[0].toUpperCase()}${principal.slice(1)} em ${getFaixa(principal, score).toLowerCase()}`
    : "Seu mapa está pronto";

  const guideSteps = [
    { icon: PlayCircle, title: "Assista a noite 1", text: "É agora, aqui mesmo." },
    { icon: PenLine, title: "Responda as três perguntas", text: "Ficam salvas na sua conta." },
    { icon: CalendarDays, title: "Volte amanhã e quinta", text: "As noites 2 e 3 abrem às 19h." },
  ];

  return (
    <div className="detox-theme min-h-screen bg-detox-page text-detox-text" style={DETOX_THEME}>
      <Helmet>
        <title>{aula?.titulo ? `${aula.titulo} — Portal Ayurveda` : "Jornada da Primavera — Portal Ayurveda"}</title>
        <meta name="description" content="Assista à Jornada da Primavera e acompanhe suas respostas no mapa pessoal." />
      </Helmet>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <div className="mb-6 flex items-center gap-3">
          <img src={DETOX_PALETTE.branding.logo} alt="" className="h-11 w-auto" />
          <span className="font-serif text-xl font-bold text-detox-text sm:text-2xl">Jornada da Primavera</span>
        </div>

        <div className="mb-7 space-y-4">
          {loading ? <Skeleton className="h-12 w-72" /> : startTs && !isLive ? (
            <Countdown target={startTs} />
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-2 text-xs font-bold uppercase text-destructive-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive-foreground motion-safe:animate-pulse" aria-hidden="true" />
              Ao vivo agora · Noite 1 de 3
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold text-detox-text md:text-5xl">Jornada da Primavera</h1>
            <p className="mt-2 text-base text-detox-muted md:text-lg">Noite 1 de 3. Assista aqui e comente no chat. O que você responde fica no seu mapa.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 min-[940px]:grid-cols-[minmax(0,1fr)_330px]">
            <Skeleton className="h-[480px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl min-[940px]:h-[480px]" />
          </div>
        ) : aula ? (
          <div className="grid gap-4 min-[940px]:grid-cols-[minmax(0,1fr)_330px]">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-detox-text shadow-lg min-[940px]:h-[480px] min-[940px]:aspect-auto">
              {embed ? (
                <iframe src={embed} title={aula.titulo} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-primary-foreground">URL de vídeo inválida</div>
              )}
              <span className="absolute left-3 top-3 rounded-[5px] bg-destructive px-2.5 py-1.5 text-xs font-bold text-destructive-foreground">● AO VIVO</span>
              <a href={aula.youtube_url} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-detox-text px-2.5 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur transition-opacity hover:opacity-90">
                <ExternalLink className="h-3.5 w-3.5" /> Ver no YouTube
              </a>
            </div>
            <div className="detox-chat h-[320px] min-h-0 min-[940px]:h-[480px]"><LiveChat slug="detox" /></div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-card shadow-sm"><p>A aula estará disponível em breve.</p></div>
        )}

        <section className="mt-6 rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(190px,0.8fr)_minmax(0,1.8fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase text-detox-dark">{isVisitor ? "Primeiro passo" : doshaResult ? "Seu mapa" : "Seu mapa está esperando"}</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-detox-text md:text-3xl">
                {isVisitor ? "Comece pelo seu Teste de Dosha" : doshaResult ? resultTitle : "Comece pelo Teste de Dosha"}
              </h2>
              <p className="mt-2 text-sm text-detox-muted md:text-base">{isVisitor ? "Não precisa de senha. Em oito minutos você tem o seu mapa." : doshaResult ? "As três perguntas de hoje estão abertas no seu mapa." : "Depois é só voltar pra cá, a aula continua."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {guideSteps.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3 sm:block">
                  <Icon className="h-5 w-5 shrink-0 text-detox-primary sm:mb-2" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-detox-text">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-detox-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-auto">
              <JourneyButton to={isVisitor ? "/entrar?redirect=/detox/mapa" : "/detox/mapa"} purple={!isVisitor && !!doshaResult}>
                {isVisitor ? "Entrar com meu e-mail" : "Abrir meu mapa"}
              </JourneyButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Detox;