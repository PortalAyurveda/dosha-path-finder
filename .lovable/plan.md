## /admin/estoque — Gestão de produção Samkhya

Nova área administrativa para gerenciar ingredientes, produções e vendas da marca Samkhya, lendo do schema `samkhya` no Supabase.

### 1. Backend — expor o schema `samkhya` via REST

Hoje o schema `samkhya` existe no banco mas **não está exposto** na API REST do Supabase (a config `pgrst.db_schemas` lista apenas `public, graphql_public, loja, premium`). Sem esse passo, qualquer query do frontend devolve "schema not found".

Migration:
```sql
ALTER ROLE authenticator
  SET pgrst.db_schemas = 'public, graphql_public, loja, premium, samkhya';
NOTIFY pgrst, 'reload config';
```

As tabelas `samkhya.ingredientes`, `producoes`, `vendas`, `produtos`, `receitas` e as views `v_estoque_ingredientes` e `v_necessidade_ingredientes` já existem. Vou habilitar RLS em todas com policy de leitura/escrita liberada para **role `admin`** (usando `public.is_admin()` que já existe), seguindo o mesmo padrão do schema `loja`. Sem auth, ninguém edita — a página `/admin/estoque` já fica dentro de `AdminRoute`, então só admin acessa.

### 2. Cliente Supabase dedicado

Criar `src/integrations/supabase/samkhya-client.ts` com `db.schema='samkhya'` (igual ao `loja-client.ts`). Toda a página de estoque usa esse cliente.

### 3. Estrutura de páginas/componentes

```text
src/pages/AdminEstoque.tsx              # rota /admin/estoque, monta 3 tabs
src/components/admin/estoque/
  EstoqueTab.tsx                        # aba 1
  ProducaoTab.tsx                       # aba 2
  VendasTab.tsx                         # aba 3
  IngredienteFormDialog.tsx             # modal novo/editar ingrediente
  NovaProducaoDialog.tsx                # modal nova produção
src/hooks/useSamkhyaEstoque.ts          # hooks com React Query para
                                        # estoque, producoes, necessidade,
                                        # vendas, produtos
```

Rota adicionada em `src/App.tsx` dentro do bloco admin, e link "Estoque" em `src/components/admin/AdminNav.tsx` (ícone `Package`).

### 4. Aba 1 — Estoque de ingredientes

- Lista `samkhya.v_estoque_ingredientes`, render em `<Table>` shadcn.
- Colunas: Nome, Categoria, Estoque (g), Estoque (kg), Preço/kg, Valor em estoque (R$), Notas, Atualizado em.
- Headers clicáveis ordenam por Nome (A-Z/Z-A), Estoque g (asc/desc), Atualizado em (recente/antigo). Estado local de ordenação.
- Linha com `qnt_estoque_g = 0` recebe `bg-muted/40 text-muted-foreground`.
- Botão "Editar" por linha abre `IngredienteFormDialog` em modo edição (campos: `qnt_estoque_g`, `preco_kg`, `categoria`, `notas`). Submit faz `update` em `samkhya.ingredientes` por `id`.
- Botão "Novo ingrediente" abre o mesmo dialog em modo criação (`nome` + os 4 campos). Submit faz `insert`.
- Após salvar, invalida queries e mostra toast (sonner).

### 5. Aba 2 — Produção

Grid 2 colunas no desktop (`md:grid-cols-2`), empilha no mobile.

**Esquerda — Produções planejadas:**
- Lista `samkhya.producoes` com `status='planejada'`, join leve com `produtos(nome)`.
- Cada card: produto, unidades desejadas, criado_em. Botões "Confirmar" (update `status='confirmada'`, `confirmado_em=now()`) e "Cancelar" (update `status='cancelada'` — soft cancel; se preferir DELETE me avisa).
- Clique no card seleciona aquela produção (estado local) e popula a coluna direita.
- Botão "Nova produção" abre `NovaProducaoDialog`: dropdown de produtos `ativo=true` + input numérico de unidades. Submit insere em `producoes` com `status='planejada'`.

**Direita — Necessidade de ingredientes da produção selecionada:**
- A view `v_necessidade_ingredientes` **não tem `produto_id`** (verifiquei o schema), então não dá pra filtrar a view por produção. Calcular client-side a partir de `samkhya.receitas` daquele `produto_id` + estoque atual:
  - Necessário = `receita.quantidade_g * producao.unidades_desejadas`
  - Em estoque = `ingredientes.qnt_estoque_g`
  - Saldo = estoque − necessário; status ✅ se saldo ≥ 0, ❌ caso contrário.
- Tabela com colunas: Nome, Necessário (g), Em estoque (g), Saldo (g), Status. Linhas com falta: `bg-destructive/10`.
- Se preferir que eu crie/altere a view para aceitar `produto_id` em vez de calcular no client, me diga.

### 6. Aba 3 — Vendas

- Form (`react-hook-form` + `zod`): produto (dropdown produtos ativos), quantidade, preço unitário, canal (select: loja_online / kit / terapeuta / aluno / outro), data (default hoje), observações (textarea). Submit insere em `samkhya.vendas`.
- Abaixo, `<Table>` com últimas 50 vendas (`order by data desc limit 50`), join `produtos(nome)`. Colunas: data, produto, quantidade, preço unit., canal, total (calculado `qtd*preço`).
- Após inserir: invalida query, limpa form, toast de sucesso.

### 7. Identidade visual

Reuso de tokens do portal admin (mesma cara das outras telas `/admin/*`) — fundo `bg-background`, cards `bg-card`, primary `#352F54`. **Não** uso os tokens roxo/ouro da loja Samkhya: essa tela é admin interno, não vitrine. Se preferir aplicar a paleta da loja (roxo `#7b4963` + ouro `#C8922A`) aqui também, me avise.

### 8. Pontos abertos pra confirmar

1. **Cancelar produção** = soft (`status='cancelada'`) ou hard delete?
2. **Schema da tabela `vendas`** — não inspecionei os nomes exatos das colunas; vou ler antes de implementar e ajustar o form aos nomes reais (provavelmente `produto_id, quantidade, preco_unit, canal, data, observacoes`).
3. **Identidade visual**: padrão admin (recomendado) ou paleta da loja Samkhya?
