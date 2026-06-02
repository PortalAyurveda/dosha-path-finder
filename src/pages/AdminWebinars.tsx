import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Save, X, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { LANDING_PALETTES, getPalette, type LandingPaletteKey } from "@/data/landingPalettes";
import { slugify } from "@/lib/slugify";

interface WebinarRow {
  id: string;
  slug: string;
  titulo_evento: string;
  subtitulo: string | null;
  tema_paleta: string;
  data_hora: string | null;
  foto_url: string | null;
  copy_descricao: string | null;
  link_whatsapp: string | null;
  copy_confirmacao_titulo: string | null;
  copy_confirmacao_subtitulo: string | null;
  copy_box_whatsapp: string | null;
  bullets: unknown;
  ativo: boolean | null;
  created_at: string | null;
}

interface Bullet {
  titulo: string;
  texto: string;
}

interface FormState {
  id?: string;
  titulo_evento: string;
  subtitulo: string;
  slug: string;
  tema_paleta: LandingPaletteKey;
  data_hora: string;
  foto_url: string;
  copy_descricao: string;
  link_whatsapp: string;
  copy_confirmacao_titulo: string;
  copy_confirmacao_subtitulo: string;
  copy_box_whatsapp: string;
  bullets: Bullet[];
  ativo: boolean;
}

const emptyForm: FormState = {
  titulo_evento: "",
  subtitulo: "",
  slug: "",
  tema_paleta: "alimentacao-verde",
  data_hora: "",
  foto_url: "",
  copy_descricao: "",
  link_whatsapp: "",
  copy_confirmacao_titulo: "Inscrição confirmada!",
  copy_confirmacao_subtitulo: "Agora o próximo passo é entrar no grupo.",
  copy_box_whatsapp: "O link da sala, o material de apoio e o acesso ao professor ficam todos lá.",
  bullets: [],
  ativo: false,
};

