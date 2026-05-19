import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  icon: ReactNode;
  hoje: string | number;
  hojeSub?: string;
  semana?: string | number;
  semanaLabel?: string;
  to?: string;
  accent?: string; // hex
  footer?: ReactNode;
}

const StatCard = ({
  label,
  icon,
  hoje,
  hojeSub,
  semana,
  semanaLabel = "7d",
  to,
  accent = "#352F54",
  footer,
}: StatCardProps) => {
  const inner = (
    <div className="group h-full bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between gap-2 mb-3 relative">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}15`, color: accent }}
          >
            {icon}
          </div>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {label}
          </span>
        </div>
        {to && (
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="space-y-1 relative">
        <div
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
        >
          {hoje}
        </div>
        {hojeSub && (
          <div className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {hojeSub}
          </div>
        )}
        {semana !== undefined && (
          <div
            className="text-xs text-muted-foreground pt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className="font-medium" style={{ color: accent }}>
              {semana}
            </span>{" "}
            · {semanaLabel}
          </div>
        )}
        {footer && <div className="pt-2">{footer}</div>}
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return inner;
};

export default StatCard;
