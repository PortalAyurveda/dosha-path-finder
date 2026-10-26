import { supabase } from '@/integrations/supabase/client';
import type { FichaPaciente } from './terapiaPaciente';
export const PRESENCA_MS = 60000;
export const ESPERA_SALA_MS = 15000;
export const AO_VIVO_MS = 3000;
export const QUADRO_AO_VIVO_MS = 2000;
export interface SalaConsulta {
  consulta: string; papel: 'paciente'|'terapeuta'; status: string; inicio: string; fim: string;
  abre_em: string; fecha_em: string; codigo: string; paciente_id: string; paciente_nome: string;
  terapeuta: { nome: string; primeiro_nome: string; imagem: string|null; slug?: string };
  avaliacao_id: string|null; presenca: Partial<Record<'paciente'|'terapeuta',string>>|null; ja_avaliou: boolean;
}
export interface AoVivo { gravando: boolean; quadro: { quadro: string; bucket: string; path: string; atualizado_em: string }|null }
export interface VideoEntrada { dominio: string; sala: string; jwt: string; nome: string; papel: string; outro: unknown }
export type EventoVideo = 'entrou'|'pulso'|'saiu'|'outro_entrou'|'outro_saiu';
export interface SalaTreino { titulo: string; texto: string; paciente: { nome: string; teste: { vata: number; pitta: number; kapha: number; dosha: string; agni: string; queixas: string[] } }; fotos: { tipo: string; titulo: string; url: string }[] }
type Resposta = PromiseLike<{data: unknown; error: {message: string}|null}>;
const read = async <T>(request: Resposta):Promise<T> => { const {data,error}=await request; if(error)throw new Error(error.message);return data as T; };
// Nullable p_quadro is supported by the database but not represented by generated Args.
const rpc = supabase.rpc as unknown as (name: string, args: Record<string,unknown>)=>Resposta;
export const sala = {
  consultar: (id:string)=>read<SalaConsulta>(rpc('consulta_sala',{p_consulta:id})),
  aoVivo: (id:string)=>read<AoVivo>(rpc('consulta_ao_vivo',{p_consulta:id})),
  gravando: (id:string,gravando:boolean)=>read<void>(rpc('consulta_gravando',{p_consulta:id,p_gravando:gravando})),
  mostrar: (id:string,quadro:string|null)=>read<void>(rpc('consulta_quadro_mostrar',{p_consulta:id,p_quadro:quadro})),
  avaliar: (id:string,nota:number,comentario:string)=> { if(!Number.isInteger(nota)||nota<1||nota>5) return Promise.reject(new Error('Escolha uma nota de 1 a 5.')); return read<void>(rpc('consulta_avaliar',{p_consulta:id,p_nota:nota,p_comentario:comentario})); },
  entrar: (codigo:string)=>read<VideoEntrada>(supabase.functions.invoke('video-sala',{body:{c:codigo,acao:'entrar'}})),
  evento: (codigo:string,evento:EventoVideo)=>read<void>(supabase.functions.invoke('video-sala',{body:{c:codigo,acao:'evento',evento}})),
};
export function sairBeacon(codigo:string) {
  const url=`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/video-sala`;
  navigator.sendBeacon?.(url,new Blob([JSON.stringify({c:codigo,acao:'evento',evento:'saiu'})],{type:'application/json'}));
}
export function faseSala(s:SalaConsulta,agora:number) { return s.status==='cancelada' ? 'cancelada' : agora>=Date.parse(s.fecha_em) ? 'encerrada' : agora<Date.parse(s.abre_em) ? 'aguarde' : 'aberta'; }
export function presencaRecente(em:string|undefined,agora:number) { return !!em&&agora-Date.parse(em)<2*PRESENCA_MS; }
export function fichaTreino(t:SalaTreino):FichaPaciente {
  return {paciente_id:'treino',nome:t.paciente.nome,ligado_em:'',origem:'treino',permissoes:{teste:true,fotos:true,rotina:false,akasha:false},notas:[],consultas:[],avaliacoes:[],teste:{data:'',idade:null,cidade:null,estado:null,...t.paciente.teste,queixas:{treino:t.paciente.teste.queixas},alimentos:{},relato:null,objetivo1:null,objetivo2:null}};
}