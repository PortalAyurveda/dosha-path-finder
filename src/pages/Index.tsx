import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Play,
  ExternalLink,
  Search,
  Sparkles,
  X,
  BarChart3,
  Target,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BLOG_TAGS } from "@/data/blogTags";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import RegistrosAkashikos from "@/components/index/RegistrosAkashikos";
import Hero from "@/components/home/Hero";
import LoggedHero from "@/components/home/LoggedHero";
import SamkhyaBanner from "@/components/home/SamkhyaBanner";

/* ---------- Design tokens (scoped to this page) ---------- */
const C = {
  primary: "#352F54",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#4ADE80",
  accent: "#FACC15",
  bgSoft: "#F8F9FA",
  surface: "#FFF8EE",
};
const LEAF = "24px 4px 24px 4px";
const LEAF_ALT = "4px 24px 4px 24px";

const STORAGE = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_capas";
const AKASHA_LOGO =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-akasha.png";

/* ============================================================
   Feed Social — marquee dinâmico de métricas R##
============================================================ */
type MetricaRow = {
  metrica_id: string;
  percentual: number | null;
};

// Mapa fixo: id → (emoji, frase com placeholder {pct})
const MARQUEE_TEMPLATE: { id: string; emoji: string; tone: string; tpl: (pct: string) => string }[] = [
  { id: "R03", emoji: "🌬️", tone: C.vata, tpl: (p) => `${p} com Agni Irregular desenvolvem Vata Adoecido` },
  { id: "R04", emoji: "🔥", tone: C.pitta, tpl: (p) => `${p} com Agni Forte no limite chegam ao Pitta Adoecido` },
  { id: "R02", emoji: "🔥", tone: C.pitta, tpl: (p) => `${p} dos Pittas Fixados têm digestão irregular — não fogo` },
  { id: "R09", emoji: "⚡", tone: C.accent, tpl: (p) => `${p} da base com score crítico tem Agni Irregular junto` },
  { id: "R07", emoji: "🌬️", tone: C.vata, tpl: (p) => `${p} dos Pittas Fixados já têm Vata comprometido` },
  { id: "R11", emoji: "🔥", tone: C.pitta, tpl: (p) => `${p} dos Pittas Fixados têm 5+ sintomas Vata: padrão burnout` },
  { id: "R12", emoji: "🪵", tone: C.kapha, tpl: (p) => `${p} dos Kaphas pesados têm mente dispersa simultaneamente` },
  { id: "R21", emoji: "🌬️", tone: C.vata, tpl: (p) => `${p} do Vata em acúmulo come menos de 2 alimentos quentes` },
  { id: "R37", emoji: "⚡", tone: C.accent, tpl: (p) => `${p} têm Vata adoecido com Pitta só em acúmulo: Vata adoece primeiro` },
  { id: "R22", emoji: "🌬️", tone: C.vata, tpl: (p) => `${p} das pessoas acima de 50 anos já têm digestão irregular` },
  { id: "R46", emoji: "🔥", tone: C.pitta, tpl: (p) => `${p} têm Pitta oculto — score normal, mas sintomas gritando` },
  { id: "R24", emoji: "🪵", tone: C.kapha, tpl: (p) => `${p} com Agni Fraco acumulam Kapha: fogo baixo, corpo estagna` },
];

const MARQUEE_IDS = MARQUEE_TEMPLATE.map((m) => m.id);

