import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { trackPixel } from "@/lib/metaPixel";
import { Brain, BookOpen, Video, RefreshCw, CalendarDays, MessageCircle, ShieldCheck, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const AKASHA_LOGO =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-akasha.png";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const SURFACE = "#FFF8EE";

const beneficios = [
  { Icon: Brain, titulo: "Akasha ilimitada", desc: "Tire suas dúvidas a qualquer hora com uma IA treinada com mais de 1.000 aulas de Ayurveda. Sem limite de mensagens." },
  { Icon: BookOpen, titulo: "Artigos personalizados", desc: "Conteúdo filtrado pelo seu dosha. Alimentação, rotinas, ervas e muito mais — só o que é relevante pra você." },
  { Icon: Video, titulo: "Vídeos com pesquisa avançada", desc: "Encontre exatamente o que precisa dentro de horas de conteúdo gravado." },
  { Icon: RefreshCw, titulo: "Reteste mensal do dosha", desc: "Seu dosha muda com as estações e com a vida. Refaça o teste todo mês e receba orientações atualizadas." },
  { Icon: CalendarDays, titulo: "Rotina completa personalizada", desc: "Uma rotina ayurvédica feita para você: alimentação, sono, práticas e receitas para cada fase da sua vida." },
  { Icon: MessageCircle, titulo: "Comunidade no WhatsApp", desc: "Acesso à comunidade exclusiva de alunos do Portal Ayurveda. Em breve." },
];

const Assinar = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<"mensal" | "anual" | null>(null);

  useEffect(() => {
    trackPixel("ViewContent", { content_name: "Pagina Assinar" });
  }, []);

  const handleAssinar = async (plano: "mensal" | "anual") => {
    if (!user) {
      navigate("/entrar?redirect=/assinar");
      return;
    }
    trackPixel("InitiateCheckout", { content_type: "subscription" });
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

  return (
    <>
      <Helmet>
        <title>Portal Ayurveda Premium — Assine agora</title>
        <meta
          name="description"
          content="Tudo que você precisa para viver o Ayurveda: 1.000+ aulas, artigos e vídeos personalizados, e a Akasha — IA disponível 24h."
        />
      </Helmet>

      {/* Hero */}
      <section
        className="w-full"
        style={{ background: `linear-gradient(160deg, ${SURFACE} 0%, #F5F0FF 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <img
            src={AKASHA_LOGO}
            alt="Akasha — Portal Ayurveda"
            className="h-16 md:h-20 w-auto mx-auto mb-6"
            loading="eager"
          />
          <p
            className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] mb-5"
            style={{ color: PRIMARY, opacity: 0.7 }}
          >
            Seu novo lar da Ayurveda
          </p>
          <h1
            className="font-serif italic font-bold text-3xl md:text-5xl leading-tight mb-5"
            style={{ color: PRIMARY }}
          >
            Tudo que você precisa para viver o Ayurveda de verdade — num só lugar.
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
          >
            Mais de 1.000 aulas refinadas em artigos, vídeos e a Akasha: uma IA treinada com 17 anos de
            ensino ayurvédico, disponível pra você 24 horas por dia.
          </p>
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold text-base shadow-lg transition-colors"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Quero ser Premium
          </button>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-12"
            style={{ color: PRIMARY }}
          >
            Tudo incluso no Portal Ayurveda Premium
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map(({ Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${PRIMARY}14` }}
                >
                  <Icon className="w-6 h-6" style={{ color: PRIMARY }} strokeWidth={1.6} />
                </div>
                <h3
                  className="font-serif font-bold text-lg mb-2"
                  style={{ color: PRIMARY }}
                >
                  {titulo}
                </h3>
                <p
                  className="text-sm leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" style={{ background: SURFACE }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-10"
            style={{ color: PRIMARY }}
          >
            Escolha seu plano
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Mensal */}
            <div className="bg-white rounded-2xl border border-border p-7 flex flex-col">
              <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: PRIMARY, opacity: 0.7 }}>
                Mensal
              </p>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 79,90<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Cancele quando quiser
              </p>
              <button
                onClick={() => handleAssinar("mensal")}
                disabled={loadingPlan !== null}
                className="mt-auto w-full py-3 rounded-full text-white font-semibold text-sm transition-colors disabled:opacity-60"
                style={{ backgroundColor: SALMAO }}
                onMouseEnter={(e) => !loadingPlan && (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
              >
                {loadingPlan === "mensal" ? "Redirecionando..." : "Assinar agora"}
              </button>
            </div>

            {/* Anual */}
            <div
              className="bg-white rounded-2xl p-7 flex flex-col relative shadow-lg"
              style={{ border: `2px solid ${SALMAO}` }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: SALMAO }}
              >
                Mais popular
              </span>
              <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: PRIMARY, opacity: 0.7 }}>
                Anual
              </p>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 49,75<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Equivale a R$ 597,00 por ano
              </p>
              <p className="text-sm font-semibold mb-6 inline-flex items-center gap-1" style={{ color: SALMAO }}>
                <Check className="w-4 h-4" /> 2 meses grátis
              </p>
              <button
                onClick={() => handleAssinar("anual")}
                disabled={loadingPlan !== null}
                className="mt-auto w-full py-3 rounded-full text-white font-semibold text-sm transition-colors disabled:opacity-60"
                style={{ backgroundColor: SALMAO }}
                onMouseEnter={(e) => !loadingPlan && (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
              >
                {loadingPlan === "anual" ? "Redirecionando..." : "Assinar agora"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: PRIMARY }} strokeWidth={1.5} />
          <p className="text-base md:text-lg leading-relaxed" style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
            <strong>7 dias de garantia.</strong> Se não for o que você esperava, devolvemos 100% do
            valor. Sem perguntas.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1f1a3a 100%)` }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <h2 className="font-serif italic font-bold text-3xl md:text-4xl text-white mb-8 leading-tight">
            Pronto para transformar sua saúde com Ayurveda?
          </h2>
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl transition-colors"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Começar agora
          </button>
        </div>
      </section>
    </>
  );
};

export default Assinar;
