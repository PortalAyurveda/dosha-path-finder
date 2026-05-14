## Objetivo
Restaurar a página `/` (Index) removendo apenas a seção de aula de lançamento que foi adicionada recentemente, sem alterar nenhuma outra parte da página.

## O que será removido
A seção inteira renderizada pelo componente `AulaAoVivoBanner`, que inclui:
- Banner/hero de aula ao vivo
- Countdown regressivo (timer de dias/horas/min/seg)
- Emojis animados pulando (🎉, ✨, 🎆, 🎊, 🪔)
- Ícone extra (logo simbolo-positivo.svg) dentro da seção

## O que NÃO será mexido
Todo o restante da página Index continua igual:
- Hero padrão / LoggedHero
- Feed Social (marquee de métricas)
- Biblioteca Section (Live/Receita/Artigo do dia)
- Registros Akashikos
- Sommelier de Artigos
- Samkhya Banner

## Arquivos alterados
- `src/pages/Index.tsx` — remover o `import` de `AulaAoVivoBanner` e remover a tag `<AulaAoVivoBanner />` do JSX.
- `src/components/home/AulaAoVivoBanner.tsx` — deixar inalterado (o componente pode ser reutilizado futuramente; apenas paramos de renderizá-lo na home).

## Resultado esperado
A home volta a iniciar diretamente com o Hero (público ou logado), sem nenhuma seção de aula/countdown acima dele.