const FeedSocial = () => {
  const { data } = useQuery({
    queryKey: ["marquee_metricas_v1"],
    queryFn: async () => {
      // 1) data mais recente
      const { data: latest } = await supabase
        .from("metricas_snapshot")
        .select("data_calculo")
        .order("data_calculo", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!latest?.data_calculo) return [] as MetricaRow[];
      // 2) métricas
      const { data: rows } = await supabase
        .from("metricas_snapshot")
        .select("metrica_id, percentual")
        .eq("data_calculo", latest.data_calculo)
        .in("metrica_id", MARQUEE_IDS);
      return (rows ?? []) as MetricaRow[];
    },
    staleTime: 30 * 60 * 1000,
  });

  const map = useMemo(() => new Map((data ?? []).map((r) => [r.metrica_id, r])), [data]);

  const items = useMemo(
    () =>
      MARQUEE_TEMPLATE.map((m) => {
        const pct = map.get(m.id)?.percentual;
        if (pct == null) return null;
        const formatted = `${pct.toFixed(1).replace(".", ",")}%`;
        return { ...m, text: m.tpl(formatted) };
      }).filter(Boolean) as { id: string; emoji: string; tone: string; text: string }[],
    [map]
  );

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section
      className="overflow-hidden py-3"
      style={{
        background: `${C.primary}0F`,
        borderTop: `1px solid ${C.primary}1A`,
        borderBottom: `1px solid ${C.primary}1A`,
      }}
      aria-label="Métricas em tempo real do Portal Ayurveda"
    >
      <div className="marquee-track flex gap-8 whitespace-nowrap">
        {loop.map((it, i) => (
          <span
            key={i}
            className="text-sm font-sans inline-flex items-center gap-2"
            style={{ color: `${C.primary}CC` }}
          >
            <span aria-hidden="true" className="text-base">
              {it.emoji}
            </span>
            <span style={{ color: it.tone, fontWeight: 700 }}>
              {it.text.split(" ")[0]}
            </span>
            <span>{it.text.split(" ").slice(1).join(" ")}</span>
            <span className="mx-2 opacity-40">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeX {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeX 120s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

/* ============================================================
   Biblioteca Section — 3 colunas: Live, Receita, Artigo do dia
============================================================ */
type LiveRow = {
  novo_titulo: string | null;
  mini_resumo: string | null;
  url: string | null;
  tags: string | null;
  video_id: string;
};

type RecipeRow = {
  novo_titulo: string | null;
  mini_resumo: string | null;
  nova_descricao: string | null;
  url: string | null;
  tags: string | null;
  video_id: string;
};

type ArticleRow = {
  id: string;
  title: string;
  meta_description: string | null;
  image_url: string | null;
  link_do_artigo: string | null;
  tags: string | null;
};

const firstTag = (tags: string | null | undefined, sep: string | RegExp = /[\n,]/) => {
  if (!tags) return null;
  return tags.split(sep)[0]?.trim() || null;
};

const ColumnCard = ({
  badge,
  image,
  title,
  summary,
  href,
  external,
  cta,
  accentColor,
  videoId,
}: {
  badge: string;
  image: string | null;
  title: string;
  summary: string | null;
  href: string;
  external: boolean;
  cta: string;
  accentColor: string;
  videoId?: string;
}) => {
  const Wrap: any = external ? "a" : Link;
  const wrapProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { to: href, state: videoId ? { videoId } : undefined };

  return (
    <Wrap
      {...wrapProps}
      className="group block overflow-hidden bg-card border border-border transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderRadius: LEAF }}
    >
      <div
        className="relative w-full aspect-video overflow-hidden flex items-center justify-center bg-muted"
        style={!image ? { background: `linear-gradient(135deg, ${C.primary}, #1f1a3a)` } : undefined}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            width={400}
            height={225}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Play className="h-12 w-12 text-white/90" fill="white" />
        )}
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: accentColor, color: "white" }}
        >
          {badge}
        </span>
      </div>
      <div className="p-4">
        <h3
          className="font-serif font-bold text-[15px] leading-snug mb-1.5 line-clamp-2"
          style={{ color: C.primary, fontStyle: "normal" }}
        >
          {title}
        </h3>
        {summary && (
          <p className="font-sans text-[13px] leading-snug text-muted-foreground line-clamp-4">
            {summary}
          </p>
        )}
      </div>
    </Wrap>
  );
};

const BibliotecaSection = () => {
  const liveQ = useQuery({
    queryKey: ["index_live_do_dia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_lives")
        .select("novo_titulo,mini_resumo,url,tags,video_id")
        .not("novo_titulo", "is", null)
        .not("url", "is", null)
        .order("criado_em", { ascending: false })
        .limit(1);
      if (error) throw error;
      return ((data ?? []) as LiveRow[])[0] ?? null;
    },
  });

  const receitaQ = useQuery({
    queryKey: ["index_receita_do_dia"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("receita_do_dia");
      if (error) throw error;
      return ((data ?? []) as RecipeRow[])[0] ?? null;
    },
    staleTime: 60 * 60 * 1000,
  });

  const artigoQ = useQuery({
    queryKey: ["index_artigo_do_dia"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("artigo_do_dia");
      if (error) throw error;
      return ((data ?? []) as ArticleRow[])[0] ?? null;
    },
    staleTime: 60 * 60 * 1000,
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="flex flex-col items-center text-center gap-2 mb-10">
        <h2
          className="font-serif italic font-bold text-3xl md:text-4xl"
          style={{ color: C.primary }}
        >
          Feed do dia
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live do dia */}
        {liveQ.isLoading ? (
          <CardSkeleton />
        ) : liveQ.data ? (
          <ColumnCard
            badge="Live do dia"
            image={`https://img.youtube.com/vi/${liveQ.data.video_id}/mqdefault.jpg`}
            title={liveQ.data.novo_titulo ?? ""}
            summary={liveQ.data.mini_resumo}
            href={`/video/${slugify(liveQ.data.novo_titulo || "live")}`}
            videoId={liveQ.data.video_id}
            external={false}
            cta="Assistir agora"
            accentColor={C.pitta}
          />
        ) : null}

        {/* Receita do dia */}
        {receitaQ.isLoading ? (
          <CardSkeleton />
        ) : receitaQ.data ? (
          <ColumnCard
            badge="Receita do dia"
            image={`https://img.youtube.com/vi/${receitaQ.data.video_id}/mqdefault.jpg`}
            title={receitaQ.data.novo_titulo ?? ""}
            summary={receitaQ.data.nova_descricao || receitaQ.data.mini_resumo}
            href={`/video/${slugify(receitaQ.data.novo_titulo || "receita")}`}
            videoId={receitaQ.data.video_id}
            external={false}
            cta="Ver receita"
            accentColor={C.kapha}
          />
        ) : null}

        {/* Artigo do dia */}
        {artigoQ.isLoading ? (
          <CardSkeleton />
        ) : artigoQ.data ? (
          <ColumnCard
            badge="Artigo do dia"
            image={artigoQ.data.image_url}
            title={artigoQ.data.title}
            summary={artigoQ.data.meta_description}
            href={`/blog/${artigoQ.data.link_do_artigo || artigoQ.data.id}`}
            external={false}
            cta="Ler artigo"
            accentColor={C.primary}
          />
        ) : null}
      </div>
    </section>
  );
};

