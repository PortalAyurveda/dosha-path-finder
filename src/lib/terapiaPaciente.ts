export interface ConsultaPaciente { id: string; inicio: string; status: string }
export interface NotaPaciente { id: string; texto: string; em: string; consulta_id: string | null }
export interface PontoAtencao { slug: string; nome: string; completo: boolean; marcou: string[]; total: number; anda_junto: string[] | string | null }
export interface TestePaciente { data: string; idade: number | null; cidade: string | null; estado: string | null; vata: number | null; pitta: number | null; kapha: number | null; agni: string | null; queixas: Record<string, string | string[] | null>; alimentos: Record<string, string | string[] | null>; relato: string | null; objetivo1: string | null; objetivo2: string | null }
export interface EvolucaoPaciente { data: string; vata: number | null; pitta: number | null; kapha: number | null }
export interface FichaPaciente { paciente_id: string; nome: string; ligado_em: string; origem: string; permissoes: { teste: boolean; fotos: boolean; rotina: boolean; akasha: boolean }; teste?: TestePaciente | null; pontos_atencao?: PontoAtencao[]; evolucao?: EvolucaoPaciente[]; notas: NotaPaciente[]; consultas: ConsultaPaciente[]; akasha?: { data: string; titulo: string; resumo: string }[] }
export interface NascimentoPaciente { data: string; hora: string | null; cidade: string | null; uf: string | null; local_exterior: string | null }
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
export function guiadasEnviadas(dados: FotosPaciente) { return (dados.guiadas ?? []).filter(g => dados.fotos?.some(f => f.tipo === g.chave)).length; }
export function fotoRecente(fotos: FotoPaciente[], tipo: string) { return fotos.filter(f => f.tipo === tipo).sort((a,b) => Date.parse(b.criado_em)-Date.parse(a.criado_em))[0]; }
export function rotinaEmDia(feitos: number) { return feitos >= 5; }
export const FOTO_EXPIRA_SEGUNDOS = 3600;