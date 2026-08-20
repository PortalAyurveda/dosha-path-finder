# Baixar PNG respeitando a cor escolhida

## O que está acontecendo

A página pré-gera o PNG de cada card em segundo plano (para o compartilhamento no iPhone funcionar). Essa pré-geração é refeita quando muda o formato (Story/Feed) ou o conteúdo do card — mas **não** quando muda a cor de fundo. A lista de cards é memoizada apenas por dados e formato, então o seletor de cor muda o que aparece na tela, porém o arquivo guardado em memória continua sendo o da cor anterior. Ao clicar em "Baixar PNG", o arquivo antigo é entregue.

## Correção

Em `src/pages/AdminMockups.tsx`, no componente `CardExport`:

- Ler o tema atual do contexto (`useTema()`) e incluir a chave do tema nas dependências do efeito de pré-geração, zerando o arquivo em cache sempre que a cor mudar.
- Guardar junto do arquivo pré-gerado a chave de tema/formato usada; no clique, só reutilizar o cache se a chave bater — caso contrário, gerar na hora com a cor atual.

Nada mais muda: layout dos cards, formatos, "Copiar link" e o caminho de download/compartilhamento continuam iguais.

## Verificação

Como a área é admin e a autenticação deste projeto não é gerenciada pelo Lovable, a checagem final é sua: trocar a cor, baixar o PNG e conferir que o fundo do arquivo corresponde à cor selecionada (inclusive alternando entre cores várias vezes seguidas).
