# Eventos Meta Pixel

Adicionar helper seguro e disparar 5 eventos nos pontos pedidos. Todos os disparos checam `window.fbq` antes de chamar.

## 1. Helper compartilhado

Criar `src/lib/metaPixel.ts`:

```ts
export const trackPixel = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    (window as any).fbq("track", event, params);
  }
};
```

Adicionar tipagem global em `src/vite-env.d.ts` (ou arquivo novo `src/types/fbq.d.ts`):
```ts
declare global {
  interface Window { fbq?: (...args: any[]) => void; }
}
```

## 2. Pontos de disparo

| # | Evento | Local | Gatilho |
|---|---|---|---|
| 1 | `CompleteRegistration` `{ content_name: 'Teste de Dosha' }` | `src/pages/MeuDosha.tsx` | `useEffect` quando os resultados do teste estiverem carregados (uma vez por carregamento) |
| 2 | `ViewContent` `{ content_name: 'Pagina Assinar' }` | `src/pages/Assinar.tsx` | `useEffect` de montagem |
| 3 | `InitiateCheckout` `{ content_type: 'product' }` | `src/components/loja/CartDrawer.tsx` | onClick do botão "Finalizar compra" (antes do redirect Stripe) |
| 4 | `InitiateCheckout` `{ content_type: 'subscription' }` | `src/pages/Assinar.tsx` | dentro de `handleAssinar`, antes de invocar a edge function |
| 5 | `Purchase` `{ currency: 'BRL', content_type: 'product' }` | `src/pages/SamkhyaObrigado.tsx` | `useEffect` de montagem (junto com `limparCarrinho`) |

## 3. Detalhes técnicos

- Em `MeuDosha.tsx` preciso identificar a flag/estado que indica "resultados carregados" (provavelmente após o fetch do dosha do usuário) — disparar com `useEffect` dependente desse estado e um `ref` booleano para evitar duplicar caso re-renderize.
- Em `Assinar.tsx`, o `ViewContent` é no mount; o `InitiateCheckout` é dentro do handler antes do `supabase.functions.invoke` (assim dispara mesmo se o invoke falhar — alinhado ao comportamento padrão de InitiateCheckout).
- Em `CartDrawer.tsx`, disparar imediatamente no clique de "Finalizar compra", antes da chamada que cria a sessão de checkout.
- Nenhuma mudança de lógica de negócio, apenas instrumentação.

## 4. Fora de escopo

- Não adicionar valores monetários (`value`/`num_items`) — o pedido só especifica os campos listados.
- Não tocar em GA4 nem em outros eventos.
