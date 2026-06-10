import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEstimativasVendas, useUpdateEstimativa3Meses, useCapacidadeProducao } from "@/hooks/useSamkhyaEstoque";

export const RESULTADO_SEED_KEY = "samkhya:resultado-final:seed";
export const RESULTADO_EVENT = "samkhya:abrir-resultado";

export default function TabEstimativaVendas() {
  const { data = [], isLoading, error } = useEstimativasVendas();
  const capQ = useCapacidadeProducao();
  const update = useUpdateEstimativa3Meses();
  const [local, setLocal] = useState<Record<number, string>>({});
  const [meses, setMeses] = useState<1 | 2 | 3>(2);

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

  const gerarResultado = () => {
    const cap = capQ.data ?? [];
    const estoqueById = new Map<number, number>(cap.map((c) => [c.id, Number(c.estoque_atual ?? 0)]));
    const seed: Record<number, number> = {};
    for (const p of data) {
      const mensal = Number(p.estimativa_mensal ?? 0);
      const estoque = estoqueById.get(p.id) ?? 0;
      const aProduzir = Math.max(0, Math.ceil(mensal * meses) - estoque);
      if (aProduzir > 0) seed[p.id] = aProduzir;
    }
    try {
      sessionStorage.setItem(RESULTADO_SEED_KEY, JSON.stringify({ seed, ts: Date.now() }));
    } catch {}
    window.dispatchEvent(new CustomEvent(RESULTADO_EVENT, { detail: { seed } }));
    toast.success(`Resultado Final gerado com base em ${meses} ${meses === 1 ? "mês" : "meses"}`);
  };

  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap rounded border bg-card p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          <ToggleGroup
            type="single"
            value={String(meses)}
            onValueChange={(v) => v && setMeses(Number(v) as 1 | 2 | 3)}
            size="sm"
          >
            <ToggleGroupItem value="1">1 mês</ToggleGroupItem>
            <ToggleGroupItem value="2">2 meses</ToggleGroupItem>
            <ToggleGroupItem value="3">3 meses</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button size="sm" onClick={gerarResultado} disabled={isLoading || capQ.isLoading}>
          Gerar Resultado Final
        </Button>
      </div>

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
    </div>
  );
}
