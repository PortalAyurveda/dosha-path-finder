import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
export interface Mensagem { id:number; autor:'paciente'|'terapeuta'|'sistema'; texto:string; criado_em:string; lida_em:string|null }
export interface Conversa { id:string; nao_lidas:number; ultima_em:string|null; ultima:Pick<Mensagem,'autor'|'texto'|'criado_em'>|null; terapeuta:{id:string;nome:string;primeiro_nome:string;imagem:string|null;slug:string;online:boolean}; paciente:{id:string;nome:string;ligada:boolean} }
export interface ChatTextos {fora?:string;caixa?:string;quer_marcar?:string;nao_paciente?:string;convite_mensagem?:string}
export const CHAT_ABERTA_MS=120000, CHAT_LISTA_MS=120000;
async function read<T>(request:PromiseLike<{data:unknown;error:{message:string}|null}>):Promise<T>{const {data,error}=await request;if(error)throw new Error(error.message);return data as T;}
export const chat={
 abrir:(slug:string)=>read<Conversa>(supabase.rpc('chat_abrir',{p_slug:slug})),
 mensagens:(id:string,antes?:number)=>read<Mensagem[]>(supabase.rpc('chat_mensagens_de',{p_conversa:id,...(antes===undefined?{}:{p_antes:antes})})),
 enviar:(id:string,texto:string)=>read<unknown>(supabase.rpc('chat_enviar',{p_conversa:id,p_texto:texto})),
 ler:(id:string)=>read<void>(supabase.rpc('chat_ler',{p_conversa:id})),
 minhas:()=>read<Conversa[]>(supabase.rpc('chat_minhas')),
 terapeuta:()=>read<Conversa[]>(supabase.rpc('terapia_conversas')),
 naoLidas:()=>read<number>(supabase.rpc('chat_nao_lidas')),
 agenda:(slug:string)=>read<{no_sistema:boolean;horarios?:{inicio:string;fim:string}[]}>(supabase.rpc('terapeuta_agenda_publica',{p_slug:slug,p_dias:14})),
 preferencias:(boas_vindas:string,msg_ausente:string)=>read<void>(supabase.rpc('terapia_preferencias_salvar',{p:{boas_vindas,msg_ausente} as Json})),
};
export function juntarMensagens(...paginas:Mensagem[][]){return [...new Map(paginas.flat().map(m=>[m.id,m])).values()].sort((a,b)=>a.id-b.id);}
export function textoConvite(texto:string,link:string){return texto.split('{link}').join(link);}

export function novaMensagemDaOutra(mensagens:Mensagem[],papel:'paciente'|'terapeuta',ultima?:number){const m=mensagens.filter(x=>x.autor!=='sistema'&&x.autor!==papel).at(-1);return m&&m.id!==ultima?m:undefined;}

const abertas=new Map<string,number>();
/** Registra uma conversa visível na tela; devolve a função que tira o registro. */
export function marcarAberta(id:string){abertas.set(id,(abertas.get(id)??0)+1);return()=>{const n=(abertas.get(id)??1)-1;if(n>0)abertas.set(id,n);else abertas.delete(id);};}
export function estaAberta(id:string){return !document.hidden&&(abertas.get(id)??0)>0;}
export function primeirasPalavras(texto:string,max=80){const t=texto.replace(/\s+/g,' ').trim();return t.length<=max?t:`${t.slice(0,max).replace(/\s+\S*$/,'')}…`;}
export function linkConversa(papel:'paciente'|'terapeuta',c:Pick<Conversa,'id'|'terapeuta'>){return papel==='terapeuta'?`/painel-terapeuta?aba=mensagens&conversa=${c.id}`:`/meu-acompanhamento?aba=conversa&terapeuta=${encodeURIComponent(c.terapeuta.slug)}`;}
