# Errata — adicionar "Estoque de Insumos" na aba Estoque de Produtos

Adicionar uma segunda tabela abaixo da existente em `TabEstoqueProdutos.tsx`, consumindo `samkhya.v_necessidade_ingredientes`. A primeira tabela (capacidade por produto) fica intacta.

## Arquivos

- **`src/integrations/supabase/samkhya-client.ts`** — adicionar tipo `SkNecessidadeIngrediente` (id, nome, qnt_estoque_g, qnt_necessaria_g, saldo_g, status: `'ok' | 'falta' | 'sem_pedido'`, preco_kg, categoria, atualizado_em).
- **`src/hooks/useSamkhyaEstoque.ts`** — adicionar:
  - `useNecessidadeIngredientes()` → `select * from v_necessidade_ingredientes`.
  - `useUpdateIngredienteEstoque()` → `UPDATE ingredientes SET qnt_estoque_g=$v, atualizado_em=now() WHERE id=$id`; invalida `["samkhya","ingredientes"]`, `["samkhya","necessidade"]`, `["samkhya","estoque"]`, `["samkhya","capacidade"]`.
- **`src/components/admin/estoque-v2/tabs/TabEstoqueProdutos.tsx`** — abaixo da tabela existente, renderizar um novo `<section>` com o componente novo.
- **`src/components/admin/estoque-v2/tabs/EstoqueInsumosTable.tsx`** (novo) — toda a UI da segunda tabela.

## Componente `EstoqueInsumosTable`

- Filtro local: estado `'todos' | 'falta' | 'ok'`, três `Button` (variant outline/default) no header.
- Ordenação fixa: `falta` → `ok` → `sem_pedido`, e dentro de cada grupo por nome.
- Helper `fmtPeso(g)`: `>= 1000` → `"X,XX kg"`, senão `"X g"` (arredondado).
- Coluna **Em estoque**: `Input` numérico controlado por estado local (`Record<id,string>`), sincronizado via `useEffect` quando o `data` muda. Debounce 600ms via `setTimeout` por linha (ref `Record<id, NodeJS.Timeout>`) → dispara `useUpdateIngredienteEstoque.mutateAsync({ id, qnt })` + toast em sucesso/erro. Cancela timeout anterior a cada keystroke.
- Coluna **Status**: badge com classes `bg-green-500` / `bg-red-500` / `bg-gray-400` (texto branco), capitalizado: "OK" / "Falta" / "Sem pedido".
- Colunas exibidas: Ingrediente | Em estoque (input) | Necessário | Saldo | Status.
- Estados: `isLoading` e `error` (mensagem em vermelho).

## Fora de escopo

- Nenhuma mudança nas outras abas, hooks, ou no schema do banco (view `v_necessidade_ingredientes` já existe com todos os campos).
- Sem migração.
