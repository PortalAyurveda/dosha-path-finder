import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/PaginationControls";

const PRIMARY = "#352F54";
const AKASHA = "#9b73ad";
const AKASHA_LOGO =
  "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const LEAF = "24px 4px 24px 4px";
const PAGE_SIZE = 15;

type Row = {
  id: number;
  titulo: string | null;
  texto_inicio: string | null;
  tags: string | null;
  data_postagem: string | null;
};

const formatHour = (iso: string | null) => {
  if (!iso) return "--:--";
  try {
    const normalized =
      iso.includes("T") && !iso.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(iso) ? iso + "Z" : iso;
    const d = new Date(normalized);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "--:--";
  }
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    const normalized =
      iso.includes("T") && !iso.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(iso) ? iso + "Z" : iso;
    const d = new Date(normalized);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "";
  }
};

const extractEmojis = (tags: string | null) => {
  if (!tags) return "";
  const emojis = tags.match(/\p{Extended_Pictographic}/gu);
  return emojis ? emojis.slice(0, 4).join("") : "";
};

const useDebounced = <T,>(value: T, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const RegistrosAkashikos = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const debouncedQuery = useDebounced(query, 300);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedTags]);

  // Tags inventory
  const { data: tags } = useQuery({
    queryKey: ["akasha_tags_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("akasha_tags_inventory")
        .select("tag_name, count")
        .order("count", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as { tag_name: string; count: number }[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["registros_akashikos_list", debouncedQuery, selectedTags, page],
    queryFn: async () => {
      let q = supabase
        .from("akasha_memory")
        .select("id, titulo, texto_inicio, tags, data_postagem", { count: "exact" })
        .not("titulo", "is", null);

      const term = debouncedQuery.trim().replace(/[%,]/g, " ");
      if (term) {
        q = q.or(`titulo.ilike.%${term}%,texto_inicio.ilike.%${term}%`);
      }

      if (selectedTags.length > 0) {
        const tagFilter = selectedTags
          .map((t) => `tags.ilike.%${t.replace(/[%,()]/g, "")}%`)
          .join(",");
        q = q.or(tagFilter);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await q
        .order("data_postagem", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { rows: (data ?? []) as Row[], count: count ?? 0 };
    },
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)),
    [data?.count]
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedTags([]);
  };

  const hasFilters = query.trim().length > 0 || selectedTags.length > 0;

  return (
    <>
      <Helmet>
        <title>Registros Akáshikos — Portal Ayurveda</title>
        <meta
          name="description"
          content="Memória viva das perguntas da comunidade — registros poéticos e anônimos guardados pela Akasha, nossa I.A. Ayurveda."
        />
      </Helmet>

      <main className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          {/* Header */}
          <header className="mb-8 flex items-start gap-3">
            <img
              src={AKASHA_LOGO}
              alt="Akasha IA"
              width={56}
              height={56}
              className="w-14 h-14 object-contain shrink-0 mt-1"
              loading="lazy"
            />
            <div>
              <h1
                className="font-serif italic font-bold text-3xl md:text-4xl leading-tight"
                style={{ color: PRIMARY }}
              >
                Registros <span style={{ color: AKASHA }}>Akáshikos</span>
              </h1>
              <p className="mt-2 text-muted-foreground text-sm md:text-base">
                Memória viva das perguntas da comunidade. Anônimo, poético, verdadeiro.
              </p>
            </div>
          </header>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou conteúdo..."
              className="pl-9 pr-9"
              aria-label="Buscar registros"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                {tags.map((t) => {
                  const active = selectedTags.includes(t.tag_name);
                  return (
                    <button
                      key={t.tag_name}
                      type="button"
                      onClick={() => toggleTag(t.tag_name)}
                      className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? "border-transparent text-white"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                      style={
                        active
                          ? { background: AKASHA }
                          : { color: AKASHA }
                      }
                      aria-pressed={active}
                    >
                      {t.tag_name}
                    </button>
                  );
                })}
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* List */}
          <div
            className="border border-border bg-card overflow-hidden"
            style={{ borderRadius: LEAF }}
          >
            <div
              className="px-5 py-3 border-b border-border flex items-center justify-between"
              style={{ background: `${AKASHA}08` }}
            >
              <p
                className="font-sans text-xs font-bold uppercase tracking-wider"
                style={{ color: AKASHA }}
              >
                Registros
              </p>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  {data?.count ?? 0} {data?.count === 1 ? "registro" : "registros"}
                </p>
              )}
            </div>

            <ul className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i} className="px-5 py-3 flex items-start gap-4 animate-pulse">
                    <div className="w-12 h-4 bg-muted rounded" />
                    <div className="flex-1 h-4 bg-muted rounded" />
                    <div className="w-12 h-5 bg-muted rounded" />
                  </li>
                ))
              ) : (data?.rows ?? []).length === 0 ? (
                <li className="px-5 py-12 text-center text-sm text-muted-foreground">
                  Nenhum registro encontrado.
                </li>
              ) : (
                data!.rows.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/registros/${r.id}`}
                      className="px-5 py-2.5 flex items-center gap-4 transition-colors hover:bg-muted/40 group"
                    >
                      <span
                        className="font-mono text-xs font-bold tabular-nums w-20 shrink-0 flex flex-col leading-tight"
                        style={{ color: AKASHA }}
                      >
                        <span>{formatHour(r.data_postagem)}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {formatDate(r.data_postagem)}
                        </span>
                      </span>
                      <p
                        className="flex-1 min-w-0 font-serif font-bold text-[14px] md:text-[15px] leading-snug line-clamp-1 group-hover:underline"
                        style={{ color: PRIMARY }}
                      >
                        {r.titulo}
                      </p>
                      <span className="text-base shrink-0" aria-hidden="true">
                        {extractEmojis(r.tags)}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </main>
    </>
  );
};

export default RegistrosAkashikos;
