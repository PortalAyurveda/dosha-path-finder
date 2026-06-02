/**
 * Landing Palettes Registry
 * ------------------------------------------------------------------
 * Single source-of-truth para paletas de landing pages / anúncios /
 * eventos do Portal Ayurveda. Consumido por:
 *   - Páginas em src/pages/curso/*  (via CourseBranding)
 *   - Futuro CMS de landing pages (dropdown de tema)
 *
 * Regra: NUNCA hard-code hex novo em landing page. Adicione aqui
 * primeiro e referencie via getPalette(key).
 *
 * Ver: landing-palettes.md (raiz do projeto)
 */

import type { CourseBranding } from "./courses/courseTypes";

export type LandingPaletteKey =
  | "portal-natural"
  | "alimentacao-verde"
  | "remedios-salmao"
  | "diagnostico-alaranjado"
  | "formacao-azul"
  | "samkhya-roxo-ouro"
  | "akasha-roxo"
  | "vata-azul"
  | "pitta-salmao"
  | "kapha-verde";

export type LandingPaletteTheme = "light" | "warm" | "dark";

export interface LandingPalette {
  key: LandingPaletteKey;
  label: string;
  description: string;
  /** Tom de fundo dominante — ajuda na preview do CMS. */
  theme: LandingPaletteTheme;
  /** Swatch curto (3 cores) p/ render no dropdown. */
  swatch: [string, string, string];
  branding: CourseBranding;
}

const PORTAL_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-portal.svg";

export const LANDING_PALETTES: LandingPalette[] = [
  {
    key: "portal-natural",
    label: "Portal Natural",
    description: "Paleta institucional do Portal Ayurveda. Roxo profundo + amarelo açafrão.",
    theme: "light",
    swatch: ["#352F54", "#FACC15", "#FF7676"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#352F54",
      darkColor: "#1F1A38",
      lightColor: "#E8E4F2",
      accentColor: "#FACC15",
      warmBg: "#FFF8EE",
    },
  },
  {
    key: "alimentacao-verde",
    label: "Alimentação (Verde)",
    description: "Curso e aulas de Alimentação Ayurveda. Verde folha sobre creme.",
    theme: "warm",
    swatch: ["#A6D98F", "#CFEDC2", "#5E8F4A"],
    branding: {
      logo: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-alimentacao-extenso.svg",
      primaryColor: "#CFEDC2",
      darkColor: "#A6D98F",
      lightColor: "#CFEDC2",
      accentColor: "#A6D98F",
      warmBg: "#FAF9F6",
    },
  },
  {
    key: "remedios-salmao",
    label: "Remédios Caseiros (Salmão)",
    description: "Conteúdo de remédios caseiros, fitoterapia e cuidados domésticos.",
    theme: "warm",
    swatch: ["#FF7676", "#FFD0D0", "#B84A4A"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#FF7676",
      darkColor: "#B84A4A",
      lightColor: "#FFE0E0",
      accentColor: "#FFD0D0",
      warmBg: "#FFF6F4",
    },
  },
  {
    key: "diagnostico-alaranjado",
    label: "Diagnóstico (Alaranjado)",
    description: "Teste de Dosha, diagnóstico e avaliação biométrica.",
    theme: "warm",
    swatch: ["#F59E42", "#FFE3B8", "#A85A1A"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#F59E42",
      darkColor: "#A85A1A",
      lightColor: "#FFE3B8",
      accentColor: "#FACC15",
      warmBg: "#FFF8EE",
    },
  },
  {
    key: "formacao-azul",
    label: "Formação (Azul/Lilás)",
    description: "Formação profissionalizante em Ayurveda e cursos longos.",
    theme: "light",
    swatch: ["#6B7FF2", "#E0E7FF", "#352F54"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#6B7FF2",
      darkColor: "#352F54",
      lightColor: "#E0E7FF",
      accentColor: "#FCA5A5",
      warmBg: "#F6F7FF",
    },
  },
  {
    key: "samkhya-roxo-ouro",
    label: "Samkhya (Roxo/Ouro)",
    description: "Loja Samkhya, produtos físicos e kits.",
    theme: "warm",
    swatch: ["#7b4963", "#C8922A", "#FAF8F5"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#7b4963",
      darkColor: "#5c3249",
      lightColor: "#F3EAF0",
      accentColor: "#C8922A",
      warmBg: "#FAF8F5",
    },
  },
  {
    key: "akasha-roxo",
    label: "Akasha (Roxo místico)",
    description: "Akasha IA, Registros Akashikos e conteúdo místico.",
    theme: "light",
    swatch: ["#9b73ad", "#E6D6F0", "#5E3F70"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#9b73ad",
      darkColor: "#5E3F70",
      lightColor: "#E6D6F0",
      accentColor: "#FACC15",
      warmBg: "#FAF6FB",
    },
  },
  {
    key: "vata-azul",
    label: "Dosha Vata (Azul)",
    description: "Páginas e landings específicas do dosha Vata.",
    theme: "light",
    swatch: ["#6B8AFF", "#D6E0FF", "#2A4BCC"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#6B8AFF",
      darkColor: "#2A4BCC",
      lightColor: "#D6E0FF",
      accentColor: "#FACC15",
      warmBg: "#F4F7FF",
    },
  },
  {
    key: "pitta-salmao",
    label: "Dosha Pitta (Salmão)",
    description: "Páginas e landings específicas do dosha Pitta.",
    theme: "warm",
    swatch: ["#FF7676", "#FFE0E0", "#CC3333"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#FF7676",
      darkColor: "#CC3333",
      lightColor: "#FFE0E0",
      accentColor: "#FACC15",
      warmBg: "#FFF6F4",
    },
  },
  {
    key: "kapha-verde",
    label: "Dosha Kapha (Verde escuro)",
    description: "Páginas e landings específicas do dosha Kapha.",
    theme: "light",
    swatch: ["#9ED88B", "#D1F4E0", "#15803D"],
    branding: {
      logo: PORTAL_LOGO,
      primaryColor: "#9ED88B",
      darkColor: "#15803D",
      lightColor: "#D1F4E0",
      accentColor: "#FACC15",
      warmBg: "#F5FBF3",
    },
  },
];

const PALETTE_MAP: Record<LandingPaletteKey, LandingPalette> = LANDING_PALETTES.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<LandingPaletteKey, LandingPalette>,
);

export function getPalette(key: LandingPaletteKey): LandingPalette {
  return PALETTE_MAP[key];
}

export function getPaletteBranding(key: LandingPaletteKey): CourseBranding {
  return PALETTE_MAP[key].branding;
}

/** Opções formatadas para popular um <Select /> no CMS. */
export const landingPaletteOptions = LANDING_PALETTES.map((p) => ({
  value: p.key,
  label: p.label,
  description: p.description,
  swatch: p.swatch,
}));
