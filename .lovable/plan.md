## Bug: "Invalid schema: rpg" no /rpg

### Causa
`src/features/rpg/api.ts` chama `(supabase as any).schema("rpg").rpc(...)`. O client supabase-js valida o nome do schema contra a lista declarada nos `Database` types (apenas `public`). Como `rpg` não está lá, o próprio client-side dispara `Invalid schema: rpg` antes mesmo de bater na rede. Por isso o "Entrar" e "Criar mesa" quebram imediatamente.

Além disso, mesmo bypassando a validação do client, o PostgREST do Supabase só responde em schemas declarados em **API → Exposed schemas** no dashboard. Por padrão são `public, graphql_public, storage`.

### Correção (frontend)
Substituir o uso de `.schema("rpg").rpc(...)` por uma chamada `fetch` direta ao endpoint REST do PostgREST, mandando os headers `Content-Profile: rpg` e `Accept-Profile: rpg`. Isso evita a validação client-side e diz ao PostgREST para resolver a função no schema `rpg`.

Arquivos:

1. **`src/integrations/supabase/rpg-client.ts`** — adicionar `rpgRpc(fn, args)`:
   - lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
   - pega `access_token` atual via `supabase.auth.getSession()` (fallback para anon)
   - `POST ${URL}/rest/v1/rpc/${fn}` com headers:
     - `apikey: <publishable>`
     - `Authorization: Bearer <access_token || publishable>`
     - `Content-Type: application/json`
     - `Content-Profile: rpg`
     - `Accept-Profile: rpg` (só por segurança no retorno)
   - retorna `{ ok:true, data } | { ok:false, error }`

2. **`src/features/rpg/api.ts`** — trocar a implementação interna de `rpgRpc` para delegar ao helper acima. Assinatura e nomes de funções RPC (`criar_party`, `entrar_party`, `meus_personagens`, etc.) ficam iguais — nenhum dos consumidores muda.

3. Manter `rpg_admin_select` (público) como está; o painel admin continua funcionando.

### Pré-requisito do lado Supabase (precisa de você)
No painel do Supabase: **Project Settings → API → Exposed schemas**, adicionar `rpg` à lista (`public, graphql_public, storage, rpg`) e clicar Save. Sem isso o PostgREST devolve `404 Not Found` para qualquer RPC do schema `rpg` — independente do front. Posso confirmar via `supabase--read_query` se as funções existem, mas não consigo alterar essa configuração por migration.

### Verificação
Após a mudança e a exposição do schema:
- `/rpg` → "Criar mesa" deve retornar `{ ok:true, party_id, join_code }` e seguir para criação de personagem.
- "Entrar com código" deve aceitar um code válido.
- Sem regressão no `/admin/rpg` (continua usando RPC `public.rpg_admin_select`).

Se mesmo após expor o schema o RPC voltar 404/permission, criamos wrappers SECURITY DEFINER em `public` para cada função (`public.rpg_criar_party`, etc.) — caminho B, mais verboso, mas 100% sob nosso controle via migration.