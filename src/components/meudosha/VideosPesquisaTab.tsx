import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import VideoResultCard from "@/components/biblioteca/VideoResultCard";
import { useViewedContent } from "@/hooks/useViewedContent";
import { slugify } from "@/lib/slugify";

interface VideosPesquisaTabProps {
  doshaprincipal: string | null;
}

const TABLE_MAP: Record<string, "portal_vata" | "portal_pitta" | "portal_kapha"> = {
  Vata: "portal_vata",
  Pitta: "portal_pitta",
  Kapha: "portal_kapha",
};

function parseDoshas(d: string | null): string[] {
  if (!d) return ["Vata", "Pitta", "Kapha"];
  const list = d.split("-").map(s => s.trim()).filter(s => TABLE_MAP[s]);
  return list.length > 0 ? list : ["Vata", "Pitta", "Kapha"];
}

const VideosPesquisaTab = ({ doshaprincipal }: VideosPesquisaTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const navigate = useNavigate();
  const { markAsViewed } = useViewedContent("video");

  const doshas = parseDoshas(doshaprincipal);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["meudosha-videos-pesquisa", doshas.join(","), debounced, isAdvanced],
    queryFn: async () => {
      if (!debounced) return [];
      const all: any[] = [];
      for (const dosha of doshas) {
        const table = TABLE_MAP[dosha];
        if (!table) continue;
        let q = supabase
          .from(table)
          .select("video_id, novo_titulo, mini_resumo, tags")
          .limit(50);
        if (isAdvanced) {
          q = q.or(
            `novo_titulo.ilike.%${debounced}%,mini_resumo.ilike.%${debounced}%,tags.ilike.%${debounced}%,texto_para_embedding.ilike.%${debounced}%`
          );
        } else {
          q = q.ilike("novo_titulo", `%${debounced}%`);
        }
        const { data, error } = await q;
        if (!error && data) all.push(...data);
      }
      // Dedupe by video_id
      const seen = new Set<string>();
      return all.filter(v => (seen.has(v.video_id) ? false : (seen.add(v.video_id), true)));
    },
    enabled: debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={isAdvanced ? "Busca em título, resumo, tags..." : "Buscar por título do vídeo..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Switch id="videos-advanced" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
          <Label htmlFor="videos-advanced" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Busca Avançada
          </Label>
        </div>
      </div>

      {!debounced ? (
        <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground">Digite algo para buscar vídeos do seu dosha.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground">Nenhum vídeo encontrado para "{debounced}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((v: any) => (
            <VideoResultCard
              key={v.video_id}
              videoId={v.video_id}
              title={v.novo_titulo || "Sem título"}
              summary={v.mini_resumo || ""}
              tags={v.tags}
              onClick={() => {
                markAsViewed(v.video_id);
                navigate(`/video/${slugify(v.novo_titulo || "video")}`, { state: { videoId: v.video_id } });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosPesquisaTab;
