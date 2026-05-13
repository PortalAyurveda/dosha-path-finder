## Objetivo
Deixar apenas o login via **magic link** ativo na página `/auth`, escondendo Google e Facebook (que ainda não estão configurados).

## Mudança (1 arquivo)

### `src/pages/Auth.tsx`
Remover do JSX (linhas ~149-186):
- O divisor "ou"
- O bloco de OAuth buttons (Google e Facebook)

Manter intactos:
- Formulário de magic link (`signInWithOtp`)
- Função `handleOAuth` no código (apenas não chamada) — **ou** removê-la junto. Proponho **remover** `handleOAuth` também, já que fica como código morto, mas é trivial reativar no futuro recolocando o bloco.

## O que NÃO muda
- Backend / Supabase Auth providers (Google permanece desabilitado lá; nada a fazer).
- Fluxo de magic link e redirecionamentos.
- Outras páginas/componentes.

## Reativação futura
Para ligar Google de volta, basta reinserir o bloco OAuth + handler (Git history preserva). Eu também posso deixar o bloco comentado em vez de removido — me avise se preferir essa opção.