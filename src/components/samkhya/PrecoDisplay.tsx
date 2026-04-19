import { samkhyaTokens } from "./tokens";

interface PrecoDisplayProps {
  precoNormal: number;
  precoPix: number;
  showParcelas?: boolean;
  size?: "sm" | "md" | "lg";
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PrecoDisplay = ({ precoNormal, precoPix, showParcelas = false, size = "md" }: PrecoDisplayProps) => {
  const parcela = precoNormal / 3;

  const pixSizeClass = size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  const normalSizeClass = size === "lg" ? "text-base" : "text-sm";

  return (
    <div className="flex flex-col gap-1">
      <span className={`${normalSizeClass} line-through`} style={{ color: samkhyaTokens.textoSec }}>
        {formatBRL(precoNormal)}
      </span>
      <span className={`${pixSizeClass} font-bold leading-none`} style={{ color: samkhyaTokens.ouro }}>
        {formatBRL(precoPix)}{" "}
        <span className={`${normalSizeClass} font-medium`} style={{ color: samkhyaTokens.ouroDark }}>
          no Pix
        </span>
      </span>
      {showParcelas && (
        <span className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
          ou 3x de {formatBRL(parcela)} sem juros
        </span>
      )}
    </div>
  );
};

export default PrecoDisplay;
