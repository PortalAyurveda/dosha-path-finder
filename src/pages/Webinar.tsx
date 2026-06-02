import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPalette, type LandingPaletteKey } from "@/data/landingPalettes";
import { Mail, Loader2 } from "lucide-react";

interface WebinarRow {
  id: string;
  slug: string;
  titulo_evento: string;
  subtitulo: string | null;
  tema_paleta: string;
  data_hora: string | null;
  foto_url: string | null;
  copy_descricao: string | null;
  ativo: boolean | null;
}

const N8N_WEBHOOK = "https://n8n.portalayurveda.com/webhook/samkhya-pedido";
const NAVY = "#1e2547";

function formatDateLong(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `Dia ${dia} às ${hora}h.`;
  } catch {
    return iso;
  }
}

const Webinar = ({ data }: { data: WebinarRow }) => {
  const navigate = useNavigate();
  const palette = useMemo(() => {
    const key = (data.tema_paleta || "alimentacao-verde") as LandingPaletteKey;
    return getPalette(key) ?? getPalette("alimentacao-verde");
  }, [data.tema_paleta]);
  const branding = palette.branding;
  // Always navy for legibility; verde acentua data, CTA e fundo de página
  const ink = NAVY;
  const green = branding.primaryColor;
  const greenDark = branding.darkColor !== branding.primaryColor ? branding.darkColor : "#3f7a4f";

  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dataFmt = useMemo(() => formatDateLong(data.data_hora), [data.data_hora]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanWa = whatsapp.trim();
    if (!cleanEmail || !cleanWa) {
      toast.error("Preencha e-mail e WhatsApp");
      return;
    }
    setSubmitting(true);
    try {
      const { data: dosha } = await supabase
        .from("doshas_registros")
        .select("nome, doshaprincipal")
        .ilike("email", cleanEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nome = dosha?.nome ?? null;
      const doshaPrincipal = dosha?.doshaprincipal ?? null;

      const { error } = await supabase.from("captacao_webinar").insert({
        webinar_id: data.id,
        email: cleanEmail,
        whatsapp: cleanWa,
        nome,
        dosha: doshaPrincipal,
      });

      if (error) {
        if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
          toast.info("Você já está inscrito! Verifique seu e-mail.");
          setSubmitting(false);
          return;
        }
        toast.error("Não foi possível inscrever. Tente novamente.");
        setSubmitting(false);
        return;
      }

      try {
        await fetch(N8N_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "aula_secreta",
            email: cleanEmail,
            nome,
            dosha: doshaPrincipal,
            webinar_slug: data.slug,
          }),
        });
      } catch {
        /* ignore */
      }

      navigate(`/aula/${data.slug}/confirmado`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full py-8 md:py-16 px-4"
      style={{ background: `${green}26` }}
    >
      <Helmet>
        <title>{`${data.titulo_evento} — Portal Ayurveda`}</title>
        <meta name="description" content={data.copy_descricao ?? data.titulo_evento} />
      </Helmet>

      <div className="mx-auto w-full max-w-[760px]">
        <div
          className="rounded-[2rem] shadow-xl bg-white border p-5 md:p-8 overflow-hidden"
          style={{ borderColor: `${green}55` }}
        >
          {/* Envelope icon */}
          <div className="flex justify-center mb-2">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: `${green}33` }}
            >
              <Mail className="h-5 w-5" style={{ color: greenDark }} />
            </div>
          </div>

          <h1
            className="font-serif italic text-center text-[1.5rem] md:text-[1.75rem] font-bold leading-tight"
            style={{ color: ink }}
          >
            {data.titulo_evento}
          </h1>

          {(data.subtitulo || data.copy_descricao) && (
            <div
              className="mt-3 space-y-2 font-sans text-[0.95rem] leading-relaxed text-left"
              style={{ color: ink }}
            >
              {data.subtitulo && <p className="font-medium">{data.subtitulo}</p>}
              {data.copy_descricao && (
                <p className="whitespace-pre-line opacity-90">
                  {data.copy_descricao}
                </p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_280px] gap-4 md:gap-6 items-end mt-4">

            <div>
              {dataFmt && (
                <p
                  className="font-serif italic font-bold text-left mb-3"
                  style={{ color: greenDark, letterSpacing: "0.18em", fontSize: "1.05rem" }}
                >
                  {dataFmt}
                </p>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-sans text-sm font-semibold" style={{ color: ink }}>
                    Seu e-mail (para receber o link)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="digite seu e-mail aqui"
                    className="h-11 rounded-md border-0"
                    style={{ background: `${green}25`, color: ink }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="font-sans text-sm font-semibold" style={{ color: ink }}>
                    Seu WhatsApp (com DDD)
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-11 rounded-md border-0"
                    style={{ background: `${green}25`, color: ink }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-sans font-bold text-base py-6 rounded-full text-white border-0 tracking-wide"
                  style={{ background: green }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ENVIANDO...
                    </>
                  ) : (
                    "CONFIRMAR PRESENÇA"
                  )}
                </Button>

                <p
                  className="text-center font-serif italic text-sm pt-1"
                  style={{ color: ink }}
                >
                  Evento online e gratuito.
                </p>
              </form>
            </div>

            {data.foto_url && (
              <div className="flex justify-center md:justify-end items-end order-first md:order-last -mb-5 md:-mb-8 md:-mr-8">
                <img
                  src={data.foto_url}
                  alt={data.titulo_evento}
                  className="w-[260px] md:w-[320px] h-auto select-none block"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const WebinarRoute = () => {
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
        .select("id, slug, titulo_evento, subtitulo, tema_paleta, data_hora, foto_url, copy_descricao, ativo")
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setData(data as WebinarRow);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background py-12 px-4">
        <Skeleton className="mx-auto max-w-[640px] h-[520px] rounded-3xl" />
      </div>
    );
  }
  if (notFound || !data) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl font-bold text-primary mb-2">Aula não encontrada</h1>
        <p className="text-muted-foreground font-sans">
          Verifique o endereço da página.
        </p>
      </div>
    );
  }
  return <Webinar data={data} />;
};

export default WebinarRoute;
