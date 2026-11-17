import { useEffect, useRef } from "react";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { AUTOR_ARTIGO, cursoDoArtigo, dataAtualizacao, dataBRArtigo } from "@/lib/artigoExtras";
import { supabase } from "@/integrations/supabase/client";
import { buscarRedirecionamento, aplicarRedirecionamento } from "@/lib/redirecionamentos";
import { Badge } from "@/components/ui/badge";
import HeartButton from "@/components/HeartButton";
import BannerSlot from "@/components/banners/BannerSlot";
import LeiaTambem from "@/components/LeiaTambem";
import { useUser } from "@/contexts/UserContext";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAnonymous } = useUser();
  const artigosVistos = useRef(new Set<string>());

  const { data: article, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_conteudo")
        .select("*")
        .eq("link_do_artigo", slug!)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!user || isAnonymous || !article?.id || artigosVistos.current.has(article.id)) return;
    artigosVistos.current.add(article.id);
    void (async () => {
      try {
        await supabase.rpc("marcar_visto" as any, { p_tipo: "artigo", p_id: article.id });
      } catch {
        // Leitura registrada em silêncio; falhas não afetam o artigo.
      }
    })();
  }, [user, isAnonymous, article?.id]);

  // O canonical é escrito por DOM pelo hook global useCanonical (no pai desta página).
  // O efeito do pai roda DEPOIS do efeito do filho, então o setTimeout é obrigatório.
  const artigoInexistente = isSuccess && !article;
  useEffect(() => {
    if (!artigoInexistente) return;
    const remover = () =>
      document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    remover();
    const t = window.setTimeout(remover, 0);
    return () => window.clearTimeout(t);
  }, [artigoInexistente]);

  // Artigo que saiu do ar e ganhou endereço novo na tabela redirecionamentos: vai direto para o novo.
  useEffect(() => {
    if (!artigoInexistente || !slug) return;
    let ativo = true;
    buscarRedirecionamento(`/blog/${slug}`).then((destino) => {
      if (ativo && destino) aplicarRedirecionamento(destino);
    });
    return () => {
      ativo = false;
    };
  }, [artigoInexistente, slug]);

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

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Não foi possível carregar este artigo agora</h1>
        <Link to="/blog" className="text-primary hover:underline">← Voltar ao Blog</Link>
      </div>
    );
  }

  if (isSuccess && !article) {
    return (
      <>
        <Helmet defer={false}>
          <title>Artigo não encontrado — Portal Ayurveda</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <Link to="/blog" className="text-primary hover:underline">← Voltar ao Blog</Link>
        </div>
      </>
    );
  }

  if (!article) return null;


  return (
    <>
      <Helmet>
        <title>{article.title} | Portal Ayurveda</title>
        {article.meta_description && (
          <meta name="description" content={article.meta_description} />
        )}
        {/* canonical é injetado pelo hook global useCanonical — não duplicar aqui */}
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
        <nav aria-label="Trilha" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5 min-w-0">
            <li className="shrink-0"><Link to="/" className="hover:text-primary">Início</Link></li>
            <li className="shrink-0" aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="shrink-0"><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li className="shrink-0" aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="min-w-0 truncate text-foreground" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 flex-1">
            {article.title}
          </h1>
          <HeartButton contentType="artigo" contentId={article.id} variant="destaque" className="mt-2 shrink-0" />
        </div>

        {article.meta_description && (
          <p className="text-lg text-muted-foreground mb-6 ">
            {article.meta_description}
          </p>
        )}

        {(() => {
          const data = dataBRArtigo(dataAtualizacao(article as any));
          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
              <div className="flex items-center gap-3">
                <img src={AUTOR_ARTIGO.foto} alt={AUTOR_ARTIGO.nome} width={44} height={44} loading="eager" className="h-11 w-11 rounded-full object-cover" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">Por {AUTOR_ARTIGO.nome}</p>
                  <p className="text-xs text-muted-foreground">{AUTOR_ARTIGO.linha}</p>
                </div>
              </div>
              {data && <p className="text-xs text-muted-foreground">Atualizado em {data}</p>}
            </div>
          );
        })()}

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
              src={getTransformedImageUrl(article.image_url, 900)}
              alt={article.title}
              width={900}
              height={506}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

        )}

        {(() => {
          const summary = article.summary || "";
          if (!summary) return null;

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

        {(() => {
          const curso = cursoDoArtigo(article.tags, article.title);
          return (
            <aside className="rounded-xl border border-border bg-muted/40 p-5 md:p-6 mb-8 text-center">
              <h2 className="font-serif text-xl font-bold text-foreground mb-2">Continue aprendendo</h2>
              <p className="text-muted-foreground mb-4">Se quiser se aprofundar nesse assunto, conheça o {curso.nome}.</p>
              <a href={curso.rota} className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Conhecer o curso</a>
            </aside>
          );
        })()}

        <LeiaTambem slug={article.link_do_artigo} />

        <BannerSlot slot="blog_fim" className="[&:empty]:hidden mt-6" />
      </article>
    </>
  );
};

export default BlogArticle;
