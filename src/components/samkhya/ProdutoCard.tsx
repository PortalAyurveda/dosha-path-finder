import { Link } from "react-router-dom";
import PrecoDisplay from "./PrecoDisplay";
import { samkhyaTokens } from "./tokens";
import type { LojaProdutoComCategorias } from "@/integrations/supabase/loja-client";

interface ProdutoCardProps {
  produto: LojaProdutoComCategorias;
}

const ProdutoCard = ({ produto }: ProdutoCardProps) => {
  const isGold = produto.produto_categorias?.some((pc) => pc.categorias?.slug === "gold");

  return (
    <Link
      to={`/samkhya/produto/${produto.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden transition-all hover:-translate-y-0.5"
      style={{
        background: samkhyaTokens.cardBg,
        border: `1px solid ${samkhyaTokens.cardBorder}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative aspect-square bg-white p-6 flex items-center justify-center overflow-hidden">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome_display}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-sm" style={{ color: samkhyaTokens.textoSec }}>
            Sem imagem
          </div>
        )}
        {isGold && (
          <span
            className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white"
            style={{ background: samkhyaTokens.goldBadge }}
          >
            GOLD
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3
          className="text-lg leading-tight"
          style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {produto.nome_display}
        </h3>
        <PrecoDisplay precoNormal={Number(produto.preco_normal)} precoPix={Number(produto.preco_pix)} />
        <span
          className="mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ background: samkhyaTokens.ouro }}
        >
          Comprar
        </span>
      </div>
    </Link>
  );
};

export default ProdutoCard;
