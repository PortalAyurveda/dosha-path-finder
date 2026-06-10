# Plano: Gerador de Resultado Final + Estoque de Produtos por Capacidade

## 1. Aba "Estimativa de Vendas" — toggle de meses + botão gerador

Acima da tabela existente em `TabEstimativaVendas.tsx`, adicionar uma barra:

- **Toggle (ToggleGroup shadcn):** `[1 mês] [2 meses] [3 meses]` — default `2`. Estado local `meses: 1|2|3`.
- **Botão "Gerar Resultado Final"** (cor primária, à direita).

Ao clicar:
1. Para cada produto da lista: `a_produzir = max(0, ceil(estimativa_mensal × meses) - estoque_atual)`.
2. Monta um objeto `{ [produto_id]: a_produzir }`.
3. Persiste em `sessionStorage` com chave `samkhya:resultado-final:seed` (e timestamp).
4. Dispara um `CustomEvent("samkhya:abrir-resultado")` no `window` com o payload.
5. Toast: "Resultado Final gerado com base em X meses".

### Conexão com o painel "Resultado Final"

Em `AdminEstoque.tsx`:
- Listener no `window` para `samkhya:abrir-resultado` → adiciona `"resultado"` ao `Set` de painéis abertos.

Em `TabResultadoFinal.tsx`:
- No mount, ler `sessionStorage["samkhya:resultado-final:seed"]` (se existir e não consumido). Hidratar o estado `selecao` com os valores. Consumir a chave (remover) para não re-aplicar.
- Também escutar o `CustomEvent` para casos em que o painel já está montado (atualiza `selecao` substituindo).
- O usuário continua podendo editar os valores normalmente.

## 2. Aba "Estoque de Produtos" — substituir tabela pela view v_capacidade_producao

A view já tem todas as colunas necessárias (confirmado): `id, nome, peso_unidade_g, estimativa_3_meses, estimativa_mensal, estoque_atual, meta_60_dias, unidades_possiveis, dias_estoque_atual, semaforo_estoque, semaforo_insumos`.

### Mudanças

**`samkhya-client.ts`** — atualizar `SkCapacidade`:
- Remover `semaforo`. Adicionar: `estoque_atual: number | null`, `dias_estoque_atual: number | null`, `semaforo_estoque: SkSemaforo`, `semaforo_insumos: SkSemaforo`.

**`useSamkhyaEstoque.ts`**:
- `useCapacidadeProducao`: trocar `.order("nome")` por `.order("dias_estoque_atual", { ascending: true, nullsFirst: false })`.
- Adicionar `useUpdateProdutoEstoque({ id, estoque_atual })` → `UPDATE produtos SET estoque_atual = $v`. Invalida `["samkhya","capacidade"]`, `["samkhya","produtos"]`, `["samkhya","semaforo"]`.

**`TabEstoqueProdutos.tsx`** — reescrever a única tabela com colunas:
1. **Produto** (nome)
2. **Estoque atual** — `<Input type="number">` com debounce 600ms (mesmo padrão de `EstoqueInsumosTable`) chamando `useUpdateProdutoEstoque`.
3. **Dias restantes** — `dias_estoque_atual` formatado (`—` se nulo, senão `N d`).
4. **Semáforo estoque** — `<SemaforoBadge semaforo={semaforo_estoque} showLabel />`.
5. **Unid. produzíveis** — `unidades_possiveis`.
6. **Meta 60 dias** — `meta_60_dias`.
7. **Semáforo insumos** — `<SemaforoBadge semaforo={semaforo_insumos} showLabel />`.

Linhas de loading/erro mantidas.

## Escopo

- Sem migrations (view e coluna `produtos.estoque_atual` já existem).
- Sem mudanças em outras abas / painéis / hooks não citados.
- `EstoqueInsumosTable` (painel mestre) permanece intacto.
