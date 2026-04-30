
## Escopo

Redesenhar a aba **Perfil** da página `/meu-dosha`. Header, hero, abas, gráfico donut, tabela de faixas e card do Agni permanecem intactos.

## Arquivos afetados

- `src/pages/MeuDosha.tsx` — remover blocos
- `src/components/meudosha/DiagnosticoCompleto.tsx` — reescrever quase todo
- `src/integrations/supabase/premium-client.ts` — adicionar `narrativa_clinica` ao tipo

---

## 1. Remoções em `MeuDosha.tsx`

- Remover renderização do componente `DoshaLevelBullets` (3 cards "Vata — Fixado / Estado grave...") — linha 712-714
- Remover bloco `hasAgrav` inteiro (Agravamentos Detectados com pills) — linhas 715-751
- Manter intacto: header, hero, tabs, donut + Quadro Clínico (lado a lado), card Agni

## 2. Confirmação de dados (já verificado)

- `premium.objetivos_tratamento.narrativa_clinica` existe (jsonb) — campos esperados: `bloco_1_situacao`, `bloco_2_causas`, `bloco_3_sabores`, `bloco_4_proximos`
- `public.portal_glossario` tem: `doshanome`, `resumo_curto`, `oque`, `alimentosEvitar`, `alimentosPriorizar`, `rotinasEquilibrar`, `dicasGeraisFazer`
- `doshanome` usa o mesmo formato de `doshas_registros.doshaprincipal` (ex: "Vata", "Vata-Pitta") — match direto

## 3. Reescrita de `DiagnosticoCompleto.tsx`

### Props
Adicionar `doshaPrincipalCompleto` (string completa, ex: "Vata-Kapha") além do `doshaPrincipal` (primeiro dosha).

### Novo hook `useGlossario(doshaPrincipalCompleto)`
Query em `portal_glossario` filtrando por `doshanome` igual à string completa. Cache 30min.

### Polling da narrativa
Se `analise.narrativa_clinica === null`, refetch a cada 3s por até 60s (reaproveitar o polling existente, mas considerar narrativa_clinica como condição de "pronto").

### SEÇÃO 1 — Diagnóstico (substitui o atual `QuadroClinico`)

**Título centralizado**: "Seu Diagnóstico: {doshaPrincipalCompleto}" (Roboto Serif bold, #352F54, pt-12)

**Layout**:
- Desktop: `grid-cols-1 md:grid-cols-2 gap-6`
- Mobile: coluna direita (Akasha/pessoal) primeiro via `order-first md:order-none` na coluna direita e `order-last md:order-none` na esquerda

**4 blocos × 2 colunas = 8 cards**:

Coluna esquerda (educacional, glossário):
1. "Sobre {doshaPrincipal} agravado" + `resumo_curto` + hr + primeiros 400 chars de `oque`
2. "O que agrava {doshaPrincipal}" + 350 chars de `alimentosEvitar`
3. "Alimentos que ajudam" + 350 chars de `alimentosPriorizar`
4. "Rotinas que equilibram" + 350 chars de `rotinasEquilibrar`

Estilo: bg `#FFF8EE`, border `1px solid #EDE4D3`, Forma de Folha; label em DM Sans 12px uppercase #C8922A.

Coluna direita (pessoal, narrativa LLM):
1. "Sua situação atual" + `narrativa_clinica.bloco_1_situacao`
2. "O que te trouxe aqui" + `narrativa_clinica.bloco_2_causas`
3. "Por que esses sabores pra você" + `narrativa_clinica.bloco_3_sabores`
4. "Seus próximos 30 dias" + `narrativa_clinica.bloco_4_proximos`

Estilo: bg branco, `border-left: 4px solid corDosha` + border `1px solid #EDE4D3`, Forma de Folha; label uppercase com a cor do dosha.

**Função `corDosha`**: Vata→#6B8AFF, Pitta→#FF7676, Kapha→#9ED88B (usa o primeiro dosha do par). Default #352F54.

**Placeholder Akasha** (nos 4 cards da direita quando `narrativa_clinica` for null):
- Logo Akasha (mesma URL usada no tab) 48px centralizado
- Texto "Akasha está lendo seu resultado..." (DM Sans medium #352F54)
- Spinner pequeno com `borderColor` da cor do dosha
- Fade-in 400ms quando narrativa chega (transition `opacity`)

### SEÇÃO 2 — Protocolo Samkhya (mantém atual)

Reutilizar `ProtocoloSamkhya` existente. Já está alinhado com o brief (badges, preços, link para `/samkhya/{basePath}/{slug}`).

Pequeno ajuste: badges devem usar labels exatos do brief — "PRINCIPAL" / "COMPLEMENTAR" / "SUPORTE". Atualizar `BADGE_TIPO`.

### SEÇÃO 3 — Plano 30 Dias 🔒 (substituir o atual)

Substituir o `Plano30Dias` (que renderiza o accordion de semanas) por um **card único bloqueado**:
- bg `#FFF8EE`, Forma de Folha, padding 40px, conteúdo centralizado
- Ícone 🔒 grande
- "Este plano personalizado é exclusivo para assinantes do Portal"
- "Acompanhamento e atualização do plano mensalmente com Akasha"
- Botão "Desbloquear por R$ 97 →" → link para `/curso/rotinas` (ou URL externa do curso de rotinas)

Remover toda a query de `plano_30_dias`, polling de plano, normalizarDicas, SemanaAccordion, CATEGORIA_META, DIFICULDADE_COR — não precisamos mais.

### SEÇÃO 4 — Próximos Passos (mantém)

Já está alinhado com o brief. Apenas confirmar que o botão "Refazer Teste" continua existindo no rodapé.

---

## 4. Atualização do tipo `ObjetivoTratamento`

Em `premium-client.ts`, adicionar:
```typescript
narrativa_clinica: {
  bloco_1_situacao?: string;
  bloco_2_causas?: string;
  bloco_3_sabores?: string;
  bloco_4_proximos?: string;
} | null;
```

## 5. Detalhes técnicos

- `lojaSupabase` continua sendo usado para produtos (já correto)
- Truncar texto do glossário: `text.slice(0, N).trim() + (text.length > N ? '…' : '')` após stripHtml básico
- Polling combinado: análise + narrativa. Se análise existe mas narrativa não, continua polling até narrativa aparecer (limite 60s/20 ticks)
- Mobile order: usar `flex flex-col md:grid md:grid-cols-2` com a coluna direita renderizada primeiro no JSX e `md:order-2` no desktop para reposicioná-la à direita

## Sem mudanças de banco

Tudo já existe. Sem migração necessária.
