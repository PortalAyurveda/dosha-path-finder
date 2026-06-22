# Área de Compras — Loja Samkhya

Consome as edge functions já prontas (`buscar-pedido` e `meus-pedidos`). Sem mudanças no banco. Tudo no tema Samkhya (roxo `#7b4963`, ouro `#C8922A`, fundo `#FAF8F5`, serif Georgia em títulos).

## 1. Componente compartilhado: Timeline de status

`src/components/samkhya/pedido/StatusTimeline.tsx`
- 5 etapas fixas: Pedido recebido / Aguardando pagamento / Preparando envio / A caminho / Entregue.
- Props: `etapa: number` (-1 a 4), `metodo_pagamento` (oculta "Aguardando pagamento" se card/pix já pago — etapas concluídas em roxo + check, atuais em ouro pulsante, futuras em cinza).
- Layout horizontal em `md+`, vertical no mobile.
- Estado cancelado (-1): banner vermelho discreto substituindo a timeline.

Helper `src/components/samkhya/pedido/statusBadge.tsx` → mapa etapa → `{label, bg, text}` para badges reutilizáveis (Entregue verde, A caminho azul, Preparando roxo, Aguardando âmbar, Cancelado cinza/vermelho).

## 2. Página de detalhe pública: `/samkhya/pedido/:session_id`

Nova rota em `src/App.tsx` (sem `AuthGuard`), arquivo `src/pages/SamkhyaPedido.tsx`.

- `useEffect` → `supabase.functions.invoke('buscar-pedido', { body: { session_id } })`.
- Estados: loading (skeletons), 404 ("Pedido não encontrado" + link voltar à loja), sucesso.
- Layout dentro de `SamkhyaLayout`:
  1. **Header**: `Pedido SAM-XXXX` (serif), badge de status grande, data, email mascarado em texto pequeno.
  2. **StatusTimeline**.
  3. **Bloco de ações** (condicional, cards lado a lado):
     - `boleto_url` → botão primário "Pagar boleto" (abre em nova aba).
     - `rastreio_url` → "Rastrear envio" + código copiável.
     - `nfe_url` → "Baixar nota fiscal" + `nfe_numero`.
     - `status_descricao` como texto auxiliar quando nenhuma ação aplicável.
  4. **Itens**: lista com imagem (se disponível), nome, quantidade × preço.
  5. **Resumo**: subtotal, frete (`frete_servico`), total.
  6. **Endereço de entrega**: card com `endereco_entrega` formatado.

SEO: `<Helmet>` com `noindex`.

## 3. Página logada: `/samkhya/compras`

`src/pages/SamkhyaCompras.tsx`, rota nova.

- Se não logado (via `useUser`): mostra CTA "Entre para ver suas compras" → `/auth?redirect=/samkhya/compras`.
- Logado: invoca `meus-pedidos`, renderiza lista de cards.
- Card: número, data (`created_at`), `qtd_itens`, total (R$), `StatusBadge`, mini-timeline (5 pontinhos coloridos por etapa), ícone NF se `tem_nfe`.
- Clique no card → `/samkhya/pedido/{session_id}`.
- Vazio: ilustração simples + "Você ainda não tem compras" + botão "Ir às compras" → `/samkhya`.
- Loading: 3 skeletons.

## 4. Item no menu

Editar `src/components/samkhya/SamkhyaNavBar.tsx`:
- Importar `useUser`.
- Quando `user` existir, adicionar link "Minhas compras" (ícone `Package` do lucide) apontando para `/samkhya/compras`, próximo ao ícone do carrinho.

## 5. Atualizar `/samkhya/obrigado`

Editar `src/pages/SamkhyaObrigado.tsx`:
- Ler `session_id` da query string.
- Se presente, adicionar botão secundário "Acompanhar meu pedido" → `/samkhya/pedido/{session_id}` (acima do botão "Voltar à loja").

## 6. Roteamento

Em `src/App.tsx`, adicionar:
```tsx
<Route path="/samkhya/pedido/:session_id" element={<SamkhyaPedido />} />
<Route path="/samkhya/compras" element={<SamkhyaCompras />} />
```

## Arquivos criados
- `src/pages/SamkhyaPedido.tsx`
- `src/pages/SamkhyaCompras.tsx`
- `src/components/samkhya/pedido/StatusTimeline.tsx`
- `src/components/samkhya/pedido/statusBadge.tsx`
- `src/components/samkhya/pedido/PedidoCard.tsx` (card da lista)

## Arquivos editados
- `src/App.tsx` (2 rotas)
- `src/components/samkhya/SamkhyaNavBar.tsx` (link logado)
- `src/pages/SamkhyaObrigado.tsx` (botão acompanhar)

## Fora do escopo
- Nada no banco, nada em edge functions (já prontas).
- Sem alterar tokens/Layout do portal.
