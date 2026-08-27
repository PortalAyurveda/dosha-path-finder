import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Lock, BookOpen } from "lucide-react";
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
  card_logo_url: string | null;
  card_cor_primaria: string | null;
  card_cor_secundaria: string | null;
  card_subtitulo: string | null;
  card_bullet_1: string | null;
  card_bullet_2: string | null;
  card_bullet_3: string | null;
  card_bullet_4: string | null;
  card_bullet_5: string | null;
  card_cta_texto: string | null;
  card_foto_posicao: string | null;
  card_fosco_opacidade: number;
  card_titulo_sobre_foto: boolean;
  card_foto_zoom: number;
  card_titulo_tamanho: number;
}

const AZUL = "#6A88FB";
const COR_PADRAO = "#352F54";

const tituloClass = (titulo: string) => {
  const len = titulo.length;
  if (len <= 30) return "text-xl";
  if (len <= 55) return "text-lg";
  return "text-base";
};

const bulletsDe = (c: Curso): string[] =>
  [c.card_bullet_1, c.card_bullet_2, c.card_bullet_3, c.card_bullet_4, c.card_bullet_5].filter(
    (b): b is string => !!b && b.trim().length > 0,
  );

const gradienteFosco = (cor: string, fosco: number): string | null => {
  if (!fosco || fosco <= 0) return null;
  const hex2 = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  const alphaFim = hex2((fosco / 100) * 255);
  const alphaMeio = hex2((fosco / 100) * 0.35 * 255);
  return `linear-gradient(180deg, ${cor}00 0%, ${cor}${alphaMeio} 45%, ${cor}${alphaFim} 100%)`;
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

const CheckSvg = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill={color} />
    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CardHeader = ({ c }: { c: Curso }) => {
  const cor = c.card_cor_secundaria || COR_PADRAO;
  const overlay = c.card_titulo_sobre_foto;
  const gradiente = gradienteFosco(cor, c.card_fosco_opacidade ?? 75);
  const posicao = c.card_foto_posicao || "center center";
  const zoom = c.card_foto_zoom || 100;
  const tituloPx = 19 * ((c.card_titulo_tamanho || 100) / 100);

  return (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {c.capa_url ? (
          <img
            src={getTransformedImageUrl(c.capa_url, 800)}
            alt={c.titulo}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: posicao, transform: `scale(${zoom / 100})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        {gradiente && <div className="absolute inset-0" style={{ background: gradiente }} />}
        {overlay && (
          <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
            <div className="mb-2">
              {c.card_logo_url ? (
                <img
                  src={c.card_logo_url}
                  alt=""
                  className="h-10 w-auto object-contain drop-shadow-md"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-white drop-shadow-md" />
              )}
            </div>
            <h3
              className="line-clamp-2 leading-tight text-white font-bold drop-shadow"
              style={{ fontSize: `${tituloPx}px` }}
              title={c.titulo}
            >
              {c.titulo}
            </h3>
            {c.card_subtitulo && (
              <p className="mt-1 text-sm text-white/90 line-clamp-1 drop-shadow">
                {c.card_subtitulo}
              </p>
            )}
          </div>
        )}
      </div>
      {!overlay && (
        <div className="px-6 pt-5 pb-2 flex items-start gap-3">
          {c.card_logo_url && (
            <img
              src={c.card_logo_url}
              alt=""
              className="h-9 w-auto object-contain shrink-0 mt-0.5"
            />
          )}
          <div className="min-w-0">
            <h3
              className="line-clamp-2 leading-tight font-bold"
              style={{ fontSize: `${tituloPx}px` }}
              title={c.titulo}
            >
              {c.titulo}
            </h3>
            {c.card_subtitulo && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {c.card_subtitulo}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const CardBullets = ({ c }: { c: Curso }) => {
  const bullets = bulletsDe(c);
  const corCheck = c.card_cor_secundaria || c.card_cor_primaria || COR_PADRAO;
  if (bullets.length === 0) return null;
  return (
    <div className="px-6 pb-4 space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-0.5 shrink-0">
            <CheckSvg color={corCheck} />
          </span>
          {b}
        </div>
      ))}
    </div>
  );
};

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
          "id,slug,titulo,descricao,descricao_em_breve,capa_url,ordem,preco,ativo,data_lancamento,pagina_lancamento_url,card_logo_url,card_cor_primaria,card_cor_secundaria,card_subtitulo,card_bullet_1,card_bullet_2,card_bullet_3,card_bullet_4,card_bullet_5,card_cta_texto,card_foto_posicao,card_fosco_opacidade,card_titulo_sobre_foto,card_foto_zoom,card_titulo_tamanho"
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
              const isDetox = c.slug === "detox-da-primavera";
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
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {c.capa_url ? (
                          <img
                            src={getTransformedImageUrl(c.capa_url, 800)}
                            alt={c.titulo}
                            width={800}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                        )}
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full text-white shadow-md bg-gradient-to-r from-amber-400 to-amber-500">
                          <CheckCircle2 className="w-4 h-4" />
                          Seu Curso
                        </span>
                      </div>
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
                        <Link to={acessar}>{c.card_cta_texto || "Acessar curso"}</Link>
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
                return (
                  <article
                    key={c.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full opacity-95"
                  >
                    <div className="relative">
                      <CardHeader c={c} />
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md bg-slate-600">
                        {badgeText}
                      </span>
                    </div>
                    <CardBullets c={c} />
                    <div className="px-6 pb-6 -mt-2 mt-auto">
                      {isDetox ? (
                        <Button asChild className="w-full">
                          <Link to="/aula/detox-primavera">
                            {c.card_cta_texto || "Quero minha pré-inscrição"}
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

              // Estado 2: disponível, sem matrícula
              const landing = destinoLanding(c.slug, c.pagina_lancamento_url);
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
                    <div className="relative">
                      <CardHeader c={c} />
                      <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </span>
                      {isRotinas && (
                        <span
                          className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md"
                          style={{ backgroundColor: AZUL }}
                        >
                          Incluso no Premium Anual
                        </span>
                      )}
                    </div>
                    <CardBullets c={c} />
                  </Link>
                  <div className="px-6 pb-6 -mt-2 mt-auto">
                    {isRotinas ? (
                      <Button
                        asChild
                        className="w-full text-white hover:opacity-90"
                        style={{ backgroundColor: AZUL }}
                      >
                        <Link to={landing}>{c.card_cta_texto || "Ver o curso"}</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to={landing}>{c.card_cta_texto || "Ver o curso"}</Link>
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
