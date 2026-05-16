## Substituir Magic Link por OTP de 6 dígitos em `/entrar`

Refatorar `src/pages/Auth.tsx` para usar código OTP em duas etapas, mantendo o login Google intacto.

### Etapa 1 — Email
- Campo email + botão "Enviar código"
- Chama `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })` (sem `emailRedirectTo`, pois OTP não usa redirect)
- Em sucesso, avança para etapa 2 (state `step: "email" | "code"`)
- Toast de erro em falha

### Etapa 2 — Código
- Texto: "Digite o código de 6 dígitos enviado para **{email}**"
- Input OTP de 6 dígitos usando o componente `InputOTP` já existente em `src/components/ui/input-otp.tsx` (6 slots, apenas números via `pattern`)
- Botão "Entrar" (desabilitado até 6 dígitos preenchidos)
- Link "Reenviar código" → re-chama `signInWithOtp` e mostra toast "Código reenviado"
- Link "Voltar" → volta para etapa 1, limpa código
- Ao confirmar: `supabase.auth.verifyOtp({ email, token: code, type: 'email' })`
- Em sucesso, o `useEffect` existente cuida do redirect para `/meu-dosha?id=...`
- Em erro: toast "Código inválido ou expirado" e mantém na etapa 2

### Manter intacto
- Botão Google login e separador "ou"
- Lógica de `waitingForDosha` / redirect pós-login
- `pendingClaimIdPublico` via searchParams
- Header, card, copy de privacidade

### Notas técnicas
- Remover state `magicSent` e bloco "Link enviado!"
- Novo state: `step`, `code`, `resending`
- Avisar usuário: no painel Supabase Auth, o template "Magic Link" deve conter `{{ .Token }}` para que o código de 6 dígitos seja enviado no email (Supabase envia ambos no mesmo template). Sem isso, o usuário recebe apenas o link e não o código.
