import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from "@/components/ui/drawer";
import { ExternalLink, MessageCircle, Link2, Check } from "lucide-react";
import { useImmersive } from "@/contexts/ImmersiveContext";
import LiveChat from "@/components/aula/LiveChat";
import Comments from "@/components/Comments";
import { toast } from "sonner";

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
  destaque: boolean | null;
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

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  return (
    <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      <span className="text-xs">{copied ? "Copiado" : "Copiar link"}</span>
    </Button>
  );
};

const Aula = () => {
  const { slug } = useParams<{ slug: string }>();
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const now = useNow(1000);
  const { setImmersive } = useImmersive();

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

  const isDestaque = !!aula?.destaque;

  useEffect(() => {
    // Sempre oculta rodapé em qualquer aula
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  const embed = aula ? getYouTubeEmbedUrl(aula.youtube_url) : null;
  const startTs = useMemo(
    () => (aula?.starts_at ? new Date(aula.starts_at).getTime() : null),
    [aula?.starts_at]
  );

  const showButton =
    !!aula?.button_url &&
    !!aula?.button_text &&
    startTs !== null &&
    now >= startTs + (aula.button_delay_minutes ?? 0) * 60 * 1000;

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-6">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (notFound || !aula) {
    return (
      <div className="bg-white min-h-screen">
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-center">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            Aula não encontrada
          </h1>
          <p className="text-muted-foreground font-body">
            Verifique o endereço ou aguarde o início da próxima aula.
          </p>
        </main>
      </div>
    );
  }

  const youtubeWatchUrl = aula.youtube_url;

  const PlayerBlock = (
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
      <a
        href={youtubeWatchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 inline-flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-md backdrop-blur transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Ver no YouTube
      </a>
    </div>
  );

  // ============== DESTAQUE LAYOUT ==============
  if (isDestaque) {
    return (
      <div className="bg-white min-h-[calc(100vh-3rem)]">
        <Helmet>
          <title>{`${aula.titulo} — Portal Ayurveda`}</title>
          <meta
            name="description"
            content={aula.descricao || aula.titulo}
          />
        </Helmet>
        <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 md:py-6">
          {(aula.titulo || true) && (
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              {aula.titulo ? (
                <h1 className="font-heading text-lg md:text-2xl font-bold text-primary line-clamp-1">
                  {aula.titulo}
                </h1>
              ) : <span />}
              <CopyLinkButton />
            </div>
          )}

          {startTs && now < startTs && <Countdown target={startTs} />}

          {/* Desktop: 70/30 */}
          <div className="hidden md:grid md:grid-cols-10 gap-4 items-stretch">
            <div className="md:col-span-7">{PlayerBlock}</div>
            <div className="md:col-span-3 min-h-0">
              <div className="aspect-video md:aspect-auto md:h-full">
                <LiveChat slug={aula.slug} />
              </div>
            </div>
          </div>

          {/* Mobile: player + drawer */}
          <div className="md:hidden space-y-3">
            {PlayerBlock}
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="w-full gap-2" variant="secondary">
                  <MessageCircle className="h-4 w-4" />
                  Ver comentários
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[60vh]">
                <DrawerHeader className="pb-2">
                  <DrawerTitle>Chat ao vivo</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 min-h-0 px-3 pb-4">
                  <LiveChat slug={aula.slug} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {aula.descricao && (
            <p className="font-body text-base text-foreground/90 whitespace-pre-line leading-relaxed mt-6 max-w-4xl">
              {aula.descricao}
            </p>
          )}

          {showButton && (
            <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Button
                asChild
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white font-body text-base px-8 py-6 rounded-full shadow-md"
              >
                <a href={aula.button_url!} target="_blank" rel="noopener noreferrer">
                  {aula.button_text}
                </a>
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ============== LAYOUT PADRÃO ==============
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{`${aula.titulo} — Portal Ayurveda`}</title>
        <meta
          name="description"
          content={aula.descricao || aula.titulo}
        />
      </Helmet>
      <main className={`w-full max-w-6xl mx-auto px-4 sm:px-6 ${aula.titulo || (startTs && now < startTs) ? "py-10 md:py-16" : "py-4 md:py-6"}`}>
        {aula.titulo && (
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary text-center mb-6">
            {aula.titulo}
          </h1>
        )}

        {startTs && now < startTs && <Countdown target={startTs} />}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <article className="space-y-6 lg:col-span-2">
            {PlayerBlock}

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
                  <a href={aula.button_url!} target="_blank" rel="noopener noreferrer">
                    {aula.button_text}
                  </a>
                </Button>
              </div>
            )}
          </article>

          <aside className="lg:col-span-1 lg:sticky lg:top-4">
            <Comments slug={aula.slug} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Aula;
