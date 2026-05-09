import { cn } from "@/lib/utils";
import { SCORE_AXES, type ScoreValues } from "@/lib/doshaTest";

interface Props {
  value: ScoreValues;
  onChange: (next: ScoreValues) => void;
  compact?: boolean;
}

const axisColor: Record<string, string> = {
  v: "bg-vata/20 border-vata text-foreground",
  p: "bg-pitta/20 border-pitta text-foreground",
  k: "bg-kapha/20 border-kapha text-foreground",
  agni_irregular: "bg-amber-200/40 border-amber-400 text-foreground",
  agni_forte: "bg-orange-200/40 border-orange-400 text-foreground",
  agni_fraco: "bg-blue-200/40 border-blue-400 text-foreground",
};

const ScoreTagPicker = ({ value, onChange }: Props) => {
  const setAxis = (key: keyof ScoreValues, n: number) => {
    const current = value[key] ?? 0;
    const next: ScoreValues = { ...value };
    if (current === n) {
      delete next[key];
    } else {
      next[key] = n;
    }
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {SCORE_AXES.map(axis => {
        const current = value[axis.key] ?? 0;
        return (
          <div key={axis.key} className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-muted-foreground w-28 shrink-0">{axis.label}</span>
            <div className="flex gap-1 flex-wrap">
              {axis.range.map(n => {
                const active = current === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAxis(axis.key, n)}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-md border transition-colors",
                      active
                        ? axisColor[axis.key as string] + " font-bold"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {n > 0 ? `+${n}` : n}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreTagPicker;
