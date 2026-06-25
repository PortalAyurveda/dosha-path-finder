import { useCallback, useEffect, useMemo, useState } from "react";
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
  GraduationCap,
  FileText,
  Video as VideoIcon,
  Link2,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Pin,
  PinOff,
  Upload,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatModuloFimDeSemana, formatModuloHorarios } from "@/lib/escolaModuloDatas";

const BUCKET = "escola";

type Modulo = {
  id: string;
  numero: number;
  semestre: number | null;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  video_url: string | null;
  zoom_url: string | null;
  slides_url: string | null;
  apostila_url: string | null;
  turma_id: string | null;
};

type Recurso = {
  id: string;
  modulo_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  url: string | null;
  ordem: number | null;
};

type Pergunta = {
  id: string;
  modulo_id: string;
  pergunta: string;
  ordem: number | null;
};

type Recado = {
  id: string;
  turma_id: string;
  titulo: string | null;
  conteudo: string;
  fixado: boolean | null;
  created_at: string | null;
};

const RECURSO_GROUPS: { tipo: string; label: string }[] = [
  { tipo: "video_recomendado", label: "Vídeos recomendados" },
  { tipo: "cardapio", label: "Cardápio prático" },
  { tipo: "dinacharya", label: "Rotina de dinacharya" },
  { tipo: "experiencia", label: "Experiências vivenciais" },
];

const SEMESTRES: { num: number; titulo: string; subtitulo: string }[] = [
  { num: 1, titulo: "Semestre 1", subtitulo: "Fundamentos (1–5)" },
  { num: 2, titulo: "Semestre 2", subtitulo: "Aprofundamento (6–10)" },
  { num: 3, titulo: "Semestre 3", subtitulo: "Especialização (11–15)" },
];

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

