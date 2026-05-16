import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, Video as VideoIcon, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/slugify";
import { getTransformedImageUrl } from "@/lib/imageTransform";

const VIDEO_TABLES = ["portal_vata", "portal_pitta", "portal_kapha"] as const;

export async function searchAll(termo: string, limitPer = 3) {
  const term = termo.trim();
  if (term.length < 2) return { produtos: [], videos: [], artigos: [] };

  const [prodRes, artRes, ...vidRes] = await Promise.all([
    lojaSupabase
      .from("produtos")
      .select("slug, nome_display, imagem_url")
      .ilike("nome_display", `%${term}%`)
      .eq("ativo", true)
      .limit(limitPer),
    supabase
      .from("portal_conteudo")
      .select("id, title, link_do_artigo, image_url, meta_description")
      .ilike("title", `%${term}%`)
      .limit(limitPer),
    ...VIDEO_TABLES.map((t) =>
      supabase
        .from(t)
        .select("video_id, novo_titulo, mini_resumo")
        .ilike("novo_titulo", `%${term}%`)
        .limit(limitPer)
    ),
  ]);

  const seen = new Set<string>();
  const videos = vidRes
    .flatMap((r: any) => r.data || [])
    .filter((v: any) => (seen.has(v.video_id) ? false : (seen.add(v.video_id), true)))
    .slice(0, limitPer);

  return {
    produtos: (prodRes.data || []) as any[],
    videos: videos as any[],
    artigos: (artRes.data || []) as any[],
  };
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => searchAll(debounced, 3),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const close = () => {
    setOpen(false);
    setTerm("");
    setDebounced("");
  };

  const goAll = () => {
    if (!debounced) return;
    navigate(`/pesquisa?q=${encodeURIComponent(debounced)}`);
    close();
  };

  const totalResults =
    (data?.produtos.length || 0) + (data?.videos.length || 0) + (data?.artigos.length || 0);

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Pesquisar"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm"
        >
          <Search className="h-[18px] w-[18px] text-primary" strokeWidth={2.2} />
        </button>
      ) : (
        <div className="flex items-center bg-white rounded-full h-9 pl-3 pr-1 shadow-sm w-[200px] sm:w-[260px]">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goAll();
              if (e.key === "Escape") close();
            }}
            placeholder="Buscar..."
            className="border-0 shadow-none focus-visible:ring-0 h-7 px-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {open && debounced.length >= 2 && (
        <div className="absolute right-0 mt-2 w-[92vw] max-w-[420px] bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : totalResults === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{debounced}"
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {data!.produtos.length > 0 && (
                <Section title="Produtos" icon={<Package className="h-3.5 w-3.5" />}>
                  {data!.produtos.map((p: any) => (
                    <ResultItem
                      key={p.slug}
                      title={p.nome_display}
                      image={p.imagem_url}
                      onClick={() => {
                        navigate(`/samkhya/produto/${p.slug}`);
                        close();
                      }}
                    />
                  ))}
                </Section>
              )}
              {data!.videos.length > 0 && (
                <Section title="Vídeos" icon={<VideoIcon className="h-3.5 w-3.5" />}>
                  {data!.videos.map((v: any) => (
                    <ResultItem
                      key={v.video_id}
                      title={v.novo_titulo || "Sem título"}
                      subtitle={v.mini_resumo}
                      onClick={() => {
                        navigate(`/video/${slugify(v.novo_titulo || "video")}`, {
                          state: { videoId: v.video_id },
                        });
                        close();
                      }}
                    />
                  ))}
                </Section>
              )}
              {data!.artigos.length > 0 && (
                <Section title="Artigos" icon={<FileText className="h-3.5 w-3.5" />}>
                  {data!.artigos.map((a: any) => (
                    <ResultItem
                      key={a.id}
                      title={a.title}
                      subtitle={a.meta_description}
                      image={a.image_url}
                      onClick={() => {
                        navigate(`/blog/${a.link_do_artigo || a.id}`);
                        close();
                      }}
                    />
                  ))}
                </Section>
              )}
              <button
                onClick={goAll}
                className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-muted/50 border-t border-border"
              >
                Ver todos os resultados
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="border-b border-border last:border-b-0">
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </div>
    <div>{children}</div>
  </div>
);

const ResultItem = ({
  title,
  subtitle,
  image,
  onClick,
}: {
  title: string;
  subtitle?: string | null;
  image?: string | null;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
  >
    {image ? (
      <img
        src={getTransformedImageUrl(image)}
        alt=""
        className="w-10 h-10 rounded-md object-cover shrink-0 bg-muted"
        loading="lazy"
      />
    ) : (
      <div className="w-10 h-10 rounded-md bg-muted shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground line-clamp-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
      )}
    </div>
  </button>
);

export default GlobalSearch;
