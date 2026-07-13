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
import { ZONE_TICKS, ZONE_TICK_LABELS, scoreToLevel } from "./doshaScale";
import type { SixMonthWindow } from "./window6m";
import { rowsFromWindow } from "./window6m";

interface Props {
  window: SixMonthWindow;
}

const VATA = "#6B8AFF";
const PITTA = "#FF7676";
const KAPHA = "#9ED88B";

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
  const row = items[0]?.payload;
  const top = row?.topLabel as string | undefined;
  const month = row?.monthLabel as string | undefined;
  return (
    <div
      className="rounded-lg border shadow-lg px-3 py-2 text-xs space-y-1"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
    >
      {(top || month) && (
        <div
          className="text-[10px] uppercase tracking-wider font-bold"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {[top, month].filter(Boolean).join(" · ")}
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

type DoshaKey = "vata" | "pitta" | "kapha";

function makeDot(color: string, dataKey: DoshaKey) {
  return (props: any) => {
    const { cx, cy, payload } = props;
    const v = payload?.[dataKey];
    if (cx == null || cy == null || v == null) return null;
    const tipo = payload?.tipo;

    // Detectar sobreposição com outras doshas no mesmo nível (mesmo y)
    const order: DoshaKey[] = ["vata", "pitta", "kapha"];
    const sameLevel = order.filter((k) => payload?.[k] === v);
    const idx = sameLevel.indexOf(dataKey);
    const overlap = sameLevel.length > 1;
    // Espalha horizontalmente os rótulos sobrepostos (centro em torno do bullet)
    const labelDx = overlap ? (idx - (sameLevel.length - 1) / 2) * 16 : 0;
    const labelDy = overlap ? -12 : -10;

    let dot;
    if (tipo === "reteste") {
      dot = <circle cx={cx} cy={cy} r={5} fill="hsl(var(--card))" stroke={color} strokeWidth={2.5} />;
    } else if (tipo === "meta") {
      dot = <circle cx={cx} cy={cy} r={6} fill={color} stroke="hsl(var(--card))" strokeWidth={2} />;
    } else {
      dot = <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} />;
    }

    const raw = payload?.[`${dataKey}Raw`];
    const num = raw != null ? raw : v;
    return (
      <g>
        {dot}
        <text
          x={cx + labelDx}
          y={cy + labelDy}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={color}
          opacity={0.9}
        >
          {num}
        </text>
      </g>
    );
  };
}

/** Tick custom: rótulo do ponto (topo, separado) + nome do mês (rodapé, atenuado). */
function makeTick(rows: Array<Record<string, any>>) {
  return (props: any) => {
    const { x, y, payload } = props;
    const slot = payload.value as number;
    const row = rows.find((r) => r.slot === slot);
    if (!row) return <g />;
    return (
      <g transform={`translate(${x},${y})`}>
        {row.topLabel && (
          <text
            x={0}
            y={-22}
            textAnchor="middle"
            fill="hsl(var(--primary))"
            fontSize={11}
            fontWeight={700}
          >
            {row.topLabel}
          </text>
        )}
        <text
          x={0}
          y={18}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={10}
          fontWeight={500}
        >
          {row.isOverflowAnchor ? "‹ " : ""}{row.monthLabel}
        </text>
      </g>
    );
  };
}

export default function DoshasEvolutionChart({ window: win }: Props) {
  if (win.months.length === 0) return null;
  const rows = rowsFromWindow(win);

  return (
    <div className="w-full h-[440px] rounded-xl" style={{ background: "hsl(var(--surface-sun))" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 28, right: 24, left: 8, bottom: 8 }}>
          {[3.5, 6.5, 9.5, 12.5].map((y) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
              ifOverflow="visible"
            />
          ))}

          {rows.map((r) =>
            r.topLabel ? (
              <ReferenceLine
                key={`v-${r.slot}`}
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
            height={56}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            domain={[0.5, 15.5]}
            ticks={ZONE_TICKS}
            tickFormatter={(v) => ZONE_TICK_LABELS[v as number] || ""}
            stroke="hsl(var(--primary))"
            tick={{ fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 600 }}
            width={78}
          />
          <Tooltip
            content={<ZoneTooltip />}
            cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)", strokeWidth: 1 }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: 12,
              paddingTop: 8,
              color: "hsl(var(--primary))",
              fontWeight: 600,
            }}
          />

          <Line
            dataKey="vata" name="Vata"
            stroke={VATA} strokeWidth={3}
            dot={makeDot(VATA, "vata")}
            activeDot={{ r: 7, fill: VATA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="pitta" name="Pitta"
            stroke={PITTA} strokeWidth={3}
            dot={makeDot(PITTA, "pitta")}
            activeDot={{ r: 7, fill: PITTA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="kapha" name="Kapha"
            stroke={KAPHA} strokeWidth={3}
            dot={makeDot(KAPHA, "kapha")}
            activeDot={{ r: 7, fill: KAPHA, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            connectNulls isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
