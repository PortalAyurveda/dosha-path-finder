import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export const TIPOS_PERGUNTA = { texto_curto: 'Texto curto', texto_longo: 'Texto longo', escolha: 'Escolher uma', varias: 'Escolher várias', lista: 'Lista', escala: 'Escala', sim_nao: 'Sim ou não', data: 'Data' } as const;
export type TipoPergunta = keyof typeof TIPOS_PERGUNTA;
export const CAMPOS_PONTOS = ['v', 'p', 'k', 'agni_irregular', 'agni_forte', 'agni_fraco'] as const;
export type PontosFormulario = Partial<Record<typeof CAMPOS_PONTOS[number], number>>;
export interface OpcaoFormulario { id: string; label: string; pontos?: PontosFormulario }
export interface PerguntaFormulario { id: string; secao: string; tipo: TipoPergunta; texto: string; ajuda?: string; obrigatoria?: boolean; opcoes?: OpcaoFormulario[]; escala?: { min: number; max: number; rotulo_min: string; rotulo_max: string } }
export interface SecaoFormulario { id: string; titulo: string }
export interface Formulario { id?: string; nome: string; abertura: string; secoes: SecaoFormulario[]; perguntas: PerguntaFormulario[]; pontua: boolean; mostrar_resultado: boolean; envio_primeira: boolean; envio_retorno: boolean; origem: string; do_portal?: boolean }
export interface FormularioLista { id: string; nome: string; do_portal: boolean; origem: string; perguntas: number; secoes: number; pontua: boolean; envio_primeira: boolean; envio_retorno: boolean; enviados: number; respondidos: number; atualizado_em: string }
export type RespostaFormulario = string | string[] | number;
export type RespostasFormulario = Record<string, RespostaFormulario>;
export interface SomaFormulario extends PontosFormulario { vata?: number; pitta?: number; kapha?: number }
export interface ResultadoFormulario extends SomaFormulario { total?: SomaFormulario; secoes?: { id?: string; secao?: string; titulo?: string; soma?: SomaFormulario; pontos?: SomaFormulario; v?: number; p?: number; k?: number; vata?: number; pitta?: number; kapha?: number; agni_irregular?: number; agni_forte?: number; agni_fraco?: number }[] }
export interface EnvioFormulario { id: string; formulario_id?: string; formulario?: string; nome: string; terapeuta?: string | { id?: string; nome: string }; terapeuta_id?: string; enviado_em: string; respondido_em?: string | null; perguntas: PerguntaFormulario[]; secoes?: SecaoFormulario[]; respostas?: RespostasFormulario; resultado?: ResultadoFormulario | null; pontua?: boolean; consulta_id?: string }
export interface FormularioMeuLista { id: string; nome: string; terapeuta: string | { id?: string; nome: string }; terapeuta_id?: string; enviado_em: string; respondido_em: string | null; perguntas: number; respondidas: number }
export interface FormularioMeu extends Omit<Formulario, 'id'> { id: string; respostas: RespostasFormulario; resultado?: ResultadoFormulario | null; terapeuta?: string | { nome: string }; respondido_em?: string | null }
export interface ImportacaoFormulario { nome: string; abertura: string; secoes: SecaoFormulario[]; perguntas: PerguntaFormulario[]; avisos: string[] }
const rpc = async <T>(nome: string, params?: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.rpc(nome as any, params as any);
  if (error) throw new Error(error.message);
  return data as T;
};
export const formularios = {
  lista: () => rpc<FormularioLista[]>('terapia_formularios'),
  obter: (id: string) => rpc<Formulario>('terapia_formulario', { p_id: id }),
  salvar: (p: Formulario) => rpc<string>('terapia_formulario_salvar', { p: p as unknown as Json }),
  copiar: (id: string) => rpc<string>('terapia_formulario_copiar', { p_id: id }),
  apagar: (id: string) => rpc<void>('terapia_formulario_apagar', { p_id: id }),
  enviar: (formulario: string, paciente: string, consulta?: string) => rpc<string>('terapia_formulario_enviar', { p_formulario: formulario, p_paciente: paciente, ...(consulta ? { p_consulta: consulta } : {}) }),
  envios: (paciente: string) => rpc<EnvioFormulario[]>('terapia_formulario_envios', { p_paciente: paciente }),
  meus: () => rpc<FormularioMeuLista[]>('formularios_meus'),
  meu: (id: string) => rpc<FormularioMeu>('formulario_meu', { p_envio: id }),
  responder: (id: string, respostas: RespostasFormulario, final: boolean) => rpc<unknown>('formulario_responder', { p_envio: id, p_respostas: respostas, p_final: final }),
  importar: async (url: string): Promise<ImportacaoFormulario> => {
    const { data, error } = await supabase.functions.invoke('formulario-importar-google', { body: { url } });
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const text = await error.context.text();
        try { const parsed = JSON.parse(text); throw new Error(parsed.erro ?? parsed.error ?? text); } catch (e) { if (e instanceof SyntaxError) throw new Error(text); throw e; }
      }
      throw error;
    }
    if (data?.erro) throw new Error(data.erro);
    if (!data?.perguntas || !data?.secoes) throw new Error('Não foi possível ler o formulário.');
    return data as ImportacaoFormulario;
  },
};
export const novoFormulario = (): Formulario => ({ nome: '', abertura: '', secoes: [{ id: crypto.randomUUID(), titulo: 'Seção 1' }], perguntas: [], pontua: false, mostrar_resultado: false, envio_primeira: false, envio_retorno: false, origem: 'portal' });
export const novaPergunta = (secao: string): PerguntaFormulario => ({ id: crypto.randomUUID(), secao, texto: '', tipo: 'texto_curto', obrigatoria: false });
export const temOpcoes = (tipo: TipoPergunta) => ['escolha', 'varias', 'lista', 'sim_nao'].includes(tipo);
export function mudarTipo(pergunta: PerguntaFormulario, tipo: TipoPergunta): PerguntaFormulario {
  return { ...pergunta, tipo, ...(tipo === 'sim_nao' ? { opcoes: [{ id: 'sim', label: 'Sim' }, { id: 'nao', label: 'Não' }] } : temOpcoes(tipo) ? { opcoes: pergunta.opcoes ?? [] } : {}), ...(tipo === 'escala' ? { escala: pergunta.escala ?? { min: 0, max: 10, rotulo_min: '', rotulo_max: '' } } : {}) };
}
export const limitarPonto = (n: number) => Math.max(0, Math.min(3, Math.round(Number.isFinite(n) ? n : 0)));
export const minutosFormulario = (perguntas: number) => Math.max(1, Math.ceil(perguntas / 3));
export const nomeTerapeutaFormulario = (t: FormularioMeuLista['terapeuta'] | undefined) => typeof t === 'string' ? t : t?.nome ?? 'Seu terapeuta';
export function temResposta(v: RespostaFormulario | undefined) { return typeof v === 'number' ? Number.isFinite(v) : Array.isArray(v) ? v.length > 0 : !!v?.trim(); }
export function obrigatoriasFaltando(perguntas: PerguntaFormulario[], respostas: RespostasFormulario) { return perguntas.filter(p => p.obrigatoria && !temResposta(respostas[p.id])); }
export function textoResposta(p: PerguntaFormulario, r: RespostaFormulario | undefined) {
  if (r === undefined) return 'Não respondeu';
  const label = (id: string) => p.opcoes?.find(o => o.id === id)?.label ?? id;
  return Array.isArray(r) ? r.map(label).join(', ') : typeof r === 'number' ? String(r) : temOpcoes(p.tipo) ? label(r) : r;
}
export function moverPergunta(perguntas: PerguntaFormulario[], id: string, secao: string, antes?: string) {
  const atual = perguntas.find(p => p.id === id); if (!atual || id === antes) return perguntas;
  const resto = perguntas.filter(p => p.id !== id); const pos = antes ? resto.findIndex(p => p.id === antes) : -1;
  resto.splice(pos < 0 ? resto.length : pos, 0, { ...atual, secao }); return resto;
}
export function consultaNosProximosDoisDias(inicio: string, agora: number) { const t = Date.parse(inicio); return t >= agora && t <= agora + 2 * 86400000; }
/** Serializa snapshots inteiros; falhas ficam visíveis e uma nova tentativa pode reenviar o último estado. */
export function filaRespostas(salvar: (r: RespostasFormulario, final: boolean) => Promise<unknown>) {
  let fila: Promise<unknown> = Promise.resolve();
  return (r: RespostasFormulario, final = false) => { const snapshot = structuredClone(r); const atual = fila.catch(() => undefined).then(() => salvar(snapshot, final)); fila = atual; return atual; };
}