import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ============ Tokens (espelham o brief) ============
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

// Forma de Folha (cantos opostos arredondados)
const LEAF = "rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm";
const LEAF_SM = "rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm";

const DOSHA_COLOR: Record<string, string> = {
  Vata: COLOR.vata, Pitta: COLOR.pitta, Kapha: COLOR.kapha,
  vata: COLOR.vata, pitta: COLOR.pitta, kapha: COLOR.kapha,
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

interface DicaPlano {
  titulo: string;
  acao_pratica: string;
  explicacao: string;
  categoria: string;
  dificuldade: string;
  pilar?: string;
}

interface SemanaPlano {
  numero: number;
  titulo: string;
  foco?: string;
  dicas?: DicaPlano[];
  alimentacao?: any;
  ervas?: any;
  rotina?: any;
  comportamento?: any;
}

interface Plano30Json {
  semanas?: SemanaPlano[];
  [k: string]: any;
}

// Normaliza dicas legadas (campos separados por categoria)
function normalizarDicas(s: SemanaPlano): DicaPlano[] {
  if (Array.isArray(s.dicas) && s.dicas.length) return s.dicas;
  const out: DicaPlano[] = [];
  const fromField = (f: any, categoria: string) => {
    if (!f) return;
    const arr = Array.isArray(f) ? f : [f];
    for (const item of arr) {
      if (typeof item === "string") {
        out.push({ titulo: item, acao_pratica: "", explicacao: "", categoria, dificuldade: "Fácil" });
      } else if (item && typeof item === "object") {
        out.push({
          titulo: item.titulo || item.nome || "Dica",
          acao_pratica: item.acao_pratica || item.acao || "",
          explicacao: item.explicacao || item.descricao || "",
          categoria,
          dificuldade: item.dificuldade || "Fácil",
        });
      }
    }
  };
  fromField(s.alimentacao, "alimentação");
  fromField(s.ervas, "ervas");
  fromField(s.rotina, "rotina");
  fromField(s.comportamento, "comportamento");
  return out;
}

const CATEGORIA_META: Record<string, { icon: string; label: string; cor: string }> = {
  "alimentação": { icon: "🥗", label: "ALIMENTAÇÃO", cor: COLOR.kapha },
  "alimentacao": { icon: "🥗", label: "ALIMENTAÇÃO", cor: COLOR.kapha },
  "ervas": { icon: "🌿", label: "ERVAS", cor: COLOR.kapha },
  "rotina": { icon: "🔄", label: "ROTINA", cor: COLOR.vata },
  "comportamento": { icon: "💭", label: "COMPORTAMENTO", cor: COLOR.pitta },
};

const DIFICULDADE_COR: Record<string, string> = {
  "Fácil": COLOR.kapha,
  "Médio": COLOR.accent,
  "Difícil": COLOR.secondary,
};

// ============ Hook: análise + plano com polling ============
function useAnaliseEPlano(email: string | null) {
  const [pollAnalise, setPollAnalise] = useState(0);
  const [pollPlano, setPollPlano] = useState(0);

  const analiseQ = useQuery({
    queryKey: ["meudosha-analise", email, pollAnalise],
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

  const planoQ = useQuery({
    queryKey: ["meudosha-plano", email, pollPlano],
    queryFn: async () => {
      if (!email) return null;
      const { data, error } = await supabase
        .from("plano_30_dias" as any)
        .select("plano_json, total_dicas_usadas")
        .eq("user_email", email)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) return null;
      return data as any;
    },
    enabled: !!email,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Polling análise: 3s × 60s
  useEffect(() => {
    if (!email || analiseQ.data || pollAnalise >= 20) return;
    const t = setTimeout(() => setPollAnalise((n) => n + 1), 3000);
    return () => clearTimeout(t);
  }, [email, analiseQ.data, pollAnalise]);

  // Polling plano: 5s × 120s, somente após análise existir
  useEffect(() => {
    if (!email || !analiseQ.data || planoQ.data || pollPlano >= 24) return;
    const t = setTimeout(() => setPollPlano((n) => n + 1), 5000);
    return () => clearTimeout(t);
  }, [email, analiseQ.data, planoQ.data, pollPlano]);

  return {
    analise: analiseQ.data,
    analiseLoading: analiseQ.isLoading,
    analiseTimeout: !analiseQ.data && pollAnalise >= 20,
    plano: planoQ.data,
    planoLoading: planoQ.isLoading || (!!analiseQ.data && !planoQ.data && pollPlano < 24),
  };
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

// ============ SEÇÃO A — Quadro Clínico ============
const QuadroClinico = ({
  analise,
  doshaPrincipal,
}: {
  analise: ObjetivoTratamento;
  doshaPrincipal: string;
}) => {
  const corDosha = DOSHA_COLOR[doshaPrincipal] || COLOR.primary;
  const causas = Array.isArray(analise.causas) ? analise.causas : [];
  const objetivos = Array.isArray(analise.objetivos) ? analise.objetivos : [];

  return (
    <div
      className={cn("bg-white p-5 md:p-6 space-y-4", LEAF)}
      style={{
        borderLeft: `4px solid ${corDosha}`,
        boxShadow: "0 1px 8px rgba(53,47,84,0.08)",
      }}
    >
      <h2
        className="font-serif font-bold text-xl md:text-2xl"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        O que está acontecendo no seu corpo
      </h2>

      {analise.o_que_e && (
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: COLOR.texto, fontFamily: "'DM Sans', sans-serif" }}
        >
          {analise.o_que_e}
        </p>
      )}

      {causas.length > 0 && (
        <ul className="space-y-1.5">
          {causas.map((c, i) => (
            <li
              key={i}
              className="text-sm md:text-base leading-relaxed flex gap-2"
              style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="shrink-0">⚠️</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}

      {objetivos.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {objetivos.map((o, i) => (
            <li
              key={i}
              className="text-sm md:text-base leading-relaxed flex gap-2"
              style={{ color: COLOR.texto, fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="shrink-0">🎯</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============ SEÇÃO B — Protocolo Samkhya ============
const BADGE_TIPO: Record<string, { label: string; bg: string; cor: string }> = {
  primario: { label: "PRINCIPAL ★", bg: COLOR.roxoSamkhya, cor: "#fff" },
  upgrade: { label: "KIT COMPLETO", bg: COLOR.ouro, cor: "#fff" },
  suplementar: { label: "SUPLEMENTAR", bg: COLOR.accent, cor: COLOR.primary },
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
    <section className="space-y-4">
      <div className="space-y-1 text-center md:text-left">
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
              className={cn("relative bg-white p-4 flex flex-col gap-3", LEAF)}
              style={{
                border: `1px solid ${COLOR.cardBorder}`,
                boxShadow: "0 1px 8px rgba(53,47,84,0.08)",
              }}
            >
              <span
                className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-1 rounded-md tracking-wide"
                style={{ backgroundColor: badge.bg, color: badge.cor }}
              >
                {badge.label}
              </span>

              <div className="flex justify-center">
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome_display}
                    className="w-[120px] h-[120px] object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] bg-muted rounded-lg" />
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
                    className="text-sm leading-snug"
                    style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {p.resumo_curto}
                  </p>
                )}
              </div>

              <div className="space-y-0.5">
                <p
                  className="text-xs line-through"
                  style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
                >
                  R$ {p.preco_normal.toFixed(2).replace(".", ",")}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: COLOR.ouro, fontFamily: "'DM Sans', sans-serif" }}
                >
                  R$ {p.preco_pix.toFixed(2).replace(".", ",")}{" "}
                  <span className="text-xs font-medium">no PIX</span>
                </p>
              </div>

              <Link
                to={`/samkhya/${p.basePath}/${p.slug}`}
                className={cn(
                  "block text-center py-2.5 px-4 text-white font-medium text-sm transition-colors",
                  LEAF,
                )}
                style={{
                  backgroundColor: COLOR.secondary,
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLOR.secondaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLOR.secondary)
                }
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

// ============ SEÇÃO C — Plano 30 Dias ============
const SemanaAccordion = ({
  semana,
  isOpen,
  onToggle,
}: {
  semana: SemanaPlano;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const dicas = normalizarDicas(semana);
  const grupos = dicas.reduce<Record<string, DicaPlano[]>>((acc, d) => {
    const key = (d.categoria || "").toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className={cn("bg-white overflow-hidden", LEAF)} style={{ border: `1px solid ${COLOR.cardBorder}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <h3
            className="font-serif font-bold text-base md:text-lg"
            style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
          >
            Semana {semana.numero}: {semana.titulo}
          </h3>
          {semana.foco && (
            <p className="text-xs" style={{ color: COLOR.textoSec }}>
              {semana.foco}
            </p>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 shrink-0" style={{ color: COLOR.primary }} />
        ) : (
          <ChevronRight className="w-5 h-5 shrink-0" style={{ color: COLOR.primary }} />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-5">
          {Object.entries(grupos).map(([cat, items]) => {
            const meta = CATEGORIA_META[cat] || { icon: "•", label: cat.toUpperCase(), cor: COLOR.primary };
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>{meta.icon}</span>
                  <span
                    className="text-xs font-bold tracking-wider px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: meta.cor }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((d, i) => (
                    <div
                      key={i}
                      className={cn("relative p-3 pr-20", LEAF_SM)}
                      style={{
                        backgroundColor: COLOR.surfaceSun,
                        border: `1px solid ${COLOR.cardBorder}`,
                      }}
                    >
                      {d.dificuldade && (
                        <span
                          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: DIFICULDADE_COR[d.dificuldade] || COLOR.primary }}
                        >
                          {d.dificuldade}
                        </span>
                      )}
                      <h4
                        className="font-serif font-bold text-sm mb-1"
                        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
                      >
                        {d.titulo}
                      </h4>
                      {d.explicacao && (
                        <p
                          className="text-sm leading-snug mb-1"
                          style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {d.explicacao}
                        </p>
                      )}
                      {d.acao_pratica && (
                        <p
                          className="text-sm italic leading-snug"
                          style={{ color: COLOR.texto, fontFamily: "'DM Sans', sans-serif" }}
                        >
                          → Como fazer: {d.acao_pratica}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {dicas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma dica disponível para esta semana.</p>
          )}
        </div>
      )}
    </div>
  );
};

const Plano30Dias = ({ plano, loading }: { plano: any; loading: boolean }) => {
  const [openWeek, setOpenWeek] = useState<number>(1);

  return (
    <section className="space-y-4">
      <h2
        className="font-serif font-bold text-xl md:text-2xl"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        Seu Plano de 30 Dias
      </h2>

      {loading || !plano?.plano_json ? (
        <div
          className={cn("bg-white p-6 flex flex-col items-center gap-3 text-center", LEAF)}
          style={{ border: `1px solid ${COLOR.cardBorder}` }}
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLOR.primary }} />
          <p className="text-sm" style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}>
            Seu plano personalizado está sendo gerado. Geralmente fica pronto 1 minuto após o teste.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(((plano.plano_json as Plano30Json)?.semanas || []) as SemanaPlano[]).map((s) => (
            <SemanaAccordion
              key={s.numero}
              semana={s}
              isOpen={openWeek === s.numero}
              onToggle={() => setOpenWeek(openWeek === s.numero ? -1 : s.numero)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ============ SEÇÃO D — Próximos Passos ============
const ProximoPassoCard = ({
  icone,
  titulo,
  descricao,
  preco,
  ctaLabel,
  href,
  externo,
}: {
  icone: string;
  titulo: string;
  descricao: string;
  preco?: string;
  ctaLabel: string;
  href: string;
  externo?: boolean;
}) => {
  const cardInner = (
    <div
      className={cn("bg-white p-5 flex flex-col gap-3 h-full", LEAF)}
      style={{
        border: `1px solid ${COLOR.cardBorder}`,
        boxShadow: "0 1px 8px rgba(53,47,84,0.08)",
      }}
    >
      <div className="text-4xl text-center">{icone}</div>
      <h3
        className="font-serif font-bold text-base text-center"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        {titulo}
      </h3>
      <p
        className="text-sm text-center leading-snug flex-1"
        style={{ color: COLOR.textoSec, fontFamily: "'DM Sans', sans-serif" }}
      >
        {descricao}
      </p>
      {preco && (
        <p
          className="font-serif font-bold text-lg text-center"
          style={{ color: COLOR.ouro, fontFamily: "'Roboto Serif', serif" }}
        >
          {preco}
        </p>
      )}
      <span
        className={cn("block text-center py-2.5 px-4 text-white font-medium text-sm", LEAF)}
        style={{ backgroundColor: COLOR.secondary, fontFamily: "'DM Sans', sans-serif" }}
      >
        {ctaLabel}
      </span>
    </div>
  );

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {cardInner}
      </a>
    );
  }
  return (
    <Link to={href} className="block">
      {cardInner}
    </Link>
  );
};

const ProximosPassos = ({ refazerTeste }: { refazerTeste: () => void }) => {
  return (
    <section className="space-y-4">
      <h2
        className="font-serif font-bold text-xl md:text-2xl text-center"
        style={{ color: COLOR.primary, fontFamily: "'Roboto Serif', serif" }}
      >
        Próximos Passos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProximoPassoCard
          icone="🧘"
          titulo="Curso de Rotinas Diárias"
          descricao="Construa hábitos ayurvédicos no dia a dia"
          preco="R$ 99"
          ctaLabel="Conhecer →"
          href="https://www.portalayurveda.com/curso-rotinas"
          externo
        />
        <ProximoPassoCard
          icone="📚"
          titulo="Curso de Alimentação Ayurvédica"
          descricao="A base do seu tratamento"
          preco="R$ 397"
          ctaLabel="Conhecer →"
          href="https://www.portalayurveda.com/promocao-alimentacao"
          externo
        />
        <ProximoPassoCard
          icone="🛍️"
          titulo="Ver produtos Samkhya"
          descricao="Produtos curativos personalizados"
          ctaLabel="Ver loja →"
          href="/samkhya"
        />
      </div>

      <div className="pt-4 flex justify-center">
        <Button variant="outline" onClick={refazerTeste} className="text-sm">
          Refazer Teste
        </Button>
      </div>
    </section>
  );
};

// ============ Componente principal ============
interface DiagnosticoCompletoProps {
  email: string | null;
  doshaPrincipal: string;
  refazerTeste: () => void;
}

const DiagnosticoCompleto = ({ email, doshaPrincipal, refazerTeste }: DiagnosticoCompletoProps) => {
  const { analise, analiseLoading, analiseTimeout, plano, planoLoading } = useAnaliseEPlano(email);
  const { data: produtos } = useProdutosPrescritos(analise);

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
              ? "Seu diagnóstico completo está sendo processado. Volte em instantes."
              : "Carregando análise clínica..."}
          </p>
        </div>
        <ProximosPassos refazerTeste={refazerTeste} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pt-12 pb-12">
      <QuadroClinico analise={analise} doshaPrincipal={doshaPrincipal} />
      {!!produtos?.length && <ProtocoloSamkhya analise={analise} produtos={produtos} />}
      <Plano30Dias plano={plano} loading={planoLoading} />
      <ProximosPassos refazerTeste={refazerTeste} />
    </div>
  );
};

export default DiagnosticoCompleto;
