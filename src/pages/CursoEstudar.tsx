import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import {
  Award,
  Check,
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
  ChevronDown,
  ChevronRight,
  Bot,
} from "lucide-react";
import TutorChatBody, { type TutorCurso } from "@/components/tutor/TutorChatBody";
import samkhyaLogo from "@/assets/samkhya-logo-cropped.png";
import { MarcaPortal, Quadradinho } from "@/components/impressao/PecasImpressao";
import DOMPurify from "dompurify";

const PORTAL_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-positivo.png";

const imprimirAula = () => {
  const fechados = Array.from(document.querySelectorAll("details")).filter((d) => !d.open);
  fechados.forEach((d) => (d.open = true));
  window.addEventListener("afterprint", () => fechados.forEach((d) => (d.open = false)), { once: true });
  window.print();
};

const BlocoHtml = ({ html }: { html: string }) => {
  const navigate = useNavigate();
  const limpo = useMemo(
    () => DOMPurify.sanitize(html, { ADD_TAGS: ["style"], ADD_ATTR: ["target", "rel"], FORCE_BODY: true }) as string,
    [html],
  );
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    } else if (href.startsWith("#") && href.length > 1) {
      const alvo = e.currentTarget.querySelector(`[id="${CSS.escape(href.slice(1))}"]`);
      if (alvo instanceof HTMLDetailsElement) {
        e.preventDefault();
        alvo.open = true;
        alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  return <div className="bloco-html" onClick={onClick} dangerouslySetInnerHTML={{ __html: limpo }} />;
};

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
  aviso_topo: string | null;
  banner_html: string | null;
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
  slug?: string | null;
}
interface AulaFull extends AulaBase {
  descricao: string | null;
  youtube_url: string | null;
  liberada?: boolean | null;
  libera_em?: string | null;
  imprimir?: boolean | null;
  html?: string | null;
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
    if (u.pathname.startsWith("/live/"))
      return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    if (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") {
      const partes = u.pathname.split("/").filter(Boolean);
      const idVimeo = partes[0];
      const hashVimeo = partes[1];
      if (idVimeo) return `https://player.vimeo.com/video/${idVimeo}${hashVimeo ? `?h=${hashVimeo}` : ""}`;
    }
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

const youtubeIdDe = (embedUrl: string | null): string | null => {
  if (!embedUrl) return null;
  try {
    const u = new URL(embedUrl);
    if (!u.hostname.includes("youtube.com") || !u.pathname.startsWith("/embed/")) return null;
    const id = u.pathname.split("/")[2];
    return id ? id.split("?")[0] : null;
  } catch {
    return null;
  }
};

let promessaApiYoutube: any = null;

const carregarApiYoutube = () => {
  if (promessaApiYoutube) return promessaApiYoutube;
  promessaApiYoutube = new Promise((resolve) => {
    const w = window as any;
    if (w.YT && w.YT.Player) {
      resolve(w.YT);
      return;
    }
    const anterior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof anterior === "function") anterior();
      resolve(w.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return promessaApiYoutube;
};

type PlayerYoutubeProps = {
  videoId: string;
  inicio: number;
  onTempo: (segundos: number, duracao: number) => void;
};

const PlayerYoutube = ({ videoId, inicio, onTempo }: PlayerYoutubeProps) => {
  const caixaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const onTempoRef = useRef(onTempo);
  onTempoRef.current = onTempo;

  useEffect(() => {
    let cancelado = false;

    const pararTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const reportar = () => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      onTempoRef.current(Math.floor(p.getCurrentTime() || 0), Math.floor(p.getDuration() || 0));
    };

    carregarApiYoutube().then((YT: any) => {
      if (cancelado || !caixaRef.current) return;
      playerRef.current = new YT.Player(caixaRef.current, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: { rel: 0, playsinline: 1, start: inicio, modestbranding: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 1) {
              pararTimer();
              timerRef.current = setInterval(reportar, 10000);
            } else if (e.data === 2) {
              pararTimer();
              reportar();
            } else if (e.data === 0) {
              pararTimer();
              const p = playerRef.current;
              const dur = Math.floor((p && typeof p.getDuration === "function" && p.getDuration()) || 0);
              onTempoRef.current(dur, dur);
            }
          },
        },
      });
    });

    return () => {
      cancelado = true;
      pararTimer();
      if (playerRef.current && typeof playerRef.current.destroy === "function") playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div className="w-full h-full">
      <div ref={caixaRef} />
    </div>
  );
};

type Posicao = { aula_id: string; segundos: number; duracao_segundos: number | null; atualizado_em: string };

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

const TarefaItem = ({
  texto,
  aulaId,
  impressao,
  children,
}: {
  texto: string;
  aulaId?: string;
  impressao?: boolean;
  children: React.ReactNode;
}) => {
  const chave = `curso-lista:${aulaId ?? "sem-aula"}:${texto}`;
  const [marcado, setMarcado] = useState(() => {
    try {
      return window.localStorage.getItem(chave) === "1";
    } catch {
      return false;
    }
  });
  const alternar = () => {
    const prox = !marcado;
    setMarcado(prox);
    try {
      window.localStorage.setItem(chave, prox ? "1" : "0");
    } catch {
      /* noop */
    }
  };
  if (impressao) {
    return (
      <div style={{ display: "flex", alignItems: "center", marginBottom: "3mm", breakInside: "avoid" }}>
        <Quadradinho mm="5mm" />
        <span style={{ fontSize: "11pt", fontWeight: 700, color: "#000" }}>{children}</span>
      </div>
    );
  }
  return (
    <label
      className="flex items-center gap-4 min-h-[60px] py-2 border-b border-[#EFE6DC] cursor-pointer"
      onClick={alternar}
      role="checkbox"
      aria-checked={marcado}
    >
      <span
        aria-hidden
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          border: `2px solid ${PRIMARY}`,
          borderRadius: 6,
          background: marcado ? PRIMARY : "#fff",
        }}
      >
        {marcado && <Check className="h-4 w-4" style={{ color: "#fff" }} />}
      </span>
      <span className="text-[18px] leading-[1.7]" style={{ color: PRIMARY }}>
        {children}
      </span>
    </label>
  );
};

