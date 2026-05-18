## Diagnóstico: login com Google quebrado

São **dois problemas separados** — um de código (spinner) e outro de configuração (erro 400).

### 1. Spinner aparece no botão errado (bug visual)
`src/pages/Auth.tsx` usa um único `loading` compartilhado entre o botão "Entrar com Google" e o botão "Enviar código". Quando você clica em "Google", o `setLoading(true)` ativa a animação dos dois botões, dando a impressão de que o OTP também foi disparado.

**Correção (frontend):** criar um estado dedicado `googleLoading` para `handleGoogleLogin`, e usar `loading` apenas para os submits de e-mail/OTP. Cada botão fica `disabled` / com spinner pelo seu próprio estado.

Importante: o `signInWithOtp` **não** é chamado quando você clica em "Google" — confirmei no código (linhas 51–67 chamam apenas `signInWithOAuth`). O envio do magic link/OTP só dispara em `handleSendCode`. Então não é o OTP rodando junto — é só o spinner mal escopado.

### 2. `Erro 400: redirect_uri_mismatch` — **NÃO é bug de código**
Esse erro vem do Google, não do Supabase nem da nossa aplicação. Causa raiz:

- Hoje você ativou o domínio customizado `https://api.portalayurveda.com` no lugar de `https://fwezkasjfguarjmjxifh.supabase.co`.
- Quando o Supabase redireciona o usuário pro Google, ele envia como `redirect_uri` o callback do **seu domínio Supabase atual** (ou seja, `https://api.portalayurveda.com/auth/v1/callback`).
- No Google Cloud Console, o OAuth Client provavelmente só tem registrado o callback antigo (`https://fwezkasjfguarjmjxifh.supabase.co/auth/v1/callback`).
- Google compara as duas URIs, vê que são diferentes → bloqueia com 400.

A remoção do magic link / mudança pra OTP **não** afetou isso. O que afetou foi a troca do domínio Supabase.

**Correção (você, no Google Cloud Console — eu não consigo fazer):**

1. Acessar [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Abrir o OAuth 2.0 Client ID usado pelo Supabase Auth.
3. Em **Authorized redirect URIs**, adicionar:
   ```
   https://api.portalayurveda.com/auth/v1/callback
   ```
   Manter também o antigo (`https://fwezkasjfguarjmjxifh.supabase.co/auth/v1/callback`) durante a transição, por segurança.
4. Em **Authorized JavaScript origins**, garantir que estão listados:
   ```
   https://portalayurveda.com
   https://www.portalayurveda.com
   https://portalayurveda.lovable.app
   ```
5. Salvar. Mudanças podem levar alguns minutos para propagar.

**Verificar no Supabase também:**
- [Authentication → URL Configuration](https://supabase.com/dashboard/project/fwezkasjfguarjmjxifh/auth/url-configuration): `Site URL` = `https://portalayurveda.com`; adicionar nos **Redirect URLs** as variações que o app usa (`https://portalayurveda.com/**`, `https://www.portalayurveda.com/**`, `https://portalayurveda.lovable.app/**`).
- [Authentication → Providers → Google](https://supabase.com/dashboard/project/fwezkasjfguarjmjxifh/auth/providers): conferir o Client ID/Secret. O texto da página mostra qual é o **Callback URL (for OAuth)** que o Supabase está usando agora — é exatamente essa URL que precisa estar no Google Cloud.

### O que eu vou fazer ao aprovar o plano
- Apenas o fix do spinner no `src/pages/Auth.tsx` (separar `googleLoading` de `loading`).
- O resto (Google Cloud + Supabase URL Configuration) precisa ser feito por você no painel, porque é configuração de provider externa ao código.
