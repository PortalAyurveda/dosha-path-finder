import { getTransformedImageUrl } from "@/lib/imageTransform";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BLOG_TAGS } from "@/data/blogTags";
import HeartButton from "@/components/HeartButton";
import PaginationControls from "@/components/PaginationControls";

const ITEMS_PER_PAGE = 12;

interface ArtigosTabProps {
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  doshaprincipal: string | null;
  initialMode?: "geral" | "personalizado";
}

type SubTab = "geral" | "personalizado";

interface MatchedArticle {
  id: string;
  title: string;
  summary: string | null;
  link_do_artigo: string | null;
  meta_description: string | null;
  tags: string | null;
  image_url: string | null;
  matchedSymptom: string;
  matchedDosha: string;
}

function parseSymptoms(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

const MAX_PERSONALIZED = 12;

const ArtigosTab = ({ agravVataTags, agravPittaTags, agravKaphaTags, doshaprincipal, initialMode = "geral" }: ArtigosTabProps) => {
  const [subTab, setSubTab] = useState<SubTab>(initialMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["meudosha-artigos", debouncedSearch, isAdvanced],
    queryFn: async () => {
      let query = supabase
        .from("portal_conteudo")
        .select("id, title, summary, link_do_artigo, meta_description, tags, image_url, created_at")
        .order("created_at", { ascending: false });

      if (debouncedSearch) {
        if (isAdvanced) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,summary.ilike.%${debouncedSearch}%,tags.ilike.%${debouncedSearch}%,meta_description.ilike.%${debouncedSearch}%`
          );
        } else {
          query = query.ilike("title", `%${debouncedSearch}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const allSymptoms = useMemo(() => [
    ...parseSymptoms(agravVataTags).map((s) => ({ symptom: s, dosha: "Vata" })),
    ...parseSymptoms(agravPittaTags).map((s) => ({ symptom: s, dosha: "Pitta" })),
    ...parseSymptoms(agravKaphaTags).map((s) => ({ symptom: s, dosha: "Kapha" })),
  ], [agravVataTags, agravPittaTags, agravKaphaTags]);

  // Build personalized list with explanation labels (round-robin per symptom)
  const personalizedArticles = useMemo<MatchedArticle[]>(() => {
    if (allSymptoms.length === 0) return [];

    const matchesBySymptom = new Map<string, MatchedArticle[]>();
    const globalSeen = new Set<string>();

    for (const { symptom, dosha } of allSymptoms) {
      const normSymptom = normalizeForSearch(symptom);
      const words = normSymptom.split(/\s+/).filter((w) => w.length > 2);
      const key = `${symptom}|${dosha}`;
      const list: MatchedArticle[] = [];

      for (const a of articles) {
        const searchable = normalizeForSearch(`${a.title} ${a.tags || ""} ${a.meta_description || ""} ${a.summary || ""}`);
        if (words.some((w) => searchable.includes(w))) {
          list.push({ ...a, matchedSymptom: symptom, matchedDosha: dosha });
        }
      }
      matchesBySymptom.set(key, list);
    }

    // Round-robin
    const result: MatchedArticle[] = [];
    const keys = Array.from(matchesBySymptom.keys());
    const idxMap = new Map<string, number>(keys.map((k) => [k, 0]));

    while (result.length < MAX_PERSONALIZED) {
      let added = false;
      for (const key of keys) {
        if (result.length >= MAX_PERSONALIZED) break;
        const matches = matchesBySymptom.get(key)!;
        let idx = idxMap.get(key)!;
        while (idx < matches.length && globalSeen.has(matches[idx].id)) idx++;
        if (idx < matches.length) {
          globalSeen.add(matches[idx].id);
          result.push(matches[idx]);
          idxMap.set(key, idx + 1);
          added = true;
        }
      }
      if (!added) break;
    }
    return result;
  }, [articles, allSymptoms]);

  const filteredGeneralArticles = useMemo(() => {
    if (selectedTags.length === 0) return articles;
    return articles.filter((a) => {
      if (!a.tags) return false;
      return selectedTags.every((tag) => a.tags!.includes(tag));
    });
  }, [articles, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1 w-fit mx-auto">
        <button
          onClick={() => setSubTab("geral")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            subTab === "geral" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Gerais
        </button>
        <button
          onClick={() => setSubTab("personalizado")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
            subTab === "personalizado" ? "bg-akasha text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Personalizado
        </button>
      </div>

      {/* Search (only for geral) */}
      {subTab === "geral" && (
        <div className="space-y-2">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isAdvanced ? "Busca em conteúdo e tags..." : "Buscar por título..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Switch id="artigos-advanced" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
            <Label htmlFor="artigos-advanced" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Busca Avançada
            </Label>
          </div>

          {isAdvanced && (
            <div className="flex flex-wrap justify-center gap-1">
              {BLOG_TAGS.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 items-center">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className="cursor-pointer text-[10px]" onClick={() => toggleTag(tag)}>
                  {tag} <X className="h-2.5 w-2.5 ml-1" />
                </Badge>
              ))}
              <button onClick={() => setSelectedTags([])} className="text-[10px] text-muted-foreground hover:text-primary ml-1">
                Limpar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : subTab === "personalizado" ? (
        personalizedArticles.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
            <p className="text-muted-foreground">
              {allSymptoms.length === 0
                ? "Nenhum agravamento registrado para personalizar artigos."
                : "Não encontramos artigos específicos para seus agravamentos."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {personalizedArticles.map((article) => {
              const doshaColor =
                article.matchedDosha === "Vata" ? "text-vata" :
                article.matchedDosha === "Pitta" ? "text-pitta" : "text-kapha";

              return (
                <div key={article.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Context label */}
                  <div className="px-4 py-2 bg-akasha/10 border-b border-border flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-akasha shrink-0" />
                    <p className="text-xs text-foreground">
                      Como você relatou <strong className={doshaColor}>{article.matchedSymptom}</strong> e possui agravamento em <strong className={doshaColor}>{article.matchedDosha}</strong>, selecionamos este artigo:
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {article.image_url && (
                      <Link to={`/blog/${article.link_do_artigo || article.id}`} className="shrink-0">
                        <img
                          src={getTransformedImageUrl(article.image_url)}
                          alt={article.title}
                          className="w-full sm:w-48 aspect-video object-cover rounded-lg"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/blog/${article.link_do_artigo || article.id}`} className="flex-1">
                          <h3 className="font-serif text-base font-semibold text-primary line-clamp-2 hover:underline">
                            {article.title}
                          </h3>
                        </Link>
                        <HeartButton contentType="artigo" contentId={article.id} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.meta_description || article.summary || ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredGeneralArticles.length === 0 ? (
        <div className="text-center p-8 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredGeneralArticles.map((article) => (
            <div key={article.id} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all">
              <Link to={`/blog/${article.link_do_artigo || article.id}`}>
                {article.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getTransformedImageUrl(article.image_url)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
              </Link>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/blog/${article.link_do_artigo || article.id}`} className="flex-1">
                    <h3 className="font-serif text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  <HeartButton contentType="artigo" contentId={article.id} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {article.meta_description || ""}
                </p>
                {article.tags && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.split(",").slice(0, 3).map((tag) => (
                      <Badge key={tag.trim()} variant="secondary" className="text-[9px] bg-muted text-muted-foreground">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtigosTab;
