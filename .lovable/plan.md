## Nova página: /minha-rotina (planner diário)

### Rota e gating
- Adicionar lazy import e `<Route path="/minha-rotina" element={<MinhaRotina />} />` em `src/App.tsx` (dentro do `<Layout>`, como as outras páginas autenticadas).
- Na página: usar `useUser()`. Enquanto `loading` → spinner. Se `!user` após carregar → `<Navigate to="/entrar" replace />`.

### Arquivo principal
`src/pages/MinhaRotina.tsx` — mobile-first, usando `PageContainer`, `Card`, `Button`, `Progress`, `Collapsible` já existentes. Cores e fontes via tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `primary`, etc.) — sem cor hardcoded.

### Data fetching (React Query)
Três queries em paralelo, todas dependentes de `user.id`:

1. **`["rotina-user", user.id]`** → `rotinas_usuario` filtrado por `user_id`. Retorna 56 linhas.
2. **`["rotina-nuggets-all"]`** → `rotina_nuggets` selecionando `id, titulo, icone_lucide, video_id, video_timestamp, vata, pitta, kapha, nugget_json`. Cache longo (compartilhado entre dias).
3. **`["rotina-favoritos", user.id]`** → `rotina_favoritos` por `user_id` → Set de `nugget_id`.

Indexar nuggets por id em um Map para join client-side.

### Layout

```text
┌─────────────────────────────────┐
│ Sua rotina                      │
│ Dia 1 da sua semana             │
│ [Badge: Praticante]             │
├─────────────────────────────────┤
│ [D1][D2][D3][D4][D5][D6][D7]    │ ← pills horizontais
├─────────────────────────────────┤
│ 3 de 8 feitos                   │
│ ███████░░░░░░░░░                │
├─────────────────────────────────┤
│ MANHÃ                           │
│  ┌ Card slot 1 ┐                │
│  ┌ Card slot 2 ┐                │
│  ┌ Card slot 3 ┐                │
│ TARDE                           │
│  ┌ Card slot 4..6 ┐             │
│ NOITE                           │
│  ┌ Card slot 7..8 ┐             │
└─────────────────────────────────┘
```

- Dia selecionado: `useState<number>(1)`. Pills: estado ativo com `bg-primary text-primary-foreground`, inativo `bg-muted`.
- Progresso: contar `feito` no dia selecionado / 8. Componente `Progress`.
- Badge "Praticante": chip fixo (hardcoded).

### Slots
Constante com a ordem e rótulos:
```
manha:   rotina_manha → "ritual da manhã"
         cafe_manha   → "café da manhã"
         lanche_manha → "lanche da manhã"
tarde:   almoco       → "almoço"
         lanche_tarde → "lanche da tarde"
         bonus_diario → "bônus do dia"
noite:   jantar       → "jantar"
         tonico_noite → "tônico da noite"
```

### Card (componente local `RotinaSlotCard`)

**Fechado:**
- Ícone Lucide dinâmico: `const Icon = (LucideIcons as any)[nome] ?? LucideIcons.Circle`. Import via `import * as LucideIcons from "lucide-react"`.
- Linha 1: label do slot (text-xs muted) + título do nugget (font-medium).
- Chama (`Flame`) ao lado do título se `nugget_json.bom_para_agni === true` E o agni do usuário (de `doshaResult` — verificar nome do campo; usar string match `/fraca|irregular/i`) for fraco/irregular.
- Botão estrela à direita: `Star` filled/outline. Toggle com mutation otimista em `rotina_favoritos` (insert/delete por `user_id` + `nugget_id`).
- Botão check à direita: círculo vazio → `CheckCircle2` verde quando `status === 'feito'`. Toggle via update em `rotinas_usuario` (matching por `user_id + dia + slot`), seta `status` para `'feito'` ou `null`.
- O card inteiro (exceto botões) é clicável para expandir (`Collapsible`).

**Aberto — Camada 1 "como fazer":**
- `nugget_json.resumo` (parágrafo).
- "Ingredientes" → `<ul>` com `{qtd} {item}`.
- "Modo de preparo" → `<ol>` numerada com `modo_preparo[]`.
- "Dicas" se truthy.
- "Efeito esperado" se truthy.
- Se `video_id`: botão "ver o prof. ensinar" (`Play` icon) que abre `VideoPlayerDialog` com `videoId` e `initialSeconds={video_timestamp}`. Estado de dialog local ao card.

**Aberto — Camada 2 "por que funciona":**
- `Collapsible` aninhado, fechado por padrão, trigger "por que funciona" + chevron.
- Sabores (rasa): `dravya_guna.rasa.join(", ")`.
- Linha agrupada: `Potência: {virya} · Qualidades: {gunas.join("/")} · Ações: {karma.join("/")} · Efeito nos tecidos: {efeito_tecidos}`.
- Efeito nos doshas: formatador que pega `vata/pitta/kapha` do nugget e formata com sinal (`+1`, `0`, `−1` usando minus unicode): `Vata −1 · Pitta 0 · Kapha +1`.

### Mutations (otimistas)
- `toggleFavorito(nuggetId)`: `setQueryData` no Set, depois insert/delete; em erro reverte e toast.
- `toggleFeito(dia, slot, nuggetId, currentStatus)`: `setQueryData` na lista de rotina, depois update; reverte em erro.

### SEO
`PageContainer` com title "Minha rotina" e description curta.

### Fora de escopo (não construir)
- Cálculo de nível.
- Sempre Faz Bem / suplementos.
- Paywall.
- Links de glossário.
- Lógica de data real para "Dia N" (mantém Dia 1 por padrão; a seleção via pills muda só a visualização).

### Arquivos tocados
- `src/App.tsx` — adicionar rota.
- `src/pages/MinhaRotina.tsx` — novo (página completa, card inline ou pequeno sub-componente no mesmo arquivo para manter coeso).
