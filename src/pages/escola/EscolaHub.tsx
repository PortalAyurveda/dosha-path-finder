import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useEscolaAluno } from "@/hooks/useEscolaAluno";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";

interface Matricula {
  curso_id: string;
  curso: { id: string; titulo: string; slug: string; capa_url: string | null };
  totalAulas: number;
  concluidas: number;
  proximaAulaId: string | null;
}

const EscolaHub = () => {
  const { user, loading: userLoading } = useUser();
  const { aluno, loading: alunoLoading } = useEscolaAluno();
  const [mats, setMats] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data: matData } = await supabase
        .from("curso_matriculas")
        .select("curso_id, cursos:curso_id(id,titulo,slug,capa_url)")
        .eq("user_id", user.id)
        .eq("status", "ativa");
      const rows = (matData ?? []) as any[];
      if (rows.length === 0) {
        setMats([]);
        setLoading(false);
        return;
      }
      const cursoIds = rows.map((r) => r.curso_id);
      const { data: mods } = await supabase
        .from("curso_modulos")
        .select("id,curso_id,ordem")
        .in("curso_id", cursoIds)
        .order("ordem", { ascending: true });
      const moduloIds = (mods ?? []).map((m) => m.id);
      const { data: aulas } = moduloIds.length
        ? await supabase
            .from("curso_aulas")
            .select("id,modulo_id,ordem")
            .in("modulo_id", moduloIds)
            .order("ordem", { ascending: true })
        : { data: [] as any[] };
      const { data: prog } = await supabase
        .from("curso_aula_progresso")
        .select("aula_id")
        .eq("user_id", user.id);
      const concluidasSet = new Set((prog ?? []).map((p: any) => p.aula_id));

      const modulosByCurso = new Map<string, string[]>();
      (mods ?? []).forEach((m: any) => {
        if (!modulosByCurso.has(m.curso_id)) modulosByCurso.set(m.curso_id, []);
        modulosByCurso.get(m.curso_id)!.push(m.id);
      });
      const aulasByModulo = new Map<string, any[]>();
      (aulas ?? []).forEach((a: any) => {
        if (!aulasByModulo.has(a.modulo_id)) aulasByModulo.set(a.modulo_id, []);
        aulasByModulo.get(a.modulo_id)!.push(a);
      });

      const result: Matricula[] = rows.map((r) => {
        const mIds = modulosByCurso.get(r.curso_id) ?? [];
        const cursoAulas = mIds.flatMap((mid) => aulasByModulo.get(mid) ?? []);
        const total = cursoAulas.length;
        const done = cursoAulas.filter((a) => concluidasSet.has(a.id)).length;
        const proxima = cursoAulas.find((a) => !concluidasSet.has(a.id))?.id ?? null;
        return {
          curso_id: r.curso_id,
          curso: r.cursos,
          totalAulas: total,
          concluidas: done,
          proximaAulaId: proxima,
        };
      });
      setMats(result);
      setLoading(false);
    })();
  }, [user, userLoading]);

  if (!userLoading && !user) {
    return <Navigate to="/entrar?redirect=/escola" replace />;
  }

  const isFormacaoAluna = !!aluno;
  const busy = loading || alunoLoading;

  return (
    <PageContainer
      title="Escola — Portal Ayurveda"
      description="Sua estante de estudo: Formação profissional e cursos do Portal."
    >
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-12">
        <header className="text-center">
          <h1 className="mb-3">Escola</h1>
          <p className="text-muted-foreground">Seu espaço de estudo no Portal.</p>
        </header>

        {/* Duas portas */}
        <section className="grid gap-6 md:grid-cols-2">
          {isFormacaoAluna && (
            <Link
              to="/escola/aluno"
              className="group bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              <GraduationCap className="h-10 w-10 text-primary mb-4" />
              <h2 className="mb-2">Formação Profissional</h2>
              <p className="text-muted-foreground mb-6 flex-1">
                Sua área de aluna da Formação Ayurveda Profissionalizante — módulos,
                lives, mural e materiais.
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-medium">
                Entrar na área <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )}

          <div className="group bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col">
            <BookOpen className="h-10 w-10 text-secondary mb-4" />
            <h2 className="mb-2">Meus Cursos</h2>
            <p className="text-muted-foreground mb-4">
              Sua estante — continue de onde parou.
            </p>
            {busy ? (
              <div className="h-24 rounded bg-muted/40 animate-pulse" />
            ) : mats.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Seus cursos aparecerão aqui.{" "}
                <Link to="/cursos" className="text-primary underline">
                  conhecer os cursos
                </Link>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {mats.map((m) => {
                  const pct = m.totalAulas
                    ? Math.round((m.concluidas / m.totalAulas) * 100)
                    : 0;
                  return (
                    <Link
                      key={m.curso_id}
                      to={`/escola/curso/${m.curso.slug}`}
                      className="flex gap-3 items-center p-3 rounded-lg border border-border hover:bg-muted/40 transition"
                    >
                      {m.curso.capa_url ? (
                        <img
                          src={getTransformedImageUrl(m.curso.capa_url, 200)}
                          alt=""
                          width={80}
                          height={80}
                          loading="lazy"
                          className="w-16 h-16 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{m.curso.titulo}</div>
                        <Progress value={pct} className="h-1.5 my-1.5" />
                        <div className="text-xs text-muted-foreground">
                          {m.concluidas}/{m.totalAulas} aulas · {pct}%
                        </div>
                      </div>
                      <span className="text-sm text-primary shrink-0">Continuar →</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Visitante sem nada */}
        {!isFormacaoAluna && !busy && mats.length === 0 && (
          <section className="grid gap-4 sm:grid-cols-2 pt-4">
            <Button asChild variant="outline" size="lg">
              <Link to="/curso/formacao/inscricao">Conhecer a Formação</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/cursos">Conhecer os cursos</Link>
            </Button>
          </section>
        )}
      </div>
    </PageContainer>
  );
};

export default EscolaHub;