const extrairTexto = (node: React.ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extrairTexto).join("");
  if (typeof node === "object" && "props" in (node as any)) return extrairTexto((node as any).props?.children);
  return "";
};

const TextoAula = ({
  texto,
  aulaId,
  impressao,
}: {
  texto: string;
  aulaId?: string;
  impressao?: boolean;
}) => {
  const corTexto = impressao ? "#000" : PRIMARY;
  const components: any = {
    p: ({ children }: any) => (
      <p
        className={impressao ? undefined : "text-[18px] leading-[1.7] mb-4"}
        style={impressao ? { fontSize: "11pt", margin: "0 0 3mm", color: "#000" } : { color: corTexto }}
      >
        {children}
      </p>
    ),
    li: ({ children, className, node, ...rest }: any) => {
      const isTask = typeof className === "string" && className.includes("task-list-item");
      if (isTask) {
        const filhos = (Array.isArray(children) ? children : [children]).filter(
          (c: any) => !(typeof c === "object" && c?.type === "input"),
        );
        return (
          <TarefaItem texto={extrairTexto(filhos)} aulaId={aulaId} impressao={impressao}>
            {filhos}
          </TarefaItem>
        );
      }
      return (
        <li
          className={impressao ? undefined : "text-[18px] leading-[1.7]"}
          style={impressao ? { fontSize: "11pt", margin: "0 0 3mm", color: "#000" } : { color: corTexto }}
          {...rest}
        >
          {children}
        </li>
      );
    },
    h1: ({ children }: any) => <TituloTexto impressao={impressao}>{children}</TituloTexto>,
    h2: ({ children }: any) => <TituloTexto impressao={impressao}>{children}</TituloTexto>,
    h3: ({ children }: any) => <TituloTexto impressao={impressao}>{children}</TituloTexto>,
    ul: ({ children, className }: any) => {
      const isTask = typeof className === "string" && className.includes("contains-task-list");
      if (isTask) {
        if (impressao) {
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "8mm" }}>{children}</div>
          );
        }
        return <div className="list-none pl-0 mb-4">{children}</div>;
      }
      return (
        <ul
          className={impressao ? undefined : "list-disc pl-[22px] mb-4 space-y-2"}
          style={impressao ? { paddingLeft: "6mm" } : undefined}
        >
          {children}
        </ul>
      );
    },
    ol: ({ children }: any) => (
      <ol
        className={impressao ? undefined : "list-decimal pl-[22px] mb-4 space-y-2"}
        style={impressao ? { paddingLeft: "6mm" } : undefined}
      >
        {children}
      </ol>
    ),
    a: ({ href, children }: any) => {
      const url = href ?? "";
      if (impressao) return <span style={{ color: "#000", fontSize: "11pt", fontWeight: 700 }}>{children}</span>;
      const classe = "font-bold underline underline-offset-4";
      if (url.startsWith("/")) {
        return (
          <Link to={url} className={classe} style={{ color: PRIMARY }}>
            {children}
          </Link>
        );
      }
      if (url.startsWith("https://portalayurveda.com")) {
        return (
          <Link to={url.slice("https://portalayurveda.com".length) || "/"} className={classe} style={{ color: PRIMARY }}>
            {children}
          </Link>
        );
      }
      return (
        <a href={url} target="_blank" rel="noreferrer" className={classe} style={{ color: PRIMARY }}>
          {children}
        </a>
      );
    },
  };
  return (
    <div className="[&>*:last-child]:mb-0">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {texto}
      </ReactMarkdown>
    </div>
  );
};

