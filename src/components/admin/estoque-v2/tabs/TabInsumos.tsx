import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { samkhyaSupabase } from "@/integrations/supabase/samkhya-client";
import {
  SemaforoDot,
  mesesEstoqueSemaforo,
  SEMAFORO_ORDEM,
  type Semaforo,
} from "../semaforo";
import IngredienteFormDialog from "../IngredienteFormDialog";

interface Row {
  id: number;
  nome: string;
  categoria: string | null;
  qnt_estoque_g: number | null;
  qnt_necessaria_g: number | null;
  saldo_g: number | null;
  preco_kg: number | null;
  atualizado_em: string | null;
}

type SortKey = "semaforo" | "nome" | "estoque" | "atualizado";

const fmt = (n: number | null | undefined) =>
  `${Math.round(Number(n ?? 0)).toLocaleString("pt-BR")} g`;
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

function semaforoDeLinha(r: Row): Semaforo {
  // Sem estimativa mensal explícita aqui: usa necessário/saldo
  const nec = Number(r.qnt_necessaria_g ?? 0);
  const est = Number(r.qnt_estoque_g ?? 0);
  if (nec <= 0) return "cinza";
  const ratio = est / nec;
  if (ratio >= 2) return "verde";
  if (ratio >= 1) return "amarelo";
  return "vermelho";
}

export default function TabInsumos() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["sk-v2", "necessidade-ing"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("v_necessidade_ingredientes")
        .select("*");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "semaforo",
    dir: "asc",
  });
  const [editing, setEditing] = useState<number | null>(null);
  const [edit, setEdit] = useState<{
    qnt_estoque_g: string;
    preco_kg: string;
    categoria: string;
    notas: string;
  }>({ qnt_estoque_g: "", preco_kg: "", categoria: "", notas: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "semaforo") {
        cmp = SEMAFORO_ORDEM[semaforoDeLinha(a)] - SEMAFORO_ORDEM[semaforoDeLinha(b)];
      } else if (sort.key === "nome") cmp = a.nome.localeCompare(b.nome, "pt-BR");
      else if (sort.key === "estoque")
        cmp = Number(a.qnt_estoque_g ?? 0) - Number(b.qnt_estoque_g ?? 0);
      else if (sort.key === "atualizado")
        cmp =
          new Date(a.atualizado_em ?? 0).getTime() -
          new Date(b.atualizado_em ?? 0).getTime();
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));

  const startEdit = async (r: Row) => {
    // Buscar notas (não vem na view)
    const { data: ing } = await samkhyaSupabase
      .from("ingredientes")
      .select("notas")
      .eq("id", r.id)
      .single();
    setEditing(r.id);
    setEdit({
      qnt_estoque_g: String(Math.round(Number(r.qnt_estoque_g ?? 0))),
      preco_kg: String(Number(r.preco_kg ?? 0)),
      categoria: r.categoria ?? "",
      notas: (ing?.notas as string) ?? "",
    });
  };

  const saveEdit = async () => {
    if (editing == null) return;
    try {
      const { error } = await samkhyaSupabase
        .from("ingredientes")
        .update({
          qnt_estoque_g: Number(edit.qnt_estoque_g) || 0,
          preco_kg: Number(edit.preco_kg) || 0,
          categoria: edit.categoria.trim() || null,
          notas: edit.notas.trim() || null,
        })
        .eq("id", editing);
      if (error) throw error;
      toast.success("Salvo");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["sk-v2"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  if (error) return <div className="text-destructive text-sm">{(error as Error).message}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Carregando..." : `${rows.length} ingrediente(s)`}
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4 mr-1" /> Novo ingrediente
        </Button>
      </div>

      <div className="rounded border bg-card overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("nome")}
              >
                Nome {sort.key === "nome" && (sort.dir === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("estoque")}
              >
                Estoque
              </TableHead>
              <TableHead className="text-right">Necessário</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Preço /kg</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("atualizado")}
              >
                Atualizado
              </TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const isEditing = editing === r.id;
              const saldo = Number(r.saldo_g ?? 0);
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <SemaforoDot s={semaforoDeLinha(r)} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.nome}</div>
                    {isEditing ? (
                      <Input
                        className="h-7 mt-1 text-xs"
                        placeholder="Categoria"
                        value={edit.categoria}
                        onChange={(e) =>
                          setEdit((s) => ({ ...s, categoria: e.target.value }))
                        }
                      />
                    ) : (
                      r.categoria && (
                        <div className="text-xs text-muted-foreground">{r.categoria}</div>
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        className="h-7 w-24 text-right ml-auto"
                        value={edit.qnt_estoque_g}
                        onChange={(e) =>
                          setEdit((s) => ({ ...s, qnt_estoque_g: e.target.value }))
                        }
                      />
                    ) : (
                      fmt(r.qnt_estoque_g)
                    )}
                  </TableCell>
                  <TableCell className="text-right">{fmt(r.qnt_necessaria_g)}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      saldo >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {saldo >= 0 ? "+" : ""}
                    {fmt(saldo)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        className="h-7 w-24 text-right ml-auto"
                        value={edit.preco_kg}
                        onChange={(e) =>
                          setEdit((s) => ({ ...s, preco_kg: e.target.value }))
                        }
                      />
                    ) : (
                      `R$ ${Number(r.preco_kg ?? 0).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fmtDate(r.atualizado_em)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                          <Save className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditing(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(r)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <IngredienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => qc.invalidateQueries({ queryKey: ["sk-v2"] })}
      />
    </div>
  );
}
