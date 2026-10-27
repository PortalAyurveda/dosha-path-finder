import { supabase } from '@/integrations/supabase/client';
import type { MeuTerapeutaLigacao, FotosMinhas } from './terapiaMeu';
import type { TestePaciente } from './terapiaPaciente';
export interface ConsultaMinha {id:string;inicio:string;fim:string;status:string;terapeuta_id:string;tipo:string;nota:number|null;folha_enviada:boolean;avaliacao_id:string|null}
export const ABAS_ACOMPANHAMENTO = [['inicio','Início'],['indicacoes','Indicações'],['consultas','Consultas'],['avaliacao','Minha avaliação'],['evolucao','Minha evolução'],['fotos','Fotos'],['conversa','Conversa']] as const;
export type AbaAcompanhamento = typeof ABAS_ACOMPANHAMENTO[number][0];
export interface AvaliacaoMinha {
  teste?: Pick<TestePaciente, 'queixas' | 'alimentos'> | null;
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
const zonaAcompanhamento='America/Sao_Paulo';
export function horaAcompanhamento(valor:string) {
  const data=new Date(valor);if(Number.isNaN(data.getTime()))return 'sem hora';
  const partes=new Intl.DateTimeFormat('pt-BR',{hour:'numeric',minute:'2-digit',hourCycle:'h23',timeZone:zonaAcompanhamento}).formatToParts(data);
  const h=partes.find(p=>p.type==='hour')?.value??'0';const m=partes.find(p=>p.type==='minute')?.value??'00';
  return `${Number(h)}h${m==='00'?'':m}`;
}
export function dataAcompanhamento(valor:string,comHora=false) {
  const data=new Date(valor.length===10?`${valor}T12:00:00-03:00`:valor);if(Number.isNaN(data.getTime()))return 'sem data';
  const texto=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long',timeZone:zonaAcompanhamento}).format(data).replace('-feira','').toLowerCase();
  return `${texto}${comHora?`, às ${horaAcompanhamento(valor)}`:''}`;
}
export function desdeAcompanhamento(valor:string) {const data=new Date(valor);return Number.isNaN(data.getTime())?'sem data':data.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:zonaAcompanhamento});}
/** Endereços antigos (?aba=) rolam até o bloco certo da página única. */
export function blocoDaAba(aba:string|null):string|null {
  const m:Record<string,string>={conversa:'ac-conversa',indicacoes:'ac-seu-dia',consultas:'ac-consultas',avaliacao:'ac-consultas',fotos:'ac-mandou',evolucao:'ac-mandou',inicio:'ac-topo'};
  return aba?m[aba]??null:null;
}
const TERMOS:[RegExp,string][]=[[/\bagni\b/i,'a força da digestão'],[/\bama\b/i,'resíduos que a digestão não terminou'],[/\bupadhatu\b/i,'tecidos de apoio do corpo'],[/\bdhatus?\b/i,'os tecidos do corpo'],[/\bmalas?\b/i,'o que o corpo elimina']];
/** Junta uma explicação simples ao lado de palavras técnicas (ex.: "Agni irregular (agni: a força da digestão)"). */
export function explicarTermo(texto:string) {
  const t=TERMOS.find(([r])=>r.test(texto));
  if(!t)return texto;
  const palavra=texto.match(t[0])![0].toLowerCase();
  return `${texto} (${palavra}: ${t[1]})`;
}
/** "26/10 · avaliação e folha" */
export function linhaConsultaMinha(c:Pick<ConsultaMinha,'inicio'|'folha_enviada'|'status'>,temAvaliacao:boolean) {
  const partes=[temAvaliacao?'avaliação':null,c.folha_enviada?'folha':null].filter(Boolean) as string[];
  const oque=c.status==='cancelada'?'cancelada':partes.length?partes.join(' e '):'consulta';
  return `${desdeAcompanhamento(c.inicio)} · ${oque}`;
}
const icsData=(v:string)=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
/** Arquivo de calendário (.ics) para a próxima consulta. */
export function icsConsulta(p:{id:string;inicio:string;fim:string},nome:string,url:string) {
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Portal Ayurveda//PT','BEGIN:VEVENT',`UID:${p.id}@portalayurveda.com`,`DTSTAMP:${icsData(new Date().toISOString())}`,`DTSTART:${icsData(p.inicio)}`,`DTEND:${icsData(p.fim)}`,`SUMMARY:Consulta com ${nome}`,`DESCRIPTION:Por vídeo, aqui no Portal: ${url}`,`URL:${url}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
export const COMO_FUNCIONA_CHAVE='ac-como-funciona-visto';
