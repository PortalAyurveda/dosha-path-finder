import { Link } from "react-router-dom";
import { brl, brlSemCentavos, useCashBlack } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

/** Quadro abaixo do preço na página do produto/kit. */
export const CashBlackProduto = ({ slug, precoNormal, precoPix }: { slug: string; precoNormal: number; precoPix: number }) => {
  const { ativa } = useCashBlack();
  if (!ativa) return null;
  return (
    <div className="space-y-2" style={{ fontFamily: samkhyaTokens.fonteCorpo }}>
      <div className="rounded-lg px-4 py-3 text-sm leading-snug" style={{ background: samkhyaTokens.roxo, color: samkhyaTokens.footerTexto }}>
        <strong>CASH BLACK</strong> · Comprando este produto, você ganha {brl(precoNormal)} em crédito para cursos e assinatura do Portal Ayurveda.
      </div>
      <p className="text-sm" style={{ color: samkhyaTokens.texto }}>
        Ou pague {brl(precoPix)} no Pix, com 20% de desconto e sem crédito.
      </p>
      <Link to={`/cash-black?sk=${slug}:1`} className="text-sm font-semibold underline" style={{ color: samkhyaTokens.ouroText }}>
        Veja o que pode comprar ›
      </Link>
    </div>
  );
};

/** Linha pequena no card da vitrine. */
export const CashBlackLinhaCard = ({ precoNormal }: { precoNormal: number }) => {
  const { ativa } = useCashBlack();
  if (!ativa) return null;
  return (
    <span className="text-xs font-semibold" style={{ color: samkhyaTokens.ouroText }}>
      Ganhe {brlSemCentavos(precoNormal)} em crédito
    </span>
  );
};
