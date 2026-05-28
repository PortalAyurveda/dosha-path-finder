## Mudanças no Hero (mobile)

**Arquivo:** `src/components/home/Hero.tsx`

1. **Esconder título e subtítulo no mobile**
   - Envolver o bloco com `<h1>Seu guia completo...</h1>` + `<p>Descubra e cuide...</p>` (linhas 175–182) e o `<hr>` (linha 184) em `className="hidden lg:block"`.
   - No mobile o card começa direto em "Comece seu Teste de Dosha Gratuito", reduzindo a altura.
   - SEO: mover o `<h1>` para visualmente oculto (`sr-only`) no mobile para preservar semântica.

2. **Mostrar MetricasMiniBanner no mobile, abaixo do card do formulário**
   - Hoje o `<MetricasMiniBanner />` só aparece na coluna esquerda escondida no mobile (linha 161 `hidden lg:flex`).
   - Adicionar uma segunda instância **fora** do grid, dentro do container do hero, com `className="lg:hidden mt-6"` para aparecer apenas no mobile/tablet, logo abaixo do botão "Começar".

**Arquivo:** `src/components/home/MetricasMiniBanner.tsx`

3. **Layout 2×2 no mobile**
   - Em `SetA` e `SetB` (e nos skeletons), trocar `grid-cols-4` por `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4`.
   - Resultado: 2 nuggets por linha, 2 linhas, totalizando 4 cards. Título (frase_nugget) acima e rodapé itálico abaixo permanecem.
   - Ajustar tamanhos para mobile: aumentar levemente padding dos `CardShell` e manter ícone de fundo proporcional. O `max-w-xl` do container já garante boa largura no celular.

Sem mudanças em desktop — o banner lateral continua igual.