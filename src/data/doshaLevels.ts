export type DoshaNome = "vata" | "pitta" | "kapha";
export type FaixaDosha = "Fixado" | "Adoecido" | "Acúmulo" | "Normal" | "Pouco";

export interface FaixaDoshaConfig {
  min: number;
  max: number;
  label: FaixaDosha;
}

export const VATA_LEVELS: FaixaDoshaConfig[] = [
  { min: 50, max: Infinity, label: "Fixado" },
  { min: 36, max: 49, label: "Adoecido" },
  { min: 25, max: 35, label: "Acúmulo" },
  { min: 17, max: 24, label: "Normal" },
  { min: 0, max: 16, label: "Pouco" },
];

export const PITTA_LEVELS: FaixaDoshaConfig[] = [
  { min: 50, max: Infinity, label: "Fixado" },
  { min: 41, max: 49, label: "Adoecido" },
  { min: 31, max: 40, label: "Acúmulo" },
  { min: 20, max: 30, label: "Normal" },
  { min: 0, max: 19, label: "Pouco" },
];

export const KAPHA_LEVELS: FaixaDoshaConfig[] = [
  { min: 60, max: Infinity, label: "Fixado" },
  { min: 51, max: 59, label: "Adoecido" },
  { min: 36, max: 50, label: "Acúmulo" },
  { min: 15, max: 35, label: "Normal" },
  { min: 0, max: 14, label: "Pouco" },
];

export const DOSHA_LEVELS: Record<DoshaNome, FaixaDoshaConfig[]> = {
  vata: VATA_LEVELS,
  pitta: PITTA_LEVELS,
  kapha: KAPHA_LEVELS,
};

export function getFaixa(dosha: DoshaNome, score: number | null | undefined): FaixaDosha {
  const value = Math.max(0, Number(score) || 0);
  return DOSHA_LEVELS[dosha].find(({ min, max }) => value >= min && value <= max)?.label ?? "Pouco";
}