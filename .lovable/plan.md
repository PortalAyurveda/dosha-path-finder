

## Portal Ayurveda — Design System + Layout Base

### 1. Arquivo de instruções do projeto
Salvar o `lovable-instructions.md` como memória do projeto com todas as regras de design, cores, tipografia e padrões.

### 2. Design System no Tailwind
- Estender `tailwind.config.ts` com as cores: primary (#352F54), secondary (#6B7FF2), vata (#93C5FD), pitta (#FCA5A5), kapha (#86EFAC), bg-soft (#E0E7FF), surface-sun (#FFF7ED), surface-sky (#EFF6FF)
- Importar Google Fonts (Roboto Serif + DM Sans) no `index.html`
- Configurar classes de tipografia no CSS global seguindo a hierarquia definida

### 3. Layout Base (Shell da aplicação)
- **Header mobile-first**: logo à esquerda, menu hamburger à direita, navegação em drawer/sheet
- **Header desktop**: navbar horizontal com links para as rotas principais
- **Footer**: links úteis, logo, link da Loja Samkhya
- **Layout wrapper** reutilizável com whitespace generoso, max-width, padding responsivo

### 4. Rotas estruturadas (páginas placeholder)
Criar todas as rotas com páginas placeholder estilizadas:
- `/` — Home (hero com CTA "Descubra seu Dosha")
- `/teste-de-dosha` — Placeholder do teste
- `/meu-dosha` — Placeholder do resultado
- `/biblioteca` — Placeholder da biblioteca
- `/cursos` — Placeholder dos cursos
- `/terapeutas-do-brasil` — Placeholder do diretório
- `/akasha` — Placeholder do dashboard IA

### 5. Componentes base reutilizáveis
- **PageContainer** — wrapper padrão com padding, max-width, SEO (react-helmet-async)
- **SectionTitle** — componente para H1/H2 seguindo a tipografia
- **DoshaCard** — card genérico com cor por dosha (vata/pitta/kapha)
- **CTAButton** — botão principal com estilo do portal

### 6. Home Page (primeira página real)
- Hero section com título em Roboto Serif Italic Bold, subtítulo, CTA pro teste
- Seção "Como funciona" com 3 passos ilustrados com ícones
- Seção social proof / feed de resultados recentes (tabela feed_resultados)
- Totalmente responsiva para navegador do Instagram (mobile-first)

### 7. SEO básico
- Instalar e configurar `react-helmet-async`
- Cada página com `<title>` e `<meta description>` adequados

