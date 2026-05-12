// Conversão score-bruto -> nível 1..15 e zona/sub-nível para a aba Métricas.

export type Zona = "Pouco" | "Normal" | "Acúmulo" | "Adoecido" | "Fixado";

export interface NivelInfo {
  level: number; // 1..15
  zona: Zona;
  sub: 1 | 2 | 3;
}

const ZONA_BY_LEVEL: Zona[] = [
  "Pouco","Pouco","Pouco",
  "Normal","Normal","Normal",
  "Acúmulo","Acúmulo","Acúmulo",
  "Adoecido","Adoecido","Adoecido",
  "Fixado","Fixado","Fixado",
];

const infoFromLevel = (level: number): NivelInfo => {
  const l = Math.max(1, Math.min(15, level));
  const zona = ZONA_BY_LEVEL[l - 1];
  const sub = (((l - 1) % 3) + 1) as 1 | 2 | 3;
  return { level: l, zona, sub };
};

export function vataToLevel(s: number): NivelInfo {
  if (s <= 5) return infoFromLevel(1);
  if (s <= 10) return infoFromLevel(2);
  if (s <= 16) return infoFromLevel(3);
  if (s <= 19) return infoFromLevel(4);
  if (s <= 22) return infoFromLevel(5);
  if (s <= 24) return infoFromLevel(6);
  if (s <= 28) return infoFromLevel(7);
  if (s <= 32) return infoFromLevel(8);
  if (s <= 35) return infoFromLevel(9);
  if (s <= 40) return infoFromLevel(10);
  if (s <= 45) return infoFromLevel(11);
  if (s <= 49) return infoFromLevel(12);
  if (s <= 59) return infoFromLevel(13);
  if (s <= 69) return infoFromLevel(14);
  return infoFromLevel(15);
}

export function pittaToLevel(s: number): NivelInfo {
  if (s <= 6) return infoFromLevel(1);
  if (s <= 12) return infoFromLevel(2);
  if (s <= 19) return infoFromLevel(3);
  if (s <= 23) return infoFromLevel(4);
  if (s <= 27) return infoFromLevel(5);
  if (s <= 30) return infoFromLevel(6);
  if (s <= 33) return infoFromLevel(7);
  if (s <= 37) return infoFromLevel(8);
  if (s <= 40) return infoFromLevel(9);
  if (s <= 43) return infoFromLevel(10);
  if (s <= 46) return infoFromLevel(11);
  if (s <= 49) return infoFromLevel(12);
  if (s <= 59) return infoFromLevel(13);
  if (s <= 69) return infoFromLevel(14);
  return infoFromLevel(15);
}

export function kaphaToLevel(s: number): NivelInfo {
  if (s <= 4) return infoFromLevel(1);
  if (s <= 9) return infoFromLevel(2);
  if (s <= 14) return infoFromLevel(3);
  if (s <= 21) return infoFromLevel(4);
  if (s <= 28) return infoFromLevel(5);
  if (s <= 35) return infoFromLevel(6);
  if (s <= 40) return infoFromLevel(7);
  if (s <= 45) return infoFromLevel(8);
  if (s <= 50) return infoFromLevel(9);
  if (s <= 53) return infoFromLevel(10);
  if (s <= 56) return infoFromLevel(11);
  if (s <= 59) return infoFromLevel(12);
  if (s <= 69) return infoFromLevel(13);
  if (s <= 79) return infoFromLevel(14);
  return infoFromLevel(15);
}

// agni_nivel_atual / meta: 0=bom, 1=iniciando, 2=moderado, 3=agravado
export function agniToLevel(n: number): NivelInfo {
  const map: Record<number, number> = { 0: 5, 1: 8, 2: 11, 3: 14 };
  return infoFromLevel(map[n] ?? 5);
}

export function scoreToLevel(
  dosha: "vata" | "pitta" | "kapha",
  s: number,
): NivelInfo {
  if (dosha === "vata") return vataToLevel(s);
  if (dosha === "pitta") return pittaToLevel(s);
  return kaphaToLevel(s);
}

// Cores das zonas (HSL strings prontas para usar em fill/stroke)
export const ZONE_COLORS: Record<Zona, string> = {
  "Pouco":    "hsl(220 15% 70%)",
  "Normal":   "hsl(150 45% 65%)",
  "Acúmulo":  "hsl(45 90% 65%)",
  "Adoecido": "hsl(20 85% 65%)",
  "Fixado":   "hsl(0 70% 55%)",
};

export const ZONE_BANDS: Array<{ from: number; to: number; zona: Zona; sub: 1 | 2 | 3 }> = [
  { from: 0.5, to: 1.5,  zona: "Pouco", sub: 1 },
  { from: 1.5, to: 2.5,  zona: "Pouco", sub: 2 },
  { from: 2.5, to: 3.5,  zona: "Pouco", sub: 3 },
  { from: 3.5, to: 4.5,  zona: "Normal", sub: 1 },
  { from: 4.5, to: 5.5,  zona: "Normal", sub: 2 },
  { from: 5.5, to: 6.5,  zona: "Normal", sub: 3 },
  { from: 6.5, to: 7.5,  zona: "Acúmulo", sub: 1 },
  { from: 7.5, to: 8.5,  zona: "Acúmulo", sub: 2 },
  { from: 8.5, to: 9.5,  zona: "Acúmulo", sub: 3 },
  { from: 9.5, to: 10.5, zona: "Adoecido", sub: 1 },
  { from: 10.5, to: 11.5,zona: "Adoecido", sub: 2 },
  { from: 11.5, to: 12.5,zona: "Adoecido", sub: 3 },
  { from: 12.5, to: 13.5,zona: "Fixado", sub: 1 },
  { from: 13.5, to: 14.5,zona: "Fixado", sub: 2 },
  { from: 14.5, to: 15.5,zona: "Fixado", sub: 3 },
];

export const ZONE_TICKS = [2, 5, 8, 11, 14];
export const ZONE_TICK_LABELS: Record<number, Zona> = {
  2: "Pouco", 5: "Normal", 8: "Acúmulo", 11: "Adoecido", 14: "Fixado",
};

// Cor & dash do Agni
export function agniStyle(tipo: string | null, nivel: number | null): { color: string; dash: string | undefined } {
  const t = (tipo || "").toLowerCase();
  let color = "hsl(150 40% 45%)";
  if (t === "irregular") color = "hsl(252 35% 45%)";
  else if (t === "forte") color = "hsl(0 75% 60%)";
  else if (t === "fraco") color = "hsl(105 25% 35%)";
  else if (t === "bom") color = "hsl(150 50% 45%)";

  let dash: string | undefined;
  switch (nivel) {
    case 3: dash = "3 6"; break;
    case 2: dash = "5 4"; break;
    case 1: dash = "7 3"; break;
    case 0:
    default: dash = undefined;
  }
  return { color, dash };
}

export const AGNI_LABEL: Record<number, string> = {
  0: "Bom", 1: "Iniciando", 2: "Moderado", 3: "Agravado",
};
