/** Barra horizontal proporcional reutilizável. */
interface BarProps {
  label: string;
  pct: number; // mostrado no rótulo
  n?: number | null;
  fillPct?: number; // largura visual (0–100). default = pct
  color: string;
  showN?: boolean;
}

export const HBar = ({ label, pct, n, fillPct, color, showN = true }: BarProps) => {
  const width = Math.max(3, Math.min(100, fillPct ?? pct));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium text-[#352F54] truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </span>
        <span className="text-[#7C7189] tabular-nums shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {pct.toFixed(1)}%{showN && n != null ? ` · ${n.toLocaleString("pt-BR")}` : ""}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#EDE8F5] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
};

interface VBarsProps {
  data: { label: string; value: number; sub?: number }[];
  color: string;
  height?: number;
  subColor?: string;
}

export const VBars = ({ data, color, height = 180, subColor }: VBarsProps) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const subMax = subColor ? Math.max(1, ...data.map((d) => d.sub ?? 0)) : 1;
  const showLabels = data.length;
  return (
    <div className="w-full">
      <div className="flex items-end gap-[2px] w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          const subH = subColor && d.sub != null ? (d.sub / subMax) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 min-w-0 group relative">
              {subColor && (
                <div
                  className="w-[2px] rounded-full"
                  style={{ height: `${subH}%`, background: subColor, opacity: 0.7 }}
                  aria-hidden
                />
              )}
              <div
                className="w-full rounded-sm transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${h}%`,
                  background: color,
                  opacity: 0.4 + (d.value / max) * 0.6,
                  minHeight: d.value > 0 ? 2 : 0,
                }}
                title={`${d.label}: ${d.value}${d.sub != null ? ` · ${d.sub} usuários` : ""}`}
              />
            </div>
          );
        })}
      </div>
      {showLabels > 1 && (
        <div className="flex justify-between mt-2 text-[10px] text-[#7C7189]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <span>{data[0].label}</span>
          {data.length > 4 && <span>{data[Math.floor(data.length / 2)].label}</span>}
          <span>{data[data.length - 1].label}</span>
        </div>
      )}
    </div>
  );
};
