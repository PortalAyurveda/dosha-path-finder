import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  useCapacidadeProducao,
  useProdutosAtivos,
  useReceitasAll,
  useIngredientesCompletos,
  usePedidosCompra,
  useCriarPedidoCompra,
  useConfirmarPedido,
  useCancelarPedido,
  useDeletarPedido,
} from "@/hooks/useSamkhyaEstoque";
import { montarPedido, fmtBRL, type QtdProduzir } from "../pedido-compra";

const STATUS_COLORS: Record<string, string> = {
  aberto: "bg-yellow-500",
  confirmado: "bg-green-600",
  cancelado: "bg-gray-400",
};

export default function TabConfirmarProducao() {
  const capQ = useCapacidadeProducao();
  const prodQ = useProdutosAtivos();
  const recQ = useReceitasAll();
  const ingQ = useIngredientesCompletos();
  const pedidosQ = usePedidosCompra();
  const criar = useCriarPedidoCompra();
  const confirmar = useConfirmarPedido();
  const cancelar = useCancelarPedido();
  const deletar = useDeletarPedido();

  const cap = capQ.data ?? [];
  const produtos = prodQ.data ?? [];
  const receitas = recQ.data ?? [];
  const ingredientes = ingQ.data ?? [];

  const [qtd, setQtd] = useState<QtdProduzir>({});
  const [removidos, setRemovidos] = useState<Set<number>>(new Set());

  // default qtd a produzir: meta_60_dias
  useEffect(() => {
    if (!cap.length) return;
    setQtd((s) => {
      const out = { ...s };
      for (const c of cap) {
        if (out[c.id] === undefined) {
          out[c.id] = Math.max(0, Math.round(Number(c.meta_60_dias ?? 0)));
        }
      }
      return out;
    });
  }, [cap]);

  const previewFull = useMemo(
    () => montarPedido(produtos, qtd, receitas, ingredientes),
    [produtos, qtd, receitas, ingredientes],
  );

  const preview = useMemo(() => {
    const itens = previewFull.itens.filter((i) => !removidos.has(i.ingrediente_id));
    const total = Number(itens.reduce((s, i) => s + Number(i.preco_estimado || 0), 0).toFixed(2));
    return { itens, total };
  }, [previewFull, removidos]);

  const gerar = async () => {
    if (preview.itens.length === 0) {
      toast.info("Nada a comprar.");
      return;
    }
    try {
      await criar.mutateAsync({ itens: preview.itens, total: preview.total });
      toast.success(`Pedido criado: ${preview.itens.length} item(ns), ${fmtBRL(preview.total)}`);
      setRemovidos(new Set());
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar pedido");
    }
  };

  const onConfirmar = async (p: any) => {
    try {
      await confirmar.mutateAsync(p);
      toast.success(`Pedido #${p.id} confirmado — insumos somados ao estoque.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };
  const onCancelar = async (p: any) => {
    if (!window.confirm(`Cancelar pedido #${p.id}? Os insumos serão subtraídos do estoque.`)) return;
    try {
      await cancelar.mutateAsync(p);
      toast.success(`Pedido #${p.id} cancelado.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };
  const onDeletar = async (p: any) => {
    if (!window.confirm(`Deletar pedido #${p.id} definitivamente?`)) return;
    try {
      await deletar.mutateAsync(p.id);
      toast.success(`Pedido #${p.id} deletado.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Insumos a comprar</header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingrediente</TableHead>
              <TableHead className="text-right">Necessário</TableHead>
              <TableHead className="text-right">A comprar</TableHead>
              <TableHead className="text-right">Preço est.</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewFull.itens.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Nenhum insumo precisa ser comprado.
                </TableCell>
              </TableRow>
            )}
            {previewFull.itens.map((it) => {
              const off = removidos.has(it.ingrediente_id);
              return (
                <TableRow key={it.ingrediente_id} className={off ? "opacity-40" : ""}>
                  <TableCell className="font-medium">{it.ingrediente_nome}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{it.qtd_necessaria_g} g</TableCell>
                  <TableCell className="text-right font-medium">{it.qtd_display}</TableCell>
                  <TableCell className="text-right">{fmtBRL(Number(it.preco_estimado ?? 0))}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() =>
                        setRemovidos((s) => {
                          const n = new Set(s);
                          if (n.has(it.ingrediente_id)) n.delete(it.ingrediente_id);
                          else n.add(it.ingrediente_id);
                          return n;
                        })
                      }
                      title={off ? "Reincluir" : "Remover do pedido"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-3 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <strong>{preview.itens.length}</strong> ingrediente(s) — total <strong>{fmtBRL(preview.total)}</strong>
          </div>
          <Button
            disabled={criar.isPending || preview.itens.length === 0}
            onClick={gerar}
            style={{ background: "#7b4963" }}
            className="text-white hover:opacity-90"
          >
            Gerar Pedido de Compra
          </Button>
        </div>
      </section>

      <Accordion type="single" collapsible className="rounded border bg-card">
        <AccordionItem value="plano" className="border-0">
          <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm font-medium">
            Ajustar plano de produção ({cap.length} produto(s))
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Unid. possíveis</TableHead>
                  <TableHead className="text-right">Meta 60 dias</TableHead>
                  <TableHead className="w-[140px]">Qtd a produzir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cap.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="text-right">{Math.round(Number(c.unidades_possiveis ?? 0))}</TableCell>
                    <TableCell className="text-right">{Math.round(Number(c.meta_60_dias ?? 0))}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={qtd[c.id] ?? 0}
                        onChange={(e) => setQtd((s) => ({ ...s, [c.id]: Math.max(0, Number(e.target.value)) }))}
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Histórico de pedidos</header>
        <div className="p-3">
          {pedidosQ.isLoading && <div className="text-muted-foreground text-sm">Carregando…</div>}
          {!pedidosQ.isLoading && (pedidosQ.data?.length ?? 0) === 0 && (
            <div className="text-muted-foreground text-sm">Nenhum pedido ainda.</div>
          )}
          <Accordion type="multiple" className="w-full">
            {(pedidosQ.data ?? []).map((p) => (
              <AccordionItem key={p.id} value={String(p.id)}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full pr-4">
                    <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>
                    <span className="text-sm">
                      {p.criado_em ? new Date(p.criado_em).toLocaleDateString("pt-BR") : "—"}
                    </span>
                    <Badge className={`${STATUS_COLORS[p.status] ?? "bg-gray-400"} text-white border-0 capitalize`}>
                      {p.status}
                    </Badge>
                    <span className="ml-auto font-medium">{fmtBRL(Number(p.total_estimado_r ?? 0))}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead className="text-right">Necessário</TableHead>
                          <TableHead className="text-right">Pedido</TableHead>
                          <TableHead className="text-right">Preço est.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(p.itens ?? []).map((it) => (
                          <TableRow key={it.ingrediente_id}>
                            <TableCell>{it.ingrediente_nome}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{it.qtd_necessaria_g} g</TableCell>
                            <TableCell className="text-right font-medium">{it.qtd_display}</TableCell>
                            <TableCell className="text-right">{fmtBRL(Number(it.preco_estimado ?? 0))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex gap-2 justify-end">
                      {p.status === "aberto" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => onDeletar(p)}>
                            Deletar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onConfirmar(p)}
                            style={{ background: "#7b4963" }}
                            className="text-white hover:opacity-90"
                          >
                            Confirmar
                          </Button>
                        </>
                      )}
                      {p.status === "confirmado" && (
                        <Button size="sm" variant="outline" onClick={() => onCancelar(p)}>
                          Cancelar
                        </Button>
                      )}
                      {p.status === "cancelado" && (
                        <Button size="sm" variant="outline" onClick={() => onDeletar(p)}>
                          Deletar
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
