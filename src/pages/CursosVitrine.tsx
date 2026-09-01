import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Lock, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import {
  CursoCardCapa,
  CursoCardTituloAbaixo,
  COR_CARD_PADRAO,
  type CursoCardConfig,
  type OverlayPos,
} from "@/components/course/CursoCardCapa";

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
  card_mostrar_titulo: boolean;
  card_mostrar_subtitulo: boolean;
  card_mostrar_logo: boolean;
  card_overlay_pos: string;
  card_logo_tamanho: number;
  card_texto_cor: string;
  card_estado: string | null;
  card_lancamento_data: string | null;
  card_estado_frase: string | null;
  card_mostrar_cadeado: boolean | null;
}

const AZUL = "#6A88FB";
const DOURADO = "#B8892E";
const DOURADO_BG = "#FBF3DE";
const DOURADO_DARK = "#8C641C";

const CAMPOS =
  "id,slug,titulo,descricao,descricao_em_breve,capa_url,ordem,preco,ativo,data_lancamento,pagina_lancamento_url,card_logo_url,card_cor_primaria,card_cor_secundaria,card_subtitulo,card_bullet_1,card_bullet_2,card_bullet_3,card_bullet_4,card_bullet_5,card_cta_texto,card_foto_posicao,card_fosco_opacidade,card_titulo_sobre_foto,card_foto_zoom,card_titulo_tamanho,card_mostrar_titulo,card_mostrar_subtitulo,card_mostrar_logo,card_overlay_pos,card_logo_tamanho,card_texto_cor,card_estado,card_lancamento_data,card_estado_frase,card_mostrar_cadeado";

export const cursoParaCardConfig = (c: Curso): CursoCardConfig => ({
  titulo: c.titulo,
  capaUrl: c.capa_url ?? "",
  logoUrl: c.card_logo_url ?? "",
  subtitulo: c.card_subtitulo ?? "",
  corSecundaria: c.card_cor_secundaria || COR_CARD_PADRAO,
  fotoPosicao: c.card_foto_posicao || "center center",
  fotoZoom: c.card_foto_zoom || 100,
  foscoOpacidade: c.card_fosco_opacidade ?? 75,
  tituloSobreFoto: c.card_titulo_sobre_foto ?? true,
  tituloTamanho: c.card_titulo_tamanho || 100,
  mostrarTitulo: c.card_mostrar_titulo ?? true,
  mostrarSubtitulo: c.card_mostrar_subtitulo ?? true,
  mostrarLogo: c.card_mostrar_logo ?? true,
  overlayPos: (c.card_overlay_pos || "bottom-left") as OverlayPos,
  logoTamanho: c.card_logo_tamanho || 100,
  textoCor: c.card_texto_cor || "#FFFFFF",
});

