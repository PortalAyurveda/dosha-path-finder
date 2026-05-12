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
  agniStyle,
  scoreToLevel,
  agniToLevel,
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

// Paletas alinhadas com tailwind.config.ts (vata.1..5, pitta.1..5, kapha.1..5)
const VATA_SHADES  = ["#D6E0FF", "#A3C1FF", "#709AFF", "#4F75FF", "#2A4BCC"];
const PITTA_SHADES = ["#FFE0E0", "#FFB3B3", "#FF8585", "#FF5C5C", "#CC3333"];
const KAPHA_SHADES = ["#D1F4E0", "#9AE6B8", "#5ED58F", "#22C55E", "#15803D"];

// Mapeia nível 1..15 -> shade 1..5 (uma intensidade por zona).
function shadeForLevel(level: number, palette: string[]): string {
  const z = Math.min(5, Math.max(1, Math.ceil(level / 3)));
  return palette[z - 1];
}

function maxLevel(points: SeriesPoint[], key: "vata" | "pitta" | "kapha"): number {
  let m = 0;
  for (const p of points) {
    const v = p[key];
    if (typeof v === "number" && v > m) m = v;
  }
  return m || 1;
}

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function ZoneTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => p.value != null);
  if (!items.length) return null;
  return (
    <div className="bg-card border rounded-lg shadow-lg p-3 text-xs space-y-1.5">
      {items.map((p) => {
        const key = p.dataKey as string;
        const level = p.value as number;
        const raw = p.payload[`${key}Raw`];
        let info;
        if (key === "agni") info = agniToLevel(p.payload.agniRaw ?? 0);
        else if (key === "vata" || key === "pitta" || key === "kapha")
          info = scoreToLevel(key, raw ?? 0);
        return (
          <div key={key} className="flex items-center gap-2" style={{ color: p.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="capitalize font-semibold">{key}</span>
            <span className="text-muted-foreground">— {raw ?? "—"} —</span>
            <span>{info ? `${info.zona} nível ${info.sub}` : `nível ${level}`}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DoshasEvolutionChart({
  realPoints,
  metaPoint,
  agniTipo,
  agniNivelAtual,
  agniNivelMeta,
}: Props) {
  const all: SeriesPoint[] = [...realPoints];
  if (metaPoint) all.push(metaPoint);
  if (all.length === 0) return null;

  // Janela fixa de 6 meses a partir do primeiro ponto real
  const xMin = realPoints[0]?.t ?? all[0].t;
  const xMax = xMin + SIX_MONTHS_MS;

  const lastReal = realPoints[realPoints.length - 1];
  const projection: SeriesPoint[] = lastReal && metaPoint ? [lastReal, metaPoint] : [];

  // Cores por dosha baseadas no nível máximo observado
  const vataColor  = shadeForLevel(maxLevel([...realPoints, ...(metaPoint ? [metaPoint] : [])], "vata"),  VATA_SHADES);
  const pittaColor = shadeForLevel(maxLevel([...realPoints, ...(metaPoint ? [metaPoint] : [])], "pitta"), PITTA_SHADES);
  const kaphaColor = shadeForLevel(maxLevel([...realPoints, ...(metaPoint ? [metaPoint] : [])], "kapha"), KAPHA_SHADES);
  const agni = agniStyle(agniTipo, agniNivelAtual);

  const ZONE_BOUNDARIES = [3.5, 6.5, 9.5, 12.5];

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={all}
          margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
        >
          {/* Linhas guia sutis nas fronteiras das 5 zonas */}
          {ZONE_BOUNDARIES.map((y) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
              ifOverflow="visible"
            />
          ))}

          <XAxis
            dataKey="t"
            type="number"
            domain={[xMin, xMax]}
            scale="time"
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
            }
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <YAxis
            domain={[0.5, 15.5]}
            ticks={ZONE_TICKS}
            tickFormatter={(v) => ZONE_TICK_LABELS[v as number] || ""}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={70}
          />
          <Tooltip content={<ZoneTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />

          {/* Linhas reais (com legenda) */}
          <Line data={realPoints} dataKey="vata"  name="Vata"  stroke={vataColor}  strokeWidth={2} dot={{ r: 4 }} connectNulls isAnimationActive={false} />
          <Line data={realPoints} dataKey="pitta" name="Pitta" stroke={pittaColor} strokeWidth={2} dot={{ r: 4 }} connectNulls isAnimationActive={false} />
          <Line data={realPoints} dataKey="kapha" name="Kapha" stroke={kaphaColor} strokeWidth={2} dot={{ r: 4 }} connectNulls isAnimationActive={false} />
          <Line data={realPoints} dataKey="agni"  name="Agni"  stroke={agni.color} strokeWidth={2} strokeDasharray={agni.dash} dot={{ r: 4 }} connectNulls isAnimationActive={false} />

          {/* Projeções tracejadas até a meta — sem legenda duplicada */}
          {projection.length === 2 && (
            <>
              <Line data={projection} dataKey="vata"  stroke={vataColor}  strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: "white", strokeWidth: 2 }} legendType="none" isAnimationActive={false} />
              <Line data={projection} dataKey="pitta" stroke={pittaColor} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: "white", strokeWidth: 2 }} legendType="none" isAnimationActive={false} />
              <Line data={projection} dataKey="kapha" stroke={kaphaColor} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: "white", strokeWidth: 2 }} legendType="none" isAnimationActive={false} />
              <Line data={projection} dataKey="agni"  stroke={agniStyle(agniTipo, agniNivelMeta).color} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: "white", strokeWidth: 2 }} legendType="none" isAnimationActive={false} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
