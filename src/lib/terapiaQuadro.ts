import type { ConteudoFicha,ItemClinico } from './terapiaAvaliacao';
import type { FotoPaciente,FotosPaciente } from './terapiaPaciente';
export const QUADRO_MAX_PX=1600;
/** Seis cores do Portal: preto, azul Vata, salmão Pitta, verde Kapha, laranja e roxo. */
export const CORES_QUADRO=['foreground','vata','pitta','kapha','therapist-orange','therapist-purple'] as const;
export const NOMES_CORES:Record<typeof CORES_QUADRO[number],string>={foreground:'Preto',vata:'Azul Vata',pitta:'Salmão Pitta',kapha:'Verde Kapha','therapist-orange':'Laranja','therapist-purple':'Roxo'};
/** Traço fino e grosso, em pixels do quadro de 800 px; traços antigos sem largura usam 5. */
export const TRACOS_QUADRO={fino:4,grosso:10} as const;
/** Cores antigas continuam desenhando quadros já guardados. */
export type CorQuadro=typeof CORES_QUADRO[number]|'destructive'|'accent'|'primary'|'secondary'|'muted-foreground'|'background';
export interface LinhaQuadro { b:string; t?:string; m?:string }
export interface BaseQuadro { chave:string; nome:string; texto?:string; url?:string; foto?:FotoPaciente; clinico?:ItemClinico; linhas?:LinhaQuadro[]; desenho?:'lingua'; subtitulo?:string }
export interface PranchaQuadro { id?:string; titulo:string; subtitulo?:string; fonte?:string; linhas?:(string|string[])[]; texto?:string }
export interface TracoQuadro { tipo:'pincel'|'texto'; cor:CorQuadro; pontos:{x:number;y:number}[]; texto?:string; w?:number }
export interface EstadoQuadro { base:BaseQuadro; desenhos:TracoQuadro[] }
export interface QuadroSalvo { id:string; item:string; imagem_path:string|null; tracos:EstadoQuadro|TracoQuadro[]; mostrar_paciente:boolean; criado_em:string; atualizado_em:string }
export function tamanhoQuadro(w:number,h:number) { const escala=Math.min(1,QUADRO_MAX_PX/Math.max(w,h));return {width:Math.round(w*escala),height:Math.round(h*escala)}; }
export function fotosDoQuadro(d:FotosPaciente):FotoPaciente[] { if(!d.permitido)return [];return [...(d.fotos??[]),...(d.lingua??[])].filter((f,i,a)=>a.findIndex(x=>x.id===f.id)===i); }
export function bibliotecaQuadro(c:ConteudoFicha):BaseQuadro[] { return [...c.DHATUS.map(d=>({chave:`dhatu:${d.n}`,nome:d.n,texto:[d.t,`Função normal: ${d.f}`,`Upadhatu: ${d.up}`,`Mala: ${d.ml}`].join('\n\n'),clinico:{id:`dhatu:${d.n}:f`,nome:d.n,texto:d.f,setor:'dhatus' as const}})),...Object.entries(c.SD).map(([id,d])=>({chave:`subdosha:${id}`,nome:d.n,texto:[d.loc,d.V,d.P,d.K].join('\n\n'),clinico:{id:`subdosha:${id}`,nome:d.n,texto:d.loc,setor:'subdoshas' as const,sugestao:[d.d]}})),...Object.entries(c.DEF).map(([nome,texto])=>({chave:`sintoma:${nome}`,nome,texto,clinico:{id:`sintoma:${nome}`,nome,texto,setor:'sintomas' as const}}))]; }
export const QUADRO_VAZIO:BaseQuadro={chave:'vazio',nome:'Quadro em branco'};
/** Prancha do Portal vira um cartão desenhado no quadro: fonte DHATUS/SD_ROWS/MALAS lê a ficha; "desenho" é o mapa da língua. */
export function basePrancha(p:PranchaQuadro,c:ConteudoFicha):BaseQuadro {
 const chave=`prancha:${p.id??p.titulo}`;const fonte=(p.fonte??'').toUpperCase();
 if(fonte==='DESENHO')return {chave,nome:p.titulo,desenho:'lingua'};
 let linhas:LinhaQuadro[]=[];
 if(fonte==='DHATUS')linhas=c.DHATUS.map(d=>({b:d.n,t:d.t,m:d.f}));
 else if(fonte==='SD_ROWS')linhas=c.SD_ROWS.map(([r,...k])=>({b:k.map(x=>c.SD[x]?.n??x).join(' · '),m:r}));
 else if(fonte==='MALAS')linhas=c.MALAS.map(([n,a,b,k])=>({b:n,t:`V ${a} · P ${b} · K ${k}`}));
 else if(p.linhas)linhas=p.linhas.map(l=>Array.isArray(l)?{b:l[0]??'',t:l[1],m:l[2]}:{b:l});
 return {chave,nome:p.titulo,linhas,texto:p.texto};
}
/** Mapa da língua da referência (viewBox 60×66), com as cores do tema. */
export function svgLingua(tinta:string,traco:string):string { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 0 80 66"><path d="M12 4 C10 30 14 52 30 60 C46 52 50 30 48 4" fill="none" stroke="${tinta}" stroke-width="1.5"/><path d="M30 8 V50 M30 16 L22 8 M30 16 L38 8 M30 40 L22 46 M30 40 L38 46" stroke="${traco}" stroke-width="1" fill="none"/><circle cx="30" cy="54" r="3" fill="none" stroke="${traco}"/><text x="49" y="12" font-size="3.5" font-family="DM Sans, sans-serif" fill="${tinta}">excreção</text><text x="49" y="32" font-size="3.5" font-family="DM Sans, sans-serif" fill="${tinta}">digestão</text><text x="36" y="60" font-size="3.5" font-family="DM Sans, sans-serif" fill="${tinta}">mente</text></svg>`; }

/** Encaixa o item inteiro em 90% das duas dimensões disponíveis. */
export function encaixarQuadro(w:number,h:number,areaW:number,areaH:number){const escala=Math.min(areaW*.9/Math.max(w,1),areaH*.9/Math.max(h,1));return {width:w*escala,height:h*escala};}

/** Histórico de desenhos para Voltar/Avançar: cada passo guarda a lista inteira de traços. */
export interface HistoricoQuadro { passado:TracoQuadro[][]; futuro:TracoQuadro[][] }
export const historicoVazio=():HistoricoQuadro=>({passado:[],futuro:[]});
export function registrar(h:HistoricoQuadro,atual:TracoQuadro[]):HistoricoQuadro{return {passado:[...h.passado,atual].slice(-100),futuro:[]};}
export function desfazer(h:HistoricoQuadro,atual:TracoQuadro[]):{h:HistoricoQuadro;desenhos:TracoQuadro[]}|null{if(!h.passado.length)return null;return {h:{passado:h.passado.slice(0,-1),futuro:[atual,...h.futuro]},desenhos:h.passado[h.passado.length-1]};}
export function refazer(h:HistoricoQuadro,atual:TracoQuadro[]):{h:HistoricoQuadro;desenhos:TracoQuadro[]}|null{if(!h.futuro.length)return null;return {h:{passado:[...h.passado,atual],futuro:h.futuro.slice(1)},desenhos:h.futuro[0]};}
/** Borracha: tira os traços inteiros que passam perto do ponto (raio em px do quadro 800×650). */
export function apagarPerto(desenhos:TracoQuadro[],p:{x:number;y:number},raio=18,w=800,h=650):TracoQuadro[]{const perto=(a:{x:number;y:number},b:{x:number;y:number})=>{const ax=a.x*w,ay=a.y*h,bx=b.x*w,by=b.y*h,px=p.x*w,py=p.y*h;const dx=bx-ax,dy=by-ay;const l=dx*dx+dy*dy;const t=l?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l)):0;return Math.hypot(ax+t*dx-px,ay+t*dy-py)<=raio;};return desenhos.filter(d=>{if(d.pontos.length<2)return !(d.pontos[0]&&perto(d.pontos[0],d.pontos[0]));for(let i=1;i<d.pontos.length;i++)if(perto(d.pontos[i-1],d.pontos[i]))return false;return true;});}
