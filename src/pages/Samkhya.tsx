import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { lojaSupabase, type LojaProdutoComCategorias, type LojaKit } from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import ProdutoCard from "@/components/samkhya/ProdutoCard";
import KitCard from "@/components/samkhya/KitCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const PAGE_SIZE = 12;

const Samkhya = () => {
  const [params] = useSearchParams();
  const cat = params.get("cat") ?? "todos";

  const [produtos, setProdutos] = useState<LojaProdutoComCategorias[]>([]);
  const [kits, setKits] = useState<LojaKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [prodRes, kitRes] = await Promise.all([
        lojaSupabase
          .from("produtos")
          .select(`*, produto_categorias ( categorias ( slug, nome ) )`)
          .eq("ativo", true)
          .order("ordem_exibicao", { ascending: true, nullsFirst: false }),
        lojaSupabase
          .from("kits")
          .select("*")
          .eq("ativo", true)
          .order("ordem_exibicao", { ascending: true, nullsFirst: false }),
      ]);
      if (cancelled) return;
      if (prodRes.data) setProdutos(prodRes.data as unknown as LojaProdutoComCategorias[]);
      if (kitRes.data) setKits(kitRes.data as unknown as LojaKit[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setPage(1), [cat]);

  const filtrados = useMemo(() => {
    if (cat === "todos" || cat === "kits") return produtos;
    return produtos.filter((p) =>
      p.produto_categorias?.some((pc) => pc.categorias?.slug === cat),
    );
  }, [produtos, cat]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Scroll to kits section if hash present
  useEffect(() => {
    if (window.location.hash === "#kits") {
      const el = document.getElementById("kits");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [cat]);

  return (
    <>
      <Helmet>
        <title>Loja Samkhya — Produtos Ayurvédicos Artesanais</title>
        <meta
          name="description"
          content="Loja oficial Samkhya: produtos ayurvédicos formulados por terapeutas. Madhus, massalas, kits e linha GOLD."
        />
      </Helmet>

      <SamkhyaLayout>
        {/* Grid de produtos */}
        <section aria-labelledby="produtos-titulo">
          <h1
            id="produtos-titulo"
            className="text-3xl md:text-4xl mb-6"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {cat === "todos" || cat === "kits" ? "Todos os Produtos" : `Produtos para ${cat[0].toUpperCase()}${cat.slice(1)}`}
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-lg animate-pulse"
                  style={{ background: samkhyaTokens.roxoLight }}
                />
              ))}
            </div>
          ) : paginados.length === 0 ? (
            <p style={{ color: samkhyaTokens.textoSec }}>Nenhum produto nesta categoria ainda.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginados.map((p) => (
                  <ProdutoCard key={p.id} produto={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPage(i + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-10 h-10 rounded-md text-sm font-semibold transition-colors"
                      style={{
                        background: page === i + 1 ? samkhyaTokens.roxo : "transparent",
                        color: page === i + 1 ? "#fff" : samkhyaTokens.roxo,
                        border: `1px solid ${samkhyaTokens.roxo}`,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Seção Kits & Combos */}
        <section id="kits" className="mt-16 md:mt-24 pt-8" aria-labelledby="kits-titulo">
          <h2
            id="kits-titulo"
            className="text-3xl md:text-4xl mb-6"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Kits & Combos
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-lg animate-pulse"
                  style={{ background: samkhyaTokens.roxoLight }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.map((k) => (
                <KitCard key={k.id} kit={k} />
              ))}
            </div>
          )}
        </section>
      </SamkhyaLayout>
    </>
  );
};

export default Samkhya;
