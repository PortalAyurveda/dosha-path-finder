

## Busca Comum + Busca Avançada com Timestamps Clicáveis

### O que muda

A Biblioteca ganha dois modos de busca:
- **Busca Comum** (padrão): pesquisa pelo `novo_titulo` — retorna grid de cards como hoje
- **Busca Avançada** (toggle): pesquisa pelo `texto_para_embedding` — retorna o vídeo mais relevante com a descrição completa, onde timestamps como `00:31:00 - Controle natural do colesterol` viram links clicáveis que abrem o player naquela minutagem

### Dados confirmados

O campo `texto_para_embedding` contém um índice de minutos estruturado assim:
```
00:31:00 - Controle natural do colesterol pelo Ayurveda
00:33:00 - Relação entre digestão, intoxicação e colesterol alto
```

Isso permite parsear timestamps e converter para segundos (`00:31:00` → `1860s`).

### Componentes

**1. SearchHeader.tsx — Atualizar**
- Adicionar botão toggle "Busca Avançada" ao lado do input (ícone ou badge)
- Passar estado `isAdvanced` para o componente pai

**2. Biblioteca.tsx — Atualizar lógica de query**
- Busca comum: `.ilike('novo_titulo', '%termo%')` → retorna até 20 resultados
- Busca avançada: `.ilike('texto_para_embedding', '%termo%')` → retorna 1 resultado (mais recente), incluindo `texto_para_embedding` no select

**3. AdvancedVideoResult.tsx — Novo componente**
- Layout especial para resultado de busca avançada: vídeo grande + descrição completa
- Player iframe no topo (16:9), inicialmente sem timestamp
- Abaixo: título + texto_para_embedding com timestamps parseados
- Regex `/(\d{2}:\d{2}:\d{2})\s*-\s*(.+)/g` extrai cada timestamp
- Cada linha de timestamp vira um botão clicável
- Ao clicar, atualiza o `src` do iframe para `youtube.com/embed/${videoId}?autoplay=1&start=${seconds}`

**4. Fluxo do usuário**
```text
[Input de busca] [🔍 Busca Avançada toggle]

Toggle OFF (padrão):
  → pesquisa por novo_titulo
  → grid de cards (como hoje)

Toggle ON:
  → pesquisa por texto_para_embedding  
  → mostra 1 vídeo com player + descrição com timestamps clicáveis
  → clicar em "00:31:00 - Colesterol" → player pula para 31min
```

### Detalhes técnicos
- Conversão de timestamp: `HH:MM:SS` → `H*3600 + M*60 + S` segundos para o param `&start=`
- O iframe é re-renderizado via key ou state change no `src` quando o usuário clica em um timestamp
- Sem dependências externas — tudo com regex nativo e iframe HTML5
- Mantém compatibilidade total com a busca comum existente

