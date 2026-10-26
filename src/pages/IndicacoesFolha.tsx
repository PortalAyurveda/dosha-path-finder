import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {MesaHeader} from '@/components/terapia/mesa/Mesa';
import { useSouTerapeuta } from '@/hooks/useSouTerapeuta';
import { terapia, diaBR } from '@/lib/terapia';
import { iniciarIndicacoes, linkCurto, linkIndicacao } from '@/lib/terapiaIndicacoes';
import '@/components/terapia/indicacoes/folha.css';
export default function IndicacoesFolha() {
 const {id,folhaId}=useParams();const acesso=useSouTerapeuta();
 const q=useQuery({queryKey:['indicacoes-folha',acesso.userId,id,folhaId],enabled:acesso.permitido&&!!id&&!!folhaId,retry:false,queryFn:async()=>{if(!id||!folhaId)throw new Error('Folha não encontrada.');const [f,p]=await Promise.all([terapia.folha(folhaId),terapia.painel(),terapia.ficha(id)]);if(f.paciente_user_id!==id)throw new Error('Folha não encontrada.');return {f,p};}});
 if(!acesso.carregando&&!acesso.permitido&&!acesso.error)return <Navigate to="/" replace/>;
 const erro=acesso.error?.message??q.error?.message;const d=q.data;
 return <div className="mesa indicacoes-print-mesa"><Helmet><title>Folha de indicações | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow"/></Helmet><div className="no-print"><MesaHeader nome={d?.p?.terapeuta.nome}/></div><nav className="no-print mx-auto flex max-w-4xl flex-wrap justify-between gap-3 px-4 py-5"><Button variant="outline" asChild><Link to={`/painel-terapeuta/paciente/${id}/indicacoes/${folhaId}`}>Voltar às indicações</Link></Button><Button variant="outline" disabled={!d} onClick={()=>window.print()}><Printer className="mr-2 h-4 w-4"/>Imprimir</Button></nav>{erro?<p role="alert" className="p-6">{erro}</p>:!d?<p role="status" className="p-6">Carregando folha…</p>:<article id="folha-indicacoes" className="indicacoes-folha"><header className="flex items-start justify-between gap-4 border-b border-border pb-4"><div><p className="indicacoes-print-eti">PORTAL AYURVEDA · INDICAÇÕES</p><h1 className="font-serif text-xl font-bold">{d.f.paciente_nome}</h1><p>Consulta de {new Date(d.f.criado_em).toLocaleDateString('pt-BR')}</p></div><div className="indicacoes-print-terapeuta"><b>{d.p?.terapeuta.nome}</b><p>Portal Ayurveda</p></div></header>{[['Diagnóstico',d.f.diagnostico],['Tratamento',d.f.tratamento],['Retorno',d.f.retorno?new Date(`${d.f.retorno}T12:00:00`).toLocaleDateString('pt-BR'):null]].map(([n,t])=>t?.trim()?<section key={n}><h2>{n}</h2><p>{t}</p></section>:null)}{(d.f.secoes??[]).map(s=>{const itens=iniciarIndicacoes(d.f.dados).secoes[s.chave]??[];return itens.length?<section key={s.chave}><h2>{s.titulo}</h2>{itens.map(i=><div key={i.id} className="mb-3"><h3 className="font-semibold">{i.titulo}</h3>{i.texto&&<p>{i.texto}</p>}{i.nota&&<p>{i.nota}</p>}{linkIndicacao(i)&&<p className="text-xs text-muted-foreground">{linkCurto(linkIndicacao(i))}</p>}</div>)}</section>:null;})}<footer className="mt-10 border-t border-border pt-3 text-xs">{d.p?.terapeuta.nome} · Portal Ayurveda</footer></article>}</div>;
}