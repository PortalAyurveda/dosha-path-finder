import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Wind, Flame, Leaf, BookOpen, Sparkles, Users, ArrowRight } from "lucide-react";
import CTAButton from "@/components/CTAButton";
import SectionTitle from "@/components/SectionTitle";
import DoshaCard from "@/components/DoshaCard";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Portal Ayurveda — Descubra seu Dosha</title>
        <meta name="description" content="Descubra seu dosha e receba conteúdo personalizado de Ayurveda. Teste gratuito, vídeos, artigos e acesso a inteligência artificial." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-sun">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
          <h1 className="animate-fade-in mb-6">
            Descubra seu Dosha
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Faça o teste gratuito e receba um plano personalizado com base na sabedoria milenar do Ayurveda.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CTAButton to="/teste-de-dosha">
              Começar o Teste Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </CTAButton>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 3 Doshas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <SectionTitle subtitle="Os três biotipos do Ayurveda que definem sua constituição única.">
          Os Três Doshas
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DoshaCard
            dosha="vata"
            title="Vata"
            description="Ar e Éter. Criatividade, movimento e leveza. Governa a comunicação e o sistema nervoso."
            icon={<Wind className="h-10 w-10" />}
          />
          <DoshaCard
            dosha="pitta"
            title="Pitta"
            description="Fogo e Água. Transformação, foco e intensidade. Governa a digestão e o metabolismo."
            icon={<Flame className="h-10 w-10" />}
          />
          <DoshaCard
            dosha="kapha"
            title="Kapha"
            description="Terra e Água. Estabilidade, força e nutrição. Governa a estrutura e a imunidade."
            icon={<Leaf className="h-10 w-10" />}
          />
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-surface-sky">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <SectionTitle subtitle="Três passos simples para transformar sua saúde.">
            Como Funciona
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: <Sparkles className="h-8 w-8" />, title: "Faça o Teste", desc: "Responda perguntas sobre seu corpo, mente e hábitos para descobrir seu dosha predominante." },
              { step: "2", icon: <BookOpen className="h-8 w-8" />, title: "Receba seu Plano", desc: "Conteúdo personalizado: alimentação, rotinas, remédios naturais e vídeos exclusivos." },
              { step: "3", icon: <Users className="h-8 w-8" />, title: "Evolua com a Comunidade", desc: "Ganhe medalhas, acesse a IA Akasha e conecte-se com terapeutas qualificados." },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-2xl bg-background shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 text-secondary mb-4">
                  {item.icon}
                </div>
                <h4 className="mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <SectionTitle subtitle="Comece agora mesmo e descubra o caminho para o equilíbrio.">
          Pronto para Começar?
        </SectionTitle>
        <CTAButton to="/teste-de-dosha">
          Fazer o Teste de Dosha
          <ArrowRight className="ml-2 h-5 w-5" />
        </CTAButton>
      </section>
    </>
  );
};

export default Index;
