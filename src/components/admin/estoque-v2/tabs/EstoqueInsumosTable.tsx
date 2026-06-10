import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useNecessidadeIngredientes,
  useUpdateIngredienteEstoque,
} from "@/hooks/useSamkhyaEstoque";

type Filtro = "todos" | "falta" | "ok";

const STATUS_ORDER: Record<string, number> = { falta: 0, ok: 1, sem_pedido: 2 };
const STATUS_STYLE: Record<string, { bg: string; label: string }> = {
  falta: { bg: "bg-red-500", label: "Falta" },
  ok: { bg: "bg-green-500", label: "OK" },
  sem_pedido: { bg: "bg-gray-400", label: "Sem pedido" },
};

function fmtPeso(g: number | null | undefined) {
  const n = Number(g ?? 0);
  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
  }
  return `${Math.round(n).toLocaleString("pt-BR")} g`;
}

export default function EstoqueInsumosTable() {
  const { data = [], isLoading, error } = useNecessidadeIngredientes();
  const update = useUpdateIngredienteEstoque();

  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [local, setLocal] = useState<Record<number, string>>({});
  const timeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const m: Record<number, string> = {};
    for (const r of data) m[r.id] = String(Math.round(Number(r.qnt_estoque_g ?? 0)));
    setLocal(m);
  }, [data]);

  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const onChangeEstoque = (id: number, val: string) => {
    setLocal((s) => ({ ...s, [id]: val }));
    if (timeouts.current[id]) clearTimeout(timeouts.current[id]);
    timeouts.current[id] = setTimeout(async () => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) return;
      const orig = Number(data.find((r) => r.id === id)?.qnt_estoque_g ?? 0);
      if (n === orig) return;
      try {
        await update.mutateAsync({ id, qnt: n });
        toast.success("Estoque atualizado");
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao atualizar");
      }
    }, 600);
  };

  const rows = useMemo(() => {
    const filtered = data.filter((r) => {
      if (filtro === "todos") return true;
      if (filtro === "falta") return r.status === "falta";
      if (filtro === "ok") return r.status === "ok";
      return true;
    });
    return [...filtered].sort((a, b) => {
      const sa = STATUS_ORDER[a.status as string] ?? 99;
      const sb = STATUS_ORDER[b.status as string] ?? 99;
      if (sa !== sb) return sa - sb;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [data, filtro]);

  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <section className="rounded border bg-card">
      <header className="p-3 border-b flex items-center justify-between gap-3 flex-wrap">
        <div className="font-medium">Estoque de Insumos</div>
        <div className="flex gap-1">
          {(["todos", "falta", "ok"] as Filtro[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filtro === f ? "default" : "outline"}
              onClick={() => setFiltro(f)}
              className="capitalize"
            >
              {f === "todos" ? "Todos" : f === "falta" ? "Falta" : "OK"}
            </Button>
          ))}
        </div>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingrediente</TableHead>
            <TableHead className="w-[160px]">Em estoque</TableHead>
            <TableHead className="text-right">Necessário</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">Carregando…</TableCell></TableRow>
          )}
          {!isLoading && rows.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground text-sm">Nenhum ingrediente.</TableCell></TableRow>
          )}
          {rows.map((r) => {
            const st = STATUS_STYLE[r.status as string] ?? { bg: "bg-gray-400", label: r.status };
            const saldo = Number(r.saldo_g ?? 0);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nome}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={local[r.id] ?? ""}
                    onChange={(e) => onChangeEstoque(r.id, e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="text-right">{fmtPeso(r.qnt_necessaria_g)}</TableCell>
                <TableCell className={`text-right ${saldo < 0 ? "text-red-600 font-medium" : ""}`}>
                  {fmtPeso(saldo)}
                </TableCell>
                <TableCell>
                  <Badge className={`${st.bg} text-white border-0`}>{st.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