const TituloTexto = ({ impressao, children }: { impressao?: boolean; children: React.ReactNode }) => (
  <h3
    className={impressao ? undefined : "font-serif font-bold text-[22px] leading-snug mt-[22px] mb-2"}
    style={
      impressao
        ? {
            fontSize: "13pt",
            fontWeight: 700,
            borderBottom: "1px solid #000",
            paddingBottom: "1mm",
            margin: "4mm 0 2mm",
            breakAfter: "avoid",
            color: "#000",
          }
        : { color: PRIMARY }
    }
  >
    {children}
  </h3>
);

const CartaoTrancado = ({ aula, rotulo }: { aula: AulaFull; rotulo: string }) => (
  <div
    className="rounded-[18px] border-2 border-dashed text-center"
    style={{ borderColor: `${PRIMARY}33`, background: "#FFF8EE", padding: "32px 24px" }}
  >
    <Lock className="mx-auto mb-3" style={{ width: 32, height: 32, color: PRIMARY }} />
    <h2 className="font-serif font-bold text-[20px] mb-2" style={{ color: PRIMARY }}>
      {aula.titulo}
    </h2>
    <p className="text-[18px]" style={{ color: PRIMARY }}>
      Esta aula ainda não foi liberada.
    </p>
    {rotulo.startsWith("Libera em") && (
      <p className="text-[18px] font-bold mt-2" style={{ color: PRIMARY }}>
        {rotulo}
      </p>
    )}
  </div>
);

