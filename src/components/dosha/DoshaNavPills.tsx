import { useNavigate } from "react-router-dom";
import { Clock, UtensilsCrossed, Pill, Bird, Home } from "lucide-react";

interface DoshaNavPillsProps {
  dosha: "vata" | "pitta" | "kapha";
  activeTab: "principal" | "avancado";
  onTabChange: (tab: "principal" | "avancado") => void;
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

const scrollPills = [
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { id: "remedios", label: "Remédios", icon: Pill },
];

const doshaAdvancedRoutes = {
  vata: "/dosha/vata/adoecimento",
  pitta: "/dosha/pitta/adoecimento",
  kapha: "/dosha/kapha/adoecimento",
};

const doshaMainRoutes = {
  vata: "/dosha/vata",
  pitta: "/dosha/pitta",
  kapha: "/dosha/kapha",
};

const DoshaNavPills = ({ dosha, activeTab, onTabChange }: DoshaNavPillsProps) => {
  const navigate = useNavigate();

  const handleScrollPill = (id: string) => {
    if (id === "horarios") {
      navigate(`/horarios/${dosha}`);
      return;
    }
    if (activeTab !== "principal") {
      onTabChange("principal");
      navigate(doshaMainRoutes[dosha], { replace: true });
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrincipal = () => {
    onTabChange("principal");
    navigate(doshaMainRoutes[dosha], { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAvancado = () => {
    onTabChange("avancado");
    navigate(doshaAdvancedRoutes[dosha], { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const colors = doshaColors[dosha];
  const isPrincipal = activeTab === "principal";
  const isAvancado = activeTab === "avancado";

  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-8">
      <button
        onClick={handlePrincipal}
        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm transition-all ${isPrincipal ? colors.active : colors.inactive}`}
      >
        <Home className="h-4 w-4" />
        Principal
      </button>
      {scrollPills.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            onClick={() => handleScrollPill(p.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm transition-all ${colors.inactive}`}
          >
            <Icon className="h-4 w-4" />
            {p.label}
          </button>
        );
      })}
      <button
        onClick={handleAvancado}
        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border font-semibold text-sm transition-all ${isAvancado ? colors.active : colors.inactive}`}
      >
        <Bird className="h-4 w-4" />
        Avançado
      </button>
    </div>
  );
};

export default DoshaNavPills;
