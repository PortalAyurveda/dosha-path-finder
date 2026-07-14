import { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Play, FileText, Utensils, Leaf, Calendar, GraduationCap, Link as LinkIcon } from "lucide-react";

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
    cards.push({ path, title: title.trim(), kind: classifyPath(path) });
    return "";
  });

  // 2) Bare URLs (absolute or portalayurveda.com)
  const bareRegex = /(https?:\/\/[^\s)]+|\/[a-z][^\s)]*)/gi;
  text = text.replace(bareRegex, (match) => {
    const path = normalizeToInternalPath(match);
    if (!path) return match;
    if (seen.has(path) || cards.length >= 3) return "";
    seen.add(path);
    const lastSeg = path.split("?")[0].split("#")[0].replace(/\/$/, "").split("/").pop() || "";
    cards.push({ path, title: humanize(lastSeg), kind: classifyPath(path) });
    return "";
  });

  // Cleanup: extra spaces / orphan punctuation
  const cleanText = text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { cleanText, cards };
};

interface AkashaMessageContentProps {
  content: string;
  proseClassName?: string;
}

const AkashaMessageContent = ({ content, proseClassName }: AkashaMessageContentProps) => {
  const { cleanText, cards } = useMemo(() => extractInternalCards(content), [content]);

  return (
    <>
      <div className={proseClassName ?? "prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_strong]:text-foreground"}>
        <ReactMarkdown skipHtml>{cleanText}</ReactMarkdown>
      </div>
      {cards.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {cards.map((card) => {
            const Icon = iconFor(card.kind);
            return (
              <Link
                key={card.path}
                to={card.path}
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
      )}
    </>
  );
};

export default AkashaMessageContent;
