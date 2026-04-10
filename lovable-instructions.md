## Portal Ayurveda — Design System + Layout Base

### 1. Arquivo de instruções do projeto

Salvar o `lovable-instructions.md` como memória do projeto com todas as regras de design, cores, tipografia, padrões geométricos e regras de estabilidade.

### 2. Design System no Tailwind

- **Cores Vibrantes (Oficial + Kapha ajustado):** Estender `tailwind.config.ts` com `primary` (#352F54), `secondary` (#FF7676 - Salmão para CTAs), `accent` (#FACC15 - Amarelo), `vata` (#6B8AFF), `pitta` (#FF7676), `kapha` (#4ADE80), `bg-soft` (#F8F9FA), `surface-sun` (#FFF8EE).

- **Tipografia:** Importar Google Fonts (Roboto Serif para Títulos/Destaques + DM Sans para Corpo/Subtítulos) no `index.html`.

- **Grafismos da Identidade Visual:**
  - _Forma de Folha_ (cantos opostos arredondados): Aplicar em botões e cards (ex: `rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm`).

  - _Forma de Portal/Arco_: Aplicar em imagens de destaque ou topos de containers (ex: `rounded-t-full rounded-b-none`).

### 3. Layout Base (Shell da aplicação)

- **Header mobile-first**: logo à esquerda, menu hamburger à direita, navegação em drawer/sheet simples.

- **Header desktop**: navbar horizontal com links para as rotas principais.

- **Footer**: links úteis, logo, link da Loja Samkhya.

- **Layout wrapper**: reutilizável com whitespace generoso, max-width, padding responsivo.

- **Estabilidade (Prevenção de Tela Branca):** É estritamente proibido o uso de `TooltipProvider` ou componentes complexos de Tooltip do shadcn/ui nesta fase estrutural para evitar erros de `useRef` nulo. Manter a UI direta e funcional.

### 4. Rotas estruturadas (páginas placeholder)

Criar todas as rotas com páginas placeholder estilizadas:

- `/` — Home (Hub completo de conteúdo e conversão)

- `/teste-de-dosha` — Placeholder do teste multi-etapas

- `/meu-dosha` — Placeholder do resultado do diagnóstico

- `/biblioteca` — Placeholder da biblioteca (Acervo)

- `/cursos` — Placeholder dos cursos (LMS)

- `/terapeutas-do-brasil` — Placeholder do diretório

- `/akasha` — Akasha IA: chatbot ayurvédico conectado ao n8n (webhook POST). Recebe `?id=` do idPublico para contexto do usuário. Tom roxo #9b73ad. Acessível apenas via meu-dosha ou diretamente com ID.

### 5. Componentes base reutilizáveis

- **PageContainer** — wrapper padrão com padding, max-width, e injeção de SEO dinâmico (`react-helmet-async`).

- **SectionTitle** — componente para H1/H2 seguindo a hierarquia da Roboto Serif.

- **DoshaCard** — card genérico com cor de fundo respectiva (vata/pitta/kapha), utilizando a _Forma de Folha_ nas bordas.

- **CTAButton** — botão de ação principal usando a cor Salmão (`secondary`) para alto contraste e bordas no formato de _Folha_.

### 6. Home Page (Vitrine / Index Hub)

- **Hero section:** Fundo quente, H1 em Roboto Serif Italic Bold focando em longevidade, subtítulo em DM Sans, e um CTAButton gigante pro Teste de Dosha.

- **Seção Educacional:** 3 DoshaCards lado a lado explicando rapidamente Vata, Pitta e Kapha.

- **Hub de Conteúdos:** Grid de navegação rápida com abas (Tabs simples) para "Recentes", "Receitas" e "Vídeos", exibindo cards com dados simulados (mock).

- **Banner de Monetização:** Faixa horizontal estilo "Portal" com CTA externo apontando para a Loja Samkhya.

- _Responsividade:_ Totalmente fluida e pensada para navegação com o polegar (mobile-first para links do Instagram).

### 7. SEO básico

- Instalar e configurar `react-helmet-async`.

- Cada rota e página deve conter suas tags `<title>` e `<meta description>` pertinentes e otimizadas para busca orgânica.
