import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";
import { agniStyle, AGNI_LABEL } from "./doshaScale";

export interface AgniPoint {
  t: number;
  nivel: number;
  tipo: "teste" | "reteste" | "meta";
  label: string;
}

interface Props {
  points: AgniPoint[];
  metaPoint: AgniPoint | null;
  agniTipo: string | null;
}

const EDGE_PAD_MS = 14 * 24 * 60 * 60 * 1000;

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
function shortLabel(s: string): string {
  return s
    .replace(/Revisão de\s+/i, "Rev. ")
    .replace(/Diagnóstico/i, "Diagn.");
}

function TickWithLabel(
  labelsByTick: Record<number, string[]>,
  anchorByTick: Record<number, "start" | "middle" | "end">,
  offsetByTick: Record<number, number>,
) {
  return (props: any) => {
    const { x, y, payload } = props;
    const t = payload.value as number;
    const labels = labelsByTick[t] || [];
    const anchor = anchorByTick[t] || "middle";
    const dx = offsetByTick[t] || 0;
    return (
      <g transform={`translate(${x},${y})`}>
        {labels.map((l, i) => (
          <text
            key={i}
            x={dx}
            y={-6 - (labels.length - 1 - i) * 12}
            textAnchor={anchor}
            fill="hsl(var(--primary))"
            fontSize={10}
            fontWeight={700}
          >
            {shortLabel(l)}
          </text>
        ))}
        <text x={0} y={14} textAnchor="middle" fill="hsl(var(--primary))" fontSize={11} fontWeight={600}>
          {monthLabel(t)}
        </text>
      </g>
    );
  };
}

export default function AgniMiniChart({ points, metaPoint, agniTipo }: Props) {
  const all = [...points, ...(metaPoint ? [metaPoint] : [])];
  if (all.length === 0) return null;

  const data = all.map((p) => ({ t: p.t, agni: p.nivel, label: p.label, tipo: p.tipo }));
  const style = agniStyle(agniTipo, points[points.length - 1]?.nivel ?? metaPoint?.nivel ?? null);

  const firstT = all[0].t;
  const lastT = all[all.length - 1].t;
  const firstMonth = startOfMonth(firstT);
  const lastMonth = startOfMonth(lastT);
  const monthTicks: number[] = [];
  for (let m = firstMonth; m <= lastMonth; m = addMonth(m)) monthTicks.push(m);
  if (monthTicks.length === 0) monthTicks.push(firstMonth);

  // Mapeia rótulos por mês (rótulo do ponto fica acima do mês correspondente)
  const labelsByTick: Record<number, string[]> = {};
  const anchorByTick: Record<number, "start" | "middle" | "end"> = {};
  const offsetByTick: Record<number, number> = {};
  for (let i = 0; i < monthTicks.length; i++) {
    const t = monthTicks[i];
    labelsByTick[t] = [];
    if (i === 0 && monthTicks.length > 1) {
      anchorByTick[t] = "start";
      offsetByTick[t] = -4;
    } else if (i === monthTicks.length - 1 && monthTicks.length > 1) {
      anchorByTick[t] = "end";
      offsetByTick[t] = 4;
    } else {
      anchorByTick[t] = "middle";
      offsetByTick[t] = 0;
    }
  }
  for (const p of all) {
    const mk = startOfMonth(p.t);
    if (labelsByTick[mk]) labelsByTick[mk].push(p.label);
  }

  const xMin = firstMonth - EDGE_PAD_MS;
  const xMax = (monthTicks[monthTicks.length - 1] ?? lastMonth) + EDGE_PAD_MS;
  const tipo = (agniTipo || "—").toLowerCase();

  return (
    <div
      className="w-full h-[200px] rounded-xl"
      style={{ background: "hsl(var(--surface-sun))" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 36, right: 24, left: 8, bottom: 8 }}>
          {all.map((p) => (
            <ReferenceLine
              key={`ref-${p.t}`}
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
            tick={TickWithLabel(labelsByTick, anchorByTick, offsetByTick)}
            interval={0}
            stroke="hsl(var(--primary))"
            height={48}
          />
          <YAxis
            type="number"
            domain={[-0.3, 3.3]}
            ticks={[0, 1, 2, 3]}
            interval={0}
            allowDecimals={false}
            tickFormatter={(v) => AGNI_LABEL[v as number] ?? ""}
            stroke="hsl(var(--primary))"
            tick={{ fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 600 }}
            width={84}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length || payload[0].value == null) return null;
              const v = payload[0].value as number;
              const lbl = payload[0].payload?.label as string | undefined;
              return (
                <div
                  className="rounded-lg border shadow-lg px-3 py-2 text-xs space-y-1"
                  style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                >
                  {lbl && (
                    <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {lbl}
                    </div>
                  )}
                  <div className="font-semibold" style={{ color: style.color }}>
                    <span className="capitalize">Agni {tipo}</span>{" "}
                    <span style={{ color: "hsl(var(--foreground))" }}>{AGNI_LABEL[v] ?? v}</span>
                  </div>
                </div>
              );
            }}
            cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)", strokeWidth: 1 }}
          />
          <Line
            dataKey="agni"
            stroke={style.color}
            strokeWidth={3}
            dot={{ r: 5, fill: style.color, stroke: style.color }}
            activeDot={{ r: 7, fill: style.color, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
