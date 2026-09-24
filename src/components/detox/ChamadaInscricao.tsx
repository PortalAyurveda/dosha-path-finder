// Chamada para a inscrição do Detox, que aparece sozinha a partir de 24/09 às 19h30 (Brasília).
import { createElement as h, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const INSCRICOES_ABREM = Date.parse("2026-09-24T22:30:00Z");

export const useInscricoesAbertas = () => {
  const [aberta, setAberta] = useState(() => Date.now() >= INSCRICOES_ABREM);
  useEffect(() => {
    if (aberta) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= INSCRICOES_ABREM) setAberta(true);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [aberta]);
  return aberta;
};

const ChamadaInscricao = ({ compacta = false }: { compacta?: boolean }) => {
  const aberta = useInscricoesAbertas();
  if (!aberta) return null;
  return h("div", { className: `flex flex-col items-start gap-4 rounded-[24px] border-2 border-detox-primary bg-detox-card p-5 shadow-detox sm:flex-row sm:items-center sm:justify-between ${compacta ? "" : "md:p-6"}` },
    h("div", { className: "min-w-0" },
      h("p", { className: "m-0 text-xs font-bold uppercase text-detox-dark" }, "Inscrições abertas"),
      h("p", { className: "m-0 mt-1 font-serif text-xl font-bold text-detox-text md:text-2xl" }, "Detox da Primavera 2026"),
      h("p", { className: "m-0 mt-1 text-sm text-detox-muted md:text-base" }, "10 dias com o Edson, começa em 5 de outubro.")),
    h(Link, { to: "/detox/inscricao", className: "inline-flex min-h-[60px] w-full shrink-0 items-center justify-center rounded-full bg-detox-primary px-7 text-sm font-bold uppercase text-primary-foreground hover:bg-detox-dark sm:w-auto" }, "Quero fazer o Detox"));
};

export default ChamadaInscricao;
