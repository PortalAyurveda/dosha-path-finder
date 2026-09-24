// "A sua jornada até aqui": o mapa real da pessoa na página de inscrição do Detox. Escrita com createElement (sem JSX).
import { createElement as h, lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Flame, MessageCircle, Sparkles, Sprout, Waves } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";

const DoshaPieChart = lazy(() => import("@/components/charts/DoshaPieChart"));

type Dados = { tags: string[]; agni: string | null; foto: string | null; relato: string | null; classificacao: string | null };
const SELO: { [k: string]: string } = { assertiva: "Leitura assertiva", neutra: "Leitura neutra", duvidosa: "Leitura duvidosa" };

const limpaTags = (...listas: (string | null | undefined)[]) =>
  listas.flatMap((l) => (l ?? "").split(",")).map((t) => t.trim()).filter((t) => t && t.toLowerCase() !== "nenhum");

const cartao = (titulo: string, Icone: typeof Camera, ...filhos: unknown[]) =>
  h("div", { className: "flex flex-col gap-4 rounded-3xl border border-[#EFE4D8] bg-white p-5 md:p-6" },
    h("div", { className: "flex items-center gap-2.5" },
      h("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEADB]" }, h(Icone, { className: "h-4 w-4 text-[#B3622A]", "aria-hidden": true })),
      h("p", { className: "m-0 text-[13px] font-bold uppercase tracking-[0.12em] text-[#1E2547]" }, titulo)),
    ...(filhos as never[]));

