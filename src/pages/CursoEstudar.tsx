import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { CheckCircle2, Circle, Lock, PlayCircle, Sparkles, ChevronLeft } from "lucide-react";

interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  ativo: boolean;
}
interface Modulo {
  id: string;
  titulo: string;
  ordem: number;
}
interface AulaBase {
  id: string;
  modulo_id: string;
  titulo: string;
  duracao_segundos: number | null;
  ordem: number;
}
interface AulaFull extends AulaBase {
  descricao: string | null;
  youtube_url: string | null;
}

const fmtDuracao = (s: number | null) => {
  if (!s) return "";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
};

const youtubeEmbed = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed${u.pathname}`;
    if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.pathname.startsWith("/embed/")) return url;
    if (u.pathname.startsWith("/shorts/"))
      return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    return url;
  } catch {
    return url;
  }
};

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SURFACE = "#FFF8EE";

const CursoEstudar = () => {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<AulaFull[]>([]);
  const [temAcesso, setTemAcesso] = useState<boolean>(false);
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      setLoading(true);
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo,descricao,capa_url,ativo")
        .eq("slug", slug)
        .maybeSingle();
      if (!c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCurso(c as Curso);

      let acesso = false;
      if (user) {
        const { data: rpc } = await supabase.rpc("tem_acesso_curso", { p_curso_id: (c as Curso).id });
        acesso = !!rpc;
      }
      setTemAcesso(acesso);

      const { data: mods } = await supabase
        .from("curso_modulos")
        .select("id,titulo,ordem")
        .eq("curso_id", (c as Curso).id)
        .order("ordem", { ascending: true });
      const modulosOk = (mods as Modulo[]) ?? [];
      setModulos(modulosOk);

      if (modulosOk.length > 0) {
        if (acesso) {
          const { data: fullAulas } = await supabase
            .from("curso_aulas")
            .select("id,modulo_id,titulo,descricao,youtube_url,duracao_segundos,ordem")
            .in(
              "modulo_id",
              modulosOk.map((m) => m.id),
            )
            .order("ordem", { ascending: true });
          setAulas(((fullAulas as unknown) as AulaFull[]) ?? []);
        } else {
          const { data: idx } = await supabase
            .from("curso_aulas_indice" as any)
            .select("id,modulo_id,titulo,duracao_segundos,ordem")
            .in(
              "modulo_id",
              modulosOk.map((m) => m.id),
            )
            .order("ordem", { ascending: true });
          setAulas(
            ((idx as unknown) as AulaBase[] ?? []).map((a) => ({
              ...a,
              descricao: null,
              youtube_url: null,
            })),
          );
        }
      }

      if (user && acesso) {
        const { data: prog } = await supabase
          .from("curso_aula_progresso")
          .select("aula_id")
          .eq("user_id", user.id);
        setConcluidas(new Set((prog ?? []).map((p: any) => p.aula_id)));
      }

      setLoading(false);
    })();
  }, [slug, user, authLoading]);

  const aulasOrdenadas = useMemo(() => {
    const byMod = new Map<string, AulaFull[]>();
    for (const a of aulas) {
      if (!byMod.has(a.modulo_id)) byMod.set(a.modulo_id, []);
      byMod.get(a.modulo_id)!.push(a);
    }
    return modulos.flatMap((m) => byMod.get(m.id) ?? []);
  }, [aulas, modulos]);

  const totalAulas = aulasOrdenadas.length;
  const totalConcluidas = aulasOrdenadas.filter((a) => concluidas.has(a.id)).length;
  const pct = totalAulas ? Math.round((totalConcluidas / totalAulas) * 100) : 0;

  const aulaSelecionadaId = searchParams.get("aula") ?? aulasOrdenadas[0]?.id ?? null;
  const aulaAtual = useMemo(
    () => aulasOrdenadas.find((a) => a.id === aulaSelecionadaId) ?? null,
    [aulasOrdenadas, aulaSelecionadaId],
  );

  const selecionarAula = (id: string) => {
    setSearchParams((sp) => {
      const s = new URLSearchParams(sp);
      s.set("aula", id);
      return s;
    });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(
        () => document.getElementById("player-aula")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  };

  const marcarConcluida = async () => {
    if (!aulaAtual || !user) return;
    const jaFeita = concluidas.has(aulaAtual.id);
    setSalvando(true);
    try {
      if (jaFeita) {
        const { error } = await supabase
          .from("curso_aula_progresso")
          .delete()
          .eq("user_id", user.id)
          .eq("aula_id", aulaAtual.id);
        if (error) throw error;
        const nova = new Set(concluidas);
        nova.delete(aulaAtual.id);
        setConcluidas(nova);
        toast.success("Aula desmarcada");
      } else {
        const { error } = await supabase
          .from("curso_aula_progresso")
          .insert({ user_id: user.id, aula_id: aulaAtual.id });
        if (error) throw error;
        setConcluidas(new Set([...concluidas, aulaAtual.id]));
        toast.success("Aula concluída");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Não foi possível atualizar");
    } finally {
      setSalvando(false);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to={`/entrar?redirect=/cursos/${slug}/estudar`} replace />;
  }

  if (loading || authLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-6 w-1/2 bg-muted/40 rounded animate-pulse" />
      </main>
    );
  }
  if (notFound || !curso || !curso.ativo) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Curso não encontrado — Portal Ayurveda</title>
        </Helmet>
        <h1 className="mb-4">Curso não encontrado</h1>
        <Button asChild>
          <Link to="/cursos">Ver todos os cursos</Link>
        </Button>
      </main>
    );
  }

  const embedUrl = youtubeEmbed(aulaAtual?.youtube_url);

  return (
    <>
      <Helmet>
        <title>{curso.titulo} — Portal Ayurveda</title>
        <meta name="description" content={curso.descricao ?? ""} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Cabeçalho */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <Link
            to="/meu-perfil"
            className="inline-flex items-center gap-1 text-sm mb-4 opacity-70 hover:opacity-100"
            style={{ color: PRIMARY }}
          >
            <ChevronLeft className="h-4 w-4" /> voltar
          </Link>
          <div className="flex flex-col sm:flex-row gap-5 md:gap-8 items-start">
            {curso.capa_url && (
              <img
                src={getTransformedImageUrl(curso.capa_url, 480)}
                alt=""
                aria-hidden
                className="w-full sm:w-40 md:w-48 aspect-[4/3] object-cover rounded-2xl shadow-md shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1
                className="font-serif italic font-bold text-2xl md:text-3xl leading-tight mb-2"
                style={{ color: PRIMARY }}
              >
                {curso.titulo}
              </h1>
              {curso.descricao && (
                <p
                  className="text-sm md:text-base mb-4 leading-relaxed"
                  style={{ color: PRIMARY, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {curso.descricao}
                </p>
              )}
              {temAcesso && totalAulas > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs md:text-sm mb-1.5" style={{ color: PRIMARY }}>
                    <span className="font-medium">
                      {totalConcluidas} de {totalAulas} aulas concluídas
                    </span>
                    <span className="opacity-70">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-white/70">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, background: SALMAO }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {!temAcesso && (
          <div
            className="mb-8 rounded-2xl border-2 p-6 md:p-8 text-center"
            style={{ background: "#FBF3DE", borderColor: "#B8892E" }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "#8C641C" }} />
            <h2 className="font-serif font-bold text-xl md:text-2xl mb-2" style={{ color: PRIMARY }}>
              Este curso vem incluso no Premium Anual
            </h2>
            <p
              className="text-sm md:text-base mb-5 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
            >
              Assine o Premium Anual e abra este e todos os outros conteúdos do portal por um ano.
            </p>
            <Button asChild size="lg" className="rounded-full" style={{ backgroundColor: "#B8892E" }}>
              <Link to="/assinar">Ver planos</Link>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
          {/* Player + descrição */}
          <div id="player-aula" className="min-w-0 order-2 lg:order-1">
            {temAcesso && aulaAtual ? (
              <>
                {embedUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md">
                    <iframe
                      src={embedUrl}
                      title={aulaAtual.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-2xl bg-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Vídeo em breve</p>
                  </div>
                )}
                <div className="mt-5">
                  <h2 className="font-serif font-bold text-xl md:text-2xl mb-2" style={{ color: PRIMARY }}>
                    {aulaAtual.titulo}
                  </h2>
                  {aulaAtual.descricao && (
                    <p
                      className="text-sm md:text-base whitespace-pre-line leading-relaxed mb-5"
                      style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {aulaAtual.descricao}
                    </p>
                  )}
                  <Button
                    onClick={marcarConcluida}
                    disabled={salvando}
                    variant={concluidas.has(aulaAtual.id) ? "outline" : "default"}
                    className="rounded-full"
                  >
                    {concluidas.has(aulaAtual.id) ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Concluída — desmarcar
                      </>
                    ) : (
                      <>
                        <Circle className="mr-2 h-4 w-4" /> Marcar como concluída
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div
                className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center border-2 border-dashed"
                style={{ borderColor: `${PRIMARY}22`, background: SURFACE }}
              >
                <Lock className="w-8 h-8 mb-2" style={{ color: PRIMARY, opacity: 0.5 }} />
                <p className="text-sm" style={{ color: PRIMARY, opacity: 0.7 }}>
                  Conteúdo bloqueado
                </p>
              </div>
            )}
          </div>

          {/* Lista de módulos */}
          <aside className="order-1 lg:order-2">
            <div className="space-y-5">
              {modulos.map((m) => {
                const aulasMod = aulas
                  .filter((a) => a.modulo_id === m.id)
                  .sort((a, b) => a.ordem - b.ordem);
                return (
                  <div key={m.id}>
                    <h3
                      className="font-serif font-bold text-sm uppercase tracking-wider mb-2 px-1"
                      style={{ color: PRIMARY, opacity: 0.7 }}
                    >
                      {m.titulo}
                    </h3>
                    <ul className="space-y-1.5">
                      {aulasMod.map((a) => {
                        const feita = concluidas.has(a.id);
                        const ativa = a.id === aulaSelecionadaId;
                        return (
                          <li key={a.id}>
                            <button
                              onClick={() => temAcesso && selecionarAula(a.id)}
                              disabled={!temAcesso}
                              className={`w-full text-left flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
                                temAcesso ? "hover:bg-muted/50" : "cursor-not-allowed opacity-70"
                              }`}
                              style={{
                                borderColor: ativa ? SALMAO : "transparent",
                                background: ativa ? `${SALMAO}12` : "transparent",
                              }}
                            >
                              <span className="mt-0.5 shrink-0">
                                {!temAcesso ? (
                                  <Lock className="h-4 w-4" style={{ color: PRIMARY, opacity: 0.4 }} />
                                ) : feita ? (
                                  <CheckCircle2 className="h-4 w-4" style={{ color: SALMAO }} />
                                ) : ativa ? (
                                  <PlayCircle className="h-4 w-4" style={{ color: SALMAO }} />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-sm leading-snug"
                                  style={{
                                    color: PRIMARY,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: ativa ? 600 : 400,
                                  }}
                                >
                                  {a.titulo}
                                </p>
                                {a.duracao_segundos ? (
                                  <p className="text-xs mt-0.5" style={{ color: PRIMARY, opacity: 0.55 }}>
                                    {fmtDuracao(a.duracao_segundos)}
                                  </p>
                                ) : null}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export default CursoEstudar;
