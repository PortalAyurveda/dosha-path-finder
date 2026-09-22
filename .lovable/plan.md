# Refinamento visual do Detox da Primavera

## Objetivo
Adicionar a identidade própria do Detox ao catálogo, separar melhor fundos, cartões e campos nas duas páginas, melhorar o mapa e o guia final, e corrigir o nome usado no chat ao vivo.

## Alterações
- Adicionar a paleta `detox-primavera` ao catálogo oficial, incluindo logo, amostras e cores informadas, para aparecer automaticamente no seletor do CMS.
- Fazer `/detox` e `/detox/mapa` consumirem essa paleta via `getPalette`, aplicando suas cores por variáveis sem hex solto nas páginas.
- Atualizar os tokens visuais do Detox para três níveis claros: fundo quente, cartões brancos com borda/sombra e campos brancos com borda e foco laranja.
- Corrigir o nome do chat priorizando o nome da sessão, ignorando o perfil genérico “Visitante” e exibindo “Seu nome” sempre que não houver nome válido.
- Compactar o cabeçalho do mapa com `ArrowLeft` e `Map`, removendo o sol desse trecho.
- Transformar as perguntas em formato de caderno, com números circulares, seis linhas, contador e separadores.
- Mostrar o ícone `Check` no aviso de salvamento quando a gravação terminar.
- Reorganizar a faixa final da sala como guia em três passos com `PlayCircle`, `PenLine` e `CalendarDays`, preservando textos, botões, alturas e cantos existentes.
- Usar `doshaResult.nome` no título personalizado apenas quando for um nome válido e diferente do início do e-mail.

## Validação
- Conferir tipos e o estado atual da compilação.
- Testar `/detox` e `/detox/mapa` em desktop e celular, incluindo campos, contadores e nome do chat.
