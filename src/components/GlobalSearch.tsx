import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, Video as VideoIcon, FileText, UtensilsCrossed, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransformedImageUrl } from "@/lib/imageTransform";

type Tipo = "video" | "receita" | "artigo" | "produto";

interface Resultado {
  tipo: Tipo;
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  imagem: string | null;
  rota: string;
  pontuacao: number | null;
}

export async function searchAll(termo: string, limitPer = 3) {
  const term = termo.trim();
  if (term.length < 2) return { produtos: [], receitas: [], videos: [], artigos: [] };

  const { data, error } = await (supabase.rpc as any)("busca_global", {
    p_termo: term,
    p_limite_por_tipo: limitPer,
  });
  if (error) {
    console.error("busca_global error:", error);
    return { produtos: [], receitas: [], videos: [], artigos: [] };
  }

  const rows = (data || []) as Resultado[];
  return {
    produtos: rows.filter((r) => r.tipo === "produto"),
    receitas: rows.filter((r) => r.tipo === "receita"),
    videos: rows.filter((r) => r.tipo === "video"),
    artigos: rows.filter((r) => r.tipo === "artigo"),
  };
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => searchAll(debounced, 3),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const close = () => {
    setOpen(false);
    setTerm("");
    setDebounced("");
  };

  const goAll = () => {
    if (!debounced) return;
    navigate(`/pesquisa?q=${encodeURIComponent(debounced)}`);
    close();
  };

  const askAkasha = () => {
    if (!debounced) return;
    navigate(`/akasha?pergunta=${encodeURIComponent(debounced)}`);
    close();
  };

  const totalResults =
    (data?.produtos.length || 0) +
    (data?.receitas.length || 0) +
    (data?.videos.length || 0) +
    (data?.artigos.length || 0);

  const goRota = (rota: string) => {
    close();
    navigate(rota);
  };

  return (
    <div ref={containerRef} className="relative w-9 h-9">
      {/* Ícone lupa — sempre no fluxo, tamanho fixo */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pesquisar"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm"
      >
        <Search className="h-[18px] w-[18px] text-primary" strokeWidth={2.2} />
      </button>

      {/* Overlay absoluto — não empurra o layout */}
      {open && (
        <div className="absolute right-0 top-0 z-50">
          <div className="flex items-center bg-white rounded-full h-9 pl-3 pr-1 shadow-lg w-[260px] sm:w-[320px]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goAll();
                if (e.key === "Escape") close();
              }}
              placeholder="Buscar..."
              className="border-0 shadow-none focus-visible:ring-0 h-7 px-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {debounced.length >= 2 && (
            <div className="absolute right-0 mt-2 w-[92vw] max-w-[420px] bg-background rounded-xl shadow-xl border border-border overflow-hidden">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto">
                  {totalResults === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Nenhum resultado encontrado para "{debounced}"
                    </div>
                  ) : (
                    <>
                      {data!.produtos.length > 0 && (
                        <Section title="Produtos" icon={<Package className="h-3.5 w-3.5" />}>
                          {data!.produtos.map((r) => (
                            <ResultItem key={`p-${r.id}`} r={r} onClick={() => goRota(r.rota)} />
                          ))}
                        </Section>
                      )}
                      {data!.receitas.length > 0 && (
                        <Section title="Receitas" icon={<UtensilsCrossed className="h-3.5 w-3.5" />}>
                          {data!.receitas.map((r) => (
                            <ResultItem key={`r-${r.id}`} r={r} onClick={() => goRota(r.rota)} />
                          ))}
                        </Section>
                      )}
                      {data!.videos.length > 0 && (
                        <Section title="Vídeos" icon={<VideoIcon className="h-3.5 w-3.5" />}>
                          {data!.videos.map((r) => (
                            <ResultItem key={`v-${r.id}`} r={r} onClick={() => goRota(r.rota)} />
                          ))}
                        </Section>
                      )}
                      {data!.artigos.length > 0 && (
                        <Section title="Artigos" icon={<FileText className="h-3.5 w-3.5" />}>
                          {data!.artigos.map((r) => (
                            <ResultItem key={`a-${r.id}`} r={r} onClick={() => goRota(r.rota)} />
                          ))}
                        </Section>
                      )}
                      {totalResults > 0 && (
                        <button
                          onClick={goAll}
                          className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-muted/50 border-t border-border"
                        >
                          Ver todos os resultados
                        </button>
                      )}
                    </>
                  )}

                  {/* Perguntar à Akasha — sempre presente */}
                  <button
                    onClick={askAkasha}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-akasha hover:bg-akasha/10 border-t border-border text-left"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      Perguntar à Akasha: <span className="italic">"{debounced}"</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="border-b border-border last:border-b-0">
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </div>
    <div>{children}</div>
  </div>
);

const ResultItem = ({ r, onClick }: { r: Resultado; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
  >
    {r.imagem ? (
      <img
        src={getTransformedImageUrl(r.imagem)}
        alt=""
        className="w-10 h-10 rounded-md object-cover shrink-0 bg-muted"
        loading="lazy"
      />
    ) : (
      <div className="w-10 h-10 rounded-md bg-muted shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground line-clamp-1">{r.titulo || "Sem título"}</p>
      {r.subtitulo && (
        <p className="text-xs text-muted-foreground line-clamp-1">{r.subtitulo}</p>
      )}
    </div>
  </button>
);

export default GlobalSearch;
