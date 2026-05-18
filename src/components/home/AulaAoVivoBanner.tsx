import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PORTAL_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg";

const SLUG = "aovivolancamento";

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/embed/")[1];
    else if (u.pathname.startsWith("/live/")) id = u.pathname.split("/live/")[1];
    if (!id) return null;
    // No autoplay
    return `https://www.youtube.com/embed/${id}?rel=0&autoplay=0`;
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

const Box = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center bg-white border border-primary/15 rounded-xl px-4 py-3 min-w-[68px] shadow-sm">
    <span className="font-heading text-3xl md:text-4xl font-bold text-secondary tabular-nums leading-none">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[11px] uppercase tracking-wider text-primary/70 mt-1 font-body">
      {label}
    </span>
  </div>
);

const Countdown = ({ target }: { target: number }) => {
  const now = useNow(1000);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
      {days > 0 && <Box value={days} label="dias" />}
      <Box value={hours} label="horas" />
      <Box value={mins} label="min" />
      <Box value={secs} label="seg" />
    </div>
  );
};

const AulaAoVivoBanner = () => {
  const { data: aula } = useQuery({
    queryKey: ["index_aula_aovivo", SLUG],
    queryFn: async () => {
      const { data } = await supabase
        .from("aulas_ao_vivo")
        .select("slug,titulo,youtube_url,starts_at,is_active")
        .eq("slug", SLUG)
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    refetchInterval: 60_000,
  });

  const now = useNow(1000);
  const startTs = useMemo(
    () => (aula?.starts_at ? new Date(aula.starts_at).getTime() : null),
    [aula?.starts_at]
  );
  const embed = aula?.youtube_url ? getEmbedUrl(aula.youtube_url) : null;

  if (!aula || !embed) return null;

  const isLive = startTs !== null && now >= startTs;

  return (
    <section
      className="w-full"
      style={{
        background: "linear-gradient(135deg, #FFF8EE 0%, #F8F9FA 100%)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
      aria-label="Aula ao vivo"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex flex-col items-center text-center gap-4 mb-6 relative">
          {isLive && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {["🎉","✨","🎆","🎊","🪔","✨","🎉","🎆"].map((e, i) => (
                <span
                  key={i}
                  className="absolute text-2xl md:text-3xl select-none"
                  style={{
                    left: `${(i * 13 + 7) % 95}%`,
                    bottom: 0,
                    animation: `aula-firework 2.8s ease-out ${i * 0.35}s infinite`,
                  }}
                >
                  {e}
                </span>
              ))}
              <style>{`
                @keyframes aula-firework {
                  0%   { transform: translateY(0) scale(0.6); opacity: 0; }
                  20%  { opacity: 1; }
                  100% { transform: translateY(-160px) scale(1.2); opacity: 0; }
                }
              `}</style>
            </div>
          )}
          <img
            src={PORTAL_LOGO}
            alt="Portal Ayurveda"
            className="h-12 md:h-14 w-auto relative"
            loading="eager"
          />
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 relative">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Ao vivo agora
              </span>
            </div>
          ) : (
            <p className="text-xs uppercase tracking-[0.2em] text-primary/60 font-body">
              Aula ao vivo começa em
            </p>
          )}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary leading-tight relative">
            {aula.titulo}
          </h2>
          {startTs && (
            <div className="relative">
              <Countdown target={isLive ? Date.now() : startTs} />
            </div>
          )}
        </div>

        {isLive ? (
          <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-black aspect-video">
            <iframe
              src={embed}
              title={aula.titulo}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="text-center">
            <Link
              to={`/aula/${aula.slug}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-secondary hover:bg-secondary/90 text-white font-body font-semibold shadow-md transition-colors"
            >
              Ir para a sala da aula
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default AulaAoVivoBanner;
