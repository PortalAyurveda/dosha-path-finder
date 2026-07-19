import {
  Apple,
  BookOpen,
  Brain,
  ChefHat,
  Coffee,
  CupSoda,
  Droplets,
  Eye,
  FlaskConical,
  GlassWater,
  Hand,
  Leaf,
  Moon,
  Soup,
  Sun,
  UtensilsCrossed,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Mapa explícito dos ícones usados dinamicamente (vindos do banco).
// Manter enxuto pra que o Vite tree-shake o resto do lucide-react.
export const iconesLucide: Record<string, LucideIcon> = {
  Apple,
  BookOpen,
  Brain,
  ChefHat,
  Coffee,
  CupSoda,
  Droplets,
  Eye,
  FlaskConical,
  GlassWater,
  Hand,
  Leaf,
  Moon,
  Soup,
  Sun,
  UtensilsCrossed,
  Wind,
  Zap,
};

export function getIconeLucide(name?: string | null): LucideIcon {
  if (!name) return Leaf;
  return iconesLucide[name] ?? Leaf;
}
