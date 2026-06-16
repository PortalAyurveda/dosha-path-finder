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
  tipo?: "teste" | "reteste";
  label?: string;
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

const EDGE_PAD_MS   = 3 * 24 * 60 * 60 * 1000;

function startOfMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
function addMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}
function monthLabel(ts: number): string {
  const s = new Date(ts).toLocaleDateString("pt-BR", { month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ZoneTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const seen = new Set<string>();
  const items = payload.filter((p) => {
    if (p.value == null) return false;
    if (seen.has(p.dataKey)) return false;
    seen.add(p.dataKey);
    return true;
  });
  if (!items.length) return null;
  const label = items[0]?.payload?.label as string | undefined;
  return (
    <div
      className="rounded-lg border shadow-lg px-3 py-2 text-xs space-y-1"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
    >
      {label && (
        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
          {label}
        </div>
      )}
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


// Custom dot: filled circle for "teste", hollow circle for "reteste", larger for "meta"
function makeDot(color: string) {
  return (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    const tipo = payload?.tipo;
    if (tipo === "reteste") {
      return <circle cx={cx} cy={cy} r={5} fill="hsl(var(--card))" stroke={color} strokeWidth={2.5} />;
    }
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} />;
  };
}

// Custom XAxis tick: month name + ponto/label acima
function makeTick(labelsByTick: Record<number, string[]>) {
  return (props: any) => {
    const { x, y, payload } = props;
    const t = payload.value as number;
    const labels = labelsByTick[t] || [];
    return (
      <g transform={`translate(${x},${y})`}>
        {labels.map((l, i) => (
          <text
            key={i}
            x={0}
            y={-8 - (labels.length - 1 - i) * 13}
            textAnchor="middle"
            fill="hsl(var(--primary))"
            fontSize={10}
            fontWeight={700}
          >
            {l}
          </text>
        ))}
        <text x={0} y={14} textAnchor="middle" fill="hsl(var(--primary))" fontSize={11} fontWeight={600}>
          {monthLabel(t)}
        </text>
      </g>
    );
  };
}

export default function DoshasEvolutionChart({
  realPoints,
  metaPoint,
}: Props) {
  if (realPoints.length === 0 && !metaPoint) return null;

  const firstReal = realPoints[0]?.t ?? metaPoint!.t;
  const lastT = metaPoint?.t ?? realPoints[realPoints.length - 1]?.t ?? firstReal;

  const firstMonth = startOfMonth(firstReal);
  const lastMonth = startOfMonth(lastT);
  const monthTicks: number[] = [];
  for (let m = firstMonth; m <= lastMonth; m = addMonth(m)) {
    monthTicks.push(m);
  }
  if (monthTicks.length === 0) monthTicks.push(firstMonth);

  const xMin = firstMonth - EDGE_PAD_MS;
  const xMax = (monthTicks[monthTicks.length - 1] ?? lastMonth) + EDGE_PAD_MS;

  const data: SeriesPoint[] = [...realPoints, ...(metaPoint ? [metaPoint] : [])];

  // Rótulos do ponto agrupados pelo mês correspondente
  const labelsByTick: Record<number, string[]> = {};
  for (const t of monthTicks) labelsByTick[t] = [];
  for (const p of data) {
    const mk = startOfMonth(p.t);
    if (labelsByTick[mk]) labelsByTick[mk].push(p.label || (p.isMeta ? "Meta" : ""));
  }

  return (
    <div
      className="w-full h-[440px] rounded-xl"
      style={{ background: "hsl(var(--surface-sun))" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 28, right: 24, left: 8, bottom: 8 }}
        >
          {[3.5, 6.5, 9.5, 12.5].map((y) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
              ifOverflow="visible"
            />
          ))}

          {data.map((p) => (
            <ReferenceLine
              key={`v-${p.t}`}
              x={p.t}
              stroke="hsl(var(--muted-foreground) / 0.25)"
              strokeDasharray="3 3"
            />
          ))}

          <XAxis
            dataKey="t"
            type="number"
            domain={[xMin, xMax]}
            scale="time"
            ticks={monthTicks}
            tick={makeTick(labelsByTick)}
            interval={0}
            stroke="hsl(var(--primary))"
            height={56}
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
            dot={makeDot(VATA)}
            activeDot={{ r: 7, fill: VATA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="pitta" name="Pitta"
            stroke={PITTA} strokeWidth={3}
            dot={makeDot(PITTA)}
            activeDot={{ r: 7, fill: PITTA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="kapha" name="Kapha"
            stroke={KAPHA} strokeWidth={3}
            dot={makeDot(KAPHA)}
            activeDot={{ r: 7, fill: KAPHA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
