import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { terapia } from '@/lib/terapia';
import { enderecoAcervo,ordenarMinhas } from '@/lib/terapiaAcervo';
import { useDraggable } from '@dnd-kit/core';
import { BookOpen, CookingPot, FileText, Check, Plus, ShoppingBag, Video, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FonteIndicacao, FontesIndicacoes } from '@/lib/terapiaIndicacoes';
import { linhaFonte, minhasComFavoritos, queixaIndicacao } from '@/lib/terapiaIndicacoes';
export function TipoIndicacao({ tipo }: { tipo?: string }) {
 const Icon = tipo === 'produto' ? ShoppingBag : tipo === 'receita' ? CookingPot : tipo === 'verso' ? BookOpen : tipo === 'aula' ? Video : FileText;
 return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{tipo ?? 'Texto'}</span>;
}
function Cartao({ fonte, chave, adicionar, ja }: { fonte: FonteIndicacao; chave: string; adicionar: (f: FonteIndicacao) => void; ja:boolean }) {
 const drag = useDraggable({ id: `fonte:${chave}`, data: { fonte } });
 const titulo=fonte.titulo??fonte.nome??[fonte.livro,fonte.referencia].filter(Boolean).join(' · ');
 const linha=linhaFonte({...fonte,queixa:fonte.queixa??(queixaIndicacao(fonte)||undefined)});
 return <article ref={drag.setNodeRef} {...drag.listeners} {...drag.attributes} className={`fe-cx ${ja?'ja':''} ${drag.isDragging?'arrastando':''}`}><div className="min-w-0"><b>{titulo}</b>{linha&&<small>{linha}</small>}</div><button type="button" className="fe-mais" disabled={ja} title={ja?'Já está na folha':`Adicionar ${titulo}`} aria-label={`Adicionar ${titulo}`} onPointerDown={e=>e.stopPropagation()} onClick={()=>adicionar(fonte)}>{ja?<Check size={14}/>:<Plus size={14}/>}</button></article>;
}
export default function Catalogo({ fontes, nome, adicionar, itens=[], fechar, geral=false }: { geral?:boolean; itens?:FonteIndicacao[]; fontes: FontesIndicacoes; nome: string; adicionar: (f: FonteIndicacao) => void; fechar?:()=>void }) {
 const [aba,setAba]=useState(geral?'portal':'para');
 const [texto,setTexto]=useState('');
 const [q,setQ]=useState('');
 const [expandidos,setExpandidos]=useState<string[]>([]);
 const ativa=texto.trim().length>=2;
 useEffect(()=>{setExpandidos([]);const id=setTimeout(()=>setQ(texto.trim()),350);return()=>clearTimeout(id);},[texto]);
 const busca=useQuery({queryKey:['terapia-busca-portal',q,6],queryFn:()=>terapia.buscaPortal(q,6),enabled:ativa&&q.length>=2&&q===texto.trim()});
 const completa=useQuery({queryKey:['terapia-busca-portal',q,30],queryFn:()=>terapia.buscaPortal(q,30),enabled:ativa&&q===texto.trim()&&expandidos.length>0});
 const buscando=ativa&&(q!==texto.trim()||busca.isFetching);
 const painel=useQuery({queryKey:['indicacoes-acervo-perfil'],queryFn:terapia.painel,enabled:aba==='minhas'});
 const slug=painel.data?.terapeuta.link_perfil?.replace(/\/$/,'').split('/').pop();
 const lista: FonteIndicacao[] = aba==='minhas'
  ? [...ordenarMinhas(fontes.minhas??[]).map(f=>({...f,origem:"acervo",link:slug&&f.slug?enderecoAcervo(slug,f.slug):f.link,slug:undefined})),...minhasComFavoritos([],fontes.favoritos)]
  : aba==='favoritos' ? fontes.favoritos??[]
  : aba==='para' ? [...(fontes.para_ela??[]),...(fontes.rotina_dela??[]).map(f=>({...f,tipo:f.tipo??'receita'}))]
  : aba==='produtos' ? [...(fontes.samkhya??[]).filter(f=>f.combina),...(fontes.samkhya??[]).filter(f=>!f.combina)].map(f=>({...f,tipo:'produto'}))
  : [...Object.values(fontes.rotina??{}).flat().map(f=>({...f,tipo:f.tipo??'receita'})),...(fontes.aulas??[]).map(f=>({...f,tipo:'aula'})),...(fontes.versos??[]).map(f=>({...f,tipo:'verso'}))];
 const cartoes=(l:FonteIndicacao[],chave:string)=>l.map((f,i)=><Cartao key={`${chave}-${i}`} chave={`${chave}-${i}`} fonte={f} adicionar={adicionar} ja={itens.some(x=>f.slug?x.slug===f.slug:f.link?x.link===f.link:f.ref?x.tipo===f.tipo&&x.ref===f.ref:x.titulo===(f.titulo??f.nome))}/>);
 return <aside className="fe-busca" aria-label="Buscar para a folha"><header><h3>Buscar para a folha</h3>{fechar&&<button type="button" className="fe-bt" onClick={fechar}>Fechar</button>}</header>
  <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true"/><Input aria-label="Buscar em todo o Portal" placeholder="Buscar em todo o Portal: kitchari, sono, óleo…" value={texto} onChange={e=>setTexto(e.target.value)} className="w-full pl-9 pr-9"/>{texto&&<Button variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-9" aria-label="Limpar busca" onClick={()=>{setTexto('');setQ('');setExpandidos([]);}}><X size={16}/></Button>}</div>{buscando&&<p role="status" className="fe-qd">Buscando…</p>}
  {!ativa&&<nav className="fe-abas" aria-label="Onde buscar">{(geral?[['portal','Portal'],['minhas','Biblioteca pessoal'],['favoritos','Favoritos'],['produtos','Produtos']]:[['para',`Para ${nome}`],['portal','Portal'],['minhas','Biblioteca pessoal'],['produtos','Produtos']]).map(([v,n])=><Button type="button" key={v} variant="outline" aria-pressed={aba===v} onClick={()=>setAba(v)}>{n}</Button>)}</nav>}
  <div className="fe-caixas">
   {ativa ? <>{(busca.error||completa.error)&&<p role="alert">{(busca.error||completa.error)?.message}</p>}{!buscando&&q===texto.trim()&&busca.data&&(busca.data.total===0?<p>Nada encontrado para "{texto.trim()}". Tente outra palavra.</p>:busca.data.grupos.map(grupo=>{const expandido=expandidos.includes(grupo.tipo);const l=expandido?completa.data?.grupos.find(g=>g.tipo===grupo.tipo)?.itens??grupo.itens:grupo.itens;return <section key={grupo.tipo}><p className="fe-qd"><b>{grupo.titulo} · {grupo.total}</b></p>{cartoes(l,`busca-${q}-${grupo.tipo}`)}{grupo.total>6&&!expandido&&<Button variant="link" className="h-auto p-0" onClick={()=>setExpandidos(v=>[...v,grupo.tipo])}>Ver todos ({grupo.total})</Button>}{expandido&&completa.isFetching&&<p role="status">Buscando…</p>}</section>;}))}</> : <>{aba==='para'&&<p className="fe-qd">Pelos sintomas do teste dela</p>}{lista.length?cartoes(lista,aba):<p className="fe-qd">Nenhum item disponível.</p>}</>}
   <p className="fe-qd">O + pergunta só o momento: Manhã · Refeições · Noite · Ao longo do dia · Para ler e assistir</p>
  </div></aside>;
}
