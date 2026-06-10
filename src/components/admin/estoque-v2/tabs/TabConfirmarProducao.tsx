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
  useCriarProducoesPlanejadas,
  useProducoesHistorico,
  useConcluirProducao,
  useExcluirProducao,
  useLimparProducoesPlanejadas,
} from "@/hooks/useSamkhyaEstoque";
import { montarPedido, fmtBRL, type QtdProduzir } from "../pedido-compra";

const STATUS_PEDIDO: Record<string, string> = {
  aberto: "bg-yellow-500",
  confirmado: "bg-green-600",
  cancelado: "bg-gray-400",
};

const STATUS_PRODUCAO: Record<string, string> = {
  planejada: "bg-yellow-500",
  confirmada: "bg-green-600",
  cancelada: "bg-gray-400",
};

export default function TabConfirmarProducao() {
  const capQ = useCapacidadeProducao();
  const prodQ = useProdutosAtivos();
  const recQ = useReceitasAll();
  const ingQ = useIngredientesCompletos();
  const pedidosQ = usePedidosCompra();
  const producoesQ = useProducoesHistorico();
  const criarPedido = useCriarPedidoCompra();
  const confirmarPedido = useConfirmarPedido();
  const cancelarPedido = useCancelarPedido();
  const deletarPedido = useDeletarPedido();
  const criarProducoes = useCriarProducoesPlanejadas();
  const concluirProducao = useConcluirProducao();
  const excluirProducao = useExcluirProducao();
  const limparPlanejadas = useLimparProducoesPlanejadas();

  const cap = capQ.data ?? [];
  const produtos = prodQ.data ?? [];
  const receitas = recQ.data ?? [];
  const ingredientes = ingQ.data ?? [];

  const [qtd, setQtd] = useState<QtdProduzir>({});
  const [removidos, setRemovidos] = useState<Set<number>>(new Set());

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

  const gerarPedido = async () => {
    if (preview.itens.length === 0) return toast.info("Nada a comprar.");
    try {
      await criarPedido.mutateAsync({ itens: preview.itens, total: preview.total });
      toast.success(`Pedido criado: ${preview.itens.length} item(ns), ${fmtBRL(preview.total)}`);
      setRemovidos(new Set());
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar pedido");
    }
  };

  const planejarProducoes = async () => {
    const itens = Object.entries(qtd)
      .map(([id, u]) => ({ produto_id: Number(id), unidades_desejadas: Number(u) || 0 }))
      .filter((i) => i.unidades_desejadas > 0);
    if (itens.length === 0) return toast.info("Nada planejado.");
    try {
      await criarProducoes.mutateAsync(itens);
      toast.success(`${itens.length} produção(ões) planejada(s). Estoque NÃO foi debitado.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  return (
    <div className="space-y-6">
      {/* Insumos a comprar */}
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
                          n.has(it.ingrediente_id) ? n.delete(it.ingrediente_id) : n.add(it.ingrediente_id);
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
        <div className="p-3 border-t flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            <strong>{preview.itens.length}</strong> ingrediente(s) — total <strong>{fmtBRL(preview.total)}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={criarProducoes.isPending}
              onClick={planejarProducoes}
              title="Cria registros de produção planejada (sem debitar estoque)"
            >
              Confirmar Produção (planejar)
            </Button>
            <Button
              disabled={criarPedido.isPending || preview.itens.length === 0}
              onClick={gerarPedido}
              style={{ background: "#7b4963" }}
              className="text-white hover:opacity-90"
            >
              Gerar Pedido de Compra
            </Button>
          </div>
        </div>
      </section>

      {/* Plano de produção */}
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

      {/* Histórico de produções */}
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium flex items-center justify-between">
          <span>Histórico de produções</span>
          <Button
            size="sm"
            variant="outline"
            disabled={limparPlanejadas.isPending}
            onClick={async () => {
              if (!window.confirm("Excluir TODAS as produções com status 'planejada'?")) return;
              try {
                await limparPlanejadas.mutateAsync();
                toast.success("Planejadas removidas.");
              } catch (e: any) {
                toast.error(e?.message ?? "Erro");
              }
            }}
          >
            Limpar planejadas
          </Button>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right w-[260px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(producoesQ.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  Nenhuma produção registrada.
                </TableCell>
              </TableRow>
            )}
            {(producoesQ.data ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">#{p.id}</TableCell>
                <TableCell className="font-medium">{p.produtos?.nome ?? `#${p.produto_id}`}</TableCell>
                <TableCell className="text-right">{p.unidades_desejadas}</TableCell>
                <TableCell>
                  <Badge className={`${STATUS_PRODUCAO[p.status ?? ""] ?? "bg-gray-400"} text-white border-0 capitalize`}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.criado_em ? new Date(p.criado_em).toLocaleDateString("pt-BR") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {p.status === "planejada" && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (!window.confirm(`Marcar produção #${p.id} como CONCLUÍDA? Isso debita os insumos do estoque.`)) return;
                          try {
                            await concluirProducao.mutateAsync(p);
                            toast.success(`Produção #${p.id} concluída — insumos debitados.`);
                          } catch (e: any) {
                            toast.error(e?.message ?? "Erro");
                          }
                        }}
                        style={{ background: "#7b4963" }}
                        className="text-white hover:opacity-90"
                      >
                        Produção Concluída
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(`Excluir produção #${p.id}?`)) return;
                        try {
                          await excluirProducao.mutateAsync(p.id);
                          toast.success("Excluída.");
                        } catch (e: any) {
                          toast.error(e?.message ?? "Erro");
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Histórico de pedidos */}
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Histórico de pedidos de compra</header>
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
                    <Badge className={`${STATUS_PEDIDO[p.status] ?? "bg-gray-400"} text-white border-0 capitalize`}>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!window.confirm(`Deletar pedido #${p.id}?`)) return;
                              try {
                                await deletarPedido.mutateAsync(p.id);
                                toast.success("Deletado.");
                              } catch (e: any) {
                                toast.error(e?.message ?? "Erro");
                              }
                            }}
                          >
                            Deletar
                          </Button>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await confirmarPedido.mutateAsync(p);
                                toast.success(`Pedido #${p.id} confirmado — insumos somados.`);
                              } catch (e: any) {
                                toast.error(e?.message ?? "Erro");
                              }
                            }}
                            style={{ background: "#7b4963" }}
                            className="text-white hover:opacity-90"
                          >
                            Confirmar
                          </Button>
                        </>
                      )}
                      {p.status === "confirmado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!window.confirm(`Cancelar pedido #${p.id}? Subtrai insumos do estoque.`)) return;
                            try {
                              await cancelarPedido.mutateAsync(p);
                              toast.success("Cancelado.");
                            } catch (e: any) {
                              toast.error(e?.message ?? "Erro");
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                      {p.status === "cancelado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!window.confirm(`Deletar pedido #${p.id}?`)) return;
                            try {
                              await deletarPedido.mutateAsync(p.id);
                              toast.success("Deletado.");
                            } catch (e: any) {
                              toast.error(e?.message ?? "Erro");
                            }
                          }}
                        >
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
