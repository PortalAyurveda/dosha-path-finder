import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRIMARY = "#352F54";
const LEAF = "4px 20px 4px 20px";

type Row = {
  title: string;
  meta_description: string | null;
  image_url: string | null;
  link_do_artigo: string | null;
};

const FundamentosAyurveda = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["index_fundamentos_ayurveda"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_conteudo")
        .select("title, meta_description, image_url, link_do_artigo, destaque_ordem, created_at")
        .eq("destaque_index", true)
        .eq("status", "published")
        .not("link_do_artigo", "is", null)
        .order("destaque_ordem", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(9);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section className="bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-8 md:pb-10">
        <div className="text-center mb-6">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl"
            style={{ color: PRIMARY }}
          >
            Conheça Ayurveda por aqui
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-background border border-border overflow-hidden"
                  style={{ borderRadius: LEAF }}
                >
                  <div className="w-full aspect-video bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                    <div className="h-3 bg-muted animate-pulse rounded w-full" />
                    <div className="h-3 bg-muted animate-pulse rounded w-3/5" />
                  </div>
                </div>
              ))
            : (data ?? []).map((art) => (
                <Link
                  key={art.link_do_artigo}
                  to={`/blog/${art.link_do_artigo}`}
                  className="group block bg-background border border-border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderRadius: LEAF }}
                >
                  {art.image_url && (
                    <div className="w-full aspect-video overflow-hidden bg-muted">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3
                      className="font-serif font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:underline"
                      style={{ color: PRIMARY }}
                    >
                      {art.title}
                    </h3>
                    {art.meta_description && (
                      <p className="font-sans text-[13px] leading-snug text-muted-foreground line-clamp-3">
                        {art.meta_description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-sans font-semibold text-sm px-6 py-3 transition-all hover:-translate-y-0.5"
            style={{
              background: "transparent",
              border: `2px solid ${PRIMARY}`,
              color: PRIMARY,
              borderRadius: LEAF,
            }}
          >
            Ver todos os artigos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FundamentosAyurveda;
