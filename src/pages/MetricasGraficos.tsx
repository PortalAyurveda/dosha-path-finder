import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { C, SERIF, SANS, LEAF } from "@/components/metricas/theme";
import { useGraficos, type GraficoRow } from "@/components/metricas/useMetricasData";
import MetricasShell from "@/components/metricas/MetricasShell";

interface ChartistDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
}

interface ChartistShape {
  labels: string[];
  datasets: ChartistDataset[];
}

/** Converte o formato {labels, datasets} (Chart.js style) para o array
 *  esperado pelo Recharts: [{ x: 'Pouco', Vata: 0.6, Pitta: 1, Kapha: 0.8 }, ...] */
function toRechartsRows(d: ChartistShape): Array<Record<string, number | string>> {
  return d.labels.map((label, i) => {
    const row: Record<string, number | string> = { x: label };
    for (const ds of d.datasets) {
      row[ds.label] = ds.data[i];
    }
    return row;
  });
}

const tooltipStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  fontFamily: SANS,
  fontSize: 12,
  color: C.primary,
};

const LineCard = ({ row }: { row: GraficoRow }) => {
  const d = row.dados as ChartistShape;
  const rows = toRechartsRows(d);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis dataKey="x" tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
        <YAxis tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
        <Tooltip contentStyle={tooltipStyle} />
        {d.datasets.map((ds) => (
          <Line
            key={ds.label}
            type="monotone"
            dataKey={ds.label}
            stroke={ds.borderColor ?? C.primary}
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const BarCard = ({ row }: { row: GraficoRow }) => {
  const d = row.dados as ChartistShape;
  const rows = toRechartsRows(d);
  const ds = d.datasets[0];
  // backgroundColor pode ser string (cor única) ou array (uma por barra)
  const colors = Array.isArray(ds.backgroundColor) ? ds.backgroundColor : null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="x" tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
        <YAxis
          tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }}
          domain={row.grafico_id === "imc_por_dosha" ? [18, "auto"] : [0, "auto"]}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${C.border}80` }} />
        <Bar dataKey={ds.label} radius={[8, 8, 0, 0]} fill={typeof ds.backgroundColor === "string" ? ds.backgroundColor : C.primary}>
          {colors &&
            rows.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const ChartCard = ({ row, index }: { row: GraficoRow; index: number }) => (
  <article
    className="p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 animate-fade-in"
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: LEAF,
      boxShadow: "0 2px 12px -8px rgba(53,47,84,0.18)",
      animationDelay: `${index * 40}ms`,
      animationFillMode: "both",
    }}
  >
    <header className="space-y-1">
      <h3 className="font-bold leading-snug" style={{ fontFamily: SERIF, color: C.primary, fontSize: "15px" }}>
        {row.titulo}
      </h3>
      {row.subtitulo && (
        <p className="text-[12px] leading-relaxed" style={{ color: C.muted, fontFamily: SANS }}>
          {row.subtitulo}
        </p>
      )}
    </header>

    <div className="flex-1">
      {row.tipo_grafico === "line" ? <LineCard row={row} /> : <BarCard row={row} />}
    </div>
  </article>
);

const ChartSkeleton = () => (
  <div className="h-[320px] animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
);

const MetricasGraficos = () => {
  const { data: graficos, isLoading } = useGraficos();

  return (
    <MetricasShell
      title="Gráficos Clínicos | Doshas e Agni | Portal Ayurveda"
      description="Visualizações dos padrões clínicos: alimentação, IMC, Agni e níveis de cada dosha cruzados com milhares de diagnósticos."
      canonicalPath="/metricas/graficos"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {isLoading || !graficos
          ? Array.from({ length: 9 }).map((_, i) => <ChartSkeleton key={i} />)
          : graficos.map((row, i) => <ChartCard key={row.grafico_id} row={row} index={i} />)}
      </div>
    </MetricasShell>
  );
};

export default MetricasGraficos;
