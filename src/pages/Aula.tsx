import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Aula {
  id: string;
  slug: string;
  titulo: string;
  youtube_url: string;
  is_active: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.searchParams.get("v")) {
      id = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.split("/embed/")[1];
    } else if (u.pathname.startsWith("/live/")) {
      id = u.pathname.split("/live/")[1];
    }
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?rel=0`;
  } catch {
    return null;
  }
}

const Aula = () => {
  const { slug } = useParams<{ slug: string }>();
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      if (error || !data) {
        setNotFound(true);
      } else {
        setAula(data as Aula);
      }
      setLoading(false);
    })();
  }, [slug]);

  const embed = aula ? getYouTubeEmbedUrl(aula.youtube_url) : null;

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{aula ? `${aula.titulo} — Portal Ayurveda` : "Aula ao Vivo"}</title>
        <meta
          name="description"
          content={aula?.titulo || "Aula ao vivo do Portal Ayurveda"}
        />
      </Helmet>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
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
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-black aspect-video">
              {embed ? (
                <iframe
                  src={embed}
                  title={aula.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  URL de vídeo inválida
                </div>
              )}
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary text-center">
              {aula.titulo}
            </h1>
          </article>
        )}
      </main>
    </div>
  );
};

export default Aula;
