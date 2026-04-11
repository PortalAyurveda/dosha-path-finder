

# Reorganização das Tags do Blog por Categorias

## Problema
25 tags exibidas de uma vez poluem a área de busca. Precisamos organizar sem esconder demais.

## Proposta: Categorias como Accordion/Collapsible

Quando o usuário ativa "Busca Avançada", aparece uma nova seção **"Filtrar por tag"** com **6 categorias** em formato de botões/chips de categoria. Ao clicar numa categoria, ela expande inline mostrando só as tags daquela categoria. Várias categorias podem estar abertas ao mesmo tempo.

```text
┌─────────────────────────────────────────┐
│  [🔍 Buscar por texto................] │
│  ☑ Busca Avançada                       │
│                                         │
│  Filtrar por tag:                       │
│  [Doshas] [Corpo & Fisiologia]          │
│  [Mente & Energia] [Alimentação]        │
│  [Terapias & Rotina] [Saúde & Peso]     │
│                                         │
│  ▼ Doshas (expandido)                   │
│  [🌬️Vata] [🔥Pitta] [🪵Kapha]          │
│                                         │
│  ▼ Alimentação (expandido)              │
│  [🥘Alimentação] [💊Antídotos] [🏗️Detox]│
└─────────────────────────────────────────┘
```

### Categorias propostas (6 grupos):

| Categoria | Tags |
|-----------|------|
| **Doshas** | Vata, Pitta, Kapha, Fisiologia e Doshas |
| **Corpo & Metabolismo** | Metabolismo e digestão, Ama e biotoxinas, Excreção e dejetos, Vitalidade & Ojas |
| **Mente & Energia** | Prana e espiritualidade, Mente e consciência, Sono e descanso, Sattva, Rajas, Tamas |
| **Alimentação** | Alimentação & Receitas, Dravyaguna & Herbologia, Antídotos & Incompatíveis |
| **Terapias & Rotina** | Terapias Ayurveda, Rotina & Horários, Detox e restrições, Indicações e dicas |
| **Saúde & Peso** | Emagrecimento, Ganho de Peso, Diagnóstico, Doenças Avançadas |

## Implementação

1. **`src/data/blogTags.ts`** — Reestruturar como um mapa `{ categoria: string, tags: BlogTag[] }[]`
2. **`src/pages/Blog.tsx`** — Tags só aparecem quando "Busca Avançada" está ativo. Categorias como botões toggle que expandem/colapsam as tags de cada grupo. Tags selecionadas ficam visíveis como badges acima dos resultados mesmo com categoria fechada.

Componentes usados: Collapsible do shadcn (já existe no projeto). Sem novas dependências.

