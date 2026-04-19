import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  lojaSupabase,
  type LojaProdutoComCategorias,
  type LojaKit,
} from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import CarouselSection from "@/components/samkhya/CarouselSection";
import MinimalProductCard from "@/components/samkhya/MinimalProductCard";
import KitCard from "@/components/samkhya/KitCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const DESTAQUES_SLUGS = ["tonico-forca", "panaceia-desidratada", "madhu-vata"];

const SkeletonRow = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="aspect-square rounded-sm animate-pulse"
        style={{ background: samkhyaTokens.roxoLight }}
      />
    ))}
  </div>
);

const Samkhya = () => {
  const [destaques, setDestaques] = useState<LojaProdutoComCategorias[]>([]);
  const [rejuvenescimento, setRejuvenescimento] = useState<LojaProdutoComCategorias[]>([]);
  const [detox, setDetox] = useState<LojaProdutoComCategorias[]>([]);
  const [gold, setGold] = useState<LojaProdutoComCategorias[]>([]);
  const [kits, setKits] = useState<LojaKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const fetchByCat = (slug: string) =>
        lojaSupabase
          .from("produtos")
          .select(`*, produto_categorias!inner ( categorias!inner ( slug, nome ) )`)
          .eq("ativo", true)
          .eq("produto_categorias.categorias.slug", slug)
          .order("ordem_exibicao", { ascending: true, nullsFirst: false })
          .limit(3);

      const [destRes, rejRes, detoxRes, goldRes, kitsRes] = await Promise.all([
        lojaSupabase
          .from("produtos")
          .select("*")
          .in("slug", DESTAQUES_SLUGS)
          .eq("ativo", true),
        fetchByCat("rejuvenescimento"),
        fetchByCat("detox"),
        fetchByCat("gold"),
        lojaSupabase
          .from("kits")
          .select("*")
          .eq("ativo", true)
          .order("ordem_exibicao", { ascending: true, nullsFirst: false })
          .limit(3),
      ]);

      if (cancelled) return;

      if (destRes.data) {
        // Manter ordem fixa de DESTAQUES_SLUGS
        const map = new Map(
          (destRes.data as unknown as LojaProdutoComCategorias[]).map((p) => [p.slug, p]),
        );
        setDestaques(DESTAQUES_SLUGS.map((s) => map.get(s)).filter(Boolean) as LojaProdutoComCategorias[]);
      }
      if (rejRes.data) setRejuvenescimento(rejRes.data as unknown as LojaProdutoComCategorias[]);
      if (detoxRes.data) setDetox(detoxRes.data as unknown as LojaProdutoComCategorias[]);
      if (goldRes.data) setGold(goldRes.data as unknown as LojaProdutoComCategorias[]);
      if (kitsRes.data) setKits(kitsRes.data as unknown as LojaKit[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll to kits section if hash present
  useEffect(() => {
    if (window.location.hash === "#kits") {
      const el = document.getElementById("kits");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [loading]);

  const renderProducts = (list: LojaProdutoComCategorias[]) =>
    list.map((p) => (
      <MinimalProductCard
        key={p.id}
        slug={p.slug}
        nome={p.nome_display}
        precoPix={Number(p.preco_pix)}
        imagemUrl={p.imagem_url}
      />
    ));

  return (
    <>
      <Helmet>
        <title>Loja Samkhya — Produtos Ayurvédicos Artesanais</title>
        <meta
          name="description"
          content="Loja oficial Samkhya: madhus, tônicos, kits e linha GOLD formulados por terapeutas ayurvédicos."
        />
      </Helmet>

      <SamkhyaLayout>
        {loading ? (
          <>
            <div className="text-center py-10">
              <div
                className="inline-block h-8 w-48 rounded animate-pulse"
                style={{ background: samkhyaTokens.roxoLight }}
              />
            </div>
            <SkeletonRow />
          </>
        ) : (
          <>
            <CarouselSection title="Destaques">
              {renderProducts(destaques)}
            </CarouselSection>

            <CarouselSection
              title="Rejuvenescimento"
              to="/samkhya/categoria/rejuvenescimento"
            >
              {renderProducts(rejuvenescimento)}
            </CarouselSection>

            <CarouselSection title="Detox" to="/samkhya/categoria/detox">
              {renderProducts(detox)}
            </CarouselSection>

            <CarouselSection title="Linha GOLD" to="/samkhya/categoria/gold">
              {renderProducts(gold)}
            </CarouselSection>

            <section id="kits" className="py-10 md:py-14 scroll-mt-32">
              <div className="text-center mb-8">
                <h2
                  className="text-2xl md:text-3xl italic font-light tracking-wide"
                  style={{
                    color: samkhyaTokens.roxo,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  ✦ Kits & Combos ✦
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kits.map((k) => (
                  <KitCard key={k.id} kit={k} />
                ))}
              </div>
            </section>
          </>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default Samkhya;
