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
import { Calendar, Loader2 } from "lucide-react";

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

function formatDateLong(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `Dia ${dia} às ${hora}`;
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
      // Lookup dosha do último teste
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

      // n8n notify (best-effort)
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
      className="min-h-screen w-full py-10 md:py-16 px-4"
      style={{ background: branding.warmBg ?? "#FAF9F6" }}
    >
      <Helmet>
        <title>{`${data.titulo_evento} — Portal Ayurveda`}</title>
        <meta name="description" content={data.copy_descricao ?? data.titulo_evento} />
      </Helmet>

      <div
        className="mx-auto w-full max-w-[560px] rounded-3xl shadow-xl overflow-hidden bg-white border"
        style={{ borderColor: `${branding.primaryColor}55` }}
      >
        <div
          className="px-6 pt-6 pb-4 text-center"
          style={{ background: `${branding.primaryColor}30` }}
        >
          <h1
            className="font-serif text-2xl md:text-3xl font-bold leading-tight"
            style={{ color: branding.darkColor }}
          >
            {data.titulo_evento}
          </h1>
          {data.subtitulo && (
            <p className="font-sans text-sm md:text-base mt-2" style={{ color: branding.darkColor }}>
              {data.subtitulo}
            </p>
          )}
          {dataFmt && (
            <div
              className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "white", color: branding.darkColor }}
            >
              <Calendar className="h-3.5 w-3.5" />
              {dataFmt}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {data.foto_url && (
            <div className="order-2 md:order-2 md:min-h-[360px]">
              <img
                src={data.foto_url}
                alt={data.titulo_evento}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className={`p-6 space-y-4 order-1 md:order-1 ${!data.foto_url ? "md:col-span-2" : ""}`}
          >
            {data.copy_descricao && (
              <p className="font-sans text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                {data.copy_descricao}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wide">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs uppercase tracking-wide">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-sans font-bold text-base py-6 rounded-full text-white border-0"
              style={{ background: branding.darkColor }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Quero participar"
              )}
            </Button>
          </form>
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
        <Skeleton className="mx-auto max-w-[560px] h-[480px] rounded-3xl" />
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
