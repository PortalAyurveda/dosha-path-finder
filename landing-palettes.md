# Portal Ayurveda — Paletas de Landing Pages

Catálogo oficial de paletas para landing pages, anúncios e eventos.
Source-of-truth de código: [`src/data/landingPalettes.ts`](src/data/landingPalettes.ts).

## Regra

- Toda landing nova (curso, aula, evento, anúncio) **deve** escolher uma
  paleta deste catálogo via `getPalette('key')`.
- **Não** hard-codar hex novo em página de landing. Se precisar de um
  tema novo, adicione uma entrada em `LANDING_PALETTES` primeiro.
- Os componentes em `src/components/course/*` consomem a interface
  `CourseBranding` (`src/data/courses/courseTypes.ts`) — qualquer paleta
  do catálogo é plug-and-play neles.

## Paletas disponíveis

| Key | Quando usar | Cores principais |
|---|---|---|
| `portal-natural` | Páginas institucionais, eventos genéricos do Portal | Roxo `#352F54` + Amarelo `#FACC15` + Salmão `#FF7676` |
| `alimentacao-verde` | Curso/aula de Alimentação Ayurveda | Verde `#A6D98F` sobre creme `#FAF9F6` |
| `remedios-salmao` | Conteúdo de remédios caseiros, fitoterapia | Salmão `#FF7676` + rosa claro `#FFD0D0` |
| `diagnostico-alaranjado` | Teste de Dosha, diagnóstico, biometria | Laranja `#F59E42` + creme âmbar |
| `formacao-azul` | Formação profissionalizante e cursos longos | Azul/lilás `#6B7FF2` + roxo escuro `#352F54` |
| `samkhya-roxo-ouro` | Loja Samkhya, kits, produtos físicos | Roxo `#7b4963` + ouro `#C8922A` |
| `akasha-roxo` | Akasha IA, Registros Akashikos | Roxo místico `#9b73ad` |
| `vata-azul` | Landing dedicada ao dosha Vata | Azul `#6B8AFF` |
| `pitta-salmao` | Landing dedicada ao dosha Pitta | Salmão `#FF7676` |
| `kapha-verde` | Landing dedicada ao dosha Kapha | Verde escuro `#9ED88B` / `#15803D` |

## Como usar

```ts
import { getPaletteBranding } from "@/data/landingPalettes";
import CourseHero from "@/components/course/CourseHero";

const branding = getPaletteBranding("alimentacao-verde");

<CourseHero data={hero} branding={branding} ... />
```

## Para o CMS (dropdown)

```ts
import { landingPaletteOptions } from "@/data/landingPalettes";
// landingPaletteOptions = [{ value, label, description, swatch: [hex, hex, hex] }, ...]
```

Use `swatch` para renderizar 3 bolinhas coloridas ao lado de cada opção
do dropdown.

## Adicionando uma paleta nova

1. Adicione a `key` ao tipo `LandingPaletteKey`.
2. Adicione o objeto em `LANDING_PALETTES` com `label`, `description`,
   `theme`, `swatch` e `branding` completo.
3. Atualize a tabela acima.
4. Pronto — o dropdown do CMS pega automaticamente.

## Fora deste catálogo

- Tokens globais (`index.css`, `tailwind.config.ts`) — controlam a UI
  geral do app (header, botões shadcn, etc.), não landing pages.
- Doshas dentro de `/meu-dosha` e demais páginas internas — continuam
  usando as variáveis HSL `--vata`, `--pitta`, `--kapha`, `--akasha`.
