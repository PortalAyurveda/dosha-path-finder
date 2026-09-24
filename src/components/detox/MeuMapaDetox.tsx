// Mapa pessoal compacto exibido na inscrição somente para quem já fez o Teste de Dosha.
import { createElement as h, lazy, Suspense, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";

const DoshaPieChart = lazy(() => import("@/components/charts/DoshaPieChart"));
type Dados = { tags: string[]; agni: string | null; foto: string | null; relato: string | null; classificacao: string | null };
const SELO: Record<string, string> = { assertiva: "Leitura assertiva", neutra: "Leitura neutra", duvidosa: "Leitura duvidosa" };
const limpaTags = (...listas: (string | null | undefined)[]) => listas.flatMap((l) => (l ?? "").split(",")).map((t) => t.trim()).filter((t) => t && t.toLowerCase() !== "nenhum");

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
        relato: relato ? (relato.length > 130 ? `${relato.slice(0, 127)}...` : relato) : null,
        classificacao: (sintese as { classificacao?: string } | null)?.classificacao ?? null,
      });
    })();
    return () => { ativo = false; };
  }, [uid, doshaResult?.idPublico]);

  if (!doshaResult) return null;

  const principal = (doshaResult.doshaprincipal?.toLowerCase().match(/vata|pitta|kapha/)?.[0] || "vata") as DoshaNome;
  const scores = { vata: doshaResult.vatascore ?? 0, pitta: doshaResult.pittascore ?? 0, kapha: doshaResult.kaphascore ?? 0 };
  const nomeDosha = `${principal[0].toUpperCase()}${principal.slice(1)}, em ${getFaixa(principal, scores[principal]).toLowerCase()}`;

  return h("section", { className: "bg-gradient-to-b from-[#FDF7F1] to-[#FBE3CC] px-4 py-8 md:py-12" },
    h("div", { className: "mx-auto max-w-[1080px] overflow-hidden rounded-3xl bg-white/90 shadow-[0_18px_50px_-30px_rgba(53,47,84,0.35)]" },
      h("div", { className: "grid items-center gap-5 p-5 md:grid-cols-[120px_110px_1fr] md:p-6" },
        h("div", { className: "flex items-center gap-4 md:flex-col md:gap-1" },
          h("div", { className: "h-24 w-24 shrink-0" }, h(Suspense, { fallback: h(Skeleton, { className: "h-full w-full rounded-full" }) }, h(DoshaPieChart, { vata: scores.vata, pitta: scores.pitta, kapha: scores.kapha, variant: "full" }))),
          h("p", { className: "m-0 font-serif text-[18px] font-bold text-[#352F54] md:text-center" }, nomeDosha)),
        dados?.foto
          ? h("div", { className: "flex items-center gap-3 md:flex-col" }, h("img", { src: dados.foto, alt: "A foto da sua língua", className: "h-[88px] w-[88px] rounded-xl object-cover" }), dados.classificacao ? h("span", { className: "rounded-full bg-[#E2F1E7] px-3 py-1 text-[12px] font-bold text-[#2F7650]" }, SELO[dados.classificacao] ?? "Leitura feita") : null)
          : h("div", { className: "flex h-[88px] w-[88px] items-center justify-center rounded-xl bg-[#FBE3CC]" }, h(Camera, { className: "h-7 w-7 text-[#E07B39]", "aria-hidden": true })),
        h("div", { className: "flex min-w-0 flex-col gap-3" },
          h("div", null, h("p", { className: "m-0 text-[15px] font-bold uppercase text-[#A85A1A]" }, "A sua jornada até aqui"), dados?.agni ? h("p", { className: "m-0 mt-1 text-[15px] text-[#514B62]" }, dados.agni) : null),
          dados?.tags.length ? h("div", { className: "flex flex-wrap gap-2" }, ...dados.tags.map((t, i) => h("span", { key: i, className: "rounded-full bg-[#FBE3CC] px-3 py-1.5 text-[13px] font-semibold text-[#A85A1A]" }, t))) : null,
          dados?.relato ? h("p", { className: "m-0 text-[15px] leading-relaxed text-[#514B62]" }, `“${dados.relato}”`) : null)),
      h("p", { className: "m-0 bg-[#FFF0E3] px-5 py-4 text-[15px] font-semibold leading-relaxed text-[#352F54] md:px-6" }, "É daqui que o seu Detox parte: dissolver o que sobra, eliminar o que se soltou e restaurar o que faltava.")));
};

export default MeuMapaDetox;
