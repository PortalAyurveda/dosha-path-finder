import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchHeader = ({ searchTerm, onSearchChange }: SearchHeaderProps) => {
  return (
    <div className="bg-surface-sun rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-8 md:p-12 mb-8 md:mb-12 text-center">
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
        Sommelier Ayurveda
      </h1>
      <p className="text-muted-foreground font-sans text-base md:text-lg mb-6 max-w-2xl mx-auto">
        Encontre o vídeo certo para o seu momento. Busque por sintomas, doshas, alimentos ou assuntos.
      </p>
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Busque por sintomas, doshas, alimentos ou assuntos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 md:h-14 text-base md:text-lg rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-primary/20 focus-visible:ring-secondary bg-background"
        />
      </div>
    </div>
  );
};

export default SearchHeader;
