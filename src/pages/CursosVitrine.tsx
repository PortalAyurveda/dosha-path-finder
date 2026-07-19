import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { getTransformedImageUrl } from "@/lib/imageTransform";

interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  ordem: number | null;
  preco: number | null;
}

const CursosVitrine = () => {
  const { user } = useUser();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculadas, setMatriculadas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cursos")
        .select("id,slug,titulo,descricao,capa_url,ordem,preco")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      setCursos((data as Curso[]) ?? []);
      if (user) {
        const { data: mats } = await supabase
          .from("curso_matriculas")
          .select("curso_id")
          .eq("user_id", user.id);
        setMatriculadas(new Set((mats ?? []).map((m: any) => m.curso_id)));
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <PageContainer
      title="Cursos do Portal Ayurveda"
      description="Formação, alimentação, rotinas e mais — cursos em vídeo com acesso permanente."
    >
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="mb-3">Cursos do Portal</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No seu ritmo, com acesso permanente. Escolha por onde começar.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : cursos.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum curso disponível no momento.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((c) => {
              const isRotinas = c.slug === "rotinas-diarias";
              return (
                <article
                  key={c.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  {c.capa_url ? (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                      <img
                        src={getTransformedImageUrl(c.capa_url, 800)}
                        alt={c.titulo}
                        width={800}
                        height={600}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isRotinas && (
                        <span
                          className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md"
                          style={{ backgroundColor: "#B8892E" }}
                        >
                          Incluso no Premium Anual
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="mb-2">{c.titulo}</h3>
                    {c.descricao && (
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">
                        {c.descricao}
                      </p>
                    )}
                    {isRotinas ? (
                      <Button asChild className="w-full" style={{ backgroundColor: "#B8892E" }}>
                        <Link to="/assinar">Ver planos</Link>
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className="w-full">
                        Em breve
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CursosVitrine;
