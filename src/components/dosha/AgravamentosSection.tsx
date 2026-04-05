import { AlertTriangle } from "lucide-react";

interface AgravamentoItem {
  title: string;
  text: string;
}

interface AgravamentosSectionProps {
  dosha: "vata" | "pitta" | "kapha";
  intro: string;
  items: AgravamentoItem[];
}

const doshaAccent = {
  vata: { border: "border-vata/30", bg: "bg-vata/5", dot: "bg-vata" },
  pitta: { border: "border-pitta/30", bg: "bg-pitta/5", dot: "bg-pitta" },
  kapha: { border: "border-kapha/30", bg: "bg-kapha/5", dot: "bg-kapha" },
};

const AgravamentosSection = ({ dosha, intro, items }: AgravamentosSectionProps) => {
  const colors = doshaAccent[dosha];

  return (
    <section id="agravamentos" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <h2 className="font-serif text-2xl md:text-3xl font-bold italic text-primary mb-4">
        <AlertTriangle className="inline h-6 w-6 mr-2 text-pitta" />
        Principais Agravamentos e Manifestações Clínicas
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{intro}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${colors.bg} border ${colors.border} rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-4 flex items-start gap-3`}
          >
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${colors.dot} shrink-0`} />
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-secondary">{item.title}:</span> {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AgravamentosSection;
