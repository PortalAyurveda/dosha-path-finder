import { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowRight, ChevronRight, Play, FileText, Utensils, Leaf, Calendar, GraduationCap, Link as LinkIcon } from "lucide-react";

const INTERNAL_PREFIXES = [
  "/video/",
  "/blog/",
  "/samkhya/produto/",
  "/samkhya/kits/",
  "/receita/",
  "/minha-rotina",
  "/cursos",
];

type InternalCard = {
  path: string;
  title: string;
  kind: "video" | "receita" | "blog" | "produto" | "kit" | "rotina" | "curso" | "generic";
};

const humanize = (segment: string) => {
  const decoded = decodeURIComponent(segment).replace(/[-_]/g, " ").trim();
  if (!decoded) return "Ver mais";
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
};

const extractRParam = (path: string): string | null => {
  const q = path.split("?")[1];
  if (!q) return null;
  const hash = q.split("#")[0];
  const params = new URLSearchParams(hash);
  const r = params.get("r");
  return r && r.trim() ? r.trim() : null;
};

const classifyPath = (path: string): InternalCard["kind"] => {
  if (path.startsWith("/video/")) {
    if (/receita/i.test(path)) return "receita";
    return "video";
  }
  if (path.startsWith("/receita/")) return "receita";
  if (path.startsWith("/blog/")) return "blog";
  if (path.startsWith("/samkhya/produto/")) return "produto";
  if (path.startsWith("/samkhya/kits/")) return "kit";
  if (path.startsWith("/minha-rotina")) return "rotina";
  if (path.startsWith("/cursos")) return "curso";
  return "generic";
};

const iconFor = (kind: InternalCard["kind"]) => {
  switch (kind) {
    case "video": return Play;
    case "receita": return Utensils;
    case "blog": return FileText;
    case "produto": return Leaf;
    case "kit": return Leaf;
    case "rotina": return Calendar;
    case "curso": return GraduationCap;
    default: return LinkIcon;
  }
};

const normalizeToInternalPath = (rawUrl: string): string | null => {
  let url = rawUrl.trim();
  // strip trailing punctuation commonly attached to URLs in prose
  url = url.replace(/[),.;:!?]+$/g, "");
  if (!url) return null;

  if (url.startsWith("/")) {
    // ok
  } else if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (!/(^|\.)portalayurveda\.com$/i.test(parsed.hostname)) return null;
      url = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return null;
    }
  } else {
    return null;
  }

  if (!INTERNAL_PREFIXES.some((p) => url.startsWith(p))) return null;
  return url;
};

const extractInternalCards = (
  content: string,
): { cleanText: string; cards: InternalCard[] } => {
  const cards: InternalCard[] = [];
  const seen = new Set<string>();
  let text = content;

  // 1) Markdown links [title](url)
  const mdRegex = /\[([^\]]+)\]\((\S+?)\)/g;
  text = text.replace(mdRegex, (match, title: string, url: string) => {
    const path = normalizeToInternalPath(url);
    if (!path) return match;
    if (seen.has(path) || cards.length >= 3) return "";
    seen.add(path);
    const rValue = extractRParam(path);
    const kind: InternalCard["kind"] = rValue ? "receita" : classifyPath(path);
    const trimmedTitle = title.trim();
    const finalTitle = trimmedTitle || (rValue ? humanize(rValue) : trimmedTitle);
    cards.push({ path, title: finalTitle, kind });
    return "";
  });

  // 2) Bare URLs (absolute or portalayurveda.com)
  const bareRegex = /(https?:\/\/[^\s)]+|\/[a-z][^\s)]*)/gi;
  text = text.replace(bareRegex, (match) => {
    const path = normalizeToInternalPath(match);
    if (!path) return match;
    if (seen.has(path) || cards.length >= 3) return "";
    seen.add(path);
    const rValue = extractRParam(path);
    if (rValue) {
      cards.push({ path, title: humanize(rValue), kind: "receita" });
    } else {
      const lastSeg = path.split("?")[0].split("#")[0].replace(/\/$/, "").split("/").pop() || "";
      cards.push({ path, title: humanize(lastSeg), kind: classifyPath(path) });
    }
    return "";
  });

  // Cleanup: extra spaces / orphan punctuation / orphan blank lines
  const cleanText = text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/^[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return { cleanText, cards };
};

