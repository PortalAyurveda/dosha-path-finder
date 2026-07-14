import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, FileText, PlayCircle, Sparkles } from "lucide-react";

interface Curso {
  id: string;
  slug: string;
  titulo: string;
}
interface Modulo {
  id: string;
  titulo: string;
  ordem: number;
}
interface Aula {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao: string | null;
  youtube_url: string | null;
  duracao_segundos: number | null;
  ordem: number;
}
interface Material {
  id: string;
  aula_id: string;
  titulo: string;
  url: string | null;
  tipo: string;
}

const extractYoutubeId = (url: string | null): string | null => {
  if (!url) return null;
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
    /* noop */
  }
  return null;
};

const fmtDur = (s: number | null) => {
  if (!s) return "";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
};

const EscolaCurso = () => {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [semAcesso, setSemAcesso] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [concluida, setConcluida] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      setLoading(true);
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo")
        .eq("slug", slug)
        .maybeSingle();
      if (!c) {
        setLoading(false);
        return;
      }
      setCurso(c as Curso);

      const { data: mat } = await supabase
        .from("curso_matriculas")
        .select("id")
        .eq("curso_id", (c as Curso).id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mat) {
        setSemAcesso(true);
        setLoading(false);
        return;
      }

      const { data: mods } = await supabase
        .from("curso_modulos")
        .select("id,titulo,ordem")
        .eq("curso_id", (c as Curso).id)
        .order("ordem", { ascending: true });
      const moduloList = (mods ?? []) as Modulo[];
      setModulos(moduloList);

      const moduloIds = moduloList.map((m) => m.id);
      const [{ data: aulasData }, { data: prog }] = await Promise.all([
        moduloIds.length
          ? supabase
              .from("curso_aulas")
              .select("id,modulo_id,titulo,descricao,youtube_url,duracao_segundos,ordem")
              .in("modulo_id", moduloIds)
              .order("ordem", { ascending: true })
          : Promise.resolve({ data: [] as any[] }),
        supabase.from("curso_aula_progresso").select("aula_id").eq("user_id", user.id),
      ]);
      const aulaList = (aulasData ?? []) as Aula[];
      setAulas(aulaList);
      const done = new Set((prog ?? []).map((p: any) => p.aula_id));
      setConcluidas(done);

      const aulaIds = aulaList.map((a) => a.id);
      if (aulaIds.length) {
        const { data: mats } = await supabase
          .from("curso_materiais")
          .select("id,aula_id,titulo,url,tipo")
          .in("aula_id", aulaIds)
          .order("ordem", { ascending: true });
        setMateriais((mats ?? []) as Material[]);
      }

      const paramAula = searchParams.get("aula");
      const initial =
        (paramAula && aulaList.find((a) => a.id === paramAula)?.id) ||
        aulaList.find((a) => !done.has(a.id))?.id ||
        aulaList[0]?.id ||
        null;
      setActiveId(initial);
      if (aulaList.length && aulaList.every((a) => done.has(a.id))) {
        setConcluida(true);
      }
      setLoading(false);
    })();
  }, [slug, user, authLoading]);

  const aulasPorModulo = useMemo(() => {
    const map = new Map<string, Aula[]>();
    for (const a of aulas) {
      if (!map.has(a.modulo_id)) map.set(a.modulo_id, []);
      map.get(a.modulo_id)!.push(a);
    }
    return map;
  }, [aulas]);

  const activeAula = aulas.find((a) => a.id === activeId) ?? null;
  const activeMateriais = materiais.filter((m) => m.aula_id === activeId);
  const totalAulas = aulas.length;
  const pct = totalAulas ? Math.round((concluidas.size / totalAulas) * 100) : 0;

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSearchParams({ aula: id }, { replace: true });
  };

  const handleConcluir = async () => {
    if (!activeAula || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("curso_aula_progresso")
        .upsert(
          { aula_id: activeAula.id, user_id: user.id },
          { onConflict: "user_id,aula_id" },
        );
      if (error) throw error;
      const newDone = new Set(concluidas);
      newDone.add(activeAula.id);
      setConcluidas(newDone);
      const idx = aulas.findIndex((a) => a.id === activeAula.id);
      const proxima = aulas.slice(idx + 1).find((a) => !newDone.has(a.id));
      if (proxima) {
        handleSelect(proxima.id);
        toast.success("Aula concluída ✓");
      } else if (aulas.every((a) => newDone.has(a.id))) {
        setConcluida(true);
        toast.success("Curso concluído! 🌿");
      } else {
        const primeiroPendente = aulas.find((a) => !newDone.has(a.id));
        if (primeiroPendente) handleSelect(primeiroPendente.id);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar progresso");
    } finally {
      setSaving(false);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to={`/entrar?redirect=/escola/curso/${slug}`} replace />;
  }
  if (!loading && semAcesso) {
    return <Navigate to={`/cursos/${slug}`} replace />;
  }
  if (loading || !curso) {
    return (
      <PageContainer title="Carregando curso…" description="">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-1/2 bg-muted/40 animate-pulse rounded" />
          <div className="h-64 bg-muted/40 animate-pulse rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  const videoId = extractYoutubeId(activeAula?.youtube_url ?? null);
  const activeConcluida = activeAula ? concluidas.has(activeAula.id) : false;

  return (
    <PageContainer
      title={`${curso.titulo} — Escola`}
      description={`Sala de estudo: ${curso.titulo}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <Link
                to="/escola"
                className="text-xs text-muted-foreground hover:underline"
              >
                ← Escola
              </Link>
              <h1 className="mt-1">{curso.titulo}</h1>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm text-muted-foreground">
                {concluidas.size}/{totalAulas} · {pct}%
              </div>
            </div>
          </div>
          <Progress value={pct} className="h-2" />
        </header>

        {concluida && (
          <div className="mb-6 rounded-xl bg-primary/10 border border-primary/30 p-6 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <h3 className="mb-1">Você chegou ao fim.</h3>
            <p className="text-sm text-muted-foreground">
              Que o que aprendeu vire gesto, cuidado e presença no seu dia. 🌿
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* PLAYER (aparece primeiro no mobile) */}
          <section className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1 space-y-4">
            {activeAula ? (
              <>
                {videoId ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={activeAula.titulo}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Vídeo indisponível
                  </div>
                )}
                <div>
                  <h2 className="mb-2 text-xl">{activeAula.titulo}</h2>
                  {activeAula.descricao && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {activeAula.descricao}
                    </p>
                  )}
                </div>

                {activeMateriais.length > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="text-sm font-semibold mb-2">Materiais da aula</h4>
                    <ul className="space-y-1.5">
                      {activeMateriais.map((m) => (
                        <li key={m.id}>
                          <a
                            href={m.url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            {m.titulo}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleConcluir} disabled={saving}>
                    {activeConcluida
                      ? "Ir para a próxima"
                      : "Concluir aula e ir para a próxima"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-muted/40 p-10 text-center text-muted-foreground">
                Selecione uma aula na lista.
              </div>
            )}
          </section>

          {/* LISTA */}
          <aside className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1 space-y-4">
            {modulos.map((m, i) => {
              const list = aulasPorModulo.get(m.id) ?? [];
              return (
                <div key={m.id} className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted/40 px-3 py-2 text-sm font-semibold">
                    {String(i + 1).padStart(2, "0")} · {m.titulo}
                  </div>
                  <ul>
                    {list.map((a) => {
                      const done = concluidas.has(a.id);
                      const isActive = a.id === activeId;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => handleSelect(a.id)}
                            className={`w-full text-left px-3 py-2 flex items-start gap-2 text-sm border-t border-border/60 hover:bg-muted/40 transition ${
                              isActive ? "bg-primary/10" : ""
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {done ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                            <span className="flex-1">
                              <span
                                className={`block ${
                                  done ? "text-muted-foreground line-through" : ""
                                }`}
                              >
                                {a.titulo}
                              </span>
                              {a.duracao_segundos ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {fmtDur(a.duracao_segundos)}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </PageContainer>
  );
};

export default EscolaCurso;
