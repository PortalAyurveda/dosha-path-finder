import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Play, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

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

/* ============================================================
   Hero
============================================================ */
const Hero = () => (
  <section
    className="relative overflow-hidden"
    style={{
      background: `linear-gradient(180deg, ${C.surface} 0%, #ffffff 100%)`,
      minHeight: "88vh",
    }}
  >
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center min-h-[88vh]">
      <img
        src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/simbolo-positivo.svg"
        alt="Portal Ayurveda"
        width={96}
        height={96}
        className="mb-8 animate-fade-in"
      />

      <h1
        className="font-serif italic font-bold leading-[1.05] mb-6 text-[40px] sm:text-[52px] md:text-[64px]"
        style={{ color: C.primary }}
      >
        Aprenda Ayurveda com
        <br />
        quem <span style={{ color: C.pitta, fontStyle: "normal" }}>vive a prática.</span>
      </h1>

      <p className="font-sans text-base md:text-[17px] text-muted-foreground max-w-2xl mb-10 leading-relaxed">
        Mais de 1.600 pessoas já descobriram seu dosha com o nosso teste gratuito.
        <br />
        Aulas ao vivo toda semana.
      </p>

      <Link
        to="/teste-de-dosha"
        className="inline-flex items-center gap-2 font-sans font-semibold text-white text-base md:text-lg px-8 py-4 transition-transform hover:-translate-y-0.5"
        style={{
          background: C.pitta,
          borderRadius: LEAF,
          boxShadow: "0 8px 24px rgba(255,118,118,.3)",
        }}
      >
        Faça o Teste de Dosha
        <ArrowRight className="h-5 w-5" />
      </Link>

      <p className="mt-6 text-[13px] text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-1">
        <span>✓ Gratuito</span>
        <span>✓ Resultado imediato</span>
        <span>✓ Sem cadastro</span>
      </p>
    </div>
  </section>
);

/* ============================================================
   Feed Social (marquee)
============================================================ */
type FeedItem = {
  nome_abreviado: string | null;
  dosha_nome: string | null;
  frase_akasha: string | null;
};

const dotColor = (dosha: string | null | undefined) => {
  const d = (dosha || "").toLowerCase();
  if (d.includes("-") || d.includes(" ")) return C.accent; // bidosha
  if (d.startsWith("vata")) return C.vata;
  if (d.startsWith("pitta")) return C.pitta;
  if (d.startsWith("kapha")) return C.kapha;
  return C.accent;
};

