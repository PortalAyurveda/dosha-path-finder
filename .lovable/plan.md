## Objetivo
Reverter o "Modo Lançamento" para que `/` volte a exibir a home original (`Index`), preservando a `LaunchPage` e o countdown intactos para uso futuro.

## O que aconteceu antes (06/Mai)
Em `src/App.tsx`:
- `/` → `LaunchPage` (countdown)
- `/preview` → `Index` (home original)

## Mudança (apenas 1 arquivo)

### `src/App.tsx`
- Trocar `<Route path="/" element={<LaunchPage />} />` por `<Route path="/" element={<Index />} />`.
- **Remover** a linha `<Route path="/preview" element={<Index />} />` (a home volta a viver em `/`, então `/preview` deixa de fazer sentido apontando para o mesmo lugar).
- Manter o `import LaunchPage from "./pages/LaunchPage"` — sem usar, mas preservado para reativar rapidamente. (Se o ESLint reclamar de import não usado, adiciono comentário `// preserved for launch mode` acima.)

## O que NÃO será tocado
- `src/pages/LaunchPage.tsx` — fica intacto, com countdown, logo, link secreto, tudo como está.
- Nenhum outro arquivo, componente ou estilo.
- Nenhuma rota além das duas acima.

## Como reativar no futuro
Basta inverter de volta as duas linhas em `App.tsx`:
```tsx
<Route path="/" element={<LaunchPage />} />
<Route path="/preview" element={<Index />} />
```