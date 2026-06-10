## Objetivo

Refazer `admin/estoque` como grade de 5 colunas reativa em tempo real, controlando estoque a partir do que será produzido. Não mexer em nenhuma outra área do admin.

## Layout

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ COL 1    │ COL 2    │ COL 3    │ COL 4    │ COL 5    │
│ Estoque  │ O que    │ Resultado│ Embala-  │ Estoque  │
│ insumos  │ produzir │ final    │ gens     │ produtos │
│          │          │          │ (em      │ (em      │
│ (scroll) │ (scroll) │ (scroll) │  breve)  │  breve)  │
└──────────┴──────────┴──────────┴──────────┴──────────┘
       altura = 100vh − header, cada coluna com scroll próprio
```

Em telas estreitas (<lg): vira pilha vertical com colunas empilhadas (mantém o produto utilizável).

## Fonte de dados (schema `samkhya`)

- `ingredientes` (79): `id, nome, qnt_estoque_g`
- `produtos` (14 ativos): `id, nome, peso_unidade_g, ativo`
- `receitas` (101): `produto_id, ingrediente_id, quantidade_g` — representa **um batch** de cada produto
- `producoes`: insert ao confirmar

## Lógica de cálculo (por produto selecionado)

```
batch_total_g  = Σ receitas.quantidade_g WHERE produto_id = X
unidades/batch = batch_total_g / produtos.peso_unidade_g
multiplicador  = unidades_desejadas / (unidades/batch)
gramas_necessárias[ing] = receitas.quantidade_g × multiplicador
```

Equivale a `quantidade_g × unidades_desejadas × peso_unidade_g / batch_total_g`. Tudo recalculado em memória a cada keystroke — sem RPC, sem botão calcular.

## Comportamento por coluna

**Col 1 — Estoque de insumos** (ordem alfabética)
- Linha: `nome` + `qnt_estoque_g` em g
- Cor dinâmica:
  - cinza: ingrediente não aparece em nenhum produto marcado
  - verde: estoque ≥ necessário
  - vermelho: estoque < necessário

**Col 2 — O que quero produzir** (lista corrida de produtos ativos)
- Checkbox + nome + input numérico (default 0)
- Quando unidades > 0: linha compacta dos ingredientes desse produto com `+Xg` formatado pt-BR
- Desmarcar checkbox zera o input

**Col 3 — Resultado final** (agrega tudo)
- Por ingrediente com necessário > 0: nome, necessário (g), em estoque (g), falta (g)
- Ordena: faltantes (vermelho) primeiro, depois ok (verde)
- Rodapé fixo: botão **Confirmar Produção** (primary, roxo `#7b4963`), desabilitado se nenhuma unidade selecionada

**Confirmar Produção** (sem modal):
1. Para cada produto com `unidades > 0`: `INSERT INTO samkhya.producoes (produto_id, unidades_desejadas, status, confirmado_em) VALUES (…, …, 'confirmada', now())`
2. Para cada ingrediente agregado: `UPDATE samkhya.ingredientes SET qnt_estoque_g = qnt_estoque_g - <necessário> WHERE id = <id>` (permite ficar negativo — sinaliza dívida de compra)
3. Zera inputs da Col 2, invalida queries (Col 1 recarrega), toast `"Produção confirmada e estoque atualizado"`

**Col 4 / Col 5** — card cinza centralizado "Em breve".

## Arquitetura técnica

- **Página**: reescrever `src/pages/AdminEstoque.tsx` — remove `Tabs`, monta a grade. Mantém `AdminNav` e `Seo`. Remove dependência das 3 abas atuais (`EstoqueTab`, `ProducaoTab`, `VendasTab` — arquivos ficam, só não são mais montados, para não mexer em outros lugares).
- **Novo diretório**: `src/components/admin/estoque-v2/`
  - `EstoqueGrid.tsx` — orquestra colunas + estado central `{ [produtoId]: unidades }`
  - `ColInsumos.tsx`
  - `ColProduzir.tsx`
  - `ColResultado.tsx`
  - `ColEmBreve.tsx` (reutilizado para 4 e 5)
  - `calc.ts` — funções puras de cálculo (testáveis)
- **Hooks novos em `src/hooks/useSamkhyaEstoque.ts`** (adiciona, não remove):
  - `useReceitasAll()` → todas as `receitas` em um fetch só
  - `useProdutosAtivos()` → produtos com `ativo = true`, ordem por nome
  - `useConfirmarProducao()` — mutation que faz os inserts + updates em sequência e invalida `estoque` e `produtos`
- **Cliente**: continua `samkhyaSupabase` (schema `samkhya`). Se as queries falharem por RLS/permissão, diagnosticamos com o linter do Supabase — fora do escopo desta entrega de UI, mas reportamos.

## Riscos / decisões

- **Estoque negativo permitido?** Proposta: sim, segue e mostra vermelho — o operador sabe que precisa comprar. Se preferir bloquear, ajusto.
- **Receita por batch vs por unidade**: assumindo "receita = 1 batch" conforme a fórmula. Se alguma receita estiver registrada como "por unidade", o multiplicador ficará errado. Confirmar.
- **Não há rollback transacional** entre os inserts/updates do Supabase JS — se um update falhar no meio, os anteriores persistem. Para a escala atual (poucos produtos por confirmação) é aceitável; futuramente pode virar RPC `confirmar_producao(jsonb)`.

## Fora do escopo

Abas Vendas, Ingrediente/Produção dialogs antigos, qualquer outra rota `/admin/*`, estilos globais.
