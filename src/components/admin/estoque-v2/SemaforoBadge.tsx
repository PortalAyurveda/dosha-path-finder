import type { SkSemaforo } from "@/integrations/supabase/samkhya-client";
import { cn } from "@/lib/utils";

const MAP: Record<SkSemaforo, { bg: string; label: string }> = {
  verde: { bg: "bg-green-500", label: "60+ dias" },
  amarelo: { bg: "bg-yellow-500", label: "30-59 dias" },
  vermelho: { bg: "bg-red-500", label: "< 30 dias" },
};

export default function SemaforoBadge({
  semaforo,
  showLabel = false,
  className,
}: {
  semaforo: SkSemaforo | string | null | undefined;
  showLabel?: boolean;
  className?: string;
}) {
  const key = (semaforo as SkSemaforo) in MAP ? (semaforo as SkSemaforo) : "vermelho";
  const m = MAP[key];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span className={cn("inline-block size-2.5 rounded-full", m.bg)} />
      {showLabel && <span className="text-muted-foreground">{m.label}</span>}
    </span>
  );
}
