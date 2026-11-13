import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { faltamMenosDe3Dias, useAgora, useCashBlack } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import Relogio from "./Relogio";
import SaldoFaixa from "./SaldoFaixa";

/** Faixa fina acima do menu durante a Cash Black. */
const FaixaCashBlack = () => {
  const { ativa, fimMs } = useCashBlack();
  const { pathname } = useLocation();
  const agora = useAgora(ativa);
  const ref = useRef<HTMLDivElement>(null);
  // Informa a altura da faixa para o espaço do menu fixo e as barras que grudam abaixo dele.
  useEffect(() => {
    const raiz = document.documentElement;
    const el = ref.current;
    if (!ativa || !el) { raiz.style.removeProperty("--cb-faixa"); return; }
    const aplicar = () => raiz.style.setProperty("--cb-faixa", `${el.offsetHeight}px`);
    aplicar();
    const ro = new ResizeObserver(aplicar);
    ro.observe(el);
    return () => { ro.disconnect(); raiz.style.removeProperty("--cb-faixa"); };
  }, [ativa]);
  if (!ativa) return null;
  const naLoja = pathname.startsWith("/samkhya");
  const reta = faltamMenosDe3Dias(fimMs, agora);
  const cor = { color: samkhyaTokens.footerTexto };
  const forte = <strong style={cor} className="font-bold tracking-wide">CASH BLACK</strong>;
  return (
    <div ref={ref} className="flex w-full items-center" style={{ background: samkhyaTokens.roxoDark, color: samkhyaTokens.footerTexto }}>
    <Link
      to="/cash-black"
      className="block min-w-0 flex-1 text-center text-[11px] sm:text-xs md:text-sm leading-tight px-3 py-1.5 hover:opacity-95"
    >
      {reta ? (
        <span style={cor}>{forte} · Até 27/11: 20% no Pix ou 100% em crédito</span>
      ) : (
        <>
          <span className="md:hidden" style={cor}>{forte} · 100% em crédito até 27/11 ›</span>
          <span className="hidden md:inline-flex items-center gap-2 justify-center" style={cor}>
            {naLoja ? (
              <>
                <span style={cor}>{forte} · Compre na Samkhya e ganhe crédito no Portal até 27/11 ·</span>
                {Number.isFinite(fimMs) && <Relogio fimMs={fimMs} pequeno />}
                <span style={cor}>›</span>
              </>
            ) : (
              <>
                <span style={cor}>{forte} · 100% em crédito até 27/11 ·</span>
                {Number.isFinite(fimMs) && <Relogio fimMs={fimMs} pequeno />}
                <span style={cor}>· Como funciona ›</span>
              </>
            )}
          </span>
        </>
      )}
    </Link>
    <SaldoFaixa />
    </div>
  );
};
export default FaixaCashBlack;
