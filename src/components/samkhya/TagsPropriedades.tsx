import {
  Sparkles, Flame, Droplet, Wind, Leaf, Heart,
  Shield, Beaker, ArrowUp, Zap,
  type LucideIcon,
} from "lucide-react";

interface TagConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const tagConfig: Record<string, TagConfig> = {
  // Roxo
  "Rasayana": { icon: Sparkles, color: "#7b4963", bg: "#f3eaf0" },
  "Gold": { icon: Beaker, color: "#8B6914", bg: "#fef6e8" },
  "Tonificante": { icon: Heart, color: "#7b4963", bg: "#f3eaf0" },
  "Imunidade": { icon: Shield, color: "#7b4963", bg: "#f3eaf0" },
  "Restaurador": { icon: Heart, color: "#7b4963", bg: "#f3eaf0" },
  "Memória": { icon: Zap, color: "#7b4963", bg: "#f3eaf0" },
  "Antianemia": { icon: Heart, color: "#7b4963", bg: "#f3eaf0" },
  "Anti-melancolia": { icon: Heart, color: "#7b4963", bg: "#f3eaf0" },

  // Verde
  "Anti Vata": { icon: Wind, color: "#1A7366", bg: "#e8f4f2" },
  "Anti Pitta": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Anti Kapha": { icon: Leaf, color: "#1A7366", bg: "#e8f4f2" },
  "Purificador": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Calmante": { icon: Leaf, color: "#1A7366", bg: "#e8f4f2" },
  "Refrescante": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Pele": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Capilar": { icon: Leaf, color: "#1A7366", bg: "#e8f4f2" },
  "Anti-idade": { icon: Sparkles, color: "#1A7366", bg: "#e8f4f2" },
  "Foco": { icon: Zap, color: "#1A7366", bg: "#e8f4f2" },
  "Detox": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "TPM": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Anti-inflamatório": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },
  "Anti Estresse": { icon: Leaf, color: "#1A7366", bg: "#e8f4f2" },
  "Laxante": { icon: Droplet, color: "#1A7366", bg: "#e8f4f2" },

  // Ouro
  "Tônico Agni": { icon: Flame, color: "#C8922A", bg: "#fef6e8" },
  "Digestivo": { icon: Flame, color: "#C8922A", bg: "#fef6e8" },
  "Termogênico": { icon: Flame, color: "#C8922A", bg: "#fef6e8" },
  "Estimulante": { icon: Zap, color: "#C8922A", bg: "#fef6e8" },
  "Emagrecedor": { icon: Flame, color: "#C8922A", bg: "#fef6e8" },
  "Aquecedor": { icon: Flame, color: "#C8922A", bg: "#fef6e8" },
  "Regulador": { icon: ArrowUp, color: "#C8922A", bg: "#fef6e8" },
  "Antídoto Doce": { icon: Sparkles, color: "#C8922A", bg: "#fef6e8" },
};

interface TagsPropriedadesProps {
  tags: string[] | null | undefined;
  max?: number;
}

const TagsPropriedades = ({ tags, max = 5 }: TagsPropriedadesProps) => {
  if (!tags || tags.length === 0) return null;
  const visible = tags.slice(0, max);

  return (
    <div className="flex flex-wrap gap-3">
      {visible.map((tag, index) => {
        const config = tagConfig[tag];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div
            key={`${tag}-${index}`}
            className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg min-w-[70px]"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium text-center leading-tight">{tag}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TagsPropriedades;
