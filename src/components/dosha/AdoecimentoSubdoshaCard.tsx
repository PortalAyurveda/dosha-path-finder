import { Wind, Volume2, Utensils, Heart, ArrowDown, Flame, Droplets, Brain, Eye, CircleDot, Stethoscope, Bone, type LucideIcon } from "lucide-react";

interface MixEffect {
  emoji: string;
  label: string;
  text: string;
}

interface AdoecimentoSubdoshaCardProps {
  number: number;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  mixEffects: MixEffect[];
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
  "Alochaka": Eye,
  "Bhrajaka": CircleDot,
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

function getDoshaColor(name: string): { bg: string; text: string } {
  if (name.includes("Vayu") || name.includes("Prana Vayu") || name.includes("Udana") || name.includes("Samana Vayu") || name.includes("Apana") || name.includes("Vyana")) {
    return { bg: "bg-vata/15", text: "text-vata" };
  }
  if (name.includes("Pitta") || name.includes("Pachaka") || name.includes("Ranjaka") || name.includes("Sadhaka") || name.includes("Alochaka") || name.includes("Bhrajaka")) {
    return { bg: "bg-pitta/15", text: "text-pitta" };
  }
  if (name.includes("Kapha") || name.includes("Avalambaka") || name.includes("Bodhaka") || name.includes("Kledaka") || name.includes("Tarpaka") || name.includes("Shleshaka")) {
    return { bg: "bg-kapha/15", text: "text-kapha" };
  }
  return { bg: "bg-secondary/10", text: "text-secondary" };
}

const mixColors = {
  "🌪️": { bg: "bg-vata/10", border: "border-vata/30", label: "text-vata" },
  "🔥": { bg: "bg-pitta/10", border: "border-pitta/30", label: "text-pitta" },
  "⛰️": { bg: "bg-kapha/10", border: "border-kapha/30", label: "text-kapha" },
};

const AdoecimentoSubdoshaCard = ({ number, name, subtitle, tagline, description, mixEffects }: AdoecimentoSubdoshaCardProps) => {
  const Icon = getIcon(name);
  const colors = getDoshaColor(name);

  return (
    <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`${colors.bg} rounded-xl p-2.5`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div>
          <h4 className={`text-lg font-bold ${colors.text}`}>
            {number}. {name}
          </h4>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{subtitle}</p>
        </div>
      </div>

      {tagline && (
        <p className="text-sm font-semibold text-primary italic">{tagline}</p>
      )}

      <p className="text-sm text-foreground leading-relaxed">{description}</p>

      <div className="space-y-3 pt-2">
        {mixEffects.map((effect, i) => {
          const mc = mixColors[effect.emoji as keyof typeof mixColors] || { bg: "bg-muted/50", border: "border-border", label: "text-foreground" };
          return (
            <div key={i} className={`${mc.bg} border ${mc.border} rounded-xl p-4`}>
              <p className={`text-sm font-bold ${mc.label} mb-1`}>
                {effect.emoji} {effect.label}
              </p>
              <p className="text-sm text-foreground">{effect.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdoecimentoSubdoshaCard;
