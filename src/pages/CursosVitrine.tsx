import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Lock } from "lucide-react";
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
  descricao_em_breve: string | null;
  capa_url: string | null;
  ordem: number | null;
  preco: number | null;
  ativo: boolean;
  data_lancamento: string | null;
  pagina_lancamento_url: string | null;
}

const AZUL = "#6A88FB";

const tituloClass = (titulo: string) => {
  const len = titulo.length;
  if (len <= 30) return "text-2xl";
  if (len <= 55) return "text-xl";
  return "text-lg";
};

const formatarDataLancamento = (dataStr: string): string => {
  const data = new Date(dataStr + "T12:00:00");
  const meses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];
  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  return `LANÇA ${dia} DE ${mes}`;
};

const ORDEM_VITRINE = [
  "detox-da-primavera",
  "rotinas-diarias",
  "alimentacao-e-nutricao",
  "dravya-guna-remedios-caseiros",
  "diagnostico-e-autocuidado",
  "mentoria-para-terapeutas",
];

const CursosVitrine = () => {
  const { user } = useUser();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculadas, setMatriculadas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cursos")
        .select(
          "id,slug,titulo,descricao,descricao_em_breve,capa_url,ordem,preco,ativo,data_lancamento,pagina_lancamento_url"
        )
        .in("slug", ORDEM_VITRINE);
      const cursosOrdenados = ORDEM_VITRINE
        .map((slug) => (data as Curso[] | null)?.find((c) => c.slug === slug))
        .filter((c): c is Curso => !!c);
      setCursos(cursosOrdenados);
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


  const LANDING_PROPRIA: Record<string, string> = {
    "rotinas-diarias": "/curso/rotinas",
    "alimentacao-e-nutricao": "/curso/alimentacao",
    "dravya-guna-remedios-caseiros": "/curso/dravya-guna",
    "diagnostico-e-autocuidado": "/curso/diagnostico",
  };
  const destinoLanding = (slug: string, paginaLancamentoUrl?: string | null) => {
    if (paginaLancamentoUrl) return paginaLancamentoUrl;
    return LANDING_PROPRIA[slug] ?? `/cursos/${slug}`;
  };

  const renderCapa = (c: Curso, classes?: string) => {
    if (!c.capa_url) {
      return (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
      );
    }
    return (
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
        <img
          src={getTransformedImageUrl(c.capa_url, 800)}
          alt={c.titulo}
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover ${classes ?? ""}`}
        />
      </div>
    );
  };

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
              <div key={i} className="h-[420px] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : cursos.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum curso disponível no momento.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {cursos.map((c) => {
              const isRotinas = c.slug === "rotinas-diarias";
              const jaTem = matriculadas.has(c.id);
              const disponivel = c.ativo;

              // Estado 1: matriculado
              if (jaTem) {
                const acessar = `/cursos/${c.slug}/estudar`;
                return (
                  <article
                    key={c.id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden ring-2 ring-amber-400 shadow-[0_0_30px_-5px_rgba(242,203,5,0.5)] hover:shadow-[0_0_40px_-5px_rgba(242,203,5,0.6)] transition-all flex flex-col h-full"
                  >
                    <Link to={acessar} className="flex flex-col flex-1">
                      {c.capa_url ? (
                        <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                          <img
                            src={getTransformedImageUrl(c.capa_url, 800)}
                            alt={c.titulo}
                            width={800}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full text-white shadow-md bg-gradient-to-r from-amber-400 to-amber-500">
                            <CheckCircle2 className="w-4 h-4" />
                            Seu Curso
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <h3
                          className={`mb-2 ${tituloClass(c.titulo)} line-clamp-2 leading-tight`}
                          title={c.titulo}
                        >
                          {c.titulo}
                        </h3>
                        {c.descricao && (
                          <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">
                            {c.descricao}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="px-6 pb-6 -mt-2">
                      <Button asChild className="w-full">
                        <Link to={acessar}>Acessar curso</Link>
                      </Button>
                    </div>
                  </article>
                );
              }

              // Estado 3: em breve
              if (!disponivel) {
                const temData =
                  !!c.data_lancamento &&
                  new Date(c.data_lancamento + "T12:00:00") > new Date();
                const badgeText = temData
                  ? formatarDataLancamento(c.data_lancamento!)
                  : "EM BREVE";
                const isDetox = c.slug === "detox-da-primavera";
                return (
                  <article
                    key={c.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full opacity-95"
                  >
                    {c.capa_url ? (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                        <img
                          src={getTransformedImageUrl(c.capa_url, 800)}
                          alt={c.titulo}
                          width={800}
                          height={600}
                          loading="lazy"
                          decoding="async"
                          className={`w-full h-full object-cover ${
                            isDetox ? "opacity-95" : "grayscale-[70%] opacity-80"
                          }`}
                        />
                        {!isDetox && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                              <Lock className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md bg-slate-600">
                          {badgeText}
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-700/40 to-slate-600/40" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h3
                        className={`mb-2 ${tituloClass(c.titulo)} line-clamp-2 leading-tight ${isDetox ? "" : "text-muted-foreground"}`}
                        title={c.titulo}
                      >
                        {c.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">
                        {c.descricao_em_breve?.trim() ||
                          c.descricao?.trim() ||
                          "Em breve disponível no Portal."}
                      </p>
                    </div>
                    <div className="px-6 pb-6 -mt-2">
                      {isDetox ? (
                        <Button asChild className="w-full">
                          <Link to="/aula/detox-primavera">
                            Quero minha pré-inscrição
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                        >
                          Em breve
                        </Button>
                      )}
                    </div>
                  </article>
                );
              }


              // Estado 2: disponível
              const landing = destinoLanding(c.slug, c.pagina_lancamento_url);
              const acessar = `/cursos/${c.slug}/estudar`;
              const isExternal =
                !!c.pagina_lancamento_url &&
                /^(https?:\/\/)/i.test(c.pagina_lancamento_url);

              return (
                <article
                  key={c.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full"
                >
                  <Link
                    to={landing}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex flex-col flex-1"
                  >
                    {c.capa_url ? (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                        <img
                          src={getTransformedImageUrl(c.capa_url, 800)}
                          alt={c.titulo}
                          width={800}
                          height={600}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isRotinas ? (
                          <span
                            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md"
                            style={{ backgroundColor: AZUL }}
                          >
                            Incluso no Premium Anual
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h3
                        className={`mb-2 ${tituloClass(c.titulo)} line-clamp-2 leading-tight`}
                        title={c.titulo}
                      >
                        {c.titulo}
                      </h3>
                      {c.descricao && (
                        <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">
                          {c.descricao}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="px-6 pb-6 -mt-2">
                    {isRotinas ? (
                      <Button
                        asChild
                        className="w-full text-white hover:opacity-90"
                        style={{ backgroundColor: AZUL }}
                      >
                        <Link to={landing}>Ver o curso</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to={landing}>Ver o curso</Link>
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
