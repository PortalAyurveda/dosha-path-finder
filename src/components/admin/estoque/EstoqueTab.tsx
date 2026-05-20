import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Plus } from "lucide-react";
import { useEstoque } from "@/hooks/useSamkhyaEstoque";
import type { SkEstoqueRow } from "@/integrations/supabase/samkhya-client";
import IngredienteFormDialog from "./IngredienteFormDialog";
import { cn } from "@/lib/utils";

type SortKey = "nome" | "qnt_estoque_g" | "atualizado_em";
type SortDir = "asc" | "desc";

const fmtBR = (n: number | null | undefined, frac = 2) =>
  n == null ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: frac, maximumFractionDigits: frac });

const fmtDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function EstoqueTab() {
  const { data, isLoading, error } = useEstoque();
  const [sortKey, setSortKey] = useState<SortKey>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SkEstoqueRow | null>(null);

  const rows = useMemo(() => {
    const arr = [...(data ?? [])];
    arr.sort((a, b) => {
      let v = 0;
      if (sortKey === "nome") v = (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR");
      else if (sortKey === "qnt_estoque_g") v = (Number(a.qnt_estoque_g) || 0) - (Number(b.qnt_estoque_g) || 0);
      else if (sortKey === "atualizado_em")
        v = new Date(a.atualizado_em ?? 0).getTime() - new Date(b.atualizado_em ?? 0).getTime();
      return sortDir === "asc" ? v : -v;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (row: SkEstoqueRow) => {
    setEditing(row);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Estoque de ingredientes</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo ingrediente
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => toggleSort("nome")} className="inline-flex items-center gap-1 font-medium">
                  Nome <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggleSort("qnt_estoque_g")} className="inline-flex items-center gap-1 font-medium">
                  Estoque (g) <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">Estoque (kg)</TableHead>
              <TableHead className="text-right">Preço/kg</TableHead>
              <TableHead className="text-right">Valor em estoque (R$)</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead>
                <button onClick={() => toggleSort("atualizado_em")} className="inline-flex items-center gap-1 font-medium">
                  Atualizado em <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Carregando…</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-destructive py-8">
                  Erro: {(error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Sem ingredientes cadastrados.</TableCell>
              </TableRow>
            )}
            {rows.map((r) => {
              const zero = !Number(r.qnt_estoque_g);
              return (
                <TableRow key={r.id} className={cn(zero && "bg-muted/40 text-muted-foreground")}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>{r.categoria ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBR(Number(r.qnt_estoque_g), 0)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBR(Number(r.qnt_estoque_kg), 3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBR(Number(r.preco_kg))}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBR(Number(r.valor_em_estoque_r))}</TableCell>
                  <TableCell className="max-w-[220px] truncate" title={r.notas ?? ""}>{r.notas ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(r.atualizado_em)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)} className="gap-1">
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <IngredienteFormDialog open={dialogOpen} onOpenChange={setDialogOpen} ingrediente={editing} />
    </div>
  );
}
