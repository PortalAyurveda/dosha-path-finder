import { ArrowRight } from "lucide-react";
import CTAButton from "@/components/CTAButton";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-surface-sun">
      {/* Warm decorative shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-accent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-kapha blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
        <h1 className="animate-fade-in mb-6">
          Portal Ayurveda: Seu guia completo para saúde e longevidade.
        </h1>
        <p
          className="text-lg md:text-xl text-primary/70 max-w-2xl mx-auto mb-10 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          Descubra e cuide dos seus Doshas por meio da medicina milenar.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CTAButton to="/teste-de-dosha">
            Fazer o Teste de Dosha Gratuito
            <ArrowRight className="ml-2 h-5 w-5" />
          </CTAButton>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
