import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";
import { agniStyle, AGNI_LABEL } from "./doshaScale";

interface Props {
  tStart: number;
  tEnd: number;
  agniTipo: string | null;
  agniAtual: number | null;
  agniMeta: number | null;
}

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
const EDGE_PAD_MS   = 6 * 24 * 60 * 60 * 1000;

export default function AgniMiniChart({ tStart, agniTipo, agniAtual, agniMeta }: Props) {
  if (agniAtual == null || agniMeta == null) return null;
  const style = agniStyle(agniTipo, agniAtual);
  const tAtual = tStart;
  const tObjetivo = tStart + 30 * 24 * 60 * 60 * 1000;
  const xMin = tAtual - EDGE_PAD_MS;
  const xMax = tAtual + SIX_MONTHS_MS;

  const data = [
    { t: tAtual, agni: agniAtual },
    { t: tObjetivo, agni: agniMeta },
  ];

  const tipo = (agniTipo || "—").toLowerCase();

  return (
    <div
      className="w-full h-[180px] rounded-xl"
      style={{ background: "hsl(var(--surface-sun))" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 28, right: 24, left: 8, bottom: 8 }}>
          <ReferenceLine
            x={tAtual}
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeDasharray="3 3"
            label={{ value: "Atual", position: "top", fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 700 }}
          />
          <ReferenceLine
            x={tObjetivo}
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeDasharray="3 3"
            label={{ value: "Objetivo", position: "top", fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 700 }}
          />
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
              return (
                <div
                  className="rounded-lg border shadow-lg px-3 py-2 text-xs font-semibold"
                  style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: style.color }}
                >
                  <span className="capitalize">Agni {tipo}</span>{" "}
                  <span style={{ color: "hsl(var(--foreground))" }}>{AGNI_LABEL[v] ?? v}</span>
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
