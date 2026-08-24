// Samkhya Loja — design tokens (kept inline so the loja can evolve independently
// of the main portal's design system without breaking shared components).
// Identidade 2026: roxo profundo + laranja + creme. O roxo/ouro antigo
// (#581C50 / #8F3B00) foi aposentado.
export const samkhyaTokens = {
  // Roxo profundo — barra do menu, títulos, logo
  roxo: "#581C50",
  roxoDark: "#3F1339",
  roxoLight: "#F1E6EF",
  // Laranja — destaques, preços, botões primários
  ouro: "#C75100",
  ouroDark: "#9E4100",
  // Variante escurecida para TEXTO pequeno — passa AA sobre branco/creme.
  ouroText: "#8F3B00",
  // Ouro / selos / linha GOLD
  gold: "#D9933D",
  goldDark: "#A96C22",
  goldText: "#8B5A16",
  // Rosa de apoio (tags, kits, avisos suaves)
  rosa: "#B55474",
  rosaLight: "#F6E7EC",
  // Fundos
  fundo: "#E0DCAF",
  cardBg: "#FFFFFF",
  cardBorder: "#C9C494",
  // Texto
  texto: "#384026",
  textoSec: "#5F674E",
  goldBadge: "#8B5A16",
  footerTexto: "#F5F0E8",
  // Tipografia
  fonteTitulo: "'Acid Green', Georgia, 'Times New Roman', serif",
  fonteCorpo: "'Brandon Grotesque', 'DM Sans', Helvetica, Arial, sans-serif",
} as const;
