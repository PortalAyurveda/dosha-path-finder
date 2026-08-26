# Tirar o itálico do site (geral)

Hoje o itálico vem de dois lugares:

1. **Regra global** em `src/index.css`: todo `h1`, `h2` e `h3` do site nasce em `font-serif ... italic`. É a origem da maioria dos títulos e subtítulos inclinados (index, doshas, artigos, seções).
2. **Classes `italic` soltas** em componentes e páginas — cerca de 180 ocorrências espalhadas (títulos de curso, hero, escola, webinar, registros akáshicos, avisos pequenos, nomes de produto/artigo, certificado).

## O que será feito

- Remover `italic` das regras base de `h1`, `h2`, `h3` em `src/index.css` (mantendo fonte serifada, peso, tamanho e cor iguais).
- Varrer `src/` e remover o `italic` das classes Tailwind e os `fontStyle: "italic"` inline — em páginas públicas, componentes, escola, cursos, webinar e telas de admin — para o site ficar consistente.
- Manter tudo o mais igual: nenhuma mudança de fonte, tamanho, cor, espaçamento ou layout.
- A loja `/samkhya` já está sem itálico (regra própria em `samkhya-fonts.css`) e continua como está.
- `not-italic` existente continua funcionando (fica redundante, sem efeito visual).

## Detalhes técnicos

- `src/index.css`: retirar o token `italic` das duas regras `@layer base` (`h1` e `h2, h3`).
- Sweep dos arquivos em `src/**/*.tsx` removendo o token de classe `italic` (sem tocar em `not-italic`) e trocando `fontStyle: "italic"` por `normal`/remoção em `src/pages/AdminCertificados.tsx`.
- Fontes itálicas em `src/styles/fonts.css` continuam declaradas (não atrapalham; podem ser podadas depois se quiser reduzir peso de fonte).
- Verificação final: `rg -n "\bitalic\b" src` sem resultados relevantes e build OK.
