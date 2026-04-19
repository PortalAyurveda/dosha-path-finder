import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  lojaSupabase,
  type LojaProdutoComCategorias,
  type SamkhyaClinico,
} from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import PrecoDisplay from "@/components/samkhya/PrecoDisplay";
import BotaoWhatsApp from "@/components/samkhya/BotaoWhatsApp";
import BotaoStripe from "@/components/samkhya/BotaoStripe";
import TabsConteudo from "@/components/samkhya/TabsConteudo";
import TagsPropriedades from "@/components/samkhya/TagsPropriedades";
import MinimalProductCard from "@/components/samkhya/MinimalProductCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const SamkhyaProduto = () => {
  const { slug } = useParams<{ slug: string }>();
  const [produto, setProduto] = useState<LojaProdutoComCategorias | null>(null);
  const [clinico, setClinico] = useState<SamkhyaClinico | null>(null);
  const [relacionados, setRelacionados] = useState<LojaProdutoComCategorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);

      const { data: prod } = await lojaSupabase
        .from("produtos")
        .select(`*, produto_categorias ( categorias ( slug, nome ) )`)
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();

      if (cancelled) return;

      if (!prod) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const produtoTyped = prod as unknown as LojaProdutoComCategorias;
      setProduto(produtoTyped);

      // Conteúdo clínico (schema public)
      if (produtoTyped.samkhya_id) {
        const { data: clin, error: clinErr } = await supabase
          .from("samkhya")
          .select(`"O que é", "Indicações", "Posologia", "Efeitos esperados", "Ingredientes"`)
          .eq("id", produtoTyped.samkhya_id)
          .maybeSingle();
        if (clinErr) console.warn("[Samkhya clínico]", clinErr);
        if (!cancelled && clin) setClinico(clin as unknown as SamkhyaClinico);
      }

      // Relacionados — mesma 1ª categoria, exceto o atual
      const primeiraCategoriaSlug = produtoTyped.produto_categorias?.[0]?.categorias?.slug;
      if (primeiraCategoriaSlug) {
        const { data: relRaw } = await lojaSupabase
          .from("produtos")
          .select(`*, produto_categorias!inner ( categorias!inner ( slug, nome ) )`)
          .eq("ativo", true)
          .eq("produto_categorias.categorias.slug", primeiraCategoriaSlug)
          .neq("slug", slug)
          .limit(3);
        if (!cancelled && relRaw) {
          setRelacionados(relRaw as unknown as LojaProdutoComCategorias[]);
        }
      }

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <Helmet>
        <title>{produto ? `${produto.nome_display} — Loja Samkhya` : "Produto — Loja Samkhya"}</title>
        {produto && (
          <meta
            name="description"
            content={`${produto.nome_display} — produto Ayurvédico Samkhya. Compre via WhatsApp.`}
          />
        )}
      </Helmet>

      <SamkhyaLayout>
        <Link
          to="/samkhya"
          className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
          style={{ color: samkhyaTokens.roxo }}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para a loja
        </Link>

        {loading ? (
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-square rounded-lg" style={{ background: samkhyaTokens.roxoLight }} />
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded" style={{ background: samkhyaTokens.roxoLight }} />
              <div className="h-6 w-1/3 rounded" style={{ background: samkhyaTokens.roxoLight }} />
              <div className="h-32 rounded" style={{ background: samkhyaTokens.roxoLight }} />
            </div>
          </div>
        ) : notFound || !produto ? (
          <p style={{ color: samkhyaTokens.textoSec }}>
            Produto não encontrado. <Link to="/samkhya" className="underline">Voltar à loja</Link>.
          </p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Foto */}
              <div
                className="aspect-square rounded-lg flex items-center justify-center p-8 md:p-12"
                style={{
                  background: samkhyaTokens.cardBg,
                  border: `1px solid ${samkhyaTokens.cardBorder}`,
                }}
              >
                {produto.imagem_url ? (
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome_display}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span style={{ color: samkhyaTokens.textoSec }}>Sem imagem</span>
                )}
              </div>

              {/* Info + compra */}
              <div className="flex flex-col gap-6">
                <h1
                  className="text-4xl md:text-5xl leading-tight"
                  style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {produto.nome_display}
                </h1>

                <div
                  className="rounded-lg p-6"
                  style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
                >
                  <PrecoDisplay
                    precoNormal={Number(produto.preco_normal)}
                    precoPix={Number(produto.preco_pix)}
                    showParcelas
                    size="lg"
                  />
                  <div className="mt-6 flex flex-col gap-3">
                    <BotaoWhatsApp produtoNome={produto.nome_display} size="lg" fullWidth />
                    <BotaoStripe size="lg" fullWidth />
                  </div>
                </div>

                <TabsConteudo clinico={clinico} />
              </div>
            </div>

            {relacionados.length > 0 && (
              <section className="mt-16 md:mt-24" aria-labelledby="relacionados">
                <div className="text-center mb-8">
                  <h2
                    id="relacionados"
                    className="text-2xl md:text-3xl italic font-light tracking-wide"
                    style={{
                      color: samkhyaTokens.roxo,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    ✦ Você também pode gostar ✦
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {relacionados.map((p) => (
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
              </section>
            )}
          </>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaProduto;
