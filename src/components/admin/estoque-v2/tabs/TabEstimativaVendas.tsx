import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEstimativasVendas, useUpdateEstimativa3Meses } from "@/hooks/useSamkhyaEstoque";

export default function TabEstimativaVendas() {
  const { data = [], isLoading, error } = useEstimativasVendas();
  const update = useUpdateEstimativa3Meses();
  const [local, setLocal] = useState<Record<number, string>>({});

  useEffect(() => {
    const map: Record<number, string> = {};
    for (const p of data) map[p.id] = String(p.estimativa_3_meses ?? 0);
    setLocal(map);
  }, [data]);

  const salvar = async (id: number) => {
    const v = Number(local[id] ?? 0);
    const orig = Number(data.find((p) => p.id === id)?.estimativa_3_meses ?? 0);
    if (v === orig) return;
    try {
      await update.mutateAsync({ id, total3m: v });
      toast.success("Estimativa atualizada");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao atualizar");
    }
  };

  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <div className="rounded border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="w-[180px]">Total 3 meses</TableHead>
            <TableHead className="w-[140px]">Média/mês</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={3} className="text-muted-foreground">Carregando…</TableCell></TableRow>
          )}
          {data.map((p) => {
            const valor = Number(local[p.id] ?? 0);
            const media = valor / 3;
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={local[p.id] ?? ""}
                    onChange={(e) => setLocal((s) => ({ ...s, [p.id]: e.target.value }))}
                    onBlur={() => salvar(p.id)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {media.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
