## Diagnóstico

Revisei todo o código de autenticação. **Só existe um ponto de login por email** no projeto:

- `src/pages/Auth.tsx`
  - `signInWithOtp({ email, options: { shouldCreateUser: true } })` — envia o código
  - `verifyOtp({ email, token: code, type: "email" })` — valida o código de 6 dígitos via `InputOTP`
  - Não é passado `emailRedirectTo`, não há chamada de magic link, não há fallback.

O Google OAuth (`signInWithOAuth`) é um método separado (botão "Login com Google"), não é magic link — vou manter, a menos que você queira remover também.

## Por que ainda aparece magic link

O código já está 100% OTP. A "alternância" vem do **template de email padrão do Supabase**, que inclui no mesmo email tanto o link mágico (`{{ .ConfirmationURL }}`) quanto o código (`{{ .Token }}`). Quando o usuário clica no link em vez de digitar o código, ele entra pelo fluxo magic link.

Isso é controlado no painel do Supabase, **não no código**.

## Plano

1. **Travar o cliente explicitamente como OTP-only** em `src/pages/Auth.tsx`:
   - Manter `signInWithOtp` e `verifyOtp` como estão.
   - Adicionar comentário deixando claro que esse fluxo é OTP-only e que nenhum `emailRedirectTo` deve ser adicionado (pois isso reativaria magic link).

2. **Ajustar o template de email no Supabase** (ação manual no dashboard, fora do código):
   - Authentication → Email Templates → **Magic Link**
   - Remover o bloco `<a href="{{ .ConfirmationURL }}">` e deixar apenas o `{{ .Token }}` em destaque.
   - Texto sugerido:
     ```
     Seu código de acesso ao Portal Ayurveda é:
     {{ .Token }}
     Ele expira em 1 hora.
     ```

3. **(Opcional, recomendado)** Scaffoldar templates de email customizados via Lovable, para que o template OTP-only fique versionado no repositório e não dependa do painel. Posso fazer isso se você quiser.

## O que NÃO vou mexer

- Google OAuth (não é magic link).
- Lógica de sessão, refresh token, `UserContext` — fora do escopo.

Me confirma se quer só o passo 1 + instruções do passo 2, ou se também quer o passo 3 (templates customizados versionados).