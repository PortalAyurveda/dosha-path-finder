import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { slugify } from "@/lib/slugify";
import PageContainer from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Play, Check } from "lucide-react";
import HeartButton from "@/components/HeartButton";
import Comments from "@/components/Comments";
import BannerSlot from "@/components/banners/BannerSlot";

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
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialTime = searchParams.get("t");
  const receitaDoDiaParam = searchParams.get("receita_do_dia") === "1";
  const [startSeconds, setStartSeconds] = useState<number | null>(initialTime ? parseInt(initialTime, 10) : null);
  const { user } = useUser();
  const [receitaMarcada, setReceitaMarcada] = useState(false);

  // videoId can come from router state (internal nav) or we resolve from slug
  const stateVideoId = (location.state as { videoId?: string })?.videoId;

  const { data: video, isLoading } = useQuery({
    queryKey: ["video-page", slug, stateVideoId],
    queryFn: async () => {
      // Internal navigation passes the videoId — look it up directly across tables
      if (stateVideoId) {
        for (const table of ALL_TABLES) {
          const { data, error } = await supabase
            .from(table)
            .select("video_id, novo_titulo, nova_descricao, mini_resumo, tags, texto_para_embedding, criado_em")
            .eq("video_id", stateVideoId)
            .maybeSingle();
          if (error) continue;
          if (data) return data as any;
        }
        return null;
      }

      // 1) Preferido: RPC canônica (resolve slug bonito ou video_id antigo)
      try {
        const { data: canon, error: canonErr } = await (supabase.rpc as any)("find_video_canonico", { _slug: slug! });
        if (!canonErr) {
          const row = Array.isArray(canon) ? canon[0] : canon;
          if (row) return row as any;
        }
      } catch (e) {
        console.warn("find_video_canonico indisponível, usando fallback:", e);
      }

      // 2) Fallback legado
      const { data, error } = await supabase.rpc("find_video_by_slug", { _slug: slug! });
      if (error) {
        console.error("find_video_by_slug error:", error);
        return null;
      }
      if (Array.isArray(data) && data.length > 0) return data[0] as any;
      return null;
    },
    enabled: !!slug,
  });

  const tagList = useMemo(() => parseTags((video as any)?.tags), [video]);
  const currentVideoId = (video as any)?.video_id;

  const { data: relacionados } = useQuery({
    queryKey: ["video-relacionados", currentVideoId, tagList.join("|")],
    enabled: !!currentVideoId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const out: any[] = [];
      const seen = new Set<string>([currentVideoId!]);
      // 1) mesma tag
      if (tagList.length > 0) {
        const orClause = tagList
          .slice(0, 4)
          .map((t) => `tags.ilike.%${t.replace(/,/g, " ")}%`)
          .join(",");
        const { data } = await (supabase.from("videos_canonicos") as any)
          .select("video_id, slug, novo_titulo, is_receita, is_live, is_oficial")
          .or(orClause)
          .limit(12);
        for (const r of (data ?? []) as any[]) {
          if (!seen.has(r.video_id)) {
            seen.add(r.video_id);
            out.push(r);
          }
          if (out.length >= 4) break;
        }
      }
      // 2) completar com mesma categoria
      if (out.length < 4) {
        const v: any = video;
        const catFilter = v?.is_receita
          ? { col: "is_receita", val: true }
          : v?.is_live
          ? { col: "is_live", val: true }
          : { col: "is_oficial", val: true };
        const { data } = await (supabase.from("videos_canonicos") as any)
          .select("video_id, slug, novo_titulo, is_receita, is_live, is_oficial")
          .eq(catFilter.col, catFilter.val)
          .order("criado_em", { ascending: false })
          .limit(12);
        for (const r of (data ?? []) as any[]) {
          if (!seen.has(r.video_id)) {
            seen.add(r.video_id);
            out.push(r);
          }
          if (out.length >= 4) break;
        }
      }
      return out;
    },
  });


  const videoId = video?.video_id;
  const isReceita = (video as any)?.is_receita === true || receitaDoDiaParam;

  // Marca essa receita como feita no dia
  const { data: evolucao } = useQuery({
    queryKey: ["minha-evolucao", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_minha_evolucao");
      return data ?? {};
    },
    enabled: !!user && isReceita,
    staleTime: 60 * 1000,
  });
  const receitaFeitaHoje = (evolucao as any)?.receita_feita_hoje === true || receitaMarcada;

  const marcarReceita = async () => {
    if (!user || !videoId || receitaFeitaHoje) return;
    try {
      const { data } = await (supabase.rpc as any)("evolucao_registrar", {
        p_tipo: "receita_feita",
        p_ref: String(videoId),
      });
      setReceitaMarcada(true);
      if (data?.ok && (data?.pontos_ganhos ?? 0) > 0) {
        toast.success("✓ Registrado no seu dia");
      }
    } catch {
      /* silencioso */
    }
  };

  const timestamps = useMemo(() => {
    const source = video?.texto_para_embedding || video?.nova_descricao || video?.mini_resumo || "";
    if (!source) return [];
    const parsed = parseTimestamps(source);
    // dedupe by timestamp string, preserve order
    const seen = new Set<string>();
    return parsed.filter((e) => {
      if (seen.has(e.timestamp)) return false;
      seen.add(e.timestamp);
      return true;
    });
  }, [video?.texto_para_embedding, video?.nova_descricao, video?.mini_resumo]);

  

  const iframeSrc = videoId
    ? startSeconds !== null
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startSeconds}`
      : `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : "";

  // Soft 404: when slug doesn't resolve, redirect to /biblioteca (replace) instead of rendering a 200 error page
  useEffect(() => {
    if (!isLoading && !video) {
      navigate("/biblioteca", { replace: true });
    }
  }, [isLoading, video, navigate]);

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
    return null;
  }

  const title = video.novo_titulo || "Sem título";
  const description = video.nova_descricao || video.mini_resumo || "";
  const canonicalSlug = slugify(title);

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
        <link rel="canonical" href={`https://portalayurveda.com/video/${canonicalSlug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PageContainer title={title} description={description.slice(0, 160)}>
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>

          <BannerSlot slot="video" className="[&:empty]:hidden" />

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="space-y-6 lg:col-span-2">
              {/* Player */}
              {videoId && (
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
              )}

              {/* Marcar receita do dia como feita */}
              {isReceita && user && videoId && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={receitaFeitaHoje}
                    onClick={marcarReceita}
                  >
                    {receitaFeitaHoje ? (
                      <><Check className="h-4 w-4 mr-1.5" /> Feita hoje</>
                    ) : (
                      "Marquei que fiz esta receita"
                    )}
                  </Button>
                </div>
              )}

              {/* Title & Tags & Heart destaque */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary flex-1">{title}</h1>
                  {videoId && <HeartButton contentType="video" contentId={videoId} variant="destaque" className="mt-1 shrink-0" />}
                </div>
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

              {/* Assista também */}
              {relacionados && relacionados.length > 0 && (
                <section className="mt-8 pt-6 border-t border-border">
                  <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    Assista também
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {relacionados.map((r: any) => (
                      <a
                        key={r.video_id}
                        href={`/video/${r.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/video/${r.slug}`, { state: { videoId: r.video_id } });
                        }}
                        className="group block"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                          <img
                            src={`https://img.youtube.com/vi/${r.video_id}/mqdefault.jpg`}
                            alt={r.novo_titulo || "Vídeo"}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0">
                            <Play className="h-6 w-6 text-white drop-shadow" fill="white" />
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground mt-1.5 line-clamp-2 leading-snug">
                          {r.novo_titulo}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:col-span-1 lg:sticky lg:top-4">
              <Comments slug={canonicalSlug} title="O que você achou do vídeo?" />
            </aside>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default Video;
