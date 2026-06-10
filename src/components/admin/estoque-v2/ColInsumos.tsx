import { cn } from "@/lib/utils";
import { fmtG } from "./calc";
import type { SkIngrediente } from "@/integrations/supabase/samkhya-client";

type Ing = Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">;

interface Props {
  ingredientes: Ing[];
  necessidade: Map<number, number>;
  loading?: boolean;
}

export default function ColInsumos({ ingredientes, necessidade, loading }: Props) {
  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/40">
        <h3 className="text-sm font-semibold">Estoque de insumos</h3>
        <p className="text-xs text-muted-foreground">{ingredientes.length} ingredientes</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-3 text-sm text-muted-foreground">Carregando…</p>}
        <ul className="divide-y divide-border">
          {ingredientes.map((i) => {
            const nec = necessidade.get(i.id) ?? 0;
            const estoque = Number(i.qnt_estoque_g) || 0;
            let status: "cinza" | "verde" | "vermelho" = "cinza";
            if (nec > 0) status = estoque >= nec ? "verde" : "vermelho";
            return (
              <li key={i.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    status === "cinza" && "bg-muted-foreground/40",
                    status === "verde" && "bg-emerald-500",
                    status === "vermelho" && "bg-destructive",
                  )}
                />
                <span className="flex-1 truncate">{i.nome}</span>
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    status === "vermelho" && "text-destructive font-medium",
                    status === "verde" && "text-emerald-600",
                  )}
                >
                  {fmtG(estoque)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
