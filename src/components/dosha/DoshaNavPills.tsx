import { Clock, UtensilsCrossed, Pill, AlertTriangle } from "lucide-react";

interface DoshaNavPillsProps {
  dosha: "vata" | "pitta" | "kapha";
}

const pills = [
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { id: "remedios", label: "Remédios", icon: Pill },
  { id: "agravamentos", label: "Agravamentos", icon: AlertTriangle },
];

const doshaColors = {
  vata: "border-vata/40 text-vata hover:bg-vata/10",
  pitta: "border-pitta/40 text-pitta hover:bg-pitta/10",
  kapha: "border-kapha/40 text-kapha hover:bg-kapha/10",
};

const DoshaNavPills = ({ dosha }: DoshaNavPillsProps) => {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex flex-wrap justify-center gap-2">
        {pills.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${doshaColors[dosha]}`}
            >
              <Icon className="h-4 w-4" />
              {p.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DoshaNavPills;
