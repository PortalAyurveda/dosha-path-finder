# Auto-abertura universal do FloatingAkasha

## Objetivo
O chat flutuante da Akasha abre sozinho **uma única vez por navegador**, 30 segundos depois que o visitante entrar em qualquer página do site — **logado ou não, com ou sem teste de dosha feito**. Se estiver na página `/teste-de-dosha`, nunca auto-abre (não atrapalhar quem está respondendo o teste). Se a pessoa concluir o teste e cair em `/meu-dosha`, o timer dessa página também conta normalmente.

Se o usuário limpar cache/localStorage, pode abrir de novo numa próxima visita — tudo bem.

## Mudanças em `src/components/akasha/FloatingAkasha.tsx`

### 1. Gating de rotas
- Manter `HIDDEN_PREFIXES` atual (widget continua oculto em `/akasha`, `/teste-de-dosha`, `/assinar`, `/auth` e em qualquer rota com `/obrigado`). Ou seja, durante o teste de dosha o widget nem aparece — então não tem como auto-abrir lá.
- Em todas as outras rotas o widget aparece e pode auto-abrir.

### 2. Auto-abertura única (qualquer visitante)
Substituir a lógica atual que exigia `user` logado + `idPublico`. Nova regra:

- Chave única global no `localStorage`: **`akasha_auto_opened`** (sem sufixo de email — vale pro navegador inteiro, anônimo ou logado).
- Condições para agendar o timer de 30s:
  - `!shouldHide` (não está em rota oculta como `/teste-de-dosha`)
  - widget atualmente fechado
  - `localStorage.getItem("akasha_auto_opened")` é `null`
- Esperar `document.readyState === "complete"` (ou `window.load`) e então iniciar o `setTimeout` de 30s.
- Ao disparar: `localStorage.setItem("akasha_auto_opened", "1")` **antes** de `setOpen(true)`, garantindo que mesmo se o usuário navegar entre páginas durante os 30s, só abre uma vez.
- Cleanup do timer no unmount / mudança de rota.
- O timer **reinicia a contagem** se o usuário trocar de rota antes dos 30s — mas como a chave só é gravada na hora de abrir, qualquer rota válida que ele permaneça por 30s aciona a abertura única.

### 3. Say-hello na primeira abertura
- Mantém o comportamento atual: só dispara `sendInitialMessage` se houver `user` + `doshaResult.idPublico` + histórico vazio.
- Para visitante anônimo (ou logado sem teste), o chat abre vazio com a tela de boas-vindas já existente (`"Olá! Sou a Akasha"` + placeholder do input). Não envia nada pro n8n até o usuário digitar.

## Fora de escopo
- `AkashaTab` em `/meu-dosha` continua intacto.
- Sem alteração no payload do webhook nem no fluxo n8n.
- Sem mudança visual no widget ou no botão flutuante.

## Verificação manual
1. Visitante anônimo entra no `/` (home) → após 30s o chat abre sozinho, vazio, sem disparar webhook.
2. Mesmo visitante navega para `/blog/algum-artigo` → não reabre (chave já existe).
3. Visitante entra direto em `/teste-de-dosha` → widget nem aparece, nada auto-abre. Conclui o teste, é redirecionado para `/meu-dosha?id=XXX` → 30s depois, chat abre; se ele estiver logado e com teste, say-hello dispara.
4. Usuário limpa localStorage → próxima visita auto-abre de novo (esperado).
