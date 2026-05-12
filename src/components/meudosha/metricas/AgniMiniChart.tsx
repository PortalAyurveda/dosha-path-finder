import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { agniStyle, AGNI_LABEL } from "./doshaScale";

interface Props {
  tStart: number;
  tEnd: number;
  agniTipo: string | null;
  agniAtual: number | null;
  agniMeta: number | null;
}

export default function AgniMiniChart({ tStart, tEnd, agniTipo, agniAtual, agniMeta }: Props) {
  if (agniAtual == null || agniMeta == null) return null;
  const style = agniStyle(agniTipo, agniAtual);
  const data = [
    { t: tStart, agni: agniAtual },
    { t: tEnd, agni: agniMeta },
  ];

  return (
    <div className="w-full h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
          <XAxis
            dataKey="t"
            type="number"
            domain={[tStart, tEnd]}
            scale="time"
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
            }
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <YAxis
            domain={[-0.3, 3.3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={(v) => AGNI_LABEL[v as number] || ""}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={70}
            reversed
          />
          <Line
            dataKey="agni"
            stroke={style.color}
            strokeWidth={2}
            strokeDasharray={style.dash}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot x={tStart} y={agniAtual} r={5} fill={style.color} stroke={style.color} />
          <ReferenceDot x={tEnd} y={agniMeta} r={5} fill="white" stroke={style.color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
