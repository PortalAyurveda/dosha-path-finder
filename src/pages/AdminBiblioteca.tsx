import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Video as VideoIcon,
  FileText,
  Trash2,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

const PAGE_SIZE = 30;

const VIDEO_TABLES = [
  { value: "portal_oficial", label: "Portal Oficial" },
  { value: "portal_kapha", label: "Portal Kapha" },
  { value: "portal_pitta", label: "Portal Pitta" },
  { value: "portal_vata", label: "Portal Vata" },
  { value: "portal_lives", label: "Portal Lives" },
  { value: "portal_receitas", label: "Portal Receitas" },
] as const;

type VideoTable = (typeof VIDEO_TABLES)[number]["value"];

interface VideoRow {
  video_id: string;
  titulo_original: string | null;
  novo_titulo: string | null;
  nova_descricao: string | null;
  tags: string | null;
  mini_resumo: string | null;
}

interface ArtigoRow {
  id: string;
  title: string;
  summary: string | null;
  status: string | null;
  link_do_artigo: string | null;
  meta_description: string | null;
  tags: string | null;
  image_url: string | null;
}

const AdminBiblioteca = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const accessLoading = authLoading || (!!user && roleLoading);

  // Auth guard removed: /admin is open during testing


  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Biblioteca – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Admin Biblioteca
            </h1>
          </div>

          <Tabs defaultValue="videos" className="w-full">
            <TabsList>
              <TabsTrigger value="videos" className="gap-2">
                <VideoIcon className="w-4 h-4" />
                Vídeos
              </TabsTrigger>
              <TabsTrigger value="artigos" className="gap-2">
                <FileText className="w-4 h-4" />
                Artigos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-4">
              <VideosPanel />
            </TabsContent>

            <TabsContent value="artigos" className="mt-4">
              <ArtigosPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

/* ===================== VÍDEOS ===================== */

