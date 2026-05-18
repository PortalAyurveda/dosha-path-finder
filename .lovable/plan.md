## Mudanças na homepage (`src/pages/Index.tsx` e `src/components/index/FundamentosAyurveda.tsx`)

### 1. Reordenar seções
Em `Index.tsx`, trocar a ordem para que "Conheça Ayurveda por aqui" (atual FundamentosAyurveda) venha antes do "Feed do dia" (BibliotecaSection):

```
<Hero/LoggedHero />
<FeedSocial />            (marquee fica logo abaixo do hero, sticky)
<FundamentosAyurveda />   ← renomeado, agora 2ª seção
<BibliotecaSection />     ← "Feed do dia" desce
<SommelierArtigos />
<SamkhyaBanner />
```

### 2. Renomear seção e remover subtítulo
Em `FundamentosAyurveda.tsx`:
- Trocar título "Fundamentos do Ayurveda" → "Conheça Ayurveda por aqui"
- Remover o `<p>` subtítulo "Artigos essenciais para começar"

### 3. Reduzir o espaço entre hero e a seção
Em `FundamentosAyurveda.tsx`, reduzir o padding vertical do `<section>`:
- Atual: `py-16 md:py-20`
- Novo: `pt-6 md:pt-8 pb-16 md:pb-20` (mantém respiro abaixo, encurta acima)
- Também reduzir o `mb-10` do header da seção para `mb-6`.

Nenhuma outra alteração visual/comportamental.
