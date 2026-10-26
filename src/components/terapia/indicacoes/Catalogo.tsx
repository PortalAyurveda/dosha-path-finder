import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { terapia } from '@/lib/terapia';
import { enderecoAcervo,ordenarMinhas } from '@/lib/terapiaAcervo';
import { useDraggable } from '@dnd-kit/core';
import { BookOpen, CookingPot, FileText, Plus, ShoppingBag, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FonteIndicacao, FontesIndicacoes } from '@/lib/terapiaIndicacoes';
import { HORARIOS_INDICACOES, minhasComFavoritos } from '@/lib/terapiaIndicacoes';
import { COR } from '@/lib/terapiaAvaliacao';
export function TipoIndicacao({ tipo }: { tipo?: string }) {
 const Icon = tipo === 'produto' ? ShoppingBag : tipo === 'receita' ? CookingPot : tipo === 'verso' ? BookOpen : tipo === 'aula' ? Video : FileText;
 return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{tipo ?? 'Texto'}</span>;
}
function Cartao({ fonte, chave, adicionar }: { fonte: FonteIndicacao; chave: string; adicionar: (f: FonteIndicacao) => void }) {
 const drag = useDraggable({ id: `fonte:${chave}`, data: { fonte } });
 return <article ref={drag.setNodeRef} {...drag.listeners} {...drag.attributes} className={`relative rounded-lg border border-border bg-card p-4 ${drag.isDragging ? 'opacity-40' : ''}`}>
  <div className="mb-2 flex items-center justify-between gap-2"><span className="flex flex-wrap items-center gap-2"><TipoIndicacao tipo={fonte.tipo} />{fonte.favorito&&<span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">favorito</span>}</span><Button size="icon" variant="outline" className="h-7 w-7" title={`Adicionar ${fonte.titulo ?? fonte.nome}`} aria-label={`Adicionar ${fonte.titulo ?? fonte.nome}`} onPointerDown={e=>e.stopPropagation()} onClick={()=>adicionar(fonte)}><Plus className="h-4 w-4" /></Button></div>
  {fonte.imagem && <img src={fonte.imagem} alt={fonte.titulo ?? fonte.nome ?? ''} loading="lazy" className="mb-3 h-28 w-full rounded object-contain" />}
  <h3 className="break-words text-sm font-semibold">{fonte.titulo ?? fonte.nome ?? [fonte.livro,fonte.referencia].filter(Boolean).join(' · ')}</h3>
  {(fonte.resumo || fonte.texto) && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{fonte.resumo ?? fonte.texto}</p>}
  <div className="mt-2 flex flex-wrap gap-1">{([['V',fonte.vata],['P',fonte.pitta],['K',fonte.kapha]] as const).map(([d,v])=>v != null && v !== 0 ? <span key={d} className={`rounded border px-1.5 py-0.5 text-xs ${COR[d]}`}>{d}{v>0?'+':'−'}{Math.abs(v)>1?Math.abs(v):''}</span>:null)}</div>
  {fonte.serve && <p className="mt-2 text-xs font-semibold text-secondary">serve para as queixas dela</p>}
  {fonte.porque && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{fonte.porque}</p>}
 </article>;
}
export default function Catalogo({ fontes, nome, adicionar }: { fontes: FontesIndicacoes; nome: string; adicionar: (f: FonteIndicacao) => void }) {
 const [aba,setAba]=useState('para');
 const painel=useQuery({queryKey:['indicacoes-acervo-perfil'],queryFn:terapia.painel,enabled:aba==='minhas'});
 const slug=painel.data?.terapeuta.link_perfil?.replace(/\/$/,'').split('/').pop();
 const grupos: [string,FonteIndicacao[]][] = aba==='minhas' ? [['',[...ordenarMinhas(fontes.minhas??[]).map(f=>({...f,link:slug&&f.slug?enderecoAcervo(slug,f.slug):f.link,slug:undefined})),...minhasComFavoritos([],fontes.favoritos)]]] : aba==='para' ? [['',fontes.para_ela ?? []]] : aba==='rotina' ? [...Object.entries((fontes.rotina_dela ?? []).reduce<Record<string,FonteIndicacao[]>>((g,f)=>{ const s=HORARIOS_INDICACOES[f.slot ?? ''] ?? f.slot ?? 'Minha Rotina'; return {...g,[s]:[...(g[s]??[]),{...f,tipo:'receita'}]}; },{})).map(([n,l])=>[`Rotina dela · ${n}`,l] as [string,FonteIndicacao[]]), ...Object.entries(fontes.rotina ?? {}).map(([n,l])=>[n,l.map(f=>({...f,tipo:f.tipo ?? 'receita'}))] as [string,FonteIndicacao[]])] : aba==='samkhya' ? [['Combinam com ela',(fontes.samkhya??[]).filter(f=>f.combina).map(f=>({...f,tipo:'produto'}))],['Outros produtos',(fontes.samkhya??[]).filter(f=>!f.combina).map(f=>({...f,tipo:'produto'}))]] : [['Vídeos e aulas',(fontes.aulas??[]).map(f=>({...f,tipo:'aula'}))],['Biblioteca clássica',(fontes.versos??[]).map(f=>({...f,tipo:'verso'}))]];
 return <aside className="min-w-0"><h2 className="font-serif text-lg font-bold text-primary">O que o Portal indica para {nome}</h2><nav aria-label="Fontes das indicações" className="my-4 flex flex-wrap border-b border-border">{[['para','Para ela'],['rotina','Minha Rotina'],['samkhya','Samkhya'],['aulas','Aulas e literatura'],['minhas','Minhas']].map(([v,n])=><Button key={v} variant="ghost" size="sm" aria-pressed={aba===v} className={`rounded-none border-b-2 ${aba===v?'border-secondary bg-secondary/10':'border-transparent text-muted-foreground'}`} onClick={()=>setAba(v)}>{n}</Button>)}</nav><div className="max-h-96 space-y-5 overflow-y-auto pr-1 lg:max-h-[70vh]">{grupos.map(([nome,itens],g)=><section key={nome||g}>{nome&&<h3 className="mb-3 text-sm font-semibold">{nome}</h3>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{itens.map((f,i)=><Cartao key={`${aba}-${g}-${i}`} chave={`${aba}-${g}-${i}`} fonte={f} adicionar={adicionar}/>)}</div>{!itens.length&&<p className="text-sm text-muted-foreground">Nenhum item disponível.</p>}</section>)}</div></aside>;
}