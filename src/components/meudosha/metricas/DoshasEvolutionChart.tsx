import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ZONE_BANDS,
  ZONE_COLORS,
  ZONE_TICKS,
  ZONE_TICK_LABELS,
  agniStyle,
  scoreToLevel,
  agniToLevel,
} from "./doshaScale";

export interface SeriesPoint {
  t: number; // timestamp ms
  vata?: number; vataRaw?: number;
  pitta?: number; pittaRaw?: number;
  kapha?: number; kaphaRaw?: number;
  agni?: number; agniRaw?: number | null;
  isMeta?: boolean;
}

interface Props {
  realPoints: SeriesPoint[]; // pontos reais (incluindo "Hoje" no início)
  metaPoint: SeriesPoint | null; // ponto da meta (data_fim)
  agniTipo: string | null;
  agniNivelAtual: number | null;
  agniNivelMeta: number | null;
}

const DOSHA_COLORS = {
  vata: "hsl(228 100% 65%)",
  pitta: "hsl(0 85% 65%)",
  kapha: "hsl(105 45% 50%)",
};

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
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span className="capitalize font-semibold">{key}</span>
            <span className="text-muted-foreground">— {raw ?? "—"} —</span>
            <span>
              {info ? `${info.zona} nível ${info.sub}` : `nível ${level}`}
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
  agniTipo,
  agniNivelAtual,
  agniNivelMeta,
}: Props) {
  const agni = agniStyle(agniTipo, agniNivelAtual);

  // Dados completos para zonas/eixo
  const all: SeriesPoint[] = [...realPoints];
  if (metaPoint) all.push(metaPoint);

  if (all.length === 0) return null;

  const xMin = all[0].t;
  const xMax = all[all.length - 1].t;

  // Segmento projetado: último real -> meta (linha tracejada por dosha)
  const lastReal = realPoints[realPoints.length - 1];
  const projection: SeriesPoint[] = lastReal && metaPoint ? [lastReal, metaPoint] : [];

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={all}
          margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
        >
          {/* Faixas de zona */}
          {ZONE_BANDS.map((b, i) => {
            const opacity = b.sub === 1 ? 0.18 : b.sub === 2 ? 0.32 : 0.5;
            return (
              <ReferenceArea
                key={i}
                y1={b.from}
                y2={b.to}
                fill={ZONE_COLORS[b.zona]}
                fillOpacity={opacity}
                stroke="none"
                ifOverflow="visible"
              />
            );
          })}
          {/* Destaque da zona Normal */}
          <ReferenceArea
            y1={3.5}
            y2={6.5}
            stroke="hsl(150 45% 45%)"
            strokeOpacity={0.4}
            strokeDasharray="2 4"
            fill="none"
          />

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

          {/* Linhas reais */}
          <Line
            data={realPoints}
            dataKey="vata"
            name="Vata"
            stroke={DOSHA_COLORS.vata}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            data={realPoints}
            dataKey="pitta"
            name="Pitta"
            stroke={DOSHA_COLORS.pitta}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            data={realPoints}
            dataKey="kapha"
            name="Kapha"
            stroke={DOSHA_COLORS.kapha}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            data={realPoints}
            dataKey="agni"
            name="Agni"
            stroke={agni.color}
            strokeWidth={2}
            strokeDasharray={agni.dash}
            dot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />

          {/* Projeções tracejadas até a meta */}
          {projection.length === 2 && (
            <>
              <Line
                data={projection}
                dataKey="vata"
                stroke={DOSHA_COLORS.vata}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: "white", strokeWidth: 2 }}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                data={projection}
                dataKey="pitta"
                stroke={DOSHA_COLORS.pitta}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: "white", strokeWidth: 2 }}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                data={projection}
                dataKey="kapha"
                stroke={DOSHA_COLORS.kapha}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: "white", strokeWidth: 2 }}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                data={projection}
                dataKey="agni"
                stroke={agniStyle(agniTipo, agniNivelMeta).color}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: "white", strokeWidth: 2 }}
                legendType="none"
                isAnimationActive={false}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
