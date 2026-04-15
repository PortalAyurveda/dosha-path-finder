import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/slugify";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideosGeneralTabProps {
  doshaprincipal: string | null;
}

const TABLE_MAP: Record<string, "portal_vata" | "portal_pitta" | "portal_kapha"> = {
  Vata: "portal_vata",
  Pitta: "portal_pitta",
  Kapha: "portal_kapha",
};

function parseDoshas(doshaprincipal: string | null): string[] {
  if (!doshaprincipal) return ["Vata"];
  return doshaprincipal.split("-").map(d => d.trim()).filter(d => TABLE_MAP[d]);
}

const VideosGeneralTab = ({ doshaprincipal }: VideosGeneralTabProps) => {
  const doshas = parseDoshas(doshaprincipal);
  const videosPerDosha = doshas.length > 1 ? 3 : 3;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["meudosha-videos-general", doshaprincipal],
    queryFn: async () => {
      const results: any[] = [];
      for (const dosha of doshas) {
        const table = TABLE_MAP[dosha];
        if (!table) continue;
        const { data, error } = await supabase
          .from(table)
          .select("video_id, novo_titulo, mini_resumo, tags")
          .order("criado_em", { ascending: false })
          .limit(videosPerDosha);
        if (!error && data) results.push(...data);
      }
      return results;
    },
    enabled: !!doshaprincipal,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
        <p className="text-muted-foreground">📺 Nenhum vídeo disponível para {doshaprincipal}.</p>
      </div>
    );
  }

  // Mobile: grid cards
  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {videos.map((v: any) => (
          <VideoResultCard
            key={v.video_id}
            videoId={v.video_id}
            title={v.novo_titulo || "Sem título"}
            summary={v.mini_resumo || ""}
            tags={v.tags}
          />
        ))}
      </div>
    );
  }

  // Desktop: horizontal layout with description (like personalized tab)
  return (
    <div className="space-y-4">
      {videos.map((v: any) => {
        const handleClick = () => {
          const slug = slugify(v.novo_titulo || "video");
          navigate(`/video/${slug}`, { state: { videoId: v.video_id } });
        };

        return (
          <div key={v.video_id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={handleClick}
              className="w-full text-left flex flex-row gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <img
                src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`}
                alt={v.novo_titulo || "Vídeo"}
                className="w-48 aspect-video object-cover rounded-lg shrink-0"
                loading="lazy"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-base font-semibold text-primary line-clamp-2">
                  {v.novo_titulo || "Sem título"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {v.mini_resumo || ""}
                </p>
                {v.tags && (
                  <p className="text-xs text-muted-foreground/70 line-clamp-1">
                    {v.tags}
                  </p>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default VideosGeneralTab;
