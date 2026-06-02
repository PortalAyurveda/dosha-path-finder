## Levantamento atual

Hoje existem **4 páginas de curso/landing** com paleta própria, mas só 2 têm branding definido:

| Página | Rota | Paleta atual |
|---|---|---|
| Alimentação | `/curso/alimentacao` | Verde — primary `#CFEDC2`, dark `#A6D98F`, accent `#A6D98F`, warmBg `#FAF9F6` |
| Formação | `/curso/formacao` | Azul/Lilás — primary `#6B7FF2`, dark `#352F54`, light `#E0E7FF`, accent `#FCA5A5` |
| FormacaoLive | `/curso/formacao-live` | (herda formação) |
| Rotinas | `/curso/rotinas` | (sem branding dedicado) |
| Aula Secreta | `/aula-secreta` (a criar) | Verde alimentação |

Outras paletas já vivas no projeto:
- **Portal (natural)** — primary `#352F54`, secondary `#FF7676`, accent `#FACC15`, bg `#F8F9FA`, surface-sun `#FFF8EE`
- **Doshas** — vata `#6B8AFF`, pitta `#FF7676`, kapha `#9ED88B`, akasha `#9b73ad`
- **Samkhya Loja** — roxo `#7b4963`, ouro `#C8922A`, fundo `#FAF8F5`
- **Metricas** — graficos `#0EA5E9`

A interface `CourseBranding` (`src/data/courses/courseTypes.ts`) já define o shape: `primaryColor, darkColor, lightColor, accentColor, warmBg` — vamos reaproveitar.

## Recomendação

Criar **um único registry de paletas** como source-of-truth (`src/data/landingPalettes.ts`) + um **arquivo de instruções dedicado** (`landing-palettes.md`), e referenciar a partir do `lovable-instructions.md` (sem inchá-lo). Isso permite:

1. Dropdown no CMS lendo a lista do registry (key + label + swatch).
2. Reuso direto via `branding={palette}` nos componentes `course/*` que já consomem `CourseBranding`.
3. Adicionar novas paletas em um lugar só.

## O que será criado

### 1. `src/data/landingPalettes.ts`
Registry tipado exportando array `LANDING_PALETTES` e helper `getPalette(key)`. Cada item: `{ key, label, description, theme: 'light'|'warm'|'dark', branding: CourseBranding }`.

Paletas iniciais (cobrindo tudo que já existe + os temas que você citou):

| Key | Label | Uso sugerido | primary / dark / accent |
|---|---|---|---|
| `portal-natural` | Portal Natural | Eventos institucionais | `#352F54` / `#1F1A38` / `#FACC15` |
| `alimentacao-verde` | Alimentação (Verde) | Curso/aula de alimentação | `#A6D98F` / `#5E8F4A` / `#CFEDC2` |
| `remedios-salmao` | Remédios Caseiros (Salmão) | Conteúdo de remédios | `#FF7676` / `#B84A4A` / `#FFD0D0` |
| `diagnostico-alaranjado` | Diagnóstico (Alaranjado) | Teste/diagnóstico de dosha | `#F59E42` / `#A85A1A` / `#FFE3B8` |
| `formacao-azul` | Formação (Azul/Lilás) | Formação em ayurveda | `#6B7FF2` / `#352F54` / `#FCA5A5` |
| `samkhya-roxo-ouro` | Samkhya (Roxo/Ouro) | Loja Samkhya / produtos | `#7b4963` / `#5c3249` / `#C8922A` |
| `akasha-roxo` | Akasha (Roxo místico) | Akasha IA / registros | `#9b73ad` / `#5E3F70` / `#E6D6F0` |
| `vata-azul` | Dosha Vata | Conteúdo vata | `#6B8AFF` / `#2A4BCC` / `#D6E0FF` |
| `pitta-salmao` | Dosha Pitta | Conteúdo pitta | `#FF7676` / `#CC3333` / `#FFE0E0` |
| `kapha-verde` | Dosha Kapha | Conteúdo kapha | `#9ED88B` / `#15803D` / `#D1F4E0` |

### 2. `landing-palettes.md` (raiz, ao lado do `lovable-instructions.md`)
Documento curto que: (a) lista as paletas e quando usar cada uma, (b) explica que toda nova landing/CMS deve escolher uma key do registry e nunca hard-codar hex novo, (c) referencia o tipo `CourseBranding` e os componentes `src/components/course/*` como UI canônica.

### 3. Atualização do `lovable-instructions.md`
Adicionar uma seção curta **"8. Paletas de landing pages"** apontando para `landing-palettes.md` e `src/data/landingPalettes.ts`, com a regra: "novas landings de curso/evento devem consumir uma paleta do registry — nada de hex inline".

### 4. Refator leve (opcional, no mesmo passo)
- `src/data/courses/alimentacao.ts` e `formacao.ts` passam a importar `getPalette('alimentacao-verde')` / `getPalette('formacao-azul')` em vez de literais — garante que o CMS futuro e as páginas atuais ficam sincronizados. Zero mudança visual.

## Fora de escopo

- Construir o CMS/dropdown em si (esse plano só entrega o backend de paletas que ele vai consumir).
- Mexer em tokens do `index.css`/`tailwind.config.ts` (essas paletas são por-landing, não globais).
- Tocar Samkhya/Akasha/Doshas existentes — só catalogamos as paletas que já usam.

## Pergunta antes de implementar

Topa essa estrutura (registry `.ts` + doc `landing-palettes.md` separado, referenciado do `lovable-instructions.md`), ou prefere que tudo vire uma seção dentro do próprio `lovable-instructions.md`?