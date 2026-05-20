import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  useNecessidadeProducao,
  useProducoesPlanejadas,
  useUpdateProducaoStatus,
} from "@/hooks/useSamkhyaEstoque";
import type { SkProducao } from "@/integrations/supabase/samkhya-client";
import NovaProducaoDialog from "./NovaProducaoDialog";
import { cn } from "@/lib/utils";

const fmtBR = (n: number, frac = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: frac, maximumFractionDigits: frac });

const fmtDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function ProducaoTab() {
  const { data: producoes, isLoading } = useProducoesPlanejadas();
  const [selected, setSelected] = useState<SkProducao | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const update = useUpdateProducaoStatus();
  const necessidade = useNecessidadeProducao(selected);

  const handleConfirm = async (p: SkProducao) => {
    try {
      await update.mutateAsync({ id: p.id, status: "confirmada" });
      toast.success("Produção confirmada");
      if (selected?.id === p.id) setSelected(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };
  const handleCancel = async (p: SkProducao) => {
    try {
      await update.mutateAsync({ id: p.id, status: "cancelada" });
      toast.success("Produção cancelada");
      if (selected?.id === p.id) setSelected(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Coluna esquerda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Produções planejadas</h2>
          <Button onClick={() => setNovoOpen(true)} className="gap-2" size="sm">
            <Plus className="w-4 h-4" /> Nova produção
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Carregando…</p>}
        {!isLoading && (producoes ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma produção planejada.</p>
        )}

        <div className="space-y-3">
          {(producoes ?? []).map((p) => {
            const active = selected?.id === p.id;
            return (
              <Card
                key={p.id}
                onClick={() => setSelected(p)}
                className={cn(
                  "p-4 cursor-pointer transition hover:border-primary",
                  active && "border-primary ring-1 ring-primary",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.produtos?.nome ?? `Produto #${p.produto_id}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {fmtBR(Number(p.unidades_desejadas))} unidades · criado em {fmtDate(p.criado_em)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); handleConfirm(p); }}
                    >
                      <Check className="w-3.5 h-3.5" /> Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); handleCancel(p); }}
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coluna direita */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Necessidade de ingredientes</h2>
        {!selected && (
          <p className="text-muted-foreground text-sm">Selecione uma produção à esquerda para ver a necessidade.</p>
        )}
        {selected && (
          <Card className="overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="font-medium">{selected.produtos?.nome ?? `Produto #${selected.produto_id}`}</div>
              <div className="text-sm text-muted-foreground">{fmtBR(Number(selected.unidades_desejadas))} unidades</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">Necessário (g)</TableHead>
                  <TableHead className="text-right">Em estoque (g)</TableHead>
                  <TableHead className="text-right">Saldo (g)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {necessidade.isLoading && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Calculando…</TableCell></TableRow>
                )}
                {necessidade.data?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Sem receita cadastrada para este produto.</TableCell></TableRow>
                )}
                {(necessidade.data ?? []).map((r) => (
                  <TableRow key={r.ingrediente_id} className={cn(!r.ok && "bg-destructive/10")}>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtBR(r.necessario_g, 2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtBR(r.estoque_g, 2)}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", !r.ok && "text-destructive font-medium")}>
                      {fmtBR(r.saldo_g, 2)}
                    </TableCell>
                    <TableCell>
                      {r.ok ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle2 className="w-4 h-4" /> ok
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive text-sm">
                          <AlertTriangle className="w-4 h-4" /> falta
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <NovaProducaoDialog open={novoOpen} onOpenChange={setNovoOpen} />
    </div>
  );
}
