import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";
import { agniStyle, AGNI_LABEL } from "./doshaScale";
import type { SixMonthWindow } from "./window6m";
import { rowsFromWindow } from "./window6m";

interface Props {
  window: SixMonthWindow;
  agniTipo: string | null;
}

function makeTick(rows: Array<Record<string, any>>) {
  return (props: any) => {
    const { x, y, payload } = props;
    const slot = payload.value as number;
    const row = rows.find((r) => r.slot === slot);
    if (!row) return <g />;
    return (
      <g transform={`translate(${x},${y})`}>
        {row.topLabel && (
          <text x={0} y={-10} textAnchor="middle" fill="hsl(var(--primary))" fontSize={10} fontWeight={700}>
            {row.topLabel}
          </text>
        )}
        <text x={0} y={16} textAnchor="middle" fill="hsl(var(--primary))" fontSize={11} fontWeight={600}>
          {row.isOverflowAnchor ? "‹ " : ""}{row.monthLabel}
        </text>
      </g>
    );
  };
}

export default function AgniMiniChart({ window: win, agniTipo }: Props) {
  if (win.months.length === 0) return null;
  const rows = rowsFromWindow(win);
  const lastVal = [...rows].reverse().find((r) => r.agni != null)?.agni ?? null;
  const style = agniStyle(agniTipo, lastVal);
  const tipoLabel = (agniTipo || "—").toLowerCase();

  const makeDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || payload?.agni == null) return null;
    if (payload.tipo === "reteste") {
      return <circle cx={cx} cy={cy} r={5} fill="hsl(var(--card))" stroke={style.color} strokeWidth={2.5} />;
    }
    if (payload.tipo === "meta") {
      return <circle cx={cx} cy={cy} r={6} fill={style.color} stroke="hsl(var(--card))" strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={5} fill={style.color} stroke={style.color} />;
  };

  return (
    <div className="w-full h-[200px] rounded-xl" style={{ background: "hsl(var(--surface-sun))" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 36, right: 24, left: 8, bottom: 8 }}>
          {rows.map((r) =>
            r.topLabel ? (
              <ReferenceLine
                key={`ref-${r.slot}`}
                x={r.slot}
                stroke="hsl(var(--muted-foreground) / 0.25)"
                strokeDasharray="3 3"
              />
            ) : null,
          )}
          <XAxis
            dataKey="slot"
            type="category"
            tick={makeTick(rows)}
            interval={0}
            stroke="hsl(var(--primary))"
            height={48}
            padding={{ left: 0, right: 0 }}
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
              const row = payload[0].payload;
              const lbl = [row?.topLabel, row?.monthLabel].filter(Boolean).join(" · ");
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
                    <span className="capitalize">Agni {tipoLabel}</span>{" "}
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
            dot={makeDot}
            activeDot={{ r: 7, fill: style.color, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
