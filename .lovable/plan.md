# Reestrutura `/admin/estoque` em 5 abas

Hoje a página está como grid de 5 colunas (`EstoqueGrid`). Vamos substituir por **5 abas** seguindo a ordem que você definiu. Todo o schema necessário já existe em `samkhya` (tabelas `produtos`, `pedidos_compra`, `potes_estoque`, `etiquetas_estoque` e views `v_capacidade_producao`, `v_semaforo_potes`, `v_semaforo_etiquetas`, `v_necessidade_ingredientes`) — **não precisa migração**.

## Estrutura

```text
src/pages/AdminEstoque.tsx                       → usa <Tabs> com 5 abas
src/components/admin/estoque-v2/
  ├─ tabs/TabEstimativaVendas.tsx               (1)
  ├─ tabs/TabResultadoFinal.tsx                 (2) – reaproveita lógica do grid atual
  ├─ tabs/TabConfirmarProducao.tsx              (3) NOVA
  ├─ tabs/TabEstoqueProdutos.tsx                (4)
  ├─ tabs/TabEstoqueEtiquetas.tsx               (5)
  └─ pedido-compra.ts                            – cálculo de pedido (puro)
src/hooks/useSamkhyaEstoque.ts                   → novos hooks
```

Componentes de coluna antigos (`ColInsumos`, `ColProduzir`, `ColResultado`, `ColEmBreve`, `EstoqueGrid`) serão removidos depois que o conteúdo for migrado para `TabResultadoFinal`.

## Aba 1 — Estimativa de Vendas
- Hook `useEstimativasVendas()` → `SELECT id, nome, estimativa_3_meses, estimativa_mensal FROM produtos WHERE ativo ORDER BY estimativa_3_meses DESC NULLS LAST`.
- Tabela: **Produto | Total 3 meses (Input number) | Média/mês (readonly = total/3)**.
- `onBlur` ou debounce 600 ms → `useUpdateEstimativa3Meses` faz `UPDATE produtos SET estimativa_3_meses=$v`. Invalida `produtos`, `v_capacidade_producao`, `v_semaforo_*`.

## Aba 2 — Resultado Final
- Mesma lógica do `EstoqueGrid` atual reformatada em uma só tela: lista de produtos com checkbox + unidades à esquerda, agregação de ingredientes (`necessário / em estoque / falta`) à direita, e botão **Confirmar Produção** (mantém `useConfirmarProducao`).
- Reaproveita `calc.ts` (`necessidadePorProduto`, `agregarNecessidade`, `montarResultado`) — só muda o layout.

## Aba 3 — Confirmar Produção → Pedido de Compra (NOVA)

**Topo: "O que produzir"**
- Hook `useCapacidadeProducao()` → `SELECT * FROM v_capacidade_producao`.
- Tabela: **Produto | Unid. possíveis | Meta 60 dias | Qtd a produzir** (Input, default = `meta_60_dias`).
- Estado local `qtdProduzir: Record<produto_id, number>`.

**Botão "Gerar Pedido de Compra"**
1. Carrega `receitas` + `ingredientes` (preço e estoque) com um único fetch.
2. Para cada produto com `qtd > 0`, multiplica `receita.quantidade_g × (qtd × peso_unidade_g / batch_total_g)` (mesma fórmula já usada em `calc.ts`).
3. Soma por ingrediente → `necessario_g`. `falta = max(0, necessario - estoque)`.
4. Arredonda: `falta ≤ 0` ignora; `0 < falta ≤ 500` → 500g; `> 500` → `ceil(falta/1000)*1000`.
5. `preco_estimado = (qtd_arredondada/1000) * preco_kg`. `qtd_display` = `"500g"` ou `"Xkg"`.
6. `INSERT INTO pedidos_compra (status,itens,total_estimado_r) VALUES ('aberto', jsonb, sum)`.
7. Toast + invalidação + limpa estado.

**Embaixo: Histórico**
- Hook `usePedidosCompra()` → `SELECT * FROM pedidos_compra ORDER BY criado_em DESC`.
- Cards expansíveis (`Accordion`): Data | Badge status | Total R$. Expandido mostra lista de itens.
- Botões por card:
  - **Marcar Enviado** → `UPDATE pedidos_compra SET status='enviado'`.
  - **Marcar Recebido** → `UPDATE status='recebido'` + loop somando `qnt_estoque_g += item.qtd_arredondada_g` em `ingredientes`. (Mesma estratégia atual de loop JS; aceitável para a escala. Futuro: virar RPC transacional.)

A função pura `pedido-compra.ts` exporta `montarPedido(produtos, qtdProduzir, receitas, ingredientes)` para ficar testável.

## Aba 4 — Estoque de Produtos
- Hook `useCapacidadeProducao()` (mesma da aba 3).
- Lista de produtos. Cada linha: **Nome + badge semáforo** (🟢/🟡/🔴 de `v_capacidade_producao.semaforo`) | Unid. possíveis | Meta 60 dias | Estimativa 3m.
- Componente `SemaforoBadge` reutilizável (`verde`/`amarelo`/`vermelho`).

## Aba 5 — Estoque de Etiquetas (refatorada)
Duas sub-seções (`<h3>` + tabela):

**Potes** — `useSemaforoPotes()` → `v_semaforo_potes`:
- Colunas: Label | Estoque (Input) | Meta 60 dias | Dias restantes | Badge.
- Update: `UPDATE potes_estoque SET qnt_estoque=$v, atualizado_em=now() WHERE tipo=$tipo`.

**Etiquetas** — `useSemaforoEtiquetas()` → `v_semaforo_etiquetas`:
- Colunas: Produto | Estoque (Input) | Meta 60 dias | Dias restantes | Badge.
- Update: `UPDATE etiquetas_estoque SET qnt_estoque=$v, atualizado_em=now() WHERE produto_nome=$nome`.

Edição com debounce 600 ms; invalida a view correspondente.

## Detalhes técnicos
- Todos os acessos via `samkhyaSupabase` (schema `samkhya`).
- Reuso de `Tabs`, `Table`, `Input`, `Button`, `Badge`, `Accordion` do shadcn.
- Sem novas rotas. `AdminNav` + `Seo` mantidos.
- Estilo: roxo `#7b4963` para CTAs; semáforo usa `bg-green-500 / bg-yellow-500 / bg-red-500` puros (cor de status, não tema).
- Sem confirmação modal — toast direto em todas as ações.

## Fora de escopo
- Migrações no banco (tudo já existe).
- Dialogs de criar/editar ingrediente, venda, produção avulsa.
- Permissões/RLS (assumindo policies admin já configuradas).
