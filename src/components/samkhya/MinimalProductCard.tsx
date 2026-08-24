import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";
import { useFreteGratisConfig } from "@/hooks/useFreteGratisConfig";

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
  const { data: config } = useFreteGratisConfig();
  const pct = config?.desconto_vitrine_pct ?? null;
  const precoExibido = pct != null ? Math.round(precoPix * (1 - pct / 100) * 100) / 100 : precoPix;

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
              decoding="async"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
            Sem imagem
          </span>
        )}
      </div>
      <h3
        className="mt-3"
        style={{
          color: samkhyaTokens.roxo,
          fontFamily: samkhyaTokens.fonteCorpo,
          fontSize: "18px",
          fontWeight: 600,
          fontStyle: "normal",
        }}
      >
        {nome}
      </h3>
      {resumoCurto && (
        <p
          className="mt-1 px-2 line-clamp-2"
          style={{
            color: samkhyaTokens.textoSec,
            fontFamily: samkhyaTokens.fonteCorpo,
            fontSize: "13px",
            lineHeight: 1.35,
          }}
        >
          {resumoCurto}
        </p>
      )}
      {pct != null && (
        <p
          className="mt-1 line-through"
          style={{
            color: samkhyaTokens.textoSec,
            fontFamily: samkhyaTokens.fonteCorpo,
            fontSize: "12px",
          }}
        >
          {formatBRL(precoExibido)}
        </p>
      )}
      <p
        className={pct != null ? "" : "mt-1"}
        style={{
          color: samkhyaTokens.roxo,
          fontFamily: samkhyaTokens.fonteCorpo,
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        {formatBRL(precoExibido)}
      </p>
    </Link>
  );
};

export default MinimalProductCard;
