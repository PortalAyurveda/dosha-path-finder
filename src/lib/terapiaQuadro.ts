import type { ConteudoFicha,ItemClinico } from './terapiaAvaliacao';
import type { FotoPaciente,FotosPaciente } from './terapiaPaciente';
export const QUADRO_MAX_PX=1600;
export const CORES_QUADRO=['foreground','secondary','muted-foreground','background'] as const;
export type CorQuadro=typeof CORES_QUADRO[number];
export interface BaseQuadro { chave:string; nome:string; texto?:string; url?:string; foto?:FotoPaciente; clinico?:ItemClinico }
export interface TracoQuadro { tipo:'pincel'|'texto'; cor:CorQuadro; pontos:{x:number;y:number}[]; texto?:string }
export interface EstadoQuadro { base:BaseQuadro; desenhos:TracoQuadro[] }
export interface QuadroSalvo { id:string; item:string; imagem_path:string|null; tracos:EstadoQuadro|TracoQuadro[]; mostrar_paciente:boolean; criado_em:string; atualizado_em:string }
export function tamanhoQuadro(w:number,h:number) { const escala=Math.min(1,QUADRO_MAX_PX/Math.max(w,h));return {width:Math.round(w*escala),height:Math.round(h*escala)}; }
export function fotosDoQuadro(d:FotosPaciente):FotoPaciente[] { if(!d.permitido)return [];return [...(d.fotos??[]),...(d.lingua??[])].filter((f,i,a)=>a.findIndex(x=>x.id===f.id)===i); }
export function bibliotecaQuadro(c:ConteudoFicha):BaseQuadro[] { return [...c.DHATUS.map(d=>({chave:`dhatu:${d.n}`,nome:d.n,texto:[d.t,`Função normal: ${d.f}`,`Upadhatu: ${d.up}`,`Mala: ${d.ml}`].join('\n\n'),clinico:{id:`dhatu:${d.n}:f`,nome:d.n,texto:d.f,setor:'dhatus' as const}})),...Object.entries(c.SD).map(([id,d])=>({chave:`subdosha:${id}`,nome:d.n,texto:[d.loc,d.V,d.P,d.K].join('\n\n'),clinico:{id:`subdosha:${id}`,nome:d.n,texto:d.loc,setor:'subdoshas' as const,sugestao:[d.d]}})),...Object.entries(c.DEF).map(([nome,texto])=>({chave:`sintoma:${nome}`,nome,texto,clinico:{id:`sintoma:${nome}`,nome,texto,setor:'sintomas' as const}}))]; }