// Chamada para a inscrição do Detox, que aparece sozinha a partir de 24/09 às 19h30 (Brasília).
// Abre a página de venda em outra aba: quem está na aula ao vivo continua no vídeo.
import { createElement as h, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export const INSCRICOES_ABREM = Date.parse("2026-09-24T22:30:00Z");
const LINK = "/detox/inscricao";

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
    h("a", { href: LINK, target: "_blank", rel: "noopener", className: "inline-flex min-h-[60px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-detox-primary px-7 text-sm font-bold uppercase text-primary-foreground hover:bg-detox-dark sm:w-auto" },
      "Quero fazer o Detox", h(ArrowRight, { className: "h-4 w-4", "aria-hidden": true })));
};

// Barra presa no rodapé da tela. Fica por cima da página, então nada se mexe quando ela aparece.
export const BarraInscricao = () => {
  const aberta = useInscricoesAbertas();
  if (!aberta) return null;
  return h("div", null,
    h("div", { className: "h-24", "aria-hidden": true }),
    h("div", { className: "fixed inset-x-0 bottom-0 z-50 border-t border-detox-card-border bg-detox-card px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)]" },
      h("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-3" },
        h("div", { className: "min-w-0" },
          h("p", { className: "m-0 truncate font-serif text-base font-bold text-detox-text md:text-lg" }, "Detox da Primavera 2026")),
        h("a", { href: LINK, target: "_blank", rel: "noopener", className: "inline-flex min-h-[60px] shrink-0 items-center justify-center gap-2 rounded-full bg-detox-primary px-5 text-sm font-bold uppercase text-primary-foreground hover:bg-detox-dark" },
          "Quero fazer o Detox", h(ArrowRight, { className: "h-4 w-4", "aria-hidden": true })))));
};

export default ChamadaInscricao;
