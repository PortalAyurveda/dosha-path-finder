import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import TerapeutaCard from "@/components/terapeutas/TerapeutaCard";
import TerapeutaCardSkeleton from "@/components/terapeutas/TerapeutaCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TerapeutasDoBrasil = () => {
  const [search, setSearch] = useState("");
  const [locationMode, setLocationMode] = useState(false);
  const [sortBy, setSortBy] = useState("recentes");

  const { data: terapeutas, isLoading } = useQuery({
    queryKey: ["terapeutas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .eq("status", "aprovado")
        .order("created date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!terapeutas) return [];
    const q = search.toLowerCase().trim();

    let results = terapeutas.filter((t) => {
      if (!q) return true;
      if (locationMode) {
        return (
          t.cidade?.toLowerCase().includes(q) ||
          t.estado?.toLowerCase().includes(q)
        );
      }
      return (
        t.nome?.toLowerCase().includes(q) ||
        t.especialidade?.toLowerCase().includes(q)
      );
    });

    if (sortBy === "experientes") {
      results = [...results].sort(
        (a, b) => (a.formado_desde ?? 9999) - (b.formado_desde ?? 9999)
      );
    } else if (sortBy === "novos") {
      results = [...results].sort(
        (a, b) => (b.formado_desde ?? 0) - (a.formado_desde ?? 0)
      );
    }

    return results;
  }, [terapeutas, search, locationMode, sortBy]);

  return (
    <PageContainer
      title="Terapeutas do Brasil"
      description="Encontre terapeutas ayurvédicos qualificados no Brasil. Diretório completo com perfis, especialidades e contatos."
    >
      <SectionTitle
        as="h1"
        subtitle="Encontre terapeutas ayurvédicos qualificados perto de você"
      >
        🌿 Terapeutas do Brasil
      </SectionTitle>

      {/* Search & Filters */}
      <div className="mb-8 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                locationMode
                  ? "Digite a cidade ou estado..."
                  : "Buscar por nome ou especialidade..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={locationMode ? "default" : "outline"}
            onClick={() => {
              setLocationMode(!locationMode);
              setSearch("");
            }}
            className={`gap-1.5 shrink-0 ${
              locationMode
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Localização</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais Recentes</SelectItem>
              <SelectItem value="experientes">Mais Experientes</SelectItem>
              <SelectItem value="novos">Novos Talentos</SelectItem>
            </SelectContent>
          </Select>
          {search && (
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} resultado{filtered.length !== 1 && "s"}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TerapeutaCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            Nenhum terapeuta encontrado com esses filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <TerapeutaCard
              key={t.id}
              nome={t.nome ?? "Terapeuta"}
              cidade={t.cidade}
              estado={t.estado}
              especialidade={t.especialidade}
              resumo={t.resumo}
              imagem={t.imagem}
              slug={t["terapeutas(dinamica)"]}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default TerapeutasDoBrasil;