const VideosPanel = () => {
  const [table, setTable] = useState<VideoTable>("portal_oficial");
  const [searchField, setSearchField] = useState<"titulo_original" | "video_id">(
    "titulo_original"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<VideoRow | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [table, debouncedTerm, searchField]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from(table)
      .select(
        "video_id, titulo_original, novo_titulo, nova_descricao, tags, mini_resumo",
        { count: "exact" }
      )
      .order("criado_em", { ascending: false })
      .range(from, to);

    if (debouncedTerm) {
      query = query.ilike(searchField, `%${debouncedTerm}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      toast.error("Erro ao carregar vídeos: " + error.message);
      setRows([]);
      setTotal(0);
    } else {
      setRows((data ?? []) as VideoRow[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [table, page, debouncedTerm, searchField]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSave = async (updated: VideoRow) => {
    const { error } = await supabase
      .from(table)
      .update({
        titulo_original: updated.titulo_original,
        novo_titulo: updated.novo_titulo,
        nova_descricao: updated.nova_descricao,
        tags: updated.tags,
        mini_resumo: updated.mini_resumo,
      })
      .eq("video_id", updated.video_id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return false;
    }
    toast.success("Vídeo atualizado!");
    setEditing(null);
    fetchRows();
    return true;
  };

  const handleDelete = async (row: VideoRow, fromDialog = false) => {
    if (!window.confirm(`Excluir o vídeo "${row.novo_titulo || row.titulo_original || row.video_id}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from(table).delete().eq("video_id", row.video_id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success("Vídeo excluído");
    if (fromDialog) setEditing(null);
    setRows((prev) => prev.filter((r) => r.video_id !== row.video_id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Tabela</Label>
            <Select value={table} onValueChange={(v) => setTable(v as VideoTable)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_TABLES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Buscar por</Label>
            <Select
              value={searchField}
              onValueChange={(v) => setSearchField(v as typeof searchField)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="titulo_original">Título original</SelectItem>
                <SelectItem value="video_id">Video ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Termo</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite parte do termo..."
                className="h-9 pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground w-[140px]">
                  Video ID
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  Título original
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  Novo título
                </th>
                <th className="p-3 w-[170px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={4} className="p-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum vídeo encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.video_id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {r.video_id}
                    </td>
                    <td className="p-3 truncate max-w-[280px]" title={r.titulo_original ?? ""}>
                      {r.titulo_original || <span className="text-muted-foreground italic">—</span>}
                    </td>
                    <td className="p-3 truncate max-w-[280px]" title={r.novo_titulo ?? ""}>
                      {r.novo_titulo || <span className="text-muted-foreground italic">—</span>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setEditing(r)}
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(r)}
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {total} resultado(s) — página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <VideoEditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={(r) => handleDelete(r, true)}
      />
    </div>
  );
};

const VideoEditDialog = ({
  row,
  onClose,
  onSave,
}: {
  row: VideoRow | null;
  onClose: () => void;
  onSave: (r: VideoRow) => Promise<boolean>;
}) => {
  const [draft, setDraft] = useState<VideoRow | null>(row);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(row), [row]);

  if (!draft) return null;

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar vídeo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Video ID (somente leitura)</Label>
            <Input value={draft.video_id} disabled className="font-mono text-xs" />
          </div>

          <div>
            <Label className="text-xs">Título original</Label>
            <Input
              value={draft.titulo_original ?? ""}
              onChange={(e) => setDraft({ ...draft, titulo_original: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Novo título</Label>
            <Input
              value={draft.novo_titulo ?? ""}
              onChange={(e) => setDraft({ ...draft, novo_titulo: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Mini resumo</Label>
            <Textarea
              rows={2}
              value={draft.mini_resumo ?? ""}
              onChange={(e) => setDraft({ ...draft, mini_resumo: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Nova descrição</Label>
            <Textarea
              rows={6}
              value={draft.nova_descricao ?? ""}
              onChange={(e) => setDraft({ ...draft, nova_descricao: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Tags</Label>
            <Input
              value={draft.tags ?? ""}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await onSave(draft);
              setSaving(false);
            }}
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ===================== ARTIGOS ===================== */

const ArtigosPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ArtigoRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ArtigoRow | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => setPage(1), [debouncedTerm]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("portal_conteudo")
      .select("id, title, summary, status, link_do_artigo, meta_description, tags, image_url", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (debouncedTerm) {
      query = query.ilike("title", `%${debouncedTerm}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      toast.error("Erro ao carregar artigos: " + error.message);
      setRows([]);
      setTotal(0);
    } else {
      setRows((data ?? []) as ArtigoRow[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, debouncedTerm]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSave = async (updated: ArtigoRow) => {
    const { error } = await supabase
      .from("portal_conteudo")
      .update({
        title: updated.title,
        summary: updated.summary,
        status: updated.status,
        link_do_artigo: updated.link_do_artigo,
        meta_description: updated.meta_description,
        tags: updated.tags,
        image_url: updated.image_url,
      })
      .eq("id", updated.id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return false;
    }
    toast.success("Artigo atualizado!");
    setEditing(null);
    fetchRows();
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <Label className="text-xs">Buscar por título</Label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite parte do título..."
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left p-3 font-medium text-muted-foreground w-[120px]">
                  Status
                </th>
                <th className="p-3 w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={3} className="p-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    Nenhum artigo encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 truncate max-w-[420px]" title={r.title}>
                      {r.title}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.status ?? "—"}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setEditing(r)}
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {total} resultado(s) — página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ArtigoEditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
};

const ArtigoEditDialog = ({
  row,
  onClose,
  onSave,
}: {
  row: ArtigoRow | null;
  onClose: () => void;
  onSave: (r: ArtigoRow) => Promise<boolean>;
}) => {
  const [draft, setDraft] = useState<ArtigoRow | null>(row);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(row), [row]);

  if (!draft) return null;

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar artigo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Título</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Status</Label>
            <Select
              value={draft.status ?? "draft"}
              onValueChange={(v) => setDraft({ ...draft, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Imagem (URL)</Label>
            <Input
              value={draft.image_url ?? ""}
              onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
              placeholder="https://..."
            />
            {draft.image_url && (
              <img
                src={draft.image_url}
                alt="preview"
                className="mt-2 max-h-32 rounded border border-border object-cover"
              />
            )}
          </div>

          <div>
            <Label className="text-xs">Link do artigo</Label>
            <Input
              value={draft.link_do_artigo ?? ""}
              onChange={(e) => setDraft({ ...draft, link_do_artigo: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-xs">Resumo</Label>
            <Textarea
              rows={3}
              value={draft.summary ?? ""}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Meta description (SEO)</Label>
            <Textarea
              rows={2}
              value={draft.meta_description ?? ""}
              onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Tags</Label>
            <Input
              value={draft.tags ?? ""}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await onSave(draft);
              setSaving(false);
            }}
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBiblioteca;
