import { Wind, Volume2, Utensils, Heart, ArrowDown, CircleDot, type LucideIcon } from "lucide-react";

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
};

function getIcon(name: string): LucideIcon {
  for (const key of Object.keys(subdoshaIcons)) {
    if (name.includes(key)) return subdoshaIcons[key];
  }
  return CircleDot;
}

const mixColors = {
  "🌪️": { bg: "bg-vata/10", border: "border-vata/30", label: "text-vata" },
  "🔥": { bg: "bg-pitta/10", border: "border-pitta/30", label: "text-pitta" },
  "⛰️": { bg: "bg-kapha/10", border: "border-kapha/30", label: "text-kapha" },
};

const AdoecimentoSubdoshaCard = ({ number, name, subtitle, tagline, description, mixEffects }: AdoecimentoSubdoshaCardProps) => {
  const Icon = getIcon(name);

  return (
    <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-vata/15 rounded-xl p-2.5">
          <Icon className="h-5 w-5 text-vata" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-vata">
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
          const colors = mixColors[effect.emoji as keyof typeof mixColors] || { bg: "bg-muted/50", border: "border-border", label: "text-foreground" };
          return (
            <div key={i} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
              <p className={`text-sm font-bold ${colors.label} mb-1`}>
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
