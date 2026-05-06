import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Trash2, Save, Plus, ExternalLink } from "lucide-react";
import { sanitizeSlug } from "@/lib/sanitizeSlug";
import AdminNav from "@/components/admin/AdminNav";

interface Aula {
  id: string;
  slug: string;
  titulo: string;
  youtube_url: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { titulo: "", youtube_url: "", slug: "" };

const AdminAula = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchAulas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("aulas_ao_vivo")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar aulas: " + error.message);
    } else {
      setAulas((data || []) as Aula[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAulas();
  }, [fetchAulas]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (a: Aula) => {
    setEditingId(a.id);
    setForm({ titulo: a.titulo, youtube_url: a.youtube_url, slug: a.slug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.youtube_url.trim() || !form.slug.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      youtube_url: form.youtube_url.trim(),
      slug: sanitizeSlug(form.slug),
    };
    const { error } = editingId
      ? await supabase.from("aulas_ao_vivo").update(payload).eq("id", editingId)
      : await supabase.from("aulas_ao_vivo").insert(payload);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editingId ? "Aula atualizada" : "Aula criada");
      resetForm();
      fetchAulas();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta aula?")) return;
    const { error } = await supabase.from("aulas_ao_vivo").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Aula excluída");
      fetchAulas();
    }
  };

  const handleToggleActive = async (a: Aula) => {
    const { error } = await supabase
      .from("aulas_ao_vivo")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (error) toast.error(error.message);
    else fetchAulas();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin — Aulas ao Vivo</title>
      </Helmet>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Aulas ao Vivo
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e gerencie as aulas que serão exibidas em /aula/:slug
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="font-heading text-lg font-semibold">
            {editingId ? "Editar aula" : "Nova aula"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Aula</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Aula sobre Vata"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Endereço (slug)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="aovivo"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                URL final: /aula/{form.slug || "..."}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="youtube_url">URL do YouTube</Label>
              <Input
                id="youtube_url"
                value={form.youtube_url}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Salvar alterações" : "Criar aula"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {/* List */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">
            Aulas cadastradas
          </h2>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : aulas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aula cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aulas.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.titulo}</TableCell>
                    <TableCell>
                      <a
                        href={`/aula/${a.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        /aula/{a.slug} <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={a.is_active}
                        onCheckedChange={() => handleToggleActive(a)}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(a)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminAula;
