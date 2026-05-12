import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { agniStyle, AGNI_LABEL } from "./doshaScale";

interface Props {
  agniTipo: string | null;
  agniAtual: number | null;
  agniMeta: number | null;
  fraseClinica: string | null;
}

export default function AgniIndicator({ agniTipo, agniAtual, agniMeta, fraseClinica }: Props) {
  const style = agniStyle(agniTipo, agniAtual);
  const tipo = (agniTipo || "—").toLowerCase();

  return (
    <div
      className="rounded-2xl border bg-card p-4 md:p-5 space-y-3"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: style.color, color: "white" }}
        >
          <Flame className="w-4 h-4" />
        </div>
        <Badge
          style={{ background: style.color, color: "white", border: "none" }}
          className="capitalize"
        >
          Agni {tipo}
        </Badge>
        <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Agni <strong className="capitalize">{tipo}</strong>{" "}
          nível {AGNI_LABEL[agniAtual ?? -1] ?? "—"}{" "}
          → meta: nível {AGNI_LABEL[agniMeta ?? -1] ?? "—"}
        </p>
      </div>
      {fraseClinica && (
        <p
          className="text-sm leading-relaxed pt-1 border-t"
          style={{ color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }}
        >
          {fraseClinica}
        </p>
      )}
    </div>
  );
}
