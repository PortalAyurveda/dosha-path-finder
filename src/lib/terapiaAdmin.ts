import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type ValorCMS = null | string | number | boolean | ValorCMS[] | { [key: string]: ValorCMS };
export type ConfigCMS = Record<string, ValorCMS>;
export interface Participante { id:string; nome:string; slug:string; status:string; premium:boolean; em_atendimento:boolean; no_sistema:boolean; termo_aceito_em:string|null; online:boolean; valor_consulta:number|null; pacientes:number; consultas_marcadas:number; consultas_realizadas:number }
export interface ConsultaAdmin { id:string; inicio:string; terapeuta:string; paciente:string; status:string; motivo:string|null; presenca:{minutos_juntos:number; eventos:{papel:string;evento:string;em:string}[]}|null; avaliacao:{nota:number}|null }
export interface AvaliacaoAdmin { consulta_id:string; criado_em:string; terapeuta:string; paciente:string; nota:number; comentario:string|null; publicar:boolean }
export interface SugestaoAdmin { id:string; tipo:string; terapeuta:string; titulo:string; resumo:string; conteudo:ConfigCMS; vata:number; pitta:number; kapha:number; serve_para:string[]; revisao:string }
async function read<T>(request:PromiseLike<{data:unknown;error:{message:string}|null}>) { const {data,error}=await request; if(error)throw new Error(error.message); return data as T; }
export const terapiaAdmin = {
  participantes:()=>read<Participante[]>(supabase.rpc('admin_terapia_terapeutas')),
  consultas:(dias=30)=>read<ConsultaAdmin[]>(supabase.rpc('admin_terapia_consultas',{p_dias:dias})),
  participar:(id:string,ligar:boolean)=>read<void>(supabase.rpc('admin_terapia_no_sistema',{p_terapeuta:id,p_ligar:ligar})),
  sugestoes:()=>read<SugestaoAdmin[]>(supabase.rpc('admin_acervo_sugestoes')),
  revisar:(id:string,decisao:'aprovado'|'recusado')=>read<void>(supabase.rpc('admin_acervo_revisar',{p_id:id,p_decisao:decisao})),
  avaliacoes:()=>read<AvaliacaoAdmin[]>(supabase.rpc('admin_avaliacoes',{p_limite:200})),
  publicar:(id:string,publicar:boolean)=>read<void>(supabase.rpc('admin_avaliacao_publicar',{p_consulta:id,p_publicar:publicar})),
  config:()=>read<ConfigCMS>(supabase.rpc('terapia_config_publica')),
  salvar:(chave:string,valor:ValorCMS)=>read<void>(supabase.rpc('terapia_config_salvar',{p_chave:chave,p_valor:valor as Json})),
};
export function numerosAdmin(p:Participante[],consultas:ConsultaAdmin[]) { return { terapeutas:p.length,premium:p.filter(t=>t.premium===true).length,participando:p.filter(t=>t.em_atendimento===true).length,online:p.filter(t=>t.online===true).length,pacientes:p.reduce((n,t)=>n+t.pacientes,0),consultas:consultas.length }; }
export function comentariosPendentes(a:AvaliacaoAdmin[]) { return a.filter(x=>!!x.comentario?.trim()&&!x.publicar).length; }
export function objetoCMS(v:ValorCMS|undefined):v is ConfigCMS { return !!v&&typeof v==='object'&&!Array.isArray(v); }
export function vazioCMS(v:ValorCMS):ValorCMS { if(Array.isArray(v))return []; if(objetoCMS(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,vazioCMS(x)])); return typeof v==='boolean'?false:typeof v==='number'?0:typeof v==='string'?'':null; }
export function moverCMS(lista:ValorCMS[],de:number,para:number) { const nova=[...lista]; if(para<0||para>=nova.length)return nova; const [item]=nova.splice(de,1);nova.splice(para,0,item);return nova; }
export function gruposCMS(config:ConfigCMS) {
  const rotulos=objetoCMS(config.cms_rotulos)?config.cms_rotulos:{};
  return Object.entries(config).filter(([k])=>!k.startsWith('ficha_')).map(([chave,valor])=>{const r=rotulos[chave]; const label=objetoCMS(r)?r:{};return {chave,valor,grupo:typeof label.grupo==='string'?label.grupo:'Outros',nome:typeof label.nome==='string'?label.nome:chave,ajuda:typeof label.ajuda==='string'?label.ajuda:''};});
}
export function imagemCMS(v:string) { try {const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&(/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(u.pathname+u.search)||u.pathname.includes('/storage/v1/object/')||u.hostname==='static.wixstatic.com');}catch{return false;} }