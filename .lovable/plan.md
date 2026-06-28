## Diagnóstico

A causa raiz é simples: o schema `rpg` **não está exposto na API REST do Supabase em produção**.

O que já está correto no banco:
- `GRANT USAGE` no schema `rpg` para `authenticated` / `service_role` — ok
- RLS habilitado em todas as 20 tabelas do schema `rpg` — ok
- Policy "Admins can read" usando `public.has_role(auth.uid(), 'admin')` em cada tabela — ok
- `supabase/config.toml` com `schemas = ["public", "rpg"]` — ok

**O detalhe que falta:** o `config.toml` só vale para o ambiente **local** do Supabase CLI. No projeto **hospedado** (que é o que serve `portalayurveda.com`), a lista de schemas expostos pelo PostgREST é controlada pelo **Dashboard do Supabase**, não pelo arquivo. Por isso o cliente em `rpg-client.ts` (que faz `db: { schema: "rpg" }`) recebe erro / vazio: o PostgREST simplesmente não conhece o schema `rpg` na API hospedada.

## O que precisa ser feito (ação manual no Dashboard, 30 segundos)

Você precisa abrir as configurações da API do Supabase e adicionar `rpg` à lista de schemas expostos:

1. Abrir **Project Settings → API**
2. Localizar o campo **"Exposed schemas"** (hoje provavelmente está `public, graphql_public`)
3. Adicionar `rpg`, ficando: `public, graphql_public, rpg`
4. Salvar — o PostgREST recarrega sozinho em poucos segundos

Depois disso, recarregar `/rpg/admin` já logado como admin deve listar todo o conteúdo.

Não é algo que eu consiga fazer por migration nem por código — é uma configuração de projeto exclusiva do Dashboard.

## Por que não fazer nada no código

Tudo do lado de aplicação e RLS já está correto. Mexer no client, nas policies ou criar views só vai mascarar o problema real. Assim que `rpg` entrar na lista de exposed schemas, a tela passa a funcionar sem nenhuma alteração de código.

## Plano após você confirmar que adicionou no Dashboard

1. Você abre `/rpg/admin` logado como admin e me confirma se carregou.
2. Se ainda der erro, eu investigo: leio a resposta exata do PostgREST no Network tab, checo se a sessão admin está chegando com o JWT correto e ajusto o que for preciso (provavelmente nada, mas fico de olho).

Quer que eu já deixe pronta uma mensagem de erro mais clara na tela `/rpg/admin` (algo como "Schema rpg não exposto — configure em Project Settings → API") para casos futuros, ou prefere deixar como está?