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
import { Trash2, Plus, Star, X, Save } from "lucide-react";

interface DevlogItem {
  id: string;
  versao: string;
  titulo: string;
  descricao: string | null;
  destaque: boolean | null;
  criado_em: string | null;
}

const empty = { versao: "", titulo: "", descricao: "", destaque: false };

// Strip any leading "v"/"V" — version field stores only number like "1.1"
const cleanVersao = (v: string) => v.replace(/^v\s*/i, "").trim();

const AdminDevlog = () => {
  const [items, setItems] = useState<DevlogItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    setCreating(true);
    setForm(empty);
  };

  const cancelCreate = () => {
    setCreating(false);
    setForm(empty);
  };

  const create = async () => {
    const versao = cleanVersao(form.versao);
    if (!versao || !form.titulo.trim()) {
      toast.error("Versão e título são obrigatórios");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("devlog").insert({
      versao,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      destaque: form.destaque,
    });
    if (error) toast.error("Erro ao criar");
    else {
      toast.success("Criado");
      cancelCreate();
      load();
    }
    setSaving(false);
  };

  const updateField = async (id: string, patch: Partial<DevlogItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    const { error } = await supabase.from("devlog").update(patch).eq("id", id);
    if (error) {
      toast.error("Erro ao salvar");
      load();
    }
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

  // Group by versao for visual organization
  const groups: { versao: string; items: DevlogItem[] }[] = [];
  const idx = new Map<string, number>();
  for (const it of items) {
    const key = cleanVersao(it.versao);
    if (!idx.has(key)) {
      idx.set(key, groups.length);
      groups.push({ versao: key, items: [] });
    }
    groups[idx.get(key)!].items.push(it);
  }
  groups.forEach((g) => g.items.sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque)));

  return (
    <>
      <AdminNav />
      <PageContainer title="Devlog — Admin" description="Gerencie as entradas do devlog">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Devlog</h1>
            {!creating && (
              <Button onClick={startCreate} size="sm">
                <Plus className="w-4 h-4" /> Nova entrada
              </Button>
            )}
          </div>

          {creating && (
            <Card className="p-4 space-y-3 border-primary/40">
              <div className="grid sm:grid-cols-[140px_1fr] gap-3">
                <div>
                  <Label htmlFor="versao">Versão</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-medium">v</span>
                    <Input
                      id="versao"
                      placeholder="1.1"
                      value={form.versao}
                      onChange={(e) =>
                        setForm({ ...form, versao: cleanVersao(e.target.value) })
                      }
                    />
                  </div>
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
                <Button variant="outline" size="sm" onClick={cancelCreate} disabled={saving}>
                  <X className="w-4 h-4" /> Cancelar
                </Button>
                <Button size="sm" onClick={create} disabled={saving}>
                  <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </Card>
          )}

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando…</p>
          ) : groups.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma entrada ainda.</p>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <section key={g.versao}>
                  <header className="mb-3 flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-lg font-semibold">Update v{g.versao}</h2>
                    <Badge variant="outline">{g.items.length} {g.items.length === 1 ? "entrada" : "entradas"}</Badge>
                  </header>

                  <ul className="space-y-3">
                    {g.items.map((it) => (
                      <li key={it.id}>
                        <InlineEntry
                          item={it}
                          onChange={(patch) => updateField(it.id, patch)}
                          onRemove={() => remove(it.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
};

interface InlineEntryProps {
  item: DevlogItem;
  onChange: (patch: Partial<DevlogItem>) => void;
  onRemove: () => void;
}

const InlineEntry = ({ item, onChange, onRemove }: InlineEntryProps) => {
  const [versao, setVersao] = useState(cleanVersao(item.versao));
  const [titulo, setTitulo] = useState(item.titulo);
  const [descricao, setDescricao] = useState(item.descricao ?? "");

  useEffect(() => {
    setVersao(cleanVersao(item.versao));
    setTitulo(item.titulo);
    setDescricao(item.descricao ?? "");
  }, [item.id, item.versao, item.titulo, item.descricao]);

  const commit = (patch: Partial<DevlogItem>) => {
    onChange(patch);
  };

  return (
    <Card className={`p-3 ${item.destaque ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm font-medium">v</span>
              <Input
                value={versao}
                onChange={(e) => setVersao(cleanVersao(e.target.value))}
                onBlur={() => {
                  const v = cleanVersao(versao);
                  if (v && v !== cleanVersao(item.versao)) commit({ versao: v });
                }}
                placeholder="1.1"
                className="h-8 text-sm"
              />
            </div>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={() => {
                const t = titulo.trim();
                if (t && t !== item.titulo) commit({ titulo: t });
              }}
              placeholder="Título"
              className="h-8 text-sm font-medium"
            />
          </div>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onBlur={() => {
              const d = descricao.trim() || null;
              if (d !== (item.descricao ?? null)) commit({ descricao: d });
            }}
            placeholder="Descrição (opcional)"
            rows={2}
            className="text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch
                checked={!!item.destaque}
                onCheckedChange={(v) => commit({ destaque: v })}
              />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" /> destaque
              </span>
            </label>
            {item.criado_em && (
              <span className="text-xs text-muted-foreground">
                {new Date(item.criado_em).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AdminDevlog;
