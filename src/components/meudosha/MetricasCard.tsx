import { useEffect, useState } from "react";
import type { CategoriaMetrica, MetricaCardData } from "@/data/metricasRules";

const CATEGORY_STYLES: Record<
  CategoriaMetrica,
  { bg: string; badgeBg: string; track: string; ink: string; tag: string }
> = {
  Diagnostico: {
    bg: "bg-[#F0EEF8]",
    badgeBg: "bg-[#352F54] text-white",
    track: "stroke-[#E0DDF0]",
    ink: "stroke-[#352F54]",
    tag: "DIAGNÓSTICO",
  },
  Critico: {
    bg: "bg-[#FFF1F1]",
    badgeBg: "bg-[#DC2626] text-white",
    track: "stroke-[#FBD5D5]",
    ink: "stroke-[#DC2626]",
    tag: "CRÍTICO",
  },
  Alerta: {
    bg: "bg-[#FFFBEB]",
    badgeBg: "bg-[#D97706] text-white",
    track: "stroke-[#FDE9C8]",
    ink: "stroke-[#D97706]",
    tag: "ALERTA",
  },
  Atencao: {
    bg: "bg-[#FEFCE8]",
    badgeBg: "bg-[#65A30D] text-white",
    track: "stroke-[#E6F0C8]",
    ink: "stroke-[#65A30D]",
    tag: "ATENÇÃO",
  },
  Paradoxo: {
    bg: "bg-[#EFF6FF]",
    badgeBg: "bg-[#6B8AFF] text-white",
    track: "stroke-[#DCE7FF]",
    ink: "stroke-[#6B8AFF]",
    tag: "PARADOXO",
  },
  Estrutural: {
    bg: "bg-[#F0FDF4]",
    badgeBg: "bg-[#059669] text-white",
    track: "stroke-[#CDEEDB]",
    ink: "stroke-[#059669]",
    tag: "ESTRUTURAL",
  },
};

const CircularProgress = ({
  value,
  trackClass,
  inkClass,
  display,
}: {
  value: number;
  trackClass: string;
  inkClass: string;
  display: string;
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(100, value));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(target), 50);
    return () => clearTimeout(t);
  }, [target]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        className={trackClass}
        strokeWidth="6"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        className={inkClass}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 800ms ease-out" }}
      />
      <text
        x="44"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold"
        style={{ fontSize: "13px", fill: "#352F54", fontFamily: "'Roboto Serif', serif" }}
      >
        {display}
      </text>
    </svg>
  );
};

interface MetricasCardProps {
  card: MetricaCardData;
  index?: number;
}

const MetricasCard = ({ card, index = 0 }: MetricasCardProps) => {
  const style = CATEGORY_STYLES[card.categoria];
  // For "Estrutural" (R49), percentual is a score (101), not a %. Show "≥3 dos 3"-style label.
  const isEstrutural = card.categoria === "Estrutural";
  const ringValue = isEstrutural ? 100 : Math.min(100, card.percentual);
  const ringDisplay = isEstrutural
    ? `${card.percentual}`
    : `${Number.isInteger(card.percentual) ? card.percentual : card.percentual.toFixed(1).replace(".", ",")}%`;

  return (
    <div
      className={`${style.bg} rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-5 space-y-3 animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start gap-4">
        <CircularProgress
          value={ringValue}
          trackClass={style.track}
          inkClass={style.ink}
          display={ringDisplay}
        />
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block ${style.badgeBg} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2`}
          >
            {style.tag}
          </span>
          <h3
            className="font-bold leading-snug"
            style={{
              fontFamily: "'Roboto Serif', 'Inter', serif",
              fontSize: "15px",
              color: "#352F54",
            }}
          >
            {card.titulo}
          </h3>
        </div>
      </div>
      <p
        className="leading-relaxed"
        style={{
          fontFamily: "'DM Sans', 'Inter', sans-serif",
          fontSize: "13px",
          color: "rgba(53, 47, 84, 0.8)",
        }}
      >
        {card.descricao}
      </p>
    </div>
  );
};

export default MetricasCard;
