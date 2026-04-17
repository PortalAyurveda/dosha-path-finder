import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BLOG_TAGS } from "@/data/blogTags";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import RegistrosAkashikos from "@/components/index/RegistrosAkashikos";

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
   Hero
============================================================ */
const Hero = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [nivel, setNivel] = useState("");

  const canStart = !!(nome.trim() && idade.trim() && nivel);

  const handleStart = () => {
    if (!canStart) return;
    localStorage.setItem(
      "dosha_test_info",
      JSON.stringify({ nome: nome.trim(), idade, nivel })
    );
    navigate("/teste-de-dosha");
  };

  // Quantas pessoas fizeram o teste nos últimos 7 dias
  const { data: weeklyCount } = useQuery({
    queryKey: ["feed_weekly_count"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count, error } = await supabase
        .from("feed_resultados")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, #ffffff 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: blurred preview + 3 mini boxes */}
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-4">
            {/* Blurred preview */}
            <div
              className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 xl:p-7 border border-border shadow-lg relative overflow-hidden flex-1"
              style={{ minHeight: 320 }}
            >
              <div className="select-none pointer-events-none" style={{ filter: "blur(5px)", opacity: 0.6 }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="font-serif font-bold text-base" style={{ color: C.primary }}>Pontuação</p>
                    <div
                      className="w-32 h-32 rounded-full relative shadow-inner flex items-center justify-center"
                      style={{
                        background: `conic-gradient(${C.pitta} 0% 59.7%, ${C.vata} 59.7% 92.3%, ${C.kapha} 92.3% 100%)`,
                      }}
                    >
                      <div className="w-20 h-20 bg-card rounded-full" />
                    </div>
                    <div className="text-xs font-bold text-muted-foreground space-y-0.5 text-center">
                      <p>Vata: 30 pts</p>
                      <p>Pitta: 55 pts</p>
                      <p>Kapha: 7 pts</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <p className="font-serif font-bold text-base text-center" style={{ color: C.primary }}>Quadro Clínico</p>
                    <div className="grid grid-cols-3 gap-1.5 flex-1 h-[180px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 rounded-sm" style={{ background: C.vata }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.vata, opacity: 0.7 }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.vata, opacity: 0.4 }} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex-1 rounded-sm" style={{ background: C.pitta }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.pitta, opacity: 0.85 }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.pitta, opacity: 0.65 }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.pitta, opacity: 0.45 }} />
                        <div className="flex-1 rounded-sm" style={{ background: C.pitta, opacity: 0.25 }} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 bg-muted/50 rounded-sm" />
                        <div className="flex-1 rounded-sm" style={{ background: C.kapha, opacity: 0.6 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div
              className="animate-fade-in bg-card/80 backdrop-blur-sm rounded-3xl p-6 xl:p-8 border border-border shadow-lg flex flex-col justify-center space-y-5 flex-1"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="text-center">
                <h1
                  className="mb-2 font-serif font-bold text-2xl md:text-3xl lg:text-[34px] leading-tight"
                  style={{ color: C.primary, fontStyle: "normal" }}
                >
                  Seu guia completo para saúde e longevidade.
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Descubra e cuide dos seus Doshas por meio da medicina milenar.
                </p>
              </div>

              <hr className="border-border" />

              <p className="font-serif font-semibold text-base text-center" style={{ color: C.primary }}>
                Comece seu Teste de Dosha Gratuito
              </p>

              <div className="text-left space-y-3">
                <div>
                  <Label htmlFor="hero-nome" className="text-xs">Seu nome</Label>
                  <Input
                    id="hero-nome"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="hero-idade" className="text-xs">Idade</Label>
                    <Input
                      id="hero-idade"
                      type="number"
                      placeholder="30"
                      value={idade}
                      onChange={(e) => setIdade(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Nível de Ayurveda</Label>
                    <select
                      value={nivel}
                      onChange={(e) => setNivel(e.target.value)}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1",
                        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        !nivel && "text-muted-foreground"
                      )}
                    >
                      <option value="" disabled>Selecione</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={!canStart}
                className="w-full text-white"
                size="lg"
                style={{
                  background: C.pitta,
                  borderRadius: LEAF,
                }}
              >
                Começar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Social proof */}
              {typeof weeklyCount === "number" && weeklyCount > 0 && (
                <div
                  className="flex items-center justify-center gap-2 pt-2 border-t border-border"
                  aria-live="polite"
                >
                  <Users className="h-4 w-4" style={{ color: C.kapha }} />
                  <p className="text-xs text-muted-foreground">
                    <strong style={{ color: C.primary }}>{weeklyCount}</strong>{" "}
                    {weeklyCount === 1 ? "pessoa descobriu" : "pessoas descobriram"} seu Dosha essa semana
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Feed Social (marquee — frase_akasha + status_visual)
============================================================ */
type FeedItem = {
  frase_akasha: string | null;
  status_visual: string | null;
};

const FeedSocial = () => {
  const { data } = useQuery({
    queryKey: ["feed_resultados_index_v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_resultados")
        .select("frase_akasha,status_visual")
        .not("frase_akasha", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as FeedItem[];
    },
  });

  const items = data ?? [];
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section
      className="overflow-hidden py-3"
      style={{
        background: C.primary,
        borderTop: `3px solid ${C.accent}`,
      }}
      aria-label="Feed de resultados recentes"
    >
      <div className="marquee-track flex gap-12 whitespace-nowrap">
        {loop.map((it, i) => (
          <span key={i} className="text-white/90 text-sm font-sans inline-flex items-center gap-3">
            <span className="text-white/85">"{it.frase_akasha}"</span>
            {it.status_visual && (
              <span
                className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: `${C.accent}25`, color: C.accent }}
              >
                {it.status_visual}
              </span>
            )}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeX {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeX 180s linear infinite;
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
      <div className="p-5">
        <h3
          className="font-serif font-bold text-[15px] leading-snug mb-2 line-clamp-2"
          style={{ color: C.primary, fontStyle: "normal" }}
        >
          {title}
        </h3>
        {summary && (
          <p className="font-sans text-[13px] text-muted-foreground line-clamp-2 mb-3">{summary}</p>
        )}
        <span className="font-sans text-[13px] font-semibold inline-flex items-center gap-1" style={{ color: C.pitta }}>
          {cta} {external ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </span>
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
      <div className="flex flex-col items-center text-center gap-5 mb-10">
        <div>
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl mb-2"
            style={{ color: C.primary }}
          >
            Biblioteca
          </h2>
          <p className="text-muted-foreground text-base">
            Conteúdo selecionado todo dia para você.
          </p>
        </div>
        {/* 3 dosha buttons centered under title */}
        <div className="flex gap-2 flex-wrap justify-center">
          <Link
            to="/biblioteca/vata"
            className="px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.vata, borderRadius: LEAF }}
          >
            🌬️ Vata
          </Link>
          <Link
            to="/biblioteca/pitta"
            className="px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.pitta, borderRadius: LEAF }}
          >
            🔥 Pitta
          </Link>
          <Link
            to="/biblioteca/kapha"
            className="px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.kapha, borderRadius: LEAF }}
          >
            🪵 Kapha
          </Link>
        </div>
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
            summary={receitaQ.data.mini_resumo}
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

/* ============================================================
   Banner Samkhya
============================================================ */
const SamkhyaBanner = () => (
  <section style={{ background: C.primary }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
      <div className="max-w-2xl">
        <h2 className="font-serif italic font-bold text-white text-2xl md:text-[32px] leading-tight mb-3">
          Óleos, massalas e fórmulas Ayurveda.
        </h2>
        <p className="text-[15px]" style={{ color: "rgba(255,255,255,.6)" }}>
          Fabricados com rigor técnico pela Samkhya Ayurveda.
        </p>
      </div>
      <a
        href="https://samkhya.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-sans font-semibold border-2 border-white text-white px-7 py-3.5 transition-colors hover:text-[#352F54]"
        style={{ borderRadius: LEAF }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.accent)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        Conhecer a Loja Samkhya <ArrowRight className="h-5 w-5" />
      </a>
    </div>
  </section>
);

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
  const { doshaResult, loading, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && doshaResult?.idPublico) {
      navigate(`/meu-dosha?id=${doshaResult.idPublico}`, { replace: true });
    }
  }, [loading, user, doshaResult, navigate]);

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

      <Hero />
      <FeedSocial />
      <BibliotecaSection />
      <RegistrosAkashikos />
      <SommelierArtigos />
      <SamkhyaBanner />
    </>
  );
};

export default Index;
