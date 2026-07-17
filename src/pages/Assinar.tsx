import { useEffect, useState, useRef } from "react";
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
  ClipboardCheck,
  MessagesSquare,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

const AKASHA_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-akasha.png";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const SALMAO_HOT = "#FF7676";
const SURFACE = "#FFF8EE";
const PAPER = "#FDFBF5";

type Plano = "rotina" | "mensal" | "anual";

const RECEITAS = [
  {
    titulo: "Kitchari com salsa",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-kitchari-com-salsa-e-oleo-vegetal.webp",
  },
  {
    titulo: "Abobrinha recheada com panir",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-abobrinha-recheada-com-panir-assada-no-forno.webp",
  },
  {
    titulo: "Suco Matinal Ayurveda",
    url: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-suco-matinal-ayurveda-opcao-5.webp",
  },
];

const NUMEROS = [
  { valor: 925, sufixo: "", label: "aulas" },
  { valor: 148, sufixo: "", label: "receitas com preparo" },
  { valor: 30000, sufixo: "", label: "conversas com a Akasha" },
  { valor: 17, sufixo: "", label: "anos de ensino no Brasil" },
];

const FAQ = [
  {
    q: "Já fiz o teste de graça — por que pagar?",
    a: "O teste mostra onde você está. A rotina é o que te tira de lá. Saber o diagnóstico sem o tratamento é como ter o raio-x e não ter o remédio.",
  },
  {
    q: "Por que pagar todo mês, e não uma vez só?",
    a: "Porque seu corpo não é o mesmo todo mês. O estresse muda, a estação muda, o sono muda. Uma rotina fixa envelhece — a sua é revisada mensalmente pra continuar certa.",
  },
  {
    q: "E se não for pra mim?",
    a: "7 dias de garantia com devolução completa. E depois, cancele quando quiser, na sua conta, sem ligação e sem perguntas.",
  },
  {
    q: "Preciso entender de tecnologia?",
    a: "Não. Funciona no celular, tudo em português simples — se você chegou até aqui, já sabe o suficiente.",
  },
  {
    q: "Já assino a Rotina — vou pagar as duas?",
    a: "Não: ao virar Premium, a Rotina avulsa se encerra sozinha no fim do período já pago.",
  },
];

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

