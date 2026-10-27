export interface OpcoesAcervo { tipos: { chave:string; nome:string; secao?:string }[]; subcategorias:Record<string,string[]>; tags:string[] }
export interface ConteudoAcervo { ingredientes?:{quantidade:string;item:string}[]; passos?:string[]; como_fazer?:string; duracao?:string; link?:string; inicio?:string; texto?:string; dica?:string; esperar?:string; [key:string]:unknown }
export interface ItemAcervo { id?:string; tipo:string; titulo:string; slug?:string; resumo:string; subcategoria:string; periodo:string; vata:number; pitta:number; kapha:number; tags:string[]; serve_para:string[]; conteudo:ConteudoAcervo; arquivo_path?:string|null; visibilidade:string; revisao?:string; terapeuta?:{nome:string;slug:string;imagem?:string} }
export const novoAcervo=():ItemAcervo=>({tipo:'texto',titulo:'',resumo:'',subcategoria:'',periodo:'',vata:0,pitta:0,kapha:0,tags:[],serve_para:[],conteudo:{},visibilidade:'meus_pacientes'});
export type AnexoAcervo = '' | 'foto' | 'pdf' | 'link';
export function youtubeId(link:string) { try { const u=new URL(/^https?:/.test(link)?link:`https://${link}`); if(u.hostname==='youtu.be')return u.pathname.slice(1).split('/')[0]; if(/(^|\.)youtube\.com$/.test(u.hostname))return u.searchParams.get('v')??u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]??''; }catch{} return ''; }
export function tipoDoAnexo(anexo:AnexoAcervo,link='') { return anexo==='foto'?'foto':anexo==='pdf'?'arquivo':anexo==='link'?(youtubeId(link)?'aula':'link'):'texto'; }
const NOMES_TIPO:Record<string,string>={texto:'Texto',foto:'Foto',arquivo:'PDF',aula:'Vídeo',link:'Link',receita:'Receita',pratica:'Prática',indicacao:'Indicação',artigo:'Artigo'};
export function nomeDoTipo(tipo:string) { return NOMES_TIPO[tipo]??(tipo?tipo[0].toUpperCase()+tipo.slice(1):tipo); }
export function textoDoAcervo(item:ItemAcervo) {
 const c=item.conteudo??{}; const partes:string[]=[];
 const adicionar=(titulo:string,v:unknown)=>{if(v!==undefined&&v!==null&&String(v).trim())partes.push(`${titulo?`${titulo}\n`:''}${String(v)}`);};
 adicionar('Resumo',item.resumo); adicionar('',c.texto);
 if(c.ingredientes?.length)adicionar('Ingredientes',c.ingredientes.map(i=>[i.quantidade,i.item].filter(Boolean).join(' ')).join('\n'));
 if(c.passos?.length)adicionar('Modo de preparo',c.passos.map((p,i)=>`${i+1}. ${p}`).join('\n'));
 const nomes:Record<string,string>={como_fazer:'Como fazer',duracao:'Duração',dica:'Dica',esperar:'O que esperar',inicio:'Começar em'};
 for(const [k,v] of Object.entries(c))if(!['texto','link','ingredientes','passos','youtube_titulo','youtube_duracao'].includes(k))adicionar(nomes[k]??k.replace(/_/g,' '),typeof v==='object'?JSON.stringify(v):v);
 adicionar('Melhor horário',item.periodo);return partes.join('\n\n');
}
export function conteudoUnico(item:ItemAcervo,texto:string,anexo:AnexoAcervo,link:string):ItemAcervo { return {...item,tipo:tipoDoAnexo(anexo,link),resumo:'',periodo:'',subcategoria:'',arquivo_path:anexo==='foto'||anexo==='pdf'?item.arquivo_path:null,conteudo:{texto,...(anexo==='link'?{link: /^https?:/.test(link)?link:`https://${link}`}:{})}}; }
export function ordenarMinhas<T extends {serve?:boolean}>(itens:T[]) { return [...itens].sort((a,b)=>Number(!!b.serve)-Number(!!a.serve)); }
export function enderecoAcervo(slug:string,item:string) { return `/terapeutas/${encodeURIComponent(slug)}/acervo/${encodeURIComponent(item)}`; }
export function inicioYoutube(inicio:string) { const p=inicio.split(':').map(Number);return p.length===2&&p.every(Number.isFinite)?Math.max(0,p[0]*60+p[1]):0; }
export function linkSeguro(link:string) { if(!link.trim())return '';try { const url=new URL(link,window.location.origin);return ['https:','http:'].includes(url.protocol)?url.href:''; }catch{return '';} }