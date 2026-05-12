import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ZONE_TICKS,
  ZONE_TICK_LABELS,
  scoreToLevel,
} from "./doshaScale";

export interface SeriesPoint {
  t: number;
  vata?: number; vataRaw?: number;
  pitta?: number; pittaRaw?: number;
  kapha?: number; kaphaRaw?: number;
  agni?: number; agniRaw?: number | null;
  isMeta?: boolean;
}

interface Props {
  realPoints: SeriesPoint[];
  metaPoint: SeriesPoint | null;
  agniTipo: string | null;
  agniNivelAtual: number | null;
  agniNivelMeta: number | null;
}

// Cores densas alinhadas com o gráfico em pizza de /meu-dosha
const VATA  = "#4F75FF";
const PITTA = "#FF5C5C";
const KAPHA = "#22C55E";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
const EDGE_PAD_MS   = 6 * 24 * 60 * 60 * 1000; // pequeno respiro à esquerda

function ZoneTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  // Dedupe por dataKey (real + projeção compartilham a mesma chave)
  const seen = new Set<string>();
  const items = payload.filter((p) => {
    if (p.value == null) return false;
    if (seen.has(p.dataKey)) return false;
    seen.add(p.dataKey);
    return true;
  });
  if (!items.length) return null;
  return (
    <div
      className="rounded-lg border shadow-lg px-3 py-2 text-xs space-y-1"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
    >
      {items.map((p) => {
        const key = p.dataKey as "vata" | "pitta" | "kapha";
        const raw = p.payload[`${key}Raw`];
        const info = raw != null ? scoreToLevel(key, raw) : null;
        return (
          <div key={key} className="flex items-center gap-2 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="capitalize" style={{ color: p.color }}>{key}</span>
            <span style={{ color: "hsl(var(--foreground))" }}>
              {info ? `${info.zona} ${info.sub}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DoshasEvolutionChart({
  realPoints,
  metaPoint,
}: Props) {
  if (realPoints.length === 0 && !metaPoint) return null;

  const firstReal = realPoints[0]?.t ?? metaPoint!.t;
  const xMin = firstReal - EDGE_PAD_MS;
  const xMax = firstReal + SIX_MONTHS_MS;

  // Combina real + meta numa série única por dosha (linha sólida contínua)
  const data: SeriesPoint[] = [...realPoints, ...(metaPoint ? [metaPoint] : [])];

  const tAtual = firstReal;
  const tObjetivo = metaPoint?.t ?? null;

  return (
    <div
      className="w-full h-[420px] rounded-xl"
      style={{ background: "hsl(var(--surface-sun))" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 28, right: 24, left: 8, bottom: 8 }}
        >
          {/* Linhas guia sutis nas fronteiras das 5 zonas */}
          {[3.5, 6.5, 9.5, 12.5].map((y) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
              ifOverflow="visible"
            />
          ))}

          {/* Marcações verticais "Atual" e "Objetivo" */}
          <ReferenceLine
            x={tAtual}
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeDasharray="3 3"
            label={{
              value: "Atual",
              position: "top",
              fill: "hsl(var(--primary))",
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          {tObjetivo != null && (
            <ReferenceLine
              x={tObjetivo}
              stroke="hsl(var(--muted-foreground) / 0.4)"
              strokeDasharray="3 3"
              label={{
                value: "Objetivo",
                position: "top",
                fill: "hsl(var(--primary))",
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          )}

          <XAxis
            dataKey="t"
            type="number"
            domain={[xMin, xMax]}
            scale="time"
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
            }
            stroke="hsl(var(--primary))"
            tick={{ fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            domain={[0.5, 15.5]}
            ticks={ZONE_TICKS}
            tickFormatter={(v) => ZONE_TICK_LABELS[v as number] || ""}
            stroke="hsl(var(--primary))"
            tick={{ fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 600 }}
            width={78}
          />
          <Tooltip content={<ZoneTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)", strokeWidth: 1 }} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "hsl(var(--primary))", fontWeight: 600 }}
          />

          <Line
            dataKey="vata" name="Vata"
            stroke={VATA} strokeWidth={3}
            dot={{ r: 5, fill: VATA, stroke: VATA }}
            activeDot={{ r: 7, fill: VATA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="pitta" name="Pitta"
            stroke={PITTA} strokeWidth={3}
            dot={{ r: 5, fill: PITTA, stroke: PITTA }}
            activeDot={{ r: 7, fill: PITTA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="kapha" name="Kapha"
            stroke={KAPHA} strokeWidth={3}
            dot={{ r: 5, fill: KAPHA, stroke: KAPHA }}
            activeDot={{ r: 7, fill: KAPHA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
