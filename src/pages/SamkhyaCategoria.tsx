import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import {
  lojaSupabase,
  type LojaProdutoComCategorias,
  type LojaCategoria,
} from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import MinimalProductCard from "@/components/samkhya/MinimalProductCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const SamkhyaCategoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [produtos, setProdutos] = useState<LojaProdutoComCategorias[]>([]);
  const [categoria, setCategoria] = useState<LojaCategoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        lojaSupabase.from("categorias").select("*").eq("slug", slug).maybeSingle(),
        lojaSupabase
          .from("produtos")
          .select(`*, produto_categorias!inner ( categorias!inner ( slug, nome ) )`)
          .eq("ativo", true)
          .eq("produto_categorias.categorias.slug", slug)
          .order("ordem_exibicao", { ascending: true, nullsFirst: false }),
      ]);
      if (cancelled) return;
      if (catRes.data) setCategoria(catRes.data as unknown as LojaCategoria);
      if (prodRes.data) setProdutos(prodRes.data as unknown as LojaProdutoComCategorias[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const titulo = categoria?.nome ?? slug;

  return (
    <>
      <Helmet>
        <title>{titulo} — Loja Samkhya</title>
        <meta
          name="description"
          content={`Produtos ayurvédicos da categoria ${titulo} — Loja Samkhya.`}
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
            ✦ {titulo} ✦
          </h1>
          {categoria?.descricao && (
            <p className="mt-3 text-base" style={{ color: samkhyaTokens.textoSec }}>
              {categoria.descricao}
            </p>
          )}
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
        ) : produtos.length === 0 ? (
          <p className="text-center" style={{ color: samkhyaTokens.textoSec }}>
            Nenhum produto nesta categoria ainda.
          </p>
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

export default SamkhyaCategoria;
