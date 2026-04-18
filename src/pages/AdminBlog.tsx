import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationControls from "@/components/PaginationControls";
import { ArrowLeft, Search, Loader2, Upload, Save, Copy } from "lucide-react";
import { sanitizeSlug } from "@/lib/sanitizeSlug";

const PAGE_SIZE = 24;
const FALLBACK_BUCKETS = ["portal_images", "portal_capas", "samkhya", "fotos-lingua"];

interface Article {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

const AdminBlog = () => {
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const navigate = useNavigate();
  const accessLoading = authLoading || (!!user && roleLoading);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit dialog
  const [editing, setEditing] = useState<Article | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Upload state inside dialog
  const [buckets, setBuckets] = useState<string[]>(FALLBACK_BUCKETS);
  const [uploadBucket, setUploadBucket] = useState<string>(FALLBACK_BUCKETS[0]);
  const [uploading, setUploading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!accessLoading && (!user || role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [accessLoading, user, role, navigate]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from("portal_conteudo")
      .select("id, title, image_url, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (debouncedSearch) {
      q = q.ilike("title", `%${debouncedSearch}%`);
    }

    const { data, error, count } = await q;
    if (error) {
      toast.error("Erro ao carregar artigos");
      setLoading(false);
      return;
    }
    setArticles((data || []) as Article[]);
    setTotal(count || 0);
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!accessLoading && role === "admin") fetchArticles();
  }, [accessLoading, role, fetchArticles]);

  // Load buckets for the dialog
  useEffect(() => {
    if (!accessLoading && role === "admin") {
      supabase.storage.listBuckets().then(({ data }) => {
        if (data?.length) {
          const names = data.map((b) => b.name);
          setBuckets(names);
          setUploadBucket((prev) => (names.includes(prev) ? prev : names[0]));
        }
      });
    }
  }, [accessLoading, role]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const openEdit = (article: Article) => {
    setEditing(article);
    setNewUrl(article.image_url || "");
  };

  const closeEdit = () => {
    setEditing(null);
    setNewUrl("");
  };

  const handleSave = async () => {
    if (!editing) return;
    const url = newUrl.trim();
    if (!url) {
      toast.error("Informe uma URL de imagem");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("portal_conteudo")
      .update({ image_url: url })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Imagem atualizada!");
    setArticles((prev) =>
      prev.map((a) => (a.id === editing.id ? { ...a, image_url: url } : a))
    );
    closeEdit();
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    const finalName = sanitizeSlug(file.name);
    const { error } = await supabase.storage
      .from(uploadBucket)
      .upload(finalName, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Erro no upload: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from(uploadBucket).getPublicUrl(finalName);
    setNewUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Upload concluído — clique em Salvar para aplicar");
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || role !== "admin") return null;

  return (
    <>
      <Helmet>
        <title>Admin · Artigos – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Artigos
              </h1>
              <span className="text-sm text-muted-foreground">({total})</span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por título…"
                className="pl-9"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              Nenhum artigo encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {articles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openEdit(a)}
                  className="group flex items-center gap-3 bg-card border border-border rounded-lg p-2 text-left transition-shadow hover:shadow-md hover:border-primary/40"
                >
                  <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        sem capa
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground line-clamp-3">
                      {a.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar imagem do artigo</DialogTitle>
            <DialogDescription className="line-clamp-2">
              {editing?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current preview */}
            {newUrl && (
              <div className="bg-muted rounded-lg overflow-hidden aspect-video">
                <img
                  src={newUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* URL field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">URL da imagem</label>
              <div className="flex gap-2">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://…"
                  className="flex-1 text-xs"
                />
                {newUrl && (
                  <Button variant="outline" size="icon" onClick={() => handleCopy(newUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <label className="text-xs font-medium text-foreground">
                Ou enviar nova imagem
              </label>
              <div className="flex gap-2">
                <Select value={uploadBucket} onValueChange={setUploadBucket}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  disabled={uploading}
                  onClick={() => document.getElementById("admin-blog-file")?.click()}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Selecionar arquivo
                </Button>
                <input
                  id="admin-blog-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminBlog;