const parseBullets = (raw: unknown): Bullet[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return (raw as Array<{ titulo?: string; texto?: string }>).map((b) => ({
      titulo: b.titulo ?? "",
      texto: b.texto ?? "",
    }));
  }
  if (typeof raw === "string") {
    try {
      return parseBullets(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
};

// ISO (UTC w/ Z) -> local "YYYY-MM-DDTHH:mm" for datetime-local
const isoToLocal = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const localToIso = (local: string): string | null => {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const AdminWebinars = () => {
  const [items, setItems] = useState<WebinarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("aulas_webinar")
      .select("*")
      .order("data_hora", { ascending: false, nullsFirst: false });
    if (error) toast.error("Erro ao carregar webinars");
    else setItems((data ?? []) as WebinarRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing({ ...emptyForm });
    setSlugTouched(false);
  };

  const startEdit = (w: WebinarRow) => {
    setEditing({
      id: w.id,
      titulo_evento: w.titulo_evento,
      subtitulo: w.subtitulo ?? "",
      slug: w.slug,
      tema_paleta: (w.tema_paleta || "alimentacao-verde") as LandingPaletteKey,
      data_hora: isoToLocal(w.data_hora),
      foto_url: w.foto_url ?? "",
      copy_descricao: w.copy_descricao ?? "",
      link_whatsapp: w.link_whatsapp ?? "",
      copy_confirmacao_titulo: w.copy_confirmacao_titulo ?? "",
      copy_confirmacao_subtitulo: w.copy_confirmacao_subtitulo ?? "",
      copy_box_whatsapp: w.copy_box_whatsapp ?? "",
      bullets: parseBullets(w.bullets),
      ativo: !!w.ativo,
    });
    setSlugTouched(true);
  };

  const cancel = () => {
    setEditing(null);
    setSlugTouched(false);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!editing || slugTouched || editing.id) return;
    const generated = slugify(editing.titulo_evento);
    if (generated && generated !== editing.slug) {
      setEditing((prev) => (prev ? { ...prev, slug: generated } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.titulo_evento]);

  const ensureUniqueSlug = async (slug: string, excludeId?: string): Promise<string> => {
    let candidate = slug;
    let i = 1;
    // try up to 50 variations
    while (i < 50) {
      const q = supabase.from("aulas_webinar").select("id").eq("slug", candidate);
      const { data } = await q;
      const conflicts = (data ?? []).filter((r) => r.id !== excludeId);
      if (conflicts.length === 0) return candidate;
      i += 1;
      candidate = `${slug}-${i}`;
    }
    return `${slug}-${Date.now()}`;
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titulo_evento.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const baseSlug = slugify(editing.slug || editing.titulo_evento);
    if (!baseSlug) {
      toast.error("Slug inválido");
      return;
    }
    setSaving(true);
    try {
      const slug = await ensureUniqueSlug(baseSlug, editing.id);
      const payload = {
        titulo_evento: editing.titulo_evento.trim(),
        subtitulo: editing.subtitulo.trim() || null,
        slug,
        tema_paleta: editing.tema_paleta,
        data_hora: localToIso(editing.data_hora),
        foto_url: editing.foto_url.trim() || null,
        copy_descricao: editing.copy_descricao.trim() || null,
        link_whatsapp: editing.link_whatsapp.trim() || null,
        copy_confirmacao_titulo: editing.copy_confirmacao_titulo.trim() || null,
        copy_confirmacao_subtitulo: editing.copy_confirmacao_subtitulo.trim() || null,
        copy_box_whatsapp: editing.copy_box_whatsapp.trim() || null,
        bullets: editing.bullets.filter((b) => b.titulo.trim() || b.texto.trim()),
        ativo: editing.ativo,
      };

      let error;
      if (editing.id) {
        ({ error } = await supabase.from("aulas_webinar").update(payload).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("aulas_webinar").insert(payload));
      }
      if (error) {
        toast.error("Erro ao salvar: " + error.message);
      } else {
        toast.success(editing.id ? "Webinar atualizado" : "Webinar criado");
        cancel();
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const removeBullet = (i: number) => {
    if (!editing) return;
    updateField("bullets", editing.bullets.filter((_, idx) => idx !== i));
  };
  const addBullet = () => {
    if (!editing) return;
    updateField("bullets", [...editing.bullets, { titulo: "", texto: "" }]);
  };
  const updateBullet = (i: number, key: keyof Bullet, value: string) => {
    if (!editing) return;
    const next = [...editing.bullets];
    next[i] = { ...next[i], [key]: value };
    updateField("bullets", next);
  };

  const paletteOptions = useMemo(
    () =>
      LANDING_PALETTES.map((p) => ({
        value: p.key,
        label: p.label,
        primary: p.branding.primaryColor,
      })),
    []
  );

  return (
    <>
      <AdminNav />
      <PageContainer>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">Webinars</h1>
          {!editing && (
            <Button onClick={startCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo webinar
            </Button>
          )}
        </div>

        {editing && (
          <Card className="p-5 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-primary">
                {editing.id ? "Editar webinar" : "Novo webinar"}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={cancel} disabled={saving} className="gap-1.5">
                  <X className="w-4 h-4" /> Cancelar
                </Button>
                <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                  <Save className="w-4 h-4" /> Salvar
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Título do evento *</Label>
                <Input
                  value={editing.titulo_evento}
                  onChange={(e) => updateField("titulo_evento", e.target.value)}
                  placeholder="Aula Secreta: A Lógica..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subtítulo</Label>
                <Input
                  value={editing.subtitulo}
                  onChange={(e) => updateField("subtitulo", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    updateField("slug", slugify(e.target.value));
                  }}
                  placeholder="aula-secreta-alimentacao"
                />
                <p className="text-xs text-muted-foreground">URL: /aula/{editing.slug || "..."}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Paleta</Label>
                <Select
                  value={editing.tema_paleta}
                  onValueChange={(v) => updateField("tema_paleta", v as LandingPaletteKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paletteOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ background: p.primary }}
                          />
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data e horário</Label>
                <Input
                  type="datetime-local"
                  value={editing.data_hora}
                  onChange={(e) => updateField("data_hora", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Link do WhatsApp</Label>
                <Input
                  value={editing.link_whatsapp}
                  onChange={(e) => updateField("link_whatsapp", e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Foto (URL)</Label>
                <Input
                  value={editing.foto_url}
                  onChange={(e) => updateField("foto_url", e.target.value)}
                  placeholder="https://..."
                />
                {editing.foto_url && (
                  <img
                    src={editing.foto_url}
                    alt="preview"
                    className="mt-2 max-h-40 rounded-lg border object-cover"
                  />
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Copy descrição (landing)</Label>
                <Textarea
                  rows={4}
                  value={editing.copy_descricao}
                  onChange={(e) => updateField("copy_descricao", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Título da confirmação</Label>
                <Input
                  value={editing.copy_confirmacao_titulo}
                  onChange={(e) => updateField("copy_confirmacao_titulo", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subtítulo da confirmação</Label>
                <Input
                  value={editing.copy_confirmacao_subtitulo}
                  onChange={(e) => updateField("copy_confirmacao_subtitulo", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Texto do box WhatsApp</Label>
                <Textarea
                  rows={2}
                  value={editing.copy_box_whatsapp}
                  onChange={(e) => updateField("copy_box_whatsapp", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Bullets (página de confirmação)</Label>
                <Button size="sm" variant="outline" onClick={addBullet} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Adicionar bullet
                </Button>
              </div>
              {editing.bullets.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum bullet ainda.</p>
              )}
              <div className="space-y-2">
                {editing.bullets.map((b, i) => (
                  <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                    <div className="flex-1 grid gap-2">
                      <Input
                        value={b.titulo}
                        onChange={(e) => updateBullet(i, "titulo", e.target.value)}
                        placeholder="Título do bullet"
                      />
                      <Textarea
                        rows={2}
                        value={b.texto}
                        onChange={(e) => updateBullet(i, "texto", e.target.value)}
                        placeholder="Texto do bullet"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeBullet(i)}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={editing.ativo}
                onCheckedChange={(v) => updateField("ativo", v)}
                id="ativo"
              />
              <Label htmlFor="ativo">Ativo (visível publicamente)</Label>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {loading && <p className="text-muted-foreground">Carregando...</p>}
          {!loading && items.length === 0 && (
            <p className="text-muted-foreground">Nenhum webinar ainda.</p>
          )}
          {items.map((w) => {
            const p = getPalette((w.tema_paleta || "alimentacao-verde") as LandingPaletteKey);
            return (
              <Card key={w.id} className="p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-primary">{w.titulo_evento}</h3>
                    {w.ativo ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    /aula/{w.slug} •{" "}
                    {w.data_hora
                      ? new Date(w.data_hora).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "sem data"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: p?.branding.primaryColor }}
                  />
                  {p?.label}
                </span>
                <Button size="sm" variant="outline" onClick={() => startEdit(w)} className="gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button size="sm" variant="outline" asChild className="gap-1.5">
                  <Link to={`/aula/${w.slug}`} target="_blank">
                    <ExternalLink className="w-3.5 h-3.5" /> Ver landing
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
};

export default AdminWebinars;
