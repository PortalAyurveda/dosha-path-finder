import { supabase } from '@/integrations/supabase/client';
import { iniciarIndicacoes, type DadosIndicacoes } from './terapiaIndicacoes';
export interface ModeloIndicacoes {id:string;nome:string;descricao?:string|null;dosha?:string|null;tags?:string[];serve_para?:string[];duracao_dias?:number|null;itens:number;usos:number;do_portal?:boolean;tratamento?:string|null;dados?:Partial<DadosIndicacoes>}
export type ModeloGravar = Pick<ModeloIndicacoes,'nome'|'descricao'|'dosha'|'tags'|'serve_para'|'duracao_dias'|'tratamento'|'dados'> & {id?:string};
export interface ComecosFolha {ultima:{id:string;data:string;itens:number}|null;modelos:ModeloIndicacoes[]}
const rpc = supabase.rpc.bind(supabase) as unknown as (n:string,p?:Record<string,unknown>)=>PromiseLike<{data:unknown;error:{message:string}|null}>;
async function read<T>(n:string,p?:Record<string,unknown>):Promise<T>{const {data,error}=await rpc(n,p);if(error)throw new Error(error.message);return data as T;}
export const modelosTerapia={
 comecos:(paciente:string)=>read<ComecosFolha>('terapia_folha_comecos',{p_paciente:paciente}),
 novaDe:(paciente:string,modelo:string|null,origem:string|null,avaliacao?:string,consulta?:string)=>read<string>('terapia_folha_nova_de',{p_paciente:paciente,p_modelo:modelo,p_folha_origem:origem,p_avaliacao:avaliacao??null,p_consulta:consulta??null}),
 lista:()=>read<ModeloIndicacoes[]>('terapia_modelos'),
 modelo:(id:string)=>read<ModeloIndicacoes>('terapia_modelo',{p_id:id}),
 gravar:(p:ModeloGravar)=>read<string>('terapia_modelo_gravar',{p}),
 copiar:(id:string)=>read<string>('terapia_modelo_copiar',{p_id:id}),
 salvar:(folha:string,nome:string)=>read<string>('terapia_modelo_salvar',{p_folha:folha,p_nome:nome}),
 apagar:(id:string)=>read<void>('terapia_modelo_apagar',{p_id:id}),
};
export function juntarModelo(atual:DadosIndicacoes,modelo:Partial<DadosIndicacoes>,novoId:()=>string=()=>crypto.randomUUID()):DadosIndicacoes{
 const secoes={...atual.secoes};
 for(const [secao,itens]of Object.entries(iniciarIndicacoes(modelo).secoes)){
  const lista=[...(secoes[secao]??[])];
  for(const item of itens){if(lista.some(i=>(!!item.slug&&i.slug===item.slug)||(!!item.link&&i.link===item.link)))continue;lista.push({...item,id:novoId()});}
  secoes[secao]=lista;
 }
 return {...atual,secoes};
}
export function filtrarModelos(lista:ModeloIndicacoes[],busca:string,dosha:string){return lista.filter(m=>(!dosha||m.dosha?.toLowerCase().split(/[^a-z]+/).includes(dosha.toLowerCase()))&&`${m.nome} ${m.tags?.join(' ')??''}`.toLowerCase().includes(busca.toLowerCase()));}
/** Dosha principal (primeira palavra) em minúsculas. */
export const doshaPrincipal=(d?:string|null)=>(d??'').toLowerCase().match(/vata|pitta|kapha/)?.[0]??'';
/** Folhas prontas: as que combinam com o dosha principal do teste vêm primeiro. */
export function ordenarPorTeste(lista:ModeloIndicacoes[],dosha?:string|null,sintomas:string[]=[]){const d=doshaPrincipal(dosha);const combina=(m:ModeloIndicacoes)=>(!!d&&doshaPrincipal(m.dosha)===d)||(m.serve_para??[]).some(s=>sintomas.some(q=>q.trim().toLowerCase()===s.trim().toLowerCase()));return lista.map(m=>({...m,combina:combina(m)})).sort((a,b)=>Number(b.combina)-Number(a.combina));}
