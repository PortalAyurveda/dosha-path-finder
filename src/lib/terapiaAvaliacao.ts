import type { TestePaciente } from './terapiaPaciente';
import { textosMarcados } from './terapiaPaciente';
export const SETORES = [['dosha','Dosha'],['sintomas','Sintomas'],['agni','Agni e Ama'],['dhatus','Dhatus'],['malas','3 excreções'],['subdoshas','15 subdoshas'],['fotos','Fotos']] as const;
export type SetorNucleo = typeof SETORES[number][0];
export type Setor = SetorNucleo | 'mente' | 'lingua' | 'unhas' | 'olhos' | 'pulso' | 'etapa' | 'conversa' | 'tarot' | 'aniversario' | 'mapa' | 'anotacoes' | `custom:${string}`;
export const DOSHAS = ['V','P','K'] as const;
export type Dosha = typeof DOSHAS[number];
export const NOMES = { V:'Vata', P:'Pitta', K:'Kapha' };
export const COR = { V:'bg-vata/20 text-foreground border-vata', P:'bg-pitta/20 text-foreground border-pitta', K:'bg-kapha/20 text-foreground border-kapha' };
export interface ItemClinico { id: string; nome: string; texto?: string; sugestao?: Dosha[]; setor: Setor; subdosha?: string; foto?: string; x?: number; y?: number }
export interface Marca extends ItemClinico { V:number; P:number; K:number; Vm:number; Pm:number; Km:number; marcado:boolean; nota:string }
export interface DadosAvaliacao { versao:1; marcas:Record<string,Marca>; notas:Partial<Record<Setor,string>>; agni:Record<string,number>; ama:Record<Dosha,number>; [key:string]: unknown }
export interface Leitura { V:number; P:number; K:number; [key:string]:unknown }
export interface Avaliacao { mostrar_pessoa?:boolean; mostrada_em?:string|null; id:string; paciente_id:string; paciente_nome:string; consulta_id:string|null; consulta_inicio:string|null; dados:Partial<DadosAvaliacao>; leitura:Partial<Leitura>|null; resumo:string|null; criado_em:string; atualizado_em:string }
export interface AvaliacaoLista { id:string; consulta_id:string|null; leitura:Partial<Leitura>|null; resumo:string|null; criado_em:string; atualizado_em:string }
export interface Conhecimento { id?:string; nome:string; texto?:string; sugestao?: unknown }
export interface Biblioteca { sintomas?:ItemClinico[]; especificacoes?:ItemClinico[]; [key:string]:unknown }
export interface Dhatu { n:string; t:string; f:string; up:string; ml:string; boa:string; exc:string; def:string }
export interface Subdosha { n:string; loc:string; d:Dosha; V:string; P:string; K:string }
export interface ConteudoFicha { SIST:Record<string,Partial<Record<Dosha,string[]>>>; SINT:Record<string,{sug?:{d:Dosha;s:string}[]}>; DEF:Record<string,string>; COMUNS:string[]; DHATUS:Dhatu[]; SD_ROWS:string[][]; SD:Record<string,Subdosha>; MALAS:string[][]; AGNIS:[string,string,string,Dosha|null][]; AMA:Record<Dosha,string>; GUNAS?:string[][]; MANAS?:string[][]; PURUS?:string[][]; ENERG?:string[][]; LINGUA?:[string,Dosha|null,string][]; UNHAS?:Record<Dosha,string>; UNHAS_ACH?:string[]; OLHOS?:string[][]; OLHOS_ACH?:string[]; PULSO?:[string,Dosha][]; GPARES?:string[][]; ETAPAS?:string[]; CONVERSA?:string[]; TIRAGENS?:{nome:string;posicoes:string[]}[] }
export const AUTOSAVE_MS=2000;
export const proximoNivel=(n:number)=>(n+1)%4;
export function nivel(n:unknown) { return typeof n==='number' && Number.isFinite(n) ? Math.max(0,Math.min(3,Math.round(n))) : 0; }
export function novaMarca(item:ItemClinico):Marca { return {...item,V:0,P:0,K:0,Vm:0,Pm:0,Km:0,marcado:false,nota:''}; }
export function marcada(m:Marca) { return m.marcado || !!m.nota || [m.V,m.P,m.K,m.Vm,m.Pm,m.Km].some(n=>n>0); }
/** Abre o objeto único da avaliação. A avaliação nova nasce vazia: nada do teste entra marcado. */
export function iniciarDados(dados:Partial<DadosAvaliacao>|null|undefined,_teste?:TestePaciente|null,_conteudo?:ConteudoFicha):DadosAvaliacao {
 return {...dados,versao:1,marcas:dados?.marcas??{},notas:dados?.notas??{},agni:dados?.agni??{},ama:{V:0,P:0,K:0,...dados?.ama}};
}
/** Sintomas do teste como sugestão para a terapeuta confirmar, com o dosha de cada um e se já está confirmado. */
export function sugestoesDoTeste(teste:TestePaciente|null|undefined,dados:DadosAvaliacao):{nome:string;dosha:Dosha|null;confirmado:boolean}[] {
 const q=(teste?.queixas??{}) as Record<string,unknown>;
 const lista=(v:unknown)=>textosMarcados(v as never);
 const vistos=new Set<string>();const out:{nome:string;dosha:Dosha|null;confirmado:boolean}[]=[];
 ([['vata','V'],['pitta','P'],['kapha','K']] as const).forEach(([k,d])=>lista(q[k]).forEach(nome=>{if(vistos.has(nome))return;vistos.add(nome);out.push({nome,dosha:d,confirmado:!!dados.marcas[`sintoma:${nome}`]&&marcada(dados.marcas[`sintoma:${nome}`])});}));
 lista(teste?.queixas).forEach(nome=>{if(vistos.has(nome))return;vistos.add(nome);out.push({nome,dosha:null,confirmado:!!dados.marcas[`sintoma:${nome}`]&&marcada(dados.marcas[`sintoma:${nome}`])});});
 return out;
}
/** As 3 etapas da avaliação e os setores de cada uma. */
export const ETAPAS=[{id:'observar',nome:'Observar',sub:'Língua, unhas, olhos, pulso'},{id:'conversar',nome:'Conversar',sub:'Os sintomas que você confirma'},{id:'concluir',nome:'Concluir',sub:'Leitura V P K e resumo'}] as const;
export type Etapa=typeof ETAPAS[number]['id']|'aprofundar';
export const OBSERVAR=[['lingua','Língua'],['unhas','Unhas'],['olhos','Olhos'],['pulso','Pulso'],['fotos','Fotos']] as const;
export const APROFUNDAR=[['agni','Agni e Ama'],['dhatus','Dhatus'],['malas','3 excreções'],['subdoshas','15 subdoshas'],['mente','Mente e espírito'],['etapa','Etapa da doença'],['conversa','Perguntas da conversa'],['tarot','Tarot Zen'],['aniversario','Dia do aniversário'],['mapa','Mapa astral'],['anotacoes','Anotações']] as const;
export function etapaDoSetor(s:Setor):Etapa{if(OBSERVAR.some(([id])=>id===s))return 'observar';if(s==='sintomas')return 'conversar';if(s==='dosha')return 'concluir';return 'aprofundar';}
/** Quantas marcações há numa etapa (Observar conta língua, unhas, olhos, pulso e pontos nas fotos). */
export function contagemEtapa(etapa:Etapa,dados:DadosAvaliacao,leitura:Leitura):number{
 if(etapa==='concluir')return DOSHAS.filter(d=>nivel(leitura[d])>0).length;
 const setores:string[]=etapa==='observar'?OBSERVAR.map(([id])=>id):etapa==='conversar'?['sintomas']:[];
 return Object.values(dados.marcas).filter(m=>setores.includes(m.setor)&&marcada(m)).length;
}
export function somas(dados:DadosAvaliacao,conteudo:ConteudoFicha) {
 const soma={V:0,P:0,K:0};
 Object.values(dados.marcas).forEach(m=>DOSHAS.forEach(d=>{soma[d]+=m[d]-m[`${d}m`];}));
 conteudo.AGNIS.forEach(([id,,,d])=>{if(d) soma[d]+=dados.agni[id]??0;});
 return soma;
}
export function sugestoes(valor:unknown):Dosha[] {
 if(!valor) return [];
 const texto=JSON.stringify(valor).toLowerCase();
 return DOSHAS.filter(d=>texto.includes(`"${d.toLowerCase()}"`)||texto.includes(NOMES[d].toLowerCase()));
}
export function sintoma(nome:string,c:ConteudoFicha,texto?:string,sugestao?:unknown):ItemClinico { return {id:`sintoma:${nome}`,nome,setor:'sintomas',texto:texto||c.DEF[nome],sugestao:c.SINT[nome]?.sug?.map(s=>s.d)??sugestoes(sugestao)}; }
export function especificacoes(chave:string,sd:Subdosha):ItemClinico[] { return DOSHAS.flatMap(d=>sd[d].split(';').map(n=>n.trim()).filter(Boolean).map(nome=>({id:`sd:${chave}:${d}:${nome}`,nome,texto:nome,setor:'subdoshas' as const,subdosha:chave,sugestao:[d]}))); }
export function coordenada(v:number) { return Math.max(0,Math.min(1,v)); }
/** Nível 0–3 que a soma das marcações sugere (a terapeuta decide): proporcional ao maior dos três. */
export function sugereNivel(soma:number,maior:number):number { if(soma<=0)return 0; return Math.min(3,Math.max(1,Math.round(soma/Math.max(maior,1)*3))); }
/** Situação da avaliação para a linha de contexto: concluída quando há leitura de dosha. */
export function situacaoAvaliacao(a:Pick<Avaliacao,'leitura'>) {
 return a.leitura&&DOSHAS.some(d=>nivel(a.leitura?.[d])>0)?'Avaliação concluída':'Avaliação em andamento';
}
/** Quantas queixas marcadas pertencem a um sistema (Digestivo, Respiratório…). */
export function marcadosNoSistema(dados:DadosAvaliacao,ds:Partial<Record<Dosha,string[]>>) {
 const nomes=new Set(DOSHAS.flatMap(d=>ds[d]??[]));
 return Object.values(dados.marcas).filter(m=>m.setor==='sintomas'&&marcada(m)&&nomes.has(m.nome)).length;
}
