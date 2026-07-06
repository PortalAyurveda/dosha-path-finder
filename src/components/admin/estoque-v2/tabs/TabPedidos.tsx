import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Printer, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  samkhyaSupabase,
  type SkPedidoCompra,
  type SkPedidoCompraItem,
} from "@/integrations/supabase/samkhya-client";
import { fmtBRL } from "../pedido-compra";

const fmtDate = (s: string | null) =>
  s
    ? new Date(s).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const statusBadgeClass = (status: string) => {
  if (status === "confirmado") return "bg-green-100 text-green-800 border-green-300";
  if (status === "cancelado") return "bg-gray-100 text-gray-600 border-gray-300";
  return "bg-amber-100 text-amber-800 border-amber-300";
};

const statusLabel = (status: string) => {
  if (status === "confirmado") return "Comprado";
  if (status === "cancelado") return "Cancelado";
  return "Aberto";
};

const PRINT_CSS = `@media print {
  body * { visibility: hidden; }
  .print-area, .print-area * { visibility: visible; }
  .print-area { position: absolute; left: 0; top: 0; width: 100%; }
}`;

export default function TabPedidos() {
  const qc = useQueryClient();
  const [printingId, setPrintingId] = useState<number | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["sk-v2", "pedidos-compra"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("pedidos_compra")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SkPedidoCompra[];
    },
  });

  useEffect(() => {
    const handler = () => setPrintingId(null);
    window.addEventListener("afterprint", handler);
    return () => window.removeEventListener("afterprint", handler);
  }, []);

  const imprimir = (id: number) => {
    setPrintingId(id);
    setTimeout(() => window.print(), 50);
  };

  const atualizarStatus = async (
    id: number,
    status: "confirmado" | "cancelado",
  ) => {
    try {
      const { error } = await samkhyaSupabase
        .from("pedidos_compra")
        .update({ status, atualizado_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success(
        status === "confirmado" ? "Pedido marcado como comprado" : "Pedido cancelado",
      );
      qc.invalidateQueries({ queryKey: ["sk-v2"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando…</div>;
  }

  if (data.length === 0) {
    return (
      <div className="rounded border bg-card p-6 text-sm text-muted-foreground text-center">
        Nenhum pedido de compra. Os pedidos são gerados no planejamento de produção.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>{PRINT_CSS}</style>
      {data.map((pedido) => {
        const itens = (pedido.itens ?? []) as SkPedidoCompraItem[];
        const isPrinting = printingId === pedido.id;
        return (
          <div
            key={pedido.id}
            className={`rounded border bg-card ${isPrinting ? "print-area" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 p-3 border-b">
              <div>
                <div className="font-semibold">
                  Pedido de Compra #{pedido.id} — Samkhya Ayurveda
                </div>
                <div className="text-xs text-muted-foreground">
                  {fmtDate(pedido.criado_em)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border print:hidden ${statusBadgeClass(
                    pedido.status,
                  )}`}
                >
                  {statusLabel(pedido.status)}
                </span>
                <div className="font-semibold">
                  {fmtBRL(Number(pedido.total_estimado_r ?? 0))}
                </div>
                <div className="flex items-center gap-1 print:hidden">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => imprimir(pedido.id)}
                  >
                    <Printer className="size-3.5 mr-1" /> Imprimir
                  </Button>
                  {pedido.status === "aberto" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => atualizarStatus(pedido.id, "confirmado")}
                      >
                        <Check className="size-3.5 mr-1" /> Marcar como comprado
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => atualizarStatus(pedido.id, "cancelado")}
                      >
                        <X className="size-3.5 mr-1" /> Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {pedido.notas && (
              <div className="px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap border-b">
                {pedido.notas}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className="text-right">Necessário</TableHead>
                    <TableHead className="text-right">Comprar</TableHead>
                    <TableHead className="text-right">Preço est.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((it) => (
                    <TableRow key={it.ingrediente_id}>
                      <TableCell>{it.ingrediente_nome}</TableCell>
                      <TableCell className="text-right">
                        {Number(it.qtd_necessaria_g).toLocaleString("pt-BR")} g
                      </TableCell>
                      <TableCell className="text-right">{it.qtd_display}</TableCell>
                      <TableCell className="text-right">
                        {fmtBRL(Number(it.preco_estimado))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {fmtBRL(Number(pedido.total_estimado_r ?? 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