const CursoEstudar = () => {
  const { slug = "", aula: aulaNaRota } = useParams();
  const { user, isAnonymous, loading: authLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAnonymous, loading: authLoading } = useUser();
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
  const [moduloAberto, setModuloAberto] = useState(null as string | null);
  const [posicoes, setPosicoes] = useState({} as { [aulaId: string]: Posicao });
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const aulaAberta = (a: AulaFull) =>
    a.liberada !== false && (!a.libera_em || Date.parse(a.libera_em) <= agora);

  const rotuloTranca = (a: AulaFull) => {
    if (a.liberada !== false && a.libera_em && Date.parse(a.libera_em) > agora) {
      const d = new Date(a.libera_em);
      const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
      const hora = d
        .toLocaleTimeString("pt-BR", { hour: "numeric", minute: "2-digit", timeZone: "America/Sao_Paulo" })
        .replace(":00", "h")
        .replace(":", "h");
      return `Libera em ${data}, às ${hora}`;
    }
    return "Ainda não liberada";
  };

  const carregarCertificado = async (cursoId: string) => {
    const { data } = await supabase.rpc("obter_certificado_curso", { p_curso_id: cursoId });
    setCertificado((data as unknown as CertificadoResp) ?? null);
  };

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (!curso || curso.slug !== slug) setLoading(true);
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo,descricao,capa_url,ativo,card_logo_url,card_cor_primaria,card_cor_secundaria,aviso_topo,banner_html")
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
            .select("id,modulo_id,titulo,descricao,youtube_url,duracao_segundos,ordem,liberada,libera_em,imprimir,html,slug")
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
            .select("id,modulo_id,titulo,duracao_segundos,ordem,slug")
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

        const { data: pos } = await supabase
          .from("curso_aula_posicao" as any)
          .select("aula_id,segundos,duracao_segundos,atualizado_em")
          .eq("user_id", user.id);
        const mapa = {} as { [aulaId: string]: Posicao };
        for (const p of ((pos ?? []) as any[])) mapa[p.aula_id] = p as Posicao;
        setPosicoes(mapa);
      }

      setLoading(false);
    })();
  }, [slug, user?.id, authLoading]);

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

  const aulasAbertas = aulasOrdenadas.filter(aulaAberta);
  const totalAulas = aulasAbertas.length;
  const totalConcluidas = aulasAbertas.filter((a) => concluidas.has(a.id)).length;
  const pct = totalAulas ? Math.round((totalConcluidas / totalAulas) * 100) : 0;

  const ultimaVista = aulasAbertas
    .filter((a) => posicoes[a.id] && !concluidas.has(a.id))
    .sort((a, b) => (posicoes[b.id].atualizado_em > posicoes[a.id].atualizado_em ? 1 : -1))[0];
  const primeiraNaoConcluida = ultimaVista ?? aulasAbertas.find((a) => !concluidas.has(a.id)) ?? aulasAbertas[0] ?? aulasOrdenadas[0];
  const aulaPedida = searchParams.get("aula") ?? aulaNaRota ?? null;
  const aulaSelecionadaId =
    (aulaPedida ? aulasOrdenadas.find((a) => a.id === aulaPedida || a.slug === aulaPedida)?.id : undefined) ??
    primeiraNaoConcluida?.id ??
    null;
  const aulaAtual = useMemo(
    () => aulasOrdenadas.find((a) => a.id === aulaSelecionadaId) ?? null,
    [aulasOrdenadas, aulaSelecionadaId],
  );

  const indiceAtual = aulasOrdenadas.findIndex((a) => a.id === aulaSelecionadaId);
  const aulaAnterior = indiceAtual > 0 ? aulasOrdenadas.slice(0, indiceAtual).reverse().find(aulaAberta) ?? null : null;
  const aulaProxima = indiceAtual >= 0 ? aulasOrdenadas.slice(indiceAtual + 1).find(aulaAberta) ?? null : null;
  const numeroDaAula = (id: string) => aulasOrdenadas.findIndex((a) => a.id === id) + 1;
  const moduloDaAula = (a: AulaFull | null) => modulosConteudo.find((m) => m.id === a?.modulo_id) ?? null;
  useEffect(() => {
    if (aulaAtual) setModuloAberto(aulaAtual.modulo_id);
  }, [aulaAtual?.modulo_id]);

  const abasVisiveis = useMemo(
    () =>
      CURSO_TABS.filter((t) => {
        if (t.id === "material") return materiais.length > 0;
        if (t.id === "certificado") return slug !== "detox-da-primavera";
        return true;
      }),
    [materiais, slug],
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
    const aula = aulasOrdenadas.find((a) => a.id === id);
    const parametros = new URLSearchParams(searchParams);
    parametros.delete("aula");
    parametros.set("tab", "aulas");
    navigate({ pathname: `/cursos/${slug}/estudar/${aula?.slug ?? id}`, search: `?${parametros.toString()}` });
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

  const salvarPosicao = async (aulaId: string, segundos: number, duracao: number) => {
    if (!user) return;
    setPosicoes((prev) => ({
      ...prev,
      [aulaId]: { aula_id: aulaId, segundos, duracao_segundos: duracao || null, atualizado_em: new Date().toISOString() },
    }));
    await (supabase.rpc as any)("salvar_posicao_aula", {
      p_aula_id: aulaId,
      p_segundos: segundos,
      p_duracao_segundos: duracao || null,
    });
    // Terminou o vídeo (ou passou de 90%): marca como concluída sozinha, sem tirar o botão manual.
    if (duracao > 0 && segundos >= duracao * 0.9 && !concluidas.has(aulaId)) {
      const { error } = await supabase
        .from("curso_aula_progresso")
        .insert({ user_id: user.id, aula_id: aulaId });
      if (!error) {
        setConcluidas((prev) => new Set([...prev, aulaId]));
        if (curso) carregarCertificado(curso.id);
      }
    }
  };

  if (!authLoading && (!user || isAnonymous)) {
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
  const videoIdAtual = youtubeIdDe(embedUrl);
  const posicaoAtual = aulaAtual ? posicoes[aulaAtual.id] : undefined;
  const inicioAtual =
    posicaoAtual && posicaoAtual.segundos > 5 && (!posicaoAtual.duracao_segundos || posicaoAtual.duracao_segundos - 10 > posicaoAtual.segundos)
      ? posicaoAtual.segundos
      : 0;

  return (
    <>
      <Helmet>
        <title>{curso.titulo} — Portal Ayurveda</title>
        <meta name="description" content={curso.descricao ?? ""} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {abaAtiva === "certificado" && (
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
      )}
      {abaAtiva === "aulas" && aulaAtual?.imprimir && (
        <style>{`
          @page { size: A4 portrait; margin: 12mm; }
          @media print {
            body * { visibility: hidden !important; }
            #aula-impressao, #aula-impressao * { visibility: visible !important; }
            #aula-impressao { position: absolute; top: 0; left: 0; width: 100%; }
          }
        `}</style>
      )}

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
                className="hidden sm:block sm:w-40 md:w-48 aspect-[4/3] object-cover rounded-2xl shadow-md shrink-0"
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
                  className="hidden sm:block text-sm md:text-base mb-4 leading-relaxed"
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
        {!temAcesso && slug === "detox-da-primavera" && (
          <div
            className="mb-8 rounded-2xl border-2 p-6 md:p-8 text-center"
            style={{ background: "#FBF3DE", borderColor: "#B8892E" }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "#8C641C" }} />
            <h2 className="font-serif font-bold text-xl md:text-2xl mb-2" style={{ color: PRIMARY }}>
              O Detox da Primavera 2026 é um programa à parte
            </h2>
            <p
              className="text-sm md:text-base mb-5 max-w-xl mx-auto"
              style={{ color: PRIMARY, opacity: 0.85, fontFamily: "'DM Sans', sans-serif" }}
            >
              Se você já pagou, entre no Portal com o mesmo email usado no pagamento. Se ainda não, as inscrições estão abertas.
            </p>
            <Button asChild size="lg" className="rounded-full" style={{ backgroundColor: "#B8892E" }}>
              <Link to="/detox/inscricao">Conhecer o Detox</Link>
            </Button>
          </div>
        )}
        {!temAcesso && slug !== "detox-da-primavera" && (
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
            {curso.banner_html && <BlocoHtml html={curso.banner_html} />}
            {curso.aviso_topo && (
              <div
                className="rounded-[18px] border px-[18px] py-4"
                style={{ background: "#FFF4E8", borderColor: "#F1D3B5" }}
              >
                <TextoAula texto={curso.aviso_topo} />
              </div>
            )}
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
                <div id="player-aula" className="min-w-0 order-1 scroll-mt-20">
                  {aulaAtual && !aulaAberta(aulaAtual) ? (
                    <>
                      <CartaoTrancado aula={aulaAtual} rotulo={rotuloTranca(aulaAtual)} />
                      <div className="mt-5">
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: PRIMARY, opacity: 0.7 }}
                        >
                          {`Aula ${numeroDaAula(aulaAtual.id)}`}
                          {moduloDaAula(aulaAtual) ? ` · ${moduloDaAula(aulaAtual)!.titulo}` : ""}
                        </p>
                      </div>
                    </>
                  ) : aulaAtual ? (
                    <>
                      {embedUrl ? (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md">
                          {videoIdAtual ? (
                            <PlayerYoutube
                              key={aulaAtual.id}
                              videoId={videoIdAtual}
                              inicio={inicioAtual}
                              onTempo={(segundos, duracao) => salvarPosicao(aulaAtual.id, segundos, duracao)}
                            />
                          ) : (
                            <iframe
                              src={embedUrl}
                              title={aulaAtual.titulo}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      ) : null}
                      <div className="mt-5">
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: PRIMARY, opacity: 0.7 }}
                        >
                          {`Aula ${numeroDaAula(aulaAtual.id)}`}
                          {aulaAtual.duracao_segundos ? ` · ${fmtDuracao(aulaAtual.duracao_segundos)}` : ""}
                          {moduloDaAula(aulaAtual) ? ` · ${moduloDaAula(aulaAtual)!.titulo}` : ""}
                        </p>
                        <h2 className="font-serif font-bold text-xl md:text-2xl mb-2" style={{ color: PRIMARY }}>
                          {aulaAtual.titulo}
                        </h2>
                        {aulaAtual.html && (
                          <div className="mb-5">
                            <BlocoHtml html={aulaAtual.html} />
                          </div>
                        )}
                        {aulaAtual.descricao && (
                          <div className="mb-5">
                            <TextoAula texto={aulaAtual.descricao} aulaId={aulaAtual.id} />
                          </div>
                        )}
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2.5 mb-2.5">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!aulaAnterior}
                            onClick={() => aulaAnterior && selecionarAula(aulaAnterior.id)}
                            className="min-h-[60px] rounded-2xl border-2 text-base font-bold"
                            style={{ borderColor: PRIMARY, color: PRIMARY }}
                          >
                            <ChevronLeft className="h-5 w-5" /> Anterior
                          </Button>
                          <Button
                            type="button"
                            disabled={!aulaProxima}
                            onClick={() => aulaProxima && selecionarAula(aulaProxima.id)}
                            className="min-h-[60px] rounded-2xl text-base font-bold flex-col gap-0.5 leading-tight text-white"
                            style={{ backgroundColor: SALMAO }}
                          >
                            <span className="inline-flex items-center gap-1">
                              Próxima aula <ChevronRight className="h-5 w-5" />
                            </span>
                            {aulaProxima && (
                              <span className="text-xs font-medium opacity-95 truncate max-w-full">
                                {aulaProxima.titulo}
                                {aulaProxima.duracao_segundos
                                  ? ` · ${fmtDuracao(aulaProxima.duracao_segundos)}`
                                  : ""}
                              </span>
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={marcarConcluida}
                          disabled={salvando}
                          variant={concluidas.has(aulaAtual.id) ? "outline" : "default"}
                          className="w-full min-h-[60px] rounded-2xl text-base"
                        >
                          {concluidas.has(aulaAtual.id) ? (
                            <>
                              <CheckCircle2 className="mr-2 h-5 w-5" /> Concluída
                            </>
                          ) : (
                            <>
                              <Circle className="mr-2 h-4 w-4" /> Marcar como concluída
                            </>
                          )}
                        </Button>
                        {aulaAtual.imprimir && (
                          <div className="mt-2.5">
                            <Button
                              type="button"
                              onClick={imprimirAula}
                              className="w-full min-h-[60px] text-lg gap-2 bg-primary"
                            >
                              <Printer className="h-6 w-6" /> Imprimir
                            </Button>
                            <p className="text-[16px] mt-1.5 text-center" style={{ color: PRIMARY, opacity: 0.7 }}>
                              No celular, esse botão salva em PDF.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-muted flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Nenhuma aula disponível</p>
                    </div>
                  )}
                </div>

                <aside className="order-2">
                  <div className="space-y-2.5">
                    {modulosConteudo.map((m) => {
                      const aulasMod = aulas
                        .filter((a) => a.modulo_id === m.id)
                        .sort((a, b) => a.ordem - b.ordem);
                      const abertasMod = aulasMod.filter(aulaAberta);
                      const feitasMod = abertasMod.filter((a) => concluidas.has(a.id)).length;
                      return (
                        <div
                          key={m.id}
                          className="rounded-2xl border overflow-hidden bg-white"
                          style={{ borderColor: `${PRIMARY}22` }}
                        >
                          <button
                            type="button"
                            onClick={() => setModuloAberto(moduloAberto === m.id ? null : m.id)}
                            className="w-full flex items-center justify-between gap-2 px-4 min-h-[56px] text-left"
                          >
                            <span
                              className="font-serif font-bold text-[15px] leading-snug"
                              style={{ color: PRIMARY }}
                            >
                              {modulosConteudo.findIndex((x) => x.id === m.id) + 1}. {m.titulo}
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              {abertasMod.length > 0 ? (
                                <span className="text-xs whitespace-nowrap" style={{ color: PRIMARY, opacity: 0.6 }}>
                                  {feitasMod} de {abertasMod.length}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[16px] whitespace-nowrap" style={{ color: "#4A4560" }}>
                                  <Lock className="h-4 w-4" /> Ainda não liberado
                                </span>
                              )}
                              <ChevronDown
                                className={`h-5 w-5 shrink-0 transition-transform ${
                                  moduloAberto === m.id ? "rotate-180" : ""
                                }`}
                                style={{ color: PRIMARY, opacity: 0.6 }}
                              />
                            </span>
                          </button>
                          {moduloAberto === m.id && (
                            <ul className="border-t" style={{ borderColor: `${PRIMARY}14` }}>
                              {aulasMod.map((a) => {
                                const feita = concluidas.has(a.id);
                                const ativa = a.id === aulaSelecionadaId;
                                return (
                                  <li key={a.id}>
                                    <button
                                      onClick={() => selecionarAula(a.id)}
                                      className="w-full text-left flex items-center gap-2.5 px-3 min-h-[60px] border-l-4 transition-colors hover:bg-muted/50"
                                      style={{
                                        borderColor: ativa ? SALMAO : "transparent",
                                        background: ativa ? `${SALMAO}12` : "transparent",
                                      }}
                                    >
                                      <span
                                        className="w-6 text-xs shrink-0"
                                        style={{ color: PRIMARY, opacity: 0.55 }}
                                      >
                                        {numeroDaAula(a.id)}
                                      </span>
                                      <span className="mt-0.5 shrink-0">
                                        {!aulaAberta(a) ? (
                                          <Lock className="h-5 w-5" style={{ color: "#4A4560" }} />
                                        ) : feita ? (
                                          <CheckCircle2 className="h-5 w-5" style={{ color: SALMAO }} />
                                        ) : ativa ? (
                                          <PlayCircle className="h-5 w-5" style={{ color: SALMAO }} />
                                        ) : (
                                          <Circle className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className="text-base leading-snug"
                                          style={{
                                            color: PRIMARY,
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontWeight: ativa ? 600 : 400,
                                          }}
                                        >
                                          {a.titulo}
                                        </p>
                                        {!aulaAberta(a) && (
                                          <p className="text-[16px] mt-0.5" style={{ color: "#4A4560" }}>
                                            {rotuloTranca(a)}
                                          </p>
                                        )}
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
                          )}
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

      {abaAtiva === "aulas" && aulaAtual?.imprimir && (
        <div
          id="aula-impressao"
          className="hidden print:block"
          style={{ background: "#fff", color: "#000", lineHeight: 1.35, textAlign: "left", hyphens: "none" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #352F54",
              paddingBottom: "3mm",
              marginBottom: "5mm",
            }}
          >
            <MarcaPortal />
            <span style={{ marginLeft: "4mm", fontSize: "12pt", color: "#000" }}>{curso.titulo}</span>
            <span style={{ marginLeft: "auto", fontSize: "10pt", color: "#000" }}>portalayurveda.com</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: "18pt", margin: "0 0 4mm", color: "#000" }}>
            {aulaAtual.titulo}
          </h1>
          {aulaAtual.html && <BlocoHtml html={aulaAtual.html} />}
          {aulaAtual.descricao && <TextoAula texto={aulaAtual.descricao} aulaId={aulaAtual.id} impressao />}
        </div>
      )}
    </>
  );
};

export default CursoEstudar;
