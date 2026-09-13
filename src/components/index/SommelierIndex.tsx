import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchAll } from "@/components/GlobalSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTransformedImageUrl } from "@/lib/imageTransform";

type Categoria = "todos" | "aulas" | "lives" | "receitas" | "artigos";
type SearchData = Awaited<ReturnType<typeof searchAll>>;
type Resultado = SearchData["videos"][number];

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "aulas", label: "Aulas" },
  { value: "lives", label: "Lives" },
  { value: "receitas", label: "Receitas" },
  { value: "artigos", label: "Artigos" },
];

const SommelierIndex = () => {
  const [termo, setTermo] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("todos");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(termo.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [termo]);

  const { data } = useQuery({
    queryKey: ["sommelier-index", debounced],
    queryFn: () => searchAll(debounced, 6),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const resultados = useMemo(() => {
    if (!data || debounced.length < 2) return [];

    const comTipo = (items: Resultado[], tipo: string) => items.map((item) => ({ item, tipo }));
    if (categoria === "receitas") return comTipo(data.receitas, "Receita");
    if (categoria === "artigos") return comTipo(data.artigos, "Artigo");
    if (categoria === "aulas") return comTipo(data.videos, "Aula");
    if (categoria === "lives") return comTipo(data.videos, "Live");

    return [
      ...comTipo(data.videos, "Aula / live"),
      ...comTipo(data.receitas, "Receita"),
      ...comTipo(data.artigos, "Artigo"),
    ];
  }, [categoria, data, debounced]);

  return (
    <section className="bg-surface-sun">
      <div className="mx-auto max-w-[660px] px-4 py-8 md:py-10">
        <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary text-center">
          Sommelier do Portal
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          Encontre o conteúdo certo para o seu momento: aulas, lives, receitas e artigos.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Categorias de conteúdo">
          {CATEGORIAS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCategoria(item.value)}
              className={`h-7 rounded-full px-3 text-xs font-semibold ${
                categoria === item.value
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            placeholder="Busque por sintoma, dosha, alimento ou tema"
            className="h-11 rounded-full border-border bg-card pl-11 pr-4 text-sm"
          />
        </div>

        {resultados.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
            {resultados.map(({ item, tipo }) => (
              <Link
                key={`${tipo}-${item.id}`}
                to={item.rota}
                className="flex min-w-0 items-center gap-2.5 rounded-md border border-border bg-card p-2 transition-colors hover:bg-muted/40"
              >
                {item.imagem ? (
                  <img
                    src={getTransformedImageUrl(item.imagem, 96)}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 shrink-0 rounded-md object-cover bg-muted"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-md bg-muted" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground">{tipo}</span>
                  <span className="block font-serif text-[13px] font-bold leading-tight text-primary line-clamp-2">
                    {item.titulo || "Sem título"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SommelierIndex;