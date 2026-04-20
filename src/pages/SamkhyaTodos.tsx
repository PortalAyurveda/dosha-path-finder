import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { lojaSupabase, type LojaProduto } from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import MinimalProductCard from "@/components/samkhya/MinimalProductCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const SamkhyaTodos = () => {
  const [produtos, setProdutos] = useState<LojaProduto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await lojaSupabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("ordem_exibicao", { ascending: true, nullsFirst: false })
        .order("nome_display", { ascending: true });
      if (cancelled) return;
      setProdutos(((data ?? []) as unknown) as LojaProduto[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Todos os Produtos — Loja Samkhya</title>
        <meta
          name="description"
          content="Catálogo completo da Loja Samkhya — todos os produtos ayurvédicos disponíveis."
        />
      </Helmet>

      <SamkhyaLayout>
        <Link
          to="/samkhya"
          className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
          style={{ color: samkhyaTokens.roxo }}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para a loja
        </Link>

        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl italic font-light tracking-wide"
            style={{
              color: samkhyaTokens.roxo,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            ✦ Todos os Produtos ✦
          </h1>
          <p className="mt-3 text-base" style={{ color: samkhyaTokens.textoSec }}>
            Catálogo completo — explore toda a linha Samkhya.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm animate-pulse"
                style={{ background: samkhyaTokens.roxoLight }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {produtos.map((p) => (
              <MinimalProductCard
                key={p.id}
                slug={p.slug}
                nome={p.nome_display}
                precoPix={Number(p.preco_pix)}
                imagemUrl={p.imagem_url}
                resumoCurto={p.resumo_curto ?? null}
              />
            ))}
          </div>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaTodos;
