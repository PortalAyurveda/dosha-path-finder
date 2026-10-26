import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { terapia } from '@/lib/terapia';
import { enderecoAcervo,ordenarMinhas } from '@/lib/terapiaAcervo';
import { useDraggable } from '@dnd-kit/core';
import { BookOpen, CookingPot, FileText, Check, Plus, ShoppingBag, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FonteIndicacao, FontesIndicacoes } from '@/lib/terapiaIndicacoes';
import { HORARIOS_INDICACOES, minhasComFavoritos, queixaIndicacao } from '@/lib/terapiaIndicacoes';
import { COR } from '@/lib/terapiaAvaliacao';
export function TipoIndicacao({ tipo }: { tipo?: string }) {
 const Icon = tipo === 'produto' ? ShoppingBag : tipo === 'receita' ? CookingPot : tipo === 'verso' ? BookOpen : tipo === 'aula' ? Video : FileText;
 return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{tipo ?? 'Texto'}</span>;
}
function Cartao({ fonte, chave, adicionar, ja }: { fonte: FonteIndicacao; chave: string; adicionar: (f: FonteIndicacao) => void; ja:boolean }) {
 const drag = useDraggable({ id: `fonte:${chave}`, data: { fonte } });
 const tipo=(fonte.tipo??'texto').toLowerCase();const Icon=tipo==='produto'?ShoppingBag:tipo==='receita'?CookingPot:tipo==='live'||tipo==='video'||tipo==='vídeo'||tipo==='aula'?Video:tipo==='verso'?BookOpen:FileText;
 const tom=tipo==='produto'?'sam':tipo==='receita'?'rot':['live','video','vídeo','aula'].includes(tipo)?'vid':'art';
 return <article ref={drag.setNodeRef} {...drag.listeners} {...drag.attributes} className={`ind-caixa ind-tipo-${tom} ${ja?'ja':''} ${drag.isDragging?'arrastando':''}`}><div className="ind-capa"><span>{tipo}</span><Icon size={22}/></div><div className="ind-caixa-corpo"><h3>{fonte.titulo??fonte.nome??[fonte.livro,fonte.referencia].filter(Boolean).join(' · ')}</h3>{fonte.resumo&&!fonte.porque&&<small className="ind-resumo">{fonte.resumo}</small>}{([ ['V',fonte.vata],['P',fonte.pitta],['K',fonte.kapha] ] as const).some(([,v])=>v!=null&&v!==0)&&<div className="ind-efeitos">{([['V',fonte.vata],['P',fonte.pitta],['K',fonte.kapha]] as const).map(([d,v])=>v?<span key={d} className={`m-chip ${d}`}>{d}{v>0?'+':'−'}</span>:null)}</div>}{fonte.porque&&<p className="ind-porque">{fonte.porque}</p>}<Button size="icon" className="ind-mais" disabled={ja} title={ja?'Já está na folha':`Adicionar ${fonte.titulo??fonte.nome}`} aria-label={`Adicionar ${fonte.titulo??fonte.nome}`} onPointerDown={e=>e.stopPropagation()} onClick={()=>adicionar(fonte)}>{ja?<Check size={16}/>:<Plus size={16}/>}</Button></div></article>;
}
export default function Catalogo({ fontes, nome, adicionar, itens=[] }: { itens?:FonteIndicacao[]; fontes: FontesIndicacoes; nome: string; adicionar: (f: FonteIndicacao) => void }) {
 const [aba,setAba]=useState('para');
 const painel=useQuery({queryKey:['indicacoes-acervo-perfil'],queryFn:terapia.painel,enabled:aba==='minhas'});
 const slug=painel.data?.terapeuta.link_perfil?.replace(/\/$/,'').split('/').pop();
 const grupos: [string,FonteIndicacao[]][] = aba==='minhas' ? [['',[...ordenarMinhas(fontes.minhas??[]).map(f=>({...f,link:slug&&f.slug?enderecoAcervo(slug,f.slug):f.link,slug:undefined})),...minhasComFavoritos([],fontes.favoritos)]]] : aba==='para' ? Object.entries((fontes.para_ela??[]).reduce<Record<string,FonteIndicacao[]>>((g,f)=>{const k=queixaIndicacao(f);return {...g,[k]:[...(g[k]??[]),f]};},{})) : aba==='rotina' ? [...Object.entries((fontes.rotina_dela ?? []).reduce<Record<string,FonteIndicacao[]>>((g,f)=>{ const s=HORARIOS_INDICACOES[f.slot ?? ''] ?? f.slot ?? 'Minha Rotina'; return {...g,[s]:[...(g[s]??[]),{...f,tipo:'receita'}]}; },{})).map(([n,l])=>[`Rotina dela · ${n}`,l] as [string,FonteIndicacao[]]), ...Object.entries(fontes.rotina ?? {}).map(([n,l])=>[n,l.map(f=>({...f,tipo:f.tipo ?? 'receita'}))] as [string,FonteIndicacao[]])] : aba==='samkhya' ? [['Combinam com ela',(fontes.samkhya??[]).filter(f=>f.combina).map(f=>({...f,tipo:'produto'}))],['Outros produtos',(fontes.samkhya??[]).filter(f=>!f.combina).map(f=>({...f,tipo:'produto'}))]] : [['Vídeos e aulas',(fontes.aulas??[]).map(f=>({...f,tipo:'aula'}))],['Biblioteca clássica',(fontes.versos??[]).map(f=>({...f,tipo:'verso'}))]];
 return <aside className="ind-catalogo"><header><p className="ind-eti">O QUE O PORTAL INDICA</p><h2>Para {nome}</h2><p>Arraste as caixas para a folha, ou toque no +.</p></header><nav className="ind-abas" aria-label="Fontes das indicações">{[['para','Para ela'],['rotina','Minha Rotina'],['samkhya','Samkhya'],['aulas','Aulas e literatura'],['minhas','Minhas']].map(([v,n])=><Button key={v} variant="outline" aria-pressed={aba===v} onClick={()=>setAba(v)}><i className={`ind-bola ${v}`}/>{n}</Button>)}</nav><div className="ind-caixas">{grupos.length?grupos.map(([grupo,lista],g)=><section key={grupo||g}>{grupo&&<h3 className="ind-grupo">{grupo}{aba==='para'&&fontes.dosha&&<small>{fontes.dosha}</small>}</h3>}<div className="ind-grade">{lista.map((f,i)=><Cartao key={`${aba}-${g}-${i}`} chave={`${aba}-${g}-${i}`} fonte={f} adicionar={adicionar} ja={itens.some(x=>f.slug?x.slug===f.slug:f.link?x.link===f.link:x.titulo===(f.titulo??f.nome))}/>)}</div>{!lista.length&&<p>Nenhum item disponível.</p>}</section>):<p>Nenhum item disponível.</p>}</div></aside>;
}
