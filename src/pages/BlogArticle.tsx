import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import HeartButton from "@/components/HeartButton";

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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="aspect-video bg-muted rounded-xl" />
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
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
        <title>{article.title} | Blog Portal Ayurveda</title>
        {article.meta_description && (
          <meta name="description" content={article.meta_description} />
        )}
        <link rel="canonical" href={`https://dosha-path-finder.lovable.app/blog/${article.link_do_artigo}`} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>
          <HeartButton contentType="artigo" contentId={article.id} className="mt-2 shrink-0" />
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

        {article.summary && (
          <div
            className="prose prose-lg max-w-none text-foreground 
              prose-headings:font-serif prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.summary }}
          />
        )}

        {/* Bottom heart for readers who finish the article */}
        <div className="flex items-center justify-center gap-2 py-8 border-t border-border mt-8">
          <span className="text-sm text-muted-foreground">Gostou do artigo?</span>
          <HeartButton contentType="artigo" contentId={article.id} />
        </div>
      </article>
    </>
  );
};

export default BlogArticle;
