import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const DOSHA_PIE_COLORS: Record<string, string> = {
  Vata: "#6B8AFF",
  Pitta: "#FF7676",
  Kapha: "#9ED88B",
};

interface Props {
  vata: number;
  pitta: number;
  kapha: number;
  variant?: "compact" | "full";
}

const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 14;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[11px] font-semibold"
    >
      {name} {value}
    </text>
  );
};

const DoshaPieChart = ({ vata, pitta, kapha, variant = "compact" }: Props) => {
  const data = [
    { name: "Vata", value: vata },
    { name: "Pitta", value: pitta },
    { name: "Kapha", value: kapha },
  ];
  const total = vata + pitta + kapha;

  if (variant === "full") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={32}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            label={CustomPieLabel}
            labelLine={false}
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={DOSHA_PIE_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} pts (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              name,
            ]}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={38}
          innerRadius={22}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={DOSHA_PIE_COLORS[entry.name]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DoshaPieChart;
