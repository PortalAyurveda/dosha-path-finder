# Auto-abertura única do FloatingAkasha + say-hello

## Objetivo

1. Em `/meu-dosha`, abrir o chat lateral automaticamente **uma única vez por usuário**, 30s após a página carregar — só se o usuário já tiver feito o teste de dosha.
2. Na primeira abertura, se o histórico estiver vazio, disparar o mesmo "say hello" (webhook n8n) que o `AkashaTab` já faz hoje.
3. Se o usuário fechar, nunca mais reabrir sozinho (persistência em localStorage).

## Mudanças

### `src/components/akasha/FloatingAkasha.tsx`

**1. Permitir aparecer em `/meu-dosha`**
- Remover `"/meu-dosha"` de `HIDDEN_PREFIXES`. Continua oculto em `/akasha`, `/teste-de-dosha`, `/assinar`, `/auth` e rotas com `/obrigado`.
- Resultado: o widget passa a conviver com a aba Akasha existente em `/meu-dosha` (compartilham `cacheKey = ["akasha-history", email]`, então histórico fica sincronizado).

**2. Auto-abertura única (apenas em `/meu-dosha`)**
- Nova chave localStorage: `akasha_auto_opened_${resolvedEmail}` (escopo por usuário; visitante anônimo nunca dispara).
- Condições para agendar o timer:
  - `location.pathname.startsWith("/meu-dosha")`
  - `user` logado **e** `doshaResult?.idPublico` presente (garante que o teste foi feito)
  - `localStorage` da chave acima **não existe**
  - widget atualmente fechado
- Esperar `document.readyState === "complete"` (ou usar `window.addEventListener("load")` quando ainda não estiver) antes de iniciar a contagem dos 30s — assim respeita o loading de imagens da página.
- Após 30s: `setOpen(true)` e gravar `localStorage.setItem(key, "1")`. Guardar o timer em `useRef` e limpar no cleanup.
- Não reagendar se o user fechar — a chave já foi gravada na abertura, então qualquer execução futura do effect cai no early-return.

**3. Say-hello na primeira abertura (replica AkashaTab)**
- Adicionar `sendInitialMessage()` espelhando exatamente o que existe em `src/components/meudosha/AkashaTab.tsx` (mesma string, mesmo payload: `message`, `email`, `contactId=idPublico`, `nome`, `dosha`, `scores {vata,pitta,kapha}` + também `imc`, `agni`, `nivelDeConhecimento` quando disponíveis via `doshaResult`).
- Gate em `useRef` `initialSentRef` para não duplicar.
- Disparar quando: `open === true` **E** `cachedHistory !== undefined` (query terminou) **E** `cachedHistory.length === 0` **E** `messages.length === 0` **E** `user` + `doshaResult` presentes **E** `initialSentRef.current === false`.
- Funciona tanto na auto-abertura quanto se o user abrir manualmente pela 1ª vez sem histórico.
- Mantém o comportamento atual de **não** consumir token na intro (igual ao AkashaTab).

## Fora de escopo
- Nenhuma alteração no `AkashaTab` de `/meu-dosha` nem no fluxo n8n.
- Nenhum reset/limpeza da chave de auto-abertura (é "uma vez para sempre" por email, como pedido).
- Visitante anônimo continua sem auto-abertura e sem say-hello.

## Verificação manual
1. User com teste pronto entra em `/meu-dosha?id=XXXX` → após 30s, chat abre sozinho; mensagem inicial é enviada se ainda não havia histórico.
2. Fecha o chat → recarrega a página → chat **não** reabre.
3. Em outras rotas (home, blog), o widget continua disponível pelo botão, sem auto-abrir.
4. User sem teste em `/meu-dosha` → nada auto-abre.
