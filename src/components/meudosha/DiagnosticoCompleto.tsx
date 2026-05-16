import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Stethoscope, GitBranch, Compass, TrendingUp, BookOpen, Clock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ============ Tokens ============
const COLOR = {
  primary: "#352F54",
  secondary: "#FF7676",
  secondaryHover: "#FF5A5A",
  accent: "#FACC15",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#9ED88B",
  bgSoft: "#F8F9FA",
  surfaceSun: "#FFF8EE",
  ouro: "#C8922A",
  roxoSamkhya: "#7b4963",
  cardBorder: "#EDE4D3",
  texto: "#2C1A0E",
  textoSec: "#6B4C2A",
};

const LEAF = "rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm";

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";

const corDosha = (dosha: string): string => {
  const d = (dosha || "").trim();
  if (d.startsWith("Vata")) return COLOR.vata;
  if (d.startsWith("Pitta")) return COLOR.pitta;
  if (d.startsWith("Kapha")) return COLOR.kapha;
  return COLOR.primary;
};

// ============ Tipos ============
interface ProdutoExibicao {
  slug: string;
  nome_display: string;
  preco_normal: number;
  preco_pix: number;
  imagem_url: string | null;
  resumo_curto: string | null;
  tipo: "primario" | "upgrade" | "suplementar";
  basePath: "produto" | "kits";
}

interface PortalGlossario {
  resumo_curto: string | null;
  oque: string | null;
  alimentosEvitar: string | null;
  alimentosPriorizar: string | null;
  rotinasEquilibrar: string | null;
  dicasGeraisFazer: string | null;
}

// ============ Utils ============
function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function trunc(s: string | null | undefined, n: number): string {
  const t = stripHtml(s);
  if (!t) return "";
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "…";
}

