// Página de inscrição do Detox da Primavera 2026. Escrita com createElement (sem JSX).
import { createElement as h, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, CalendarDays, Check, ClipboardList, CreditCard, Eye, Flame, HelpCircle, Loader2, MessageCircle, PlayCircle,
  QrCode, Quote, Sparkles, Sprout, Sun, TrendingUp, Users, UtensilsCrossed, Waves, X,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MeuMapaDetox from "@/components/detox/MeuMapaDetox";
import {
  DETOX_INSCRICAO as D, PREMIUM_CARD, RELATOS, RELATO_PREMIUM, RELATO_GRUPO, FRASE_EDSON_2025, RECEITAS, RECEITAS_TITULO, IMAGENS,
} from "@/data/detoxInscricao";

type Metodo = "cartao" | "pix";
type Relato = { texto: string; nome: string; fonte: string };

const ICONES: { [k: string]: typeof Sun } = {
  sol: Sun, grupo: Users, aulas: PlayCircle, lista: ClipboardList, cardapio: UtensilsCrossed,
  duvidas: HelpCircle, premium: Sparkles, lingua: Eye,
};
const ICONES_PREMIUM: { [k: string]: typeof Sun } = {
  akasha: MessageCircle, revisao: TrendingUp, rotina: UtensilsCrossed, lingua: Eye, aulas: BookOpen, conteudo: Sparkles,
};
const ETAPAS = [
  { icone: Flame, fundo: "bg-gradient-to-br from-[#E8893F] to-[#C8602A]" },
  { icone: Waves, fundo: "bg-gradient-to-br from-[#4E8DB0] to-[#2F6484]" },
  { icone: Sprout, fundo: "bg-gradient-to-br from-[#4FA072] to-[#2F7650]" },
];

const TEXTO = "m-0 text-[16px] md:text-[17px] leading-[1.75] text-[#3A3550]";
const SUAVE = "m-0 text-[15px] leading-relaxed text-[#6B6480]";

const olho = (t: string, centro = false) =>
  h("p", { className: `m-0 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#B3622A] ${centro ? "justify-center" : ""}` },
    h("img", { src: IMAGENS.sol, alt: "", className: "h-4 w-4", "aria-hidden": true }), t);
const titulo = (t: string) =>
  h("h2", { className: "m-0 font-serif text-[26px] md:text-[34px] leading-[1.2] font-bold text-[#1E2547] text-balance" }, t);
const par = (t: string, classe = TEXTO) => h("p", { className: classe }, t);

const secao = (conteudo: ReactNode[], opts: { fundo?: string; largura?: string } = {}) =>
  h("section", { className: `px-4 py-12 md:py-16 ${opts.fundo ?? ""}` },
    h("div", { className: `mx-auto flex w-full flex-col gap-5 ${opts.largura ?? "max-w-[720px]"}` }, ...conteudo));

const relato = (r: Relato, i = 0, fundo = "bg-white") =>
  h("figure", { key: i, className: `m-0 flex flex-col gap-3 rounded-2xl border border-[#EFE4D8] p-5 ${fundo}` },
    h(Quote, { className: "h-5 w-5 text-[#D9A77E]", "aria-hidden": true }),
    h("blockquote", { className: "m-0 font-serif text-[17px] italic leading-relaxed text-[#1E2547]" }, r.texto),
    h("figcaption", { className: "text-[14px] text-[#6B6480]" }, h("span", { className: "font-semibold text-[#3A3550]" }, r.nome), `, ${r.fonte}`));

const linhaIcone = (Icone: typeof Sun, t: string, i: number, cor: string) =>
  h("li", { key: i, className: "flex items-start gap-3" },
    h(Icone, { className: `mt-1 h-5 w-5 shrink-0 ${cor}`, "aria-hidden": true }),
    h("span", { className: TEXTO }, t));

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

  const botoes = (escuro = false) => [
    h("button", {
      key: "cartao", type: "button", onClick: () => void comprar("cartao"), disabled: carregando !== null,
      className: `flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-full px-6 text-[16px] font-semibold shadow-sm transition hover:brightness-105 disabled:opacity-70 ${escuro ? "bg-[#F2CB05] text-[#1E2547]" : "bg-[#8C4513] text-white"}`,
    }, carregando === "cartao" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : h(CreditCard, { className: "h-5 w-5", "aria-hidden": true }), D.hero.botao_cartao),
    h("button", {
      key: "pix", type: "button", onClick: () => void comprar("pix"), disabled: carregando !== null,
      className: `flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-full border px-6 text-[16px] font-semibold transition disabled:opacity-70 ${escuro ? "border-white/60 text-white hover:bg-white/10" : "border-[#8C4513]/50 bg-white text-[#8C4513] hover:bg-[#FBF1E7]"}`,
    }, carregando === "pix" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : h(QrCode, { className: "h-5 w-5", "aria-hidden": true }), D.hero.botao_pix),
  ];

  const hero = D.hero;

  return h("div", { className: "min-h-screen bg-[#FDF9F4] text-[#3A3550]" },
    h(Helmet, null,
      h("title", null, "Detox da Primavera com Edson Osorio · Portal Ayurveda"),
      h("meta", { name: "description", content: hero.subtitulo })),

    h("div", { className: "bg-[#1E2547] px-4 py-2.5 text-center text-[14px] font-medium tracking-wide text-white/90" }, D.faixa),

    h("section", { className: "overflow-hidden bg-gradient-to-b from-[#FBE3CC] via-[#FCEEE0] to-[#FDF9F4] px-4 pb-14 pt-10 md:pb-16 md:pt-14" },
      h("div", { className: "mx-auto grid max-w-[1080px] items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10" },
        h("div", { className: "flex flex-col gap-5" },
          h("div", { className: "flex items-center gap-3" },
            h("img", { src: IMAGENS.logo, alt: "Detox da Primavera", className: "h-12 w-12 object-contain" }),
            h("p", { className: "m-0 text-[13px] font-bold uppercase tracking-[0.14em] text-[#B3622A]" }, hero.eyebrow)),
          h("h1", { className: "m-0 font-serif text-[34px] md:text-[50px] leading-[1.1] font-bold text-[#1E2547] text-balance" }, hero.titulo),
          par(hero.subtitulo, "m-0 text-[17px] md:text-[19px] leading-[1.7] text-[#3A3550]"),
          h("div", { className: "mt-2 flex flex-col gap-3 rounded-3xl border border-[#F0E2D2] bg-white/90 p-5 shadow-[0_18px_40px_-22px_rgba(140,69,19,0.45)] backdrop-blur md:p-6" },
            h("div", { className: "flex flex-wrap items-end gap-x-3 gap-y-1" },
              h("p", { className: "m-0 font-serif text-[40px] md:text-[46px] font-bold leading-none text-[#1E2547]" }, hero.preco),
              par(hero.preco_linha, "m-0 pb-1 text-[14px] leading-snug text-[#6B6480]")),
            h("div", { className: "grid gap-2.5 sm:grid-cols-2" }, ...botoes()),
            h("p", { className: "m-0 text-[13px] leading-relaxed text-[#6B6480]" }, hero.nota))),
        h("div", { className: "relative mx-auto flex w-full max-w-[420px] items-end justify-center" },
          h("img", { src: IMAGENS.sol, alt: "", "aria-hidden": true, className: "absolute left-1/2 top-4 w-[88%] -translate-x-1/2 opacity-90" }),
          h("img", { src: IMAGENS.edsonRecorte, alt: "Edson Osorio", className: "relative z-10 w-full max-w-[380px] object-contain drop-shadow-[0_20px_30px_rgba(30,37,71,0.18)]" })))),

    h(MeuMapaDetox, null),

    secao([
      olho(D.renovar.eyebrow),
      titulo(D.renovar.titulo),
      par(D.renovar.texto),
      h("div", { key: "busca", className: "mt-2 rounded-3xl border border-[#EFE4D8] bg-white p-6 md:p-7" },
        h("p", { className: "m-0 mb-4 font-serif text-[19px] font-bold text-[#1E2547]" }, D.renovar.busca_titulo),
        h("ul", { className: "m-0 flex list-none flex-col gap-3 p-0" }, ...D.renovar.busca.map((t, i) => linhaIcone(Check, t, i, "text-[#3F8A5F]")))),
      par(D.renovar.ama),
    ]),

    h("section", { className: "bg-white px-4 py-12 md:py-16" },
      h("div", { className: "mx-auto flex max-w-[1080px] flex-col gap-5" },
        h("div", { className: "mx-auto flex max-w-[720px] flex-col gap-4 text-center" },
          olho(D.processo.eyebrow, true), titulo(D.processo.titulo), par(D.processo.intro)),
        h("ol", { className: "m-0 mt-4 grid list-none gap-4 p-0 md:grid-cols-3" },
          ...D.processo.etapas.map((e, i) => {
            const est = ETAPAS[i];
            return h("li", { key: i, className: `relative flex flex-col gap-3 overflow-hidden rounded-3xl p-6 text-white shadow-[0_20px_40px_-24px_rgba(30,37,71,0.55)] md:p-7 ${est.fundo}` },
              h("span", { className: "pointer-events-none absolute -right-3 -top-6 font-serif text-[120px] font-bold leading-none text-white/10", "aria-hidden": true }, String(i + 1)),
              h("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30" }, h(est.icone, { className: "h-7 w-7 text-white", "aria-hidden": true })),
              h("p", { className: "m-0 text-[12px] font-bold uppercase tracking-[0.16em] text-white/80" }, `Etapa ${i + 1} · ${e.nome}`),
              h("h3", { className: "m-0 font-serif text-[26px] font-bold leading-tight text-white" }, e.verbo),
              par(e.texto, "m-0 text-[15px] leading-relaxed text-white/90"));
          })),
        h("p", { className: "m-0 mx-auto mt-2 max-w-[720px] text-center text-[15px] leading-relaxed text-[#6B6480]" }, D.processo.nota),
        h("div", { className: "mx-auto mt-4 grid w-full max-w-[860px] gap-3 sm:grid-cols-3" },
          ...D.datas.map((d, i) =>
            h("div", { key: i, className: "flex items-center gap-3 rounded-2xl bg-[#FBF1E7] px-4 py-3" },
              h(CalendarDays, { className: "h-5 w-5 shrink-0 text-[#B3622A]", "aria-hidden": true }),
              h("div", null,
                h("p", { className: "m-0 text-[14px] font-bold text-[#1E2547]" }, d.quando),
                h("p", { className: "m-0 text-[13px] text-[#6B6480]" }, d.o_que))))))),

    secao([
      h("div", { key: "cab", className: "flex flex-col gap-3 text-center" }, olho(RECEITAS_TITULO.eyebrow, true), titulo(RECEITAS_TITULO.titulo), par(RECEITAS_TITULO.texto)),
      h("div", { key: "grid", className: "mt-2 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" },
        ...RECEITAS.map((r, i) =>
          h("figure", { key: i, className: "m-0 overflow-hidden rounded-2xl border border-[#EFE4D8] bg-white" },
            h("img", { src: r.img, alt: r.nome, loading: "lazy", className: "aspect-[3/2] w-full object-cover" }),
            h("figcaption", { className: "px-3 py-2.5 text-center text-[14px] font-semibold text-[#1E2547]" }, r.nome)))),
    ], { fundo: "bg-[#FBF1E7]", largura: "max-w-[1080px]" }),

    secao([
      olho(D.o_que_recebe.eyebrow),
      titulo(D.o_que_recebe.titulo),
      h("div", { key: "itens", className: "mt-2 grid gap-3 sm:grid-cols-2" },
        ...D.o_que_recebe.itens.map((x, i) => {
          const Icone = ICONES[x.icone] ?? Sun;
          return h("div", { key: i, className: "flex items-start gap-4 rounded-2xl border border-[#EFE4D8] bg-white p-5" },
            h("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBEADB]" }, h(Icone, { className: "h-5 w-5 text-[#B3622A]", "aria-hidden": true })),
            h("div", { className: "flex flex-col gap-1" },
              h("h3", { className: "m-0 text-[16px] font-bold text-[#1E2547]" }, x.titulo),
              h("p", { className: "m-0 text-[15px] leading-relaxed text-[#6B6480]" }, x.texto)));
        })),
    ], { largura: "max-w-[880px]" }),

    h("section", { className: "px-4 py-12 md:py-16" },
      h("div", { className: "mx-auto flex max-w-[1080px] flex-col gap-6" },
        h("div", { className: "relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1E2547] via-[#2A2F5E] to-[#3B2F5C] p-6 text-white shadow-[0_30px_60px_-30px_rgba(30,37,71,0.7)] md:p-10" },
          h("img", { src: IMAGENS.sol, alt: "", "aria-hidden": true, className: "pointer-events-none absolute -right-20 -top-20 w-72 opacity-10" }),
          h("div", { className: "relative flex flex-col gap-6" },
            h("div", { className: "flex flex-wrap items-center gap-4" },
              h("img", { src: PREMIUM_CARD.logo, alt: "Akasha I.A.", className: "h-14 w-14 rounded-2xl bg-white/10 p-2" }),
              h("div", { className: "flex flex-col gap-1" },
                h("p", { className: "m-0 text-[12px] font-bold uppercase tracking-[0.16em] text-[#F2CB05]" }, PREMIUM_CARD.eyebrow),
                h("h2", { className: "m-0 font-serif text-[26px] md:text-[34px] font-bold leading-tight text-white text-balance" }, PREMIUM_CARD.titulo))),
            h("p", { className: "m-0 max-w-[760px] text-[16px] md:text-[17px] leading-[1.75] text-white/85" }, PREMIUM_CARD.texto),
            h("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" },
              ...PREMIUM_CARD.itens.map((x, i) => {
                const Icone = ICONES_PREMIUM[x.icone] ?? Sparkles;
                return h("div", { key: i, className: "flex flex-col gap-2 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10" },
                  h(Icone, { className: "h-6 w-6 text-[#F2CB05]", "aria-hidden": true }),
                  h("p", { className: "m-0 text-[16px] font-bold text-white" }, x.titulo),
                  h("p", { className: "m-0 text-[14px] leading-relaxed text-white/75" }, x.texto));
              })),
            h("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2CB05] px-5 py-4 text-[#1E2547]" },
              h("p", { className: "m-0 text-[15px] font-bold" }, PREMIUM_CARD.valor_titulo),
              h("p", { className: "m-0 text-[15px]" }, PREMIUM_CARD.valor_texto)))),
        h("div", { className: "grid gap-4 md:grid-cols-2" },
          h("figure", { className: "m-0 rounded-3xl border border-[#EFE4D8] bg-white p-6" },
            h(Quote, { className: "h-6 w-6 text-[#D9A77E]", "aria-hidden": true }),
            h("blockquote", { className: "m-0 mt-3 font-serif text-[18px] italic leading-relaxed text-[#1E2547]" }, FRASE_EDSON_2025),
            h("figcaption", { className: "mt-3 text-[14px] text-[#6B6480]" }, "Edson Osorio, Detox de 2025")),
          relato(RELATO_PREMIUM, 0, "bg-[#FBF1E7]")))),

    secao([
      olho(D.acompanhamento.eyebrow),
      titulo(D.acompanhamento.titulo),
      ...D.acompanhamento.paragrafos.map((t) => par(t)),
      h("p", { key: "cit", className: "m-0 border-l-2 border-[#D9A77E] pl-4 font-serif text-[19px] italic leading-relaxed text-[#1E2547]" }, `"${D.acompanhamento.citacao}"`),
      relato(RELATO_GRUPO),
    ]),

    secao([
      h("div", { key: "cab", className: "flex flex-col gap-3 text-center" }, olho(D.relatos.eyebrow, true), titulo(D.relatos.titulo)),
      h("div", { key: "rel", className: "mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, ...RELATOS.map((r, i) => relato(r, i))),
    ], { fundo: "bg-[#FBF1E7]", largura: "max-w-[1080px]" }),

    secao([
      h("div", { key: "quem", className: "grid gap-4 md:grid-cols-[1.4fr_1fr]" },
        h("div", { className: "flex flex-col gap-4 rounded-3xl border border-[#EFE4D8] bg-white p-6" },
          h("h3", { className: "m-0 font-serif text-[22px] font-bold text-[#1E2547]" }, D.para_quem.titulo),
          h("ul", { className: "m-0 flex list-none flex-col gap-3 p-0" }, ...D.para_quem.sim.map((t, i) => linhaIcone(Check, t, i, "text-[#3F8A5F]")))),
        h("div", { className: "flex flex-col gap-4 rounded-3xl border border-[#EFE4D8] bg-[#FDF9F4] p-6" },
          h("h3", { className: "m-0 font-serif text-[22px] font-bold text-[#1E2547]" }, D.para_quem.titulo_nao),
          h("ul", { className: "m-0 flex list-none flex-col gap-3 p-0" }, ...D.para_quem.nao.map((t, i) => linhaIcone(X, t, i, "text-[#B85C4A]"))))),
    ], { largura: "max-w-[960px]" }),

    secao([
      h("div", { key: "cab", className: "text-center" }, titulo(D.pagamento.titulo)),
      h("div", { key: "cards", className: "grid gap-3 sm:grid-cols-2" },
        h("div", { className: "flex items-start gap-4 rounded-2xl border border-[#EFE4D8] bg-white p-5" },
          h(CreditCard, { className: "mt-0.5 h-6 w-6 shrink-0 text-[#8C4513]", "aria-hidden": true }),
          h("div", null, h("p", { className: "m-0 text-[16px] font-bold text-[#1E2547]" }, D.pagamento.cartao_titulo), par(D.pagamento.cartao_texto, SUAVE))),
        h("div", { className: "flex items-start gap-4 rounded-2xl border border-[#EFE4D8] bg-white p-5" },
          h(QrCode, { className: "mt-0.5 h-6 w-6 shrink-0 text-[#8C4513]", "aria-hidden": true }),
          h("div", null, h("p", { className: "m-0 text-[16px] font-bold text-[#1E2547]" }, D.pagamento.pix_titulo), par(D.pagamento.pix_texto, SUAVE)))),
      h("div", { key: "bot", className: "mx-auto grid w-full max-w-[620px] gap-2.5 sm:grid-cols-2" }, ...botoes()),
      h("p", { key: "nota", className: "m-0 text-center text-[14px] text-[#6B6480]" }, D.pagamento.nota),
    ], { fundo: "bg-white border-y border-[#F0E6DB]" }),

    secao([
      h("div", { key: "cab", className: "text-center" }, titulo("Perguntas frequentes")),
      h("div", { key: "faq", className: "mt-2 flex flex-col divide-y divide-[#EFE4D8] rounded-3xl border border-[#EFE4D8] bg-white" },
        ...D.faq.map((x, i) =>
          h("details", { key: i, className: "group px-5 py-4" },
            h("summary", { className: "flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#1E2547]" },
              x.pergunta, h("span", { className: "text-[20px] text-[#B3622A] transition group-open:rotate-45", "aria-hidden": true }, "+")),
            h("p", { className: "m-0 mt-2 text-[15px] leading-relaxed text-[#3A3550]" }, x.resposta)))),
    ]),

    secao([
      h("div", { key: "prof", className: "flex flex-col items-center gap-4 text-center" },
        h("img", { src: IMAGENS.edsonFoto, alt: "Edson Osorio", className: "h-32 w-32 rounded-full object-cover object-top ring-4 ring-[#FBEADB]" }),
        h("div", null,
          h("p", { className: "m-0 font-serif text-[24px] font-bold text-[#1E2547]" }, "Edson Osorio"),
          h("p", { className: "m-0 mt-1 text-[14px] text-[#6B6480]" }, D.professor.papel)),
        par(D.professor.texto),
        h("p", { className: "m-0 font-serif text-[18px] italic leading-relaxed text-[#1E2547]" }, `"${D.professor.citacao}"`)),
    ], { largura: "max-w-[640px]" }),

    h("section", { className: "relative overflow-hidden bg-[#1E2547] px-4 py-14 md:py-20" },
      h("img", { src: IMAGENS.sol, alt: "", "aria-hidden": true, className: "pointer-events-none absolute -right-16 -top-16 w-64 opacity-15" }),
      h("div", { className: "relative mx-auto flex max-w-[640px] flex-col items-center gap-4 text-center" },
        h("img", { src: IMAGENS.logo, alt: "", "aria-hidden": true, className: "h-12 w-12 object-contain" }),
        h("h2", { className: "m-0 font-serif text-[28px] md:text-[38px] leading-tight font-bold text-white text-balance" }, D.fechamento.titulo),
        h("p", { className: "m-0 text-[16px] md:text-[18px] leading-[1.7] text-white/85" }, D.fechamento.texto),
        h("p", { className: "m-0 text-[15px] font-semibold text-[#FBEADB]" }, D.fechamento.preco_linha),
        h("div", { className: "mt-2 grid w-full max-w-[520px] gap-2.5" }, ...botoes(true)))),
  );
};

export default DetoxInscricao;
