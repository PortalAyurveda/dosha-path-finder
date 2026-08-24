import { samkhyaTokens } from "./tokens";
import { useFreteGratisConfig } from "@/hooks/useFreteGratisConfig";

interface PrecoDisplayProps {
  precoNormal: number;
  precoPix: number;
  showParcelas?: boolean;
  size?: "sm" | "md" | "lg";
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PrecoDisplay = ({ precoNormal, precoPix, showParcelas = false, size = "md" }: PrecoDisplayProps) => {
  const { data: config } = useFreteGratisConfig();
  const pctCampanha = config?.desconto_vitrine_pct ?? null;

  // Há desconto Pix real só quando o preço Pix é MENOR que o normal
  const temDescontoPix = precoPix < precoNormal;
  // Campanha só entra quando NÃO há desconto de catálogo real
  const campanhaAtiva = !temDescontoPix && pctCampanha != null;
  const precoCampanha = campanhaAtiva
    ? Math.round(precoPix * (1 - (pctCampanha as number) / 100) * 100) / 100
    : precoPix;

  // Preço a destacar
  const precoPrincipal = temDescontoPix ? precoPix : campanhaAtiva ? precoCampanha : precoNormal;
  const parcela = precoNormal / 3;

  const pixSizeClass = size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  const normalSizeClass = size === "lg" ? "text-base" : "text-sm";
  const helvetica = samkhyaTokens.fonteCorpo;

  return (
    <div className="flex flex-col gap-1" style={{ fontFamily: helvetica }}>
      {/* Preço riscado: desconto Pix real ou campanha da vitrine */}
      {(temDescontoPix || campanhaAtiva) && (
        <span
          className={`${normalSizeClass} line-through`}
          style={{ color: samkhyaTokens.textoSec, fontFamily: helvetica }}
        >
          {formatBRL(temDescontoPix ? precoNormal : precoPix)}
        </span>
      )}
      <span
        className={`${pixSizeClass} leading-none`}
        style={{ color: samkhyaTokens.roxo, fontFamily: helvetica, fontWeight: 600 }}
      >
        {formatBRL(precoPrincipal)}
        {/* "no Pix" só quando há desconto Pix real */}
        {temDescontoPix && (
          <>
            {" "}
            <span
              className={`${normalSizeClass}`}
              style={{ color: samkhyaTokens.roxoDark, fontFamily: helvetica, fontWeight: 500 }}
            >
              no Pix
            </span>
          </>
        )}
        {campanhaAtiva && (
          <>
            {" "}
            <span
              className="ml-1 inline-block rounded px-1.5 py-0.5 align-middle text-[0.65rem] font-semibold uppercase tracking-wide"
              style={{ color: "#FF7676", background: "#FF767622", fontFamily: helvetica }}
            >
              {pctCampanha}% OFF
            </span>
          </>
        )}
      </span>
      {showParcelas && (
        <span className="text-xs" style={{ color: samkhyaTokens.textoSec, fontFamily: helvetica }}>
          ou 3x de {formatBRL(parcela)} sem juros
        </span>
      )}
    </div>
  );
};

export default PrecoDisplay;
