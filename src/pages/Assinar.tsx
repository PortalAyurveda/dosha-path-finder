import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { trackPixel } from "@/lib/metaPixel";
import {
  Brain,
  BookOpen,
  Video,
  RefreshCw,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  Check,
  Sparkles,
  ShoppingBag,
  LineChart,
  Utensils,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const AKASHA_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-akasha.png";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const SURFACE = "#FFF8EE";

type Plano = "rotina" | "mensal" | "anual";

const Assinar = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<Plano | null>(null);

  useEffect(() => {
    trackPixel("ViewContent", { content_name: "Pagina Assinar" });
  }, []);

  const handleAssinar = async (plano: Plano) => {
    if (!user) {
      navigate(`/entrar?redirect=/assinar`);
      return;
    }
    trackPixel("InitiateCheckout", { content_type: "subscription", plano });
    setLoadingPlan(plano);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plano, user_id: user.id, email: profile?.email ?? user.email },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não retornada");
      window.location.href = data.url;
    } catch (e) {
      toast({
        title: "Erro ao iniciar assinatura",
        description: (e as Error).message,
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  const scrollToPlanos = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  const rotinaIncluye = [
    { Icon: CalendarDays, texto: "Rotina de 30 dias desenhada pro seu dosha" },
    { Icon: Utensils, texto: "Receitas do dia — café, almoço, jantar, chás e tônicos" },
    { Icon: ShoppingBag, texto: "Lista de compras semanal pronta" },
    { Icon: RefreshCw, texto: "Revisão mensal do plano" },
  ];

  const premiumInclue = [
    { Icon: Sparkles, texto: "Tudo da Rotina Personalizada, incluso" },
    { Icon: Brain, texto: "Akasha ilimitada — a IA treinada em 1.000+ aulas de Ayurveda" },
    { Icon: BookOpen, texto: "Artigos personalizados pelo seu dosha" },
    { Icon: Video, texto: "Biblioteca de vídeos com busca avançada" },
    { Icon: LineChart, texto: "Gráficos de evolução e reteste mensal do dosha" },
    { Icon: ShoppingBag, texto: "Cupons exclusivos na loja Samkhya" },
    { Icon: MessageCircle, texto: "Comunidade no WhatsApp (em breve)" },
  ];

  return (
    <>
      <Helmet>
        <title>Assine o Portal Ayurveda — Rotina ou Premium</title>
        <meta
          name="description"
          content="Comece pela Rotina Personalizada por R$30/mês ou vá direto para o Premium, com Akasha ilimitada, biblioteca completa e evolução do seu dosha."
        />
      </Helmet>

      {/* Hero */}
      <section
        className="w-full"
        style={{ background: `linear-gradient(160deg, ${SURFACE} 0%, #F5F0FF 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
          <img
            src={AKASHA_LOGO}
            alt="Akasha — Portal Ayurveda"
            className="h-14 md:h-16 w-auto mx-auto mb-6"
            loading="eager"
          />
          <p
            className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] mb-4"
            style={{ color: PRIMARY, opacity: 0.7 }}
          >
            Dois caminhos para viver o Ayurveda
          </p>
          <h1
            className="font-serif italic font-bold text-3xl md:text-5xl leading-tight mb-5"
            style={{ color: PRIMARY }}
          >
            Comece pela rotina. Ou vá direto para tudo.
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
          >
            A <strong>Rotina Personalizada</strong> é o primeiro degrau: um plano diário pro seu dosha,
            por R$30/mês. O <strong>Premium</strong> inclui a rotina e tudo mais — Akasha ilimitada,
            biblioteca completa e sua evolução acompanhada.
          </p>
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold text-base shadow-lg transition-colors"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Ver planos
          </button>
        </div>
      </section>

      {/* Planos — a escada */}
      <section id="planos" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-3"
            style={{ color: PRIMARY }}
          >
            Escolha seu plano
          </h2>
          <p
            className="text-center text-sm md:text-base mb-10 max-w-2xl mx-auto"
            style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
          >
            Quem assina Premium <strong>já tem a Rotina inclusa</strong> — não precisa comprar as duas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* COLUNA 1 — Rotina Personalizada */}
            <div className="bg-white rounded-2xl border border-border p-7 flex flex-col">
              <p
                className="text-xs uppercase tracking-wider font-bold mb-2"
                style={{ color: PRIMARY, opacity: 0.7 }}
              >
                Primeiro degrau
              </p>
              <h3
                className="font-serif font-bold text-2xl mb-1"
                style={{ color: PRIMARY }}
              >
                Rotina Personalizada
              </h3>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 30<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p
                className="text-sm text-muted-foreground mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancele quando quiser
              </p>

              <ul className="space-y-3 mb-8">
                {rotinaIncluye.map(({ Icon, texto }) => (
                  <li key={texto} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${PRIMARY}14` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: PRIMARY }} strokeWidth={1.7} />
                    </div>
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {texto}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleAssinar("rotina")}
                disabled={loadingPlan !== null}
                className="mt-auto w-full py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-60 border-2"
                style={{ color: PRIMARY, borderColor: PRIMARY, background: "transparent" }}
                onMouseEnter={(e) => {
                  if (!loadingPlan) {
                    e.currentTarget.style.background = PRIMARY;
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = PRIMARY;
                }}
              >
                {loadingPlan === "rotina" ? "Redirecionando..." : "Assinar Rotina"}
              </button>
            </div>

            {/* COLUNA 2 — Premium */}
            <div
              className="bg-white rounded-2xl p-7 flex flex-col relative shadow-lg"
              style={{ border: `2px solid ${SALMAO}` }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                style={{ backgroundColor: SALMAO }}
              >
                Mais completo · inclui a rotina
              </span>
              <p
                className="text-xs uppercase tracking-wider font-bold mb-2 mt-1"
                style={{ color: PRIMARY, opacity: 0.7 }}
              >
                Portal completo
              </p>
              <h3
                className="font-serif font-bold text-2xl mb-1"
                style={{ color: PRIMARY }}
              >
                Premium
              </h3>
              <div className="mb-1">
                <p className="font-serif font-bold text-3xl" style={{ color: PRIMARY }}>
                  R$ 79,90<span className="text-base font-normal opacity-70">/mês</span>
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}
                >
                  ou <strong>R$ 597/ano</strong>{" "}
                  <span className="opacity-70">(sai a R$ 49,75/mês)</span>
                </p>
              </div>
              <p
                className="text-sm font-semibold mb-5 mt-2 inline-flex items-center gap-1"
                style={{ color: SALMAO }}
              >
                <Check className="w-4 h-4" /> Anual: 2 meses grátis
              </p>

              <ul className="space-y-3 mb-6">
                {premiumInclue.map(({ Icon, texto }) => (
                  <li key={texto} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${SALMAO}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: SALMAO }} strokeWidth={1.7} />
                    </div>
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {texto}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-2">
                <button
                  onClick={() => handleAssinar("anual")}
                  disabled={loadingPlan !== null}
                  className="w-full py-3 rounded-full text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  style={{ backgroundColor: SALMAO }}
                  onMouseEnter={(e) =>
                    !loadingPlan && (e.currentTarget.style.backgroundColor = SALMAO_HOVER)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
                >
                  {loadingPlan === "anual"
                    ? "Redirecionando..."
                    : "Assinar Anual · R$ 597/ano"}
                </button>
                <button
                  onClick={() => handleAssinar("mensal")}
                  disabled={loadingPlan !== null}
                  className="w-full py-2.5 rounded-full font-medium text-sm transition-colors disabled:opacity-60"
                  style={{ color: PRIMARY, background: "transparent" }}
                >
                  {loadingPlan === "mensal"
                    ? "Redirecionando..."
                    : "Ou assinar mensal · R$ 79,90/mês"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <ShieldCheck
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: PRIMARY }}
            strokeWidth={1.5}
          />
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
          >
            <strong>7 dias de garantia.</strong> Se não for o que você esperava, devolvemos 100% do
            valor. Sem perguntas.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section
        style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1f1a3a 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <h2 className="font-serif italic font-bold text-3xl md:text-4xl text-white mb-8 leading-tight">
            Comece hoje o cuidado que combina com o seu corpo.
          </h2>
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl transition-colors"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Escolher meu plano
          </button>
        </div>
      </section>
    </>
  );
};

export default Assinar;
