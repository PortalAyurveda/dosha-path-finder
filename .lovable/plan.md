# Confirmar Produção — foco em insumos + ciclo de vida do pedido

## 1. Topo da aba: mostrar INSUMOS (não produtos)

Hoje a tabela de cima lista produtos com "qtd a produzir". Vou inverter o foco:

- Mantenho um cálculo interno do que produzir (semeado com `meta_60_dias`), mas **escondido** num accordion "Ajustar produção planejada" recolhido por padrão.
- A tabela principal passa a ser **"Insumos a comprar"**, derivada desse plano via `montarPedido()`:

  | Ingrediente | Necessário (g) | Em estoque (g) | A comprar | Preço est. | 🗑 |

- Coluna 🗑 remove a linha do pedido antes de gerar (estado local `removidos: Set<ingrediente_id>`).
- Rodapé: total recalculado + botão **Gerar Pedido de Compra**.

## 2. Ciclo de vida do pedido

Status novos: `aberto` → `confirmado` → (opcional) `cancelado` → deletado.
Removo `enviado`/`recebido` (substituídos por `confirmado`).

Regras de ação por status:

| Status | Botões disponíveis | Efeito |
|---|---|---|
| aberto | **Confirmar**, **Deletar** | Confirmar = soma insumos ao estoque, vira `confirmado`. Deletar = remove a linha. |
| confirmado | **Cancelar** | Subtrai do estoque o que tinha sido somado, vira `cancelado`. |
| cancelado | **Deletar** | Remove a linha. |

Cada card do histórico mostra **`#ID` + data + status (badge) + total**, com a lista de itens dentro.

## 3. Banco

Migration:

- `ALTER TYPE` (ou check) do `pedidos_compra.status` para aceitar `aberto | confirmado | cancelado`.
- Migrar registros existentes: `enviado`/`recebido` → `confirmado`.
- Garantir que a tabela tenha `id serial` (já tem) — é o ID que aparece como `#42`.
- Permissão de `DELETE` em `samkhya.pedidos_compra` para `authenticated` (revisar RLS — provavelmente já ok via `is_admin()`).

## 4. Código

**`src/hooks/useSamkhyaEstoque.ts`**
- Substituir `useAtualizarStatusPedido` por:
  - `useConfirmarPedido(pedido)` → status `confirmado` + soma `qtd_arredondada_g` em cada ingrediente.
  - `useCancelarPedido(pedido)` → status `cancelado` + subtrai a mesma quantidade.
  - `useDeletarPedido(id)` → `DELETE FROM pedidos_compra WHERE id=?`.

**`src/integrations/supabase/samkhya-client.ts`**
- Atualizar tipo `SkPedidoCompra.status` para `"aberto" | "confirmado" | "cancelado"`.

**`src/components/admin/estoque-v2/tabs/TabConfirmarProducao.tsx`**
- Reescrever:
  1. Accordion "Plano de produção" (fechado) com a tabela atual de produtos + qtd.
  2. Tabela "Insumos a comprar" (foco principal) com remoção por linha.
  3. Histórico: cada item mostra `#ID`, status, ações conforme tabela acima, confirmações via `toast`/`window.confirm` para Deletar/Cancelar.

## 5. Pontos a confirmar

- OK marcar como **confirmado** já somar ao estoque (sem etapa separada de "recebido")? Pelo seu texto entendi que sim.
- Ao **cancelar** um pedido confirmado, subtrair direto mesmo se o estoque já tiver sido usado em produção (pode ficar negativo) — é o comportamento desejado? Posso travar com erro se ficar negativo, se preferir.
