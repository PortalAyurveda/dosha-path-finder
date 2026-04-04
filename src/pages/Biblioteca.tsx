import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import SearchHeader from "@/components/biblioteca/SearchHeader";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import VideoPlayerDialog from "@/components/biblioteca/VideoPlayerDialog";
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

const Biblioteca = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedVideo, setSelectedVideo] = useState<{
    video_id: string;
    novo_titulo: string;
    nova_descricao: string;
  } | null>(null);

  // Common search
  const { data: videos, isLoading } = useQuery({
    queryKey: ["biblioteca-videos", debouncedSearch, isAdvanced],
    queryFn: async () => {
      if (isAdvanced) return null; // skip for advanced mode

      let query = supabase
        .from("videos_seo2")
        .select("video_id, novo_titulo, mini_resumo, nova_descricao, tags, criado_em")
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

  // Advanced search
  const { data: advancedResult, isLoading: isAdvancedLoading } = useQuery({
    queryKey: ["biblioteca-advanced", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return null;

      const { data, error } = await supabase
        .from("videos_seo2")
        .select("video_id, novo_titulo, texto_para_embedding, criado_em")
        .ilike("texto_para_embedding", `%${debouncedSearch.trim()}%`)
        .order("criado_em", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
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
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: isAdvanced ? 1 : 6 }).map((_, i) => (
            <div key={i} className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isAdvanced ? (
        // Advanced mode
        !debouncedSearch.trim() ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
              <p className="text-muted-foreground text-lg">
                🔍 Digite um termo para buscar no conteúdo dos vídeos.
              </p>
            </div>
          </div>
        ) : advancedResult ? (
          <AdvancedVideoResult
            videoId={advancedResult.video_id}
            title={advancedResult.novo_titulo || "Sem título"}
            textoParaEmbedding={advancedResult.texto_para_embedding || ""}
          />
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
        // Common mode
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
      />
    </PageContainer>
  );
};

export default Biblioteca;
