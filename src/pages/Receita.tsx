import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import BannerSlot from "@/components/banners/BannerSlot";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const PAPER = "#FDFBF5";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Ingrediente {
  qtd?: string;
  item?: string;
  quantidade?: string;
  nome?: string;
}

interface DravyaGuna {
  rasa?: string | string[];
  gunas?: string | string[];
  karma?: string | string[];
  virya?: string | null;
}

interface NuggetJson {
  resumo?: string;
  ingredientes?: Ingrediente[];
  modo_preparo?: string[];
  efeito_esperado?: string;
  dicas?: string;
  dravya_guna?: DravyaGuna;
  vata?: number;
  pitta?: number;
  kapha?: number;
}

interface ReceitaRecord {
  id: string;
  slug: string | null;
  titulo: string;
  imagem_url: string | null;
  categoria: string | null;
  nugget_json: NuggetJson | null;
}

const truncate = (text: string, max: number) => {
  if (!text || text.length <= max) return text || "";
  const cut = text.slice(0, max).lastIndexOf(" ");
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, max)) + "…";
};

const Receita = () => {
  const { slug } = useParams<{ slug: string }>();
  const rawSlug = slug ?? "";
  const isUuid = UUID_RE.test(rawSlug);

  const { data, isLoading } = useQuery<ReceitaRecord | null>({
    queryKey: ["receita", rawSlug],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("rotina_nuggets")
        .select("id, slug, titulo, imagem_url, categoria, nugget_json")
        .eq(isUuid ? "id" : "slug", rawSlug)
        .maybeSingle();

      if (error) throw error;
      return row as ReceitaRecord | null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!rawSlug,
  });

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Receita | Portal Ayurveda</title>
        </Helmet>
        <div className="max-w-[720px] mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="aspect-[16/9] bg-muted rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Receita não encontrada</h1>
        <Link to="/biblioteca" className="text-primary hover:underline">← Ver a biblioteca</Link>
      </div>
    );
  }

  if (isUuid && data.slug) {
    return <Navigate to={`/receita/${data.slug}`} replace />;
  }

  const nj = data.nugget_json ?? {};
  const ingredientes: Ingrediente[] = Array.isArray(nj.ingredientes) ? nj.ingredientes : [];
  const modoPreparo: string[] = Array.isArray(nj.modo_preparo) ? nj.modo_preparo : [];
  const dg = nj.dravya_guna ?? {};
  const rasa: string[] = Array.isArray(dg.rasa) ? dg.rasa : dg.rasa ? [String(dg.rasa)] : [];
  const gunas: string[] = Array.isArray(dg.gunas) ? dg.gunas : dg.gunas ? [String(dg.gunas)] : [];
  const karma: string[] = Array.isArray(dg.karma) ? dg.karma : dg.karma ? [String(dg.karma)] : [];
  const virya = dg.virya ?? null;

  const doshaChip = (label: string, valor: number | undefined, bg: string) => {
    const n = Number(valor);
    if (!Number.isFinite(n) || n === 0) return null;
    const sinal = n > 0 ? `+${n}` : `${n}`;
    return (
      <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold" style={{ background: `${bg}22`, color: PRIMARY }}>
        <span className="w-2 h-2 rounded-full" style={{ background: bg }} />
        {label} {sinal.replace("-", "−")}
      </span>
    );
  };

  const temPorQue = rasa.length || gunas.length || karma.length || virya || Number(nj.vata) || Number(nj.pitta) || Number(nj.kapha);

  const canonicalSlug = data.slug ?? rawSlug;
  const canonicalUrl = `https://portalayurveda.com/receita/${canonicalSlug}`;
  const description = truncate(nj.resumo ?? "", 160);
  const imageUrl = data.imagem_url ?? "https://portalayurveda.com/og-image.jpg";

  const recipeIngredients = ingredientes.map((ing) => {
    const q = ing.qtd ?? ing.quantidade ?? "";
    const nm = ing.item ?? ing.nome ?? "";
    return `${q}${q && nm ? " " : ""}${nm}`.trim();
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: data.titulo,
    image: imageUrl,
    description: description,
    recipeCategory: data.categoria ?? "Receita Ayurveda",
    recipeIngredient: recipeIngredients,
    recipeInstructions: modoPreparo.map((passo) => ({ "@type": "HowToStep", text: passo })),
    author: { "@type": "Organization", name: "Portal Ayurveda" },
  };

  return (
    <>
      <Helmet>
        <title>{data.titulo} | Portal Ayurveda</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${data.titulo} | Portal Ayurveda`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.titulo} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="max-w-[720px] mx-auto px-4 py-8">
        {data.imagem_url ? (
          <img
            src={getTransformedImageUrl(data.imagem_url, 900)}
            alt={data.titulo}
            width={900}
            height={900}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-[260px] md:h-[340px] object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-[260px] md:h-[340px] rounded-2xl" style={{ background: PAPER }} />
        )}

        <div className="py-6 md:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <h1 className="font-serif font-bold text-3xl md:text-4xl leading-snug mb-3" style={{ color: PRIMARY }}>
            {data.titulo}
          </h1>

          {nj.resumo ? (
            <p className="text-base leading-relaxed mb-6" style={{ color: PRIMARY, opacity: 0.85 }}>
              {nj.resumo}
            </p>
          ) : null}

          {ingredientes.length ? (
            <section className="mb-6">
              <h2 className="font-serif text-xl font-bold mb-3" style={{ color: PRIMARY }}>Ingredientes</h2>
              <ul className="space-y-2 text-base" style={{ color: PRIMARY, opacity: 0.9 }}>
                {ingredientes.map((ing, i) => {
                  const q = ing.qtd ?? ing.quantidade ?? "";
                  const nm = ing.item ?? ing.nome ?? "";
                  return (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SALMAO }} />
                      <span><span className="font-semibold">{q}</span>{q && nm ? " — " : ""}{nm}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {modoPreparo.length ? (
            <section className="mb-6">
              <h2 className="font-serif text-xl font-bold mb-3" style={{ color: PRIMARY }}>Modo de preparo</h2>
              <ol className="space-y-2 text-base list-decimal pl-6" style={{ color: PRIMARY, opacity: 0.9 }}>
                {modoPreparo.map((p, i) => <li key={i} className="leading-relaxed pl-1">{p}</li>)}
              </ol>
            </section>
          ) : null}

          {nj.efeito_esperado ? (
            <section className="mb-6">
              <h2 className="font-serif text-xl font-bold mb-3" style={{ color: PRIMARY }}>O que ela faz por você</h2>
              <p className="text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.9 }}>{nj.efeito_esperado}</p>
            </section>
          ) : null}

          {nj.dicas ? (
            <section className="mb-6 rounded-lg p-4 border" style={{ borderColor: `${SALMAO}44`, background: `${SALMAO}0F` }}>
              <h2 className="font-serif text-xl font-bold mb-2" style={{ color: PRIMARY }}>Dica</h2>
              <p className="text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.9 }}>{nj.dicas}</p>
            </section>
          ) : null}

          <BannerSlot slot="receita_meio" minHeight={0} className="[&:empty]:hidden my-6" />

          {temPorQue ? (
            <section className="mb-6">
              <h2 className="font-serif text-xl font-bold mb-3" style={{ color: PRIMARY }}>Por que essa receita</h2>
              <dl className="text-base space-y-2" style={{ color: PRIMARY, opacity: 0.9 }}>
                {rasa.length ? (<div><dt className="inline font-semibold">Sabor: </dt><dd className="inline">{rasa.join(", ")}</dd></div>) : null}
                {virya ? (<div><dt className="inline font-semibold">Potência: </dt><dd className="inline">{virya}</dd></div>) : null}
                {gunas.length ? (<div><dt className="inline font-semibold">Qualidades: </dt><dd className="inline">{gunas.join(", ")}</dd></div>) : null}
                {karma.length ? (<div><dt className="inline font-semibold">Ações: </dt><dd className="inline">{karma.join(", ")}</dd></div>) : null}
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {doshaChip("V", nj.vata, "#6B8FE8")}
                {doshaChip("P", nj.pitta, "#F0857F")}
                {doshaChip("K", nj.kapha, "#57BE86")}
              </div>
            </section>
          ) : null}

          <BannerSlot slot="receita_fim" minHeight={0} className="[&:empty]:hidden mt-8" />
        </div>
      </article>
    </>
  );
};

export default Receita;
