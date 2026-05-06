import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  starts_at: string | null;
  descricao: string | null;
  button_text: string | null;
  button_url: string | null;
  button_delay_minutes: number | null;
}

const SP_OFFSET = "-03:00"; // São Paulo is UTC-3 year-round (no DST)

// Convert ISO UTC string -> "YYYY-MM-DDTHH:mm" interpreted in São Paulo for input
const isoToSpInput = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  // get parts in SP timezone via formatter
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // sv-SE produces "YYYY-MM-DD HH:mm" -> replace space with T
  return fmt.format(d).replace(" ", "T");
};

// Convert "YYYY-MM-DDTHH:mm" (SP local) -> ISO UTC string
const spInputToIso = (val: string): string | null => {
  if (!val) return null;
  // Append SP offset so Date parses it correctly
  const d = new Date(`${val}:00${SP_OFFSET}`);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

const emptyForm = {
  titulo: "",
  youtube_url: "",
  slug: "",
  starts_at: "",
  descricao: "",
  button_text: "",
  button_url: "",
  button_delay_minutes: "0",
};

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
    if (error) toast.error("Erro ao carregar aulas: " + error.message);
    else setAulas((data || []) as Aula[]);
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
    setForm({
      titulo: a.titulo,
      youtube_url: a.youtube_url,
      slug: a.slug,
      starts_at: isoToSpInput(a.starts_at),
      descricao: a.descricao ?? "",
      button_text: a.button_text ?? "",
      button_url: a.button_url ?? "",
      button_delay_minutes: String(a.button_delay_minutes ?? 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.youtube_url.trim() || !form.slug.trim()) {
      toast.error("Preencha título, URL e slug.");
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      youtube_url: form.youtube_url.trim(),
      slug: sanitizeSlug(form.slug),
      starts_at: spInputToIso(form.starts_at),
      descricao: form.descricao.trim() || null,
      button_text: form.button_text.trim() || null,
      button_url: form.button_url.trim() || null,
      button_delay_minutes: Math.max(0, parseInt(form.button_delay_minutes, 10) || 0),
    };
    const { error } = editingId
      ? await supabase.from("aulas_ao_vivo").update(payload).eq("id", editingId)
      : await supabase.from("aulas_ao_vivo").insert(payload);

    if (error) toast.error("Erro ao salvar: " + error.message);
    else {
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
            Cadastre e gerencie as aulas exibidas em /aula/:slug. Horários no fuso de
            São Paulo (UTC-3).
          </p>
        </header>

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
            <div className="space-y-2">
              <Label htmlFor="starts_at">Início da aula (São Paulo)</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                O countdown desaparece quando esse horário chega.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_delay_minutes">
                Botão aparece X minutos após o início
              </Label>
              <Input
                id="button_delay_minutes"
                type="number"
                min={0}
                value={form.button_delay_minutes}
                onChange={(e) =>
                  setForm({ ...form, button_delay_minutes: e.target.value })
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Ex: 30 = 30 min após o início da aula.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição (abaixo do vídeo)</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={4}
                placeholder="Texto que aparece logo abaixo do vídeo."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_text">Texto do botão</Label>
              <Input
                id="button_text"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                placeholder="Quero garantir minha vaga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_url">Link do botão</Label>
              <Input
                id="button_url"
                value={form.button_url}
                onChange={(e) => setForm({ ...form, button_url: e.target.value })}
                placeholder="https://..."
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
                  <TableHead>Início (SP)</TableHead>
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
                    <TableCell className="text-xs text-muted-foreground">
                      {a.starts_at
                        ? new Date(a.starts_at).toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })
                        : "—"}
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
