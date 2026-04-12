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
import { whatsappLink } from "@/lib/whatsapp";

const TerapeutaPerfil = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showContact, setShowContact] = useState(false);

  const { data: terapeuta, isLoading } = useQuery({
    queryKey: ["terapeuta", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .eq("terapeutas(dinamica)", slug!)
        .eq("status", "aprovado")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-36 h-36 rounded-full" />
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
        <Link to="/terapeutas-do-brasil" className="text-emerald-600 hover:underline">
          ← Voltar ao diretório
        </Link>
      </main>
    );
  }

  const especialidades = terapeuta.especialidade
    ? terapeuta.especialidade.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const instagramHandle = terapeuta.instagram?.replace(/^'?@?/, "") || null;
  const hasWhatsapp = !!terapeuta.whatsapp;
  const hasEmail = !!terapeuta.email;
  const hasInstagram = !!instagramHandle;
  const hasAnyContact = hasWhatsapp || hasEmail || hasInstagram;

  return (
    <>
      <Helmet>
        <title>{terapeuta.nome} — Terapeuta Ayurvédico | Portal Ayurveda</title>
        <meta
          name="description"
          content={`${terapeuta.nome}, terapeuta ayurvédico em ${[terapeuta.cidade, terapeuta.estado].filter(Boolean).join(", ")}. ${terapeuta.resumo?.slice(0, 120) || ""}`}
        />
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <Link
          to="/terapeutas-do-brasil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao diretório
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          {/* Ogival frame */}
          <div className="relative mb-5">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg bg-muted">
              {terapeuta.imagem ? (
                <img
                  src={terapeuta.imagem}
                  alt={`Foto de ${terapeuta.nome}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-emerald-300 bg-emerald-50">
                  {terapeuta.nome?.[0] || "?"}
                </div>
              )}
            </div>
            {/* Decorative ogival arc */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3">
              <svg viewBox="0 0 80 12" className="w-full h-full">
                <path
                  d="M0 12 Q40 -4 80 12"
                  fill="none"
                  stroke="hsl(142, 69%, 58%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">
            {terapeuta.nome}
          </h1>

          {(terapeuta.cidade || terapeuta.estado) && (
            <p className="text-muted-foreground flex items-center gap-1.5 mb-3">
              <MapPin className="h-4 w-4" />
              {[terapeuta.cidade, terapeuta.estado].filter(Boolean).join(" — ")}
            </p>
          )}

          {terapeuta.formado_desde && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-sm px-3 py-1 mb-4">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Atua desde {terapeuta.formado_desde}
            </Badge>
          )}
        </div>

        {/* Specialties */}
        {especialidades.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 font-serif">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {especialidades.map((esp) => (
                <Badge
                  key={esp}
                  variant="outline"
                  className="text-xs px-3 py-1 border-emerald-300 text-emerald-700 bg-emerald-50/60"
                >
                  {esp}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Bio */}
        {terapeuta.resumo && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-3 font-serif">Sobre</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
              {terapeuta.resumo.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        {hasAnyContact && (
          <section className="mb-10">
            {!showContact ? (
              <Button
                onClick={() => setShowContact(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 py-6 text-base rounded-xl shadow-md"
              >
                <Phone className="h-5 w-5" />
                Ver Informações de Contato
              </Button>
            ) : (
              <div className="relative rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={() => setShowContact(false)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-bold text-foreground mb-1 font-serif">
                  {terapeuta.nome}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">Informações de contato</p>

                <div className="space-y-3">
                  {hasWhatsapp && (
                    <a
                      href={whatsappLink(terapeuta.whatsapp!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}

                  {hasEmail && (
                    <a
                      href={`mailto:${terapeuta.email}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted/50 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      {terapeuta.email}
                    </a>
                  )}

                  {hasInstagram && (
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted/50 transition-colors"
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
