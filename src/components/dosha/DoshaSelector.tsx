import { Link, useLocation } from "react-router-dom";
import { Wind, Flame, Mountain, Clock, BookOpen } from "lucide-react";

const doshas = [
  { key: "vata", label: "Vata", path: "/biblioteca/vata", icon: Wind },
  { key: "pitta", label: "Pitta", path: "/biblioteca/pitta", icon: Flame },
  { key: "kapha", label: "Kapha", path: "/biblioteca/kapha", icon: Mountain },
  { key: "horarios", label: "Horários", path: "/biblioteca/horarios", icon: Clock },
  { key: "sommelier", label: "Sommelier", path: "/biblioteca", icon: BookOpen },
] as const;

const activeStyles: Record<string, string> = {
  vata: "bg-vata/20 border-vata text-vata",
  pitta: "bg-pitta/20 border-pitta text-pitta",
  kapha: "bg-kapha/20 border-kapha text-kapha",
  horarios: "bg-accent/20 border-accent text-accent-foreground",
  sommelier: "bg-primary/20 border-primary text-primary",
};

const inactiveStyles: Record<string, string> = {
  vata: "border-transparent text-muted-foreground hover:text-vata",
  pitta: "border-transparent text-muted-foreground hover:text-pitta",
  kapha: "border-transparent text-muted-foreground hover:text-kapha",
  horarios: "border-transparent text-muted-foreground hover:text-accent-foreground",
  sommelier: "border-transparent text-muted-foreground hover:text-primary",
};

const DoshaSelector = () => {
  const location = useLocation();
  const path = location.pathname;
  const currentDosha = path === "/biblioteca"
    ? "sommelier"
    : path.startsWith("/biblioteca/horarios")
      ? "horarios"
      : path.startsWith("/biblioteca/")
        ? path.split("/")[2]
        : undefined;

  return (
    <div className="w-full px-2 sm:px-4 pt-4 pb-1">
      <div className="flex justify-center overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-1 sm:gap-2">
          {doshas.map((d) => {
            const isActive = currentDosha === d.key;
            const Icon = d.icon;
            return (
              <Link
                key={d.key}
                to={d.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-full border-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive ? activeStyles[d.key] : inactiveStyles[d.key]
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{d.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoshaSelector;
