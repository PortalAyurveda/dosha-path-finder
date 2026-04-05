import { AlertTriangle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  vata: { border: "border-vata/30", bg: "bg-vata/5", dot: "bg-vata", trigger: "hover:bg-vata/10" },
  pitta: { border: "border-pitta/30", bg: "bg-pitta/5", dot: "bg-pitta", trigger: "hover:bg-pitta/10" },
  kapha: { border: "border-kapha/30", bg: "bg-kapha/5", dot: "bg-kapha", trigger: "hover:bg-kapha/10" },
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

      <Accordion type="multiple" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className={`${colors.bg} border ${colors.border} rounded-xl px-4 py-0 overflow-hidden`}
          >
            <AccordionTrigger
              className={`py-3 text-left text-sm font-bold text-secondary no-underline hover:no-underline ${colors.trigger} gap-2`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${colors.dot} shrink-0`} />
                {item.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-foreground leading-relaxed pb-3 pt-0">
              {item.text}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default AgravamentosSection;
