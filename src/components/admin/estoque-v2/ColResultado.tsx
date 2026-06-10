import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtG, type ResultadoLinha } from "./calc";

interface Props {
  rows: ResultadoLinha[];
  onConfirmar: () => void;
  podeConfirmar: boolean;
  loading?: boolean;
}

export default function ColResultado({ rows, onConfirmar, podeConfirmar, loading }: Props) {
  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/40">
        <h3 className="text-sm font-semibold">Resultado final</h3>
        <p className="text-xs text-muted-foreground">{rows.length} ingredientes</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 && (
          <p className="p-3 text-sm text-muted-foreground">
            Selecione produtos na coluna ao lado para ver a necessidade agregada.
          </p>
        )}
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.ingrediente_id}
              className={cn(
                "px-3 py-2 text-sm",
                !r.ok && "bg-destructive/10",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    r.ok ? "bg-emerald-500" : "bg-destructive",
                  )}
                />
                <span className="flex-1 truncate font-medium">{r.nome}</span>
              </div>
              <div className="pl-4 mt-1 grid grid-cols-3 gap-1 text-xs tabular-nums">
                <span className="text-muted-foreground">
                  precisa <span className="text-foreground">{fmtG(r.necessario_g)}</span>
                </span>
                <span className="text-muted-foreground">
                  tem <span className="text-foreground">{fmtG(r.estoque_g)}</span>
                </span>
                <span className={cn("text-right", !r.ok && "text-destructive font-medium")}>
                  falta {fmtG(r.falta_g)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border p-3 bg-muted/20">
        <Button
          onClick={onConfirmar}
          disabled={!podeConfirmar || loading}
          className="w-full"
          style={{ backgroundColor: "#7b4963", color: "#fff" }}
        >
          {loading ? "Confirmando…" : "Confirmar Produção"}
        </Button>
      </div>
    </div>
  );
}
