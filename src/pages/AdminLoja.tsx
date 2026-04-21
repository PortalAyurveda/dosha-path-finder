import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, Loader2, Save, Upload, X, GripVertical, ImageIcon } from "lucide-react";

import { useUser } from "@/contexts/UserContext";
import { lojaSupabase, type LojaProduto, type LojaKit } from "@/integrations/supabase/loja-client";
import { uploadToSamkhyaBucket } from "@/lib/lojaUploads";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// =====================================================
// PRODUTO EDITOR
// =====================================================

interface ProdutoFormState {
  slug: string;
  nome_display: string;
  preco_normal: string;
  preco_pix: string;
  resumo_curto: string;
  imagens: string[];
}

function ProdutoEditor({
  produto,
  onSaved,
}: {
  produto: LojaProduto;
  onSaved: (atualizado: LojaProduto) => void;
}) {
  const initial: ProdutoFormState = {
    slug: produto.slug,
    nome_display: produto.nome_display,
    preco_normal: String(produto.preco_normal ?? ""),
    preco_pix: String(produto.preco_pix ?? ""),
    resumo_curto: produto.resumo_curto ?? "",
    imagens:
      produto.imagens && produto.imagens.length > 0
        ? produto.imagens
        : produto.imagem_url
          ? [produto.imagem_url]
          : [],
  };

  const [form, setForm] = useState<ProdutoFormState>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const novos: string[] = [];
    for (const file of Array.from(files)) {
      const r = await uploadToSamkhyaBucket(file, form.slug || produto.slug);
      if ("error" in r) {
        toast.error(`Falha em ${file.name}: ${r.error}`);
      } else {
        novos.push(r.url);
      }
    }
    if (novos.length) {
      setForm((p) => ({ ...p, imagens: [...p.imagens, ...novos] }));
      toast.success(`${novos.length} imagem(ns) enviada(s)`);
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm((p) => ({ ...p, imagens: p.imagens.filter((_, i) => i !== idx) }));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setForm((p) => {
      const arr = [...p.imagens];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return p;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...p, imagens: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      nome_display: form.nome_display.trim(),
      preco_normal: Number(form.preco_normal),
      preco_pix: Number(form.preco_pix),
      resumo_curto: form.resumo_curto.trim() || null,
      imagens: form.imagens,
      // imagem_url = capa = primeira do array (mantém compat)
      imagem_url: form.imagens[0] ?? null,
    };

    const { data, error } = await lojaSupabase
      .from("produtos")
      .update(payload)
      .eq("id", produto.id)
      .select("*")
      .maybeSingle();

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }

    toast.success("Produto atualizado!");
    onSaved((data ?? { ...produto, ...payload }) as LojaProduto);
  };

  const capa = form.imagens[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden flex items-center justify-center">
            {capa ? (
              <img src={capa} alt={form.nome_display} className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{form.nome_display || "(sem nome)"}</CardTitle>
            <p className="text-xs text-muted-foreground truncate">/{form.slug}</p>
          </div>
          <div className="text-sm text-right shrink-0">
            <p className="font-semibold">R$ {Number(form.preco_pix || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{form.imagens.length} foto(s)</p>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Nome de exibição</Label>
              <Input
                value={form.nome_display}
                onChange={(e) => setForm({ ...form, nome_display: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Preço normal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.preco_normal}
                onChange={(e) => setForm({ ...form, preco_normal: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Preço Pix (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.preco_pix}
                onChange={(e) => setForm({ ...form, preco_pix: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Resumo curto</Label>
            <Textarea
              rows={2}
              value={form.resumo_curto}
              onChange={(e) => setForm({ ...form, resumo_curto: e.target.value })}
            />
          </div>

          {/* Galeria */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Imagens (a primeira é a capa)</Label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border bg-background hover:bg-muted">
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  Enviar imagens
                </span>
              </label>
            </div>

            {form.imagens.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Nenhuma imagem. Faça upload acima.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {form.imagens.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="relative group aspect-square rounded-md border bg-muted overflow-hidden"
                  >
                    <img src={url} alt="" className="w-full h-full object-contain" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                        capa
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 px-1.5 text-[10px]"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                      >
                        ←
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 px-1.5 text-[10px]"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === form.imagens.length - 1}
                      >
                        →
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(i)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setForm(initial)} disabled={!dirty || saving}>
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving} className="gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// =====================================================
// KIT EDITOR
// =====================================================

interface KitFormState {
  slug: string;
  nome: string;
  descricao_curta: string;
  preco_normal: string;
  preco_pix: string;
  imagem_url: string;
}

function KitEditor({ kit, onSaved }: { kit: LojaKit; onSaved: (k: LojaKit) => void }) {
  const initial: KitFormState = {
    slug: kit.slug,
    nome: kit.nome,
    descricao_curta: kit.descricao_curta ?? "",
    preco_normal: String(kit.preco_normal ?? ""),
    preco_pix: String(kit.preco_pix ?? ""),
    imagem_url: kit.imagem_url ?? "",
  };

  const [form, setForm] = useState<KitFormState>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const r = await uploadToSamkhyaBucket(files[0], `kit-${form.slug || kit.slug}`);
    setUploading(false);
    if ("error" in r) {
      toast.error(`Falha: ${r.error}`);
    } else {
      setForm((p) => ({ ...p, imagem_url: r.url }));
      toast.success("Imagem enviada");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      nome: form.nome.trim(),
      descricao_curta: form.descricao_curta.trim() || null,
      preco_normal: Number(form.preco_normal),
      preco_pix: Number(form.preco_pix),
      imagem_url: form.imagem_url.trim() || null,
    };

    const { data, error } = await lojaSupabase
      .from("kits")
      .update(payload)
      .eq("id", kit.id)
      .select("*")
      .maybeSingle();

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Kit atualizado!");
    onSaved((data ?? { ...kit, ...payload }) as LojaKit);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden flex items-center justify-center">
            {form.imagem_url ? (
              <img src={form.imagem_url} alt={form.nome} className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{form.nome || "(sem nome)"}</CardTitle>
            <p className="text-xs text-muted-foreground truncate">
              /{form.slug} {kit.tipo_kit && `· ${kit.tipo_kit}`}
            </p>
          </div>
          <div className="text-sm text-right shrink-0">
            <p className="font-semibold">R$ {Number(form.preco_pix || 0).toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Preço normal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.preco_normal}
                onChange={(e) => setForm({ ...form, preco_normal: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Preço Pix (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.preco_pix}
                onChange={(e) => setForm({ ...form, preco_pix: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Descrição curta</Label>
            <Textarea
              rows={2}
              value={form.descricao_curta}
              onChange={(e) => setForm({ ...form, descricao_curta: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Imagem do kit</Label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border bg-background hover:bg-muted">
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  Enviar imagem
                </span>
              </label>
            </div>

            {form.imagem_url && (
              <div className="relative w-32 aspect-square rounded-md border bg-muted overflow-hidden">
                <img src={form.imagem_url} alt="" className="w-full h-full object-contain" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => setForm({ ...form, imagem_url: "" })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Input
              placeholder="ou cole uma URL aqui"
              value={form.imagem_url}
              onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setForm(initial)} disabled={!dirty || saving}>
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving} className="gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

const AdminLoja = () => {
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const navigate = useNavigate();
  const accessLoading = authLoading || (!!user && roleLoading);

  const [produtos, setProdutos] = useState<LojaProduto[]>([]);
  const [kits, setKits] = useState<LojaKit[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [loadingKits, setLoadingKits] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (!accessLoading && (!user || role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [accessLoading, user, role, navigate]);

  const fetchProdutos = useCallback(async () => {
    setLoadingProdutos(true);
    const { data, error } = await lojaSupabase
      .from("produtos")
      .select("*")
      .order("ordem_exibicao", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar produtos");
    } else {
      setProdutos((data ?? []) as LojaProduto[]);
    }
    setLoadingProdutos(false);
  }, []);

  const fetchKits = useCallback(async () => {
    setLoadingKits(true);
    const { data, error } = await lojaSupabase
      .from("kits")
      .select("*")
      .order("ordem_exibicao", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar kits");
    } else {
      setKits((data ?? []) as LojaKit[]);
    }
    setLoadingKits(false);
  }, []);

  useEffect(() => {
    if (!accessLoading && role === "admin") {
      fetchProdutos();
      fetchKits();
    }
  }, [accessLoading, role, fetchProdutos, fetchKits]);

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || role !== "admin") return null;

  const produtosFiltrados = produtos.filter((p) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nome_display.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  const kitsFiltrados = kits.filter((k) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    return k.nome.toLowerCase().includes(q) || k.slug.toLowerCase().includes(q);
  });

  return (
    <>
      <Helmet>
        <title>Admin Loja Samkhya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-primary" />
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Loja Samkhya — Admin
              </h1>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
          </div>

          <Input
            placeholder="Buscar por nome ou slug…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="max-w-md"
          />

          <Tabs defaultValue="produtos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="produtos">
                Produtos ({produtos.length})
              </TabsTrigger>
              <TabsTrigger value="kits">Kits ({kits.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="produtos" className="space-y-3">
              {loadingProdutos ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : produtosFiltrados.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum produto encontrado.
                </p>
              ) : (
                produtosFiltrados.map((p) => (
                  <ProdutoEditor
                    key={p.id}
                    produto={p}
                    onSaved={(atualizado) =>
                      setProdutos((list) =>
                        list.map((x) => (x.id === atualizado.id ? atualizado : x)),
                      )
                    }
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="kits" className="space-y-3">
              {loadingKits ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : kitsFiltrados.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum kit encontrado.
                </p>
              ) : (
                kitsFiltrados.map((k) => (
                  <KitEditor
                    key={k.id}
                    kit={k}
                    onSaved={(atualizado) =>
                      setKits((list) =>
                        list.map((x) => (x.id === atualizado.id ? atualizado : x)),
                      )
                    }
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminLoja;
