
# Reescrever /admin/estoque

Substitui completamente a página `src/pages/AdminEstoque.tsx` (que hoje usa painéis empilháveis) por uma estrutura de **4 abas + modal de resultado**, preservando `AdminNav`, `Seo` e identidade visual Samkhya (tokens em `src/components/samkhya/tokens.ts`). Nada fora dessa página é alterado.

## Estrutura de arquivos

Novos componentes em `src/components/admin/estoque-v2/`:
- `EstoqueShell.tsx` — wrapper de abas (shadcn `Tabs`) + estado compartilhado (`qtdProduzir: Record<produto_id, number>`)
- `tabs/TabInsumos.tsx` — Aba 1
- `tabs/TabProdutos.tsx` — Aba 2 (substitui as antigas Estimativa/Produtos)
- `tabs/TabPotes.tsx` — Aba 3
- `tabs/TabEtiquetas.tsx` — Aba 4
- `ResultadoProducaoModal.tsx` — modal acionado pelo botão da Aba 2
- `semaforo.ts` — função única `mesesEstoqueSemaforo(estoque, estimativaMensal)` → `verde | amarelo | vermelho | cinza`
- `IngredienteFormDialog.tsx` — modal "Novo ingrediente"

Reescreve `src/pages/AdminEstoque.tsx` para renderizar apenas `<EstoqueShell />` dentro do layout admin atual.

Arquivos antigos removidos (somente os usados pela página atual):
`tabs/EstoqueInsumosTable.tsx`, `TabEstimativaVendas.tsx`, `TabResultadoFinal.tsx`, `TabConfirmarProducao.tsx`, `TabEstoqueProdutos.tsx`, `TabEstoqueEtiquetas.tsx`.

## Fontes de dados (schema `samkhya`, via `samkhyaSupabase`)

| Aba | Leitura | Escrita |
|---|---|---|
| Insumos | `v_necessidade_ingredientes` | `ingredientes` (UPDATE/INSERT) |
| Produtos | `produtos WHERE ativo=true` + `receitas` | `produtos` (UPDATE inline) |
| Potes | `v_semaforo_potes` + `v_consumo_embalagens` filtro `pote` | `potes_estoque.qnt_estoque` |
| Etiquetas | `v_semaforo_etiquetas` + `v_consumo_embalagens` filtro `etiqueta` | `etiquetas_estoque.qnt_estoque` |

Confirmar produção: `INSERT producoes` + UPDATEs em `ingredientes`, `potes_estoque`, `etiquetas_estoque`.

## Regra única de semáforo

```ts
meses = estoque / estimativaMensal
verde   ≥ 2
amarelo ≥ 1 e < 2
vermelho < 1
cinza   = sem estimativa
```

Aplicada em todas as 4 abas e no modal. Ordenação padrão: vermelho → amarelo → verde → cinza.

## Aba 1 — Insumos

Tabela: semáforo · nome · estoque (g) · necessário (g) · saldo (g, verde+/vermelho−) · preço/kg · atualizado em.
- Headers clicáveis (nome, estoque, atualizado) para reordenar.
- Edição inline por linha (lápis): `qnt_estoque_g`, `preco_kg`, `categoria`, `notas` → UPDATE em `samkhya.ingredientes` (trigger atualiza `atualizado_em`).
- Botão "Novo ingrediente" → modal com mesmos campos → INSERT.

## Aba 2 — Produtos & Planejamento

Tabela dividida visualmente em 2 seções:

**Seção A — dados (editável inline):**
semáforo · nome · estoque_atual (unid.) · estimativa_mensal.
Ao salvar `estimativa_mensal`, grava também `estimativa_3_meses = estimativa_mensal * 3`.

**Seção B — ação:**
Input numérico "unidades a produzir" (estado local `qtdProduzir[produto_id]`, padrão 0, não persistido).
Abaixo do input, texto compacto com prévia dos ingredientes consumidos calculada localmente a partir de `receitas` (reutiliza/inspira-se em `estoque-v2/calc.ts`): `"açafrão +1.300g · aloe vera +800g"`.

Rodapé fixo da aba: botão **"Ver resultado completo →"** abre `ResultadoProducaoModal` passando `qtdProduzir`.

## Aba 3 — Potes

Tabela: semáforo · tipo (label) · estoque (unid., editável) · estimativa_mensal (read-only da view) · meses · atualizado em.
Edição inline grava em `potes_estoque.qnt_estoque`.

Abaixo: card "Necessário para produções planejadas" alimentado por `v_consumo_embalagens` (filtro `tipo_embalagem='pote'`) cruzado com `qtdProduzir` do estado compartilhado: pote · necessário · em estoque · saldo · status ok/falta.

## Aba 4 — Etiquetas

Idêntica à Aba 3, lendo de `v_semaforo_etiquetas` e gravando em `etiquetas_estoque.qnt_estoque`. Bloco inferior usa `v_consumo_embalagens` filtro `etiqueta`.

## Modal — Resultado da Produção

Acionado pela Aba 2. Três blocos (Insumos / Potes / Etiquetas) com colunas: nome · necessário · em estoque · saldo · semáforo. Linhas faltantes com fundo vermelho claro, ok com fundo verde claro.

Botão **"Confirmar Produção"** executa em sequência (Promise.all por grupo, captura de erro com toast):

```
1. produtos com unid>0  → INSERT producoes {produto_id, unidades_desejadas, status:'confirmada', confirmado_em: now()}
2. ingredientes         → UPDATE ingredientes SET qnt_estoque_g = qnt_estoque_g - <nec>
3. potes                → UPDATE potes_estoque SET qnt_estoque = qnt_estoque - <nec>
4. etiquetas            → UPDATE etiquetas_estoque SET qnt_estoque = qnt_estoque - <nec>
```

Após sucesso: fecha modal, `toast.success("Produção confirmada")`, dispara `refetch` (`react-query` invalidate ou callback) em todas as 4 abas, zera `qtdProduzir`.

## Notas técnicas

- Cliente: `samkhyaSupabase` existente (`src/integrations/supabase/samkhya-client.ts`).
- UI: shadcn `Tabs`, `Table`, `Dialog`, `Input`, `Button`; `sonner` para toasts; `lucide-react` icons (Pencil, Plus, AlertCircle).
- Estado compartilhado de `qtdProduzir` no `EstoqueShell` via Context leve ou prop drilling (apenas Aba 2 escreve; Abas 3/4 e Modal leem).
- Sem paginação, sem virtualização — listas completas com `overflow-auto`.
- Layout responsivo, otimizado desktop (`min-w-[900px]` nas tabelas com scroll horizontal no mobile).
- Cores semáforo via classes Tailwind existentes (`bg-green-500`, `bg-yellow-500`, `bg-red-500`, `bg-gray-300`) consistentes com `SemaforoBadge.tsx` atual (reaproveitar componente).
