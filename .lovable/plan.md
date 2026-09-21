# Melhores Versos nos Textos Clássicos

## Objetivo
Adicionar uma quarta aba em **Textos Clássicos** para consultar, filtrar e copiar os melhores versos do acervo, com ferramentas de pacotes exclusivas para administradores.

## Implementação
- Criar `AbaMelhoresVersos` com carregamento único pelo acervo já preparado.
- Exibir resumo do acervo, busca, ordenação, filtros de tamanho, pontos, temas, livro e sânscrito.
- Mostrar os versos em cartões de duas colunas, com pontuação detalhada, referência e cópia individual.
- Para administradores, permitir criar/abrir pacotes, incluir ou retirar versos, filtrar o pacote, copiar seus textos e baixar CSV.
- Acrescentar a aba “Melhores Versos” à página existente e renderizá-la sem alterar as outras três abas.

## Validação
- Verificar tipos e a compilação automática.
- Abrir `/textos-classicos`, acessar a nova aba e conferir carregamento, filtros, cartões e adaptação para telas menores.
