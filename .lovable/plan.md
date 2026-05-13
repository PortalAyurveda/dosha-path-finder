## Objetivo
Adicionar seleção em massa de pedidos pagos em `/admin/loja/vendas` e integrar com a Edge Function `enviar-melhorenvio` para gerar etiquetas em lote.

## Mudanças

### 1. `src/pages/AdminLojaVendas.tsx`
- Novo estado `selecionados: Set<string>` com IDs dos pedidos marcados.
- Novo estado `enviando: boolean` para feedback do botão.
- Adicionar coluna de checkbox na tabela (`<TableHead>` vazio + `<TableCell>` com `<Checkbox>`):
  - Renderiza `<Checkbox>` (de `@/components/ui/checkbox`) **apenas** quando `p.status === 'pago'`.
  - Linhas com outros status mostram célula vazia (mantém alinhamento).
  - Checkbox no header faz "selecionar todos os pagos visíveis" (filtrados).
- Barra de ações condicional acima da tabela (`selecionados.size > 0`):
  - Texto: `{selecionados.size} pedido(s) selecionado(s)`.
  - Botão "Limpar seleção" (ghost) e botão "Enviar para MelhorEnvio" (primário, com `Loader2` quando `enviando`).
- Handler `enviarMelhorEnvio()`:
  1. `setEnviando(true)`.
  2. `supabase.functions.invoke('enviar-melhorenvio', { body: { pedido_ids: Array.from(selecionados) } })`.
  3. Se erro → `toast.error(...)`.
  4. Se sucesso:
     - Se `data.print_url` → `window.open(data.print_url, '_blank')`.
     - Contar sucessos a partir de `data.resultados` (ex.: filtrar `r.ok` ou `r.status === 'ok'` — usar fallback `data.resultados?.length`).
     - `toast.success("X pedido(s) enviados com sucesso")`.
     - Limpar `selecionados`.
     - Recarregar pedidos (extrair o fetch atual do `useEffect` para uma função `carregarPedidos()` reutilizável).
  5. `setEnviando(false)` em `finally`.

### Detalhes técnicos
- Importar: `Checkbox` de `@/components/ui/checkbox`, `toast` de `sonner`, `supabase` de `@/integrations/supabase/client` (Edge Functions usam o client `public`, não `lojaSupabase`).
- A barra de ações usa tokens semânticos (`bg-muted`, `border`, `rounded-lg`), sem cores hardcoded.
- Nada muda no backend nem em outros arquivos — a Edge Function `enviar-melhorenvio` já existe (secret `MELHORENVIO_TOKEN` está configurado).

## Fora de escopo
- Alterações na Edge Function `enviar-melhorenvio`.
- Mudanças na página de detalhe do pedido.
- Atualização automática do status do pedido após envio (a própria function deve cuidar disso; só recarregamos a lista).