## Diagnóstico

O problema **não é de RLS/policies** — quando uma policy bloqueia, o usuário recebe erro de "permission denied", mas continua logado. O que está acontecendo é **perda da sessão de autenticação**, principalmente no Safari/iOS. As causas mais prováveis no projeto atual:

### 1. Configuração mínima do cliente Supabase
Em `src/integrations/supabase/client.ts` temos apenas:
```ts
auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
```
Faltam três opções importantes:
- `detectSessionInUrl: true` — necessário para OAuth (Google) completar o login corretamente após redirect.
- `flowType: 'pkce'` — fluxo recomendado para SPA. Sem isso, em alguns casos o Safari descarta a sessão por considerar o token "third-party".
- `storageKey` explícito — evita conflito quando há múltiplos `createClient` no mesmo domínio (temos `premium-client.ts` e `loja-client.ts`).

### 2. Safari ITP (Intelligent Tracking Prevention)
O Safari/iOS apaga `localStorage` de sites após **7 dias sem interação** do usuário. Não dá para eliminar 100%, mas dá para reduzir muito o impacto:
- Habilitando refresh token rotation (já está com `autoRefreshToken: true`).
- Usando PKCE (acima).
- Aumentando o JWT expiry no Supabase (hoje provavelmente 1h — pode ir até 1 semana). Quando o app abre e o JWT ainda é válido, o refresh nem precisa rodar.

### 3. `signOut` global derrubando outras abas/dispositivos
O `signOut()` atual em `UserContext.tsx` chama `supabase.auth.signOut()` sem escopo, que é `global` por padrão — isso desloga o usuário em **todos os dispositivos**. Se ele logou no celular e depois no PC, o `signOut` em um pode estar invalidando o refresh token do outro. Mudar para `signOut({ scope: 'local' })` mantém os outros dispositivos logados.

### 4. Refresh token expira em background
Em iOS, quando a aba fica em background por muito tempo, o `setInterval` do auto-refresh não roda. Quando o usuário volta, o token já expirou. Solução: chamar `supabase.auth.refreshSession()` quando a aba volta a ficar visível (`visibilitychange`).

---

## Plano de mudanças

### A. `src/integrations/supabase/client.ts`
Atualizar a config:
```ts
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  storageKey: 'sb-portalayurveda-auth',
}
```

### B. `src/integrations/supabase/premium-client.ts` e `loja-client.ts`
Adicionar `storageKey` único em cada um (`'sb-premium-noauth'`, `'sb-loja-noauth'`) para garantir que nunca colidam com o cliente principal — mesmo com `persistSession: false`, o SDK ainda usa a chave internamente em alguns fluxos.

### C. `src/contexts/UserContext.tsx`
1. Mudar `signOut`: `await supabase.auth.signOut({ scope: 'local' })`.
2. Adicionar listener de `visibilitychange` que chama `supabase.auth.refreshSession()` quando a aba volta a ficar visível, para revalidar o token antes do usuário tentar usar a sessão.

### D. Configuração no painel Supabase (você precisa fazer manualmente)
Em **Authentication → Settings**:
- **JWT expiry**: aumentar de `3600` (1h) para `604800` (7 dias). Reduz a frequência de refresh, ajuda muito no Safari.
- **Refresh token reuse interval**: manter padrão.
- **Inactivity timeout**: deixar desabilitado (ou no máximo).

Eu deixo um link direto para essa página depois.

---

## O que isso não resolve
Se o usuário ficar **mais de 7 dias sem abrir o site no Safari/iOS**, o localStorage é apagado pelo próprio sistema e ele será deslogado — isso é limitação do iOS, não tem como contornar 100% num app web sem PWA instalado na tela inicial. Mas para uso semanal/diário, as mudanças acima devem eliminar quase todos os logouts indesejados.

## Resumo
Não é RLS. É config do cliente Supabase + comportamento do Safari ITP. Vou ajustar `client.ts`, os dois clientes auxiliares, o `signOut` e adicionar refresh em `visibilitychange`. Você precisa subir o JWT expiry no painel.