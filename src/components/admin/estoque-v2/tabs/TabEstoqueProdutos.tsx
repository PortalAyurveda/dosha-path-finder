import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCapacidadeProducao, useUpdateProdutoEstoque } from "@/hooks/useSamkhyaEstoque";
import SemaforoBadge from "../SemaforoBadge";

function fmtNum(n: number | null | undefined, frac = 0) {
  return Number(n ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: frac });
}

export default function TabEstoqueProdutos() {
  const { data = [], isLoading, error } = useCapacidadeProducao();
  const update = useUpdateProdutoEstoque();
  const [local, setLocal] = useState<Record<number, string>>({});
  const timeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const m: Record<number, string> = {};
    for (const r of data) m[r.id] = String(Math.round(Number(r.estoque_atual ?? 0)));
    setLocal(m);
  }, [data]);

  useEffect(() => () => {
    Object.values(timeouts.current).forEach((t) => clearTimeout(t));
  }, []);

  const onChange = (id: number, val: string) => {
    setLocal((s) => ({ ...s, [id]: val }));
    if (timeouts.current[id]) clearTimeout(timeouts.current[id]);
    timeouts.current[id] = setTimeout(async () => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) return;
      const orig = Number(data.find((r) => r.id === id)?.estoque_atual ?? 0);
      if (n === orig) return;
      try {
        await update.mutateAsync({ id, estoque_atual: n });
        toast.success("Estoque atualizado");
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao atualizar");
      }
    }, 600);
  };

  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <section className="rounded border bg-card">
      <header className="p-3 border-b font-medium">Capacidade de Produção</header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="w-[120px]">Estoque atual</TableHead>
            <TableHead className="text-right">Dias rest.</TableHead>
            <TableHead className="w-[110px]">Semáforo estoque</TableHead>
            <TableHead className="text-right">Unid. produzíveis</TableHead>
            <TableHead className="text-right">Meta 60d</TableHead>
            <TableHead className="w-[110px]">Semáforo insumos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={7} className="text-muted-foreground">Carregando…</TableCell></TableRow>
          )}
          {data.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nome}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={local[c.id] ?? ""}
                  onChange={(e) => onChange(c.id, e.target.value)}
                  className="h-8"
                />
              </TableCell>
              <TableCell className="text-right">
                {c.dias_estoque_atual == null ? "—" : `${fmtNum(c.dias_estoque_atual, 0)} d`}
              </TableCell>
              <TableCell><SemaforoBadge semaforo={c.semaforo_estoque} showLabel /></TableCell>
              <TableCell className="text-right">{fmtNum(c.unidades_possiveis)}</TableCell>
              <TableCell className="text-right">{fmtNum(c.meta_60_dias)}</TableCell>
              <TableCell><SemaforoBadge semaforo={c.semaforo_insumos} showLabel /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