const FeedSocial = () => {
  const { data } = useQuery({
    queryKey: ["feed_resultados_index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_resultados")
        .select("nome_abreviado,dosha_nome,frase_akasha")
        .order("created_at", { ascending: false })
        .limit(20);
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
    >
      <div className="marquee-track flex gap-10 whitespace-nowrap">
        {loop.map((it, i) => (
          <span key={i} className="text-white/90 text-sm font-sans inline-flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ background: dotColor(it.dosha_nome) }}
            />
            <strong className="text-white">{it.nome_abreviado}</strong>
            <span className="text-white/70">descobriu:</span>
            <span style={{ color: dotColor(it.dosha_nome) }}>{it.dosha_nome}</span>
            <span className="text-white/60">— "{it.frase_akasha}"</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeX {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeX 60s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

/* ============================================================
   Generic content card (lives + artigos)
============================================================ */
const ContentCard = ({
  image,
  badge,
  title,
  summary,
  href,
  external,
  fallbackBg,
}: {
  image: string | null;
  badge: string | null;
  title: string;
  summary: string | null;
  href: string;
  external: boolean;
  fallbackBg: boolean;
}) => {
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };
  const Wrap: any = external ? "a" : Link;
  const wrapProps = external ? linkProps : { to: href };

  return (
    <Wrap
      {...wrapProps}
      className="group block overflow-hidden bg-card border border-border transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderRadius: LEAF }}
    >
      <div
        className="relative w-full aspect-video overflow-hidden flex items-center justify-center"
        style={
          !image || fallbackBg
            ? { background: `linear-gradient(135deg, ${C.primary}, #1f1a3a)` }
            : undefined
        }
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
      </div>
      <div className="p-5">
        {badge && (
          <span
            className="inline-block text-[11px] font-semibold uppercase tracking-wide mb-2 px-2 py-1 rounded"
            style={{ background: `${C.accent}20`, color: C.primary }}
          >
            {badge}
          </span>
        )}
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
          {external ? "Assistir no YouTube" : "Ler artigo"} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Wrap>
  );
};

const CardSkeleton = () => (
  <div
    className="bg-card border border-border overflow-hidden"
    style={{ borderRadius: LEAF }}
  >
    <div className="w-full aspect-video bg-muted animate-pulse" />
    <div className="p-5 space-y-2">
      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
      <div className="h-4 bg-muted animate-pulse rounded" />
      <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
    </div>
  </div>
);

/* ============================================================
   Lives
============================================================ */
type LiveRow = {
  novo_titulo: string | null;
  mini_resumo: string | null;
  url: string | null;
  tags: string | null;
  criado_em: string | null;
  video_id: string;
};

const firstTag = (tags: string | null | undefined, sep: string | RegExp = /[\n,]/) => {
  if (!tags) return null;
  return tags.split(sep)[0]?.trim() || null;
};

const LivesSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["index_lives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_lives")
        .select("novo_titulo,mini_resumo,url,tags,criado_em,video_id")
        .not("novo_titulo", "is", null)
        .not("url", "is", null)
        .order("criado_em", { ascending: false })
        .limit(60);
      if (error) throw error;
      // dedupe by url
      const seen = new Set<string>();
      const unique: LiveRow[] = [];
      for (const row of (data ?? []) as LiveRow[]) {
        if (row.url && !seen.has(row.url)) {
          seen.add(row.url);
          unique.push(row);
        }
      }
      return unique.slice(0, 6);
    },
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-10">
        <h2
          className="font-serif italic font-bold text-3xl md:text-4xl mb-3"
          style={{ color: C.primary }}
        >
          Ao vivo toda semana
        </h2>
        <p className="text-muted-foreground text-base">
          373 lives transmitidas. Uma nova toda semana às 12h40 no Instagram.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : (data ?? []).map((live) => (
              <ContentCard
                key={live.video_id}
                image={`${STORAGE}/${live.video_id}.webp`}
                badge={firstTag(live.tags)}
                title={live.novo_titulo ?? ""}
                summary={live.mini_resumo}
                href={live.url ?? "#"}
                external
                fallbackBg={false}
              />
            ))}
      </div>
    </section>
  );
};

/* ============================================================
   Artigos
============================================================ */
type ArticleRow = {
  title: string;
  meta_description: string | null;
  image_url: string | null;
  link_do_artigo: string | null;
  tags: string | null;
  created_at: string | null;
};

const ArtigosSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["index_artigos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_conteudo")
        .select("title,meta_description,image_url,link_do_artigo,tags,created_at")
        .not("image_url", "is", null)
        .not("link_do_artigo", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as ArticleRow[];
    },
  });

  return (
    <section style={{ background: C.bgSoft }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl mb-3"
            style={{ color: C.primary }}
          >
            Ayurveda explicado na prática
          </h2>
          <p className="text-muted-foreground text-base">
            Artigos escritos a partir das aulas ao vivo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : (data ?? []).map((art) => (
                <ContentCard
                  key={art.link_do_artigo}
                  image={art.image_url}
                  badge={firstTag(art.tags, ",")}
                  title={art.title}
                  summary={art.meta_description}
                  href={`/blog/${art.link_do_artigo}`}
                  external={false}
                  fallbackBg={false}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Três Doshas (estático)
============================================================ */
const doshaCards = [
  {
    name: "Vata",
    bg: "#EEF1FF",
    border: C.vata,
    badgeBg: C.vata,
    title: "🌬️ Ar + Éter",
    attrs: "Leve · Seco · Rápido · Móvel",
    text: "A energia do movimento e da criatividade. Quando equilibrado, traz leveza e inspiração. É o dosha mais comum em desequilíbrio no mundo moderno.",
    warn: "ansiedade, insônia, gases, pele seca",
  },
  {
    name: "Pitta",
    bg: "#FFF1F0",
    border: C.pitta,
    badgeBg: C.pitta,
    title: "🔥 Fogo + Água",
    attrs: "Quente · Preciso · Intenso · Transformador",
    text: "A energia da transformação e do discernimento. Quando equilibrado, traz foco, liderança e digestão forte. Governa a fase produtiva da vida.",
    warn: "irritação, azia, inflamação, refluxo",
  },
  {
    name: "Kapha",
    bg: "#F0FDF4",
    border: C.kapha,
    badgeBg: C.kapha,
    title: "🪵 Terra + Água",
    attrs: "Denso · Estável · Calmo · Nutritivo",
    text: "A energia da estrutura e da sustentação. Quando equilibrado, traz força, paciência e memória. É a base da construção dos tecidos corporais.",
    warn: "peso excessivo, lentidão, congestionamento",
  },
];

const TresDoshas = () => (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
    <div className="text-center mb-10">
      <h2
        className="font-serif italic font-bold text-3xl md:text-4xl mb-3"
        style={{ color: C.primary }}
      >
        Qual é o seu tipo?
      </h2>
      <p className="text-muted-foreground text-base">
        Ayurveda descreve três forças que compõem tudo — inclusive você.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {doshaCards.map((d) => (
        <div
          key={d.name}
          className="p-6 flex flex-col"
          style={{
            background: d.bg,
            borderLeft: `4px solid ${d.border}`,
            borderRadius: LEAF_ALT,
          }}
        >
          <span
            className="inline-block self-start text-xs font-semibold text-white px-3 py-1 rounded-full mb-4"
            style={{ background: d.badgeBg }}
          >
            {d.name}
          </span>
          <h3
            className="font-serif font-bold text-xl mb-2"
            style={{ color: C.primary, fontStyle: "normal" }}
          >
            {d.title}
          </h3>
          <p className="text-[13px] font-semibold mb-4" style={{ color: d.border }}>
            {d.attrs}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4 flex-1">{d.text}</p>
          <p className="text-xs text-muted-foreground border-t border-black/5 pt-3">
            ⚠ Desequilíbrio: {d.warn}
          </p>
        </div>
      ))}
    </div>

    <div className="text-center mt-10">
      <Link
        to="/teste-de-dosha"
        className="inline-flex items-center gap-2 font-sans font-semibold text-white text-base px-8 py-4 transition-transform hover:-translate-y-0.5"
        style={{
          background: C.pitta,
          borderRadius: LEAF,
          boxShadow: "0 8px 24px rgba(255,118,118,.3)",
        }}
      >
        Descubra o seu Dosha <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  </section>
);

/* ============================================================
   Receitas
============================================================ */
type RecipeRow = {
  novo_titulo: string | null;
  mini_resumo: string | null;
  url: string | null;
  tags: string | null;
  video_id: string;
};

const extractEmoji = (s: string | null | undefined) => {
  if (!s) return "🍲";
  const m = s.match(/\p{Extended_Pictographic}/u);
  return m ? m[0] : "🍲";
};

const ReceitasSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["index_receitas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_receitas")
        .select("novo_titulo,mini_resumo,url,tags,video_id")
        .not("novo_titulo", "is", null)
        .order("criado_em", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? []) as RecipeRow[];
    },
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-10">
        <h2
          className="font-serif italic font-bold text-3xl md:text-4xl mb-3"
          style={{ color: C.primary }}
        >
          Receitas da cozinha ayurvédica
        </h2>
        <p className="text-muted-foreground text-base">
          Fórmulas práticas para o dia a dia.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 animate-pulse h-32"
                style={{ background: C.surface, borderRadius: LEAF }}
              />
            ))
          : (data ?? []).map((r) => (
              <a
                key={r.video_id}
                href={r.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: C.surface, borderRadius: LEAF }}
              >
                <div className="text-4xl shrink-0">{extractEmoji(r.tags)}</div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-serif font-bold text-base mb-1 line-clamp-2"
                    style={{ color: C.primary, fontStyle: "normal" }}
                  >
                    {r.novo_titulo}
                  </h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2 mb-2">
                    {r.mini_resumo}
                  </p>
                  <span
                    className="text-[13px] font-semibold inline-flex items-center gap-1"
                    style={{ color: C.pitta }}
                  >
                    Ver receita <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
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
   Diretório de Terapeutas
============================================================ */
const TerapeutasSection = () => {
  const { data } = useQuery({
    queryKey: ["index_terapeutas_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("portal_terapeutas")
        .select("*", { count: "exact", head: true })
        .eq("status", "aprovado");
      if (error) throw error;
      return count ?? 0;
    },
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2
            className="font-serif font-bold text-2xl md:text-[26px] leading-snug mb-2"
            style={{ color: C.primary, fontStyle: "normal" }}
          >
            Encontre um terapeuta formado pelo Portal Ayurveda
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Profissionais em todo o Brasil.</p>
          <Link
            to="/terapeutas-do-brasil"
            className="inline-flex items-center gap-2 font-sans font-semibold px-6 py-3 transition-all hover:-translate-y-0.5"
            style={{
              background: "transparent",
              border: `2px solid ${C.primary}`,
              color: C.primary,
              borderRadius: LEAF,
            }}
          >
            Ver diretório <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="text-center md:text-right">
          <div
            className="font-serif font-bold leading-none"
            style={{ color: C.kapha, fontSize: "clamp(56px, 9vw, 96px)", fontStyle: "normal" }}
          >
            {data ?? "—"}
          </div>
          <p className="text-[13px] text-muted-foreground mt-2">terapeutas no Brasil</p>
        </div>
      </div>
    </section>
  );
};

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
    "Portal de conhecimento para aprender Ayurveda no Brasil de forma clara, prática e acessível.",
  sameAs: [
    "https://www.youtube.com/@portalayurveda",
    "https://www.instagram.com/edson_ayurveda",
  ],
};

const Index = () => {
  const { doshaResult, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && doshaResult?.idPublico) {
      navigate(`/meu-dosha?id=${doshaResult.idPublico}`, { replace: true });
    }
  }, [loading, doshaResult, navigate]);

  return (
    <>
      <Helmet>
        <title>Portal Ayurveda — Aprenda Ayurveda no Brasil</title>
        <meta
          name="description"
          content="O maior portal de Ayurveda do Brasil. Aprenda na prática com aulas ao vivo, artigos, receitas ayurvédicas e o teste de dosha gratuito."
        />
        <meta property="og:title" content="Portal Ayurveda — Aprenda Ayurveda no Brasil" />
        <meta
          property="og:description"
          content="Mais de 1.600 pessoas já descobriram seu dosha. Teste gratuito, aulas ao vivo toda semana e conteúdo prático."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>

      <Hero />
      <FeedSocial />
      <LivesSection />
      <ArtigosSection />
      <TresDoshas />
      <ReceitasSection />
      <SamkhyaBanner />
      <TerapeutasSection />
    </>
  );
};

export default Index;