// ============ TELA 1: Lista de módulos + recados ============
const ListaModulos = ({
  modulos,
  recursosCount,
  perguntasCount,
  onSelect,
}: {
  modulos: Modulo[];
  recursosCount: Record<string, number>;
  perguntasCount: Record<string, number>;
  onSelect: (m: Modulo) => void;
}) => {
  return (
    <div className="space-y-10">
      {SEMESTRES.map((s) => {
        const itens = modulos.filter((m) => (m.semestre ?? 0) === s.num);
        return (
          <section key={s.num} className="space-y-3">
            <div>
              <h2 className="text-xl font-heading font-bold italic text-foreground">{s.titulo}</h2>
              <p className="text-sm text-muted-foreground">{s.subtitulo}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {itens.map((m) => {
                const nRec = recursosCount[m.id] ?? 0;
                const nPerg = perguntasCount[m.id] ?? 0;
                const check = (ok: boolean) => (ok ? "✓" : "✗");
                return (
                  <Card
                    key={m.id}
                    onClick={() => onSelect(m)}
                    className="cursor-pointer hover:border-primary transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {m.numero}
                          </span>
                          <CardTitle className="text-base font-heading leading-tight">{m.titulo}</CardTitle>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-0.5">
                        <p className="text-xs text-foreground/80">{formatModuloFimDeSemana(m.data_inicio)}</p>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                          <span>{formatModuloHorarios(m.tipo)}</span>
                          {m.tipo === "presencial" && (
                            <Badge variant="secondary" className="text-[10px]">Presencial</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vídeo {check(!!m.video_url)} · apostila {check(!!m.apostila_url)} · zoom {check(!!m.zoom_url)} · {nRec} recursos · {nPerg} perguntas
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const RecadosBlock = ({ turmaId }: { turmaId: string | null }) => {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [fixado, setFixado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!turmaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("escola_recados")
      .select("*")
      .eq("turma_id", turmaId)
      .order("fixado", { ascending: false })
      .order("created_at", { ascending: false });
    setRecados((data ?? []) as Recado[]);
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setTitulo("");
    setConteudo("");
    setFixado(false);
    setEditingId(null);
  };

  const submit = async () => {
    if (!turmaId) return;
    if (!conteudo.trim()) {
      toast({ title: "Escreva o conteúdo do recado." });
      return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await supabase
        .from("escola_recados")
        .update({ titulo: titulo.trim() || null, conteudo: conteudo.trim(), fixado })
        .eq("id", editingId);
      if (error) toast({ title: "Erro ao salvar", description: error.message });
      else toast({ title: "Recado atualizado" });
    } else {
      const { error } = await supabase
        .from("escola_recados")
        .insert({ turma_id: turmaId, titulo: titulo.trim() || null, conteudo: conteudo.trim(), fixado });
      if (error) toast({ title: "Erro ao salvar", description: error.message });
      else toast({ title: "Recado publicado" });
    }
    setSaving(false);
    reset();
    load();
  };

  const editar = (r: Recado) => {
    setEditingId(r.id);
    setTitulo(r.titulo ?? "");
    setConteudo(r.conteudo);
    setFixado(!!r.fixado);
  };

  const remover = async (id: string) => {
    if (!confirm("Remover este recado?")) return;
    const { error } = await supabase.from("escola_recados").delete().eq("id", id);
    if (error) toast({ title: "Erro ao remover", description: error.message });
    else {
      toast({ title: "Recado removido" });
      load();
    }
  };

  const togglePin = async (r: Recado) => {
    const { error } = await supabase
      .from("escola_recados")
      .update({ fixado: !r.fixado })
      .eq("id", r.id);
    if (!error) load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading italic flex items-center gap-2">
          <Pin className="w-4 h-4" /> Recados da turma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!turmaId ? (
          <p className="text-sm text-muted-foreground">Nenhuma turma ativa.</p>
        ) : (
          <>
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="recado-titulo">Título (opcional)</Label>
                <Input
                  id="recado-titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex.: Aula 5 confirmada"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recado-conteudo">Recado</Label>
                <Textarea
                  id="recado-conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva o recado para a turma…"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Switch id="fixar" checked={fixado} onCheckedChange={setFixado} />
                  <Label htmlFor="fixar" className="cursor-pointer">Fixar no topo</Label>
                </div>
                <div className="flex gap-2">
                  {editingId && (
                    <Button variant="outline" size="sm" onClick={reset}>Cancelar</Button>
                  )}
                  <Button size="sm" onClick={submit} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? "Atualizar" : "Publicar"}
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : recados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum recado publicado.</p>
            ) : (
              <div className="space-y-2">
                {recados.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3 bg-card flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.fixado && <Badge variant="secondary" className="text-[10px]">fixado</Badge>}
                        {r.titulo && <span className="font-medium text-sm">{r.titulo}</span>}
                        <span className="text-[11px] text-muted-foreground">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap mt-1">{r.conteudo}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm" onClick={() => togglePin(r)}>
                        {r.fixado ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => editar(r)}>editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => remover(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============ TELA 2: Editar módulo ============
const EditarModulo = ({
  modulo,
  onBack,
  onChange,
}: {
  modulo: Modulo;
  onBack: () => void;
  onChange: () => void;
}) => {
  const [videoUrl, setVideoUrl] = useState(modulo.video_url ?? "");
  const [zoomUrl, setZoomUrl] = useState(modulo.zoom_url ?? "");
  const [slidesUrl, setSlidesUrl] = useState(modulo.slides_url ?? "");
  const [apostilaPath, setApostilaPath] = useState(modulo.apostila_url ?? "");
  const [apostilaSignedUrl, setApostilaSignedUrl] = useState<string | null>(null);
  const [uploadingApostila, setUploadingApostila] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);

  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [recRes, perRes] = await Promise.all([
      supabase.from("escola_modulo_recursos").select("*").eq("modulo_id", modulo.id).order("ordem", { ascending: true }),
      supabase.from("escola_avaliacao_perguntas").select("*").eq("modulo_id", modulo.id).order("ordem", { ascending: true }),
    ]);
    setRecursos((recRes.data ?? []) as Recurso[]);
    setPerguntas((perRes.data ?? []) as Pergunta[]);
    setLoading(false);
  }, [modulo.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Signed URL da apostila atual
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!apostilaPath) {
        setApostilaSignedUrl(null);
        return;
      }
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(apostilaPath, 60 * 60);
      if (!cancelled) setApostilaSignedUrl(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [apostilaPath]);

  const handleUploadApostila = async (file: File) => {
    setUploadingApostila(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `modulo-${modulo.numero}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type || "application/pdf",
    });
    if (error) {
      toast({ title: "Erro no upload", description: error.message });
      setUploadingApostila(false);
      return;
    }
    // Remove a apostila antiga se houver
    if (apostilaPath) {
      await supabase.storage.from(BUCKET).remove([apostilaPath]);
    }
    const { error: upErr } = await supabase
      .from("escola_modulos")
      .update({ apostila_url: path })
      .eq("id", modulo.id);
    if (upErr) {
      toast({ title: "Erro ao salvar apostila", description: upErr.message });
    } else {
      setApostilaPath(path);
      toast({ title: "Apostila enviada" });
      onChange();
    }
    setUploadingApostila(false);
  };

  const salvarMaterial = async () => {
    setSavingMaterial(true);
    const { error } = await supabase
      .from("escola_modulos")
      .update({
        video_url: videoUrl.trim() || null,
        zoom_url: zoomUrl.trim() || null,
        slides_url: slidesUrl.trim() || null,
      })
      .eq("id", modulo.id);
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else {
      toast({ title: "Material salvo" });
      onChange();
    }
    setSavingMaterial(false);
  };

  // Recursos
  const addRecurso = async (tipo: string) => {
    const ordem = recursos.filter((r) => r.tipo === tipo).length;
    const { error } = await supabase.from("escola_modulo_recursos").insert({
      modulo_id: modulo.id,
      tipo,
      titulo: "Novo item",
      ordem,
    });
    if (error) toast({ title: "Erro", description: error.message });
    else loadAll();
  };

  const updateRecurso = async (id: string, patch: Partial<Recurso>) => {
    setRecursos((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const persistRecurso = async (r: Recurso) => {
    const { error } = await supabase
      .from("escola_modulo_recursos")
      .update({ titulo: r.titulo, descricao: r.descricao, url: r.url, ordem: r.ordem })
      .eq("id", r.id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      onChange();
    }
  };

  const removeRecurso = async (id: string) => {
    if (!confirm("Remover este item?")) return;
    const { error } = await supabase.from("escola_modulo_recursos").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      loadAll();
      onChange();
    }
  };

  // Perguntas
  const addPergunta = async () => {
    const { error } = await supabase.from("escola_avaliacao_perguntas").insert({
      modulo_id: modulo.id,
      pergunta: "Nova pergunta",
      ordem: perguntas.length,
    });
    if (error) toast({ title: "Erro", description: error.message });
    else loadAll();
  };

  const updatePergunta = (id: string, patch: Partial<Pergunta>) => {
    setPerguntas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const persistPergunta = async (p: Pergunta) => {
    const { error } = await supabase
      .from("escola_avaliacao_perguntas")
      .update({ pergunta: p.pergunta, ordem: p.ordem })
      .eq("id", p.id);
    if (error) toast({ title: "Erro", description: error.message });
    else onChange();
  };

  const removePergunta = async (id: string) => {
    if (!confirm("Remover esta pergunta?")) return;
    const { error } = await supabase.from("escola_avaliacao_perguntas").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      loadAll();
      onChange();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold italic text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Módulo {modulo.numero}: {modulo.titulo}
            </h1>
            <p className="text-xs text-foreground/80">
              {formatModuloFimDeSemana(modulo.data_inicio)} · {modulo.tipo === "presencial" ? "Presencial" : "Online"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatModuloHorarios(modulo.tipo)}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Material */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading italic flex items-center gap-2">
            <VideoIcon className="w-4 h-4" /> Material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="video">URL do vídeo (YouTube — link não-listado)</Label>
            <Input id="video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="zoom">URL do Zoom (sala da aula ao vivo)</Label>
            <Input id="zoom" value={zoomUrl} onChange={(e) => setZoomUrl(e.target.value)} placeholder="https://us02web.zoom.us/…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slides">URL dos slides (opcional)</Label>
            <Input id="slides" value={slidesUrl} onChange={(e) => setSlidesUrl(e.target.value)} placeholder="https://…" />
          </div>

          <div className="space-y-2">
            <Label>Apostila (PDF)</Label>
            {apostilaPath ? (
              <div className="flex items-center gap-3 flex-wrap rounded-lg border border-border p-3 bg-muted/30">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm truncate flex-1 min-w-0">{apostilaPath.split("/").pop()}</span>
                {apostilaSignedUrl && (
                  <a href={apostilaSignedUrl} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
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
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadApostila(f);
                  e.target.value = "";
                }}
              />
              <span className={`inline-flex items-center gap-2 text-sm px-3 h-9 rounded-md border border-input bg-background hover:bg-accent cursor-pointer ${uploadingApostila ? "opacity-60 pointer-events-none" : ""}`}>
                {uploadingApostila ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {apostilaPath ? "Substituir apostila" : "Enviar apostila"}
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={salvarMaterial} disabled={savingMaterial}>
              {savingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar material
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Recursos do módulo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading italic flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Recursos do módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            RECURSO_GROUPS.map((g) => {
              const itens = recursos.filter((r) => r.tipo === g.tipo);
              return (
                <div key={g.tipo} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-foreground">{g.label}</h3>
                    <Button size="sm" variant="outline" onClick={() => addRecurso(g.tipo)}>
                      <Plus className="w-4 h-4" /> adicionar
                    </Button>
                  </div>
                  {itens.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nada por aqui ainda.</p>
                  ) : (
                    <div className="space-y-2">
                      {itens.map((r) => (
                        <div key={r.id} className="rounded-lg border border-border p-3 bg-card space-y-2">
                          <Input
                            value={r.titulo}
                            onChange={(e) => updateRecurso(r.id, { titulo: e.target.value })}
                            onBlur={() => persistRecurso(r)}
                            placeholder="Título"
                          />
                          <Textarea
                            value={r.descricao ?? ""}
                            onChange={(e) => updateRecurso(r.id, { descricao: e.target.value })}
                            onBlur={() => persistRecurso(r)}
                            placeholder="Descrição (opcional)"
                            rows={2}
                          />
                          <div className="flex gap-2 items-center">
                            <Link2 className="w-4 h-4 text-muted-foreground" />
                            <Input
                              value={r.url ?? ""}
                              onChange={(e) => updateRecurso(r.id, { url: e.target.value })}
                              onBlur={() => persistRecurso(r)}
                              placeholder="URL (opcional)"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeRecurso(r.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 3. Autoavaliação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading italic flex items-center gap-2">
            <FileText className="w-4 h-4" /> Autoavaliação (perguntas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Estas são perguntas de reflexão. As respostas dos alunos são privadas — você não as vê. Aqui você só define as perguntas.
          </p>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : perguntas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pergunta cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {perguntas.map((p, idx) => (
                <div key={p.id} className="rounded-lg border border-border p-3 bg-card flex items-start gap-2">
                  <span className="text-sm text-muted-foreground mt-2 w-6 text-right tabular-nums">{idx + 1}.</span>
                  <Textarea
                    value={p.pergunta}
                    onChange={(e) => updatePergunta(p.id, { pergunta: e.target.value })}
                    onBlur={() => persistPergunta(p)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removePergunta(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div>
            <Button size="sm" variant="outline" onClick={addPergunta}>
              <Plus className="w-4 h-4" /> adicionar pergunta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============ PÁGINA RAIZ ============
const AdminEscola = () => {
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [recursosCount, setRecursosCount] = useState<Record<string, number>>({});
  const [perguntasCount, setPerguntasCount] = useState<Record<string, number>>({});
  const [turmaAtivaId, setTurmaAtivaId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Modulo | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [turmaRes, modulosRes, recursosRes, perguntasRes] = await Promise.all([
      supabase.from("escola_turmas").select("id").eq("ativo", true).limit(1).maybeSingle(),
      supabase
        .from("escola_modulos")
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,video_url,zoom_url,slides_url,apostila_url,turma_id")
        .order("numero", { ascending: true }),
      supabase.from("escola_modulo_recursos").select("modulo_id"),
      supabase.from("escola_avaliacao_perguntas").select("modulo_id"),
    ]);

    setTurmaAtivaId((turmaRes.data?.id as string | undefined) ?? null);
    const mods = (modulosRes.data ?? []) as Modulo[];
    setModulos(mods);

    const rc: Record<string, number> = {};
    (recursosRes.data ?? []).forEach((r: any) => {
      rc[r.modulo_id] = (rc[r.modulo_id] ?? 0) + 1;
    });
    setRecursosCount(rc);

    const pc: Record<string, number> = {};
    (perguntasRes.data ?? []).forEach((r: any) => {
      pc[r.modulo_id] = (pc[r.modulo_id] ?? 0) + 1;
    });
    setPerguntasCount(pc);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Quando volta para a lista, recarrega para refletir mudanças
  const handleBack = () => {
    setSelected(null);
    loadAll();
  };

  // Recarrega o módulo selecionado se algo mudar
  const refreshSelected = useCallback(async () => {
    if (!selected) return;
    const { data } = await supabase
      .from("escola_modulos")
      .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,video_url,zoom_url,slides_url,apostila_url,turma_id")
      .eq("id", selected.id)
      .maybeSingle();
    if (data) setSelected(data as Modulo);
    loadAll();
  }, [selected, loadAll]);

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Escola — Admin" description="Administração da Formação em Ayurveda" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {selected ? (
          <EditarModulo modulo={selected} onBack={handleBack} onChange={refreshSelected} />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold italic text-foreground">Escola</h1>
            </div>
            <RecadosBlock turmaId={turmaAtivaId} />
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : modulos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum módulo cadastrado.</p>
            ) : (
              <ListaModulos
                modulos={modulos}
                recursosCount={recursosCount}
                perguntasCount={perguntasCount}
                onSelect={setSelected}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminEscola;
