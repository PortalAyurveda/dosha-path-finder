import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "@/components/PaginationControls";

interface VideosGeneralTabProps {
  doshaprincipal: string | null;
}

const TABLE_MAP: Record<string, "portal_vata" | "portal_pitta" | "portal_kapha"> = {
  Vata: "portal_vata",
  Pitta: "portal_pitta",
  Kapha: "portal_kapha",
};

const ITEMS_PER_PAGE = 12;

function parseDoshas(doshaprincipal: string | null): string[] {
  if (!doshaprincipal) return ["Vata"];
  return doshaprincipal.split("-").map(d => d.trim()).filter(d => TABLE_MAP[d]);
}

const VideosGeneralTab = ({ doshaprincipal }: VideosGeneralTabProps) => {
  const doshas = parseDoshas(doshaprincipal);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [doshaprincipal]);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["meudosha-videos-general", doshaprincipal],
    queryFn: async () => {
      const results: any[] = [];
      // Fetch a larger pool so we can paginate
      const perDosha = Math.ceil(60 / Math.max(doshas.length, 1));
      for (const dosha of doshas) {
        const table = TABLE_MAP[dosha];
        if (!table) continue;
        const { data, error } = await supabase
          .from(table)
          .select("video_id, novo_titulo, mini_resumo, tags")
          .order("criado_em", { ascending: false })
          .limit(perDosha);
        if (!error && data) results.push(...data);
      }
      return results;
    },
    enabled: !!doshaprincipal,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
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

  const totalPages = Math.max(1, Math.ceil(videos.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = videos.slice(start, start + ITEMS_PER_PAGE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((v: any) => (
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
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
};

export default VideosGeneralTab;
