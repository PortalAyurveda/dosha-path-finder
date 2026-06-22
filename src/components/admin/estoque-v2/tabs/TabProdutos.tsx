import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
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
import { necessidadePorProduto, agregarNecessidade } from "../calc";
import ResultadoProducaoModal from "../ResultadoProducaoModal";

export default function TabProdutos() {
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
    queryKey: ["sk-v2", "ingredientes-min-estoque"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("ingredientes")
        .select("id,nome,qnt_estoque_g");
      if (error) throw error;
      return (data ?? []) as Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">[];
    },
  });

  const ingMap = useMemo(() => {
    const m = new Map<number, Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">>();
    for (const i of ingredientes) m.set(i.id, i);
    return m;
  }, [ingredientes]);

  const rows = useMemo(() => {
    return [...produtos].sort((a, b) => {
      const sa = mesesEstoqueSemaforo(a.estoque_atual ?? 0, a.estimativa_mensal);
      const sb = mesesEstoqueSemaforo(b.estoque_atual ?? 0, b.estimativa_mensal);
      const c = SEMAFORO_ORDEM[sa] - SEMAFORO_ORDEM[sb];
      if (c !== 0) return c;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [produtos]);

  const preview = (p: SkProduto, unid: number): string => {
    if (!unid) return "";
    const itens = necessidadePorProduto(p, unid, receitas);
    if (itens.length === 0) return "—";
    return itens
      .slice(0, 6)
      .map((i) => {
        const nome = ingMap.get(i.ingrediente_id)?.nome ?? `#${i.ingrediente_id}`;
        return `${nome}: ${Math.round(i.quantidade_g).toLocaleString("pt-BR")}g`;
      })
      .join(" · ");
  };

  const totalUnidades = Object.values(qtdProduzir).reduce((s, n) => s + (n || 0), 0);

  const necessidade = useMemo(
    () => agregarNecessidade(produtos, qtdProduzir, receitas),
    [produtos, qtdProduzir, receitas],
  );

  const insumosRows = useMemo(() => {
    const out: {
      id: number;
      nome: string;
      necessario: number;
      estoque: number;
      saldo: number;
    }[] = [];
    for (const [id, nec] of necessidade) {
      if (!nec || nec <= 0) continue;
      const ing = ingMap.get(id);
      const estoque = Number(ing?.qnt_estoque_g ?? 0);
      out.push({
        id,
        nome: ing?.nome ?? `#${id}`,
        necessario: nec,
        estoque,
        saldo: estoque - nec,
      });
    }
    out.sort((a, b) => {
      const an = a.saldo < 0 ? 0 : 1;
      const bn = b.saldo < 0 ? 0 : 1;
      if (an !== bn) return an - bn;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
    return out;
  }, [necessidade, ingMap]);

  const fmt = (n: number) =>
    Math.round(n).toLocaleString("pt-BR");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[calc(100vh-220px)]">
      {/* COLUNA ESQUERDA */}
      <div className="lg:col-span-2 flex flex-col rounded border bg-card">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">O que produzir</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {rows.map((p) => {
            const s = mesesEstoqueSemaforo(p.estoque_atual ?? 0, p.estimativa_mensal);
            const unid = qtdProduzir[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="rounded border bg-background p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <SemaforoDot s={s} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      Estoque atual: {p.estoque_atual ?? 0} un.
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Unidades a produzir
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="h-10 text-base"
                    value={String(unid)}
                    onChange={(ev) =>
                      setQtd(p.id, Math.max(0, Number(ev.target.value) || 0))
                    }
                  />
                </div>
                {unid > 0 && (
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {preview(p, unid)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t p-3 flex items-center justify-between gap-2 bg-card">
          <div className="text-sm text-muted-foreground">
            {totalUnidades > 0
              ? `${totalUnidades} un. planejada(s)`
              : "Nenhuma produção"}
          </div>
          <Button
            disabled={totalUnidades === 0}
            onClick={() => setResultadoOpen(true)}
          >
            Confirmar Produção <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* COLUNA DIREITA */}
      <div className="lg:col-span-3 flex flex-col rounded border bg-card">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Insumos necessários</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {insumosRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Digite quantas unidades quer produzir na coluna ao lado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">Necessário (g)</TableHead>
                  <TableHead className="text-right">Em estoque (g)</TableHead>
                  <TableHead className="text-right">Saldo (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumosRows.map((r) => {
                  const neg = r.saldo < 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.nome}</TableCell>
                      <TableCell className="text-right">{fmt(r.necessario)}</TableCell>
                      <TableCell className="text-right">{fmt(r.estoque)}</TableCell>
                      <TableCell
                        className={`text-right ${
                          neg
                            ? "text-red-600 font-bold"
                            : "text-emerald-600"
                        }`}
                      >
                        {r.saldo >= 0 ? "+" : ""}
                        {fmt(r.saldo)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
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
