import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import {
  Award,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Lock,
  MessageCircle,
  PlayCircle,
  Printer,
  Sparkles,
  ChevronLeft,
  Bot,
} from "lucide-react";
import TutorChatBody, { type TutorCurso } from "@/components/tutor/TutorChatBody";
import samkhyaLogo from "@/assets/samkhya-logo-cropped.png";

const PORTAL_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-positivo.png";

interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  ativo: boolean;
  card_logo_url: string | null;
  card_cor_primaria: string | null;
  card_cor_secundaria: string | null;
}
interface Modulo {
  id: string;
  titulo: string;
  ordem: number;
  tipo: "conteudo" | "whatsapp" | "material";
  descricao: string | null;
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
interface MaterialRow {
  id: string;
  titulo: string;
  tipo: string;
  storage_path: string | null;
  url: string | null;
}
interface CertificadoResp {
  liberado: boolean;
  erro?: string;
  aulas_concluidas?: number;
  aulas_total?: number;
  nome_aluno?: string;
  nome_exibicao?: string;
  logo_url?: string | null;
  cor_primaria?: string;
  cor_escura?: string;
  cor_clara?: string;
  cor_acento?: string;
  carga_horaria?: string;
  n_aulas?: number | null;
  n_modulos?: number | null;
  texto_certificado?: string;
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

const limparLink = (v: string | null): string | null => {
  if (!v) return null;
  const invisiveis = new RegExp("[\\u200B\\u200C\\u200D\\uFEFF]", "g");
  const s = v.replace(invisiveis, "").trim();
  return s || null;
};

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SURFACE = "#FFF8EE";
const TINTA = "#3D2233";

const CURSO_TABS = [
  { id: "aulas", label: "Aulas", icon: PlayCircle },
  { id: "material", label: "Material", icon: FileText },
  { id: "tutor", label: "Tutor", icon: Bot },
  { id: "certificado", label: "Certificado", icon: Award },
] as const;
type CursoTabId = (typeof CURSO_TABS)[number]["id"];

const MaterialLink = ({ item }: { item: MaterialRow }) => {
  const [href, setHref] = useState(item.url);
  useEffect(() => {
    let cancelled = false;
    if (item.url) {
      setHref(item.url);
      return;
    }
    if (!item.storage_path) {
      setHref(null);
      return;
    }
    (async () => {
      const { data } = await supabase.storage
        .from("escola")
        .createSignedUrl(item.storage_path!, 60 * 60);
      if (!cancelled) setHref(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [item.url, item.storage_path]);

  return (
    <div className="rounded-xl border p-4 flex items-center justify-between gap-4" style={{ borderColor: `${PRIMARY}30` }}>
      <div className="min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: PRIMARY }}>
          {item.titulo}
        </p>
        <p className="text-xs mt-0.5" style={{ color: PRIMARY, opacity: 0.6 }}>
          {item.tipo}
        </p>
      </div>
      {href ? (
        <Button asChild size="sm" className="rounded-full shrink-0" style={{ backgroundColor: PRIMARY }}>
          <a href={href} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4 mr-1.5" /> Baixar
          </a>
        </Button>
      ) : (
        <Button size="sm" disabled className="rounded-full shrink-0">
          <Download className="h-4 w-4 mr-1.5" /> Baixar
        </Button>
      )}
    </div>
  );
};

const Petala = ({ cor, className }: { cor: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
    style={{ color: cor }}
  >
    <path d="M12 2C9 7 4 9 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-5-5-7-8-12z" />
  </svg>
);

const CertificadoPrint = ({ cert }: { cert: CertificadoResp }) => (
  <div
    id="certificado-print"
    className="relative flex flex-col items-center justify-center text-center p-12"
    style={{
      width: "297mm",
      height: "210mm",
      background: cert.cor_clara || "#FDFAF5",
      color: TINTA,
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
    }}
  >
    {/* Ornamentos de canto */}
    <svg
      className="absolute top-6 left-6 w-16 h-16 opacity-20"
      viewBox="0 0 100 100"
      fill="none"
      stroke={cert.cor_acento || SALMAO}
      strokeWidth="2"
    >
      <path d="M10 100V50a40 40 0 0 1 40-40h50" />
    </svg>
    <svg
      className="absolute top-6 right-6 w-16 h-16 opacity-20"
      viewBox="0 0 100 100"
      fill="none"
      stroke={cert.cor_acento || SALMAO}
      strokeWidth="2"
    >
      <path d="M90 100V50a40 40 0 0 0-40-40H0" />
    </svg>
    <svg
      className="absolute bottom-6 left-6 w-16 h-16 opacity-20"
      viewBox="0 0 100 100"
      fill="none"
      stroke={cert.cor_acento || SALMAO}
      strokeWidth="2"
    >
      <path d="M10 0v50a40 40 0 0 0 40 40h50" />
    </svg>
    <svg
      className="absolute bottom-6 right-6 w-16 h-16 opacity-20"
      viewBox="0 0 100 100"
      fill="none"
      stroke={cert.cor_acento || SALMAO}
      strokeWidth="2"
    >
      <path d="M90 0v50a40 40 0 0 1-40 40H0" />
    </svg>

    {/* Faixa superior */}
    <div
      className="absolute top-0 left-0 right-0 h-3"
      style={{
        background: `linear-gradient(90deg, ${cert.cor_primaria || PRIMARY} 0%, ${cert.cor_acento || SALMAO} 100%)`,
      }}
    />

    {/* Logo */}
    <div className="mb-4">
      <img
        src={cert.logo_url || PORTAL_LOGO}
        alt="Portal Ayurveda"
        className="h-12 object-contain mx-auto"
      />
    </div>

    {/* Título */}
    <div className="mb-3">
      <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: cert.cor_escura || PRIMARY, opacity: 0.7 }}>
        Certificado de Conclusão
      </p>
      <h1
        className="font-serif text-4xl"
        style={{ color: cert.cor_primaria || PRIMARY }}
      >
        {cert.nome_exibicao}
      </h1>
      <p
        className="text-sm mt-1 uppercase tracking-widest"
        style={{ color: cert.cor_escura || PRIMARY, opacity: 0.8 }}
      >
        Ayurveda
      </p>
    </div>

    {/* Corpo */}
    <div className="max-w-2xl mx-auto my-5">
      <p className="text-base leading-relaxed" style={{ color: TINTA }}>
        Certificamos que
      </p>
      <p
        className="font-serif text-3xl my-3"
        style={{ color: cert.cor_primaria || PRIMARY }}
      >
        {cert.nome_aluno}
      </p>
      <p className="text-base leading-relaxed" style={{ color: TINTA }}>
        concluiu com dedicação o curso{" "}
        <span className="font-semibold" style={{ color: cert.cor_escura || PRIMARY }}>
          {cert.nome_exibicao} do Ayurveda
        </span>
        , {cert.texto_certificado}.
      </p>
    </div>

    {/* Métricas */}
    <div className="flex items-center justify-center gap-8 my-5">
      {[
        { valor: cert.carga_horaria || "—", rotulo: "Carga horária" },
        { valor: cert.n_aulas ?? "—", rotulo: "Aulas concluídas" },
        { valor: cert.n_modulos ?? "—", rotulo: "Módulos" },
      ].map((e, i) => (
        <div key={i} className="text-center">
          <p
            className="font-serif text-2xl"
            style={{ color: cert.cor_primaria || PRIMARY }}
          >
            {e.valor}
          </p>
          <p className="text-xs uppercase tracking-wider" style={{ color: TINTA, opacity: 0.7 }}>
            {e.rotulo}
          </p>
        </div>
      ))}
    </div>

    {/* Rodapé */}
    <div className="absolute bottom-10 left-0 right-0 px-12">
      <div className="flex items-end justify-between">
        <div className="text-left">
          <Petala cor={cert.cor_acento || SALMAO} className="w-5 h-5 mb-1" />
          <p className="text-[10px] uppercase tracking-wider" style={{ color: TINTA, opacity: 0.6 }}>
            Portal Ayurveda
          </p>
        </div>
        <div className="text-center">
          <p
            className="font-serif text-lg"
            style={{ color: cert.cor_primaria || PRIMARY }}
          >
            Edson Osorio
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: TINTA, opacity: 0.6 }}>
            Professor & Diretor Pedagógico
          </p>
        </div>
        <div className="text-right">
          <img
            src={samkhyaLogo}
            alt="Samkhya"
            className="h-6 object-contain ml-auto mb-1"
          />
          <p className="text-[10px] uppercase tracking-wider" style={{ color: TINTA, opacity: 0.6 }}>
            Escola Samkhya
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CertificadoTab = ({
  certificado,
  onIrParaAulas,
}: {
  certificado: CertificadoResp | null;
  onIrParaAulas: () => void;
}) => {
  if (!certificado) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Carregando certificado...</p>
      </div>
    );
  }

  if (!certificado.liberado) {
    const total = certificado.aulas_total ?? 0;
    const feitas = certificado.aulas_concluidas ?? 0;
    const pct = total ? Math.round((feitas / total) * 100) : 0;
    return (
      <div
        className="rounded-2xl border-2 p-8 md:p-10 text-center max-w-xl mx-auto"
        style={{ borderColor: `${PRIMARY}30`, background: SURFACE }}
      >
        <Award className="w-10 h-10 mx-auto mb-3" style={{ color: PRIMARY, opacity: 0.6 }} />
        <h2 className="font-serif font-bold text-xl mb-2" style={{ color: PRIMARY }}>
          Termine o curso para liberar seu certificado
        </h2>
        <p className="text-sm mb-4" style={{ color: PRIMARY, opacity: 0.75 }}>
          {feitas} de {total} aulas concluídas
        </p>
        <div className="h-2 rounded-full overflow-hidden bg-white/70 mb-6">
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: SALMAO }} />
        </div>
        <Button onClick={onIrParaAulas} size="lg" className="rounded-full" style={{ backgroundColor: SALMAO }}>
          Continuar o curso
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-2xl border p-6 md:p-8 mb-6"
        style={{ borderColor: `${PRIMARY}22`, background: SURFACE }}
      >
        <div className="flex items-start gap-4">
          <Award className="w-10 h-10 shrink-0" style={{ color: SALMAO }} />
          <div>
            <h2 className="font-serif font-bold text-xl md:text-2xl mb-1" style={{ color: PRIMARY }}>
              Certificado de conclusão
            </h2>
            <p className="text-sm md:text-base mb-3" style={{ color: PRIMARY, opacity: 0.8 }}>
              {certificado.nome_aluno}
              <span className="opacity-70"> concluiu o curso {certificado.nome_exibicao}</span>
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { valor: certificado.carga_horaria || "—", rotulo: "Carga horária" },
                { valor: certificado.n_aulas ?? "—", rotulo: "Aulas" },
                { valor: certificado.n_modulos ?? "—", rotulo: "Módulos" },
              ].map((e) => (
                <div
                  key={e.rotulo}
                  className="rounded-lg px-3 py-2"
                  style={{ background: `${PRIMARY}10` }}
                >
                  <p className="font-semibold" style={{ color: PRIMARY }}>
                    {e.valor}
                  </p>
                  <p className="text-xs" style={{ color: PRIMARY, opacity: 0.6 }}>
                    {e.rotulo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={() => window.print()}
          size="lg"
          className="rounded-full gap-2"
          style={{ backgroundColor: SALMAO }}
        >
          <Printer className="h-4 w-4" /> Baixar certificado (PDF)
        </Button>
      </div>

      <div className="sr-only print:block">
        <CertificadoPrint cert={certificado} />
      </div>
    </div>
  );
};

const CursoEstudar = () => {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<AulaFull[]>([]);
  const [materiais, setMateriais] = useState<MaterialRow[]>([]);
  const [certificado, setCertificado] = useState<CertificadoResp | null>(null);
  const [temAcesso, setTemAcesso] = useState<boolean>(false);
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarCertificado = async (cursoId: string) => {
    const { data } = await supabase.rpc("obter_certificado_curso", { p_curso_id: cursoId });
    setCertificado((data as unknown as CertificadoResp) ?? null);
  };

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      setLoading(true);
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo,descricao,capa_url,ativo,card_logo_url,card_cor_primaria,card_cor_secundaria")
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
        .select("id,titulo,ordem,tipo,descricao")
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

          const todasAulaIds = ((fullAulas as any[]) ?? []).map((a) => a.id);
          if (todasAulaIds.length > 0) {
            const { data: mats } = await supabase
              .from("curso_materiais")
              .select("id,titulo,tipo,storage_path,url")
              .in("aula_id", todasAulaIds);
            setMateriais((mats as MaterialRow[]) ?? []);
          }

          carregarCertificado((c as Curso).id);
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

  const modulosConteudo = useMemo(() => modulos.filter((m) => m.tipo === "conteudo"), [modulos]);
  const moduloWhatsapp = useMemo(() => modulos.find((m) => m.tipo === "whatsapp"), [modulos]);
  const whatsappLink = useMemo(() => limparLink(moduloWhatsapp?.descricao ?? null), [moduloWhatsapp]);

  const aulasOrdenadas = useMemo(() => {
    const byMod = new Map<string, AulaFull[]>();
    for (const a of aulas) {
      if (!byMod.has(a.modulo_id)) byMod.set(a.modulo_id, []);
      byMod.get(a.modulo_id)!.push(a);
    }
    return modulosConteudo.flatMap((m) => byMod.get(m.id) ?? []);
  }, [aulas, modulosConteudo]);

  const totalAulas = aulasOrdenadas.length;
  const totalConcluidas = aulasOrdenadas.filter((a) => concluidas.has(a.id)).length;
  const pct = totalAulas ? Math.round((totalConcluidas / totalAulas) * 100) : 0;

  const aulaSelecionadaId = searchParams.get("aula") ?? aulasOrdenadas[0]?.id ?? null;
  const aulaAtual = useMemo(
    () => aulasOrdenadas.find((a) => a.id === aulaSelecionadaId) ?? null,
    [aulasOrdenadas, aulaSelecionadaId],
  );

  const abasVisiveis = useMemo(
    () =>
      CURSO_TABS.filter((t) => {
        if (t.id === "material") return materiais.length > 0;
        return true;
      }),
    [materiais],
  );
  const abaAtiva: CursoTabId =
    (abasVisiveis.find((t) => t.id === searchParams.get("tab"))?.id as CursoTabId) ?? "aulas";
  const setAba = (id: CursoTabId) => {
    setSearchParams((sp) => {
      const s = new URLSearchParams(sp);
      s.set("tab", id);
      return s;
    });
  };

  const selecionarAula = (id: string) => {
    setSearchParams((sp) => {
      const s = new URLSearchParams(sp);
      s.set("tab", "aulas");
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
      if (curso) carregarCertificado(curso.id);
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
  if (notFound || !curso || (!curso.ativo && !temAcesso)) {
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

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificado-print, #certificado-print * { visibility: visible; }
          #certificado-print {
            position: fixed;
            inset: 0;
            margin: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

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
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="flex-1 min-w-0">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mb-3"
                  style={{ borderColor: "#25D36655", background: "#25D36615", color: "#1c7d4d" }}
                >
                  <MessageCircle className="w-3.5 h-3.5" style={{ color: "#25D366" }} />
                  Grupo da turma no WhatsApp
                </a>
              )}
              <h1
                className="font-serif font-bold text-2xl md:text-3xl leading-tight mb-2"
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

        {!temAcesso ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
            <div className="min-w-0 order-2 lg:order-1">
              <div
                className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center border-2 border-dashed"
                style={{ borderColor: `${PRIMARY}22`, background: SURFACE }}
              >
                <Lock className="w-8 h-8 mb-2" style={{ color: PRIMARY, opacity: 0.5 }} />
                <p className="text-sm" style={{ color: PRIMARY, opacity: 0.7 }}>
                  Conteúdo bloqueado
                </p>
              </div>
            </div>

            <aside className="order-1 lg:order-2">
              <div className="space-y-5">
                {modulosConteudo.map((m) => {
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
                        {aulasMod.map((a) => (
                          <li key={a.id}>
                            <div
                              className="w-full text-left flex items-start gap-2.5 p-3 rounded-lg border border-transparent opacity-70"
                              style={{ background: "transparent" }}
                            >
                              <span className="mt-0.5 shrink-0">
                                <Lock className="h-4 w-4" style={{ color: PRIMARY, opacity: 0.4 }} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-sm leading-snug"
                                  style={{
                                    color: PRIMARY,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 400,
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
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {abasVisiveis.map((t) => {
                const Icon = t.icon;
                const isActive = t.id === abaAtiva;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAba(t.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border font-semibold text-sm transition-all whitespace-nowrap shrink-0"
                    style={
                      isActive
                        ? {
                            background: PRIMARY,
                            borderColor: PRIMARY,
                            color: "#fff",
                            boxShadow: `0 4px 12px ${PRIMARY}40`,
                          }
                        : {
                            background: `${PRIMARY}10`,
                            borderColor: `${PRIMARY}44`,
                            color: PRIMARY,
                          }
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {abaAtiva === "aulas" && (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
                <div id="player-aula" className="min-w-0 order-2 lg:order-1">
                  {aulaAtual ? (
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
                    <div className="aspect-video w-full rounded-2xl bg-muted flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Nenhuma aula disponível</p>
                    </div>
                  )}
                </div>

                <aside className="order-1 lg:order-2">
                  <div className="space-y-5">
                    {modulosConteudo.map((m) => {
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
                                    onClick={() => selecionarAula(a.id)}
                                    className="w-full text-left flex items-start gap-2.5 p-3 rounded-lg border transition-colors hover:bg-muted/50"
                                    style={{
                                      borderColor: ativa ? SALMAO : "transparent",
                                      background: ativa ? `${SALMAO}12` : "transparent",
                                    }}
                                  >
                                    <span className="mt-0.5 shrink-0">
                                      {feita ? (
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
            )}

            {abaAtiva === "tutor" && curso && (
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border border-border bg-background overflow-hidden h-[70vh] flex flex-col">
                  <TutorChatBody curso={curso as unknown as TutorCurso} className="flex-1" />
                </div>
              </div>
            )}

            {abaAtiva === "material" && (
              <div className="grid gap-3 max-w-2xl">
                {materiais.map((m) => (
                  <MaterialLink key={m.id} item={m} />
                ))}
              </div>
            )}


            {abaAtiva === "certificado" && (
              <CertificadoTab certificado={certificado} onIrParaAulas={() => setAba("aulas")} />
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default CursoEstudar;
