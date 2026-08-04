# Mockups para Story: novo arranjo de card

Reformular a seção `/admin/mockups` para gerar cards de Instagram no arranjo pedido: **título → descrição → tags → foto embaixo**, com foto ocupando a base do card. Vale para Story (1080×1920) e Feed (1080×1350).

## O que muda visualmente

Os cards de **Artigo**, **Vídeo** e **Receita** passam a ter uma estrutura única e consistente:

```text
┌──────────────────────────┐
│  (área segura do topo)   │
│  SELO (Artigo/Vídeo/     │
│        Receita)          │
│                          │
│  Título grande (serif)   │
│  Descrição curta         │
│                          │
│  [tag] [tag] [tag]       │
│                          │
│  ┌────────────────────┐  │
│  │                    │  │
│  │       FOTO         │  │
│  │  (cantos suaves)   │  │
│  └────────────────────┘  │
│  logo · portalayurveda   │
│              cta →       │
└──────────────────────────┘
```

- A foto vira um bloco com cantos arredondados dentro da área segura, não mais uma faixa sangrada no topo.
- No vídeo, o botão de play continua sobre a foto (agora na base).
- Altura da foto: ~40% no Story, ~34% no Feed, com o texto acima ocupando o espaço restante — sem cortes nem sobras estranhas.
- Tags: até 3 chips discretos, só quando o conteúdo tem tags. Artigos e vídeos guardam tags como texto separado por vírgula; receitas guardam como lista. Os emojis presentes nas tags são removidos para o chip ficar limpo.
- Título e descrição continuam com truncagem automática por tamanho, para nunca estourar o card.

## Escolher o que exportar

- Cada grupo (Artigos, Vídeos, Receitas, Conversas) passa a trazer **6 opções**.
- Um campo de busca no topo filtra os cards por título/texto em todos os grupos ao mesmo tempo.
- O restante da página (Clima, Números, Convite terapeutas, Cursos, botão Baixar PNG, seletor de formato) permanece igual.

## Detalhes técnicos

1. **Banco** — `mockups_dados()` (função SQL) passa a retornar também `tags` para artigos (`portal_conteudo.tags`), vídeos (`videos_canonicos.tags`) e receitas (`rotina_nuggets.tags`), e o limite de vídeos/artigos/receitas fica em 6 cada. Alteração via migração, sem mudança de schema de tabela.
2. **`src/pages/AdminMockups.tsx`**
   - Novo componente compartilhado `CardConteudo` (selo, título, descrição, chips de tags, foto na base, rodapé), usado por `CardArtigo`, `CardVideo` e `CardReceita`, cada um passando cor de selo/CTA e conteúdo próprio (receita mantém "pra que serve" quando cabe).
   - Novo helper `normalizarTags` (aceita string separada por vírgula ou array, tira emojis/`#`, corta em 3).
   - Novo componente `Chips` para renderizar as tags.
   - Estado `busca` + input no header sticky; `Grupo` filtra itens por um campo `texto` de busca.
   - Exportação PNG não muda (mesmo `pixelRatio`, mesmas dimensões finais).
