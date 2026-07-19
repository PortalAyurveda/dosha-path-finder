import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackPixel } from "@/lib/metaPixel";
import {
  CalendarDays,
  MessageCircle,
  Video as VideoIcon,
  Check,
  ChevronDown,
  Gift,
  Sparkles,
  BadgePercent,
  Mail,
  Sun,
  Sparkle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { ClinicalThermometer } from "./MeuDosha";
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

// Verde-jardim para o card Rotina
const VERDE = "#4B7A5A";
const VERDE_BG = "#EAF3EC";

// Dourado para card Anual
const DOURADO = "#B8892E";
const DOURADO_BG = "#FBF3DE";
const DOURADO_DARK = "#8C641C";

const PROFESSOR_PHOTO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg";

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

// Índices 1-based inclusos por plano
const INCLUSOS: Record<Plano, Set<number>> = {
  rotina: new Set([1, 2, 3, 8]),
  mensal: new Set([1, 2, 3, 4, 5, 8]),
  anual:  new Set([1, 2, 3, 4, 5, 6, 7, 8]),
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
  "2.700+ testes de dosha realizados",
  "900+ aulas no acervo",
  "148 receitas fotografadas",
  "Revisão do seu quadro todo mês",
];

const FAQ = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, direto no portal, na sua conta — sem ligação e sem burocracia. O acesso vai até o fim do período já pago.",
  },
  {
    q: "O que é a revisão mensal?",
    a: "Todo mês seu quadro é refeito e a rotina se ajusta ao momento do seu corpo. Uma rotina que não se ajusta envelhece — a sua acompanha você.",
  },
  {
    q: "A Akasha funciona de madrugada?",
    a: "Sim, a qualquer hora. Ela está disponível dia e noite, e conhece o seu dosha e o histórico das suas conversas.",
  },
  {
    q: "Já assino a Rotina, como faço para subir de plano?",
    a: "Clique em Fazer upgrade no card do plano desejado. Você paga só a diferença proporcional pelo tempo que resta do ciclo atual — nenhuma cobrança em dobro.",
  },
];

const O_QUE_RECEBE = [
  {
    Icon: CalendarDays,
    titulo: "Sua rotina completa",
    texto:
      "Café da manhã, almoço e jantar, mais lanches e tônicos — a semana inteira montada para o seu dosha, com o preparo e o porquê de cada item. Revisada todo mês, porque seu corpo muda.",
  },
  {
    Icon: MessageCircle,
    titulo: "A Akasha ao seu lado",
    texto:
      "Tire dúvidas a qualquer hora com a inteligência que estudou todo o acervo do professor — ela conhece seu dosha e lembra das suas conversas.",
  },
  {
    Icon: VideoIcon,
    titulo: "As aulas do professor",
    texto: "Mais de 900 aulas organizadas por tema e por dosha.",
  },
];

