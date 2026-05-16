# Plano: corrigir CLS do lazy loading + ganhos extras

## Diagnóstico

O `Header` e `Footer` já estão **fora** do `Suspense` (vivem dentro de `Layout`, que envolve o `<Suspense>` em `src/App.tsx`). Então tecnicamente eles montam antes — mas o fallback atual (`RouteFallback`) é um `div min-h-[60vh]` com spinner centralizado. Quando o chunk da rota carrega:

- a página real tem altura maior que 60vh → o footer "cai" pra baixo (shift do footer)
- o conteúdo real (h1, section) aparece num lugar diferente do spinner → shift dos elementos da home
- o header sticky reflui porque o `<body>` muda de altura → shift do header

## Mudanças (mínimas, só CLS)

### 1. `src/components/Layout.tsx`
Adicionar `min-h-screen` no wrapper do conteúdo entre Header e Footer, para o Footer nunca subir:
- trocar `<div className="flex-1">{children}</div>` por `<div className="flex-1 min-h-screen">{children}</div>`

### 2. `src/App.tsx` — `RouteFallback`
Substituir o spinner por um **skeleton genérico** com altura reservada que cubra a viewport:
- container: `min-h-screen w-full` (sem `flex items-center`, sem `60vh`)
- conteúdo: blocos `bg-muted/40 animate-pulse rounded` simulando hero (barra alta) + grid de cards, dentro de `max-w-6xl mx-auto px-4 sm:px-6 py-8`
- sem texto, sem spinner flutuante — só blocos neutros usando tokens do design system

Isso garante que o espaço ocupado pelo fallback ≥ espaço médio de uma página, eliminando o empurrão do footer e o reflow do header sticky.

### 3. `index.html`
Adicionar no `<head>` para evitar shift do header sticky no primeiro paint (antes do React montar):
```html
<style>
  #root { min-height: 100vh; }
</style>
```

## Extras de performance (baixo risco, alto retorno)

Sugiro incluir junto, já que mexem em arquivos próximos:

### A. Preconnect ao Supabase
No `<head>` do `index.html`, adicionar:
```html
<link rel="preconnect" href="https://<project>.supabase.co" crossorigin />
```
Reduz latência da primeira chamada de auth/dados em ~100-300ms.

### B. `vite.config.ts` — `build.target` e CSS code split
Já vem ligado por default no Vite, mas vale travar:
```ts
build: { target: 'es2020', cssCodeSplit: true, reportCompressedSize: false }
```
`reportCompressedSize: false` acelera o build sem afetar runtime.

### C. Preload do chunk da home
Como `Index` é a rota mais visitada, adicionar `<link rel="modulepreload">` para ela quebraria o ganho de code splitting nas outras rotas. **Não recomendo** — manter como está.

### D. Lazy de ícones do `lucide-react`
Já são tree-shaken por named import — nada a fazer.

### E. Imagens com `width`/`height`
Fora do escopo deste prompt (causa CLS em páginas individuais, não no shell). Posso atacar num prompt separado se quiser.

## O que NÃO muda
- Lazy loading das rotas (mantido)
- Header, Footer, providers, `AnalyticsLoader`, fontes locais, cache headers
- Qualquer lógica de auth, dados ou visual das páginas reais

## Ordem
1 (Layout) → 2 (RouteFallback skeleton) → 3 (style no index.html) → A (preconnect) → B (vite config). Build valida ao final.

Quer que eu inclua os extras (A, B) ou prefere só o fix de CLS (1, 2, 3)?