const CardSkeleton = () => (
  <div className="bg-card border border-border overflow-hidden" style={{ borderRadius: LEAF }}>
    <div className="w-full aspect-video bg-muted animate-pulse" />
    <div className="p-5 space-y-2">
      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
      <div className="h-4 bg-muted animate-pulse rounded" />
      <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
    </div>
  </div>
);

/* ============================================================
   Sommelier de Artigos (busca por título / busca avançada)
============================================================ */
type ArticleSearchRow = {
  id: string;
  title: string;
  meta_description: string | null;
  summary: string | null;
  image_url: string | null;
  link_do_artigo: string | null;
  tags: string | null;
};

const SommelierArtigos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["index_sommelier_artigos", debouncedSearch, isAdvanced],
    queryFn: async () => {
      let query = supabase
        .from("portal_conteudo")
        .select("id,title,meta_description,summary,image_url,link_do_artigo,tags,created_at")
        .not("link_do_artigo", "is", null)
        .order("created_at", { ascending: false })
        .limit(24);

      if (debouncedSearch) {
        if (isAdvanced) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,summary.ilike.%${debouncedSearch}%,tags.ilike.%${debouncedSearch}%,meta_description.ilike.%${debouncedSearch}%`
          );
        } else {
          query = query.ilike("title", `%${debouncedSearch}%`);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ArticleSearchRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return articles;
    return articles.filter((a) => {
      if (!a.tags) return false;
      return selectedTags.every((tag) => a.tags!.includes(tag));
    });
  }, [articles, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <section style={{ background: C.bgSoft }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-8">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl mb-3"
            style={{ color: C.primary }}
          >
            Sommelier
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Encontre artigos sobre Ayurveda: busque por sintomas, doshas, alimentos e muito mais.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto space-y-3 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isAdvanced ? "Busca em conteúdo e tags..." : "Buscar por título..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-card"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Switch id="sommelier-advanced" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
            <Label htmlFor="sommelier-advanced" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Busca Avançada
            </Label>
          </div>

          {isAdvanced && (
            <div className="flex flex-wrap justify-center gap-1">
              {BLOG_TAGS.slice(0, 18).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border",
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 items-center">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className="cursor-pointer text-[10px]" onClick={() => toggleTag(tag)}>
                  {tag} <X className="h-2.5 w-2.5 ml-1" />
                </Badge>
              ))}
              <button onClick={() => setSelectedTags([])} className="text-[10px] text-muted-foreground hover:text-primary ml-1">
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum artigo encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.slice(0, 6).map((art) => (
              <ColumnCard
                key={art.id}
                badge={firstTag(art.tags, ",") || "Artigo"}
                image={art.image_url}
                title={art.title}
                summary={art.meta_description || art.summary}
                href={`/blog/${art.link_do_artigo || art.id}`}
                external={false}
                cta="Ler artigo"
                accentColor={C.primary}
              />
            ))}
          </div>
        )}

        {filtered.length > 6 && (
          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-sans font-semibold text-sm px-6 py-3 transition-all hover:-translate-y-0.5"
              style={{
                background: "transparent",
                border: `2px solid ${C.primary}`,
                color: C.primary,
                borderRadius: LEAF,
              }}
            >
              Ver todos os artigos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

/* Banner Samkhya — usa componente compartilhado em src/components/home/SamkhyaBanner.tsx */

/* ============================================================
   Page
============================================================ */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Portal Ayurveda",
  url: "https://www.portalayurveda.com",
  logo: "https://www.portalayurveda.com/logo.png",
  description:
    "Portal Ayurveda Brasil: Descubra seu Dosha, entenda seu metabolismo e restaure sua saúde com nutrição e rotinas práticas de Medicina Ayurveda",
  sameAs: [
    "https://www.youtube.com/@portalayurveda",
    "https://www.instagram.com/edson_ayurveda",
  ],
};

const Index = () => {
  const { doshaResult, user, loading } = useUser();
  const isLoggedWithDosha = !!(user && doshaResult?.idPublico);
  // While auth is still resolving AND we have a session token in storage,
  // hold off rendering the public Hero so it doesn't flash before LoggedHero.
  const hasStoredSession =
    typeof window !== "undefined" &&
    (!!localStorage.getItem("activeDoshaId") ||
      document.cookie.includes("sb-") ||
      Object.keys(localStorage).some((k) => k.startsWith("sb-")));
  const shouldWait = loading && hasStoredSession && !isLoggedWithDosha;

  return (
    <>
      <Helmet>
        <title>Portal Ayurveda — Aprenda Ayurveda no Brasil</title>
        <meta
          name="description"
          content="Portal Ayurveda Brasil: Descubra seu Dosha, entenda seu metabolismo e restaure sua saúde com nutrição e rotinas práticas de Medicina Ayurveda"
        />
        <meta property="og:title" content="Portal Ayurveda — Aprenda Ayurveda no Brasil" />
        <meta
          property="og:description"
          content="Descubra seu Dosha, entenda seu metabolismo e restaure sua saúde com nutrição e rotinas práticas de Medicina Ayurveda."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>

      {shouldWait ? (
        <div className="min-h-[420px] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : isLoggedWithDosha ? (
        <LoggedHero />
      ) : (
        <Hero />
      )}
      <FeedSocial />
      <BibliotecaSection />
      <RegistrosAkashikos />
      <SommelierArtigos />
      <SamkhyaBanner />
    </>
  );
};

export default Index;
