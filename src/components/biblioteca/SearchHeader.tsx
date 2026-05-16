import { Search, Star, UtensilsCrossed, Radio, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export type VideoCategory = "selecao" | "receitas" | "lives";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAdvanced: boolean;
  onAdvancedChange: (value: boolean) => void;
  category: VideoCategory;
  onCategoryChange: (category: VideoCategory) => void;
}

const categories: { key: VideoCategory; label: string; icon: React.ReactNode; premium?: boolean }[] = [
  { key: "selecao", label: "Seleção", icon: <Star className="h-4 w-4" /> },
  { key: "lives", label: "Lives do Almoço", icon: <Radio className="h-4 w-4" /> },
  { key: "receitas", label: "Receitas", icon: <UtensilsCrossed className="h-4 w-4" />, premium: true },
];

const SearchHeader = ({ searchTerm, onSearchChange, isAdvanced, onAdvancedChange, category, onCategoryChange }: SearchHeaderProps) => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const isPremium = profile?.is_premium === true;

  const handlePremiumGate = () => {
    navigate("/assinar");
  };

  return (
    <div className="bg-surface-sun rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-8 md:p-12 mb-8 md:mb-12 text-center">
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
        Sommelier de Vídeos
      </h1>
      <p className="text-muted-foreground font-sans text-base md:text-lg mb-6 max-w-2xl mx-auto">
        Encontre o vídeo certo para o seu momento. Busque por sintomas, doshas, alimentos ou assuntos.
      </p>

      {/* Category buttons */}
      {!isAdvanced && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {categories.map((cat) => {
            const locked = cat.premium && !isPremium;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  if (locked) return handlePremiumGate(cat.label);
                  onCategoryChange(cat.key);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm text-sm font-medium transition-all border ${
                  category === cat.key
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : locked
                    ? "bg-background text-muted-foreground/70 border-border hover:border-primary/40"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat.icon}
                {cat.label}
                {locked && <Lock className="h-3 w-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative max-w-xl mx-auto mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={isAdvanced ? "Busca avançada em todas as categorias..." : "Busque por título do vídeo..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 md:h-14 text-base md:text-lg rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-primary/20 focus-visible:ring-secondary bg-background"
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Switch
          id="advanced-search"
          checked={isAdvanced}
          disabled={!isPremium}
          onCheckedChange={(v) => {
            if (!isPremium) return handlePremiumGate("Busca Avançada");
            onAdvancedChange(v);
          }}
        />
        <Label
          htmlFor="advanced-search"
          className="text-sm font-sans text-muted-foreground cursor-pointer flex items-center gap-1.5"
          onClick={(e) => {
            if (!isPremium) {
              e.preventDefault();
              handlePremiumGate("Busca Avançada");
            }
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Busca Avançada (em todas as categorias)
          {!isPremium && <Lock className="h-3 w-3 ml-0.5" />}
        </Label>
      </div>
    </div>
  );
};

export default SearchHeader;
