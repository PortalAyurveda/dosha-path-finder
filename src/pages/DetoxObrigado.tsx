// Volta do pagamento do Detox da Primavera 2026. Escrita com createElement (sem JSX).
import { createElement as h } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const DetoxObrigado = () => {
  const [params] = useSearchParams();
  const { user, isAnonymous } = useUser();
  const status = params.get("status") ?? params.get("collection_status") ?? "approved";
  const aprovado = status === "approved";
  const recusado = status === "rejected" || status === "failure" || status === "null";

  const titulo = aprovado ? "Inscrição confirmada" : recusado ? "O pagamento não passou" : "Pagamento em análise";
  const texto = aprovado
    ? "Que bom ter você no Detox da Primavera 2026. O seu acesso já está liberado."
    : recusado
      ? "Nada foi cobrado. Você pode tentar de novo, no cartão ou no Pix."
      : "Assim que o pagamento for confirmado, o seu acesso é liberado sozinho. No Pix, isso leva poucos minutos.";

  const passos = [
    { t: "Entre no grupo de avisos", d: "Abra a área do Detox. O botão verde do grupo do WhatsApp está logo no topo." },
    { t: "Segunda-feira, 28 de setembro", d: "Entra a lista completa de compras, atualizada. Não precisa comprar nada antes disso." },
    { t: "5 de outubro", d: "Começa o Detox. De 5 a 15 de outubro eu faço o meu junto com a turma." },
    { t: "3 meses de Portal Premium", d: "A Akasha e a Minha Rotina já estão liberadas na sua conta." },
  ];

  return h("div", { className: "min-h-screen bg-[#FDF7F1] px-4 py-12 text-[#2A2540] md:py-20" },
    h(Helmet, null, h("title", null, `${titulo} · Detox da Primavera 2026`), h("meta", { name: "robots", content: "noindex" })),
    h("div", { className: "mx-auto flex max-w-[640px] flex-col gap-6" },
      h("p", { className: "m-0 text-[15px] font-bold uppercase tracking-[1.2px] text-[#8C4513]" }, "Detox da Primavera 2026"),
      h("h1", { className: "m-0 font-serif text-[36px] font-bold leading-tight text-[#1E2547] md:text-[48px]" }, titulo),
      h("p", { className: "m-0 text-[19px] leading-relaxed md:text-[21px]" }, texto),
      !recusado ? h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, "Para abrir o seu Detox, entre no Portal com o mesmo email que você usou no pagamento.") : null,
      recusado
        ? h(Link, { to: "/detox/inscricao", className: "flex min-h-[64px] items-center justify-center rounded-full bg-[#8C4513] px-6 text-[18px] font-bold text-white hover:opacity-90" }, "Tentar de novo")
        : h("div", { className: "flex flex-col gap-6" },
            h(Link, { to: !user || isAnonymous ? "/entrar?redirect=/cursos/detox-da-primavera/estudar" : "/cursos/detox-da-primavera/estudar", className: "flex min-h-[64px] items-center justify-center rounded-full bg-[#E07B39] px-6 text-[18px] font-bold text-white hover:bg-[#D0662A]" }, "Abrir o meu Detox"),
            h("div", { className: "flex flex-col gap-3 rounded-[24px] bg-white p-6" },
              ...passos.map((p, i) =>
                h("div", { key: i, className: `flex flex-col gap-1 py-3 ${i > 0 ? "border-t border-[#EADFD3]" : ""}` },
                  h("p", { className: "m-0 text-[18px] font-bold text-[#1E2547]" }, p.t),
                  h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, p.d)))),
            h(Link, { to: "/detox", className: "text-center text-[17px] font-semibold text-[#8C4513] underline" }, "Voltar para a sala da Jornada"))));
};

export default DetoxObrigado;
