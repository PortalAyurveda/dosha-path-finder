// Volta do pagamento do Detox da Primavera 2026. Escrita com createElement (sem JSX).
import { createElement as h, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import OfertaKit from "@/components/detox/OfertaKit";

type Fase = "padrao" | "processando" | "liberado" | "precisa_email";

const DetoxObrigado = () => {
  const [params] = useSearchParams();
  const { user, isAnonymous } = useUser();
  const status = params.get("status") ?? params.get("collection_status") ?? "approved";
  const aprovado = status === "approved";
  const recusado = status === "rejected" || status === "failure" || status === "null";

  const mpPaymentId = params.get("payment_id");
  const merchantOrderId = params.get("merchant_order_id");
  const podeReivindicar = !recusado && !!mpPaymentId && !!merchantOrderId;

  const [fase, setFase] = useState<Fase>("padrao");
  const [emailMascarado, setEmailMascarado] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const tentativas = useRef(0);

  const reivindicar = async (email?: string) => {
    const body: Record<string, string> = { acao: "reivindicar", mp_payment_id: mpPaymentId!, merchant_order_id: merchantOrderId! };
    if (email) body.email = email;
    const { data } = await supabase.functions.invoke("vendas-cursos-mp", { body });
    return (data ?? {}) as { liberado?: boolean; processando?: boolean; precisa_email?: boolean; ok?: boolean; email_mascarado?: string; erro?: string };
  };

  useEffect(() => {
    if (!podeReivindicar) return;
    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tentar = async () => {
      const r = await reivindicar();
      if (cancelado) return;
      if (r.liberado) {
        setEmailMascarado(r.email_mascarado ?? "");
        setFase("liberado");
        return;
      }
      if (r.precisa_email) {
        setFase("precisa_email");
        return;
      }
      if (r.processando && tentativas.current < 6) {
        tentativas.current += 1;
        setFase("processando");
        timer = setTimeout(tentar, 5000);
        return;
      }
      setFase("padrao");
    };

    void tentar();
    return () => { cancelado = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeReivindicar, mpPaymentId, merchantOrderId]);

  const liberarComEmail = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEnviando(true);
    setErro("");
    const r = await reivindicar(email);
    setEnviando(false);
    if (r.liberado) {
      setEmailMascarado(r.email_mascarado ?? email);
      setFase("liberado");
      return;
    }
    if (r.ok === false) {
      setErro(r.erro ?? "Não foi possível liberar o acesso. Tente de novo.");
      return;
    }
    if (r.processando) {
      setErro("O pagamento ainda está em confirmação. Tente de novo em alguns segundos.");
      return;
    }
    setErro("Não foi possível liberar o acesso. Tente de novo.");
  };

  const titulo = aprovado ? "Inscrição confirmada" : recusado ? "O pagamento não passou" : "Pagamento em análise";
  const texto = aprovado
    ? "Que bom ter você no Detox da Primavera 2026. O seu acesso já está liberado."
    : recusado
      ? "Nada foi cobrado. Você pode tentar de novo, no cartão ou no Pix."
      : "Assim que o pagamento for confirmado, o seu acesso é liberado sozinho. No Pix, isso leva poucos minutos.";

  const linhaAcesso = fase === "liberado"
    ? `O seu Detox está liberado na conta ${emailMascarado}. Entre no Portal com esse email.`
    : fase === "processando"
      ? "Estamos liberando o seu acesso. Leva poucos segundos."
      : "Para abrir o seu Detox, entre no Portal com o mesmo email que você usou no pagamento.";

  const passos = [
    { t: "Entre no grupo de avisos", d: "Abra a área do Detox. O botão verde do grupo do WhatsApp está logo no topo." },
    { t: "Segunda-feira, 28 de setembro", d: "Entra a lista completa de compras, atualizada. Não precisa comprar nada antes disso." },
    { t: "5 de outubro", d: "Começa o Detox. De 5 a 15 de outubro eu faço o meu junto com a turma." },
    { t: "3 meses de Portal Premium", d: "A Akasha e a Minha Rotina já estão liberadas na sua conta." },
  ];

  const cartaoEmail = fase === "precisa_email"
    ? h("div", { className: "flex flex-col gap-4 rounded-[24px] bg-white p-6" },
        h("p", { className: "m-0 font-serif text-[24px] font-bold text-[#352F54]" }, "Falta só um passo"),
        h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, "O Mercado Pago não nos passou o seu email. Digite o email que você quer usar para entrar no Portal e abrir o seu Detox."),
        h("input", {
          type: "email", autoComplete: "email", id: "detox-obrigado-email", placeholder: "seuemail@exemplo.com",
          value: emailInput, onChange: (e: any) => setEmailInput(e.target.value),
          className: "min-h-[56px] w-full rounded-2xl border border-[#EADFD3] bg-white px-4 text-[18px] text-[#352F54] outline-none focus:border-[#E07B39]",
        }),
        h("button", {
          type: "button", onClick: () => void liberarComEmail(), disabled: enviando,
          className: "flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-[#E07B39] px-6 text-[18px] font-bold text-white transition hover:bg-[#D0662A] disabled:opacity-70",
        }, enviando ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : null, "Liberar o meu Detox"),
        erro ? h("p", { className: "m-0 text-[16px] text-[#B42318]" }, erro) : null)
    : fase === "liberado" && emailMascarado
      ? h("div", { className: "flex flex-col gap-2 rounded-[24px] bg-white p-6" },
          h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, `Pronto! O seu Detox está liberado. Entre no Portal com ${emailMascarado}.`))
      : null;

  return h("div", { className: "min-h-screen bg-[#FDF7F1] px-4 py-12 text-[#2A2540] md:py-20" },
    h(Helmet, null, h("title", null, `${titulo} · Detox da Primavera 2026`), h("meta", { name: "robots", content: "noindex" })),
    h("div", { className: "mx-auto flex max-w-[640px] flex-col gap-6" },
      h("p", { className: "m-0 text-[15px] font-bold uppercase tracking-[1.2px] text-[#A85A1A]" }, "Detox da Primavera 2026"),
      h("h1", { className: "m-0 font-serif text-[36px] font-bold leading-tight text-[#352F54] md:text-[48px]" }, titulo),
      h("p", { className: "m-0 text-[19px] leading-relaxed md:text-[21px]" }, texto),
      !recusado ? h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, linhaAcesso) : null,
      cartaoEmail,
      recusado
        ? h(Link, { to: "/detox/inscricao", className: "flex min-h-[64px] items-center justify-center rounded-full bg-[#E07B39] px-6 text-[18px] font-bold text-white hover:bg-[#D0662A]" }, "Tentar de novo")
        : h("div", { className: "flex flex-col gap-6" },
            h(Link, { to: !user || isAnonymous ? "/entrar?redirect=/cursos/detox-da-primavera/estudar" : "/cursos/detox-da-primavera/estudar", className: "flex min-h-[64px] items-center justify-center rounded-full bg-[#E07B39] px-6 text-[18px] font-bold text-white hover:bg-[#D0662A]" }, "Abrir o meu Detox"),
            h("div", { className: "flex flex-col gap-3 rounded-[24px] bg-white p-6" },
              ...passos.map((p, i) =>
                h("div", { key: i, className: `flex flex-col gap-1 py-3 ${i > 0 ? "border-t border-[#EADFD3]" : ""}` },
                  h("p", { className: "m-0 text-[18px] font-bold text-[#352F54]" }, p.t),
                   h("p", { className: "m-0 text-[17px] leading-relaxed text-[#4A4458]" }, p.d)))),
             aprovado ? h(OfertaKit) : null,
            h(Link, { to: "/detox", className: "text-center text-[17px] font-semibold text-[#A85A1A] underline" }, "Voltar para a sala da Jornada"))));
};

export default DetoxObrigado;
