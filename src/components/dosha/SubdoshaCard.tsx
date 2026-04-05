import { Wind, Volume2, Utensils, Heart, ArrowDown, Flame, Stethoscope, Brain, CircleDot, Eye, Droplets, Bone, type LucideIcon } from "lucide-react";

interface SubdoshaCardProps {
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

function getSubdoshaIcon(name: string): LucideIcon {
  for (const key of Object.keys(subdoshaIcons)) {
    if (name.includes(key)) return subdoshaIcons[key];
  }
  return CircleDot;
}

const SubdoshaCard = ({ number, name, subtitle, adequate, disturbed }: SubdoshaCardProps) => {
  const Icon = getSubdoshaIcon(name);

  return (
    <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-secondary/10 rounded-xl p-2">
          <Icon className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-secondary">
            {number}. {name}
          </h4>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-kapha/10 border border-kapha/30 rounded-xl p-4">
          <p className="text-sm font-bold text-kapha mb-1">✅ Funcionamento Adequado</p>
          <p className="text-sm text-foreground">{adequate}</p>
        </div>
        <div className="bg-pitta/10 border border-pitta/30 rounded-xl p-4">
          <p className="text-sm font-bold text-pitta mb-1">❌ Distúrbio / Adoecido</p>
          <p className="text-sm text-foreground">{disturbed}</p>
        </div>
      </div>
    </div>
  );
};

export default SubdoshaCard;
