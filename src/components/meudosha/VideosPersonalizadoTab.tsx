import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/slugify";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface VideosPersonalizadoTabProps {
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  doshaprincipal: string | null;
}

interface MatchedVideo {
  video_id: string;
  novo_titulo: string | null;
  nova_descricao: string | null;
  mini_resumo: string | null;
  tags: string | null;
  texto_para_embedding: string | null;
  matchedSymptom: string;
  matchedDosha: string;
  matchType: "titulo" | "timestamp";
  timestampSeconds?: number;
  timestampLabel?: string;
}

function parseTimestampEntries(text: string) {
  const regex = /((\d{1,2}:)?\d{1,2}:\d{2})\s*[-–]\s*(.+)/g;
  const entries: { timestamp: string; seconds: number; label: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split(":").map(Number);
    const seconds = parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1];
    entries.push({ timestamp: match[1], seconds, label: match[3].trim() });
  }
  return entries;
}

function parseSymptoms(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map(t => t.trim()).filter(Boolean);
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

const TABLES = ["portal_lives", "portal_oficial", "portal_receitas"] as const;

const VideosPersonalizadoTab = ({
  agravVataTags,
  agravPittaTags,
  agravKaphaTags,
  doshaprincipal,
}: VideosPersonalizadoTabProps) => {
  const navigate = useNavigate();

  const allSymptoms: { symptom: string; dosha: string }[] = [
    ...parseSymptoms(agravVataTags).map(s => ({ symptom: s, dosha: "Vata" })),
    ...parseSymptoms(agravPittaTags).map(s => ({ symptom: s, dosha: "Pitta" })),
    ...parseSymptoms(agravKaphaTags).map(s => ({ symptom: s, dosha: "Kapha" })),
  ];

  const { data: matchedVideos, isLoading } = useQuery({
    queryKey: ["meudosha-videos-personalizado", agravVataTags, agravPittaTags, agravKaphaTags],
    queryFn: async () => {
      if (allSymptoms.length === 0) return [];

      // Fetch all videos from the 3 tables
      const allVideos: any[] = [];
      for (const table of TABLES) {
        const { data, error } = await supabase
          .from(table)
          .select("video_id, novo_titulo, nova_descricao, mini_resumo, tags, texto_para_embedding")
          .limit(200);
        if (!error && data) allVideos.push(...data);
      }

      // Match videos against symptoms
      const matches: MatchedVideo[] = [];
      const seenVideoIds = new Set<string>();

      for (const { symptom, dosha } of allSymptoms) {
        const normalizedSymptom = normalizeForSearch(symptom);
        const symptomWords = normalizedSymptom.split(/\s+/).filter(w => w.length > 2);

        for (const video of allVideos) {
          if (seenVideoIds.has(video.video_id)) continue;

          // Priority 1: Match in title
          const normalizedTitle = normalizeForSearch(video.novo_titulo || "");
          const titleMatch = symptomWords.some(w => normalizedTitle.includes(w));

          if (titleMatch) {
            seenVideoIds.add(video.video_id);
            matches.push({
              ...video,
              matchedSymptom: symptom,
              matchedDosha: dosha,
              matchType: "titulo",
            });
            continue;
          }

          // Priority 2: Match in timestamps/description
          const descText = video.texto_para_embedding || video.nova_descricao || "";
          const timestamps = parseTimestampEntries(descText);

          for (const ts of timestamps) {
            const normalizedLabel = normalizeForSearch(ts.label);
            const tsMatch = symptomWords.some(w => normalizedLabel.includes(w));
            if (tsMatch) {
              seenVideoIds.add(video.video_id);
              matches.push({
                ...video,
                matchedSymptom: symptom,
                matchedDosha: dosha,
                matchType: "timestamp",
                timestampSeconds: ts.seconds,
                timestampLabel: ts.label,
              });
              break;
            }
          }
        }
      }

      return matches.slice(0, 9);
    },
    enabled: allSymptoms.length > 0,
  });

  if (allSymptoms.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
        <p className="text-muted-foreground">Nenhum agravamento registrado para personalizar vídeos.</p>
      </div>
    );
  }

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

  if (!matchedVideos || matchedVideos.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
        <p className="text-muted-foreground">Não encontramos vídeos específicos para seus agravamentos ainda. Tente a aba Gerais.</p>
      </div>
    );
  }

  function highlightSymptom(text: string, symptom: string): JSX.Element {
    const normalizedText = text.toLowerCase();
    const normalizedSymptom = symptom.toLowerCase();
    const idx = normalizedText.indexOf(normalizedSymptom);
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="text-primary font-bold">{text.slice(idx, idx + symptom.length)}</strong>
        {text.slice(idx + symptom.length)}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {matchedVideos.map((video) => {
        const doshaColor = video.matchedDosha === "Vata" ? "text-vata" : video.matchedDosha === "Pitta" ? "text-pitta" : "text-kapha";

        const handleClick = () => {
          const slug = slugify(video.novo_titulo || "video");
          const state: any = { videoId: video.video_id };
          if (video.matchType === "timestamp" && video.timestampSeconds) {
            navigate(`/video/${slug}?t=${video.timestampSeconds}`, { state });
          } else {
            navigate(`/video/${slug}`, { state });
          }
        };

        return (
          <div key={video.video_id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Context label */}
            <div className="px-4 py-2 bg-akasha/10 border-b border-border flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-akasha shrink-0" />
              <p className="text-xs text-foreground">
                Como você relatou <strong className={doshaColor}>{video.matchedSymptom}</strong> e possui agravamento em <strong className={doshaColor}>{video.matchedDosha}</strong>, selecionamos este vídeo:
              </p>
            </div>

            <button
              onClick={handleClick}
              className="w-full text-left flex flex-col sm:flex-row gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <img
                src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                alt={video.novo_titulo || "Vídeo"}
                className="w-full sm:w-48 aspect-video object-cover rounded-lg shrink-0"
                loading="lazy"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-base font-semibold text-primary line-clamp-2">
                  {video.novo_titulo || "Sem título"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {video.mini_resumo
                    ? highlightSymptom(video.mini_resumo, video.matchedSymptom)
                    : ""}
                </p>
                {video.matchType === "timestamp" && video.timestampLabel && (
                  <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
                    ⏱ {video.timestampLabel}
                  </Badge>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default VideosPersonalizadoTab;