const bulletsDe = (c: Curso): string[] =>
  [c.card_bullet_1, c.card_bullet_2, c.card_bullet_3, c.card_bullet_4, c.card_bullet_5].filter(
    (b): b is string => !!b && b.trim().length > 0,
  );

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
  return `LANÇA ${data.getDate()} DE ${meses[data.getMonth()]}`;
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
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 mt-0.5" aria-hidden>
    <path
      d="M4 10.5l4 4L16 6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardBullets = ({ c }: { c: Curso }) => {
  const [expandido, setExpandido] = useState(false);
  const bullets = bulletsDe(c);
  const cor = c.card_cor_secundaria || c.card_cor_primaria || COR_CARD_PADRAO;
  if (bullets.length === 0) return null;
  const bulletsVisiveis = expandido ? bullets : bullets.slice(0, 3);
  const restantes = bullets.length - 3;
  return (
    <div className="px-6 pt-4 pb-2">
      <ul>
        {bulletsVisiveis.map((b, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 py-1.5 text-[12.5px] leading-snug text-foreground ${
              i < bulletsVisiveis.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <CheckSvg color={cor} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {restantes > 0 && !expandido && (
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 pt-2 text-xs"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpandido(true);
          }}
        >
          +{restantes} mais
        </Button>
      )}
    </div>
  );
};

const RotinasPremiumMiniCard = ({ c }: { c: Curso }) => (
  <div
    className="mx-6 mt-3 rounded-xl border-2 p-3.5 flex items-start gap-3"
    style={{ background: DOURADO_BG, borderColor: DOURADO }}
  >
    {c.capa_url ? (
      <img
        src={getTransformedImageUrl(c.capa_url, 128)}
        alt=""
        aria-hidden
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="w-16 h-16 object-cover rounded-lg shrink-0"
      />
    ) : (
      <div className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center bg-background">
        <BookOpen className="w-6 h-6" style={{ color: DOURADO }} aria-hidden />
      </div>
    )}
    <div className="min-w-0">
      <p
        className="text-[9px] uppercase tracking-wider font-bold mb-0.5"
        style={{ color: DOURADO_DARK }}
      >
        Incluso no Premium Anual
      </p>
      <p className="font-serif font-bold text-sm leading-tight mb-1 text-primary">{c.titulo}</p>
      <p className="text-xs leading-snug text-primary/80">
        Videoaulas e práticas para organizar sua rotina pelo relógio dos doshas.
      </p>
    </div>
  </div>
);

const Selo = ({
  children,
  cor,
  className = "",
}: {
  children: React.ReactNode;
  cor: string;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1.5 rounded-full text-white shadow-md backdrop-blur-sm ${className}`}
    style={{ backgroundColor: cor }}
  >
    {children}
  </span>
);

const CursosVitrine = () => {
  const { user } = useUser();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculadas, setMatriculadas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cursos").select(CAMPOS).in("slug", ORDEM_VITRINE);
      const cursosOrdenados = ORDEM_VITRINE.map((slug) =>
        (data as Curso[] | null)?.find((c) => c.slug === slug),
      ).filter((c): c is Curso => !!c);
      setCursos(cursosOrdenados);
      if (user) {
        const { data: mats } = await supabase
          .from("curso_matriculas")
          .select("curso_id")
          .eq("user_id", user.id);
        setMatriculadas(new Set((mats ?? []).map((m: { curso_id: string }) => m.curso_id)));
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
  const destinoLanding = (slug: string, paginaLancamentoUrl?: string | null) =>
    paginaLancamentoUrl ?? LANDING_PROPRIA[slug] ?? `/cursos/${slug}`;

  return (
    <PageContainer
      title="Cursos do Portal Ayurveda"
      description="Formação, alimentação, rotinas e mais — cursos em vídeo com acesso permanente."
    >
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 md:mb-14 text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Escola do Portal
          </p>
          <h1 className="mb-4">Cursos do Portal</h1>
          <div className="h-px w-16 mx-auto mb-4 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <p className="text-muted-foreground">
            {"\n"}
          </p>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[460px] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : cursos.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum curso disponível no momento.</p>
        ) : (
          <div className="grid gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {cursos.map((c) => {
              const cfg = cursoParaCardConfig(c);
              const corCta = c.card_cor_primaria || COR_CARD_PADRAO;
              const isRotinas = c.slug === "rotinas-diarias";
              const isDetox = c.slug === "detox-da-primavera";
              const jaTem = matriculadas.has(c.id);

              // Estado 1: matriculado
              if (jaTem) {
                const acessar = `/cursos/${c.slug}/estudar`;
                return (
                  <article
                    key={c.id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden ring-2 ring-amber-400/80 shadow-[0_0_30px_-10px_rgba(242,203,5,0.55)] hover:shadow-[0_0_40px_-8px_rgba(242,203,5,0.65)] transition-all flex flex-col h-full"
                  >
                    <Link to={acessar} className="flex flex-col flex-1">
                      <div className="relative">
                        {c.capa_url ? (
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                            <img
                              src={getTransformedImageUrl(c.capa_url, 800)}
                              alt={c.titulo}
                              width={800}
                              height={600}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <CursoCardCapa cfg={cfg} />
                        )}
                        <div className="absolute top-3 left-3">
                          <Selo cor="#D9A400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Seu curso
                          </Selo>
                        </div>
                      </div>
                      <CursoCardTituloAbaixo cfg={cfg} />
                      <CardBullets c={c} />
                    </Link>
                    <div className="px-6 pb-6">
                      <Button asChild className="w-full">
                        <Link to={acessar}>{c.card_cta_texto || "Acessar curso"}</Link>
                      </Button>
                    </div>
                  </article>
                );
              }

              // Estado 2b: bloqueado pelo CMS (lançamento marcado ou indisponível)
              const estadoCms = c.card_estado || "auto";
              if (estadoCms === "lancamento" || estadoCms === "indisponivel") {
                const seloTexto =
                  estadoCms === "lancamento"
                    ? c.card_lancamento_data
                      ? formatarDataLancamento(c.card_lancamento_data)
                      : "Em breve"
                    : "Indisponível";
                return (
                  <article
                    key={c.id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm"
                  >
                    <div className="relative">
                      <CursoCardCapa cfg={cfg} />
                      <div className="absolute top-3 left-3">
                        <Selo cor={estadoCms === "lancamento" ? corCta : "#4B5563"}>
                          {estadoCms === "lancamento" ? (
                            <Clock3 className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}{" "}
                          {seloTexto}
                        </Selo>
                      </div>
                      {c.card_mostrar_cadeado && (
                        <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <CursoCardTituloAbaixo cfg={cfg} />
                    {c.card_estado_frase && (
                      <p className="px-6 pt-3 text-sm text-muted-foreground">{c.card_estado_frase}</p>
                    )}
                    <CardBullets c={c} />
                    <div className="px-6 pb-6 pt-3 mt-auto">
                      <Button
                        disabled
                        className="w-full cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                      >
                        {estadoCms === "lancamento" ? seloTexto : "Indisponível"}
                      </Button>
                    </div>
                  </article>
                );
              }

              // Estado 3: em breve

              if (!c.ativo) {
                const temData =
                  !!c.data_lancamento && new Date(c.data_lancamento + "T12:00:00") > new Date();
                const badgeText = temData
                  ? formatarDataLancamento(c.data_lancamento!)
                  : "Em breve";
                return (
                  <article
                    key={c.id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm"
                  >
                    <div className="relative">
                      <CursoCardCapa cfg={cfg} />
                      <div className="absolute top-3 left-3">
                        <Selo cor="#4B5563">
                          <Clock3 className="w-3.5 h-3.5" /> {badgeText}
                        </Selo>
                      </div>
                    </div>
                    <CursoCardTituloAbaixo cfg={cfg} />
                    <CardBullets c={c} />
                    <div className="px-6 pb-6 pt-3 mt-auto">
                      {c.pagina_lancamento_url || isDetox ? (
                        <Button
                          asChild
                          className="w-full text-white hover:opacity-90"
                          style={{ backgroundColor: corCta }}
                        >
                          <Link
                            to={
                              c.pagina_lancamento_url ??
                              (isDetox ? "/aula/detox-primavera" : `/cursos/${c.slug}`)
                            }
                            {...(c.pagina_lancamento_url && /^(https?:\/\/)/i.test(c.pagina_lancamento_url)
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
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
                !!c.pagina_lancamento_url && /^(https?:\/\/)/i.test(c.pagina_lancamento_url);

              return (
                <article
                  key={c.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
                >
                  <Link
                    to={landing}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex flex-col flex-1"
                  >
                    <div className="relative">
                      <CursoCardCapa cfg={cfg} />
                      <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </span>
                    </div>
                    <CursoCardTituloAbaixo cfg={cfg} />
                    <CardBullets c={c} />
                    {isRotinas && <RotinasPremiumMiniCard c={c} />}
                  </Link>
                  <div className="px-6 pb-6 pt-3 mt-auto">
                    <Button
                      asChild
                      className="w-full text-white hover:opacity-90"
                      style={{ backgroundColor: isRotinas ? AZUL : corCta }}
                    >
                      <Link
                        to={landing}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {c.card_cta_texto || "Inscrever-se para Aula"}
                      </Link>
                    </Button>
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
