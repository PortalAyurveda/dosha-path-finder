## O que está acontecendo hoje

A Akasha (webchat) tem uma **mensagem automática de boas-vindas** que aparece sozinha assim que o chat abre pela 1ª vez, sem o usuário ter digitado nada. O texto é:

> "Olá, {nome}! Vi que seu dosha agravado é {dosha}. Posso te indicar receitas, produtos e práticas do Portal — ou escreva Portal para ajuda com o site. Por onde começamos?"

Essa saudação está em **dois lugares** que renderizam a Akasha:

1. `src/components/akasha/FloatingAkasha.tsx` — o botão flutuante da Akasha (linhas ~187‑211: função `sendInitialMessage` + `useEffect` que a dispara quando `open` fica true e o histórico está vazio).
2. `src/components/meudosha/AkashaTab.tsx` — a aba Akasha dentro do "Meu Dosha" (linhas ~152‑173: `sendInitialMessage` disparado no `useEffect` de hidratação quando não há histórico).

Observação importante: essas duas mensagens são **locais** (só exibem texto na tela, não chamam o webhook n8n nem gravam nada no Supabase — comentários no código confirmam isso). Então o webhook n8n *não* está sendo disparado por elas hoje. O que a gente vai remover é a exibição automática da bolha de boas-vindas — a Akasha só vai falar depois que o usuário mandar a primeira mensagem.

Não vou mexer no `RetesteChat.tsx` (página de reteste), que é fluxo diferente e realmente dispara um webhook `__INICIO_RETESTE__` — o pedido é sobre a Akasha (webchat).

## Mudanças

### 1) `src/components/akasha/FloatingAkasha.tsx`
- Remover a função `sendInitialMessage` (linhas ~187‑200).
- Remover o `useEffect` que a chama (linhas ~202‑211).
- Manter `initialSentRef` só se ainda for usado em outros pontos; se ficar órfão, remover também.

### 2) `src/components/meudosha/AkashaTab.tsx`
- Remover a função `sendInitialMessage` (linhas ~165‑173).
- No `useEffect` de hidratação (linhas ~152‑163), remover o branch `else if (!initialSent) { setInitialSent(true); sendInitialMessage(); }`, deixando apenas a hidratação a partir do `cachedHistory`.
- Remover `initialSent` / `setInitialSent` se ficarem sem uso.

## Resultado esperado

- Abrir a Akasha (flutuante ou aba) com histórico vazio → **nenhuma bolha aparece**, o chat fica em branco esperando o usuário digitar.
- Se já existe histórico salvo, ele continua sendo carregado normalmente.
- Quando o usuário digita a 1ª mensagem, o fluxo normal (`sendMessage` → webhook `chat-ayurveda`) roda como antes.
- Nenhuma alteração no backend, no n8n, ou no fluxo do Reteste.