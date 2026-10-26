import { marcada, novaMarca, DOSHAS, NOMES, SETORES } from './terapiaAvaliacao';
import type { DadosAvaliacao, ItemClinico, Setor, ConteudoFicha } from './terapiaAvaliacao';
export const ADICOES = [['mente','Mente e espírito'],['lingua','Língua'],['unhas','Unhas'],['olhos','Olhos'],['pulso','Pulso'],['etapa','Etapa da doença'],['conversa','Perguntas da conversa'],['tarot','Tarot Zen'],['aniversario','Dia do aniversário'],['mapa','Mapa astral']] as const;
export interface Adicao { id:Setor; nome:string; itens?:ItemClinico[] }
export interface Carta { numero:number; nome:string; grupo?:string; foto_path:string; texto_carta?:string; comentario?:string }
export interface Posicao { titulo:string; carta?:Carta; nota:string }
export interface Modelo { nome:string; posicoes:string[] }
export interface Extras { adicoes:Adicao[]; conversa:Record<string,string>; etapa?:string; tarot:Posicao[]; mapa?:{modo:'tradicional'|'vedico'; linhas:{nome:string;valor:string}[]}; aniversario?:Record<string,unknown> }
export function extras(d:DadosAvaliacao):Extras { return {adicoes:[],conversa:{},tarot:[],...(d.extras as Partial<Extras>??{})}; }
export function removerAdicao(d:DadosAvaliacao,id:Setor):DadosAvaliacao { const e=extras(d);const novo={...e,adicoes:e.adicoes.filter(a=>a.id!==id)};if(id==='tarot')novo.tarot=[];if(id==='conversa')novo.conversa={};if(id==='etapa')delete novo.etapa;if(id==='mapa')delete novo.mapa;if(id==='aniversario')delete novo.aniversario;const notas={...d.notas};delete notas[id];return {...d,extras:novo,notas,marcas:Object.fromEntries(Object.entries(d.marcas).filter(([,m])=>m.setor!==id))}; }
export function posicoes(t:Posicao[],n:number):Posicao[] { return Array.from({length:Math.max(1,Math.min(5,n))},(_,i)=>t[i]??{titulo:`Posição ${i+1}`,nota:''}); }
export function cartaAoAcaso(cartas:Carta[],tiragem:Posicao[],random=Math.random):Carta|undefined { const livres=cartas.filter(c=>!tiragem.some(p=>p.carta?.numero===c.numero));return livres[Math.floor(random()*livres.length)]; }
export function gruposClinicos(setor:Setor,c:ConteudoFicha):{nome:string;itens:ItemClinico[]}[] {
 const make=(nome:string,texto?:string,d?:string):ItemClinico=>({id:`${setor}:${nome}`,nome,texto:texto||c.DEF[nome],setor,sugestao:DOSHAS.includes(d as never)?[d as 'V'|'P'|'K']:undefined});
 const pares=(nome:string,rows:string[][]=[])=>({nome,itens:rows.map(([n,t])=>make(n,t))});
 const sinais=(nome:string,rows:string[]=[])=>({nome,itens:rows.map(n=>make(n))});
 if(setor==='mente')return [pares('Gunas',c.GUNAS),pares('Aspectos da mente',c.MANAS),pares('Propósitos · Purusharthas',c.PURUS),pares('Energias sutis',c.ENERG)];
 if(setor==='lingua')return [{nome:'Sinais da língua',itens:(c.LINGUA??[]).map(([n,d])=>make(n,undefined,d??undefined))}];
 if(setor==='unhas')return [{nome:'Características',itens:DOSHAS.map(d=>make(c.UNHAS?.[d]??NOMES[d],undefined,d))},sinais('Achados',c.UNHAS_ACH)];
 if(setor==='olhos')return [...(c.OLHOS??[]).map(([n,...ds])=>({nome:n,itens:DOSHAS.map((d,i)=>make(`${n}: ${ds[i]}`,ds[i],d))})),sinais('Achados',c.OLHOS_ACH)];
 if(setor==='pulso')return [{nome:'Movimento',itens:(c.PULSO??[]).map(([n,d])=>make(n,undefined,d))},...(c.GPARES??[]).map(r=>sinais(r.join(' / '),r))];
 return [];
}
export function linhasFolha(d:DadosAvaliacao,c:ConteudoFicha) {
 const e=extras(d);const setores:[Setor,string][]=[...SETORES,...e.adicoes.map(a=>[a.id,a.nome] as [Setor,string])];
 return setores.map(([id,nome])=>{const linhas=Object.values(d.marcas).filter(m=>m.setor===id&&marcada(m)).map(m=>`${m.nome}${DOSHAS.flatMap(k=>[m[k]?`${k}+${m[k]}`:'',m[`${k}m`]?`${k}−${m[`${k}m`]}`:'']).filter(Boolean).length?' · '+DOSHAS.flatMap(k=>[m[k]?`${k}+${m[k]}`:'',m[`${k}m`]?`${k}−${m[`${k}m`]}`:'']).filter(Boolean).join(' · '):''}${m.nota?'\n'+m.nota:''}`);
 if(id==='agni'){c.AGNIS.forEach(([key,n])=>{if(d.agni[key])linhas.push(`${n}: ${d.agni[key]}`)});DOSHAS.forEach(k=>{if(d.ama[k])linhas.push(`Ama ${NOMES[k]}: ${d.ama[k]}`)});}
 if(id==='conversa')Object.entries(e.conversa).forEach(([q,r])=>{if(r.trim())linhas.push(`${q}\n${r}`)});
 if(id==='etapa'&&e.etapa)linhas.push(e.etapa);
 if(id==='tarot')e.tarot.forEach(p=>{if(p.carta)linhas.push(`${p.titulo}: ${p.carta.numero} · ${p.carta.nome}\n${p.carta.texto_carta??''}\n${p.carta.comentario??''}${p.nota?'\n'+p.nota:''}`)});
 if(id==='aniversario'&&e.aniversario)Object.entries(e.aniversario).forEach(([,v])=>{if(typeof v==='string'&&v.trim())linhas.push(v);if(Array.isArray(v)&&v.length)linhas.push(v.join(' · '));});
 if(id==='mapa'&&e.mapa)linhas.push(e.mapa.modo==='vedico'?'Védico · Lahiri':'Tradicional',...e.mapa.linhas.map(l=>`${l.nome}: ${l.valor}`));
 if(d.notas[id]?.trim())linhas.push(d.notas[id] as string);return {id,nome,linhas};}).filter(s=>s.linhas.length);
}
export { novaMarca };
