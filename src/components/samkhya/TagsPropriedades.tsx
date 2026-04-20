import {
  Sparkles, Flame, Droplet, Wind, Leaf, Heart,
  Shield, Flower, Zap, Moon, Coffee, CakeSlice,
  Milk, Brain, Flower2, Activity,
  type LucideIcon,
} from "lucide-react";

interface TagConfig {
  icon: LucideIcon;
  iconColor: string;
  textColor: string;
  bg: string;
}

const tagConfig: Record<string, TagConfig> = {
  "Gold": { icon: Flower, iconColor: "#d4a574", textColor: "#8B6914", bg: "#fef6e8" },
  "Rejuvenescedor": { icon: Sparkles, iconColor: "#9b6b8a", textColor: "#7b4963", bg: "#f3eaf0" },
  "Imunidade": { icon: Shield, iconColor: "#6b9d95", textColor: "#7b4963", bg: "#f3eaf0" },
  "Memória": { icon: Brain, iconColor: "#d4a864", textColor: "#7b4963", bg: "#f3eaf0" },
  "Desjejum": { icon: Coffee, iconColor: "#c98572", textColor: "#C8922A", bg: "#fef6e8" },
  "Anti Vata": { icon: Wind, iconColor: "#7ba89a", textColor: "#1A7366", bg: "#e8f4f2" },
  "Anti Pitta": { icon: Droplet, iconColor: "#6b9db0", textColor: "#1A7366", bg: "#e8f4f2" },
  "Anti Kapha": { icon: Leaf, iconColor: "#8b9d7a", textColor: "#1A7366", bg: "#e8f4f2" },
  "Termogênico": { icon: Flame, iconColor: "#d89a6a", textColor: "#C8922A", bg: "#fef6e8" },
  "Tônico Agni": { icon: Flame, iconColor: "#e8956f", textColor: "#C8922A", bg: "#fef6e8" },
  "Purificador": { icon: Droplet, iconColor: "#7ab3c4", textColor: "#1A7366", bg: "#e8f4f2" },
  "Calmante": { icon: Leaf, iconColor: "#87b39d", textColor: "#1A7366", bg: "#e8f4f2" },
  "Refrescante": { icon: Droplet, iconColor: "#8fc4d4", textColor: "#1A7366", bg: "#e8f4f2" },
  "Anti Estresse": { icon: Heart, iconColor: "#c98a9e", textColor: "#7b4963", bg: "#f3eaf0" },
  "Emagrecedor": { icon: Activity, iconColor: "#db8f5f", textColor: "#C8922A", bg: "#fef6e8" },
  "Estimulante": { icon: Zap, iconColor: "#d4b364", textColor: "#C8922A", bg: "#fef6e8" },
  "Anti Gases": { icon: Wind, iconColor: "#9dab9a", textColor: "#1A7366", bg: "#e8f4f2" },
  "Digestivo": { icon: Flame, iconColor: "#c97860", textColor: "#C8922A", bg: "#fef6e8" },
  "Antídoto Doce": { icon: CakeSlice, iconColor: "#d6a3a3", textColor: "#C8922A", bg: "#fef6e8" },
  "Antídoto Café": { icon: Coffee, iconColor: "#a8826f", textColor: "#C8922A", bg: "#fef6e8" },
  "Antídoto Bolos": { icon: CakeSlice, iconColor: "#d4b3a3", textColor: "#C8922A", bg: "#fef6e8" },
  "Antídoto Leite": { icon: Milk, iconColor: "#d4c4a8", textColor: "#C8922A", bg: "#fef6e8" },
  "Detox": { icon: Droplet, iconColor: "#a3c49a", textColor: "#1A7366", bg: "#e8f4f2" },
  "Pele": { icon: Flower2, iconColor: "#d6b3c4", textColor: "#7b4963", bg: "#f3eaf0" },
  "TPM": { icon: Heart, iconColor: "#d69a9a", textColor: "#7b4963", bg: "#f3eaf0" },
  "Restaurador": { icon: Sparkles, iconColor: "#a889b3", textColor: "#7b4963", bg: "#f3eaf0" },
  "Foco": { icon: Brain, iconColor: "#8a9db0", textColor: "#1A7366", bg: "#e8f4f2" },
  "Sono": { icon: Moon, iconColor: "#b3a3c4", textColor: "#7b4963", bg: "#f3eaf0" },
  "Antianemia": { icon: Heart, iconColor: "#c47878", textColor: "#7b4963", bg: "#f3eaf0" },
  "Anti-melancolia": { icon: Sparkles, iconColor: "#d4b38f", textColor: "#C8922A", bg: "#fef6e8" },
  "Capilar": { icon: Flower2, iconColor: "#9db38f", textColor: "#1A7366", bg: "#e8f4f2" },
  "Anti-idade": { icon: Sparkles, iconColor: "#c4b3c4", textColor: "#7b4963", bg: "#f3eaf0" },
  "Laxante": { icon: Droplet, iconColor: "#8fa88f", textColor: "#1A7366", bg: "#e8f4f2" },
};

interface TagsPropriedadesProps {
  tags: string[] | null | undefined;
  max?: number;
}

const TagsPropriedades = ({ tags, max = 5 }: TagsPropriedadesProps) => {
  if (!tags || tags.length === 0) return null;
  const visible = tags.slice(0, max);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {visible.map((tag, index) => {
        const config = tagConfig[tag];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div
            key={`${tag}-${index}`}
            className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg min-w-[70px]"
            style={{ backgroundColor: config.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
            <span
              className="text-xs font-medium text-center leading-tight"
              style={{ color: config.textColor }}
            >
              {tag}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TagsPropriedades;
