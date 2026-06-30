import { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Video as VideoIcon,
  Plus,
  Trash2,
  Save,
  Upload,
  Download,
  Loader2,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/slugify";
import { optimizeImageToWebP } from "@/lib/imageOptimize";

const BUCKET_APOSTILA = "escola";
const BUCKET_CAPA = "portal_images";

type Curso = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  capa_url: string | null;
  ordem: number;
  ativo: boolean;
};

type Modulo = {
  id: string;
  curso_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
};

type Aula = {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao: string | null;
  youtube_url: string | null;
  duracao_segundos: number | null;
  ordem: number;
};

type Material = {
  id: string;
  aula_id: string;
  titulo: string;
  tipo: string;
  storage_path: string | null;
  url: string | null;
  ordem: number;
};

const extractYoutubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    return null;
  }
  return null;
};

// ============= LISTA DE CURSOS =============
const ListaCursos = ({
  cursos,
  onSelect,
  onToggleAtivo,
  onNovo,
  criando,
}: {
  cursos: Curso[];
  onSelect: (c: Curso) => void;
  onToggleAtivo: (c: Curso, v: boolean) => void;
  onNovo: () => void;
  criando: boolean;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNovo} disabled={criando}>
          {criando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Novo curso
        </Button>
      </div>
      {cursos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum curso cadastrado.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => (
            <Card
              key={c.id}
              className={`hover:border-primary transition-colors ${c.ativo ? "" : "bg-muted/30"}`}
            >
              <div className="cursor-pointer" onClick={() => onSelect(c)}>
                {c.capa_url ? (
                  <img
                    src={c.capa_url}
                    alt={c.titulo}
                    className="w-full h-36 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-36 rounded-t-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-heading leading-tight">{c.titulo}</CardTitle>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardHeader>
              </div>
              <CardContent className="space-y-2">
                <Badge variant={c.ativo ? "default" : "secondary"} className="text-[10px]">
                  {c.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <Label className="text-[11px] cursor-pointer" htmlFor={`ativo-${c.id}`}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Label>
                  <Switch
                    id={`ativo-${c.id}`}
                    checked={c.ativo}
                    onCheckedChange={(v) => onToggleAtivo(c, v)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ============= EDITAR AULA =============
const AulaEditor = ({
  aula,
  onChange,
  onRemove,
  onMove,
  podeSubir,
  podeDescer,
}: {
  aula: Aula;
  onChange: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  podeSubir: boolean;
  podeDescer: boolean;
}) => {
  const [titulo, setTitulo] = useState(aula.titulo);
  const [descricao, setDescricao] = useState(aula.descricao ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(aula.youtube_url ?? "");
  const [duracao, setDuracao] = useState<string>(
    aula.duracao_segundos != null ? String(aula.duracao_segundos) : "",
  );
  const [savingAula, setSavingAula] = useState(false);

  const [material, setMaterial] = useState<Material | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitulo(aula.titulo);
    setDescricao(aula.descricao ?? "");
    setYoutubeUrl(aula.youtube_url ?? "");
    setDuracao(aula.duracao_segundos != null ? String(aula.duracao_segundos) : "");
  }, [aula]);

  const loadMaterial = useCallback(async () => {
    const { data } = await supabase
      .from("curso_materiais")
      .select("*")
      .eq("aula_id", aula.id)
      .eq("tipo", "apostila")
      .order("ordem", { ascending: true })
      .limit(1)
      .maybeSingle();
    setMaterial((data as Material | null) ?? null);
  }, [aula.id]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!material?.storage_path) {
        setSignedUrl(null);
        return;
      }
      const { data } = await supabase.storage
        .from(BUCKET_APOSTILA)
        .createSignedUrl(material.storage_path, 3600);
      if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [material?.storage_path]);

  const videoId = youtubeUrl ? extractYoutubeId(youtubeUrl) : null;

  const salvarAula = async () => {
    setSavingAula(true);
    const dur = duracao.trim() ? Number(duracao) : null;
    const { error } = await supabase
      .from("curso_aulas")
      .update({
        titulo: titulo.trim() || "Sem título",
        descricao: descricao.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        duracao_segundos: dur != null && Number.isFinite(dur) ? dur : null,
      })
      .eq("id", aula.id);
    setSavingAula(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else {
      toast({ title: "Aula salva" });
      onChange();
    }
  };

  const handleUploadApostila = async (file: File, cursoId: string) => {
    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `curso-${cursoId}/aula-${aula.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET_APOSTILA).upload(path, file, {
      upsert: false,
      contentType: file.type || "application/pdf",
    });
    if (error) {
      toast({ title: "Erro no upload", description: error.message });
      setUploading(false);
      return;
    }
    if (material?.storage_path) {
      await supabase.storage.from(BUCKET_APOSTILA).remove([material.storage_path]);
      const { error: upErr } = await supabase
        .from("curso_materiais")
        .update({ storage_path: path, titulo: file.name })
        .eq("id", material.id);
      if (upErr) toast({ title: "Erro ao salvar", description: upErr.message });
    } else {
      const { error: insErr } = await supabase.from("curso_materiais").insert({
        aula_id: aula.id,
        tipo: "apostila",
        titulo: file.name,
        storage_path: path,
        ordem: 0,
      });
      if (insErr) toast({ title: "Erro ao salvar", description: insErr.message });
    }
    setUploading(false);
    toast({ title: "Apostila enviada" });
    loadMaterial();
  };

  // pega cursoId via lookup; vamos receber via callback do parent — mas pra simplificar usamos pasta com aula.id apenas
  // (mantive a assinatura — quem chamar passa cursoId)
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>, cursoId: string) => {
    const f = e.target.files?.[0];
    if (f) handleUploadApostila(f, cursoId);
    e.target.value = "";
  };

  return (
    <CursoIdContext.Consumer>
      {(cursoId) => (
        <div className="rounded-lg border border-border p-4 bg-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove(-1)}
                disabled={!podeSubir}
                title="Subir"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove(1)}
                disabled={!podeDescer}
                title="Descer"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">#{aula.ordem + 1}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Link do YouTube</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/…"
              />
            </div>
            <div className="space-y-1">
              <Label>Duração (segundos)</Label>
              <Input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                placeholder="ex: 1200"
              />
            </div>
          </div>

          {videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Apostila (PDF)</Label>
            {material?.storage_path ? (
              <div className="flex items-center gap-3 flex-wrap rounded-lg border border-border p-3 bg-muted/30">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm truncate flex-1 min-w-0">
                  {material.titulo || material.storage_path.split("/").pop()}
                </span>
                {signedUrl && (
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary inline-flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> abrir
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma apostila enviada.</p>
            )}
            <label className="inline-flex">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => onPickFile(e, cursoId)}
              />
              <span
                className={`inline-flex items-center gap-2 text-sm px-3 h-9 rounded-md border border-input bg-background hover:bg-accent cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {material?.storage_path ? "Substituir apostila" : "Enviar apostila"}
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={salvarAula} disabled={savingAula} size="sm">
              {savingAula ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar aula
            </Button>
          </div>
        </div>
      )}
    </CursoIdContext.Consumer>
  );
};

// Contexto pra passar cursoId pro AulaEditor sem prop drilling de quem renderiza dentro do módulo
import { createContext } from "react";
const CursoIdContext = createContext<string>("");

// ============= EDITAR MÓDULO =============
const EditarModulo = ({
  modulo,
  cursoId,
  onBack,
  onChange,
}: {
  modulo: Modulo;
  cursoId: string;
  onBack: () => void;
  onChange: () => void;
}) => {
  const [titulo, setTitulo] = useState(modulo.titulo);
  const [descricao, setDescricao] = useState(modulo.descricao ?? "");
  const [savingMod, setSavingMod] = useState(false);

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAulas = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("curso_aulas")
      .select("*")
      .eq("modulo_id", modulo.id)
      .order("ordem", { ascending: true });
    setAulas((data ?? []) as Aula[]);
    setLoading(false);
  }, [modulo.id]);

  useEffect(() => {
    loadAulas();
  }, [loadAulas]);

  const salvarModulo = async () => {
    setSavingMod(true);
    const { error } = await supabase
      .from("curso_modulos")
      .update({
        titulo: titulo.trim() || "Sem título",
        descricao: descricao.trim() || null,
      })
      .eq("id", modulo.id);
    setSavingMod(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else {
      toast({ title: "Módulo salvo" });
      onChange();
    }
  };

  const addAula = async () => {
    const { error } = await supabase.from("curso_aulas").insert({
      modulo_id: modulo.id,
      titulo: "Nova aula",
      ordem: aulas.length,
    });
    if (error) toast({ title: "Erro", description: error.message });
    else loadAulas();
  };

  const removeAula = async (id: string) => {
    if (!confirm("Remover esta aula? As apostilas associadas também serão removidas.")) return;
    const { error } = await supabase.from("curso_aulas").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      toast({ title: "Aula removida" });
      loadAulas();
    }
  };

  const moveAula = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= aulas.length) return;
    const a = aulas[idx];
    const b = aulas[target];
    const next = [...aulas];
    next[idx] = { ...b, ordem: a.ordem };
    next[target] = { ...a, ordem: b.ordem };
    setAulas(next.sort((x, y) => x.ordem - y.ordem));
    await Promise.all([
      supabase.from("curso_aulas").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("curso_aulas").update({ ordem: a.ordem }).eq("id", b.id),
    ]);
    loadAulas();
  };

  return (
    <CursoIdContext.Provider value={cursoId}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold italic text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5" /> Módulo: {modulo.titulo}
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading italic">Dados do módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={salvarModulo} disabled={savingMod}>
                {savingMod ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar módulo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading italic flex items-center gap-2">
              <VideoIcon className="w-4 h-4" /> Aulas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : aulas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma aula ainda.</p>
            ) : (
              aulas.map((a, idx) => (
                <AulaEditor
                  key={a.id}
                  aula={a}
                  onChange={loadAulas}
                  onRemove={() => removeAula(a.id)}
                  onMove={(d) => moveAula(idx, d)}
                  podeSubir={idx > 0}
                  podeDescer={idx < aulas.length - 1}
                />
              ))
            )}
            <Button variant="outline" onClick={addAula}>
              <Plus className="w-4 h-4" /> Adicionar aula
            </Button>
          </CardContent>
        </Card>
      </div>
    </CursoIdContext.Provider>
  );
};

// ============= EDITAR CURSO =============
const EditarCurso = ({
  curso,
  onBack,
  onChange,
}: {
  curso: Curso;
  onBack: () => void;
  onChange: () => void;
}) => {
  const [titulo, setTitulo] = useState(curso.titulo);
  const [slug, setSlug] = useState(curso.slug);
  const [descricao, setDescricao] = useState(curso.descricao ?? "");
  const [capaUrl, setCapaUrl] = useState(curso.capa_url ?? "");
  const [savingCurso, setSavingCurso] = useState(false);
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [slugTouched, setSlugTouched] = useState(true);

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState<Modulo | null>(null);

  const loadModulos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("curso_modulos")
      .select("*")
      .eq("curso_id", curso.id)
      .order("ordem", { ascending: true });
    setModulos((data ?? []) as Modulo[]);
    setLoading(false);
  }, [curso.id]);

  useEffect(() => {
    loadModulos();
  }, [loadModulos]);

  const onTituloChange = (v: string) => {
    setTitulo(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const salvarCurso = async () => {
    setSavingCurso(true);
    const { error } = await supabase
      .from("cursos")
      .update({
        titulo: titulo.trim() || "Sem título",
        slug: slug.trim() || slugify(titulo),
        descricao: descricao.trim() || null,
        capa_url: capaUrl || null,
      })
      .eq("id", curso.id);
    setSavingCurso(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else {
      toast({ title: "Curso salvo" });
      onChange();
    }
  };

  const handleUploadCapa = async (file: File) => {
    setUploadingCapa(true);
    const opt = await optimizeImageToWebP(file, { maxWidth: 1280, quality: 0.85 });
    const safeName = opt.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `cursos/${curso.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET_CAPA).upload(path, opt.file, {
      upsert: false,
      contentType: opt.file.type || "image/webp",
    });
    if (error) {
      toast({ title: "Erro no upload", description: error.message });
      setUploadingCapa(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKET_CAPA).getPublicUrl(path);
    const url = data.publicUrl;
    setCapaUrl(url);
    const { error: upErr } = await supabase
      .from("cursos")
      .update({ capa_url: url })
      .eq("id", curso.id);
    setUploadingCapa(false);
    if (upErr) toast({ title: "Erro ao salvar capa", description: upErr.message });
    else {
      toast({ title: "Capa enviada" });
      onChange();
    }
  };

  const addModulo = async () => {
    const { error } = await supabase.from("curso_modulos").insert({
      curso_id: curso.id,
      titulo: "Novo módulo",
      ordem: modulos.length,
    });
    if (error) toast({ title: "Erro", description: error.message });
    else loadModulos();
  };

  const removeModulo = async (id: string) => {
    if (!confirm("Remover este módulo? Todas as aulas/apostilas associadas serão removidas."))
      return;
    const { error } = await supabase.from("curso_modulos").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      toast({ title: "Módulo removido" });
      loadModulos();
    }
  };

  const moveModulo = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= modulos.length) return;
    const a = modulos[idx];
    const b = modulos[target];
    const next = [...modulos];
    next[idx] = { ...b, ordem: a.ordem };
    next[target] = { ...a, ordem: b.ordem };
    setModulos(next.sort((x, y) => x.ordem - y.ordem));
    await Promise.all([
      supabase.from("curso_modulos").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("curso_modulos").update({ ordem: a.ordem }).eq("id", b.id),
    ]);
    loadModulos();
  };

  if (selectedMod) {
    return (
      <EditarModulo
        modulo={selectedMod}
        cursoId={curso.id}
        onBack={() => {
          setSelectedMod(null);
          loadModulos();
        }}
        onChange={loadModulos}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <h1 className="text-xl font-heading font-bold italic text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> {curso.titulo}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading italic">Dados do curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Capa</Label>
            {capaUrl ? (
              <img
                src={capaUrl}
                alt="Capa"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
              />
            ) : (
              <div className="w-full max-w-md h-48 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <label className="inline-flex">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadCapa(f);
                  e.target.value = "";
                }}
              />
              <span
                className={`inline-flex items-center gap-2 text-sm px-3 h-9 rounded-md border border-input bg-background hover:bg-accent cursor-pointer ${uploadingCapa ? "opacity-60 pointer-events-none" : ""}`}
              >
                {uploadingCapa ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {capaUrl ? "Substituir capa" : "Enviar capa"}
              </span>
            </label>
          </div>

          <div className="space-y-1">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => onTituloChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="meu-curso"
            />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={salvarCurso} disabled={savingCurso}>
              {savingCurso ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar curso
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading italic flex items-center gap-2">
            <Layers className="w-4 h-4" /> Módulos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : modulos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum módulo ainda.</p>
          ) : (
            <div className="space-y-2">
              {modulos.map((m, idx) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-border p-3 bg-card flex items-center gap-2"
                >
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModulo(idx, -1)}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModulo(idx, 1)}
                      disabled={idx === modulos.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedMod(m)}
                  >
                    <p className="font-medium text-sm truncate">{m.titulo}</p>
                    {m.descricao && (
                      <p className="text-xs text-muted-foreground truncate">{m.descricao}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMod(m)}>
                    editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeModulo(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" onClick={addModulo}>
            <Plus className="w-4 h-4" /> Adicionar módulo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= PÁGINA RAIZ =============
const AdminCursos = () => {
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selected, setSelected] = useState<Curso | null>(null);
  const [criando, setCriando] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cursos")
      .select("*")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    setCursos((data ?? []) as Curso[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleBack = () => {
    setSelected(null);
    loadAll();
  };

  const refreshSelected = useCallback(async () => {
    if (!selected) return;
    const { data } = await supabase
      .from("cursos")
      .select("*")
      .eq("id", selected.id)
      .maybeSingle();
    if (data) setSelected(data as Curso);
    loadAll();
  }, [selected, loadAll]);

  const toggleAtivo = async (c: Curso, value: boolean) => {
    setCursos((prev) => prev.map((x) => (x.id === c.id ? { ...x, ativo: value } : x)));
    const { error } = await supabase.from("cursos").update({ ativo: value }).eq("id", c.id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message });
      setCursos((prev) => prev.map((x) => (x.id === c.id ? { ...x, ativo: !value } : x)));
    } else {
      toast({ title: value ? "Curso ativado" : "Curso desativado" });
    }
  };

  const novoCurso = async () => {
    setCriando(true);
    const baseTitulo = "Novo curso";
    const baseSlug = `${slugify(baseTitulo)}-${Date.now()}`;
    const { data, error } = await supabase
      .from("cursos")
      .insert({
        titulo: baseTitulo,
        slug: baseSlug,
        ordem: cursos.length,
        ativo: false,
      })
      .select("*")
      .maybeSingle();
    setCriando(false);
    if (error || !data) {
      toast({ title: "Erro ao criar", description: error?.message });
      return;
    }
    toast({ title: "Curso criado" });
    setSelected(data as Curso);
    loadAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Cursos — Admin" description="Administração de cursos" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : selected ? (
          <EditarCurso curso={selected} onBack={handleBack} onChange={refreshSelected} />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold italic text-foreground">Cursos</h1>
            </div>
            <ListaCursos
              cursos={cursos}
              onSelect={setSelected}
              onToggleAtivo={toggleAtivo}
              onNovo={novoCurso}
              criando={criando}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCursos;
