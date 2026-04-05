import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import SearchHeader, { type VideoCategory } from "@/components/biblioteca/SearchHeader";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import VideoPlayerDialog from "@/components/biblioteca/VideoPlayerDialog";
import AdvancedVideoCard from "@/components/biblioteca/AdvancedVideoCard";
import AdvancedVideoResult from "@/components/biblioteca/AdvancedVideoResult";
import { Skeleton } from "@/components/ui/skeleton";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const TABLE_MAP: Record<VideoCategory, "portal_oficial" | "portal_receitas" | "portal_lives"> = {
  selecao: "portal_oficial",
  receitas: "portal_receitas",
  lives: "portal_lives",
};

const ALL_TABLES = ["portal_oficial", "portal_receitas", "portal_lives"] as const;

const Biblioteca = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [category, setCategory] = useState<VideoCategory>("selecao");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedVideo, setSelectedVideo] = useState<{
    video_id: string;
    novo_titulo: string;
    nova_descricao: string;
    texto_para_embedding: string;
  } | null>(null);

  const [selectedAdvancedVideo, setSelectedAdvancedVideo] = useState<{
    video_id: string;
    novo_titulo: string;
    texto_para_embedding: string;
    initialSeconds: number;
  } | null>(null);

  useEffect(() => {
    setSelectedAdvancedVideo(null);
  }, [debouncedSearch]);

  // Common search — single table based on category
  const { data: videos, isLoading } = useQuery({
    queryKey: ["biblioteca-videos", debouncedSearch, category],
    queryFn: async () => {
      const table = TABLE_MAP[category];
      let query = supabase
        .from(table)
        .select("video_id, novo_titulo, mini_resumo, nova_descricao, tags, texto_para_embedding, criado_em")
        .order("criado_em", { ascending: false })
        .limit(20);

      if (debouncedSearch.trim()) {
        query = query.ilike("novo_titulo", `%${debouncedSearch.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !isAdvanced,
  });

  // Advanced search — all tables
  const { data: advancedResults, isLoading: isAdvancedLoading } = useQuery({
    queryKey: ["biblioteca-advanced", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return null;

      const results = await Promise.all(
        ALL_TABLES.map(async (table) => {
          const { data, error } = await supabase
            .from(table)
            .select("video_id, novo_titulo, texto_para_embedding, criado_em")
            .ilike("texto_para_embedding", `%${debouncedSearch.trim()}%`)
            .order("criado_em", { ascending: false })
            .limit(10);
          if (error) throw error;
          return data ?? [];
        })
      );

      const merged = results.flat();
      // Deduplicate by video_id
      const seen = new Set<string>();
      const unique = merged.filter((v) => {
        if (seen.has(v.video_id)) return false;
        seen.add(v.video_id);
        return true;
      });

      return unique.length > 0 ? unique : null;
    },
    enabled: isAdvanced && debouncedSearch.trim().length > 0,
  });

  const loading = isAdvanced ? isAdvancedLoading : isLoading;

  return (
    <PageContainer
      title="Biblioteca — Sommelier Ayurveda"
      description="Encontre vídeos sobre Ayurveda: busque por sintomas, doshas, alimentos e muito mais."
    >
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isAdvanced={isAdvanced}
        onAdvancedChange={setIsAdvanced}
        category={category}
        onCategoryChange={setCategory}
      />

      {loading ? (
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
      ) : isAdvanced ? (
        selectedAdvancedVideo ? (
          <AdvancedVideoResult
            videoId={selectedAdvancedVideo.video_id}
            title={selectedAdvancedVideo.novo_titulo}
            textoParaEmbedding={selectedAdvancedVideo.texto_para_embedding}
            initialSeconds={selectedAdvancedVideo.initialSeconds}
            searchTerm={debouncedSearch}
            onBack={() => setSelectedAdvancedVideo(null)}
          />
        ) : !debouncedSearch.trim() ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
              <p className="text-muted-foreground text-lg">
                🔍 Digite um termo para buscar no conteúdo de todos os vídeos.
              </p>
            </div>
          </div>
        ) : advancedResults && advancedResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedResults.map((v) => (
              <AdvancedVideoCard
                key={v.video_id}
                videoId={v.video_id}
                title={v.novo_titulo || "Sem título"}
                textoParaEmbedding={v.texto_para_embedding || ""}
                searchTerm={debouncedSearch}
                onClick={(initialSeconds) =>
                  setSelectedAdvancedVideo({
                    video_id: v.video_id,
                    novo_titulo: v.novo_titulo || "Sem título",
                    texto_para_embedding: v.texto_para_embedding || "",
                    initialSeconds,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
              <p className="text-muted-foreground text-lg">
                🔍 Nenhum vídeo encontrado para essa busca avançada.
              </p>
            </div>
          </div>
        )
      ) : (
        videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <VideoResultCard
                key={v.video_id}
                videoId={v.video_id}
                title={v.novo_titulo || "Sem título"}
                summary={v.mini_resumo || ""}
                tags={v.tags}
                onClick={() =>
                  setSelectedVideo({
                    video_id: v.video_id,
                    novo_titulo: v.novo_titulo || "Sem título",
                    nova_descricao: v.nova_descricao || "",
                    texto_para_embedding: v.texto_para_embedding || "",
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
              <p className="text-muted-foreground text-lg">
                {debouncedSearch ? "🔍 Nenhum vídeo encontrado para essa busca." : "📚 Nenhum vídeo disponível ainda."}
              </p>
            </div>
          </div>
        )
      )}

      <VideoPlayerDialog
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
        videoId={selectedVideo?.video_id ?? null}
        title={selectedVideo?.novo_titulo ?? ""}
        description={selectedVideo?.nova_descricao ?? ""}
        textoParaEmbedding={selectedVideo?.texto_para_embedding}
      />
    </PageContainer>
  );
};

export default Biblioteca;
