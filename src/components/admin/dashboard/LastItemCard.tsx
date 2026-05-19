import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface LastItemCardProps {
  label: string;
  icon: ReactNode;
  thumb?: string | null;
  title: string;
  subtitle?: string;
  when?: string;
  to?: string;
  accent?: string;
}

const tempoRelativo = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-BR");
};

const LastItemCard = ({
  label,
  icon,
  thumb,
  title,
  subtitle,
  when,
  to,
  accent = "#352F54",
}: LastItemCardProps) => {
  const inner = (
    <div className="group h-full bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}15`, color: accent }}
        >
          {icon}
        </div>
        <span
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
        {to && (
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="flex gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
            loading="lazy"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: `${accent}10`, color: accent }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-semibold line-clamp-2 leading-tight"
            style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="text-xs text-muted-foreground line-clamp-1 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtitle}
            </div>
          )}
          {when && (
            <div
              className="text-[11px] text-muted-foreground mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tempoRelativo(when)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return inner;
};

export default LastItemCard;