// ============ Hook: análise + polling (inclui narrativa) ============
function useAnalise(email: string | null) {
  const [poll, setPoll] = useState(0);

  const analiseQ = useQuery({
    queryKey: ["meudosha-analise", email, poll],
    queryFn: async () => {
      if (!email) return null;
      const { data, error } = await premiumSupabase
        .from("objetivos_tratamento")
        .select("*")
        .eq("user_email", email)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) {
        console.warn("[analise] erro:", error.message);
        return null;
      }
      return (data as unknown as ObjetivoTratamento) || null;
    },
    enabled: !!email,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Polling: até análise existir E ter narrativa_clinica. Limite 20 ticks (~60s).
  useEffect(() => {
    if (!email) return;
    if (poll >= 20) return;
    const ready = analiseQ.data && analiseQ.data.narrativa_clinica;
    if (ready) return;
    const t = setTimeout(() => setPoll((n) => n + 1), 3000);
    return () => clearTimeout(t);
  }, [email, analiseQ.data, poll]);

  return {
    analise: analiseQ.data,
    analiseLoading: analiseQ.isLoading,
    analiseTimeout: !analiseQ.data && poll >= 20,
    narrativaPolling: !!analiseQ.data && !analiseQ.data.narrativa_clinica && poll < 20,
  };
}

// ============ Hook: glossário ============
function useGlossario(doshaCompleto: string | null) {
  return useQuery({
    queryKey: ["meudosha-glossario", doshaCompleto],
    queryFn: async (): Promise<PortalGlossario | null> => {
      if (!doshaCompleto) return null;
      const { data, error } = await supabase
        .from("portal_glossario")
        .select(`resumo_curto, oque, "alimentosEvitar", "alimentosPriorizar", "rotinasEquilibrar", "dicasGeraisFazer"`)
        .eq("doshanome", doshaCompleto)
        .maybeSingle();
      if (error || !data) return null;
      return data as PortalGlossario;
    },
    enabled: !!doshaCompleto,
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// ============ Hook: produtos prescritos ============
function useProdutosPrescritos(analise: ObjetivoTratamento | null | undefined) {
  return useQuery({
    queryKey: [
      "meudosha-produtos-prescritos",
      analise?.primario_slug,
      analise?.upgrade_kit_slug,
      analise?.suplementar_slug,
    ],
    queryFn: async (): Promise<ProdutoExibicao[]> => {
      if (!analise) return [];
      const slugs = [
        { slug: analise.primario_slug, tipo: "primario" as const },
        { slug: analise.upgrade_kit_slug, tipo: "upgrade" as const },
        { slug: analise.suplementar_slug, tipo: "suplementar" as const },
      ].filter((s) => !!s.slug);
      if (!slugs.length) return [];

      const slugList = slugs.map((s) => s.slug as string);

      const [{ data: produtos }, { data: kits }] = await Promise.all([
        lojaSupabase
          .from("produtos")
          .select("slug, nome_display, preco_normal, preco_pix, imagem_url, resumo_curto")
          .in("slug", slugList)
          .eq("ativo", true),
        lojaSupabase
          .from("kits")
          .select("slug, nome, preco_normal, preco_pix, imagem_url, descricao_curta")
          .in("slug", slugList)
          .eq("ativo", true),
      ]);

      const mapa = new Map<string, Omit<ProdutoExibicao, "tipo">>();
      (produtos || []).forEach((p: any) =>
        mapa.set(p.slug, {
          slug: p.slug,
          nome_display: p.nome_display,
          preco_normal: Number(p.preco_normal),
          preco_pix: Number(p.preco_pix),
          imagem_url: p.imagem_url,
          resumo_curto: p.resumo_curto,
          basePath: "produto",
        }),
      );
      (kits || []).forEach((k: any) =>
        mapa.set(k.slug, {
          slug: k.slug,
          nome_display: k.nome,
          preco_normal: Number(k.preco_normal),
          preco_pix: Number(k.preco_pix),
          imagem_url: k.imagem_url,
          resumo_curto: k.descricao_curta,
          basePath: "kits",
        }),
      );

      return slugs
        .map((s) => {
          const found = mapa.get(s.slug as string);
          return found ? { ...found, tipo: s.tipo } : null;
        })
        .filter((p): p is ProdutoExibicao => p !== null);
    },
    enabled: !!analise,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// ============ Sub-componentes de bloco ============
const LeftCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div
    className={cn("p-5 space-y-3", LEAF)}
    style={{ backgroundColor: COLOR.surfaceSun, border: `1px solid ${COLOR.cardBorder}` }}
  >
    <p
      className="text-[12px] font-semibold uppercase tracking-wider"
      style={{ color: COLOR.ouro, fontFamily: "'DM Sans', sans-serif" }}
    >
      {label}
    </p>
    {children}
  </div>
);

const RightCard = ({
  label,
  cor,
  children,
}: {
  label: string;
  cor: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn("p-5 space-y-3 transition-opacity duration-500", LEAF)}
    style={{
      backgroundColor: "#FFFFFF",
      borderLeft: `4px solid ${cor}`,
      border: `1px solid ${COLOR.cardBorder}`,
      borderLeftWidth: 4,
      borderLeftColor: cor,
    }}
  >
    <p
      className="text-[12px] font-semibold uppercase tracking-wider"
      style={{ color: cor, fontFamily: "'DM Sans', sans-serif" }}
    >
      {label}
    </p>
    {children}
  </div>
);

const AkashaPlaceholder = ({ cor }: { cor: string }) => (
  <div className="flex flex-col items-center text-center gap-2 py-3">
    <img src={AKASHA_LOGO} alt="Akasha" className="w-12 h-12 object-contain opacity-90" />
    <p
      className="text-sm font-medium leading-snug"
      style={{ color: COLOR.primary, fontFamily: "'DM Sans', sans-serif" }}
    >
      Akasha está lendo
      <br />
      seu resultado...
    </p>
    <div
      className="w-5 h-5 rounded-full border-2 animate-spin"
      style={{ borderColor: `${cor}40`, borderTopColor: cor }}
    />
  </div>
);

// ============ SEÇÃO 1 — Diagnóstico ============
const DiagnosticoCard = ({
  Icon,
  label,
  cor,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  cor: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn("p-5 space-y-3 transition-opacity duration-500", LEAF)}
    style={{
      backgroundColor: "#FFFFFF",
      border: `1px solid ${COLOR.cardBorder}`,
      borderLeftWidth: 4,
      borderLeftColor: cor,
    }}
  >
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 shrink-0" style={{ color: cor }} />
      <p
        className="text-[12px] font-semibold uppercase tracking-wider"
        style={{ color: cor, fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
    </div>
    {children}
  </div>
);

const Diagnostico = ({
  analise,
  doshaPrincipal,
  doshaPrincipalCompleto,
}: {
  analise: ObjetivoTratamento;
  doshaPrincipal: string;
  doshaPrincipalCompleto: string;
}) => {
  const cor = corDosha(doshaPrincipal);
  const narr = analise.narrativa_clinica;

  const blocos: { label: string; texto: string | undefined; Icon: LucideIcon }[] = [
    { label: "Sua Situação Atual", texto: narr?.bloco_1_situacao, Icon: Stethoscope },
    { label: "O Que Te Trouxe Aqui", texto: narr?.bloco_2_causas, Icon: GitBranch },
    { label: "Seus Caminhos para Melhorar", texto: narr?.bloco_3_caminhos, Icon: Compass },
  ];

  const deficits = (analise.deficit_doshas ?? []).filter(Boolean);

  return (
    <section className="space-y-6">
      <h2
        className="font-serif font-bold text-2xl md:text-3xl text-left"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        Seu Diagnóstico: <span style={{ color: cor }}>{doshaPrincipalCompleto}</span>
      </h2>

      <div className="space-y-4">
        {blocos.map((b, idx) => (
          <DiagnosticoCard key={idx} Icon={b.Icon} label={b.label} cor={cor}>
            {b.texto ? (
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: COLOR.texto, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}
              >
                {b.texto}
              </p>
            ) : (
              <AkashaPlaceholder cor={cor} />
            )}
          </DiagnosticoCard>
        ))}

        {deficits.map((d, idx) => (
          <DiagnosticoCard key={`def-${idx}`} Icon={TrendingUp} label="Dosha em Déficit" cor={cor}>
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: COLOR.texto, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}
            >
              {d}
            </p>
          </DiagnosticoCard>
        ))}
      </div>
    </section>
  );
};

// ============ SEÇÃO 2 — Protocolo Samkhya ============
const BADGE_TIPO: Record<string, { label: string; bg: string; cor: string }> = {
  primario: { label: "PRINCIPAL", bg: COLOR.roxoSamkhya, cor: "#fff" },
  upgrade: { label: "COMPLEMENTAR", bg: COLOR.ouro, cor: "#fff" },
  suplementar: { label: "SUPORTE", bg: COLOR.accent, cor: COLOR.primary },
};

const ProtocoloSamkhya = ({
  analise,
  produtos,
}: {
  analise: ObjetivoTratamento;
  produtos: ProdutoExibicao[];
}) => {
  if (!produtos.length) return null;

  return (
    <section className="space-y-4 pt-12">
      <div className="space-y-1 text-left">
        <h2
          className="font-serif font-bold text-xl md:text-2xl"
          style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
        >
          Seu Protocolo Samkhya
        </h2>
        {analise.frase_clinica && (
          <p
            className="text-sm md:text-base font-medium"
            style={{ color: COLOR.ouro, fontFamily: "'DM Sans', sans-serif" }}
          >
            {analise.frase_clinica}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {produtos.map((p) => {
          const badge = BADGE_TIPO[p.tipo];
          return (
            <div
              key={p.slug}
              className={cn("relative bg-white p-5 flex flex-col gap-3", LEAF)}
              style={{
                border: `1px solid ${COLOR.cardBorder}`,
                boxShadow: "0 1px 8px rgba(53,47,84,0.08)",
              }}
            >
              <span
                className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-1 rounded-full tracking-wide"
                style={{ backgroundColor: badge.bg, color: badge.cor }}
              >
                {badge.label}
              </span>

              <div className="flex justify-center">
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome_display}
                    className="w-[100px] h-[100px] object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-[100px] h-[100px] bg-muted rounded-lg" />
                )}
              </div>

              <div className="space-y-1 flex-1">
                <h3
                  className="font-serif font-bold text-base leading-tight"
                  style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
                >
                  {p.nome_display}
                </h3>
                {p.resumo_curto && (
                  <p
                    className="text-[13px] leading-snug"
                    style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {p.resumo_curto}
                  </p>
                )}
              </div>

              <div className="space-y-0.5">
                <p
                  className="text-[13px] line-through"
                  style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
                >
                  R$ {p.preco_normal.toFixed(2).replace(".", ",")}
                </p>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: COLOR.ouro, fontFamily: "'DM Sans', sans-serif" }}
                >
                  R$ {p.preco_pix.toFixed(2).replace(".", ",")}{" "}
                  <span className="text-xs font-medium">no PIX</span>
                </p>
              </div>

              <Link
                to={`/samkhya/${p.basePath}/${p.slug}`}
                className={cn(
                  "block text-center py-2.5 px-4 text-white font-medium text-sm transition-colors mt-auto",
                  LEAF,
                )}
                style={{ backgroundColor: COLOR.secondary, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLOR.secondaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLOR.secondary)}
              >
                Ver produto →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ============ SEÇÃO 3 — Plano 30 Dias 🔒 ============
const Plano30DiasBloqueado = () => (
  <section className="space-y-4 pt-12">
    <h2
      className="font-serif font-bold text-xl md:text-2xl"
      style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
    >
      Seu Plano de 30 Dias
    </h2>

    <Link
      to="/assinar"
      aria-label="Conheça o Portal Premium"
      className={cn("block overflow-hidden hover:opacity-95 transition-opacity", LEAF)}
    >
      <img
        src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-um-sf300x.webp"
        alt="Desbloqueie seu plano personalizado de 30 dias no Portal Premium"
        loading="lazy"
        className="block w-full h-auto"
        style={{ transform: "scale(1.03)", transformOrigin: "center" }}
      />
    </Link>
  </section>
);


// ============ SEÇÃO 4 — Próximos Passos ============
const ProximoPassoCard = ({
  children,
  titulo,
  descricao,
  href,
  tint,
}: {
  children: React.ReactNode;
  titulo: string;
  descricao: string;
  href: string;
  tint: string;
}) => (
  <Link
    to={href}
    className={cn(
      "group block bg-white p-4 aspect-square flex flex-col items-center justify-center text-center gap-2 transition-all hover:-translate-y-0.5",
      LEAF,
    )}
    style={{
      border: `1px solid ${COLOR.cardBorder}`,
      boxShadow: "0 1px 8px rgba(53,47,84,0.08)",
    }}
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${tint}26`, border: `2px solid ${tint}` }}
    >
      {children}
    </div>
    <h3
      className="font-serif font-bold text-sm leading-tight"
      style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
    >
      {titulo}
    </h3>
    <p
      className="text-[12px] leading-snug"
      style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
    >
      {descricao}
    </p>
  </Link>
);

interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

const topDoshaSlug = (scores: DoshaScores): "vata" | "pitta" | "kapha" => {
  const arr: { k: "vata" | "pitta" | "kapha"; v: number }[] = [
    { k: "vata", v: scores.vata },
    { k: "pitta", v: scores.pitta },
    { k: "kapha", v: scores.kapha },
  ];
  arr.sort((a, b) => b.v - a.v);
  return arr[0].k;
};

const DOSHA_LABEL: Record<"vata" | "pitta" | "kapha", string> = {
  vata: "Vata",
  pitta: "Pitta",
  kapha: "Kapha",
};

const ProximosPassos = ({
  refazerTeste,
  scores,
}: {
  refazerTeste: () => void;
  scores: DoshaScores;
}) => {
  const top = topDoshaSlug(scores);
  const label = DOSHA_LABEL[top];
  const cor = corDosha(label);

  return (
    <section className="space-y-4 pt-12">
      <h2
        className="font-serif font-bold text-xl md:text-2xl text-left"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        Próximos Passos
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl">
        <ProximoPassoCard
          titulo={`Biblioteca ${label}`}
          descricao="Vídeos e conteúdos do seu dosha"
          href={`/biblioteca/${top}`}
          tint={cor}
        >
          <BookOpen className="w-7 h-7" style={{ color: cor }} strokeWidth={1.75} />
        </ProximoPassoCard>
        <ProximoPassoCard
          titulo={`Horários ${label}`}
          descricao="Rotina ideal para equilibrar"
          href={`/biblioteca/${top}/horarios`}
          tint={cor}
        >
          <Clock className="w-7 h-7" style={{ color: cor }} strokeWidth={1.75} />
        </ProximoPassoCard>
        <ProximoPassoCard
          titulo="Vídeos"
          descricao="Aulas e vídeos personalizados"
          href="/meu-dosha?tab=videos"
          tint={COLOR.secondary}
        >
          <Play className="w-7 h-7" style={{ color: COLOR.secondary }} strokeWidth={1.75} />
        </ProximoPassoCard>
        <ProximoPassoCard
          titulo="Akasha"
          descricao="Sua consultora de Ayurveda 24h"
          href="/meu-dosha?tab=akasha"
          tint={COLOR.primary}
        >
          <img
            src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-akasha.svg"
            alt="Akasha"
            className="w-7 h-7 object-contain"
          />
        </ProximoPassoCard>
      </div>
    </section>
  );
};

// ============ Componente principal ============
interface DiagnosticoCompletoProps {
  email: string | null;
  doshaPrincipal: string;
  doshaPrincipalCompleto: string;
  refazerTeste: () => void;
  scores: DoshaScores;
}

const DiagnosticoCompleto = ({
  email,
  doshaPrincipal,
  doshaPrincipalCompleto,
  refazerTeste,
  scores,
}: DiagnosticoCompletoProps) => {
  const { analise, analiseLoading, analiseTimeout } = useAnalise(email);
  const { data: produtos } = useProdutosPrescritos(analise);
  const { data: glossario } = useGlossario(doshaPrincipalCompleto);

  if (analiseLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLOR.primary }} />
        <p className="text-sm" style={{ color: COLOR.textoSec }}>
          Carregando seu diagnóstico personalizado...
        </p>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="space-y-6 pt-12">
        <div
          className={cn("bg-white p-6 text-center", LEAF)}
          style={{ border: `1px solid ${COLOR.cardBorder}` }}
        >
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: COLOR.primary }} />
          <p className="text-sm" style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}>
            {analiseTimeout
              ? "Seu diagnóstico está sendo processado. Tente atualizar a página."
              : "Akasha está preparando sua análise..."}
          </p>
        </div>
        <ProximosPassos refazerTeste={refazerTeste} scores={scores} />
      </div>
    );
  }

  return (
    <div className="space-y-0 pt-12 pb-12">
      <Diagnostico
        analise={analise}
        doshaPrincipal={doshaPrincipal}
        doshaPrincipalCompleto={doshaPrincipalCompleto}
      />
      <ProximosPassos refazerTeste={refazerTeste} scores={scores} />
      <Plano30DiasBloqueado />
      {!!produtos?.length && <ProtocoloSamkhya analise={analise} produtos={produtos} />}
    </div>
  );
};

export default DiagnosticoCompleto;
