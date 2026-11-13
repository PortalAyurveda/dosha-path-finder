import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUser } from "@/contexts/UserContext";
import { brl, useMeuCashback } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

/** Saldo no canto direito da faixa, só para quem está logado. */
const SaldoFaixa = () => {
  const { user, isAnonymous } = useUser();
  const logado = !!user && !isAnonymous;
  const { data } = useMeuCashback(logado);
  if (!logado || !data) return null;
  const total = Number(data.total) || 0;
  return (
    <Popover>
      <PopoverTrigger
        className={`${total > 0 ? "inline-flex" : "hidden md:inline-flex"} shrink-0 items-center gap-1 whitespace-nowrap px-2 py-1.5 text-[10px] font-semibold sm:text-xs md:pr-4 md:text-sm`}
        style={{ color: samkhyaTokens.footerTexto }}
        aria-label={`Seu crédito: ${brl(total)}`}
      >
        <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        {brl(total)}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4" style={{ background: samkhyaTokens.fundo }}>
        <div className="font-serif text-lg font-bold" style={{ color: samkhyaTokens.roxo }}>Seu crédito</div>
        <div className="font-serif text-2xl font-bold" style={{ color: samkhyaTokens.roxoDark }}>{brl(total)}</div>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between gap-2"><dt>Só no Portal</dt><dd className="font-semibold">{brl(Number(data.so_portal))}</dd></div>
          <div className="flex justify-between gap-2"><dt>Portal ou Samkhya</dt><dd className="font-semibold">{brl(Number(data.samkhya_e_portal))}</dd></div>
        </dl>
        <Link
          to="/usar-credito"
          className="mt-3 flex min-h-11 items-center justify-center rounded-full font-semibold"
          style={{ background: samkhyaTokens.ouro, color: "#fff" }}
        >
          Usar meu crédito
        </Link>
      </PopoverContent>
    </Popover>
  );
};
export default SaldoFaixa;
