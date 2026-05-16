import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface PremiumGateSectionProps {
  titulo?: string;
  descricao?: string;
}

const PremiumGateSection = ({
  titulo = "Conteúdo Avançado — exclusivo Premium",
  descricao = "Diagnósticos profundos, patologia dos subdoshas e mais. Liberado para assinantes do Portal Ayurveda.",
}: PremiumGateSectionProps) => (
  <section className="my-10 mx-auto max-w-2xl">
    <div className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-surface-sun border border-border p-8 md:p-10 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">{titulo}</h2>
      <p className="text-muted-foreground font-sans text-base">{descricao}</p>
      <Link
        to="/assinar"
        className="inline-block mt-2 px-6 py-3 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Conhecer o Premium
      </Link>
    </div>
  </section>
);

export default PremiumGateSection;
