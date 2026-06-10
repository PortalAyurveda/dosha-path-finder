import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useIngredientesRaw,
  useProdutosAtivos,
  useReceitasAll,
  useConfirmarProducao,
} from "@/hooks/useSamkhyaEstoque";
import { agregarNecessidade, montarResultado, fmtG, type Selecao } from "../calc";

export default function TabResultadoFinal() {
  const ingQ = useIngredientesRaw();
  const prodQ = useProdutosAtivos();
  const recQ = useReceitasAll();
  const confirmar = useConfirmarProducao();

  const [selecao, setSelecao] = useState<Selecao>({});

  const ingredientes = ingQ.data ?? [];
  const produtos = prodQ.data ?? [];
  const receitas = recQ.data ?? [];

  const necessidade = useMemo(
    () => agregarNecessidade(produtos, selecao, receitas),
    [produtos, selecao, receitas],
  );
  const resultado = useMemo(
    () => montarResultado(necessidade, ingredientes),
    [necessidade, ingredientes],
  );

  const podeConfirmar = Object.values(selecao).some((n) => n > 0);

  const handleConfirmar = async () => {
    const producoes = Object.entries(selecao)
      .filter(([, u]) => u > 0)
      .map(([id, u]) => ({ produto_id: Number(id), unidades_desejadas: u }));
    const abates = Array.from(necessidade.entries()).map(([ingId, nec]) => {
      const cur = ingredientes.find((i) => i.id === ingId);
      const estoque = Number(cur?.qnt_estoque_g ?? 0);
      return { ingrediente_id: ingId, quantidade_g: nec, novo_estoque: estoque - nec };
    });
    try {
      await confirmar.mutateAsync({ producoes, abates });
      setSelecao({});
      toast.success("Produção confirmada e estoque atualizado");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao confirmar");
    }
  };

  const toggle = (id: number, on: boolean) =>
    setSelecao((s) => ({ ...s, [id]: on ? s[id] || 1 : 0 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Produtos a produzir</header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="w-32">Unidades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((p) => {
              const v = selecao[p.id] ?? 0;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox checked={v > 0} onCheckedChange={(c) => toggle(p.id, !!c)} />
                  </TableCell>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={v || ""}
                      onChange={(e) =>
                        setSelecao((s) => ({ ...s, [p.id]: Math.max(0, Number(e.target.value)) }))
                      }
                      className="h-8"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <section className="rounded border bg-card flex flex-col">
        <header className="p-3 border-b font-medium flex items-center justify-between">
          Ingredientes necessários
          <Button
            size="sm"
            disabled={!podeConfirmar || confirmar.isPending}
            onClick={handleConfirmar}
            style={{ background: "#7b4963" }}
            className="text-white hover:opacity-90"
          >
            Confirmar Produção
          </Button>
        </header>
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead className="text-right">Necessário</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Falta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-muted-foreground text-sm">Selecione produtos para calcular.</TableCell></TableRow>
              )}
              {resultado.map((r) => (
                <TableRow key={r.ingrediente_id} className={r.ok ? "" : "bg-red-50"}>
                  <TableCell>{r.nome}</TableCell>
                  <TableCell className="text-right">{fmtG(r.necessario_g)}</TableCell>
                  <TableCell className="text-right">{fmtG(r.estoque_g)}</TableCell>
                  <TableCell className={`text-right ${r.ok ? "text-green-600" : "text-red-600 font-medium"}`}>
                    {r.ok ? "OK" : fmtG(r.falta_g)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
