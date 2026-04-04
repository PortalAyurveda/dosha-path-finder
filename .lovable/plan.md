

## Busca Avançada com Grid de Resultados + Detalhe com Timestamps

### O que muda

A busca avançada deixa de mostrar apenas 1 vídeo. Agora mostra um **grid de cards** (como a busca comum), onde cada card exibe a miniatura do vídeo e, abaixo dela, o **timestamp matching em bold e sublinhado** (ex: "00:11:00 - Controle natural do colesterol"). Ao clicar num card, abre a view detalhada com o player + todos os timestamps clicáveis.

### Fluxo do usuário

```text
Busca avançada: "colesterol"
  → Grid com N vídeos que mencionam "colesterol" no texto_para_embedding
  → Cada card: miniatura + timestamp relevante em bold/sublinhado
  → Clique no card → abre AdvancedVideoResult com player + índice completo
  → Player inicia no timestamp clicado
```

### Componentes

**1. Biblioteca.tsx — Atualizar query avançada**
- Mudar `.limit(1)` para `.limit(20)` — retorna múltiplos resultados
- Retornar array ao invés de objeto único
- Adicionar estado `selectedAdvancedVideo` para controlar qual vídeo está aberto na view detalhada
- Dois estados de UI: grid de resultados OU view detalhada de um vídeo

**2. Novo componente: `AdvancedVideoCard.tsx`**
- Recebe `videoId`, `title`, `textoParaEmbedding`, `searchTerm`
- Mostra miniatura do YouTube (como VideoResultCard)
- Abaixo: parseia timestamps do `texto_para_embedding`, encontra o primeiro que contém o `searchTerm` (case-insensitive), e mostra essa linha em **bold + sublinhado**
- Se houver mais matches, mostra contagem (ex: "+2 menções")
- onClick dispara navegação para a view detalhada

**3. AdvancedVideoResult.tsx — Adicionar `initialSeconds` prop**
- Recebe prop opcional `initialSeconds` para iniciar o player na minutagem do timestamp clicado no card
- Adicionar botão "← Voltar aos resultados" no topo
- Destacar (highlight) as linhas de timestamp que contêm o termo buscado

**4. Layout na Biblioteca.tsx**
- Busca avançada sem vídeo selecionado → grid de `AdvancedVideoCard`
- Busca avançada com vídeo selecionado → `AdvancedVideoResult` com botão voltar
- Ao mudar o termo de busca, limpa a seleção e volta ao grid

### Detalhes técnicos
- Regex para encontrar match: percorre timestamps parseados e faz `.toLowerCase().includes(searchTerm)` no label
- `initialSeconds` é passado ao iframe src: `?autoplay=1&start=${initialSeconds}`
- Botão voltar usa `setSelectedAdvancedVideo(null)` — sem navegação de rota

