import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
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
} from "@/integrations/supabase/samkhya-client";
import {
  SemaforoDot,
  mesesEstoqueSemaforo,
  mesesEstoque,
  SEMAFORO_ORDEM,
  SEMAFORO_BG_LIGHT,
} from "../semaforo";
import { useEstoqueCtx } from "../EstoqueContext";

interface PoteRow {
  id: number;
  tipo: string;
  label: string;
  qnt_estoque: number;
  estimativa_mensal: number | null;
  atualizado_em: string | null;
}

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

export default function TabPotes() {
  const qc = useQueryClient();
  const { qtdProduzir } = useEstoqueCtx();

  const { data = [] } = useQuery({
    queryKey: ["sk-v2", "potes"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("potes_estoque")
        .select("id,tipo,label,qnt_estoque,estimativa_mensal,atualizado_em");
      if (error) throw error;
      return (data ?? []) as PoteRow[];
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["sk-v2", "produtos-pote"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("produtos")
        .select("id,nome,pote_tipo_id,ativo");
      if (error) throw error;
      return (data ?? []) as (Pick<SkProduto, "id" | "nome" | "ativo"> & {
        pote_tipo_id: number | null;
      })[];
    },
  });

  const [edit, setEdit] = useState<Record<number, string>>({});

  const rows = useMemo(() => {
    return [...data].sort((a, b) => {
      const sa = mesesEstoqueSemaforo(a.qnt_estoque, a.estimativa_mensal);
      const sb = mesesEstoqueSemaforo(b.qnt_estoque, b.estimativa_mensal);
      return SEMAFORO_ORDEM[sa] - SEMAFORO_ORDEM[sb];
    });
  }, [data]);

  // Consumo previsto por tipo de pote a partir de qtdProduzir
  const consumoPorPote = useMemo(() => {
    const m = new Map<number, number>(); // pote_tipo_id -> unidades
    for (const p of produtos) {
      if (!p.pote_tipo_id) continue;
      const u = qtdProduzir[p.id] ?? 0;
      if (!u) continue;
      m.set(p.pote_tipo_id, (m.get(p.pote_tipo_id) ?? 0) + u);
    }
    return m;
  }, [produtos, qtdProduzir]);

  const planejados = useMemo(() => {
    return rows
      .map((r) => {
        const nec = consumoPorPote.get(r.id) ?? 0;
        return {
          ...r,
          necessario: nec,
          saldo: r.qnt_estoque - nec,
          ok: r.qnt_estoque >= nec,
        };
      })
      .filter((r) => r.necessario > 0);
  }, [rows, consumoPorPote]);

  const salvar = async (r: PoteRow) => {
    const v = edit[r.id];
    if (v === undefined) return;
    try {
      const { error } = await samkhyaSupabase
        .from("potes_estoque")
        .update({ qnt_estoque: Number(v) || 0 })
        .eq("id", r.id);
      if (error) throw error;
      toast.success("Salvo");
      setEdit((s) => {
        const n = { ...s };
        delete n[r.id];
        return n;
      });
      qc.invalidateQueries({ queryKey: ["sk-v2"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded border bg-card overflow-x-auto">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Tipo de pote</TableHead>
              <TableHead className="text-right">Estoque (unid.)</TableHead>
              <TableHead className="text-right">Estimativa /mês</TableHead>
              <TableHead className="text-right">Meses</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const s = mesesEstoqueSemaforo(r.qnt_estoque, r.estimativa_mensal);
              const m = mesesEstoque(r.qnt_estoque, r.estimativa_mensal);
              const v = edit[r.id];
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <SemaforoDot s={s} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.tipo}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="h-8 w-24 text-right ml-auto"
                      value={v !== undefined ? v : String(r.qnt_estoque ?? 0)}
                      onChange={(ev) =>
                        setEdit((s) => ({ ...s, [r.id]: ev.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(r.estimativa_mensal ?? 0).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {m == null ? "—" : m.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fmtDate(r.atualizado_em)}
                  </TableCell>
                  <TableCell>
                    {v !== undefined && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => salvar(r)}
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

      <div className="rounded border bg-card">
        <div className="px-3 py-2 border-b font-medium text-sm">
          Necessário para produções planejadas
        </div>
        {planejados.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Nenhuma produção planejada na aba Produtos.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pote</TableHead>
                <TableHead className="text-right">Necessário</TableHead>
                <TableHead className="text-right">Em estoque</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planejados.map((r) => (
                <TableRow key={r.id} className={r.ok ? SEMAFORO_BG_LIGHT.verde : SEMAFORO_BG_LIGHT.vermelho}>
                  <TableCell>{r.label}</TableCell>
                  <TableCell className="text-right">{r.necessario}</TableCell>
                  <TableCell className="text-right">{r.qnt_estoque}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      r.saldo >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {r.saldo >= 0 ? "+" : ""}
                    {r.saldo}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium ${
                        r.ok ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {r.ok ? "OK" : "FALTA"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
