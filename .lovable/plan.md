## Diagnóstico confirmado

O erro vem da função `public.admin_set_portal_conteudo_destaques(_ids uuid[])`.

Ela retorna `TABLE(id uuid, destaque_ordem integer)`. Em PL/pgSQL, esse `id` vira uma variável de saída da função. Dentro do `UPDATE`, há um trecho usando `id` sem qualificar:

```sql
AND (_ids IS NULL OR NOT (id = ANY(_ids)))
```

O Postgres não sabe se esse `id` é a coluna `portal_conteudo.id` ou a variável de retorno `id`, então dá:

```text
column reference "id" is ambiguous
```

## Plano de correção

1. Atualizar a função RPC no Supabase
   - Recriar `public.admin_set_portal_conteudo_destaques(_ids uuid[])`.
   - Usar alias explícito da tabela em todos os pontos:
     - `UPDATE public.portal_conteudo AS pc`
     - `pc.id`
     - `pc.destaque_index`
     - `pc.destaque_ordem`
   - Manter o retorno com os mesmos nomes (`id`, `destaque_ordem`) para não quebrar o frontend.

2. Validar no banco antes de dizer que funciona
   - Ler a lista atual de destaques e IDs.
   - Chamar a RPC com a ordem atual para testar a função sem mudar a intenção da lista.
   - Reconsultar `portal_conteudo` ordenado por `destaque_ordem`.
   - Confirmar que:
     - a RPC não dá erro;
     - o retorno tem os mesmos IDs enviados;
     - a ordem persistida no banco bate exatamente com a ordem esperada.

3. Só depois revisar o frontend se ainda houver falha
   - Se a RPC passar no teste real e a tela ainda falhar, auditar a chamada em `AdminBlog.tsx` e o token da sessão do usuário.
   - Se a RPC falhar, corrigir no banco antes de mexer no React.

## Resultado esperado

O botão de salvar deixará de cair no erro `column reference "id" is ambiguous`, e eu só vou considerar resolvido depois de executar a RPC e conferir a persistência real no Supabase.