// Página de inscrição do Detox da Primavera 2026. Escrita com createElement (sem JSX).
import { createElement as h, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Camera, ClipboardList, Crown, HelpCircle, Loader2, MonitorPlay, Sun, Users, Utensils } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DETOX_INSCRICAO as D, RELATOS, RELATO_PREMIUM, RELATO_GRUPO, FRASE_EDSON_2025,
  RECEITAS_TITULO, RECEITAS, IMAGENS,
} from "@/data/detoxInscricao";

type Metodo = "cartao" | "pix";
type Relato = { texto: string; nome: string; fonte: string };

const SERIF = "font-serif";
const H2 = `m-0 ${SERIF} text-[30px] md:text-[42px] leading-tight font-bold text-[#1E2547] text-balance`;
const P = "m-0 text-[18px] md:text-[20px] leading-relaxed text-[#2A2540]";
const EYEBROW = "m-0 text-[15px] font-bold uppercase tracking-[1.2px] text-[#8C4513]";

const secao = (conteudo: ReactNode[], opts: { fundo?: string; largura?: string; borda?: boolean } = {}) =>
  h("section", { className: `px-4 py-12 md:py-20 ${opts.fundo ?? ""} ${opts.borda ? "border-y border-[#EADFD3]" : ""}` },
    h("div", { className: `mx-auto flex w-full flex-col gap-5 ${opts.largura ?? "max-w-[760px]"}` }, ...conteudo));

const titulo = (t: string) => h("h2", { className: H2 }, t);
const parTexto = (t: string, extra = "") => h("p", { className: `${P} ${extra}` }, t);


const ponto = (t: string, cor: string, i: number) =>
  h("div", { key: i, className: "flex items-start gap-3.5" },
    h("span", { className: `mt-2.5 h-3 w-3 shrink-0 rounded-full ${cor}`, "aria-hidden": true }),
    parTexto(t));

const relato = (r: Relato, fundo = "bg-white", i = 0) =>
  h("figure", { key: i, className: `m-0 flex flex-col gap-3 rounded-[20px] p-6 ${fundo}` },
    h("blockquote", { className: `m-0 ${SERIF} text-[19px] md:text-[21px] leading-normal text-[#1E2547]` }, `"${r.texto}"`),
    h("figcaption", { className: "text-base text-[#4A4458]" },
      h("strong", { className: "text-[#2A2540]" }, r.nome), `, ${r.fonte}`));

const ICONE_ITEM: { [k: string]: typeof Sun } = {
  sol: Sun, grupo: Users, aulas: MonitorPlay, lista: ClipboardList,
  cardapio: Utensils, duvidas: HelpCircle, premium: Crown, lingua: Camera,
};


