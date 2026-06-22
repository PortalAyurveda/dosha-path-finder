import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { SemaforoDot, SEMAFORO_BG_LIGHT, type Semaforo } from "./semaforo";
import { useEstoqueCtx } from "./EstoqueContext";
import { agregarNecessidade } from "./calc";

const fmtG = (n: number) =>
  `${Math.round(n).toLocaleString("pt-BR")} g`;

function semaforo(necessario: number, estoque: number): Semaforo {
  if (necessario <= 0) return "cinza";
  if (estoque >= necessario) return "verde";
  if (estoque >= necessario * 0.5) return "amarelo";
  return "vermelho";
}

export default function ResultadoProducaoModal({
  open,
  onOpenChange,
  produtos,
  receitas,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  produtos: SkProduto[];
  receitas: SkReceita[];
}) {
  const qc = useQueryClient();
  const { qtdProduzir, resetQtd } = useEstoqueCtx();
  const [confirming, setConfirming] = useState(false);

  const { data: ingredientes = [] } = useQuery({
    queryKey: ["sk-v2", "ingredientes-full"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("ingredientes")
        .select("id,nome,qnt_estoque_g");
      if (error) throw error;
      return (data ?? []) as Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">[];
    },
    enabled: open,
  });

  const { data: potes = [] } = useQuery({
    queryKey: ["sk-v2", "potes-full"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("potes_estoque")
        .select("id,tipo,label,qnt_estoque");
      if (error) throw error;
      return (data ?? []) as {
        id: number;
        tipo: string;
        label: string;
        qnt_estoque: number;
      }[];
    },
    enabled: open,
  });

  const { data: etiquetas = [] } = useQuery({
    queryKey: ["sk-v2", "etiquetas-full"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("etiquetas_estoque")
        .select("id,produto_id,produto_nome,qnt_estoque");
      if (error) throw error;
      return (data ?? []) as {
        id: number;
        produto_id: number;
        produto_nome: string;
        qnt_estoque: number;
      }[];
    },
    enabled: open,
  });

  const ingMap = useMemo(() => {
    const m = new Map<number, { nome: string; estoque: number }>();
    for (const i of ingredientes)
      m.set(i.id, { nome: i.nome, estoque: Number(i.qnt_estoque_g ?? 0) });
    return m;
  }, [ingredientes]);

  // Insumos
  const insumosResult = useMemo(() => {
    const nec = agregarNecessidade(produtos, qtdProduzir, receitas);
    return Array.from(nec.entries())
      .map(([id, g]) => {
        const ing = ingMap.get(id);
        const estoque = ing?.estoque ?? 0;
        return {
          id,
          nome: ing?.nome ?? `#${id}`,
          necessario: g,
          estoque,
          saldo: estoque - g,
          ok: estoque >= g,
        };
      })
      .sort((a, b) => Number(a.ok) - Number(b.ok));
  }, [produtos, qtdProduzir, receitas, ingMap]);

  // Potes
  const potesResult = useMemo(() => {
    const m = new Map<number, number>();
    const tipoById = new Map<number, number | null>();
    for (const p of produtos) tipoById.set(p.id, (p as any).pote_tipo_id ?? null);
    for (const p of produtos) {
      const u = qtdProduzir[p.id] ?? 0;
      const tipoId = tipoById.get(p.id);
      if (!u || !tipoId) continue;
      m.set(tipoId, (m.get(tipoId) ?? 0) + u);
    }
    return Array.from(m.entries())
      .map(([tipoId, nec]) => {
        const p = potes.find((x) => x.id === tipoId);
        const estoque = p?.qnt_estoque ?? 0;
        return {
          id: tipoId,
          label: p?.label ?? `#${tipoId}`,
          necessario: nec,
          estoque,
          saldo: estoque - nec,
          ok: estoque >= nec,
        };
      })
      .sort((a, b) => Number(a.ok) - Number(b.ok));
  }, [produtos, qtdProduzir, potes]);

  // Etiquetas
  const etiquetasResult = useMemo(() => {
    return etiquetas
      .map((e) => {
        const nec = qtdProduzir[e.produto_id] ?? 0;
        return {
          id: e.id,
          produto_id: e.produto_id,
          nome: e.produto_nome,
          necessario: nec,
          estoque: e.qnt_estoque,
          saldo: e.qnt_estoque - nec,
          ok: e.qnt_estoque >= nec,
        };
      })
      .filter((r) => r.necessario > 0)
      .sort((a, b) => Number(a.ok) - Number(b.ok));
  }, [etiquetas, qtdProduzir]);

  const confirmar = async () => {
    setConfirming(true);
    try {
      // 1. INSERT produções
      const producoesPayload = produtos
        .filter((p) => (qtdProduzir[p.id] ?? 0) > 0)
        .map((p) => ({
          produto_id: p.id,
          unidades_desejadas: qtdProduzir[p.id],
          status: "confirmada" as const,
          confirmado_em: new Date().toISOString(),
        }));
      if (producoesPayload.length === 0) {
        toast.error("Nenhuma produção para confirmar");
        return;
      }
      const { error: e1 } = await samkhyaSupabase
        .from("producoes")
        .insert(producoesPayload);
      if (e1) throw e1;

      // 2. UPDATE ingredientes
      await Promise.all(
        insumosResult.map((r) =>
          samkhyaSupabase
            .from("ingredientes")
            .update({ qnt_estoque_g: r.estoque - r.necessario })
            .eq("id", r.id),
        ),
      );

      // 3. UPDATE potes
      await Promise.all(
        potesResult.map((r) =>
          samkhyaSupabase
            .from("potes_estoque")
            .update({ qnt_estoque: r.estoque - r.necessario })
            .eq("id", r.id),
        ),
      );

      // 4. UPDATE etiquetas
      await Promise.all(
        etiquetasResult.map((r) =>
          samkhyaSupabase
            .from("etiquetas_estoque")
            .update({ qnt_estoque: r.estoque - r.necessario })
            .eq("id", r.id),
        ),
      );

      toast.success("Produção confirmada");
      resetQtd();
      qc.invalidateQueries({ queryKey: ["sk-v2"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao confirmar");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resultado da Produção</DialogTitle>
        </DialogHeader>

        <Bloco titulo="Insumos">
          {insumosResult.length === 0 ? (
            <Vazio />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">Necessário</TableHead>
                  <TableHead className="text-right">Em estoque</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumosResult.map((r) => (
                  <TableRow
                    key={r.id}
                    className={r.ok ? SEMAFORO_BG_LIGHT.verde : SEMAFORO_BG_LIGHT.vermelho}
                  >
                    <TableCell>
                      <SemaforoDot s={semaforo(r.necessario, r.estoque)} />
                    </TableCell>
                    <TableCell>{r.nome}</TableCell>
                    <TableCell className="text-right">{fmtG(r.necessario)}</TableCell>
                    <TableCell className="text-right">{fmtG(r.estoque)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        r.saldo >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {r.saldo >= 0 ? "+" : ""}
                      {fmtG(r.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Bloco>

        <Bloco titulo="Potes">
          {potesResult.length === 0 ? (
            <Vazio />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Pote</TableHead>
                  <TableHead className="text-right">Necessário</TableHead>
                  <TableHead className="text-right">Em estoque</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potesResult.map((r) => (
                  <TableRow
                    key={r.id}
                    className={r.ok ? SEMAFORO_BG_LIGHT.verde : SEMAFORO_BG_LIGHT.vermelho}
                  >
                    <TableCell>
                      <SemaforoDot s={semaforo(r.necessario, r.estoque)} />
                    </TableCell>
                    <TableCell>{r.label}</TableCell>
                    <TableCell className="text-right">{r.necessario}</TableCell>
                    <TableCell className="text-right">{r.estoque}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        r.saldo >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {r.saldo >= 0 ? "+" : ""}
                      {r.saldo}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Bloco>

        <Bloco titulo="Etiquetas">
          {etiquetasResult.length === 0 ? (
            <Vazio />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Necessário</TableHead>
                  <TableHead className="text-right">Em estoque</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etiquetasResult.map((r) => (
                  <TableRow
                    key={r.id}
                    className={r.ok ? SEMAFORO_BG_LIGHT.verde : SEMAFORO_BG_LIGHT.vermelho}
                  >
                    <TableCell>
                      <SemaforoDot s={semaforo(r.necessario, r.estoque)} />
                    </TableCell>
                    <TableCell>{r.nome}</TableCell>
                    <TableCell className="text-right">{r.necessario}</TableCell>
                    <TableCell className="text-right">{r.estoque}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        r.saldo >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {r.saldo >= 0 ? "+" : ""}
                      {r.saldo}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Bloco>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={confirming}>
            {confirming ? "Confirmando..." : "Confirmar Produção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded border bg-card mb-3">
      <header className="px-3 py-2 border-b font-medium text-sm">{titulo}</header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Vazio() {
  return <div className="p-3 text-sm text-muted-foreground">Nenhum item.</div>;
}
