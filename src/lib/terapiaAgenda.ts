import { supabase } from '@/integrations/supabase/client';
import { minutos, type Regra } from './terapia';
export interface HorarioAgenda { inicio:string; fim:string; origem:'fixo'|'extra'|'avulso'; estado:'livre'|'fechado'|'extra'|'marcado'|'passado'; consulta:{id:string;paciente_id:string;nome:string;motivo:string|null;primeira:boolean}|null }
export interface DiaAgenda {dia:string;fechado:boolean;motivo:string|null;horarios:HorarioAgenda[]}
export interface SemanaAgenda {inicio:string;fim:string;tem_molde:boolean;dias:DiaAgenda[]}
const rpc = supabase.rpc.bind(supabase) as unknown as (n:string,p?:Record<string,unknown>)=>PromiseLike<{data:unknown;error:{message:string}|null}>;
async function read<T>(n:string,p?:Record<string,unknown>):Promise<T>{const {data,error}=await rpc(n,p);if(error)throw new Error(error.message);return data as T;}
export const agendaTerapia={
 semana:(inicio?:string)=>read<SemanaAgenda>('terapia_agenda_semana',{p_inicio:inicio??null}),
 horario:(inicio:string,fim:string,abrir:boolean)=>read<{ok:boolean;consulta?:{id:string;nome:string}}>('terapia_horario',{p_inicio:inicio,p_fim:fim,p_abrir:abrir}),
 dia:(dia:string,abrir:boolean,motivo:string)=>read<{ok:boolean;consultas_no_dia?:number}>('terapia_dia',{p_dia:dia,p_abrir:abrir,p_motivo:motivo||null}),
 remarcar:(consulta:string,inicio:string)=>read<unknown>('consulta_remarcar',{p_consulta:consulta,p_inicio:inicio}),
 cancelar:(consulta:string)=>read<void>('acomp_cancelar',{p_consulta:consulta}),
};
/** One confirmed day operation; strictly sequential cancellations, deduplicated. */
export async function cancelarConsultasDoDia(dia:DiaAgenda,cancelar:(id:string)=>Promise<unknown>=agendaTerapia.cancelar){
 const ids=[...new Set(dia.horarios.flatMap(h=>h.consulta?[h.consulta.id]:[]))];
 for(const id of ids)await cancelar(id);
}
export function horariosNoMolde(regras:Regra[],duracao:number,intervalo:number){if(duracao<=0||intervalo<0)return 0;return regras.reduce((n,r)=>n+Math.max(0,Math.floor((minutos(r.fim)-minutos(r.inicio)+intervalo)/(duracao+intervalo))),0);}
export function horarioExtra(dia:string,hora:string,duracao:number){const inicio=new Date(`${dia}T${hora}:00-03:00`);return {inicio:inicio.toISOString(),fim:new Date(inicio.getTime()+duracao*60000).toISOString()};}