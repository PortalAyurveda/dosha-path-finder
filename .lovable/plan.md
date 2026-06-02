## Objetivo

Refazer o layout das páginas `/aula/:slug` (Webinar.tsx) e `/aula/:slug/confirmado` (WebinarConfirmado.tsx) para baterem com as 3 imagens de referência, corrigindo o contraste (sem texto verde sobre fundo verde) e atualizando a foto da aula secreta.

## Princípios de contraste (regra nova do CMS)

- **Títulos e textos longos**: sempre na cor `darkColor` da paleta (no caso da `alimentacao-verde` é um navy escuro — perfeito sobre fundos claros).
- **Verde (`primaryColor`)**: usado só para acentos — data em destaque, botão CTA, fundo da "box importante", ícones.
- **Fundo da página**: verde bem claro (`primaryColor` com ~15% alpha) por fora do card, card branco por dentro.
- Nunca texto `primaryColor` sobre fundo `primaryColor`. Texto verde só sobre branco/creme.

## Página 1 — `Webinar.tsx` (landing)

Card branco arredondado (rounded-3xl, max-w-[560px]), borda fina verde, sombra suave, sobre fundo verde-claro.

```text
┌─────────────────────────────────────┐
│            ✉ ícone envelope         │
│                                     │
│   Um convite especial do Edson      │  ← serif italic navy
│              para você              │
│                                     │
│  Aula Secreta: A Lógica Oculta...   │  ← sans, navy
│  Pare de "chutar" o que comer...    │
│                                     │
│  D i a   0 6 / 0 5 / 2 0 2 6        │  ← serif italic, verde escuro, letter-spacing
│                                     │
│  Seu e-mail (para receber o link)   │
│  ┌─────────────────────────────┐    │  ← input fundo verde bem claro
│  └─────────────────────────────┘    │
│                                     │
│  Seu WhatsApp (com DDD)             │
│  ┌─────────────────────────────┐    │
│  └─────────────────────────────┘    │
│                                     │
│     ╭─────────────────────╮         │
│     │ CONFIRMAR PRESENÇA  │         │  ← pill verde, texto branco
│     ╰─────────────────────╯         │
│       Evento online e gratuito.     │  ← serif italic pequeno
│                                     │
│   [foto do professor à direita      │
│    no desktop, abaixo no mobile]    │
└─────────────────────────────────────┘
```

Mudanças concretas:
- Remover o "header verde" atual (faixa `primaryColor30` no topo) — fica tudo em card branco com ícone de envelope no topo, centralizado.
- Título virá fixo "Um convite especial do Edson para você" (ou usar `titulo_evento` do banco) em fonte serif italic, cor `darkColor`.
- Subtítulo + descrição em texto comum (sans, `darkColor` com 85% opacidade).
- Data formatada em estilo "espaçado" (`tracking-widest`), serif italic, cor verde escuro (`primaryColor` saturado), com pequeno espaço entre os dígitos.
- Labels dos inputs em sans pequeno, navy, sem uppercase.
- Inputs com fundo `primaryColor` a ~15% alpha e borda invisível (verde bem suave).
- Botão CTA: pill totalmente arredondado, fundo `primaryColor` sólido (verde do print), texto branco bold uppercase.
- Linha "Evento online e gratuito." abaixo do botão, serif italic, navy, pequena.
- Layout desktop: form à esquerda + foto à direita (já existe, manter).
- Atualizar `foto_url` da aula secreta no banco para a URL fornecida (`https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.webp`) — via migration UPDATE em `aulas_webinar` onde `slug = 'aula-secreta-alimentacao'`.

## Página 2 — `WebinarConfirmado.tsx`

Card branco igual ao da página 1, mesma paleta (não usar lavender; manter coerência com a landing — a imagem 3 era de outra paleta).

```text
┌─────────────────────────────────────┐
│         I n s c r i ç ã o           │  ← serif italic navy, tracking-widest
│         C o n f i r m a d a !       │
│                                     │
│              💻 ícone               │
│                                     │
│   Sua inscrição está confirmada!    │
│   A aula acontece dia 06/05...      │
│                                     │
│     ╭─────────────────────╮         │
│     │ ENTRE NO GRUPO AQUI!│         │  ← pill verde
│     ╰─────────────────────╯         │
│                                     │
│   Entre no grupo do WhatsApp e      │
│   aguarde o material e o link...    │
│                                     │
│              📖 ícone               │
└─────────────────────────────────────┘
```

Mudanças:
- Título "Inscrição Confirmada!" em serif italic com `tracking-widest` (efeito "I n s c r i ç ã o").
- Substituir o check verde grande por ícone temático (laptop/monitor — usar `Monitor` do lucide).
- Subtítulo e mensagem em navy, sans.
- Botão CTA WhatsApp: pill verde (mesma cor do botão da landing — `primaryColor`), texto navy bold uppercase "ENTRE NO GRUPO AQUI!". Não usar verde do WhatsApp (#25D366) — manter coerência com a paleta.
- Box de bullets removido do destaque: vira parágrafo simples abaixo do botão ("Entre no grupo... aguarde o material e o link da aula.") usando o `copy_box_whatsapp`.
- Ícone de livro (📖) decorativo abaixo (lucide `BookOpen`).
- Bullets do JSONB ficam abaixo, opcionais, em lista simples com bolinha verde.

## Detalhes técnicos

- Arquivos editados:
  - `src/pages/Webinar.tsx` — reescrita do JSX do card (header removido, novo agrupamento, novos estilos de input e CTA).
  - `src/pages/WebinarConfirmado.tsx` — reescrita do card seguindo layout da imagem 3 mas com paleta verde da landing.
- Migration: `UPDATE public.aulas_webinar SET foto_url = '<url>' WHERE slug = 'aula-secreta-alimentacao';`
- Tipografia: usar `font-serif italic` (Roboto Serif já no projeto) para títulos e linha da data; `font-sans` (DM Sans) para corpo.
- Cores: ler tudo de `getPalette(tema_paleta).branding`. Regra: textos = `darkColor`; acentos/CTAs = `primaryColor`; fundo da página = `primaryColor` a ~15% alpha (override do `warmBg` quando paleta é verde-clara).
- Mobile-first preservado: card empilhado, foto abaixo do form, paddings reduzidos.

## Fora do escopo

- Não mexer no CMS Admin nem em `landingPalettes.ts`.
- Não alterar a captura/n8n.
- Não alterar outras paletas — só o uso/contraste dentro destas 2 páginas.
