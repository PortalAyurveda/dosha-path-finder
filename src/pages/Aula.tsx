import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Aula {
  id: string;
  slug: string;
  titulo: string;
  youtube_url: string;
  is_active: boolean;
  starts_at: string | null;
  descricao: string | null;
  button_text: string | null;
  button_url: string | null;
  button_delay_minutes: number | null;
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
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
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
    <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur border border-primary/15 rounded-xl px-4 py-3 min-w-[68px] shadow-sm">
      <span className="font-heading text-3xl md:text-4xl font-bold text-secondary tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-primary/70 mt-1 font-body">
        {label}
      </span>
    </div>
  );

  return (
    <div className="w-full mb-6">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-primary/60 mb-3 font-body">
        A aula começa em
      </p>
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        {days > 0 && <Box value={days} label="dias" />}
        <Box value={hours} label="horas" />
        <Box value={mins} label="min" />
        <Box value={secs} label="seg" />
      </div>
    </div>
  );
};

const Aula = () => {
  const { slug } = useParams<{ slug: string }>();
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const now = useNow(1000);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("aulas_ao_vivo")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setAula(data as Aula);
      setLoading(false);
    })();
  }, [slug]);

  const embed = aula ? getYouTubeEmbedUrl(aula.youtube_url) : null;
  const startTs = useMemo(
    () => (aula?.starts_at ? new Date(aula.starts_at).getTime() : null),
    [aula?.starts_at]
  );

  // Button appears after (start + delay). If no start defined, hide button.
  const showButton =
    !!aula?.button_url &&
    !!aula?.button_text &&
    startTs !== null &&
    now >= startTs + (aula.button_delay_minutes ?? 0) * 1000;

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{aula ? `${aula.titulo} — Portal Ayurveda` : "Aula ao Vivo"}</title>
        <meta
          name="description"
          content={aula?.descricao || aula?.titulo || "Aula ao vivo do Portal Ayurveda"}
        />
      </Helmet>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        ) : notFound || !aula ? (
          <div className="text-center py-20">
            <h1 className="font-heading text-3xl font-bold text-primary mb-2">
              Aula não encontrada
            </h1>
            <p className="text-muted-foreground font-body">
              Verifique o endereço ou aguarde o início da próxima aula.
            </p>
          </div>
        ) : (
          <article className="space-y-6">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary text-center">
              {aula.titulo}
            </h1>

            {startTs && now < startTs && <Countdown target={startTs} />}

            <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-black aspect-video">
              {embed ? (
                <iframe
                  src={embed}
                  title={aula.titulo}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  URL de vídeo inválida
                </div>
              )}
            </div>

            {aula.descricao && (
              <p className="font-body text-base md:text-lg text-foreground/90 whitespace-pre-line leading-relaxed">
                {aula.descricao}
              </p>
            )}

            {showButton && (
              <div className="flex justify-center pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Button
                  asChild
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-white font-body text-base px-8 py-6 rounded-full shadow-md"
                >
                  <a href={aula.button_url!} target="_blank" rel="noreferrer">
                    {aula.button_text}
                  </a>
                </Button>
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
};

export default Aula;
