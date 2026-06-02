import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getPalette, type LandingPaletteKey } from "@/data/landingPalettes";
import { Monitor, BookOpen } from "lucide-react";

interface WebinarRow {
  id: string;
  slug: string;
  titulo_evento: string;
  tema_paleta: string;
  link_whatsapp: string | null;
  copy_confirmacao_titulo: string | null;
  copy_confirmacao_subtitulo: string | null;
  copy_box_whatsapp: string | null;
  bullets: unknown;
}

interface Bullet {
  titulo?: string;
  texto?: string;
}

const NAVY = "#1e2547";

const parseBullets = (raw: unknown): Bullet[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Bullet[];
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  return [];
};

// "Inscrição Confirmada!" → "I n s c r i ç ã o   C o n f i r m a d a !"
const spacedTitle = (s: string) => s.split("").join(" ");

const WebinarConfirmado = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<WebinarRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("aulas_webinar")
        .select("id, slug, titulo_evento, tema_paleta, link_whatsapp, copy_confirmacao_titulo, copy_confirmacao_subtitulo, copy_box_whatsapp, bullets")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setData(data as WebinarRow);
      setLoading(false);
    })();
  }, [slug]);

  const palette = useMemo(() => {
    const key = (data?.tema_paleta || "alimentacao-verde") as LandingPaletteKey;
    return getPalette(key) ?? getPalette("alimentacao-verde");
  }, [data?.tema_paleta]);
  const branding = palette.branding;
  const ink = NAVY;
  const green = branding.primaryColor;
  const greenDark = branding.darkColor !== branding.primaryColor ? branding.darkColor : "#3f7a4f";
  const bullets = useMemo(() => parseBullets(data?.bullets), [data?.bullets]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background py-12 px-4">
        <Skeleton className="mx-auto max-w-[560px] h-[480px] rounded-3xl" />
      </div>
    );
  }
  if (notFound || !data) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl font-bold text-primary mb-2">Aula não encontrada</h1>
      </div>
    );
  }

  const titulo = data.copy_confirmacao_titulo ?? "Inscrição Confirmada!";
  const subtitulo =
    data.copy_confirmacao_subtitulo ?? "Sua inscrição está confirmada!";
  const box =
    data.copy_box_whatsapp ??
    "Entre no grupo do WhatsApp e aguarde o material e o link da aula.";

  return (
    <div
      className="min-h-screen w-full py-8 md:py-16 px-4"
      style={{ background: `${green}26` }}
    >
      <Helmet>
        <title>{`${titulo} — ${data.titulo_evento}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div
        className="mx-auto w-full max-w-[560px] rounded-[2rem] shadow-xl overflow-hidden bg-white border"
        style={{ borderColor: `${green}55` }}
      >
        <div className="px-6 md:px-8 pt-8 pb-8 text-center">
          <h1
            className="font-serif italic font-bold text-[1.4rem] md:text-[1.7rem] leading-tight"
            style={{ color: ink, letterSpacing: "0.05em" }}
          >
            {spacedTitle(titulo)}
          </h1>

          <div className="flex justify-center my-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${green}33` }}
            >
              <Monitor className="h-8 w-8" style={{ color: greenDark }} />
            </div>
          </div>

          <p className="font-sans text-base font-semibold" style={{ color: ink }}>
            {subtitulo}
          </p>

          {data.link_whatsapp && (
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="font-sans font-bold text-base py-6 px-8 rounded-full border-0 shadow-md tracking-wide"
                style={{ background: green, color: ink }}
              >
                <a href={data.link_whatsapp} target="_blank" rel="noopener noreferrer">
                  ENTRE NO GRUPO AQUI!
                </a>
              </Button>
            </div>
          )}

          <p
            className="font-sans font-semibold text-[0.95rem] mt-7 leading-relaxed max-w-[420px] mx-auto"
            style={{ color: ink }}
          >
            {box}
          </p>

          <div className="flex justify-center mt-6">
            <BookOpen className="h-10 w-10" style={{ color: greenDark }} strokeWidth={1.5} />
          </div>

          {bullets.length > 0 && (
            <ul className="mt-7 space-y-3 text-left max-w-[440px] mx-auto">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <div
                    className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: greenDark }}
                  />
                  <div>
                    {b.titulo && (
                      <p className="font-sans font-bold text-sm" style={{ color: ink }}>
                        {b.titulo}
                      </p>
                    )}
                    {b.texto && (
                      <p className="font-sans text-sm leading-relaxed" style={{ color: ink, opacity: 0.85 }}>
                        {b.texto}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebinarConfirmado;
