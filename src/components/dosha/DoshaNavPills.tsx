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
  vata: "border-vata bg-vata/15 text-vata hover:bg-vata/25",
  pitta: "border-pitta bg-pitta/15 text-pitta hover:bg-pitta/25",
  kapha: "border-kapha bg-kapha/15 text-kapha hover:bg-kapha/25",
};

const DoshaNavPills = ({ dosha }: DoshaNavPillsProps) => {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
      <div className="flex flex-wrap justify-center gap-2.5">
        {pills.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm shadow-sm transition-colors ${doshaColors[dosha]}`}
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
