import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Star, X, Save } from "lucide-react";

interface DevlogItem {
  id: string;
  versao: string;
  titulo: string;
  descricao: string | null;
  destaque: boolean | null;
  criado_em: string | null;
}

const empty = { versao: "", titulo: "", descricao: "", destaque: false };

const AdminDevlog = () => {
  const [items, setItems] = useState<DevlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("devlog")
      .select("id, versao, titulo, descricao, destaque, criado_em")
      .order("criado_em", { ascending: false });
    if (error) toast.error("Erro ao carregar devlog");
    else setItems((data ?? []) as DevlogItem[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setCreating(true);
    setForm(empty);
  };

  const startEdit = (it: DevlogItem) => {
    setCreating(false);
    setEditingId(it.id);
    setForm({
      versao: it.versao,
      titulo: it.titulo,
      descricao: it.descricao ?? "",
      destaque: !!it.destaque,
    });
  };

  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setForm(empty);
  };

  const save = async () => {
    if (!form.versao.trim() || !form.titulo.trim()) {
      toast.error("Versão e título são obrigatórios");
      return;
    }
    setSaving(true);
    const payload = {
      versao: form.versao.trim(),
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      destaque: form.destaque,
    };
    if (editingId) {
      const { error } = await supabase.from("devlog").update(payload).eq("id", editingId);
      if (error) toast.error("Erro ao atualizar");
      else {
        toast.success("Atualizado");
        cancel();
        load();
      }
    } else {
      const { error } = await supabase.from("devlog").insert(payload);
      if (error) toast.error("Erro ao criar");
      else {
        toast.success("Criado");
        cancel();
        load();
      }
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta entrada do devlog?")) return;
    const { error } = await supabase.from("devlog").delete().eq("id", id);
    if (error) toast.error("Erro ao remover");
    else {
      toast.success("Removido");
      load();
    }
  };

  const renderForm = () => (
    <Card className="p-4 space-y-3 border-primary/40">
      <div className="grid sm:grid-cols-[180px_1fr] gap-3">
        <div>
          <Label htmlFor="versao">Versão</Label>
          <Input
            id="versao"
            placeholder="v1.4.0"
            value={form.versao}
            onChange={(e) => setForm({ ...form, versao: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            placeholder="O que mudou"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          rows={4}
          placeholder="Detalhes (opcional)"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="destaque"
          checked={form.destaque}
          onCheckedChange={(v) => setForm({ ...form, destaque: v })}
        />
        <Label htmlFor="destaque" className="cursor-pointer">Destaque</Label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={cancel} disabled={saving}>
          <X className="w-4 h-4" /> Cancelar
        </Button>
        <Button size="sm" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <AdminNav />
      <PageContainer title="Devlog — Admin" description="Gerencie as entradas do devlog">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Devlog</h1>
            {!creating && !editingId && (
              <Button onClick={startCreate} size="sm">
                <Plus className="w-4 h-4" /> Nova entrada
              </Button>
            )}
          </div>

          {creating && renderForm()}

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando…</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma entrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id}>
                  {editingId === it.id ? (
                    renderForm()
                  ) : (
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline">{it.versao}</Badge>
                            <h3 className="font-medium">{it.titulo}</h3>
                            {it.destaque && (
                              <Badge className="gap-1">
                                <Star className="w-3 h-3" /> destaque
                              </Badge>
                            )}
                          </div>
                          {it.descricao && (
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {it.descricao}
                            </p>
                          )}
                          {it.criado_em && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(it.criado_em).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(it)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(it.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default AdminDevlog;
