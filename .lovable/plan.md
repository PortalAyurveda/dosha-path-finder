# Corrigir perda de destino no login e loop no app do Instagram

## Problema

1. Quem clica em "assinar" sem estar logado vai para `/entrar?redirect=/assinar`, mas o link enviado por e-mail (magic link) não carrega esse `redirect`. Ao voltar do e-mail, a pessoa cai em `/meu-dosha` ou na home — e perde o que ia fazer.
2. Dentro do navegador embutido do Instagram/Facebook, o link do e-mail abre em outro app. A sessão criada lá não é enxergada pela aba do Instagram, e a pessoa fica num ciclo de tentativas.

## O que muda

### 1. Preservar o destino no link do e-mail
Na montagem do `emailRedirectTo` (fluxo magic link em `src/pages/Auth.tsx`), passar também o `redirect` presente na URL atual, além do `claim`:

- com claim: `/entrar?claim=<id>&redirect=<destino codificado>`
- só destino: `/entrar?redirect=<destino codificado>`
- nenhum dos dois: `/entrar?src=m` (como hoje)

O `useEffect` que já lê `redirect` após o login continua igual — ele passa a receber o valor porque a URL do e-mail agora o carrega.

Também guardar o `redirect` em `localStorage` como rede de segurança, e usá-lo no redirecionamento pós-login caso a URL não traga o parâmetro (limpando após o uso, e só aceitando caminhos internos que comecem com `/` e não com `//`).

### 2. Aviso claro para navegador embutido
Criar um helper único de detecção (`src/lib/inAppBrowser.ts`) com o mesmo teste de user agent usado hoje para marcar `in_app` em `login_eventos` (Instagram, FBAN/FBAV/FB_IAB do Facebook), e usá-lo em `Auth.tsx` no lugar da checagem atual de `Instagram` solta.

Quando detectado, exibir no topo da tela de login, antes do formulário, um aviso destacado (não a dica discreta atual):

> Você está navegando pelo app do Instagram. Para fazer login, toque nos três pontinhos (⋮) no canto e escolha "Abrir no navegador" (Safari ou Chrome) — assim o login funciona certinho.

Com um botão para copiar o endereço atual da página (com o `redirect` preservado), facilitando colar no navegador externo. O fluxo de envio por e-mail continua disponível abaixo — o aviso não bloqueia nada.

## Detalhes técnicos

- Arquivos: `src/pages/Auth.tsx` (novo cálculo de `emailRedirectTo` em `sendOtp`, fallback de redirect no efeito de pós-login, bloco de aviso in-app) e novo `src/lib/inAppBrowser.ts`.
- Sem mudanças de banco, edge function ou de qualquer outro fluxo (OTP, Google, claim continuam iguais).
- A regra atual "Instagram + e-mail não-Microsoft usa magic link" permanece intacta.

## Observação

A detecção server-side de `in_app` vive na edge function `preparar-login`, que não está versionada neste repositório; o helper do front replica o mesmo teste de user agent (Instagram/Facebook in-app). Se você quiser que a detecção venha do servidor, dá para trocar depois sem mexer no resto.
