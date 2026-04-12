import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Instagram,
  Mail,
  Phone,
  MessageCircle,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getInstagramHandle,
  getTherapistDisplayName,
  getTherapistLocation,
  getTherapistThemeClass,
  normalizeTherapistSlug,
  splitTherapistSpecialties,
  therapistMatchesSlug,
} from "@/lib/terapeutas";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const TerapeutaPerfil = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showContact, setShowContact] = useState(false);
  const requestedSlug = normalizeTherapistSlug(slug);

  const { data: terapeuta, isLoading } = useQuery({
    queryKey: ["terapeuta", requestedSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .eq("status", "aprovado")
        .order("created date", { ascending: false });

      if (error) throw error;
      return data?.find((item) => therapistMatchesSlug(requestedSlug, item)) ?? null;
    },
    enabled: Boolean(requestedSlug),
  });

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-36 aspect-[4/5] shadow-therapist">
            <div className="therapist-portal-arch h-full w-full bg-muted/60 p-[4px]">
              <Skeleton className="therapist-portal-arch h-full w-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </main>
    );
  }

  if (!terapeuta) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Terapeuta não encontrado</h1>
        <Link to="/terapeutas-do-brasil" className="text-primary hover:underline">
          ← Voltar ao diretório
        </Link>
      </main>
    );
  }

  const displayName = getTherapistDisplayName(terapeuta.nome ?? terapeuta.title);
  const location = getTherapistLocation(terapeuta.cidade, terapeuta.estado);
  const especialidades = splitTherapistSpecialties(terapeuta.especialidade);
  const bioParagraphs = (terapeuta.resumo ?? "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const instagramHandle = getInstagramHandle(terapeuta.instagram);
  const whatsappNumber = terapeuta.whatsapp?.trim() || null;
  const emailAddress = terapeuta.email?.trim() || null;
  const imageUrl = terapeuta.imagem ?? terapeuta["imagem.1"];
  const themeClass = getTherapistThemeClass(terapeuta["terapeutas(dinamica)"] ?? displayName);
  const hasWhatsapp = !!whatsappNumber;
  const hasEmail = !!emailAddress;
  const hasInstagram = !!instagramHandle;
  const hasAnyContact = hasWhatsapp || hasEmail || hasInstagram;

  return (
    <>
      <Helmet>
        <title>{displayName} — Terapeuta Ayurvédico | Portal Ayurveda</title>
        <meta
          name="description"
          content={`${displayName}, terapeuta ayurvédico em ${[terapeuta.cidade, terapeuta.estado].map((item) => item?.trim()).filter(Boolean).join(", ")}. ${bioParagraphs[0]?.slice(0, 120) || ""}`}
        />
      </Helmet>

      <main className={cn("max-w-3xl mx-auto px-4 py-8 md:py-12", themeClass)}>
        <Link
          to="/terapeutas-do-brasil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao diretório
        </Link>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5">
            <div className="w-40 md:w-48 aspect-[4/5] shadow-therapist">
              <div className="therapist-portal-arch h-full w-full bg-therapist/30 p-[4px]">
                <div className="therapist-portal-arch h-full w-full overflow-hidden bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Foto de ${displayName}`}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-therapist-soft text-5xl font-bold text-therapist-ink">
                      {displayName[0] || "?"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">
            {displayName}
          </h1>

          {location && (
            <p className="text-muted-foreground flex items-center gap-1.5 mb-3">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}

          {terapeuta.formado_desde && (
            <Badge variant="outline" className="border-therapist/30 bg-therapist-soft text-sm px-3 py-1 mb-4 text-therapist-ink">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Atua desde {terapeuta.formado_desde}
            </Badge>
          )}
        </div>

        {especialidades.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 font-serif">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {especialidades.map((esp) => (
                <Badge
                  key={esp}
                  variant="outline"
                  className="border-therapist/30 bg-therapist-soft/80 px-3 py-1 text-xs text-therapist-ink"
                >
                  {esp}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {bioParagraphs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-3 font-serif">Sobre</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {hasAnyContact && (
          <section className="mb-10">
            {!showContact ? (
              <Button
                onClick={() => setShowContact(true)}
                className="w-full bg-therapist text-therapist-foreground gap-2 py-6 text-base rounded-xl shadow-therapist hover:opacity-95"
              >
                <Phone className="h-5 w-5" />
                Ver Informações de Contato
              </Button>
            ) : (
              <div className="relative rounded-2xl border border-therapist/30 bg-gradient-to-br from-therapist-soft/90 to-card p-6 shadow-therapist animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={() => setShowContact(false)}
                  className="absolute top-3 right-3 text-therapist-ink/70 hover:text-therapist-ink"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-bold text-foreground mb-1 font-serif">
                  {displayName}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">Informações de contato</p>

                <div className="space-y-3">
                  {hasWhatsapp && (
                    <a
                      href={whatsappLink(whatsappNumber!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-therapist px-4 py-3 font-medium text-therapist-foreground transition-opacity hover:opacity-95"
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}

                  {hasEmail && (
                    <a
                      href={`mailto:${emailAddress}`}
                      className="flex items-center gap-3 rounded-xl border border-therapist/25 bg-card px-4 py-3 font-medium text-foreground transition-colors hover:bg-therapist-soft/70"
                    >
                      <Mail className="h-5 w-5" />
                      {emailAddress}
                    </a>
                  )}

                  {hasInstagram && (
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-therapist/25 bg-card px-4 py-3 font-medium text-foreground transition-colors hover:bg-therapist-soft/70"
                    >
                      <Instagram className="h-5 w-5" />
                      @{instagramHandle}
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
};

export default TerapeutaPerfil;
