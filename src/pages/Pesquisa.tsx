import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, Video as VideoIcon, FileText, UtensilsCrossed, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/PageContainer";
import Seo from "@/components/Seo";
import { slugify } from "@/lib/slugify";
import { getTransformedImageUrl } from "@/lib/imageTransform";

const VIDEO_TABLES = ["portal_vata", "portal_pitta", "portal_kapha"] as const;
const LIMIT = 50;

type TabKey = "produtos" | "videos" | "artigos" | "receitas";

const Pesquisa = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = params.get("q") || "";
  const [term, setTerm] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  const [tab, setTab] = useState<TabKey>("produtos");

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
      const t = debounced;
      if (t.length < 2) return { produtos: [], videos: [], artigos: [] };
      const [prod, art, ...vids] = await Promise.all([
        lojaSupabase
          .from("produtos")
          .select("slug, nome_display, imagem_url, resumo_curto, preco_normal, preco_pix")
          .ilike("nome_display", `%${t}%`)
          .eq("ativo", true)
          .limit(LIMIT),
        supabase
          .from("portal_conteudo")
          .select("id, title, link_do_artigo, image_url, meta_description")
          .ilike("title", `%${t}%`)
          .limit(LIMIT),
        ...VIDEO_TABLES.map((tb) =>
          supabase
            .from(tb)
            .select("video_id, novo_titulo, mini_resumo")
            .ilike("novo_titulo", `%${t}%`)
            .limit(LIMIT)
        ),
      ]);
      const seen = new Set<string>();
      const videos = vids
        .flatMap((r: any) => r.data || [])
        .filter((v: any) => (seen.has(v.video_id) ? false : (seen.add(v.video_id), true)));
      return {
        produtos: (prod.data || []) as any[],
        videos,
        artigos: (art.data || []) as any[],
      };
    },
    enabled: debounced.length >= 2,
  });

  const counts = {
    produtos: data?.produtos.length || 0,
    videos: data?.videos.length || 0,
    artigos: data?.artigos.length || 0,
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number; locked?: boolean }[] = [
    { key: "produtos", label: "Produtos", icon: <Package className="h-4 w-4" />, count: counts.produtos },
    { key: "videos", label: "Vídeos", icon: <VideoIcon className="h-4 w-4" />, count: counts.videos },
    { key: "artigos", label: "Artigos", icon: <FileText className="h-4 w-4" />, count: counts.artigos },
    { key: "receitas", label: "Receitas", icon: <UtensilsCrossed className="h-4 w-4" />, locked: true },
  ];

  return (
    <PageContainer title={`Pesquisa${debounced ? `: ${debounced}` : ""}`} description="Pesquise produtos, vídeos e artigos.">
      <Seo title={`Pesquisa: ${debounced || ""}`} description="Pesquise produtos, vídeos e artigos." />
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">Pesquisa</h1>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por produtos, vídeos ou artigos..."
            className="pl-12 h-12 text-base"
          />
        </div>

        <div className="flex gap-2 border-b border-border mb-4 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
              {!t.locked && typeof t.count === "number" && (
                <span className="text-xs text-muted-foreground">({t.count})</span>
              )}
              {t.locked && <Lock className="h-3 w-3" />}
            </button>
          ))}
        </div>

        {debounced.length < 2 ? (
          <p className="text-center text-muted-foreground py-12">Digite ao menos 2 caracteres para buscar.</p>
        ) : isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : tab === "receitas" ? (
          <div className="text-center py-16 rounded-2xl bg-surface-sun border border-border">
            <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Em breve</p>
            <p className="text-sm text-muted-foreground mt-1">Busca de receitas em breve.</p>
          </div>
        ) : tab === "produtos" ? (
          counts.produtos === 0 ? (
            <Empty term={debounced} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data!.produtos.map((p: any) => {
                const preco = p.preco_pix ?? p.preco_normal;
                return (
                  <button
                    key={p.slug}
                    onClick={() => navigate(`/samkhya/produto/${p.slug}`)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md text-left transition-all"
                  >
                    {p.imagem_url ? (
                      <img src={getTransformedImageUrl(p.imagem_url)} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{p.nome_display}</p>
                      {p.resumo_curto && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.resumo_curto}</p>
                      )}
                      {preco != null && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          {Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : tab === "videos" ? (
          counts.videos === 0 ? (
            <Empty term={debounced} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data!.videos.map((v: any) => (
                <button
                  key={v.video_id}
                  onClick={() =>
                    navigate(`/video/${slugify(v.novo_titulo || "video")}`, { state: { videoId: v.video_id } })
                  }
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md text-left transition-all"
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fb) {
                        img.dataset.fb = "1";
                        img.src = `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`;
                      }
                    }}
                    alt=""
                    className="w-24 h-16 rounded-lg object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{v.novo_titulo}</p>
                    {v.mini_resumo && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{v.mini_resumo}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        ) : counts.artigos === 0 ? (
          <Empty term={debounced} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data!.artigos.map((a: any) => (
              <button
                key={a.id}
                onClick={() => navigate(`/blog/${a.link_do_artigo || a.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md text-left transition-all"
              >
                {a.image_url ? (
                  <img src={getTransformedImageUrl(a.image_url)} alt="" className="w-20 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-16 rounded-lg bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{a.title}</p>
                  {a.meta_description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.meta_description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

const Empty = ({ term }: { term: string }) => (
  <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
    <p className="text-muted-foreground">Nenhum resultado encontrado para "{term}"</p>
  </div>
);

export default Pesquisa;
