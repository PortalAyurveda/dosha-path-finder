import { useNavigate } from "react-router-dom";
import { Clock, UtensilsCrossed, Pill, Bird } from "lucide-react";

interface DoshaNavPillsProps {
  dosha: "vata" | "pitta" | "kapha";
}

const scrollPills = [
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { id: "remedios", label: "Remédios", icon: Pill },
];

const doshaColors = {
  vata: "border-vata bg-vata/15 text-vata hover:bg-vata/25",
  pitta: "border-pitta bg-pitta/15 text-pitta hover:bg-pitta/25",
  kapha: "border-kapha bg-kapha/15 text-kapha hover:bg-kapha/25",
};

const doshaAdvancedRoutes = {
  vata: "/dosha/vata/adoecimento",
  pitta: "/dosha/pitta/adoecimento",
  kapha: "/dosha/kapha/adoecimento",
};

const DoshaNavPills = ({ dosha }: DoshaNavPillsProps) => {
  const navigate = useNavigate();

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-8">
      {scrollPills.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            onClick={() => handleScroll(p.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm shadow-sm transition-colors ${doshaColors[dosha]}`}
          >
            <Icon className="h-4 w-4" />
            {p.label}
          </button>
        );
      })}
      <button
        onClick={() => navigate(doshaAdvancedRoutes[dosha])}
        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm shadow-sm transition-colors ${doshaColors[dosha]}`}
      >
        <Bird className="h-4 w-4" />
        Avançado
      </button>
    </div>
  );
};

export default DoshaNavPills;
