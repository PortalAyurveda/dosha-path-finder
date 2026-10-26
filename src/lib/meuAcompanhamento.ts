import { supabase } from '@/integrations/supabase/client';
import type { MeuTerapeutaLigacao, FotosMinhas } from './terapiaMeu';
export interface ConsultaMinha {id:string;inicio:string;fim:string;status:string;terapeuta_id:string;tipo:string;nota:number|null;folha_enviada:boolean;avaliacao_id:string|null}
export const ABAS_ACOMPANHAMENTO = [['inicio','Início'],['indicacoes','Indicações'],['consultas','Consultas'],['avaliacao','Minha avaliação'],['evolucao','Minha evolução'],['fotos','Fotos'],['conversa','Conversa']] as const;
export type AbaAcompanhamento = typeof ABAS_ACOMPANHAMENTO[number][0];
export interface AvaliacaoMinha {
  id:string; data:string; mostrada_em:string; terapeuta:{nome:string;primeiro_nome:string;imagem:string|null;slug:string};
  leitura:Partial<Record<'V'|'P'|'K',number>>|null; ama:Partial<Record<'V'|'P'|'K',number>>|null; resumo:string|null;
  marcas:{chave:string;setor:string;V:number;P:number;K:number;Vm?:number;Pm?:number;Km?:number;nome?:string}[];
  quadros:{id:string;imagem_path:string;item:string}[];
}
export const acompanhamento = {
  consultas:async():Promise<ConsultaMinha[]>=>{const {data,error}=await supabase.rpc('minhas_consultas_acompanhamento' as never);if(error)throw new Error(error.message);return (data??[]) as unknown as ConsultaMinha[];},
  avaliacoes:async():Promise<AvaliacaoMinha[]>=>{const {data,error}=await supabase.rpc('minhas_avaliacoes' as never);if(error)throw new Error(error.message);return (data??[]) as unknown as AvaliacaoMinha[];},
  mostrar:async(id:string,mostrar:boolean):Promise<{id:string;mostrar_pessoa:boolean;mostrada_em:string|null}>=>{const {data,error}=await supabase.rpc('terapia_avaliacao_mostrar' as never,{p_id:id,p_mostrar:mostrar} as never);if(error)throw new Error(error.message);return data as unknown as {id:string;mostrar_pessoa:boolean;mostrada_em:string|null};},
};
export function abaValida(valor:string|null):AbaAcompanhamento {return ABAS_ACOMPANHAMENTO.find(([k])=>k===valor)?.[0]??'inicio';}
export const temAcompanhamento=(logado:boolean,anonimo:boolean,ligacoes:MeuTerapeutaLigacao[])=>logado&&!anonimo&&ligacoes.length>0;
export function nomeMarca(chave:string) {
  const partes=chave.split(':');
  const ultimo=partes.at(-1)??chave;
  const nomes:Record<string,string>={f:'Função normal',up:'Upadhatu',ml:'Mala',sama:'Agni equilibrado',vishama:'Agni irregular',tikshna:'Agni forte',manda:'Agni baixo'};
  const texto=nomes[ultimo]??ultimo.replace(/[_-]/g,' ');
  return texto.charAt(0).toUpperCase()+texto.slice(1);
}
export function pendencias(l:MeuTerapeutaLigacao,fotos?:FotosMinhas,consultas:ConsultaMinha[]=[]) {
  // The photo RPC exposes the therapist's first name rather than her ID.
  const pedidos=(fotos?.pedidos??[]).filter(p=>!p.terapeuta||p.terapeuta===l.terapeuta.primeiro_nome);
  const folhas=l.folhas.filter(f=>!f.vista_em);
  const avaliar=consultas.filter(c=>c.terapeuta_id===l.terapeuta.id&&c.status==='realizada'&&c.nota==null);
  return {pedidos,folhas,avaliar,total:pedidos.length+folhas.length+avaliar.length};
}
export const avaliacoesDa=(lista:AvaliacaoMinha[],slug:string)=>lista.filter(a=>a.terapeuta.slug===slug);