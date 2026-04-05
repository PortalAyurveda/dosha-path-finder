import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Wind, Volume2, Utensils, Heart, ArrowDown, Flame, Stethoscope, Brain, CircleDot, Eye, Droplets, Bone, type LucideIcon } from "lucide-react";

interface CollapsibleSubdoshaCardProps {
  number: number;
  name: string;
  subtitle: string;
  adequate: string;
  disturbed: string;
}

const subdoshaIcons: Record<string, LucideIcon> = {
  "Prana": Wind,
  "Udana": Volume2,
  "Samana": Utensils,
  "Vyana": Heart,
  "Apana": ArrowDown,
  "Pachaka": Flame,
  "Ranjaka": Droplets,
  "Sadhaka": Brain,
  "Bhrajaka": CircleDot,
  "Alochaka": Eye,
  "Avalambaka": Stethoscope,
  "Bodhaka": Volume2,
  "Kledaka": Utensils,
  "Tarpaka": Brain,
  "Shleshaka": Bone,
};

function getIcon(name: string): LucideIcon {
  for (const key of Object.keys(subdoshaIcons)) {
    if (name.includes(key)) return subdoshaIcons[key];
  }
  return CircleDot;
}

function getDoshaColor(name: string): { bg: string; text: string; border: string } {
  if (name.includes("Vayu") || name.includes("Prana") || name.includes("Udana") || name.includes("Samana") || name.includes("Apana") || name.includes("Vyana")) {
    return { bg: "bg-vata/10", text: "text-vata", border: "border-vata/30" };
  }
  if (name.includes("Pitta") || name.includes("Pachaka") || name.includes("Ranjaka") || name.includes("Sadhaka") || name.includes("Alochaka") || name.includes("Bhrajaka")) {
    return { bg: "bg-pitta/10", text: "text-pitta", border: "border-pitta/30" };
  }
  if (name.includes("Kapha") || name.includes("Avalambaka") || name.includes("Bodhaka") || name.includes("Kledaka") || name.includes("Tarpaka") || name.includes("Shleshaka")) {
    return { bg: "bg-kapha/10", text: "text-kapha", border: "border-kapha/30" };
  }
  return { bg: "bg-secondary/10", text: "text-secondary", border: "border-border" };
}

const CollapsibleSubdoshaCard = ({ number, name, subtitle, adequate, disturbed }: CollapsibleSubdoshaCardProps) => {
  const [open, setOpen] = useState(false);
  const Icon = getIcon(name);
  const colors = getDoshaColor(name);

  return (
    <div className={`border ${colors.border} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${colors.bg} hover:opacity-80 transition-opacity text-left`}
      >
        <div className={`${colors.bg} rounded-lg p-1.5`}>
          <Icon className={`h-4 w-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-bold ${colors.text}`}>
            {number}. {name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>
        </div>
        <ChevronDown className={`h-4 w-4 ${colors.text} shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 bg-card">
          <div className="bg-kapha/10 border border-kapha/30 rounded-lg p-3">
            <p className="text-xs font-bold text-kapha mb-0.5">✅ Funcionamento Adequado</p>
            <p className="text-sm text-foreground">{adequate}</p>
          </div>
          <div className="bg-pitta/10 border border-pitta/30 rounded-lg p-3">
            <p className="text-xs font-bold text-pitta mb-0.5">❌ Distúrbio / Adoecido</p>
            <p className="text-sm text-foreground">{disturbed}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSubdoshaCard;