const Assinar = () => {
  const { user, profile, refreshProfile } = useUser();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<Plano | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // Renderiza a lista compartilhada de 8 benefícios para um plano.
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
      <ul className="space-y-2.5 mb-6 flex-1">
        {BENEFICIOS.map((texto, idx) => {
          const n = idx + 1;
          const on = inclusos.has(n);
          const color = on ? PRIMARY : dimmedColor ?? "rgba(53,47,84,0.35)";
          return (
            <li key={n} className="flex items-start gap-2.5">
              {on ? (
                <Check
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: checkColor }}
                  strokeWidth={2.4}
                />
              ) : (
                <span
                  className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center"
                  aria-hidden
                >
                  <span
                    className="block w-2 h-2 rounded-full"
                    style={{ background: "rgba(53,47,84,0.18)" }}
                  />
                </span>
              )}
              <span
                className="text-sm leading-relaxed"
                style={{
                  color,
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: on ? 1 : 0.75,
                }}
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

  // Renderiza o botão de ação de cada card, respeitando o estado do usuário.
  const CardAction = ({
    plano,
    color,
    hoverColor,
    label,
  }: {
    plano: Plano;
    color: string;
    hoverColor?: string;
    label: string; // fallback (não-assinante)
  }) => {
    if (!isAssinante) {
      return (
        <button
          onClick={() => handleClickPlano(plano)}
          disabled={loadingPlan !== null}
          className="mt-auto w-full py-3 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: color }}
          onMouseEnter={(e) =>
            !loadingPlan && hoverColor && (e.currentTarget.style.backgroundColor = hoverColor)
          }
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
          className="mt-auto w-full py-3 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
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
          className="mt-auto w-full py-3 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {loadingPlan === plano ? "Aguarde…" : "Fazer upgrade — pague só a diferença"}
        </button>
      );
    }

    return (
      <div
        className="mt-auto w-full py-3 rounded-full text-sm text-center font-semibold"
        style={{
          background: "rgba(53,47,84,0.06)",
          color: PRIMARY,
          fontFamily: "'DM Sans', sans-serif",
        }}
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

  // Mini-card do curso incluso (item 6)
  const cursoIncluso = (
    <span className="block mt-2">
      <span
        className="inline-flex items-center gap-3 rounded-xl border p-2.5 pr-3"
        style={{ background: "#fff", borderColor: `${DOURADO}55` }}
      >
        {cursoRotinas?.capa_url ? (
          <img
            src={cursoRotinas.capa_url}
            alt=""
            aria-hidden
            loading="lazy"
            className="w-12 h-12 object-cover rounded-lg shrink-0"
          />
        ) : (
          <span
            className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: DOURADO_BG }}
          >
            <Gift className="w-5 h-5" style={{ color: DOURADO }} />
          </span>
        )}
        <span className="min-w-0 text-left">
          <span
            className="block text-[10px] uppercase tracking-wider font-bold"
            style={{ color: DOURADO_DARK }}
          >
            Curso incluso
          </span>
          <span
            className="block font-serif font-bold text-sm leading-tight"
            style={{ color: PRIMARY }}
          >
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
      <BadgePercent className="w-3 h-3" /> 38% de desconto
    </span>
  );

  const cardBase = "rounded-2xl p-7 flex flex-col border relative";

  return (
    <>
      <Helmet>
        <title>Planos — Portal Ayurveda</title>
        <meta
          name="description"
          content="Três formas de caminhar com a gente: Minha Rotina, Premium mensal e Premium anual — escolha a sua."
        />
      </Helmet>

      {/* 1) HERO */}
      <section
        className="w-full"
        style={{ background: `linear-gradient(160deg, ${SURFACE} 0%, #F5F0FF 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
          <h1
            className="font-serif italic font-bold text-3xl md:text-5xl leading-tight mb-5"
            style={{ color: PRIMARY }}
          >
            Seu Ayurveda, do seu jeito
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.9, fontFamily: "'DM Sans', sans-serif" }}
          >
            Três formas de caminhar com a gente — escolha a sua.
          </p>
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-10 py-5 rounded-full text-white font-semibold text-base md:text-lg shadow-lg transition-colors"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Ver os planos
          </button>
        </div>
      </section>

      {/* 2) O QUE VOCÊ RECEBE */}
      <section className="bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-12"
            style={{ color: PRIMARY }}
          >
            O que você recebe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {O_QUE_RECEBE.map(({ Icon, titulo, texto }) => (
              <div key={titulo} className="text-center md:text-left">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4"
                  style={{ background: `${SALMAO}22` }}
                >
                  <Icon className="w-6 h-6" style={{ color: SALMAO }} strokeWidth={1.7} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-2" style={{ color: PRIMARY }}>
                  {titulo}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3) RETRATO CLÍNICO */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-4"
            style={{ color: PRIMARY }}
          >
            Tudo começa pelo seu retrato
          </h2>
          <p
            className="text-center text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
          >
            O teste gratuito desenha seu quadro — e os planos trabalham em cima dele.
          </p>
          <div className="relative rounded-2xl border border-border bg-card p-4 md:p-6">
            <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-widest uppercase bg-muted text-muted-foreground px-2 py-1 rounded">
              Exemplo
            </span>
            <ClinicalThermometer doshaScores={exemploScores} />
          </div>
        </div>
      </section>

      {/* 4) CONVERSAS REAIS */}
      <section className="bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2
              className="font-serif italic font-bold text-3xl md:text-4xl"
              style={{ color: PRIMARY }}
            >
              Conversas reais com a Akasha
            </h2>
            <p
              className="mt-3 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              Alunas do portal, desta semana — só tiramos os nomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const AKASHA_COLOR = "hsl(var(--akasha))";
              const AKASHA_BG = "hsl(var(--akasha) / 0.10)";
              const Label = ({ children }: { children: React.ReactNode }) => (
                <p
                  className="text-[10px] uppercase tracking-wider font-bold mb-3"
                  style={{ color: AKASHA_COLOR, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </p>
              );
              const Person = ({ children }: { children: React.ReactNode }) => (
                <div className="flex justify-end mb-2">
                  <div
                    className="max-w-[88%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm"
                    style={{ background: PRIMARY, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {children}
                  </div>
                </div>
              );
              const Akasha = ({ children }: { children: React.ReactNode }) => (
                <div className="flex justify-start mb-2">
                  <div
                    className="max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm"
                    style={{ background: AKASHA_BG, color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {children}
                  </div>
                </div>
              );
              const Note = ({ children }: { children: React.ReactNode }) => (
                <p
                  className="text-xs italic text-center mt-2 mb-1"
                  style={{ color: PRIMARY, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </p>
              );
              const Card = ({
                label,
                children,
              }: {
                label: string;
                children: React.ReactNode;
              }) => (
                <div
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 md:p-5"
                  style={{ background: PAPER, borderColor: "rgba(53,47,84,0.08)" }}
                >
                  <Label>{label}</Label>
                  {children}
                </div>
              );

              return (
                <>
                  <Card label="Ela acode na hora">
                    <Person>
                      Está acontecendo agora, não é um episódio frequente. Acho que comi algo muito seco. Jantei uma sopa de cuscuz com carne desfiada. E depois comi pão de fermentação lenta que estava meio emborrachado.
                    </Person>
                    <Akasha>
                      Faz sentido, sim. Isso tem bem a cara de um Vata agredido pela secura e pela textura mais difícil de descer. Agora, o mais simples costuma funcionar melhor: pare de comer, sente-se ereta sem ficar dura e tome pequenos goles de água morna, devagar. Não gelada. Não deite agora e não tente "empurrar" com mais comida.
                    </Akasha>
                  </Card>

                  <Card label="Ela lembra de você">
                    <Person>
                      Estou fazendo sopinha de flocos de milho. Isso é ruim para o meu dosha?
                    </Person>
                    <Akasha>
                      O floco de milho tende a ser mais seco e leve, e isso pode não dar sustentação suficiente para você. E como você teve peso depois do caldo de abóbora com carne, o ponto não é sair de um extremo para outro. O seu corpo parece pedir o meio do caminho: comida morna, úmida, simples e estável.
                    </Akasha>
                    <Note>O caldo de abóbora? Ela tinha contado dias antes. A Akasha lembrou.</Note>
                  </Card>

                  <Card label="Ela lê o corpo por trás do sintoma">
                    <Person>
                      Estou no 8º dia "doente" e o que está atrasando a recuperação é a tosse seca que me dá após as 2:00 da madrugada e vai até as 5:00. E o muco que ainda está saindo, espesso e amarelo.
                    </Person>
                    <Akasha>
                      O quadro está na fase de limpeza final, mas ainda com dois sinais misturados: Vata seco fazendo a tosse da madrugada e Pitta-Kapha mantendo esse muco amarelo mais espesso. O horário entre duas e cinco da manhã costuma deixar Vata mais evidente. E me diz uma coisa: esse muco está saindo mais do nariz, da garganta, ou dos dois?
                    </Akasha>
                  </Card>

                  <Card label="Ela caminha junto com o seu médico">
                    <Person>
                      Se o médico me mandou tomar magnésio em cápsulas, na visão do ayurveda, qual seria o melhor anupana e horário para tomar esse suplemento?
                    </Person>
                    <Akasha>
                      Para alguém com Vata e Pitta altos eu tenderia a preferir tomar junto de algo morno e mais nutritivo, como depois do jantar ou perto da noite, porque o magnésio costuma acalmar o sistema nervoso. Como você está com secura e sensibilidade, eu evitaria tomar de estômago vazio.
                    </Akasha>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 5) RECEITAS DE VERDADE */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-4"
            style={{ color: PRIMARY }}
          >
            Comida de verdade, feita para você
          </h2>
          <p
            className="text-center text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
          >
            Receitas com ingredientes do mercado do seu bairro — cada uma explicando o que faz pelo seu corpo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {RECEITAS.map((r) => (
              <div
                key={r.titulo}
                className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden border shadow-sm"
                style={{ background: PAPER, borderColor: "rgba(53,47,84,0.08)" }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={r.url}
                    alt={r.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold mb-1"
                    style={{ color: "#C93F3F" }}
                  >
                    Receita
                  </p>
                  <h3
                    className="font-serif font-bold text-base leading-tight mb-1.5"
                    style={{ color: PRIMARY }}
                  >
                    {r.titulo}
                  </h3>
                  <p
                    className="text-sm leading-snug"
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

      {/* 6) NÚMEROS DO PORTAL */}
      <section style={{ background: PRIMARY }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {NUMEROS.map((n) => (
              <p
                key={n}
                className="text-white text-sm md:text-base leading-snug"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {n}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 7) AS 3 OFERTAS */}
      <section id="planos" style={{ background: SURFACE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-3"
            style={{ color: PRIMARY }}
          >
            Escolha seu plano
          </h2>
          <p
            className="text-center text-base md:text-lg mb-12 max-w-2xl mx-auto"
            style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}
          >
            Comece pela rotina ou vá direto no portal inteiro — a escolha é sua.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* CARD 1 — MINHA ROTINA */}
            <div
              className={cardBase}
              style={{ background: VERDE_BG, borderColor: `${VERDE}33` }}
            >
              {planoAtual === "rotina" && <SeuPlanoBadge />}
              <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: VERDE }}>
                Minha Rotina
              </p>
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                Sua semana pronta
              </h3>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 30<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: VERDE, fontFamily: "'DM Sans', sans-serif" }}
              >
                Menos de R$1 por dia.
              </p>

              <BeneficiosList plano="rotina" checkColor={VERDE} />

              <CardAction plano="rotina" color={VERDE} label="Começar minha rotina" />
            </div>

            {/* CARD 2 — PREMIUM MENSAL */}
            <div
              className={cardBase}
              style={{ background: `${SALMAO}12`, borderColor: `${SALMAO}55` }}
            >
              {planoAtual === "mensal" && <SeuPlanoBadge />}
              <p
                className="text-xs uppercase tracking-wider font-bold mb-2 inline-flex items-center gap-1.5"
                style={{ color: SALMAO }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Premium
              </p>
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                Tudo do portal
              </h3>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 79,90<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: SALMAO, fontFamily: "'DM Sans', sans-serif" }}
              >
                Tudo da Rotina, mais a companhia.
              </p>

              <BeneficiosList plano="mensal" checkColor={SALMAO} />

              <CardAction
                plano="mensal"
                color={SALMAO}
                hoverColor={SALMAO_HOVER}
                label="Assinar Premium"
              />
            </div>

            {/* CARD 3 — PREMIUM ANUAL */}
            <div
              className={cardBase + " border-2 shadow-xl"}
              style={{ background: DOURADO_BG, borderColor: DOURADO }}
            >
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
              <p
                className="text-xs uppercase tracking-wider font-bold mb-2 mt-1"
                style={{ color: DOURADO_DARK }}
              >
                Premium Anual
              </p>
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                Um ano inteiro
              </h3>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 597<span className="text-base font-normal opacity-70">/ano</span>
              </p>
              <p
                className="text-sm font-bold mb-5"
                style={{ color: DOURADO_DARK, fontFamily: "'DM Sans', sans-serif" }}
              >
                38% DE DESCONTO
              </p>

              <BeneficiosList
                plano="anual"
                checkColor={DOURADO_DARK}
                renderItem6Extra={cursoIncluso}
                renderItem7Extra={seloDesconto}
              />

              <CardAction plano="anual" color={DOURADO} label="Assinar Anual" />
            </div>
          </div>
        </div>
      </section>

      {/* 8) FAQ */}
      <section className="bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-10"
            style={{ color: PRIMARY }}
          >
            Perguntas comuns
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-card border border-border rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <h3
                      className="flex-1 font-serif font-bold text-base md:text-lg leading-snug"
                      style={{ color: PRIMARY }}
                    >
                      {item.q}
                    </h3>
                    <ChevronDown
                      className="shrink-0 h-5 w-5 transition-transform duration-300"
                      style={{
                        color: PRIMARY,
                        opacity: 0.6,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {isOpen && (
                    <p
                      className="px-5 pb-6 text-base leading-relaxed"
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
