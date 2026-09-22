# Jornada da Primavera

## Objetivo
Criar duas páginas públicas, integradas ao Portal Ayurveda:

- `/detox`: sala da Noite 1 com transmissão, contagem regressiva, chat ao vivo e chamada personalizada para o mapa.
- `/detox/mapa`: mapa pessoal com resultado do Teste de Dosha, Agni e três respostas salvas automaticamente.

## Implementação

### 1. Base visual e níveis dos doshas
- Criar os tokens semânticos da identidade “diagnóstico alaranjado” no tema global, mantendo Roboto Serif e DM Sans.
- Criar `src/data/doshaLevels.ts` com as faixas informadas para Vata, Pitta e Kapha e a função `getFaixa`.
- Reutilizar o sol hospedado no Portal e os componentes de botões existentes.

### 2. Sala da Jornada — `/detox`
- Criar uma página dedicada que lê `titulo`, `youtube_url` e `starts_at` da aula ativa com slug `detox`.
- Reaproveitar do fluxo de aula atual a conversão da URL do YouTube, o player com link externo e a contagem regressiva.
- Exibir o estado ao vivo somente após `starts_at`, com a bolinha animada apenas quando o dispositivo permitir movimento.
- Montar vídeo e `LiveChat slug="detox"` com 480px lado a lado no desktop e vídeo sobre chat de 320px em telas menores.
- Exibir a chamada final correta para visitante, pessoa sem Teste de Dosha ou pessoa com resultado, considerando sessão anônima como visitante.

### 3. Mapa da Jornada — `/detox/mapa`
- Criar o cabeçalho e as quatro seções na coluna de leitura de 768px.
- Carregar detalhes do Agni com `resultado_teste` e mostrar o gráfico de doshas por carregamento sob demanda.
- Exibir a versão correta do ponto de partida para visitante, pessoa sem teste ou pessoa com teste.
- Manter as três perguntas sempre editáveis e restaurar rascunhos locais de visitantes.
- Para pessoas autenticadas, carregar a ficha da Noite 1 e migrar qualquer rascunho local para a conta.
- Salvar por `upsert` no par `user_id, noite`: automaticamente após dois segundos sem digitação e imediatamente pelo botão, com confirmação “Salvo”.
- Manter as Noites 2 e 3 bloqueadas com os textos e datas fornecidos.

### 4. Rotas e descoberta
- Declarar as duas páginas com `lazy()` em `src/App.tsx`.
- Adicionar as duas URLs ao pré-render e ao sitemap no mesmo conjunto de alterações, conforme a regra atual do projeto.
- Definir título e descrição próprios para compartilhamento e busca.

## Validação
- Verificar compilação e tipos do aplicativo e dos scripts de pré-render.
- Testar em navegador os estados público e autenticado disponíveis, incluindo player, chat, contagem, restauração local, salvamento e layout em desktop e celular.
- Confirmar que as duas páginas pré-renderizam e aparecem de forma consistente no sitemap.

## Dados existentes
Nenhuma mudança no banco é necessária: `aulas_ao_vivo`, `jornada_ficha`, o índice único `(user_id, noite)`, as políticas privadas e a função `resultado_teste` já atendem ao fluxo.
