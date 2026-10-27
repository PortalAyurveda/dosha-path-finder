import type { AvaliacaoLista } from "./terapiaAvaliacao";
export interface ConsultaPaciente { id: string; inicio: string; status: string }
export interface NotaPaciente { id: string; texto: string; em: string; consulta_id: string | null }
export interface PontoAtencao { slug: string; nome: string; completo: boolean; marcou: string[]; total: number; anda_junto: string[] | string | null }
export interface TestePaciente { data: string; idade: number | null; cidade: string | null; estado: string | null; vata: number | null; pitta: number | null; kapha: number | null; agni: string | null; queixas: Record<string, string | string[] | null>; alimentos: Record<string, string | string[] | null>; relato: string | null; objetivo1: string | null; objetivo2: string | null }
export interface EvolucaoPaciente { data: string; vata: number | null; pitta: number | null; kapha: number | null }
export interface LigacaoResumo { slug: string; nome: string; completo: boolean; marcou: (string | { queixa: string; dosha: 'vata' | 'pitta' | 'kapha' })[]; faltam: string[]; total: number; anda_junto: string[] | string | null; anda_junto_itens: { item: string; tem: boolean | null }[] }
export interface ResumoAreas { composicao: Record<'vata' | 'pitta' | 'kapha', { total: number; perguntas: number; queixas: number; alimentacao: number }>; areas: { area: string; de: number; qtd: number; marcou: { queixa: string; dosha: 'vata' | 'pitta' | 'kapha' }[] }[]; alimentacao: { vata: string[]; pitta: string[]; kapha: string[]; de_cada: number }; agni: { tipo: string; nivel: number | null; texto: string; irregular: number; forte: number; fraco: number }; ligacoes: LigacaoResumo[]; queixas_total: number; queixas_de: number }
export interface FichaPaciente { avaliacoes?: AvaliacaoLista[]; paciente_id: string; nome: string; ligado_em: string; origem: string; permissoes: { teste: boolean; fotos: boolean; rotina: boolean; akasha: boolean }; teste?: TestePaciente | null; pontos_atencao?: PontoAtencao[]; resumo_areas?: ResumoAreas | null; evolucao?: EvolucaoPaciente[]; notas: NotaPaciente[]; consultas: ConsultaPaciente[]; akasha?: { data: string; titulo: string; resumo: string }[] }
export interface NascimentoPaciente { data: string; hora: string | null; cidade: string | null; uf: string | null; local_exterior: string | null; hora_conhecida?:boolean; municipio_ibge?:number|null; latitude?:number|null; longitude?:number|null; fuso?:string|null }
export interface FotoPaciente { id: string; tipo?: string; titulo?: string; bucket: string; path: string; criado_em: string }
export interface FotosPaciente { permitido: boolean; guiadas?: { chave: string; titulo: string }[]; fotos?: FotoPaciente[]; lingua?: FotoPaciente[] }
export interface RotinaPaciente { permitido: boolean; horarios?: { slot: string; nome: string; dias: number; feitos: number; itens: { titulo: string | null }[] }[] }
export interface HorarioPaciente { inicio: string; fim: string }
export function proximaConsulta(consultas: ConsultaPaciente[], agora: number) {
  return consultas.filter(c => c.status === 'marcada' && Date.parse(c.inicio) >= agora).sort((a,b) => Date.parse(a.inicio)-Date.parse(b.inicio))[0];
}
export function salaPacienteAberta(consulta: ConsultaPaciente, agora: number) { return agora >= Date.parse(consulta.inicio) - 10 * 60 * 1000; }
export function textosMarcados(grupos: Record<string, string | string[] | null> | undefined) {
  return [...new Set(Object.values(grupos ?? {}).flatMap(v => Array.isArray(v) ? v : (v ?? '').split(',')).map(v => v.trim()).filter(Boolean))];
}
export function marcadosPorDosha(grupos: TestePaciente['queixas'] | undefined) {
  return (['vata', 'pitta', 'kapha'] as const).flatMap(dosha => textosMarcados({ [dosha]: grupos?.[dosha] ?? null }).map(texto => ({ dosha, texto })));
}
/** Dosha com mais alimentos marcados no "Come muito" (empate: Vata, Pitta, Kapha). */
export function doshaMaisAlimentos(alimentacao: ResumoAreas['alimentacao']) {
  return (['vata', 'pitta', 'kapha'] as const).reduce((m, d) => (alimentacao[d] ?? []).length > (alimentacao[m] ?? []).length ? d : m, 'vata' as const);
}
/** Frase de resumo do cartão "Teste de dosha": queixas, área principal, agni e alimentação. */
export function fraseResumoAreas(r: ResumoAreas) {
  const partes: string[] = [];
  if (r.queixas_total > 0 && r.areas.length) partes.push(`Marcou ${r.queixas_total} de ${r.queixas_de} queixas, a maioria em ${r.areas[0].area} (${r.areas[0].qtd}).`);
  partes.push(`Agni ${r.agni.tipo}.`);
  const d = doshaMaisAlimentos(r.alimentacao);
  const lista = (r.alimentacao[d] ?? []).map(a => a.toLowerCase());
  if (lista.length) partes.push(`Come muito ${lista.length > 1 ? `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}` : lista[0]}.`);
  return partes.join(' ');
}
/** Dosha de maior total na composição dos pontos. */
export function maiorDoshaComposicao(composicao: ResumoAreas['composicao']) {
  return (['vata', 'pitta', 'kapha'] as const).reduce((m, d) => (composicao[d]?.total ?? 0) > (composicao[m]?.total ?? 0) ? d : m, 'vata' as const);
}
export function guiadasEnviadas(dados: FotosPaciente) { return (dados.guiadas ?? []).filter(g => dados.fotos?.some(f => f.tipo === g.chave)).length; }
export function fotoRecente(fotos: FotoPaciente[], tipo: string) { return fotos.filter(f => f.tipo === tipo).sort((a,b) => Date.parse(b.criado_em)-Date.parse(a.criado_em))[0]; }
export function rotinaEmDia(feitos: number) { return feitos >= 5; }
export const FOTO_EXPIRA_SEGUNDOS = 3600;