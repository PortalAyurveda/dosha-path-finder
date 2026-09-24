// Noite 3 do mapa: "O mapa da sua jornada, descrito pela Akasha I.A." Escrita com createElement (sem JSX).
import { createElement as h, useEffect, useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import ChamadaInscricao from "@/components/detox/ChamadaInscricao";

const ABRE = Date.parse("2026-09-24T22:00:00Z");
type Sintese = { texto: string; classificacao: "assertiva" | "neutra" | "duvidosa" };

const SELO = {
  assertiva: { rotulo: "Leitura assertiva", classe: "bg-kapha-1 text-kapha-5" },
  neutra: { rotulo: "Leitura neutra", classe: "bg-muted text-muted-foreground" },
  duvidosa: { rotulo: "Leitura duvidosa", classe: "bg-vata-1 text-vata-5" },
};
const COR_DOSHA: Record_ = { vata: "text-vata-5", pitta: "text-pitta-5", kapha: "text-kapha-5" };
type Record_ = { [k: string]: string };

const comDoshas = (paragrafo: string, chave: number) =>
  h("p", { key: chave, className: "m-0 text-base leading-relaxed text-detox-text md:text-[17px]" },
    ...paragrafo.split(/(vata|pitta|kapha)/i).map((parte, i) => {
      const cor = COR_DOSHA[parte.toLowerCase()];
      return cor ? h("span", { key: i, className: `font-bold ${cor}` }, parte) : parte;
    }));

const SinteseAkasha = ({ uid, completo }: { uid: string | null; completo: boolean }) => {
  const [agora, setAgora] = useState(() => Date.now());
  const [sintese, setSintese] = useState(null as Sintese | null);
  const [carregando, setCarregando] = useState(true);
  const aberta = agora >= ABRE;

  useEffect(() => {
    const timer = window.setInterval(() => setAgora(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ativo = true;
    if (!uid || !aberta) {
      setCarregando(false);
      return () => { ativo = false; };
    }
    const buscar = async () => {
      const { data } = await (supabase as any)
        .from("jornada_sintese")
        .select("texto, classificacao")
        .eq("user_id", uid)
        .eq("jornada_slug", "primavera-2026")
        .maybeSingle();
      if (!ativo) return;
      setSintese((data as Sintese | null) ?? null);
      setCarregando(false);
    };
    setCarregando(true);
    void buscar();
    const timer = window.setInterval(() => { void buscar(); }, 60000);
    return () => { ativo = false; window.clearInterval(timer); };
  }, [uid, aberta]);

  const cabecalho = h("div", { className: "mb-5" },
    h("div", { className: "mb-2 flex flex-wrap items-center gap-3" },
      h("p", { className: "m-0 text-xs font-bold uppercase text-detox-dark" }, "Noite 3"),
      aberta ? h("span", { className: "rounded-full bg-kapha-1 px-3 py-1 text-xs font-bold text-kapha-5" }, "Aberta hoje") : h("span", { className: "rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground" }, "Abre quinta, 19h")),
    h("h2", { className: "m-0 font-serif text-2xl font-bold text-detox-text md:text-3xl" }, "O mapa da sua jornada, descrito pela Akasha I.A."));

  const cartao = (...filhos: unknown[]) =>
    h("div", { className: "rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8" }, ...(filhos as never[]));

  let corpo;
  if (!aberta) {
    corpo = h("div", { className: "flex items-start gap-4 rounded-[32px] border border-detox-card-border bg-detox-card p-6 shadow-detox md:p-8" },
      h("div", { className: "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground" }, h(Lock, { className: "h-4 w-4" })),
      h("p", { className: "m-0 text-sm leading-relaxed text-detox-muted md:text-base" },
        "Abre na quinta, 24 de setembro, às 19h. A Akasha lê o seu Teste de Dosha, as três respostas da noite 1 e a leitura da sua língua, e escreve a síntese da sua jornada."));
  } else if (carregando) {
    corpo = cartao(h(Skeleton, { className: "h-6 w-2/3" }), h(Skeleton, { className: "mt-4 h-32 w-full" }), h(Skeleton, { className: "mt-4 h-32 w-full" }));
  } else if (sintese) {
    const selo = SELO[sintese.classificacao] ?? SELO.neutra;
    corpo = cartao(
      h("div", { className: "mb-5 flex flex-wrap items-center gap-3" },
        h("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-detox-primary-soft text-detox-dark" }, h(Sparkles, { className: "h-5 w-5" })),
        h("p", { className: "m-0 font-serif text-xl font-bold text-detox-text" }, "A síntese da sua jornada"),
        h("span", { className: `rounded-full px-3 py-1 text-xs font-bold ${selo.classe}` }, selo.rotulo)),
      h("div", { className: "flex flex-col gap-4" }, ...sintese.texto.split(/\n\s*\n/).filter(Boolean).map((p, i) => comDoshas(p.trim(), i))));
  } else if (completo) {
    corpo = cartao(
      h("p", { className: "m-0 font-serif text-xl font-bold text-detox-text" }, "A Akasha está escrevendo a sua síntese"),
      h("p", { className: "m-0 mt-2 text-sm leading-relaxed text-detox-muted md:text-base" }, "O seu mapa está completo. A síntese aparece aqui sozinha em alguns minutos, pode deixar esta página aberta."));
  } else {
    corpo = cartao(
      h("p", { className: "m-0 font-serif text-xl font-bold text-detox-text" }, "Falta pouco para a Akasha ler o seu mapa"),
      h("p", { className: "m-0 mt-2 text-sm leading-relaxed text-detox-muted md:text-base" }, "A síntese sai para quem completou as três partes: o Teste de Dosha, as três perguntas da noite 1 e a leitura da língua da noite 2. Complete o que falta aqui em cima e a Akasha escreve a sua."));
  }

  return h("section", { className: "border-t border-detox-divider pt-[26px]" },
    cabecalho,
    corpo,
    h("div", { className: "mt-6" }, h(ChamadaInscricao, { compacta: true })));
};

export default SinteseAkasha;