const MeuMapaDetox = () => {
  const { user, doshaResult } = useUser();
  const [dados, setDados] = useState(null as Dados | null);
  const uid = user?.id ?? null;

  useEffect(() => {
    let ativo = true;
    if (!uid || !doshaResult?.idPublico) return () => { ativo = false; };
    void (async () => {
      const [{ data: teste }, { data: fichas }, { data: sintese }] = await Promise.all([
        supabase.rpc("resultado_teste", { p_idpublico: doshaResult.idPublico }),
        supabase.from("jornada_ficha").select("noite, respostas").eq("user_id", uid).in("noite", [1, 2]),
        (supabase as any).from("jornada_sintese").select("classificacao").eq("user_id", uid).eq("jornada_slug", "primavera-2026").maybeSingle(),
      ]);
      const t = (Array.isArray(teste) ? teste[0] : null) as unknown as { agniPrincipal?: string | null; agravVataTags?: string | null; agravPittaTags?: string | null; agravKaphaTags?: string | null } | null;
      const n1 = (fichas ?? []).find((f: { noite: number }) => f.noite === 1)?.respostas as unknown as { q1?: string; q2?: string } | undefined;
      const n2 = (fichas ?? []).find((f: { noite: number }) => f.noite === 2)?.respostas as unknown as { foto_path?: string } | undefined;
      let foto: string | null = null;
      if (n2?.foto_path) {
        const { data: assinada } = await supabase.storage.from("linguas-jornada").createSignedUrl(n2.foto_path, 3600);
        foto = assinada?.signedUrl ?? null;
      }
      const relato = (n1?.q1 || n1?.q2 || "").trim();
      if (!ativo) return;
      setDados({
        tags: limpaTags(t?.agravVataTags, t?.agravPittaTags, t?.agravKaphaTags).slice(0, 8),
        agni: t?.agniPrincipal ?? null,
        foto,
        relato: relato ? (relato.length > 180 ? `${relato.slice(0, 177)}...` : relato) : null,
        classificacao: (sintese as { classificacao?: string } | null)?.classificacao ?? null,
      });
    })();
    return () => { ativo = false; };
  }, [uid, doshaResult?.idPublico]);

  const cabecalho = (texto: string) =>
    h("div", { className: "mx-auto flex max-w-[720px] flex-col gap-3 text-center" },
      h("p", { className: "m-0 text-[12px] font-bold uppercase tracking-[0.14em] text-[#B3622A]" }, "O seu mapa"),
      h("h2", { className: "m-0 font-serif text-[26px] md:text-[34px] leading-[1.2] font-bold text-[#1E2547] text-balance" }, "A sua jornada até aqui"),
      h("p", { className: "m-0 text-[16px] md:text-[17px] leading-[1.75] text-[#3A3550]" }, texto));

  if (!doshaResult) {
    return h("section", { className: "px-4 py-12 md:py-16" },
      h("div", { className: "mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center" },
        cabecalho("O Teste de Dosha mostra por onde o seu Detox começa. São uns oito minutos e não precisa de senha."),
        h(Link, { to: "/teste-de-dosha?redirect=/detox/inscricao", className: "inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-[#8C4513] px-7 text-[16px] font-semibold text-white hover:brightness-105" },
          "Fazer o meu Teste de Dosha", h(ArrowRight, { className: "h-5 w-5", "aria-hidden": true }))));
  }

  const principal = (doshaResult.doshaprincipal?.toLowerCase().match(/vata|pitta|kapha/)?.[0] || "vata") as DoshaNome;
  const scores = { vata: doshaResult.vatascore ?? 0, pitta: doshaResult.pittascore ?? 0, kapha: doshaResult.kaphascore ?? 0 };
  const nomeDosha = `${principal[0].toUpperCase()}${principal.slice(1)}, em ${getFaixa(principal, scores[principal]).toLowerCase()}`;
  const primeiroNome = (doshaResult.nome ?? "").trim().split(/\s+/)[0];

  return h("section", { className: "px-4 py-12 md:py-16" },
    h("div", { className: "mx-auto flex max-w-[1080px] flex-col gap-6" },
      cabecalho(`${primeiroNome && primeiroNome.toLowerCase() !== "visitante" ? `${primeiroNome}, isto` : "Isto"} é o que você trouxe nas três noites. É daqui que o seu Detox parte.`),
      h("div", { className: "grid gap-4 md:grid-cols-3" },
        cartao("Seu Teste de Dosha", Sparkles,
          h("div", { className: "mx-auto h-[190px] w-[190px]" },
            h(Suspense, { fallback: h(Skeleton, { className: "h-full w-full rounded-full" }) },
              h(DoshaPieChart, { vata: scores.vata, pitta: scores.pitta, kapha: scores.kapha, variant: "full" }))),
          h("p", { className: "m-0 text-center font-serif text-[20px] font-bold text-[#1E2547]" }, nomeDosha),
          dados?.agni ? h("p", { className: "m-0 text-center text-[14px] leading-relaxed text-[#6B6480]" }, dados.agni) : null),
        cartao("A sua língua", Camera,
          dados?.foto
            ? h("img", { src: dados.foto, alt: "A foto da sua língua", className: "aspect-square w-full rounded-2xl object-cover" })
            : h("div", { className: "flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#FBF1E7] p-6 text-center" },
                h(Camera, { className: "h-8 w-8 text-[#B3622A]", "aria-hidden": true }),
                h("p", { className: "m-0 text-[14px] leading-relaxed text-[#6B6480]" }, dados ? "A foto da noite 2 aparece aqui." : "Carregando o seu mapa...")),
          dados?.classificacao ? h("span", { className: "self-center rounded-full bg-[#E2F1E7] px-3 py-1 text-[13px] font-bold text-[#2F7650]" }, SELO[dados.classificacao] ?? "Leitura feita") : null),
        cartao("O que você trouxe", MessageCircle,
          dados && dados.tags.length
            ? h("div", { className: "flex flex-wrap gap-2" }, ...dados.tags.map((t, i) => h("span", { key: i, className: "rounded-full bg-[#FBEADB] px-3 py-1.5 text-[14px] text-[#8C4513]" }, t)))
            : null,
          dados?.relato ? h("blockquote", { className: "m-0 border-l-2 border-[#D9A77E] pl-3 font-serif text-[16px] italic leading-relaxed text-[#1E2547]" }, `"${dados.relato}"`) : null,
          !dados ? h(Skeleton, { className: "h-24 w-full" }) : null)),
      h("div", { className: "grid gap-3 rounded-3xl bg-[#1E2547] p-5 text-white md:grid-cols-[auto_1fr_1fr_1fr] md:items-center md:gap-5 md:p-6" },
        h("p", { className: "m-0 font-serif text-[18px] font-bold" }, "O que o Detox faz com isso"),
        ...[
          { Icone: Flame, cor: "text-[#F2A36B]", t: "Dissolve o que sobra" },
          { Icone: Waves, cor: "text-[#8CC3E0]", t: "Elimina o que se soltou" },
          { Icone: Sprout, cor: "text-[#8FD3A8]", t: "Restaura o que faltava" },
        ].map((p, i) => h("div", { key: i, className: "flex items-center gap-3" }, h(p.Icone, { className: `h-6 w-6 shrink-0 ${p.cor}`, "aria-hidden": true }), h("span", { className: "text-[15px] text-white/90" }, p.t)))),
      h(Link, { to: "/detox/mapa", className: "mx-auto inline-flex min-h-[48px] items-center gap-2 text-[15px] font-semibold text-[#8C4513] underline-offset-4 hover:underline" },
        dados?.classificacao ? "Ler a síntese da Akasha no meu mapa" : "Abrir o meu mapa completo", h(ArrowRight, { className: "h-4 w-4", "aria-hidden": true }))));
};

export default MeuMapaDetox;
