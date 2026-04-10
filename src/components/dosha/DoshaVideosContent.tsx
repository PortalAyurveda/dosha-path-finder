import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { Skeleton } from "@/components/ui/skeleton";

const TABLE_MAP = {
  vata: "portal_vata",
  pitta: "portal_pitta",
  kapha: "portal_kapha",
} as const;

interface DoshaVideosContentProps {
  dosha: "vata" | "pitta" | "kapha";
}

const DoshaVideosContent = ({ dosha }: DoshaVideosContentProps) => {
  const table = TABLE_MAP[dosha];

  const { data: videos, isLoading } = useQuery({
    queryKey: ["dosha-videos", dosha],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("video_id, novo_titulo, mini_resumo, nova_descricao, tags, texto_para_embedding, criado_em")
        .order("criado_em", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const doshaLabels = { vata: "Vata", pitta: "Pitta", kapha: "Kapha" };

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
          📺 Vídeos sobre {doshaLabels[dosha]}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Aulas, explicações e aprofundamentos sobre o dosha {doshaLabels[dosha]}.
        </p>
      </div>

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
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
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
        <div className="flex items-center justify-center min-h-[20vh]">
          <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
            <p className="text-muted-foreground">📚 Nenhum vídeo disponível ainda para {doshaLabels[dosha]}.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default DoshaVideosContent;
