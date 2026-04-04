import { Wind, Flame, Leaf } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import DoshaCard from "@/components/DoshaCard";

const DoshaSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <SectionTitle subtitle="Os três biotipos que formam a sua constituição única segundo o Ayurveda.">
        Entenda os princípios do seu corpo
      </SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DoshaCard
          dosha="vata"
          title="Vata"
          description="Ar e Éter — Criatividade, movimento e leveza. Governa a comunicação e o sistema nervoso."
          icon={<Wind className="h-10 w-10" />}
        />
        <DoshaCard
          dosha="pitta"
          title="Pitta"
          description="Fogo e Água — Transformação, foco e intensidade. Governa a digestão e o metabolismo."
          icon={<Flame className="h-10 w-10" />}
        />
        <DoshaCard
          dosha="kapha"
          title="Kapha"
          description="Terra e Água — Estabilidade, força e nutrição. Governa a estrutura e a imunidade."
          icon={<Leaf className="h-10 w-10" />}
        />
      </div>
    </section>
  );
};

export default DoshaSection;
