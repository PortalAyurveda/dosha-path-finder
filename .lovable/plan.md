## Objetivo
Adicionar timeout de 60 segundos via AbortController na função `callWebhook` de `src/pages/Revisao.tsx`, mas **apenas quando `body.action === "calcular"`**.

## Alteração
1. Dentro de `callWebhook`, detectar se o payload tem `action: "calcular"`.
2. Se sim, criar um `AbortController` e um `setTimeout(() => controller.abort(), 60000)`.
3. Passar `signal: controller.signal` para o `fetch`.
4. Em caso de sucesso, chamar `clearTimeout(timeout)` antes de processar a resposta.
5. No `catch`:
   - Sempre chamar `clearTimeout(timeout)`.
   - Se `e.name === 'AbortError'`: aguardar 2 segundos (`await new Promise(r => setTimeout(r, 2000))`) e então chamar `await loadAll(user.email!)` para buscar o resultado do banco (assumindo que o n8n completou em background). **Não relançar o erro** — o fluxo segue como sucesso.
   - Para outros erros, relançar normalmente (`throw e`).
6. Para actions diferentes de `"calcular"`, manter o comportamento atual sem timeout.

## Nota técnica
A função `callWebhook` já está definida dentro do componente `Revisao`, portanto tem acesso por closure a `user.email` e `loadAll`. Nenhuma assinatura externa precisa mudar.

## Arquivo alterado
- `src/pages/Revisao.tsx` (função `callWebhook`, linhas ~216–226)