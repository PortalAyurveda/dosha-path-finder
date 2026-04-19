import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

interface MinimalProductCardProps {
  slug: string;
  nome: string;
  precoPix: number;
  imagemUrl: string | null;
  to?: string;
}

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MinimalProductCard = ({ slug, nome, precoPix, imagemUrl, to }: MinimalProductCardProps) => {
  return (
    <Link
      to={to ?? `/samkhya/produto/${slug}`}
      className="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02]"
    >
      <div
        className="aspect-square w-full flex items-center justify-center p-4 rounded-sm overflow-hidden"
        style={{ background: "#FFFFFF" }}
      >
        {imagemUrl ? (
          <img
            src={imagemUrl}
            alt={nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
            Sem imagem
          </span>
        )}
      </div>
      <h3
        className="mt-3 text-base italic"
        style={{
          color: samkhyaTokens.texto,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {nome}
      </h3>
      <p
        className="mt-1 text-sm font-medium"
        style={{ color: samkhyaTokens.ouro }}
      >
        {formatBRL(precoPix)}
      </p>
    </Link>
  );
};

export default MinimalProductCard;
