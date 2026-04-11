import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Sparkles, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TAG_CATEGORIES } from "@/data/blogTags";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["blog-articles", debouncedSearch, isAdvanced, selectedTags],
    queryFn: async () => {
      let query = supabase
        .from("portal_conteudo")
        .select("id, title, summary, status, link_do_artigo, meta_description, tags, image_url, created_at")
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
  });

  const filteredArticles = useMemo(() => {
    if (selectedTags.length === 0) return articles;
    return articles.filter((a) => {
      if (!a.tags) return false;
      return selectedTags.some((tag) => a.tags!.includes(tag));
    });
  }, [articles, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const countSelectedInCategory = (tags: string[]) =>
    tags.filter((t) => selectedTags.includes(t)).length;

  return (
    <>
      <Helmet>
        <title>Blog Ayurveda | Portal Ayurveda</title>
        <meta name="description" content="Artigos sobre Ayurveda: doshas, alimentação, rotinas, ervas e terapias para equilibrar corpo e mente." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-surface-sun rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-8 md:p-12 mb-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
            Blog Ayurveda
          </h1>
          <p className="text-muted-foreground font-sans text-base md:text-lg mb-6 max-w-2xl mx-auto">
            Artigos práticos sobre doshas, alimentação, rotinas e terapias ayurvédicas.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isAdvanced ? "Busca avançada em conteúdo, tags e descrição..." : "Busque por título do artigo..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 md:h-14 text-base md:text-lg rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-primary/20 focus-visible:ring-secondary bg-background"
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Switch id="blog-advanced" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
            <Label htmlFor="blog-advanced" className="text-sm font-sans text-muted-foreground cursor-pointer flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Busca Avançada (conteúdo + tags)
            </Label>
          </div>

          {/* Tag categories - only when advanced */}
          {isAdvanced && (
            <div className="mt-4 max-w-3xl mx-auto">
              <p className="text-xs font-medium text-muted-foreground mb-3">Filtrar por tag:</p>

              {/* Category buttons */}
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {TAG_CATEGORIES.map((cat) => {
                  const count = countSelectedInCategory(cat.tags);
                  const isOpen = openCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                        isOpen
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {cat.name}
                      {count > 0 && (
                        <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold">
                          {count}
                        </span>
                      )}
                      <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  );
                })}
              </div>

              {/* Expanded categories */}
              {TAG_CATEGORIES.filter((cat) => openCategories.includes(cat.name)).map((cat) => (
                <div key={cat.name} className="mb-3 bg-background/60 rounded-xl p-3 border border-border/50">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">{cat.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected tags summary */}
          {selectedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 items-center">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer text-[11px]"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 ml-2"
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>

        {/* Articles grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum artigo encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.link_do_artigo || article.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {article.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-serif text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {article.meta_description || ""}
                  </p>
                  {article.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.split(",").slice(0, 3).map((tag) => (
                        <Badge key={tag.trim()} variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
