import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import SearchHeader, { type VideoCategory } from "@/components/biblioteca/SearchHeader";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "@/components/PaginationControls";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { searchAll } from "@/components/GlobalSearch";

const PAGE_SIZE = 12;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const Biblioteca = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<VideoCategory>("todos");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const term = debouncedSearch.trim();
  const isSearching = term.length >= 2;

  // Modo BUSCA — via RPC busca_global
  const searchQuery = useQuery({
    queryKey: ["biblioteca-busca", term],
    queryFn: () => searchAll(term, 12),
    enabled: isSearching,
    staleTime: 60_000,
  });

  // Modo NAVEGAÇÃO — sem termo
  const browseQuery = useQuery({
    queryKey: ["biblioteca-browse", category, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      if (category === "artigos") {
        const { data, error, count } = await (supabase.from as any)("portal_conteudo")
          .select("id, title, meta_description, image_url, link_do_artigo", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) throw error;
        return { kind: "artigos" as const, rows: (data || []) as any[], count: count ?? 0 };
      }

      let q = (supabase.from as any)("videos_canonicos")
        .select("video_id, slug, novo_titulo, mini_resumo, tags, criado_em, is_oficial, is_live, is_receita", { count: "exact" })
        .order("criado_em", { ascending: false });

      if (category === "aulas") q = q.eq("is_oficial", true);
      else if (category === "lives") q = q.eq("is_live", true);
      else if (category === "receitas") q = q.eq("is_receita", true);

      const { data, error, count } = await q.range(from, to);
      if (error) throw error;
      return { kind: "videos" as const, rows: (data || []) as any[], count: count ?? 0 };
    },
    enabled: !isSearching,
  });

  const totalPages = Math.max(1, Math.ceil((browseQuery.data?.count ?? 0) / PAGE_SIZE));

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtro de tipo nas buscas
  const filterSearchByCategory = () => {
    const d = searchQuery.data;
    if (!d) return { videos: [], receitas: [], artigos: [], produtos: [] };
    if (category === "todos") return d;
    if (category === "aulas" || category === "lives") return { ...d, receitas: [], artigos: [] };
    if (category === "receitas") return { videos: [], receitas: d.receitas, artigos: [], produtos: d.produtos };
    if (category === "artigos") return { videos: [], receitas: [], artigos: d.artigos, produtos: d.produtos };
    return d;
  };
  const filtered = filterSearchByCategory();

  return (
    <>
      <Seo
        title="Biblioteca do Portal Ayurveda — Aulas, Lives, Receitas e Artigos"
        description="Todo o acervo do Portal Ayurveda em um só lugar: aulas, lives, receitas e artigos organizados por dosha e tema."
      />
      <DoshaSelector />
      <PageContainer
        title="Biblioteca — Sommelier do Portal"
        description="Encontre o conteúdo certo: aulas, lives, receitas e artigos."
      >
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={category}
          onCategoryChange={setCategory}
        />

        <BannerSlot slot="biblioteca" className="my-4 [&:empty]:hidden" />

        {isSearching ? (
          searchQuery.isLoading ? (
            <SkeletonGrid />
          ) : (
            <SearchResults data={filtered} term={term} />
          )
        ) : browseQuery.isLoading ? (
          <SkeletonGrid />
        ) : browseQuery.data && browseQuery.data.rows.length > 0 ? (
          <>
            {browseQuery.data.kind === "videos" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {browseQuery.data.rows.map((v) => (
                  <VideoResultCard
                    key={v.video_id}
                    videoId={v.video_id}
                    title={v.novo_titulo || "Sem título"}
                    summary={v.mini_resumo || ""}
                    tags={v.tags}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {browseQuery.data.rows.map((a) => (
                  <ArtigoCard
                    key={a.id}
                    title={a.title}
                    summary={a.meta_description}
                    imageUrl={a.image_url}
                    slug={a.link_do_artigo || a.id}
                  />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <PaginationControls page={page} totalPages={totalPages} onPageChange={goToPage} />
            )}
          </>
        ) : (
          <EmptyState hasSearch={false} />
        )}

        <section className="mt-12 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-surface-sun p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3">
            Terapeutas do Brasil
          </h2>
          <p className="font-sans text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            Profissionais de Ayurveda cadastrados no Portal, de várias regiões do país.
          </p>
          <Link
            to="/terapeutas-do-brasil"
            className="inline-flex items-center justify-center bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-6 py-3 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-md hover:shadow-lg transition-all"
          >
            Ver terapeutas
          </Link>
        </section>
      </PageContainer>
    </>
  );
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden border border-border">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <div className="flex items-center justify-center min-h-[30vh]">
    <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
      <p className="text-muted-foreground text-lg">
        {hasSearch ? "🔍 Nenhum resultado encontrado." : "📚 Nenhum conteúdo disponível ainda."}
      </p>
    </div>
  </div>
);

type SearchData = Awaited<ReturnType<typeof searchAll>>;

const SearchResults = ({ data, term }: { data: SearchData; term: string }) => {
  const total =
    data.videos.length + data.receitas.length + data.artigos.length + data.produtos.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground text-lg">🔍 Nenhum resultado para "{term}".</p>
        </div>
      </div>
    );
  }

  const videos = [...data.videos, ...data.receitas];

  return (
    <div className="space-y-10">
      {videos.length > 0 && (
        <section>
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-4">
            Vídeos e receitas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((r) => (
              <ResultLinkCard key={`${r.tipo}-${r.id}`} r={r} />
            ))}
          </div>
        </section>
      )}

      {data.artigos.length > 0 && (
        <section>
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-4">
            Artigos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.artigos.map((r) => (
              <ResultLinkCard key={`a-${r.id}`} r={r} />
            ))}
          </div>
        </section>
      )}

      {data.produtos.length > 0 && (
        <section className="pt-6 border-t border-border">
          <h2 className="font-serif text-lg font-semibold text-primary mb-3">
            Da loja Samkhya
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.produtos.map((r) => (
              <CompactProductCard key={`p-${r.id}`} r={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const ResultLinkCard = ({ r }: { r: any }) => (
  <Link
    to={r.rota}
    className="group block rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
  >
    <div className="aspect-video w-full overflow-hidden bg-muted">
      {r.imagem ? (
        <img
          src={getTransformedImageUrl(r.imagem)}
          alt={r.titulo || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : null}
    </div>
    <div className="p-4">
      <h3 className="font-serif text-base md:text-lg font-semibold text-primary line-clamp-2 mb-1">
        {r.titulo || "Sem título"}
      </h3>
      {r.subtitulo && (
        <p className="font-sans text-sm text-muted-foreground line-clamp-2">{r.subtitulo}</p>
      )}
    </div>
  </Link>
);

const CompactProductCard = ({ r }: { r: any }) => (
  <Link
    to={r.rota}
    className="group block rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
  >
    <div className="aspect-square w-full overflow-hidden bg-muted">
      {r.imagem ? (
        <img
          src={getTransformedImageUrl(r.imagem)}
          alt={r.titulo || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      ) : null}
    </div>
    <div className="p-3">
      <p className="text-sm font-medium text-foreground line-clamp-2">{r.titulo}</p>
    </div>
  </Link>
);

const ArtigoCard = ({
  title,
  summary,
  imageUrl,
  slug,
}: {
  title: string;
  summary: string | null;
  imageUrl: string | null;
  slug: string;
}) => (
  <Link
    to={`/blog/${slug}`}
    className="group block rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
  >
    <div className="aspect-video w-full overflow-hidden bg-muted">
      {imageUrl ? (
        <img
          src={getTransformedImageUrl(imageUrl)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : null}
    </div>
    <div className="p-4">
      <h3 className="font-serif text-base md:text-lg font-semibold text-primary line-clamp-2 mb-2">
        {title}
      </h3>
      {summary && (
        <p className="font-sans text-sm text-muted-foreground line-clamp-2">{summary}</p>
      )}
    </div>
  </Link>
);

export default Biblioteca;
