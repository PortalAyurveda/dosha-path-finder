import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCapacidadeProducao } from "@/hooks/useSamkhyaEstoque";
import SemaforoBadge from "../SemaforoBadge";

export default function TabEstoqueProdutos() {
  const { data = [], isLoading, error } = useCapacidadeProducao();
  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Capacidade de Produção</header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Unidades possíveis</TableHead>
              <TableHead className="text-right">Meta 60 dias</TableHead>
              <TableHead className="text-right">Estimativa 3m</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={4} className="text-muted-foreground">Carregando…</TableCell></TableRow>
            )}
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <SemaforoBadge semaforo={c.semaforo} showLabel />
                    {c.nome}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {Number(c.unidades_possiveis ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right">
                  {Number(c.meta_60_dias ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {c.estimativa_3_meses ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <EstoqueInsumosTable />
    </div>
  );
}

