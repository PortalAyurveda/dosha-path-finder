import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

interface MinimalProductCardProps {
  slug: string;
  nome: string;
  precoPix: number;
  imagemUrl: string | null;
  resumoCurto?: string | null;
  to?: string;
}

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MinimalProductCard = ({ slug, nome, precoPix, imagemUrl, resumoCurto, to }: MinimalProductCardProps) => {
  return (
    <Link
      to={to ?? `/samkhya/produto/${slug}`}
      className="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="aspect-square w-full flex items-center justify-center p-4 overflow-hidden">
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
        className="mt-3 font-bold"
        style={{
          color: samkhyaTokens.roxoDark,
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          fontSize: "15px",
        }}
      >
        {nome}
      </h3>
      {resumoCurto && (
        <p
          className="mt-1 px-2 line-clamp-2"
          style={{
            color: samkhyaTokens.textoSec,
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontSize: "12px",
            lineHeight: 1.35,
          }}
        >
          {resumoCurto}
        </p>
      )}
      <p
        className="mt-1"
        style={{
          color: samkhyaTokens.roxo,
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        {formatBRL(precoPix)}
      </p>
    </Link>
  );
};

export default MinimalProductCard;
