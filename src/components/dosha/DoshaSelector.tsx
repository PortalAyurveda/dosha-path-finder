import { Link, useLocation } from "react-router-dom";
import { Wind, Flame, Mountain, Clock } from "lucide-react";

const doshas = [
  { key: "vata", label: "Vata", path: "/dosha/vata", icon: Wind, elements: "Éter + Ar" },
  { key: "pitta", label: "Pitta", path: "/dosha/pitta", icon: Flame, elements: "Fogo + Água" },
  { key: "kapha", label: "Kapha", path: "/dosha/kapha", icon: Mountain, elements: "Terra + Água" },
  { key: "horarios", label: "Horários", path: "/horarios", icon: Clock, elements: "Dinacharya" },
] as const;

const activeStyles: Record<string, string> = {
  vata: "bg-vata/20 border-vata text-vata ring-2 ring-vata/30",
  pitta: "bg-pitta/20 border-pitta text-pitta ring-2 ring-pitta/30",
  kapha: "bg-kapha/20 border-kapha text-kapha ring-2 ring-kapha/30",
  horarios: "bg-accent/20 border-accent text-accent-foreground ring-2 ring-accent/30",
};

const inactiveStyles: Record<string, string> = {
  vata: "border-border hover:border-vata/50 hover:bg-vata/5 text-muted-foreground hover:text-vata",
  pitta: "border-border hover:border-pitta/50 hover:bg-pitta/5 text-muted-foreground hover:text-pitta",
  kapha: "border-border hover:border-kapha/50 hover:bg-kapha/5 text-muted-foreground hover:text-kapha",
  horarios: "border-border hover:border-accent/50 hover:bg-accent/5 text-muted-foreground hover:text-accent-foreground",
};

const DoshaSelector = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const currentDosha = pathParts[2]; // /dosha/{vata|pitta|kapha}/...

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {doshas.map((d) => {
          const isActive = currentDosha === d.key;
          const Icon = d.icon;
          return (
            <Link
              key={d.key}
              to={d.path}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                isActive ? activeStyles[d.key] : inactiveStyles[d.key]
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{d.label}</span>
              <span className="hidden sm:inline text-xs font-normal opacity-70">({d.elements})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DoshaSelector;
