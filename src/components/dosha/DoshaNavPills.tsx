import { useNavigate } from "react-router-dom";
import { Clock, UtensilsCrossed, Pill, Bird, Home } from "lucide-react";

export type DoshaTab = "principal" | "horarios" | "alimentacao" | "avancado";

interface DoshaNavPillsProps {
  dosha: "vata" | "pitta" | "kapha";
  activeTab: DoshaTab;
  onTabChange: (tab: DoshaTab) => void;
}

const doshaColors = {
  vata: {
    inactive: "border-vata/40 bg-vata/10 text-vata hover:bg-vata/20",
    active: "border-vata bg-vata text-white shadow-md shadow-vata/30",
  },
  pitta: {
    inactive: "border-pitta/40 bg-pitta/10 text-pitta hover:bg-pitta/20",
    active: "border-pitta bg-pitta text-white shadow-md shadow-pitta/30",
  },
  kapha: {
    inactive: "border-kapha/40 bg-kapha/10 text-kapha hover:bg-kapha/20",
    active: "border-kapha bg-kapha text-white shadow-md shadow-kapha/30",
  },
};

const doshaAdvancedRoutes = {
  vata: "/biblioteca/vata/adoecimento",
  pitta: "/biblioteca/pitta/adoecimento",
  kapha: "/biblioteca/kapha/adoecimento",
};

const doshaMainRoutes = {
  vata: "/biblioteca/vata",
  pitta: "/biblioteca/pitta",
  kapha: "/biblioteca/kapha",
};

const pills = [
  { id: "principal" as DoshaTab, label: "Principal", icon: Home },
  { id: "horarios" as DoshaTab, label: "Horários", icon: Clock },
  { id: "alimentacao" as DoshaTab, label: "Alimentação", icon: UtensilsCrossed },
  { id: "remedios" as const, label: "Remédios", icon: Pill },
  { id: "avancado" as DoshaTab, label: "Avançado", icon: Bird },
];

const DoshaNavPills = ({ dosha, activeTab, onTabChange }: DoshaNavPillsProps) => {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    if (id === "principal") {
      onTabChange("principal");
      navigate(doshaMainRoutes[dosha], { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "horarios") {
      onTabChange("horarios");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "alimentacao") {
      onTabChange("alimentacao");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "avancado") {
      onTabChange("avancado");
      navigate(doshaAdvancedRoutes[dosha], { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "remedios") {
      if (activeTab !== "principal") {
        onTabChange("principal");
        navigate(doshaMainRoutes[dosha], { replace: true });
        setTimeout(() => {
          const el = document.getElementById("remedios");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        const el = document.getElementById("remedios");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const colors = doshaColors[dosha];

  return (
    <div className="mt-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 w-max mx-auto">
        {pills.map((p) => {
          const Icon = p.icon;
          const isActive = p.id === activeTab;
          const isScroll = p.id === "remedios";
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full border font-semibold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                isActive && !isScroll ? colors.active : colors.inactive
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoshaNavPills;
