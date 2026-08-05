# Limpar a descrição dos vídeos

Na página de vídeo, a descrição atual repete o índice de minutos (a lista "00:00 - ...", que aparece de novo como texto sem link) e termina com a frase de convite "Continue sua jornada no Ayurveda e explore mais conteúdos exclusivos no https://www.portalayurveda.com".

## O que muda

1. A descrição passa por uma limpeza antes de ser exibida:
   - Remove as linhas que são apenas marcações de tempo ("00:00 - Introdução...") — elas já aparecem no bloco clicável "Índice de Minutos" acima.
   - Remove a frase final de convite: qualquer trecho que contenha uma URL do portalayurveda.com é cortado do último ponto final antes dela até o fim daquela frase/linha.
   - Sobra apenas o texto descritivo da receita, exatamente como no exemplo enviado.
2. Se, depois da limpeza, não sobrar nenhum texto útil, o bloco de descrição simplesmente não aparece.
3. O índice de minutos continua igual (é gerado a partir do texto original, não da descrição limpa).
4. A mesma limpeza é aplicada à meta description / JSON-LD da página, para o Google não indexar o texto duplicado.

Nada é alterado no banco de dados — a limpeza é só de apresentação, então vale para todos os vídeos existentes e futuros automaticamente.

## Detalhes técnicos

- Novo helper (ex.: `src/lib/videoDescricao.ts`) com `limparDescricaoVideo(texto)`:
  - descarta linhas que casam com `^\s*(\d{1,2}:)?\d{1,2}:\d{2}\s*[-–]`;
  - remove sentenças que contenham `portalayurveda.com` (corta do último `.`/`!`/`?`/quebra de linha anterior até o fim da sentença/linha);
  - normaliza quebras de linha múltiplas e espaços nas pontas.
- `src/pages/Video.tsx`: aplicar o helper em `description` (linha 249) — usado tanto no `<article>` quanto no `jsonLd.description` e nas meta tags.
- Verificar se `scripts/prerender-og.ts` monta meta description de vídeo a partir de `nova_descricao`; se sim, aplicar a mesma função lá para o HTML pré-renderizado ficar consistente.
