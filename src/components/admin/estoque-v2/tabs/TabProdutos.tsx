import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Save } from "lucide-react";
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
import {
  samkhyaSupabase,
  type SkProduto,
  type SkReceita,
  type SkIngrediente,
} from "@/integrations/supabase/samkhya-client";
import {
  SemaforoDot,
  mesesEstoqueSemaforo,
  SEMAFORO_ORDEM,
} from "../semaforo";
import { useEstoqueCtx } from "../EstoqueContext";
import { necessidadePorProduto } from "../calc";
import ResultadoProducaoModal from "../ResultadoProducaoModal";

export default function TabProdutos() {
  const qc = useQueryClient();
  const { qtdProduzir, setQtd } = useEstoqueCtx();
  const [resultadoOpen, setResultadoOpen] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ["sk-v2", "produtos"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as SkProduto[];
    },
  });

  const { data: receitas = [] } = useQuery({
    queryKey: ["sk-v2", "receitas-all"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase.from("receitas").select("*");
      if (error) throw error;
      return (data ?? []) as SkReceita[];
    },
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ["sk-v2", "ingredientes-min"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("ingredientes")
        .select("id,nome");
      if (error) throw error;
      return (data ?? []) as Pick<SkIngrediente, "id" | "nome">[];
    },
  });

  const ingNome = useMemo(() => {
    const m = new Map<number, string>();
    for (const i of ingredientes) m.set(i.id, i.nome);
    return m;
  }, [ingredientes]);

  const [edit, setEdit] = useState<
    Record<number, { estoque_atual?: string; estimativa_mensal?: string }>
  >({});

  const rows = useMemo(() => {
    return [...produtos].sort((a, b) => {
      const sa = mesesEstoqueSemaforo(a.estoque_atual ?? 0, a.estimativa_mensal);
      const sb = mesesEstoqueSemaforo(b.estoque_atual ?? 0, b.estimativa_mensal);
      const c = SEMAFORO_ORDEM[sa] - SEMAFORO_ORDEM[sb];
      if (c !== 0) return c;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [produtos]);

  const salvarLinha = async (p: SkProduto) => {
    const patch = edit[p.id];
    if (!patch) return;
    const payload: any = {};
    if (patch.estoque_atual !== undefined) {
      payload.estoque_atual = Number(patch.estoque_atual) || 0;
    }
    if (patch.estimativa_mensal !== undefined) {
      const em = Number(patch.estimativa_mensal) || 0;
      payload.estimativa_mensal = em;
      payload.estimativa_3_meses = Math.round(em * 3);
    }
    if (Object.keys(payload).length === 0) return;
    try {
      const { error } = await samkhyaSupabase
        .from("produtos")
        .update(payload)
        .eq("id", p.id);
      if (error) throw error;
      toast.success("Salvo");
      setEdit((s) => {
        const n = { ...s };
        delete n[p.id];
        return n;
      });
      qc.invalidateQueries({ queryKey: ["sk-v2"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  const preview = (p: SkProduto, unid: number): string => {
    if (!unid) return "";
    const itens = necessidadePorProduto(p, unid, receitas);
    if (itens.length === 0) return "—";
    return itens
      .slice(0, 6)
      .map((i) => {
        const nome = ingNome.get(i.ingrediente_id) ?? `#${i.ingrediente_id}`;
        return `${nome} +${Math.round(i.quantidade_g).toLocaleString("pt-BR")}g`;
      })
      .join(" · ");
  };

  const totalUnidades = Object.values(qtdProduzir).reduce((s, n) => s + (n || 0), 0);

  return (
    <div className="space-y-3">
      <div className="rounded border bg-card overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Estoque atual</TableHead>
              <TableHead className="text-right border-r">Venda /mês</TableHead>
              <TableHead className="text-right pl-4">A produzir</TableHead>
              <TableHead className="text-xs text-muted-foreground">Consumo previsto</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const s = mesesEstoqueSemaforo(p.estoque_atual ?? 0, p.estimativa_mensal);
              const e = edit[p.id] ?? {};
              const dirty =
                e.estoque_atual !== undefined || e.estimativa_mensal !== undefined;
              const unid = qtdProduzir[p.id] ?? 0;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <SemaforoDot s={s} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {Number(p.peso_unidade_g ?? 0)}g/unid.
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="h-8 w-24 text-right ml-auto"
                      value={
                        e.estoque_atual !== undefined
                          ? e.estoque_atual
                          : String(p.estoque_atual ?? 0)
                      }
                      onChange={(ev) =>
                        setEdit((s) => ({
                          ...s,
                          [p.id]: { ...s[p.id], estoque_atual: ev.target.value },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right border-r">
                    <Input
                      type="number"
                      className="h-8 w-24 text-right ml-auto"
                      value={
                        e.estimativa_mensal !== undefined
                          ? e.estimativa_mensal
                          : String(p.estimativa_mensal ?? 0)
                      }
                      onChange={(ev) =>
                        setEdit((s) => ({
                          ...s,
                          [p.id]: { ...s[p.id], estimativa_mensal: ev.target.value },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right pl-4">
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-24 text-right ml-auto"
                      value={String(unid)}
                      onChange={(ev) => setQtd(p.id, Math.max(0, Number(ev.target.value) || 0))}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[320px] truncate">
                    {preview(p, unid)}
                  </TableCell>
                  <TableCell>
                    {dirty && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => salvarLinha(p)}
                      >
                        <Save className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-sm text-muted-foreground">
          {totalUnidades > 0
            ? `${totalUnidades} unidade(s) planejada(s)`
            : "Nenhuma produção planejada"}
        </div>
        <Button
          disabled={totalUnidades === 0}
          onClick={() => setResultadoOpen(true)}
        >
          Ver resultado completo <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>

      <ResultadoProducaoModal
        open={resultadoOpen}
        onOpenChange={setResultadoOpen}
        produtos={produtos}
        receitas={receitas}
      />
    </div>
  );
}