export interface AkashaRichCard {
  tipo?: string | null;
  titulo?: string | null;
  link?: string | null;
  imagem?: string | null;
  preco?: string | number | null;
}

// Remove lixo técnico de sistema antigo ("Calling xyz with input ...")
const stripSystemNoise = (text: string) =>
  text
    .split("\n")
    .filter((line) => !/^\s*Calling\s+\S+\s+with\s+input/i.test(line))
    .join("\n")
    .trim();

const kindFromTipo = (tipo?: string | null): InternalCard["kind"] => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("video") || t.includes("vídeo")) return "video";
  if (t.includes("receita")) return "receita";
  if (t.includes("produto")) return "produto";
  if (t.includes("kit")) return "kit";
  if (t.includes("curso")) return "curso";
  if (t.includes("rotina")) return "rotina";
  if (t.includes("artigo") || t.includes("blog")) return "blog";
  return "generic";
};

const toRouterPath = (rawLink?: string | null): string | null => {
  const url = (rawLink || "").trim();
  if (!url) return null;
  if (url.startsWith("/")) return url;
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (/(^|\.)portalayurveda\.com$/i.test(parsed.hostname)) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const formatPreco = (preco?: string | number | null): string | null => {
  if (preco === null || preco === undefined || preco === "") return null;
  if (typeof preco === "number") {
    return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  const s = String(preco).trim();
  if (!s) return null;
  return /r\$/i.test(s) ? s : `R$ ${s}`;
};

interface AkashaMessageContentProps {
  content: string;
  proseClassName?: string;
  onNavigate?: () => void;
  cards?: AkashaRichCard[] | null;
}

const MiniCard = ({
  card,
  onNavigate,
}: {
  card: AkashaRichCard;
  onNavigate?: () => void;
}) => {
  const kind = kindFromTipo(card.tipo);
  const Icon = iconFor(kind);
  const path = toRouterPath(card.link);
  const titulo = (card.titulo || "").trim() || "Ver mais";
  const preco = kind === "produto" ? formatPreco(card.preco) : null;
  const isExternal = !path && !!card.link;

  const inner = (
    <>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-akasha/10 text-akasha">
        {card.imagem ? (
          <img src={card.imagem} alt="" className="h-full w-full object-cover" loading="lazy"
              decoding="async" />
        ) : (
          <Icon className="h-4.5 w-4.5" />
        )}
        {kind === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/55">
              <Play className="h-2.5 w-2.5 fill-white text-white" />
            </span>
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium leading-snug text-foreground line-clamp-2">
          {titulo}
        </span>
        {preco && (
          <span className="mt-0.5 block text-[11px] font-semibold text-akasha">{preco}</span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </>
  );

  const className =
    "group flex items-center gap-2.5 rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm transition hover:border-akasha/40 hover:shadow-md";

  if (path) {
    return (
      <Link to={path} onClick={() => onNavigate?.()} className={className}>
        {inner}
      </Link>
    );
  }
  if (isExternal) {
    return (
      <a href={card.link!} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
};

const AkashaMessageContent = ({ content, proseClassName, onNavigate, cards: richCards }: AkashaMessageContentProps) => {
  const hasRich = Array.isArray(richCards) && richCards.length > 0;
  const sanitized = useMemo(() => stripSystemNoise(content), [content]);
  const { cleanText, cards } = useMemo(() => extractInternalCards(sanitized), [sanitized]);

  return (
    <>
      <div className={proseClassName ?? "prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_strong]:text-foreground"}>
        <ReactMarkdown skipHtml>{cleanText}</ReactMarkdown>
      </div>
      {hasRich ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {richCards!.slice(0, 1).map((c, i) => (
            <MiniCard key={i} card={c} onNavigate={onNavigate} />
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {cards.map((card) => {
            const Icon = iconFor(card.kind);
            return (
              <Link
                key={card.path}
                to={card.path}
                onClick={() => onNavigate?.()}
                className="group relative flex items-center gap-2.5 rounded-[14px] rounded-tl-sm rounded-br-sm border border-border bg-card px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-akasha/70" aria-hidden />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-akasha/10 text-akasha">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground line-clamp-2">
                  {card.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-akasha transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export default AkashaMessageContent;
