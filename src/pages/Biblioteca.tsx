import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";
import PageContainer from "@/components/PageContainer";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import SearchHeader, { type VideoCategory } from "@/components/biblioteca/SearchHeader";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "@/components/PaginationControls";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<VideoCategory>("todos");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const { data, isLoading } = useQuery({
    queryKey: ["biblioteca-canonicos", debouncedSearch, category, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let q = (supabase.from as any)("videos_canonicos")
        .select("video_id, slug, novo_titulo, mini_resumo, tags, criado_em, is_oficial, is_live, is_receita", { count: "exact" })
        .order("criado_em", { ascending: false });

      if (category === "aulas") q = q.eq("is_oficial", true);
      else if (category === "lives") q = q.eq("is_live", true);
      else if (category === "receitas") q = q.eq("is_receita", true);

      const term = debouncedSearch.trim();
      if (term) {
        q = q.or(`novo_titulo.ilike.%${term}%,tags.ilike.%${term}%`);
      }

      const { data, error, count } = await q.range(from, to);
      if (error) throw error;
      return { rows: (data || []) as any[], count: count ?? 0 };
    },
  });

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
  const rows = data?.rows ?? [];

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Seo
        title="Biblioteca de Vídeos Ayurvédicos — Vata, Pitta e Kapha"
        description="Centenas de vídeos sobre Ayurveda organizados por dosha e por tema: alimentação, rotinas, remédios e práticas avançadas."
      />
      <DoshaSelector />
      <PageContainer
        title="Biblioteca — Sommelier Ayurveda"
        description="Encontre vídeos sobre Ayurveda: busque por sintomas, doshas, alimentos e muito mais."
      >
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={category}
          onCategoryChange={setCategory}
        />

        <BannerSlot slot="biblioteca" className="my-4 [&:empty]:hidden" />

        {isLoading ? (
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
        ) : rows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((v) => (
                <VideoResultCard
                  key={v.video_id}
                  videoId={v.video_id}
                  title={v.novo_titulo || "Sem título"}
                  summary={v.mini_resumo || ""}
                  tags={v.tags}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationControls page={page} totalPages={totalPages} onPageChange={goToPage} />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
              <p className="text-muted-foreground text-lg">
                {debouncedSearch ? "🔍 Nenhum vídeo encontrado para essa busca." : "📚 Nenhum vídeo disponível ainda."}
              </p>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
};

export default Biblioteca;
