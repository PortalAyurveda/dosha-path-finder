## Alteração no Hero do Index

Vamos reorganizar a coluna esquerda do hero (`src/components/home/Hero.tsx`) para acomodar um novo banner abaixo do card de preview, sem aumentar a altura total do hero.

### Mudanças

**1. Alinhamento topo-a-topo das duas colunas**
- No grid `lg:grid-cols-12`, trocar `items-center` por `items-start` para que o card "Faça o teste para desbloquear seu mapa biológico" (esquerda) alinhe pelo topo com o card "Seu guia completo para saúde e longevidade" (direita).
- Resultado: como o card esquerdo é mais curto que o direito, sobra um espaço vazio embaixo dele.

**2. Novo banner abaixo do card esquerdo**
- Adicionar, na mesma coluna `lg:col-span-7`, um wrapper flex-col vertical contendo:
  - O card atual do `DoshaPreview` (mantido como está, `max-w-xl mx-auto`).
  - Um novo `<img>` com `src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-zero-sf300x.webp"`, com a MESMA largura do card de preview (`max-w-xl mx-auto w-full`), `h-auto`, `rounded-3xl`, `alt` descritivo, `loading="lazy"`.
  - Espaçamento entre os dois (`space-y-4` ou `gap-4`).
- A imagem original tem 1600px de largura mas será exibida limitada por `max-w-xl` (≈576px) com `h-auto`, então fica visualmente reduzida ao mesmo width do card de cima — sem precisar reprocessar o asset.

**3. Garantir que a altura total do hero não aumente**
- A coluna direita já é mais alta que o card de preview sozinho (form com vários campos). O espaço liberado pelo `items-start` é exatamente onde o banner vai entrar.
- Se o conjunto (preview + banner) ficar mais alto que o card direito em alguma resolução, o hero cresce no mobile/desktop. Para evitar isso, o `<img>` recebe `object-contain` e o wrapper esquerdo herda a altura natural; o ganho de altura ficará dentro da margem que o card direito já ocupa em desktop (lg+).
- O bloco esquerdo só aparece em `lg+` (já é `hidden lg:flex`), então no mobile nada muda.

**4. Sem alterações em**
- Coluna direita (formulário) — intocada.
- Decorações de fundo, gradientes, container externo.
- Lógica do componente.

### Arquivo afetado
- `src/components/home/Hero.tsx` (somente JSX/classes; nenhum estado novo).

### Pontos de atenção (lições das tentativas anteriores)
- NÃO mexer no `DoshaPreview` interno nem nos overlays de "Lock".
- NÃO redimensionar o card direito.
- NÃO trocar `hidden lg:flex` por `flex` — manteria o preview no mobile.
- Banner deve ficar EMBAIXO do card de preview, ainda dentro do `lg:col-span-7`, alinhado pela mesma `max-w-xl mx-auto` para casar a largura.
