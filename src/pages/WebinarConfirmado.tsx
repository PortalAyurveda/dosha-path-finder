import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getPalette, type LandingPaletteKey } from "@/data/landingPalettes";
import { MessageCircle, Check } from "lucide-react";

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

  const titulo = data.copy_confirmacao_titulo ?? "Inscrição confirmada!";
  const subtitulo =
    data.copy_confirmacao_subtitulo ?? "Agora o próximo passo é entrar no grupo.";
  const box =
    data.copy_box_whatsapp ??
    "O link da sala, o material de apoio e o acesso ao professor ficam todos lá.";

  return (
    <div
      className="min-h-screen w-full py-10 md:py-16 px-4"
      style={{ background: branding.warmBg ?? "#FAF9F6" }}
    >
      <Helmet>
        <title>{`${titulo} — ${data.titulo_evento}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div
        className="mx-auto w-full max-w-[560px] rounded-3xl shadow-xl overflow-hidden bg-white border"
        style={{ borderColor: `${branding.primaryColor}55` }}
      >
        <div className="px-6 pt-8 pb-4 text-center">
          <div
            className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: branding.primaryColor }}
          >
            <Check className="h-7 w-7 text-white" />
          </div>
          <h1
            className="font-serif text-2xl md:text-3xl font-bold leading-tight"
            style={{ color: branding.darkColor }}
          >
            {titulo}
          </h1>
          <p className="font-sans text-sm md:text-base mt-2 text-foreground/80">{subtitulo}</p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* WhatsApp box — hero element */}
          <div
            className="rounded-2xl p-5 text-center space-y-3"
            style={{ background: `${branding.primaryColor}30` }}
          >
            <p className="font-sans text-sm md:text-base" style={{ color: branding.darkColor }}>
              {box}
            </p>
            {data.link_whatsapp && (
              <Button
                asChild
                size="lg"
                className="w-full font-sans font-bold text-base py-6 rounded-full text-white border-0 shadow-md"
                style={{ background: "#25D366" }}
              >
                <a href={data.link_whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Entrar no grupo do WhatsApp
                </a>
              </Button>
            )}
          </div>

          {bullets.length > 0 && (
            <ul className="space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <div
                    className="mt-1 shrink-0 w-2 h-2 rounded-full"
                    style={{ background: branding.darkColor }}
                  />
                  <div>
                    {b.titulo && (
                      <p className="font-sans font-semibold text-sm" style={{ color: branding.darkColor }}>
                        {b.titulo}
                      </p>
                    )}
                    {b.texto && (
                      <p className="font-sans text-sm text-foreground/80 leading-relaxed">
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
