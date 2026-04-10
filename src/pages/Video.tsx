import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Play } from "lucide-react";

const ALL_TABLES = ["portal_oficial", "portal_receitas", "portal_lives", "portal_vata", "portal_pitta", "portal_kapha"] as const;

function parseTimestamps(text: string) {
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

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

const Video = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [startSeconds, setStartSeconds] = useState<number | null>(null);

  const { data: video, isLoading } = useQuery({
    queryKey: ["video-page", videoId],
    queryFn: async () => {
      for (const table of ALL_TABLES) {
        const { data, error } = await supabase
          .from(table)
          .select("video_id, novo_titulo, nova_descricao, mini_resumo, tags, texto_para_embedding, criado_em")
          .eq("video_id", videoId!)
          .maybeSingle();
        if (error) continue;
        if (data) return data;
      }
      return null;
    },
    enabled: !!videoId,
  });

  const timestamps = useMemo(() => {
    if (!video?.texto_para_embedding) return [];
    return parseTimestamps(video.texto_para_embedding);
  }, [video?.texto_para_embedding]);

  const tagList = parseTags(video?.tags ?? null);

  const iframeSrc = startSeconds !== null
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startSeconds}`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  if (isLoading) {
    return (
      <PageContainer title="Carregando..." description="">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!video) {
    return (
      <PageContainer title="Vídeo não encontrado" description="">
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">Este vídeo não foi encontrado na biblioteca.</p>
          <Button variant="outline" onClick={() => navigate("/biblioteca")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Biblioteca
          </Button>
        </div>
      </PageContainer>
    );
  }

  const title = video.novo_titulo || "Sem título";
  const description = video.nova_descricao || video.mini_resumo || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description.slice(0, 300),
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    uploadDate: video.criado_em || undefined,
  };

  return (
    <>
      <Helmet>
        <title>{title} — Sommelier Ayurveda</title>
        <meta name="description" content={description.slice(0, 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description.slice(0, 160)} />
        <meta property="og:image" content={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://dosha-path-finder.lovable.app/video/${videoId}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PageContainer title={title} description={description.slice(0, 160)}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>

          {/* Player */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-lg">
            <iframe
              key={startSeconds ?? "init"}
              src={iframeSrc}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Title & Tags */}
          <div className="space-y-3">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">{title}</h1>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps */}
          {timestamps.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-sun p-4">
              <h2 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Índice de Minutos
              </h2>
              <div className="space-y-1">
                {timestamps.map((entry) => (
                  <button
                    key={entry.timestamp}
                    onClick={() => setStartSeconds(entry.seconds)}
                    className="w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <span className="flex items-center gap-1 text-secondary font-mono text-sm font-semibold whitespace-nowrap mt-0.5">
                      <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {entry.timestamp}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{entry.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <article className="prose prose-sm max-w-none text-muted-foreground font-sans whitespace-pre-line leading-relaxed">
              {description}
            </article>
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default Video;
