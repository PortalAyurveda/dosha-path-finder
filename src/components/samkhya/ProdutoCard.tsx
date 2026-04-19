import { Link } from "react-router-dom";
import { useState } from "react";
import PrecoDisplay from "./PrecoDisplay";
import { samkhyaTokens } from "./tokens";
import type { LojaProdutoComCategorias } from "@/integrations/supabase/loja-client";

interface ProdutoCardProps {
  produto: LojaProdutoComCategorias;
}

const ProdutoCard = ({ produto }: ProdutoCardProps) => {
  const [hover, setHover] = useState(false);
  const isGold = produto.produto_categorias?.some((pc) => pc.categorias?.slug === "gold");

  return (
    <Link
      to={`/samkhya/produto/${produto.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex flex-col rounded-lg overflow-hidden"
      style={{
        background: samkhyaTokens.cardBg,
        border: `1px solid ${samkhyaTokens.cardBorder}`,
        boxShadow: hover ? "0 4px 12px rgba(123,73,99,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.2s, box-shadow 0.2s",
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
            className="absolute top-3 right-3 rounded px-2 py-1 text-xs font-bold tracking-wide uppercase text-white"
            style={{ background: samkhyaTokens.goldBadge }}
          >
            GOLD
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 text-center">
        <h3
          className="text-lg leading-snug"
          style={{ color: samkhyaTokens.texto, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {produto.nome_display}
        </h3>
        <div className="flex items-center justify-center">
          <PrecoDisplay precoNormal={Number(produto.preco_normal)} precoPix={Number(produto.preco_pix)} />
        </div>
        <span
          className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white w-full transition-colors"
          style={{
            background: hover ? samkhyaTokens.ouroDark : samkhyaTokens.ouro,
          }}
        >
          Comprar
        </span>
      </div>
    </Link>
  );
};

export default ProdutoCard;
