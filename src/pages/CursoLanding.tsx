import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { Clock, PlayCircle, ShieldCheck } from "lucide-react";

interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  preco: number | null;
  ativo: boolean;
}
interface Modulo {
  id: string;
  curso_id: string;
  titulo: string;
  ordem: number | null;
}
interface AulaIndice {
  modulo_id: string;
  titulo: string;
  duracao_segundos: number | null;
  ordem: number | null;
}

const fmtDuracao = (s: number | null) => {
  if (!s) return "";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
};

const fmtPreco = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CursoLanding = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<AulaIndice[]>([]);
  const [matriculada, setMatriculada] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo,descricao,capa_url,preco,ativo")
        .eq("slug", slug)
        .maybeSingle();
      if (!c) {
        setLoading(false);
        return;
      }
      setCurso(c as Curso);

      const [{ data: mods }, { data: idx }, matRes] = await Promise.all([
        supabase
          .from("curso_modulos")
          .select("id,curso_id,titulo,ordem")
          .eq("curso_id", (c as Curso).id)
          .order("ordem", { ascending: true }),
        supabase
          .from("curso_aulas_indice" as any)
          .select("modulo_id,titulo,duracao_segundos,ordem")
          .order("ordem", { ascending: true }),
        user
          ? supabase
              .from("curso_matriculas")
              .select("id")
              .eq("curso_id", (c as Curso).id)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      setModulos((mods as Modulo[]) ?? []);
      setAulas((idx as AulaIndice[]) ?? []);
      setMatriculada(!!(matRes as any)?.data);
      setLoading(false);
    })();
  }, [slug, user]);

  const aulasPorModulo = useMemo(() => {
    const map = new Map<string, AulaIndice[]>();
    for (const a of aulas) {
      if (!map.has(a.modulo_id)) map.set(a.modulo_id, []);
      map.get(a.modulo_id)!.push(a);
    }
    return map;
  }, [aulas]);

  const totalAulas = aulas.filter((a) =>
    modulos.some((m) => m.id === a.modulo_id),
  ).length;

  const handleComprar = async () => {
    if (!curso) return;
    if (!user) {
      navigate(`/entrar?redirect=/cursos/${curso.slug}`);
      return;
    }
    setComprando(true);
    try {
      const { data, error } = await supabase.functions.invoke("comprar-curso", {
        body: { curso_slug: curso.slug },
      });
      if (error) throw error;
      if ((data as any)?.ja_matriculado) {
        toast.success("Você já é aluna deste curso");
        navigate("/escola");
        return;
      }
      if ((data as any)?.url) {
        window.location.href = (data as any).url;
        return;
      }
      toast.error("Não foi possível iniciar o checkout");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao iniciar compra");
    } finally {
      setComprando(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Carregando curso…">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          <div className="h-72 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-8 w-2/3 bg-muted/40 animate-pulse rounded" />
        </div>
      </PageContainer>
    );
  }
  if (!curso || !curso.ativo) {
    return (
      <PageContainer title="Curso não encontrado">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="mb-4">Curso não encontrado</h1>
          <Button asChild>
            <Link to="/cursos">Ver todos os cursos</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const hasPreco = !!curso.preco && curso.preco > 0;

  const CTA = () => {
    if (matriculada) {
      return (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/escola">Acessar meu curso</Link>
        </Button>
      );
    }
    if (!hasPreco) {
      return (
        <Button disabled size="lg" variant="outline" className="w-full sm:w-auto">
          Em breve por aqui
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        onClick={handleComprar}
        disabled={comprando}
        className="w-full sm:w-auto"
      >
        {comprando ? "Abrindo checkout…" : "Quero este curso"}
      </Button>
    );
  };

  return (
    <PageContainer
      title={`${curso.titulo} — Portal Ayurveda`}
      description={curso.descricao ?? undefined}
    >
      <article className="bg-background">
        {/* HERO */}
        <section className="relative">
          {curso.capa_url && (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted">
              <img
                src={getTransformedImageUrl(curso.capa_url, 1600)}
                alt={curso.titulo}
                width={1600}
                height={900}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="max-w-4xl mx-auto px-4 -mt-16 md:-mt-24 relative">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 md:p-10">
              <h1 className="mb-4">{curso.titulo}</h1>
              <p className="text-lg text-muted-foreground italic">
                Para quem quer entender o porquê de cada gesto — e nunca mais depender
                de tabela pronta.
              </p>
            </div>
          </div>
        </section>

        {/* PROMESSA */}
        <section className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="mb-4">A promessa</h2>
          <p className="text-lg leading-relaxed text-foreground/90">
            A rotina te diz o que fazer. Este curso te ensina o porquê: olhar pro seu
            prato, pro seu dia, pro seu corpo, e saber ajustar sozinha.
          </p>
        </section>

        {/* PROGRAMA */}
        <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <h2 className="text-center mb-2">O programa</h2>
          <p className="text-center text-muted-foreground mb-8">
            {modulos.length} módulos · {totalAulas} aulas em vídeo · no seu ritmo ·
            acesso permanente
          </p>
          <div className="space-y-4">
            {modulos.map((m, i) => {
              const list = aulasPorModulo.get(m.id) ?? [];
              return (
                <div
                  key={m.id}
                  className="bg-card border border-border rounded-xl p-5 md:p-6"
                >
                  <h3 className="mb-3 text-lg">
                    <span className="text-muted-foreground mr-2">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    {m.titulo}
                  </h3>
                  {list.length > 0 && (
                    <ul className="space-y-2">
                      {list.map((a, j) => (
                        <li
                          key={`${m.id}-${j}`}
                          className="flex items-center justify-between gap-4 text-sm border-t border-border/60 pt-2 first:border-0 first:pt-0"
                        >
                          <span className="flex items-center gap-2 text-foreground/90">
                            <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            {a.titulo}
                          </span>
                          {a.duracao_segundos ? (
                            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                              <Clock className="h-3.5 w-3.5" />
                              {fmtDuracao(a.duracao_segundos)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* PROFESSOR */}
        <section className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="mb-4">Quem ensina</h2>
          <p className="text-lg leading-relaxed">
            <strong>Edson Osorio</strong> — 17 anos formando terapeutas e ensinando
            Ayurveda aplicado ao Brasil.
          </p>
        </section>

        {/* INVESTIMENTO */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="mb-6">Investimento</h2>
            {hasPreco ? (
              <p className="text-2xl md:text-3xl font-serif mb-2">
                {fmtPreco(curso.preco!)}
              </p>
            ) : (
              <p className="text-2xl font-serif mb-2 text-muted-foreground">
                Em breve
              </p>
            )}
            {hasPreco && (
              <p className="text-muted-foreground mb-8">
                pagamento único, acesso pra sempre
              </p>
            )}
            <div className="flex justify-center">
              <CTA />
            </div>
            {hasPreco && !matriculada && (
              <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                7 dias de garantia — devolução completa, sem perguntas.
              </p>
            )}
          </div>
        </section>
      </article>
    </PageContainer>
  );
};

export default CursoLanding;
