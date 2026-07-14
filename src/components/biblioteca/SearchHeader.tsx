import { Search, Star, UtensilsCrossed, Radio, LayoutGrid, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export type VideoCategory = "todos" | "aulas" | "lives" | "receitas" | "artigos";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: VideoCategory;
  onCategoryChange: (category: VideoCategory) => void;
  counts?: Partial<Record<VideoCategory, number>>;
}

const categories: { key: VideoCategory; label: string; icon: React.ReactNode }[] = [
  { key: "todos", label: "Todos", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "aulas", label: "Aulas", icon: <Star className="h-4 w-4" /> },
  { key: "lives", label: "Lives", icon: <Radio className="h-4 w-4" /> },
  { key: "receitas", label: "Receitas", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { key: "artigos", label: "Artigos", icon: <FileText className="h-4 w-4" /> },
];

const SearchHeader = ({ searchTerm, onSearchChange, category, onCategoryChange, counts }: SearchHeaderProps) => {
  return (
    <div className="bg-surface-sun rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-8 md:p-12 mb-8 md:mb-12 text-center">
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
        Sommelier de Vídeos
      </h1>
      <p className="text-muted-foreground font-sans text-base md:text-lg mb-6 max-w-2xl mx-auto">
        Encontre o vídeo certo para o seu momento. Busque por sintomas, doshas, alimentos ou assuntos.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
        {categories.map((cat) => {
          const count = counts?.[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm text-sm font-medium transition-all border ${
                category === cat.key
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.icon}
              {cat.label}
              {typeof count === "number" && (
                <span className="text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Busque por título ou tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 md:h-14 text-base md:text-lg rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-primary/20 focus-visible:ring-secondary bg-background"
        />
      </div>
    </div>
  );
};

export default SearchHeader;
