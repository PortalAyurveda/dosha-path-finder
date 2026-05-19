## Diagnóstico da auditoria

O problema mais provável está no frontend, não em RLS nem em Cloudflare neste momento.

Encontrei três pontos concretos que explicam o comportamento:

1. `src/contexts/UserContext.tsx` usa `onAuthStateChange` e, ao mesmo tempo, chama `supabase.auth.getSession()` manualmente na inicialização. Isso cria uma corrida de estado: o app pode renderizar como deslogado antes do evento inicial estabilizar.
2. O mesmo contexto força `supabase.auth.refreshSession()` toda vez que a aba volta a ficar visível. Isso bate exatamente com o relato de “troco de aba, volto e desloga” e também pode gerar eventos de token revogado em sequência.
3. Existem clientes Supabase secundários (`loja-client.ts` e `premium-client.ts`). Eles estão com `persistSession: false` e `autoRefreshToken: false`, então não parecem disputar o token principal, mas ainda são instâncias extras. Vou deixá-los fora da correção principal para não alterar lógica de dados da loja/premium sem necessidade.

Também confirmei:

- Só existe um `UserProvider` montado no app.
- O cliente principal já fica em `src/integrations/supabase/client.ts`, mas pode ser reforçado como singleton global para evitar recriação por hot reload/remount.
- As rotas admin já esperam `loading` antes de redirecionar.
- Os logs do Supabase mostram `token_revoked` seguido de `login` para o mesmo usuário, coerente com disputa/refresh prematuro.

## Plano de implementação

1. **Blindar o cliente Supabase principal como singleton absoluto**
   - Alterar `src/integrations/supabase/client.ts` para reutilizar uma única instância global no browser.
   - Manter o mesmo `storageKey`, `persistSession`, `autoRefreshToken`, `detectSessionInUrl` e `flowType` para não quebrar login atual.
   - Não mexer no arquivo de types gerado.

2. **Reescrever a inicialização do `UserContext` sem corrida de sessão**
   - Remover o `getSession()` paralelo da montagem do contexto.
   - Usar `onAuthStateChange` como fonte única para sessão inicial e mudanças futuras.
   - Tratar `INITIAL_SESSION` como o momento em que `loading` pode sair de `true`.
   - Evitar `await` pesado dentro do callback de auth: atualizar `user/session/loading` primeiro e carregar perfil/role/dosha em tarefas assíncronas separadas, sem bloquear a estabilização da sessão.

3. **Remover refresh manual ao voltar para a aba**
   - Excluir o listener de `visibilitychange` que chama `refreshSession()`.
   - Deixar o SDK do Supabase controlar `autoRefreshToken`, que já é feito com lock interno.
   - Isso ataca diretamente o bug relatado no desktop e celular.

4. **Evitar falso “deslogado” durante hidratação**
   - Manter `loading=true` até `INITIAL_SESSION`.
   - Quando não houver sessão real, só então limpar dados locais dependentes de login.
   - Preservar a lógica de `activeDoshaId`, `pendingClaimIdPublico`, role, perfil e signOut, mas sem limpar estado antes da sessão inicial resolver.

5. **Revisar redirects sensíveis após a mudança**
   - Conferir páginas que mandam para `/entrar` (`AdminRoute`, `Assinar`, `TerapeutaCadastro`) para garantir que não redirecionem enquanto `loading` ainda estiver ativo.
   - Ajustar apenas se houver caso real de redirect prematuro.

6. **Validação antes de dizer que funcionou**
   - Verificar no código que não sobrou `getSession()` paralelo no `UserContext` nem `refreshSession()` em `visibilitychange`.
   - Checar console/dev-server para erro de runtime.
   - Testar no preview: abrir app, autenticação inicial, trocar de aba/voltar e confirmar que o estado não vira deslogado.
   - Se possível, comparar logs auth recentes depois do teste para ver se parou o padrão de refresh/token revogado em sequência.

## Fora do escopo desta correção

- Não vou alterar RLS, funções SQL, roles ou banco.
- Não vou refatorar login OTP/Google além do necessário.
- Não vou mexer em Cloudflare agora; só investigaria isso se o bug continuar depois de remover a corrida/refresh manual no app.