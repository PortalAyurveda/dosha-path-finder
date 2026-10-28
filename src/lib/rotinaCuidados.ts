/** Helpers do cartão "Seus cuidados de hoje" da Minha Rotina (Parte 30). */

/** "Dormir antes das 22h — Vata piora…" vira título + linha pequena. */
export function partesCuidado(texto: string, extra?: string | null): { titulo: string; sub: string } {
  const i = texto.indexOf(" — ");
  if (i > 0) return { titulo: texto.slice(0, i).trim(), sub: texto.slice(i + 3).trim() };
  return { titulo: texto.trim(), sub: (extra ?? "").trim() };
}

/** Referência gravada em rotina_pontos: "diaN:chave" (N = 1 seg … 7 dom). */
export const refCuidado = (dow: number, chave: string) => `dia${dow}:${chave}`;

/** Dia da semana (1 seg … 7 dom) de AAAA-MM-DD. */
export function dowISO(dia: string) { const d = new Date(`${dia}T12:00:00`).getDay(); return d === 0 ? 7 : d; }
/** Semana do mês (1–4; dias 29+ = 5), igual à do cardápio. */
export const semanaISO = (dia: string) => Math.min(5, Math.ceil(Number(dia.slice(8)) / 7));

/** Tipos de marcação que o cartão lê; "deslize" antigo não é mais usado. */
export type TipoCuidado = "acerto_rotina" | "acerto_habito" | "evitei";
export interface PontoCuidado { data: string; tipo: string; referencia: string | null }
export const marcado = (pontos: PontoCuidado[], dia: string, tipo: TipoCuidado, ref: string) =>
  pontos.some(p => p.data === dia && p.tipo === tipo && p.referencia === ref);

/** Data longa do cabeçalho: "terça, 27 de outubro". */
export function dataCuidados(dia: string) {
  const d = new Date(`${dia}T12:00:00`);
  const semana = d.toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "");
  return `${semana}, ${d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}`;
}

/** Até 3 dias atrás (AAAA-MM-DD) a partir de hoje. */
export function tresDiasAtras(hoje: string) {
  const d = new Date(`${hoje}T12:00:00`); d.setDate(d.getDate() - 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
