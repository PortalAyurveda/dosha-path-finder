# Toggle ativo/inativo na gestão de produtos da loja

## Objetivo
Permitir ativar/desativar cada produto direto na lista de /admin/loja, atualizando `loja.produtos.ativo` sem recarregar a página.

## Verificação já feita
- A vitrine pública já filtra `ativo = true` em todas as telas: `/samkhya` (Samkhya.tsx), categorias (SamkhyaCategoria.tsx), página de produto (SamkhyaProduto.tsx) e /samkhya/todos (SamkhyaTodos.tsx). Nenhuma mudança necessária no front público.
- A lista do admin (`AdminLoja.tsx`) carrega todos os produtos via `lojaSupabase.from("produtos").select("*")` e renderiza um `ProdutoEditor` por item, com `onSaved` atualizando o estado local.

## Implementação

1. **`src/pages/AdminLoja.tsx` — ProdutoEditor**
   - Adicionar um `Switch` (shadcn) no cabeçalho do card de cada produto, ao lado do nome — refletindo `produto.ativo`.
   - Clique no switch: atualização otimista (muda o estado na hora), depois `lojaSupabase.from("produtos").update({ ativo: novoValor }).eq("id", produto.id)`.
   - Em caso de erro: reverte o estado e mostra toast de erro; em sucesso: toast discreto ("Produto ativado/desativado") e propaga via `onSaved` para manter a lista sincronizada.
   - O clique no switch não deve abrir/fechar o card (stopPropagation, já que o header é clicável).
   - Indicação visual sutil quando inativo (ex.: nome com opacidade reduzida), sem alterar o layout.

## Fora de escopo
- Kits não ganham toggle (não pedido).
- Nenhuma mudança na vitrine pública (filtro já existe e foi confirmado).

## Verificação
- Build OK e teste no preview: alternar um produto, confirmar no Supabase que `ativo` mudou e que ele some/volta na vitrine.
