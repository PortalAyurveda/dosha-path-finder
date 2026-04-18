/* Design tokens compartilhados entre as páginas /metricas */
export const C = {
  primary: "#352F54",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#4ADE80",
  accent: "#FACC15",
  bg: "#FAF8F4",
  card: "#ffffff",
  border: "#EDE8F5",
  muted: "#7C7189",
  akasha: "#9b73ad",
  graficos: "#0EA5E9",
};

export const SERIF = "'Roboto Serif', serif";
export const SANS = "'DM Sans', sans-serif";
export const LEAF = "24px 4px 24px 4px";

export const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v.toFixed(1).replace(".", ",")}%`;
export const fmtN = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("pt-BR");
export const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