const DetoxInscricao = () => {
  const { user, isAnonymous } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(null as Metodo | null);

  const comprar = async (metodo: Metodo) => {
    if (!user || isAnonymous) {
      navigate("/entrar?redirect=/detox/inscricao");
      return;
    }
    setCarregando(metodo);
    const { data, error } = await supabase.functions.invoke("create-cartao-curso", {
      body: { curso_slug: "detox-da-primavera", metodo },
    });
    if (error || !data) {
      setCarregando(null);
      toast({ title: "Não foi possível abrir o pagamento", description: "Tente de novo em instantes.", variant: "destructive" });
      return;
    }
    if (data.ja_matriculado) {
      navigate("/cursos/detox-da-primavera/estudar");
      return;
    }
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return;
    }
    setCarregando(null);
    toast({ title: "Não foi possível abrir o pagamento", description: "Tente de novo em instantes.", variant: "destructive" });
  };

  const botoes = (cartao: string, pix: string, escuro = false) => [
    h("button", {
      key: "cartao", type: "button", onClick: () => void comprar("cartao"), disabled: carregando !== null,
      className: `flex min-h-[64px] w-full items-center justify-center gap-2 rounded-full px-5 text-center text-[18px] font-bold transition-opacity hover:opacity-90 disabled:opacity-70 ${escuro ? "bg-[#F2CB05] text-[#1E2547]" : "bg-[#8C4513] text-white"}`,
    }, carregando === "cartao" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : null, cartao),
    h("button", {
      key: "pix", type: "button", onClick: () => void comprar("pix"), disabled: carregando !== null,
      className: `flex min-h-[64px] w-full items-center justify-center gap-2 rounded-full border-2 bg-transparent px-5 text-center text-[18px] font-bold transition-opacity hover:opacity-90 disabled:opacity-70 ${escuro ? "border-white text-white" : "border-[#8C4513] text-[#8C4513]"}`,
    }, carregando === "pix" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : null, pix),
  ];

  const hero = D.hero;
  const etapaCor = ["border-t-[#E07B39] text-[#E07B39]", "border-t-[#C0392B] text-[#C0392B]", "border-t-[#2E7D5B] text-[#2E7D5B]"];

  return h("div", { className: "min-h-screen bg-[#FDF7F1] text-[#2A2540]" },
    h(Helmet, null,
      h("title", null, "Detox da Primavera 2026 · Portal Ayurveda"),
      h("meta", { name: "description", content: hero.subtitulo })),

    h("div", { className: "bg-[#1E2547] px-4 py-3.5 text-center text-[17px] font-bold text-white" }, D.faixa),

    h("section", { className: "bg-[#FBE6D2] px-4 py-10 md:py-20" },
      h("div", { className: "mx-auto flex max-w-[1080px] flex-wrap items-center gap-8 md:gap-14" },
        h("div", { className: "flex flex-[1_1_380px] flex-col gap-5" },
          h("img", { src: IMAGENS.logo, alt: "Detox da Primavera", className: "h-14 w-auto self-start" }),
          h("p", { className: EYEBROW }, hero.eyebrow),
          h("h1", { className: `m-0 ${SERIF} text-[38px] md:text-[60px] leading-[1.1] font-bold text-[#1E2547] text-balance` }, hero.titulo),
          h("p", { className: "m-0 text-[19px] md:text-[22px] leading-relaxed" }, hero.subtitulo)),
        h("div", { className: "flex w-full max-w-[460px] flex-[1_1_320px] flex-col gap-3 rounded-[24px] bg-white p-7 shadow-[0_10px_30px_rgba(140,69,19,0.12)]" },
          h("p", { className: "m-0 text-[18px] text-[#4A4458]" }, hero.preco_rotulo),
          h("p", { className: `m-0 ${SERIF} text-[52px] md:text-[64px] font-bold leading-none text-[#1E2547]` }, hero.preco),
          h("p", { className: "m-0 text-[19px] leading-normal" }, hero.preco_linha),
          h("div", { className: "mt-2 flex flex-col gap-3" }, ...botoes(hero.botao_cartao, hero.botao_pix)),
          h("p", { className: "m-0 mt-1 text-[17px] leading-normal text-[#4A4458]" }, hero.nota)))),

    secao([
      h("div", { key: "sol", className: "flex items-center gap-5" },
        h("img", { src: IMAGENS.sol, alt: "", className: "h-16 w-16 shrink-0", "aria-hidden": true }),
        h("div", { className: "flex flex-col gap-1.5" },
          h("p", { className: EYEBROW }, D.renovar.eyebrow),
          titulo(D.renovar.titulo))),
      parTexto(D.renovar.texto),
      h("h3", { key: "buscat", className: `m-0 mt-3 ${SERIF} text-[26px] text-[#1E2547]` }, D.renovar.busca_titulo),
      h("div", { key: "busca", className: "flex flex-col gap-3.5" }, ...D.renovar.busca.map((t, i) => ponto(t, "bg-[#E07B39]", i))),
      parTexto(D.renovar.ama, "mt-3 text-[#4A4458]"),
    ]),

    secao([
      h("p", { className: EYEBROW }, D.processo.eyebrow),
      titulo(D.processo.titulo),
      parTexto(D.processo.intro),
      h("div", { key: "etapas", className: "flex flex-wrap gap-4" },
        ...D.processo.etapas.map((e, i) =>
          h("div", { key: i, className: `flex flex-[1_1_260px] flex-col gap-2.5 rounded-[20px] border-t-[6px] bg-white p-6 ${etapaCor[i]}` },
            h("p", { className: "m-0 text-[15px] font-bold uppercase tracking-[1.2px]" }, `Etapa ${i + 1} · ${e.verbo}`),
            h("h3", { className: `m-0 ${SERIF} text-[26px] text-[#1E2547]` }, e.nome),
            parTexto(e.texto)))),
      parTexto(D.processo.nota, "text-[#4A4458]"),
    ], { largura: "max-w-[1080px]" }),

    secao([
      titulo("As datas"),
      h("div", { key: "datas" },
        ...D.datas.map((x, i) =>
          h("div", { key: i, className: "flex flex-wrap gap-x-5 gap-y-1.5 border-b border-[#EADFD3] py-4" },
            h("p", { className: "m-0 flex-[0_0_230px] text-[18px] font-bold text-[#8C4513]" }, x.quando),
            h("p", { className: "m-0 flex-[1_1_280px] text-[18px] leading-relaxed" }, x.o_que)))),
    ], { fundo: "bg-white", borda: true }),

    secao([
      h("p", { className: EYEBROW }, D.o_que_recebe.eyebrow),
      titulo(D.o_que_recebe.titulo),
      h("div", { key: "itens", className: "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5" },
        ...D.o_que_recebe.itens.map((x, i) => {
          const Icone = ICONE_ITEM[x.icone] ?? Sun;
          return h("div", { key: i, className: "flex flex-col gap-2.5 rounded-[18px] bg-white p-5" },
            h("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#FBEADB]" },
              h(Icone, { className: "h-5 w-5 text-[#B3622A]", "aria-hidden": true })),
            h("h3", { className: "m-0 text-[20px] font-bold text-[#1E2547]" }, x.titulo),
            h("p", { className: "m-0 text-[17px] leading-normal text-[#4A4458]" }, x.texto));
        })),
    ], { largura: "max-w-[1080px]" }),

    secao([
      h("p", { className: EYEBROW }, D.premium.eyebrow),
      titulo(D.premium.titulo),
      parTexto(D.premium.texto),
      h("figure", { key: "edson", className: "m-0 mt-3 border-l-4 border-[#8C4513] py-1 pl-5" },
        h("blockquote", { className: `m-0 ${SERIF} text-[20px] md:text-[23px] leading-normal text-[#1E2547]` }, `"${FRASE_EDSON_2025}"`),
        h("figcaption", { className: "mt-2.5 text-base text-[#4A4458]" }, h("strong", { className: "text-[#2A2540]" }, "Edson Osorio"), ", no Detox de 2025")),
      relato(RELATO_PREMIUM, "bg-[#FBE6D2]"),
    ], { fundo: "bg-white", borda: true }),

    secao([
      h("p", { className: EYEBROW }, D.acompanhamento.eyebrow),
      titulo(D.acompanhamento.titulo),
      ...D.acompanhamento.paragrafos.map((t) => parTexto(t)),
      h("p", { key: "cit", className: `m-0 mt-2 ${SERIF} text-[21px] md:text-[25px] leading-normal text-[#1E2547]` }, `"${D.acompanhamento.citacao}"`),
      relato(RELATO_GRUPO),
    ]),

    secao([
      h("p", { className: EYEBROW }, D.relatos.eyebrow),
      titulo(D.relatos.titulo),
      h("div", { key: "rel", className: "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5" }, ...RELATOS.map((r, i) => relato(r, "bg-white", i))),
    ], { fundo: "bg-[#FBE6D2]", largura: "max-w-[1080px]" }),

    secao([
      titulo(D.para_quem.titulo),
      h("div", { key: "sim", className: "flex flex-col gap-3" }, ...D.para_quem.sim.map((t, i) => ponto(t, "bg-[#2E7D5B]", i))),
      h("h3", { key: "espera", className: `m-0 mt-4 ${SERIF} text-[26px] text-[#1E2547]` }, D.para_quem.titulo_nao),
      h("div", { key: "nao", className: "flex flex-col gap-3" }, ...D.para_quem.nao.map((t, i) => ponto(t, "bg-[#9A8F86]", i))),
    ]),

    secao([
      titulo(D.pagamento.titulo),
      h("div", { key: "cards", className: "flex flex-wrap gap-4" },
        h("div", { className: "flex flex-[1_1_300px] flex-col gap-2.5 rounded-[20px] border-2 border-[#8C4513] bg-white p-6" },
          h("h3", { className: `m-0 ${SERIF} text-[24px] text-[#1E2547]` }, D.pagamento.cartao_titulo), parTexto(D.pagamento.cartao_texto)),
        h("div", { className: "flex flex-[1_1_300px] flex-col gap-2.5 rounded-[20px] border-2 border-[#EADFD3] bg-white p-6" },
          h("h3", { className: `m-0 ${SERIF} text-[24px] text-[#1E2547]` }, D.pagamento.pix_titulo), parTexto(D.pagamento.pix_texto))),
      parTexto(D.pagamento.nota, "text-[#4A4458]"),
      h("div", { key: "bot", className: "grid gap-3 sm:grid-cols-2" }, ...botoes(hero.botao_cartao, hero.botao_pix)),
    ], { fundo: "bg-white", borda: true, largura: "max-w-[900px]" }),

    secao([
      h("p", { className: EYEBROW }, RECEITAS_TITULO.eyebrow),
      titulo(RECEITAS_TITULO.titulo),
      parTexto(RECEITAS_TITULO.texto),
      h("div", { key: "rec", className: "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5" },
        ...RECEITAS.map((r, i) =>
          h("figure", { key: i, className: "m-0 flex flex-col gap-2 overflow-hidden rounded-[18px] bg-white" },
            h("img", { src: r.img, alt: r.nome, className: "aspect-[4/3] w-full object-cover", loading: "lazy" }),
            h("figcaption", { className: "px-4 pb-4 text-[18px] font-bold text-[#1E2547]" }, r.nome)))),
    ], { fundo: "bg-[#FBE6D2]", largura: "max-w-[1080px]" }),

    secao([
      titulo("Perguntas frequentes"),
      h("div", { key: "faq", className: "flex flex-col gap-2.5" },
        ...D.faq.map((x, i) =>
          h("details", { key: i, className: "rounded-2xl bg-white px-5 py-4" },
            h("summary", { className: "min-h-[44px] cursor-pointer text-[19px] font-bold leading-snug text-[#1E2547]" }, x.pergunta),
            h("p", { className: "m-0 mt-3 text-[18px] leading-relaxed" }, x.resposta)))),
    ]),

    secao([
      h("div", { key: "id", className: "flex flex-wrap items-center gap-5" },
        h("img", { src: IMAGENS.edsonRecorte, alt: "Edson Osorio", className: "h-[130px] w-auto" }),
        h("div", null,
          h("p", { className: `m-0 ${SERIF} text-[30px] font-bold text-[#1E2547]` }, "Edson Osorio"),
          h("p", { className: "m-0 mt-1 text-[18px] text-[#4A4458]" }, D.professor.papel))),
      parTexto(D.professor.texto),
      h("p", { key: "cit", className: `m-0 ${SERIF} text-[21px] md:text-[25px] leading-normal text-[#1E2547]` }, `"${D.professor.citacao}"`),
    ], { fundo: "bg-white", borda: true }),

    h("section", { className: "bg-[#1E2547] px-4 py-12 text-white md:py-24" },
      h("div", { className: "mx-auto flex max-w-[760px] flex-col gap-4" },
        h("h2", { className: `m-0 ${SERIF} text-[32px] md:text-[48px] leading-tight font-bold text-white text-balance` }, D.fechamento.titulo),
        h("p", { className: "m-0 text-[18px] md:text-[20px] leading-relaxed text-white" }, D.fechamento.texto),
        h("p", { className: "m-0 text-[18px] font-bold leading-normal text-[#FBE6D2]" }, D.fechamento.preco_linha),
        h("div", { className: "mt-2 flex max-w-[460px] flex-col gap-3" }, ...botoes(hero.botao_cartao, hero.botao_pix, true)),
        h("img", { key: "assinatura", src: IMAGENS.edsonFoto, alt: "Assinatura de Edson Osorio", className: "mt-4 h-20 w-auto self-start" }))),
  );
};

export default DetoxInscricao;
