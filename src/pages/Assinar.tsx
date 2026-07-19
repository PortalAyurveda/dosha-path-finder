import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackPixel } from "@/lib/metaPixel";
import {
  Check,
  ChevronDown,
  Gift,
  Sparkles,
  BadgePercent,
  BookOpen,
  Compass,
  Leaf,
  HeartPulse,
  Sun,
  Video as VideoIcon,
  Library,
  Flame,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { ClinicalThermometer } from "./MeuDosha";
import DoshaPieChart from "@/components/charts/DoshaPieChart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const SURFACE = "#FFF8EE";
const PAPER = "#FDFBF5";

const VERDE = "#4B7A5A";
const VERDE_BG = "#EAF3EC";

const DOURADO = "#B8892E";
const DOURADO_BG = "#FBF3DE";
const DOURADO_DARK = "#8C641C";

const PROFESSOR_PHOTO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg";

const PORTAL_ICON = "/favicon.svg";

type Plano = "rotina" | "mensal" | "anual";
const RANK: Record<Plano, number> = { rotina: 1, mensal: 2, anual: 3 };

const BENEFICIOS: string[] = [
  "Rotina completa da semana: café, almoço, jantar, lanches e tônicos",
  "Montada para o SEU dosha, com preparo e porquê de cada item",
  "Revisão mensal do seu quadro",
  "Akasha ilimitada: converse de dia ou de madrugada",
  "Acervo completo: 900+ aulas do professor",
  'Curso "Rotinas Diárias do Ayurveda" incluso (valor R$ 99)',
  "Economia de 38% no ano (equivale a R$ 49,75/mês)",
  "Cancele quando quiser",
];

const INCLUSOS: Record<Plano, Set<number>> = {
  rotina: new Set([1, 2, 3, 8]),
  mensal: new Set([1, 2, 3, 4, 5, 8]),
  anual: new Set([1, 2, 3, 4, 5, 6, 7, 8]),
};

const RECEITAS = [
  {
    titulo: "Kitchari com salsa",
    resumo: "Prato-remédio que acalma Vata e limpa o intestino sem esforço.",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-kitchari-com-salsa-e-oleo-vegetal.webp",
  },
  {
    titulo: "Abobrinha recheada com panir",
    resumo: "Jantar leve e nutritivo — refresca Pitta sem pesar no estômago.",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-abobrinha-recheada-com-panir-assada-no-forno.webp",
  },
  {
    titulo: "Suco Matinal Ayurveda",
    resumo: "Desperta o agni pela manhã e prepara o corpo para o dia.",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-suco-matinal-ayurveda-opcao-5.webp",
  },
];


const NUMEROS = [
  "2.700+ testes",
  "900+ aulas",
  "4.500+ alunas formadas",
  "Revisão mensal",
];

type JornadaItem = {
  Icon: typeof BookOpen;
  numero: number | null;
  titulo: string;
  texto: string;
  destaque?: boolean;
};
const JORNADA: JornadaItem[] = [
  { Icon: BookOpen, numero: null, titulo: "Antes — sem Ayurveda", texto: "Você não sabia nem seu biotipo." },
  { Icon: Compass, numero: 1, titulo: "Você se conhece", texto: "O teste revela seu dosha e seu quadro atual.", destaque: true },
  { Icon: Leaf, numero: 2, titulo: "Você se cuida certo", texto: "Rotina, comida e hábitos específicos para você." },
  { Icon: HeartPulse, numero: 3, titulo: "Você restaura sua vitalidade", texto: "Digestão, sono e energia voltam ao eixo — doshas em equilíbrio." },
  { Icon: Sun, numero: 4, titulo: "Você aproveita a vida", texto: "Leveza e clareza — vitalidade e longevidade." },
];

const OBJETIVOS = ["Digestão", "Sono", "Ansiedade", "Energia"];

const FAQ = [
  { q: "Preciso já entender de Ayurveda?", a: "Você só precisa fazer o teste de dosha gratuito — leva 5 minutos. O Portal traduz todo o resto em passos simples: o que comer, quando, por quê. O Ayurveda parece complicado porque você vê o resultado pronto; aqui você aprende passo a passo, no seu ritmo." },
  
  { q: "Como recebo o curso incluso no plano anual?", a: "A matrícula é automática: assinou o anual, o curso Rotinas Diárias aparece liberado na sua conta, para assistir quando quiser, quantas vezes quiser." },
  { q: "O que acontece logo depois que eu assino?", a: "Você entra e sua rotina já está lá, montada para o resultado do seu teste. No primeiro domingo, chega sua primeira 'Semana Ayurveda' por email. E a Akasha já te conhece pelo nome." },
  { q: "Funciona bem no celular?", a: "Sim — o Portal inteiro foi feito para o celular, das receitas às conversas com a Akasha." },
  { q: "Posso mudar de plano depois?", a: "Pode, a qualquer momento, direto nesta página — quem assina a Rotina sobe para o Premium pagando só a diferença proporcional." },
  { q: "Posso cancelar quando quiser?", a: "Sim, direto no Portal, na sua conta — sem ligação e sem burocracia. O acesso vai até o fim do período já pago." },
  { q: "O que é a revisão mensal?", a: "Todo mês seu quadro é refeito e a rotina se ajusta ao momento do seu corpo. Uma rotina que não se ajusta envelhece — a sua acompanha você." },
  { q: "A Akasha funciona de madrugada?", a: "Sim, a qualquer hora. Ela está disponível dia e noite, e conhece o seu dosha e o histórico das suas conversas." },
  { q: "Já assino a Rotina, como faço para subir de plano?", a: "Clique em Fazer upgrade no card do plano desejado. Você paga só a diferença proporcional pelo tempo que resta do ciclo atual — nenhuma cobrança em dobro." },
];

const PortalMark = ({ size = 28 }: { size?: number }) => (
  <img
    src={PORTAL_ICON}
    alt=""
    aria-hidden
    width={size}
    height={size}
    className="inline-block"
    style={{ width: size, height: size }}
  />
);

const Assinar = () => {
  const { user, profile, refreshProfile } = useUser();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<Plano | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [upgradeDialog, setUpgradeDialog] = useState<null | {
    plano_atual: Plano;
    plano_novo: Plano;
    mensagem: string;
  }>(null);
  const [confirmandoUpgrade, setConfirmandoUpgrade] = useState(false);

  const isAssinante = profile?.subscription_status === "active";
  const planoAtual = (isAssinante ? (profile?.plano as Plano | null) : null) ?? null;
  const rankAtual = planoAtual ? RANK[planoAtual] : 0;

  useEffect(() => {
    trackPixel("ViewContent", { content_name: "Pagina Assinar" });
  }, []);

  const { data: cursoRotinas } = useQuery({
    queryKey: ["curso-rotinas-diarias"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cursos")
        .select("titulo,capa_url")
        .eq("slug", "rotinas-diarias")
        .maybeSingle();
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

  const nomesPlano: Record<Plano, string> = {
    rotina: "Minha Rotina",
    mensal: "Premium",
    anual: "Premium Anual",
  };

  const invokeCheckout = async (plano: Plano, confirmar_upgrade = false) => {
    return await supabase.functions.invoke("create-subscription-checkout", {
      body: {
        plano,
        user_id: user?.id,
        email: profile?.email ?? user?.email,
        ...(confirmar_upgrade ? { confirmar_upgrade: true } : {}),
      },
    });
  };

  const handleClickPlano = async (plano: Plano) => {
    if (!user) {
      navigate(`/entrar?redirect=/assinar`);
      return;
    }
    trackPixel("InitiateCheckout", { content_type: "subscription", plano });
    setLoadingPlan(plano);
    try {
      const { data, error } = await invokeCheckout(plano);
      if (error) throw error;
      if (data?.upgrade_disponivel) {
        setUpgradeDialog({
          plano_atual: data.plano_atual,
          plano_novo: data.plano_novo,
          mensagem: data.mensagem,
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.error) throw new Error(data.error);
      throw new Error("Resposta inesperada do servidor");
    } catch (e) {
      const msg = (e as { message?: string; error?: string })?.message
        ?? (e as { error?: string })?.error
        ?? "Não conseguimos processar agora. Tente de novo em instantes.";
      toast({ title: "Ops", description: String(msg), variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const confirmarUpgrade = async () => {
    if (!upgradeDialog) return;
    setConfirmandoUpgrade(true);
    try {
      const { data, error } = await invokeCheckout(upgradeDialog.plano_novo, true);
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.upgrade_ok) {
        const novo = nomesPlano[upgradeDialog.plano_novo];
        toast({
          title: `Bem-vinda ao ${novo} 🌿`,
          description: "Seu plano já está ativo. Aproveite tudo o que ele traz.",
        });
        setUpgradeDialog(null);
        await refreshProfile();
        setTimeout(() => window.location.reload(), 800);
        return;
      }
      throw new Error("Não recebemos a confirmação do upgrade.");
    } catch (e) {
      const msg = (e as { message?: string })?.message
        ?? "Não conseguimos concluir o upgrade agora.";
      toast({ title: "Ops", description: String(msg), variant: "destructive" });
    } finally {
      setConfirmandoUpgrade(false);
    }
  };

  const scrollToPlanos = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  const exemploScores = [
    { name: "Vata", score: 42 },
    { name: "Pitta", score: 28 },
    { name: "Kapha", score: 16 },
  ];

  const BeneficiosList = ({
    plano,
    checkColor,
    dimmedColor,
    renderItem6Extra,
    renderItem7Extra,
  }: {
    plano: Plano;
    checkColor: string;
    dimmedColor?: string;
    renderItem6Extra?: React.ReactNode;
    renderItem7Extra?: React.ReactNode;
  }) => {
    const inclusos = INCLUSOS[plano];
    return (
      <ul className="space-y-2 mb-5 flex-1">
        {BENEFICIOS.map((texto, idx) => {
          const n = idx + 1;
          const on = inclusos.has(n);
          const color = on ? PRIMARY : dimmedColor ?? "rgba(53,47,84,0.35)";
          return (
            <li key={n} className="flex items-start gap-2">
              {on ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: checkColor }} strokeWidth={2.6} />
              ) : (
                <span className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center" aria-hidden>
                  <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "rgba(53,47,84,0.18)" }} />
                </span>
              )}
              <span
                className="text-[13px] leading-snug"
                style={{ color, fontFamily: "'DM Sans', sans-serif", opacity: on ? 1 : 0.7 }}
              >
                {texto}
                {n === 6 && on && renderItem6Extra}
                {n === 7 && on && renderItem7Extra}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const CardAction = ({
    plano,
    color,
    hoverColor,
    label,
  }: {
    plano: Plano;
    color: string;
    hoverColor?: string;
    label: string;
  }) => {
    if (!isAssinante) {
      return (
        <button
          onClick={() => handleClickPlano(plano)}
          disabled={loadingPlan !== null}
          className="mt-auto w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: color }}
          onMouseEnter={(e) => !loadingPlan && hoverColor && (e.currentTarget.style.backgroundColor = hoverColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color)}
        >
          {loadingPlan === plano ? "Redirecionando…" : label}
        </button>
      );
    }
    const rankPlano = RANK[plano];
    if (rankPlano === rankAtual) {
      return (
        <button
          onClick={() => handleClickPlano(plano)}
          disabled={loadingPlan !== null}
          className="mt-auto w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {loadingPlan === plano ? "Abrindo…" : "Gerenciar assinatura"}
        </button>
      );
    }
    if (rankPlano > rankAtual) {
      return (
        <button
          onClick={() => handleClickPlano(plano)}
          disabled={loadingPlan !== null}
          className="mt-auto w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {loadingPlan === plano ? "Aguarde…" : "Fazer upgrade — pague só a diferença"}
        </button>
      );
    }
    return (
      <div
        className="mt-auto w-full py-2.5 rounded-full text-sm text-center font-semibold"
        style={{ background: "rgba(53,47,84,0.06)", color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
      >
        Já incluído no seu plano
      </div>
    );
  };

  const SeuPlanoBadge = () => (
    <span
      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap shadow-md"
      style={{ backgroundColor: PRIMARY }}
    >
      Seu plano
    </span>
  );

  const cursoIncluso = (
    <span className="block mt-2">
      <span
        className="inline-flex items-center gap-2.5 rounded-xl border p-2 pr-2.5"
        style={{ background: "#fff", borderColor: `${DOURADO}55` }}
      >
        {cursoRotinas?.capa_url ? (
          <img src={cursoRotinas.capa_url} alt="" aria-hidden loading="lazy" className="w-10 h-10 object-cover rounded-lg shrink-0" />
        ) : (
          <span className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: DOURADO_BG }}>
            <Gift className="w-4 h-4" style={{ color: DOURADO }} />
          </span>
        )}
        <span className="min-w-0 text-left">
          <span className="block text-[9px] uppercase tracking-wider font-bold" style={{ color: DOURADO_DARK }}>
            Curso incluso
          </span>
          <span className="block font-serif font-bold text-[13px] leading-tight" style={{ color: PRIMARY }}>
            {cursoRotinas?.titulo ?? "Rotinas Diárias do Ayurveda"}
          </span>
        </span>
      </span>
    </span>
  );

  const seloDesconto = (
    <span
      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider align-middle"
      style={{ background: DOURADO, color: "#fff" }}
    >
      <BadgePercent className="w-3 h-3" /> 38% off
    </span>
  );

  const cardBase = "rounded-2xl p-5 md:p-6 flex flex-col border relative";

  return (
    <>
      <Helmet>
        <title>Planos — Portal Ayurveda</title>
        <meta
          name="description"
          content="Descubra seu dosha e receba o Portal inteiro moldado a você. Três planos — Minha Rotina, Premium mensal e Premium anual."
        />
      </Helmet>

      <main>
        {/* 1) HERO */}
        <section
          className="w-full"
          style={{ background: `linear-gradient(160deg, ${SURFACE} 0%, #F5F0FF 100%)` }}
        >
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14 text-center">
            <div className="flex justify-center mb-4">
              <PortalMark size={44} />
            </div>
            <h1
              className="font-serif italic font-bold text-3xl md:text-[42px] leading-tight mb-3"
              style={{ color: PRIMARY }}
            >
              Seu Ayurveda, do seu jeito
            </h1>
            <p
              className="text-base md:text-lg max-w-xl mx-auto mb-6 leading-relaxed"
              style={{ color: PRIMARY, opacity: 0.9, fontFamily: "'DM Sans', sans-serif" }}
            >
              Descubra seu dosha e receba o Portal inteiro moldado a você.
            </p>
            <button
              onClick={scrollToPlanos}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white font-semibold text-base shadow-lg transition-colors"
              style={{ backgroundColor: SALMAO }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
            >
              Ver os planos
            </button>
          </div>
        </section>

        {/* 2) SUA JORNADA */}
        <section className="bg-background border-b border-border/40">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-2"
              style={{ color: PRIMARY }}
            >
              Sua jornada
            </h2>
            <p
              className="text-center text-sm md:text-base mb-10 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              Do desconhecido ao equilíbrio, passo a passo.
            </p>

            <div className="relative">
              {/* Trilha pontilhada ondulada — desktop */}
              <svg
                aria-hidden
                className="hidden md:block absolute inset-x-0 top-[38px] h-16 w-full pointer-events-none"
                viewBox="0 0 1000 60"
                preserveAspectRatio="none"
              >
                <path
                  d="M 40 30 Q 160 4, 300 30 T 560 30 T 820 30 T 960 30"
                  fill="none"
                  stroke={SALMAO}
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Trilha pontilhada vertical — mobile */}
              <span
                aria-hidden
                className="md:hidden absolute top-10 bottom-10 left-1/2 -translate-x-1/2 border-l-2 border-dotted"
                style={{ borderColor: `${SALMAO}88` }}
              />

              <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-3">
                {JORNADA.map(({ Icon, titulo, texto, destaque }, i) => (
                  <li
                    key={i}
                    className="relative flex flex-col items-center text-center"
                  >
                    {destaque && (
                      <div className="flex flex-col items-center mb-2 gap-1">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full text-white"
                          style={{ background: SALMAO, fontFamily: "'DM Sans', sans-serif" }}
                        >
                          📍 Você está aqui
                        </span>
                        <span
                          className="text-[9px] uppercase tracking-wider font-bold"
                          style={{ color: SALMAO, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Onde o Portal começa
                        </span>
                      </div>
                    )}
                    <div
                      className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2"
                      style={{
                        background: destaque ? SALMAO : "#fff",
                        borderColor: destaque ? SALMAO : `${SALMAO}66`,
                        boxShadow: destaque ? `0 6px 18px -6px ${SALMAO}88` : "0 2px 6px -3px rgba(53,47,84,0.25)",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: destaque ? "#fff" : SALMAO }}
                        strokeWidth={1.8}
                      />
                    </div>
                    <p
                      className="font-serif font-bold text-sm md:text-[15px] leading-snug mb-1 max-w-[180px]"
                      style={{ color: PRIMARY }}
                    >
                      {titulo}
                    </p>
                    <p
                      className="text-[12px] md:text-[13px] leading-snug max-w-[200px]"
                      style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {texto}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>


        {/* 3) TUDO COMEÇA PELO SEU RETRATO — painel único compacto */}
        <section style={{ background: SURFACE }}>
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 md:py-8">
            <h2
              className="font-serif italic font-bold text-xl md:text-[24px] text-center mb-1.5"
              style={{ color: PRIMARY }}
            >
              Tudo começa pelo seu retrato
            </h2>
            <p
              className="text-center text-[13px] md:text-sm mb-4 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              O teste gratuito desenha seu quadro — e o Portal trabalha em cima dele.
            </p>

            <div
              className="relative rounded-2xl border bg-card shadow-sm overflow-hidden max-w-[680px] mx-auto"
              style={{ borderColor: "rgba(53,47,84,0.14)" }}
            >
              <span
                className="absolute top-2 right-2 z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: PRIMARY, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
              >
                Exemplo
              </span>

              {/* Topo */}
              <div
                className="px-3 md:px-4 py-2 border-b"
                style={{ borderColor: "rgba(53,47,84,0.10)", background: PAPER }}
              >
                <p
                  className="text-[9px] uppercase tracking-wider font-bold mb-0.5"
                  style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Seu perfil clínico
                </p>
                <h3 className="font-serif font-bold text-sm md:text-[15px]" style={{ color: PRIMARY }}>
                  Seu dosha agravado:{" "}
                  <span style={{ color: "#6B8AFF" }}>Vata</span>
                  <span style={{ color: PRIMARY, opacity: 0.4 }}>-</span>
                  <span style={{ color: "#FF7676" }}>Pitta</span>
                </h3>
              </div>

              {/* Corpo: donut+agni | quadro clínico */}
              <div
                className="grid grid-cols-1 md:grid-cols-[180px_1fr] divide-y md:divide-y-0 md:divide-x"
                style={{ borderColor: "rgba(53,47,84,0.10)" }}
              >
                <div className="p-3 flex flex-col items-center">
                  <div className="w-[108px] h-[108px]">
                    <DoshaPieChart vata={42} pitta={28} kapha={16} variant="compact" />
                  </div>
                  <div
                    className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold"
                    style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <span style={{ color: "#6B8AFF" }}>V 42</span>
                    <span style={{ opacity: 0.35 }}>·</span>
                    <span style={{ color: "#FF7676" }}>P 28</span>
                    <span style={{ opacity: 0.35 }}>·</span>
                    <span style={{ color: "#4B9E4B" }}>K 16</span>
                  </div>
                  <div
                    className="mt-2 w-full rounded-md border p-2 flex items-start gap-1.5"
                    style={{ background: "hsl(var(--surface-sun))", borderColor: "rgba(53,47,84,0.10)" }}
                  >
                    <Flame className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#C87E3B" }} />
                    <p className="text-[10px] leading-snug" style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
                      <strong className="font-bold">Agni:</strong> irregular
                    </p>
                  </div>
                </div>

                <div className="p-3">
                  <p
                    className="text-[9px] uppercase tracking-wider font-bold mb-1.5"
                    style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Quadro clínico
                  </p>
                  <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <ClinicalThermometer doshaScores={exemploScores} />
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div
                className="border-t px-3 md:px-4 py-1.5 text-center"
                style={{ borderColor: "rgba(53,47,84,0.10)", background: PAPER }}
              >
                <p
                  className="text-[10px]"
                  style={{ color: PRIMARY, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Exemplo — o seu vem do teste gratuito.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3b) SUA REVISÃO MENSAL */}
        <section className="bg-background">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <p
              className="text-[11px] uppercase tracking-wider font-bold text-center mb-2"
              style={{ color: SALMAO, fontFamily: "'DM Sans', sans-serif" }}
            >
              Sua revisão mensal
            </p>
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-2"
              style={{ color: PRIMARY }}
            >
              Você vê seu corpo melhorar, mês a mês
            </h2>
            <p
              className="text-center text-sm md:text-base mb-8 max-w-2xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.78, fontFamily: "'DM Sans', sans-serif" }}
            >
              Todo mês a Akasha refaz sua leitura, compara com o mês anterior e ajusta sua rotina — porque seu corpo muda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Esquerda: gráfico de linha V/P/K */}
              <div
                className="relative rounded-2xl border p-4 md:p-5 bg-card shadow-sm"
                style={{ borderColor: "rgba(53,47,84,0.14)" }}
              >
                <span
                  className="absolute top-3 right-3 z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{ background: PRIMARY, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Exemplo
                </span>
                <p
                  className="text-[10px] uppercase tracking-wider font-bold mb-1"
                  style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Evolução dos doshas
                </p>
                <p className="font-serif font-bold text-[15px] mb-3" style={{ color: PRIMARY }}>
                  Vata: 48 → 33 em 4 meses
                </p>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: "Mês 1", vata: 48, pitta: 24, kapha: 18 },
                        { mes: "Mês 2", vata: 42, pitta: 22, kapha: 19 },
                        { mes: "Mês 3", vata: 37, pitta: 21, kapha: 18 },
                        { mes: "Mês 4", vata: 33, pitta: 20, kapha: 17 },
                      ]}
                      margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
                    >
                      <ReferenceLine y={35} stroke="#FCA5A5" strokeDasharray="3 3" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="mes"
                        tick={{ fill: PRIMARY, fontSize: 11, fontWeight: 600 }}
                        stroke="rgba(53,47,84,0.2)"
                      />
                      <YAxis
                        domain={[10, 55]}
                        tick={{ fill: PRIMARY, fontSize: 10, opacity: 0.6 }}
                        stroke="rgba(53,47,84,0.15)"
                        width={28}
                      />
                      <RTooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid rgba(53,47,84,0.15)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone" dataKey="vata" name="Vata"
                        stroke="#6B8FE8" strokeWidth={3.5}
                        dot={{ r: 4, fill: "#6B8FE8", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone" dataKey="pitta" name="Pitta"
                        stroke="#F0857F" strokeWidth={2}
                        dot={{ r: 3, fill: "#F0857F", stroke: "#fff", strokeWidth: 1.5 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone" dataKey="kapha" name="Kapha"
                        stroke="#57BE86" strokeWidth={2}
                        dot={{ r: 3, fill: "#57BE86", stroke: "#fff", strokeWidth: 1.5 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="mt-2 flex items-center justify-center gap-3 text-[11px] font-semibold"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#6B8FE8" }} /><span style={{ color: PRIMARY }}>V</span></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F0857F" }} /><span style={{ color: PRIMARY }}>P</span></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#57BE86" }} /><span style={{ color: PRIMARY }}>K</span></span>
                </div>
              </div>

              {/* Direita: perguntas + card verde */}
              <div
                className="rounded-2xl border p-4 md:p-5 bg-card shadow-sm flex flex-col"
                style={{ borderColor: "rgba(53,47,84,0.14)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider font-bold mb-1"
                  style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
                >
                  O que a revisão te pergunta
                </p>
                <div className="space-y-2 mb-3">
                  {[
                    "Como andou seu sono neste mês? Ainda acorda de madrugada?",
                    "Sua digestão está mais regular do que no mês passado?",
                    "Os gases e o ressecamento que você marcou melhoraram?",
                  ].map((q) => (
                    <div
                      key={q}
                      className="rounded-lg border px-3 py-2 text-[12px] leading-snug"
                      style={{
                        background: PAPER,
                        borderColor: "rgba(53,47,84,0.10)",
                        color: PRIMARY,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {q}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-auto rounded-lg border p-3 text-[12px] leading-snug"
                  style={{ background: VERDE_BG, borderColor: `${VERDE}55`, color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <p className="font-serif font-bold text-[13px] mb-0.5" style={{ color: VERDE }}>
                    ↓ Seu Vata caiu de 48 para 33
                  </p>
                  <p>De <strong>Adoecido</strong> a <strong>Normal</strong>. Você está no caminho — sua rotina já foi ajustada.</p>
                </div>
              </div>
            </div>

            {/* Chips objetivos */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-center">
              <p
                className="font-serif font-bold text-[13px] text-center md:text-left"
                style={{ color: PRIMARY }}
              >
                Seus objetivos:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {OBJETIVOS.map((o) => (
                  <span
                    key={o}
                    className="px-2.5 py-1 rounded-full text-[12px] font-semibold border"
                    style={{
                      background: `${SALMAO}15`,
                      color: PRIMARY,
                      borderColor: `${SALMAO}55`,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {o}
                  </span>
                ))}
              </div>
              <p
                className="text-[12px] text-center md:text-left"
                style={{ color: PRIMARY, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}
              >
                — e o gráfico mostra você chegando lá.
              </p>
            </div>
          </div>
        </section>


        {/* 4) A AKASHA TE ACOMPANHA */}
        <section className="bg-background">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-2"
              style={{ color: PRIMARY }}
            >
              A Akasha te acompanha
            </h2>
            <p
              className="text-center text-sm md:text-base mb-8 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              Alunas do Portal, desta semana — só tiramos os nomes.
            </p>

            {(() => {
              const AKASHA_COLOR = "hsl(var(--akasha))";
              const AKASHA_BG = "hsl(var(--akasha) / 0.10)";
              const Person = ({ children }: { children: React.ReactNode }) => (
                <div className="flex justify-end mb-1.5">
                  <div
                    className="max-w-[92%] rounded-2xl rounded-br-sm px-3 py-2 text-[13px] leading-snug shadow-sm"
                    style={{ background: PRIMARY, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {children}
                  </div>
                </div>
              );
              const Akasha = ({ children }: { children: React.ReactNode }) => (
                <div className="flex justify-start">
                  <div
                    className="max-w-[94%] rounded-2xl rounded-bl-sm px-3 py-2 text-[13px] leading-snug shadow-sm"
                    style={{ background: AKASHA_BG, color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {children}
                  </div>
                </div>
              );
              const Card = ({ label, children }: { label: string; children: React.ReactNode }) => (
                <div
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4"
                  style={{ background: PAPER, borderColor: "rgba(53,47,84,0.08)" }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold mb-3"
                    style={{ color: AKASHA_COLOR, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {label}
                  </p>
                  {children}
                </div>
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card label="Ela ensina o cuidado">
                    <Person>
                      Peguei uma gripe com muco e catarro, como devo me tratar?
                    </Person>
                    <Akasha>
                      Água quente ao acordar e ao longo do dia, e chá de gengibre, cominho, louro, erva-doce e canela em dose suave. Se o muco está preso, aquecer e fluidificar. A tosse está seca ou com catarro?
                    </Akasha>
                  </Card>

                  <Card label="Ela pergunta pra acertar">
                    <Person>
                      Indique um chá pra dificuldade de manter o sono. Durmo cedo, mas desperto às 3h.
                    </Person>
                    <Akasha>
                      Às 3h costuma ajudar leite morno com especiarias — metade leite, metade água, um pouco de ghee e um toque de mascavo. Aterra o Vata e favorece sono profundo. Evite chá preto à noite.
                    </Akasha>
                  </Card>

                  <Card label="Ela não inventa">
                    <Person>
                      Na receita do vídeo fala de pimenta rosa e branca. Vai?
                    </Person>
                    <Akasha>
                      Essa receita de pimenta rosa não está no caderno, então não vou inventar. Mas pro seu Vata e no frio, eu teria cuidado com pimentas — elas secam e aquecem demais, e a branca é a mais pungente.
                    </Akasha>
                  </Card>
                </div>
              );
            })()}

            <p
              className="mt-6 text-center text-sm md:text-base max-w-2xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}
            >
              A inteligência do Portal, treinada no acervo completo do professor Edson. Conhece seu dosha, lembra das suas conversas e responde a qualquer hora.
            </p>
          </div>
        </section>

        {/* 5) COMIDA E CONTEÚDO DE VERDADE */}
        <section style={{ background: SURFACE }}>
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-2"
              style={{ color: PRIMARY }}
            >
              Comida e conteúdo de verdade
            </h2>
            <p
              className="text-center text-sm md:text-base mb-8 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              Receitas com ingredientes do mercado do seu bairro — e um acervo inteiro por trás.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {RECEITAS.map((r) => (
                <div
                  key={r.titulo}
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden border shadow-sm"
                  style={{ background: PAPER, borderColor: "rgba(53,47,84,0.08)" }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={r.url} alt={r.titulo} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#C93F3F" }}>
                      Receita
                    </p>
                    <h3 className="font-serif font-bold text-sm leading-tight mb-1" style={{ color: PRIMARY }}>
                      {r.titulo}
                    </h3>
                    <p
                      className="text-xs leading-snug"
                      style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {r.resumo}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6) TUDO NUM SÓ LUGAR — biblioteca + Relógio dos Doshas + curso */}
        <section className="bg-background">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <p
              className="text-[11px] uppercase tracking-wider font-bold text-center mb-2"
              style={{ color: SALMAO, fontFamily: "'DM Sans', sans-serif" }}
            >
              Tudo num só lugar
            </p>
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-8"
              style={{ color: PRIMARY }}
            >
              O acervo inteiro, organizado pra você
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Esquerda: Relógio dos Doshas */}
              <a
                href="/biblioteca/horarios"
                className="rounded-2xl border p-5 bg-card shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md"
                style={{ borderColor: "rgba(53,47,84,0.14)" }}
              >
                <div className="w-[190px] h-[190px] relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 270deg, #57BE86 0deg 60deg, #F0857F 60deg 180deg, #6B8FE8 180deg 240deg, #57BE86 240deg 300deg, #F0857F 300deg 360deg)",
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-card border shadow-inner flex flex-col items-center justify-center text-center px-3"
                    style={{ inset: 22, borderColor: "rgba(53,47,84,0.10)" }}
                  >
                    <span className="font-serif italic font-bold text-lg" style={{ color: PRIMARY }}>
                      6h → 22h
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider mt-1 font-bold"
                      style={{ color: PRIMARY, opacity: 0.65, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      seu dia em doshas
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#57BE86" }} /><span style={{ color: PRIMARY }}>K</span></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F0857F" }} /><span style={{ color: PRIMARY }}>P</span></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#6B8FE8" }} /><span style={{ color: PRIMARY }}>V</span></span>
                </div>
                <p className="font-serif font-bold text-[15px] mt-4" style={{ color: PRIMARY }}>
                  O Relógio dos Doshas
                </p>
                <p
                  className="text-[12px] leading-snug mt-1 max-w-xs"
                  style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Os horários do seu corpo: quando comer, mover e descansar.
                </p>
              </a>

              {/* Direita: 3 blocos */}
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-xl border p-3.5 flex items-start gap-3"
                  style={{ background: "#fff", borderColor: "rgba(53,47,84,0.10)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${SALMAO}22` }}>
                    <VideoIcon className="w-4 h-4" style={{ color: SALMAO }} strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-sm leading-tight mb-0.5" style={{ color: PRIMARY }}>
                      900+ aulas do professor
                    </p>
                    <p className="text-xs leading-snug" style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>
                      Acervo completo organizado por tema e por dosha.
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-xl border p-3.5 flex items-start gap-3"
                  style={{ background: "#fff", borderColor: "rgba(53,47,84,0.10)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${SALMAO}22` }}>
                    <Library className="w-4 h-4" style={{ color: SALMAO }} strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-sm leading-tight mb-0.5" style={{ color: PRIMARY }}>
                      Artigos por dosha
                    </p>
                    <p className="text-xs leading-snug" style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>
                      Guias práticos aplicados ao seu quadro.
                    </p>
                  </div>
                </div>

                {/* Bloco destacado do curso */}
                <div
                  className="rounded-xl border-2 p-3.5 flex items-start gap-3 relative"
                  style={{ background: DOURADO_BG, borderColor: DOURADO }}
                >
                  {cursoRotinas?.capa_url ? (
                    <img
                      src={cursoRotinas.capa_url}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "#fff" }}>
                      <Gift className="w-6 h-6" style={{ color: DOURADO }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: DOURADO_DARK, fontFamily: "'DM Sans', sans-serif" }}>
                      Curso incluso no plano anual
                    </p>
                    <p className="font-serif font-bold text-sm leading-tight mb-1" style={{ color: PRIMARY }}>
                      {cursoRotinas?.titulo ?? "Rotinas Diárias do Ayurveda"}
                    </p>
                    <p className="text-xs leading-snug" style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}>
                      As videoaulas do professor sobre os hábitos que sustentam sua saúde · 11 aulas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 7) NÚMEROS */}
        <section style={{ background: PRIMARY }}>
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 md:py-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {NUMEROS.map((n) => (
                <p
                  key={n}
                  className="text-white text-sm md:text-[15px] font-medium leading-snug"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {n}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* 8) ESCOLHA SEU PLANO */}
        <section id="planos" style={{ background: SURFACE }}>
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-12 md:py-16">
            <h2
              className="font-serif italic font-bold text-2xl md:text-[32px] text-center mb-2"
              style={{ color: PRIMARY }}
            >
              Escolha seu plano
            </h2>
            <p
              className="text-center text-sm md:text-base mb-10 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}
            >
              Comece pela rotina ou vá direto no Portal inteiro — a escolha é sua.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
              {/* CARD 1 — MINHA ROTINA */}
              <div className={cardBase} style={{ background: VERDE_BG, borderColor: `${VERDE}33` }}>
                {planoAtual === "rotina" && <SeuPlanoBadge />}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: VERDE }}>
                    Minha Rotina
                  </p>
                  <PortalMark size={22} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-1" style={{ color: PRIMARY }}>
                  Sua semana pronta
                </h3>
                <p className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                  R$ 30<span className="text-sm font-normal opacity-70">/mês</span>
                </p>
                <p className="text-xs mb-4" style={{ color: VERDE, fontFamily: "'DM Sans', sans-serif" }}>
                  Menos de R$1 por dia.
                </p>
                <BeneficiosList plano="rotina" checkColor={VERDE} />
                <CardAction plano="rotina" color={VERDE} label="Começar minha rotina" />
              </div>

              {/* CARD 2 — PREMIUM MENSAL */}
              <div className={cardBase} style={{ background: `${SALMAO}12`, borderColor: `${SALMAO}55` }}>
                {planoAtual === "mensal" && <SeuPlanoBadge />}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-wider font-bold inline-flex items-center gap-1.5" style={{ color: SALMAO }}>
                    <Sparkles className="w-3.5 h-3.5" /> Premium
                  </p>
                  <PortalMark size={22} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-1" style={{ color: PRIMARY }}>
                  Tudo do Portal
                </h3>
                <p className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                  R$ 79,90<span className="text-sm font-normal opacity-70">/mês</span>
                </p>
                <p className="text-xs mb-4" style={{ color: SALMAO, fontFamily: "'DM Sans', sans-serif" }}>
                  Tudo da Rotina, mais a companhia.
                </p>
                <BeneficiosList plano="mensal" checkColor={SALMAO} />
                <CardAction plano="mensal" color={SALMAO} hoverColor={SALMAO_HOVER} label="Assinar Premium" />
              </div>

              {/* CARD 3 — PREMIUM ANUAL */}
              <div className={cardBase + " border-2 shadow-xl"} style={{ background: DOURADO_BG, borderColor: DOURADO }}>
                {planoAtual === "anual" ? (
                  <SeuPlanoBadge />
                ) : (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ backgroundColor: DOURADO }}
                  >
                    Mais vantajoso
                  </span>
                )}
                <div className="flex items-center justify-between mb-3 mt-1">
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: DOURADO_DARK }}>
                    Premium Anual
                  </p>
                  <PortalMark size={22} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-1" style={{ color: PRIMARY }}>
                  Um ano inteiro
                </h3>
                <p className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                  R$ 597<span className="text-sm font-normal opacity-70">/ano</span>
                </p>
                <p className="text-xs font-bold mb-4" style={{ color: DOURADO_DARK, fontFamily: "'DM Sans', sans-serif" }}>
                  38% DE DESCONTO
                </p>
                <BeneficiosList
                  plano="anual"
                  checkColor={DOURADO_DARK}
                  renderItem6Extra={cursoIncluso}
                  renderItem7Extra={seloDesconto}
                />
                <div
                  className="rounded-xl border p-3 mb-3 text-xs leading-relaxed"
                  style={{ background: "#fff", borderColor: `${DOURADO}55`, color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: DOURADO_DARK }}>
                    Conta feita
                  </p>
                  12 meses de Premium (R$ 958,80) + curso Rotinas Diárias (R$ 99) = <strong>R$ 1.057,80</strong> em valor. Você paga <strong>R$ 597</strong>.
                </div>
                <CardAction plano="anual" color={DOURADO} label="Assinar Anual" />
              </div>
            </div>
          </div>
        </section>

        {/* QUEM TE GUIA — depois do preço, antes do FAQ */}
        <section className="bg-background">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-10 items-center">
              <div className="mx-auto md:mx-0">
                <div
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shadow-md border-4"
                  style={{ borderColor: `${SALMAO}33` }}
                >
                  <img
                    src={PROFESSOR_PHOTO}
                    alt="Professor Edson Osorio"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: SALMAO }}>
                  Quem te guia
                </p>
                <h2 className="font-serif italic font-bold text-xl md:text-2xl mb-2" style={{ color: PRIMARY }}>
                  Edson Osorio
                </h2>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Terapeuta Ayurveda, fundador do Portal. 15 anos de clínica, 13 de sala de aula, mais de 4.500 alunos formados. Tudo no Portal nasce do que funciona na clínica dele, adaptado ao Brasil.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9) PERGUNTAS COMUNS */}
        <section className="bg-background">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-12 md:py-16">
            <h2
              className="font-serif italic font-bold text-2xl md:text-[28px] text-center mb-8"
              style={{ color: PRIMARY }}
            >
              Perguntas comuns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-4 md:gap-y-2 items-start">
              {FAQ.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <h3
                        className="flex-1 font-serif font-bold text-sm md:text-base leading-snug"
                        style={{ color: PRIMARY }}
                      >
                        {item.q}
                      </h3>
                      <ChevronDown
                        className="shrink-0 h-4 w-4 transition-transform duration-300"
                        style={{
                          color: PRIMARY,
                          opacity: 0.6,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {isOpen && (
                      <p
                        className="px-4 pb-4 text-sm leading-relaxed"
                        style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Diálogo de confirmação de upgrade */}
      <AlertDialog
        open={upgradeDialog !== null}
        onOpenChange={(o) => !o && !confirmandoUpgrade && setUpgradeDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: PRIMARY }}>
              Fazer upgrade para {upgradeDialog ? nomesPlano[upgradeDialog.plano_novo] : ""}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {upgradeDialog?.mensagem}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmandoUpgrade}>Agora não</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmarUpgrade();
              }}
              disabled={confirmandoUpgrade}
              style={{ backgroundColor: SALMAO, color: "#fff" }}
            >
              {confirmandoUpgrade ? "Confirmando…" : "Confirmar upgrade"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Assinar;
