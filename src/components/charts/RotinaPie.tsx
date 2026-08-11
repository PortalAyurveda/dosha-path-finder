import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  data: Array<{ name: string; value: number }>;
  colors: Record<string, string>;
}

const RotinaPie = ({ data, colors }: Props) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={18}
        outerRadius={36}
        startAngle={90}
        endAngle={-270}
        stroke="none"
        isAnimationActive
        animationDuration={700}
      >
        {data.map((d) => (
          <Cell key={d.name} fill={colors[d.name]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export default RotinaPie;
