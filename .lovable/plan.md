Nenhuma alteração de código necessária.

## Auditoria realizada

Busca por `signInWithOtp` e `signInWithOAuth` em todo o `src/`:

- `src/pages/Auth.tsx:86` — `signInWithOAuth` (Google), já oculto quando `isInstagram`.
- `src/pages/Auth.tsx:116` — `signInWithOtp`, envolto pela lógica `usarMagicLink = isInstagram && !isMicrosoftEmail`.

Não há nenhuma outra chamada de login em todo o frontend.

## Fluxos verificados

1. **Teste 9/9 → /meu-dosha deslogado → botão "entrar"**: `MeuDosha.tsx:780` faz `navigate('/entrar?claim=${id}')`. Cai no mesmo `Auth.tsx`, mesma detecção, mesmo ramo magic link quando dentro do Instagram.
2. **Demais botões de login do app** (Header, PremiumGate, Samkhya, formação, etc.): todos navegam para `/entrar`. Nenhum chama o SDK do Supabase diretamente.

## Resultado

A regra "Instagram + email não-Microsoft → magic link, resto → OTP" é aplicada de forma centralizada e cobre 100% das entradas de login do app, inclusive o caminho pós-teste. Nada a implementar.