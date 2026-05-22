## Problema

Na aba **Akasha** de `/meu-dosha`, em alguns celulares (Instagram in-app browser, Safari com barra dinâmica, etc.) o **input "Pergunte à Akasha…" não aparece**. O usuário não consegue digitar.

## Causa-raiz (auditoria)

Em `src/components/meudosha/AkashaTab.tsx`:

1. A área de mensagens usa altura fixa estimada: `h-[calc(100dvh-260px)]` no mobile. Esse `260px` é um chute — não bate com a altura real acima (header sticky + DiagnosticoCompleto + abas + paddings do PageContainer). Em vários aparelhos a soma passa de 260px, então a div de mensagens fica mais alta que o espaço disponível e **empurra o input para fora do viewport**.
2. `100dvh` no Instagram WebView e em alguns Androids antigos não funciona corretamente — cai para `100vh` que inclui a barra do navegador.
3. O input fica em um `<div>` comum no fluxo (não sticky/fixed). Quando o conteúdo acima estoura, ele simplesmente some abaixo da dobra.
4. O header da Akasha (logo 48px + título + linha de tokens) consome ~110px só no topo do chat, agravando a falta de espaço.
5. Sem `padding-bottom` para safe-area do iOS — o input pode ficar atrás da barra inferior do sistema.

## Plano (apenas UI, sem mexer em lógica)

Editar **somente** `src/components/meudosha/AkashaTab.tsx`:

### 1. Reestruturar o layout para o input sempre estar visível
- Trocar a estratégia de altura fixa por **input sticky no rodapé**:
  - Wrapper externo: `flex flex-col` sem altura calculada.
  - Mensagens: `flex-1 overflow-y-auto` com `min-h-[50vh]` (garante área mínima de leitura) e **sem** `h-[calc(...)]`.
  - Input: `sticky bottom-0 z-10` com fundo sólido (`bg-background`) e `pb-[env(safe-area-inset-bottom)]` para respeitar a safe-area do iOS.
- Resultado: mesmo se o cálculo de altura falhar, o input gruda no rodapé do viewport ao rolar.

### 2. Compactar o header da Akasha (mais espaço para o chat)
- Logo: `w-12 h-12` → `w-8 h-8`.
- Título "Akasha IA": `text-lg` → `text-sm`.
- Linha "Conversas ilimitadas / X conversas restantes": `text-xs` → `text-[10px]` e `text-muted-foreground/80`.
- Reduzir gaps/paddings do bloco header: `gap-2 pb-4 pt-2` → `gap-1 pb-2 pt-1`.
- Layout do header em linha (logo à esquerda, texto à direita) no mobile para ocupar menos altura vertical.

### 3. Garantir digitação no mobile
- Manter `fontSize: 16px` no input (já existe — previne zoom do iOS).
- Adicionar `enterKeyHint="send"` e `autoComplete="off"`.
- No `onFocus` do input, chamar `scrollIntoView({ block: 'nearest' })` para garantir que o teclado não cubra a barra.
- Aumentar levemente o toque do botão enviar (área 36×36 mínimo já ok).

### 4. Bloco "tokens esgotados"
- Aplicar o mesmo padrão sticky para que o card de upgrade também não suma.

## Não será alterado
- Lógica de envio, webhook, tokens, React Query, histórico.
- Demais arquivos (`MeuDosha.tsx`, abas, layout global).

## Validação
- Testar no preview em viewport mobile (375×812 e 360×800).
- Confirmar que input aparece com chat vazio, com 1 mensagem e com chat longo.
- Confirmar que ao rolar mensagens antigas, o input continua visível no rodapé.