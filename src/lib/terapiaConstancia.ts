import { supabase } from "@/integrations/supabase/client";
import { MOMENTOS, resumoDias } from "./terapiaIndicacoes";

export interface ConstanciaItem { item_id: string; titulo: string; secao: string; dias?: number[] | null; esperados?: number | null; feitos?: number | null; visto_em?: string | null }
export interface ConstanciaPaciente {
  mapa: { dia: string; dow: number; cuidou: boolean }[];
  dias_com_cuidado: number;
  dias_total: number;
  inclui_rotina: boolean;
  folha: { id: string; enviada_em: string; desde: string; dias_desde: number } | null;
  itens: ConstanciaItem[];
}

export async function constanciaPaciente(paciente: string, dias = 30): Promise<ConstanciaPaciente> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("terapia_constancia_paciente", { p_paciente: paciente, p_dias: dias });
  if (error) throw new Error(error.message);
  return data as ConstanciaPaciente;
}

const ddmm = (s: string) => new Date(s.length <= 10 ? `${s}T12:00:00` : s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
export const dataCurta = ddmm;
/** "folha de 24/10 · desde então, 5 dias" */
export function linhaFolha(f: NonNullable<ConstanciaPaciente["folha"]>) {
  const n = f.dias_desde;
  return `folha de ${ddmm(f.enviada_em)} · desde então, ${n} ${n === 1 ? "dia" : "dias"}`;
}
/** "Manhã · todo dia" / "Ao longo do dia · qua, sex e dom" / "Para ler e assistir" */
export function subItem(i: ConstanciaItem) {
  const momento = MOMENTOS.find(m => m.chave === i.secao)?.titulo ?? i.secao;
  if (i.secao === "ler") return momento;
  return `${momento} · ${resumoDias({ dias: i.dias ?? undefined }) || "todo dia"}`;
}
/** "3 de 4 dias" (ou "3 de 4" no celular). */
export function contagemItem(i: ConstanciaItem, curto = false) {
  const e = i.esperados ?? 0, f = i.feitos ?? 0;
  return curto ? `${f} de ${e}` : `${f} de ${e} ${e === 1 ? "dia" : "dias"}`;
}
export const pctItem = (i: ConstanciaItem) => (i.esperados ? Math.min(100, Math.round(((i.feitos ?? 0) / i.esperados) * 100)) : 0);
/** Linha curta para a coluna da ficha: "18 de 30 dias com cuidado". */
export const linhaCurta = (c: ConstanciaPaciente) => `${c.dias_com_cuidado} de ${c.dias_total} dias com cuidado`;
/** Espaços vazios antes do primeiro dia para alinhar o mapa em S T Q Q S S D. */
export const vaziosAntes = (c: ConstanciaPaciente) => (c.mapa[0] ? c.mapa[0].dow - 1 : 0);