const Counter = ({ target, label }: { target: number; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.3 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const v = useCountUp(target, visible);
  const formatted =
    target >= 1000 ? v.toLocaleString("pt-BR") : v.toString();
  return (
    <div ref={ref} className="text-center">
      <div
        className="font-serif italic font-bold text-3xl md:text-5xl leading-none"
        style={{ color: PRIMARY }}
      >
        {formatted}
      </div>
      <div
        className="mt-2 text-xs md:text-sm uppercase tracking-wider"
        style={{ color: PRIMARY, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </div>
    </div>
  );
};

const Assinar = () => {
  const { user, profile, doshaResult } = useUser();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<Plano | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  const doshaPrimeiro =
    doshaResult?.doshaprincipal?.split("-")[0]?.trim() ?? null;

  const heroTitle = doshaPrimeiro
    ? `${doshaPrimeiro}, você descobriu seu dosha. E agora?`
    : "Você descobriu seu dosha. E agora?";

  const rotinaIncluye = [
    { Icon: CalendarDays, texto: "Rotina de 30 dias desenhada pro seu dosha" },
    { Icon: Utensils, texto: "Receitas do dia — café, almoço, jantar, chás e tônicos" },
    { Icon: ShoppingBag, texto: "Lista de compras semanal pronta" },
    { Icon: RefreshCw, texto: "Revisão mensal do plano" },
  ];

  const premiumInclue = [
    { Icon: Sparkles, texto: "Tudo da Rotina Personalizada, incluso" },
    {
      Icon: Brain,
      texto:
        "Akasha sem limite — a conselheira que acompanha sua jornada, treinada nas mais de 900 aulas do portal",
    },
    { Icon: BookOpen, texto: "Artigos personalizados pelo seu dosha" },
    { Icon: Video, texto: "Biblioteca de vídeos com busca avançada" },
    { Icon: LineChart, texto: "Gráficos de evolução e reteste mensal do dosha" },
    { Icon: ShoppingBag, texto: "Cupons exclusivos na loja Samkhya" },
  ];

  const passos = [
    { Icon: ClipboardCheck, texto: "Você faz o teste — o portal te conhece" },
    {
      Icon: CalendarDays,
      texto:
        "Sua rotina chega montada: 8 momentos por dia, do chá de acordar ao tônico da noite — 56 itens na sua semana, cada um com preparo e o porquê",
    },
    {
      Icon: MessagesSquare,
      texto:
        "E a Akasha caminha junto: da primeira dúvida ao ajuste do mês, de manhã ou de madrugada",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Assine o Portal Ayurveda — Rotina ou Premium</title>
        <meta
          name="description"
          content="A rotina que resolve o que o teste mostrou: plano diário pro seu dosha e a Akasha te guiando durante toda a jornada."
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
          <h1
            className="font-serif italic font-bold text-3xl md:text-5xl leading-tight mb-6"
            style={{ color: PRIMARY }}
          >
            {heroTitle}
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.9, fontFamily: "'DM Sans', sans-serif" }}
          >
            O teste te mostrou o problema. A rotina resolve: um plano diário desenhado pro
            seu desequilíbrio — e a <strong>Akasha</strong>, a inteligência que estudou tudo
            isso, te guiando durante toda a jornada.
          </p>
          {!doshaPrimeiro && (
            <p
              className="text-sm md:text-base mb-8"
              style={{ color: PRIMARY, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}
            >
              Ainda não fez o teste?{" "}
              <button
                onClick={() => navigate("/teste-de-dosha")}
                className="underline font-semibold"
                style={{ color: SALMAO }}
              >
                comece por ele, é grátis →
              </button>
            </p>
          )}
          <button
            onClick={scrollToPlanos}
            className="inline-flex items-center justify-center px-10 py-5 rounded-full text-white font-semibold text-base md:text-lg shadow-lg transition-colors mt-4"
            style={{ backgroundColor: SALMAO }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
          >
            Ver planos
          </button>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl text-center mb-12"
            style={{ color: PRIMARY }}
          >
            Como funciona
          </h2>
          <ol className="space-y-8 md:space-y-6">
            {passos.map(({ Icon, texto }, i) => (
              <li key={i} className="flex items-start gap-5 md:gap-6">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 relative"
                  style={{ background: `${SALMAO_HOT}1F` }}
                >
                  <Icon
                    className="w-6 h-6 md:w-7 md:h-7"
                    style={{ color: SALMAO_HOT }}
                    strokeWidth={1.7}
                  />
                  <span
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: SALMAO_HOT }}
                  >
                    {i + 1}
                  </span>
                </div>
                <p
                  className="text-base md:text-lg leading-relaxed pt-3"
                  style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Akasha te acompanha */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="text-center mb-8">
            <img
              src={AKASHA_LOGO}
              alt=""
              aria-hidden
              className="h-10 md:h-12 w-auto mx-auto mb-4 opacity-90"
            />
            <h2
              className="font-serif italic font-bold text-3xl md:text-4xl"
              style={{ color: PRIMARY }}
            >
              A Akasha te acompanha
            </h2>
            <p
              className="mt-3 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
            >
              Conversas reais de alunas do portal, desta semana — só tiramos os nomes.
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
                    style={{
                      background: PRIMARY,
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {children}
                  </div>
                </div>
              );
              const Akasha = ({ children }: { children: React.ReactNode }) => (
                <div className="flex justify-start mb-2">
                  <div
                    className="max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm"
                    style={{
                      background: AKASHA_BG,
                      color: PRIMARY,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
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

                  <Card label="Ela desce ao caso sério">
                    <Person>
                      Além de ter o agravamento em Pitta, também sofro com miomas uterinos. Teria uma dieta ou restrição diferenciada nesse caso?
                    </Person>
                    <Akasha>
                      Sim, tem um cuidado diferenciado. A dieta precisa fazer duas coisas ao mesmo tempo: refrescar sem esfriar demais, e desinflamar sem ressecar. Na prática, seu prato tende a funcionar melhor assim: base de arroz branco ou basmati, um legume cozido mais úmido, uma proteína vegetal leve e bem cozida, um pouco de ghee, especiarias suaves e folhas amargas no final.
                    </Akasha>
                  </Card>

                  <Card label="Ela fala a verdade com carinho">
                    <Person>
                      Estou com a pele do rosto cheia de manchas, melasmas. Usei óleos durante o dia, como gergelim, coco e às vezes rícino. Seria alimentar os melasmas?
                    </Person>
                    <Akasha>
                      Sim, pode estar alimentando, principalmente se a pele já está quente e sensível, porque o gergelim é mais pesado e aquecedor. O rícino eu deixaria bem de lado no rosto. Eu reduziria óleos no rosto de dia e observaria o intestino, porque a pele costuma mostrar o que está transbordando por dentro.
                    </Akasha>
                  </Card>

                  <div className="md:col-span-2">
                    <Card label="Ela entrega a receita — e o cartão chega junto">
                      <Person>Quais ingredientes e quantidades para massala doce para vata?</Person>
                      <Akasha>
                        Para a massala doce que acalma Vata, eu gosto de uma mistura simples e perfumada: 2 partes de canela, 1 parte de cardamomo e meia parte de cravo moído, tudo bem fininho. Se o Vata estiver muito ansioso, dá para deixar o cravo ainda mais discreto.
                      </Akasha>
                      <div className="flex justify-start mb-2">
                        <div
                          className="max-w-[92%] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden border flex items-center gap-3 p-2"
                          style={{ background: PAPER, borderColor: "rgba(53,47,84,0.12)" }}
                        >
                          <img
                            src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-arroz-doce-com-massala-doce-canela-cravo-e-cardamomo.webp"
                            alt=""
                            aria-hidden
                            loading="lazy"
                            className="w-14 h-14 object-cover rounded-tl-xl rounded-br-xl shrink-0"
                          />
                          <div className="min-w-0 pr-2">
                            <p
                              className="text-[10px] uppercase tracking-wider font-bold"
                              style={{ color: SALMAO_HOT, opacity: 0.9 }}
                            >
                              Receita
                            </p>
                            <p
                              className="font-serif font-bold text-sm leading-tight"
                              style={{ color: PRIMARY }}
                            >
                              Arroz doce com massala doce
                            </p>
                          </div>
                        </div>
                      </div>
                      <Person>Na receita do vídeo fala sobre pimenta rosa e branca. Vai?</Person>
                      <Akasha>
                        Essa receita específica de pimenta rosa não está no caderno, então eu não vou inventar uma orientação como se fosse parte da rotina. Eu ficaria com canela, cardamomo e cravo em dose suave, sem colocar pimentas.
                      </Akasha>
                      <Note>Quando não está nas aulas do professor, ela diz. A Akasha não inventa.</Note>
                    </Card>
                  </div>

                  <div className="md:col-span-2">
                    <Card label="Ela é honesta até para vender">
                      <Person>
                        Quero perder peso e a barriguinha, posso tomar somente a panacéia e quantas vezes ao dia?
                      </Person>
                      <Akasha>
                        Pode tomar? Pode, como apoio. Somente ela, para "resolver", eu não trataria assim. Se a sua panaceia for desidratada, coloque um pedacinho na água à noite e, de manhã, aqueça essa água. E o mais importante é ver se você está com fome real e como está o intestino — é corrigir a causa do ganho de peso.
                      </Akasha>
                    </Card>
                  </div>
                </>
              );
            })()}
          </div>

          <p
            className="text-center text-sm md:text-base mt-8 max-w-2xl mx-auto leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
          >
            A Akasha estudou as mais de 900 aulas do professor e recebe o seu teste a cada conversa — seu dosha, seu agni, sua idade. No plano gratuito, 25 conversas por mês; no Premium, sem limite.
          </p>
        </div>
      </section>

      {/* A rotina de verdade */}
      <section className="bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <p
            className="text-center text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
          >
            Isso é o que chega na sua rotina, todo dia — com quantidade, preparo e o
            porquê.
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
                <div className="p-4 text-center">
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold mb-1"
                    style={{ color: SALMAO_HOT }}
                  >
                    Receita
                  </p>
                  <h3
                    className="font-serif font-bold text-base leading-tight"
                    style={{ color: PRIMARY }}
                  >
                    {r.titulo}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <p
            className="text-center text-base md:text-lg max-w-2xl mx-auto mt-10 leading-relaxed"
            style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
          >
            E porque seu corpo muda, a rotina é revisada todo mês. Uma rotina que não se
            ajusta é só um papel na geladeira — a sua acompanha você.
          </p>
        </div>
      </section>

      {/* Números vivos */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {NUMEROS.map((n) => (
              <Counter key={n.label} target={n.valor} label={n.label} />
            ))}
          </div>
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
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
                Rotina Personalizada
              </h3>
              <p className="font-serif font-bold text-3xl mb-1" style={{ color: PRIMARY }}>
                R$ 30<span className="text-base font-normal opacity-70">/mês</span>
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: PRIMARY, opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
              >
                menos que R$1 por dia · cancele quando quiser
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
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: PRIMARY }}>
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

      {/* FAQ */}
      <section style={{ background: SURFACE }}>
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
                  className="bg-white border border-border rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
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

      {/* CTA Final */}
      <section
        style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1f1a3a 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <h2 className="font-serif italic font-bold text-3xl md:text-4xl text-white mb-8 leading-tight">
            Amanhã de manhã, seu dia já pode chegar pronto.
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
          <p
            className="text-sm md:text-base text-white/70 mt-5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            menos que R$1 por dia na Rotina · 7 dias de garantia
          </p>
        </div>
      </section>
    </>
  );
};

export default Assinar;
