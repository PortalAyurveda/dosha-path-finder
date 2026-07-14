import { getTransformedImageUrl } from "@/lib/imageTransform";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import HeartButton from "@/components/HeartButton";
import { useState } from "react";
import BannerSlot from "@/components/banners/BannerSlot";

const extractYoutubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    return null;
  }
  return null;
};

const AulaEmbed = ({ videoUrl, title }: { videoUrl: string; title: string }) => {
  const [play, setPlay] = useState(false);
  const id = extractYoutubeId(videoUrl);
  if (!id) return null;
  return (
    <aside className="my-8 rounded-2xl overflow-hidden border border-border bg-card shadow-sm not-prose">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Assista à aula deste artigo
        </p>
      </div>
      <div className="aspect-video relative bg-black">
        {play ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerated-2d-canvas; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="absolute inset-0 w-full h-full group"
            aria-label="Reproduzir aula"
          >
            <img
              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
              <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" strokeWidth={1.5} />
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_conteudo")
        .select("*")
        .eq("link_do_artigo", slug!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const formattedSlug = slug
    ? slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
    : "Carregando...";

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>{formattedSlug} | Portal Ayurveda</title>
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="aspect-video bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
        <Link to="/blog" className="text-primary hover:underline">← Voltar ao Blog</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Portal Ayurveda</title>
        {article.meta_description && (
          <meta name="description" content={article.meta_description} />
        )}
        <link rel="canonical" href={`https://portalayurveda.com/blog/${article.link_do_artigo}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${article.title} | Portal Ayurveda`} />
        {article.meta_description && (
          <meta property="og:description" content={article.meta_description} />
        )}
        <meta property="og:url" content={`https://portalayurveda.com/blog/${article.link_do_artigo}`} />
        <meta property="og:image" content={article.image_url || "https://portalayurveda.com/og-image.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        {article.meta_description && (
          <meta name="twitter:description" content={article.meta_description} />
        )}
        <meta name="twitter:image" content={article.image_url || "https://portalayurveda.com/og-image.jpg"} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 flex-1">
            {article.title}
          </h1>
          <HeartButton contentType="artigo" contentId={article.id} variant="destaque" className="mt-2 shrink-0" />
        </div>

        {article.meta_description && (
          <p className="text-lg text-muted-foreground mb-6 italic">
            {article.meta_description}
          </p>
        )}

        {article.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.split(",").map((tag) => (
              <Link
                key={tag.trim()}
                to={`/blog?tag=${encodeURIComponent(tag.trim())}`}
              >
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag.trim()}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {article.image_url && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={getTransformedImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {(() => {
          const videoUrl = (article as any).video_url as string | undefined;
          const hasVideo = !!videoUrl && !!extractYoutubeId(videoUrl);
          const summary = article.summary || "";
          if (!summary && !hasVideo) return null;

          if (hasVideo && summary) {
            const marker = "</h2>";
            const idx = summary.toLowerCase().indexOf(marker);
            const proseClass =
              "prose prose-lg max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline";
            if (idx >= 0) {
              const before = summary.slice(0, idx + marker.length);
              const after = summary.slice(idx + marker.length);
              return (
                <>
                  <div className={proseClass} dangerouslySetInnerHTML={{ __html: before }} />
                  <AulaEmbed videoUrl={videoUrl!} title={article.title} />
                  <div className={proseClass} dangerouslySetInnerHTML={{ __html: after }} />
                </>
              );
            }
            return (
              <>
                <AulaEmbed videoUrl={videoUrl!} title={article.title} />
                <div className={proseClass} dangerouslySetInnerHTML={{ __html: summary }} />
              </>
            );
          }

          if (hasVideo) {
            return <AulaEmbed videoUrl={videoUrl!} title={article.title} />;
          }

          return (
            <div
              className="prose prose-lg max-w-none text-foreground 
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          );
        })()}

        {/* Bottom heart for readers who finish the article */}
        <div className="flex items-center justify-center gap-2 py-8 border-t border-border mt-8">
          <span className="text-sm text-muted-foreground">Isso te fez bem?</span>
          <HeartButton contentType="artigo" contentId={article.id} />
        </div>

        <BannerSlot slot="blog_fim" className="[&:empty]:hidden mt-6" />
      </article>
    </>
  );
};

export default BlogArticle;
