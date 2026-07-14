import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, Video as VideoIcon, FileText, UtensilsCrossed, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/PageContainer";
import Seo from "@/components/Seo";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import BannerSlot from "@/components/banners/BannerSlot";

type Tipo = "video" | "receita" | "artigo" | "produto";
interface Resultado {
  tipo: Tipo;
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  imagem: string | null;
  rota: string;
  pontuacao: number | null;
}
type TabKey = Tipo;

const SECTION_META: Record<TabKey, { label: string; icon: React.ReactNode }> = {
  produto: { label: "Produtos", icon: <Package className="h-4 w-4" /> },
  receita: { label: "Receitas", icon: <UtensilsCrossed className="h-4 w-4" /> },
  video: { label: "Vídeos", icon: <VideoIcon className="h-4 w-4" /> },
  artigo: { label: "Artigos", icon: <FileText className="h-4 w-4" /> },
};

const ORDER: TabKey[] = ["produto", "receita", "video", "artigo"];

const Pesquisa = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = params.get("q") || "";
  const [term, setTerm] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(term.trim());
      if (term.trim()) setParams({ q: term.trim() }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [term, setParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["pesquisa-full", debounced],
    queryFn: async () => {
      if (debounced.length < 2) return [] as Resultado[];
      const { data, error } = await (supabase.rpc as any)("busca_global", {
        p_termo: debounced,
        p_limite_por_tipo: 12,
      });
      if (error) throw error;
      return (data || []) as Resultado[];
    },
    enabled: debounced.length >= 2,
  });

  const grupos: Record<TabKey, Resultado[]> = {
    produto: [],
    receita: [],
    video: [],
    artigo: [],
  };
  (data || []).forEach((r) => grupos[r.tipo]?.push(r));

  return (
    <PageContainer title={`Pesquisa${debounced ? `: ${debounced}` : ""}`} description="Pesquise produtos, receitas, vídeos e artigos.">
      <Seo title={`Pesquisa: ${debounced || ""}`} description="Pesquise produtos, receitas, vídeos e artigos." />
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">Pesquisa</h1>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por produtos, receitas, vídeos ou artigos..."
            className="pl-12 h-12 text-base"
          />
        </div>

        {debounced.length < 2 ? (
          <p className="text-center text-muted-foreground py-12">Digite ao menos 2 caracteres para buscar.</p>
        ) : isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {ORDER.map((tipo) => {
              const items = grupos[tipo];
              if (!items.length) return null;
              const meta = SECTION_META[tipo];
              return (
                <section key={tipo}>
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {meta.icon}
                    {meta.label} <span className="text-xs">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((r) => (
                      <button
                        key={`${r.tipo}-${r.id}`}
                        onClick={() => navigate(r.rota)}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md text-left transition-all"
                      >
                        {r.imagem ? (
                          <img
                            src={getTransformedImageUrl(r.imagem)}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-muted"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{r.titulo || "Sem título"}</p>
                          {r.subtitulo && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.subtitulo}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            {(data || []).length === 0 && (
              <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
                <p className="text-muted-foreground">Nenhum resultado encontrado para "{debounced}"</p>
              </div>
            )}

            {/* Perguntar à Akasha */}
            <button
              onClick={() => navigate(`/akasha?pergunta=${encodeURIComponent(debounced)}`)}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-akasha/30 bg-akasha/5 hover:bg-akasha/10 text-akasha font-medium transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              Perguntar à Akasha: <span className="italic">"{debounced}"</span>
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Pesquisa;
