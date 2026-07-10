## Varredura por auto-mensagem da Akasha

Rodei uma busca ampla em `src/` e `supabase/` pelos padrões pedidos: `"Acabei de chegar"`, `"vim conhecer você"`, `"Vamos conversar"`, `"Vi que seu dosha agravado"`, `sendInitialMessage`, `__INICIO` e qualquer `fetch` para `/webhook/chat-ayurveda`.

### Ocorrências encontradas

**1. Fluxo do reteste (fora do escopo — mantém)**
- `src/components/reteste/RetesteChat.tsx:63` — `const sendInitialMessage = useCallback(...)`
- `src/components/reteste/RetesteChat.tsx:72` — payload `message: "__INICIO_RETESTE__"`
- `src/components/reteste/RetesteChat.tsx:99` — `sendInitialMessage()` no mount
- `src/components/reteste/RetesteChat.tsx:101` — dependências do effect

Você pediu explicitamente para **não tocar no RetesteChat**. Ele usa outro webhook (`/webhook/reteste-dosha`), não `chat-ayurveda`. Fica como está.

**2. Chat Akasha (FloatingAkasha e AkashaTab)**
- `src/components/akasha/FloatingAkasha.tsx:136` — `fetch(WEBHOOK_URL, ...)` dentro de `useQuery`
- `src/components/meudosha/AkashaTab.tsx:112` — `fetch(WEBHOOK_URL, ...)` dentro de `useQuery`

Ambos os `fetch` disparam apenas com `body: { action: "get_history", session_id }` — é **leitura de histórico**, não envia mensagem de usuário nem cria turno novo no agente. Não há mais nenhum `sendInitialMessage`, nenhuma bolha automática, nenhum `__INICIO*` e nenhum texto tipo "Acabei de chegar" / "vim conhecer você" / "Vi que seu dosha agravado" em nenhum lugar do projeto.

### Conclusão

**Está limpo.** O auto-trigger da Akasha (chat-ayurveda) já foi removido em passes anteriores — não sobrou nada para apagar. A Akasha só fala depois que o usuário mandar a 1ª mensagem via `sendMessage`. O único disparo automático que ainda existe é o do RetesteChat, que você mandou preservar.

### Ação proposta

Nenhuma alteração de código. Se você quiser, posso ainda assim:
- (opcional) Renomear/comentar os `useQuery` de `get_history` para deixar explícito no código que são "read-only, não geram turno".

Confirma que não precisa mexer em nada?
