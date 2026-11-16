import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { brl, useMeuCashback } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

type Props = {
  /** Qual saldo mostrar: total (Portal) ou samkhya_e_portal (loja). */
  campo?: "total" | "samkhya_e_portal";
  linha: string;
  para: string;
  className?: string;
};

/** Faixa roxa de crédito: só para quem está logado e tem saldo > 0. */
const FaixaCredito = ({ campo = "total", linha, para, className = "" }: Props) => {
  const { user, isAnonymous } = useUser();
  const logado = !!user && !isAnonymous;
  const { data } = useMeuCashback(logado);
  const valor = Number(data?.[campo]) || 0;
  if (!logado || valor <= 0) return null;
  const cor = { color: samkhyaTokens.footerTexto };
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl px-4 py-3 text-left ${className}`}
      style={{ background: samkhyaTokens.roxoDark, ...cor }}
      data-testid="faixa-credito"
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm md:text-base leading-snug" style={cor}>Você tem {brl(valor)} de crédito</p>
        <p className="text-xs md:text-sm leading-snug mt-0.5" style={{ ...cor, opacity: 0.9 }}>{linha}</p>
      </div>
      <Link
        to={para}
        className="shrink-0 inline-flex items-center justify-center min-h-[44px] px-5 rounded-full text-sm font-semibold whitespace-nowrap"
        style={{ background: samkhyaTokens.footerTexto, color: samkhyaTokens.roxoDark }}
      >
        Usar meu crédito
      </Link>
    </div>
  );
};
export default FaixaCredito;
