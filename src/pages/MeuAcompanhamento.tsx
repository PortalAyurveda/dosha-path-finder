import { lazy,Suspense,useEffect,useState } from 'react';
import { Link,Navigate,useSearchParams } from 'react-router-dom';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { useMeuAcompanhamento } from '@/hooks/useMeuAcompanhamento';
import { acompanhamento,avaliacoesDa,dataAcompanhamento,desdeAcompanhamento,horaAcompanhamento,blocoDaAba,linhaConsultaMinha,icsConsulta,COMO_FUNCIONA_CHAVE } from '@/lib/meuAcompanhamento';
import { meu,salaLiberada,type MeuTerapeutaLigacao } from '@/lib/terapiaMeu';
import { chat } from '@/lib/terapiaChat';
import { horaBR } from '@/lib/terapia';
import Avaliacoes from '@/components/terapia/meu/acompanhamento/Avaliacoes';
import { AvaliarConsulta } from '@/components/terapia/meu/acompanhamento/Consultas';
import Indicacoes from '@/components/terapia/meu/acompanhamento/Indicacoes';
import Fotos,{ FotoAssinada } from '@/components/terapia/meu/acompanhamento/Fotos';
import DoSeuTerapeuta from '@/components/terapia/meu/DoSeuTerapeuta';
import '@/components/terapia/meu/acompanhamento/acompanhamento.css';
import '@/components/terapia/acoes.css';
import FormulariosPendentes from '@/components/terapia/formularios/Pendentes';
const Conversa=lazy(()=>import('@/components/terapia/chat/Conversa'));

function Foto({l}:{l:MeuTerapeutaLigacao}){return l.terapeuta.imagem?<img className="ac-foto-t" src={l.terapeuta.imagem} alt={l.terapeuta.nome}/>:<span className="ac-foto-t ac-avatar">{l.terapeuta.primeiro_nome[0]}</span>;}
const capital=(t:string)=>t.charAt(0).toUpperCase()+t.slice(1);

function Proxima({l,agora}:{l:MeuTerapeutaLigacao;agora:number}){
  const qc=useQueryClient();const p=l.proxima;const [remarcar,setRemarcar]=useState(false);const [inicio,setInicio]=useState('');const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);
  const horarios=useQuery({queryKey:['acomp-horarios',l.terapeuta.id],queryFn:()=>meu.horarios(l.terapeuta.id),enabled:remarcar});
  const atualizar=()=>qc.invalidateQueries({queryKey:['meu-terapeuta']});
  if(!p)return <section className="ac-card" id="ac-proxima"><h2>Próxima consulta</h2><p>Nenhuma consulta marcada</p><Button data-terapia-principal variant="secondary" className="self-start" asChild><Link to={`/terapeutas/${l.terapeuta.slug}#agenda`}>Marcar consulta</Link></Button><FormulariosPendentes terapeuta={l.terapeuta.nome}/></section>;
  const pode=salaLiberada(p,agora);
  const calendario=()=>{const url=`${window.location.origin}/consulta/${p.id}`;const b=new Blob([icsConsulta(p,l.terapeuta.nome,url)],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='consulta.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  return <section className="ac-card" id="ac-proxima"><h2>Próxima consulta</h2><div className="ac-prox"><Foto l={l}/><div className="min-w-0"><b className="ac-data">{capital(dataAcompanhamento(p.inicio,true))}</b><p className="ac-muted">Por vídeo, aqui no Portal · a sala abre às {horaAcompanhamento(p.sala_abre_em)}</p></div></div>
    <div className="ac-acoes">{pode?<Button data-terapia-principal variant="secondary" asChild><Link to={`/consulta/${p.id}`}>Entrar na sala</Link></Button>:<Button variant="outline" onClick={calendario}>Marcar no meu calendário</Button>}{p.pode_cancelar&&!pode&&<p className="ac-links"><button type="button" className="ac-link" onClick={()=>setRemarcar(true)}>Remarcar</button><span aria-hidden="true">·</span><button type="button" className="ac-link" disabled={ocupado} onClick={async()=>{if(!window.confirm(`Cancelar a consulta de ${dataAcompanhamento(p.inicio,true)}?`))return;setOcupado(true);try{await meu.cancelar(p.id);await atualizar();}catch(e){setErro((e as Error).message);}finally{setOcupado(false);}}}>Cancelar</button></p>}</div>
    <p className="ac-muted">{!pode&&!p.pode_cancelar?l.regras?.texto:'O botão “Entrar na sala” acende 10 minutos antes.'}</p>{erro&&<p role="alert">{erro}</p>}
    <FormulariosPendentes terapeuta={l.terapeuta.nome}/>
    {remarcar&&<Dialog open onOpenChange={setRemarcar}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogTitle>Remarcar com {l.terapeuta.primeiro_nome}</DialogTitle><DialogDescription>Escolha um novo horário nos próximos 14 dias.</DialogDescription>{horarios.isLoading?<p>Carregando horários…</p>:horarios.error?<p role="alert">{horarios.error.message}</p>:!horarios.data?.length?<p>Sem horários livres nos próximos 14 dias.</p>:<div className="flex flex-wrap gap-2">{horarios.data.map(h=><Button variant={inicio===h.inicio?'secondary':'outline'} key={h.inicio} onClick={()=>setInicio(h.inicio)}>{dataAcompanhamento(h.inicio,true)}</Button>)}</div>}{erro&&<p role="alert">{erro}</p>}<Button variant="secondary" disabled={!inicio||ocupado} onClick={async()=>{setOcupado(true);try{await meu.remarcar(p.id,inicio);await atualizar();setRemarcar(false);}catch(e){setErro((e as Error).message);}finally{setOcupado(false);}}}>Confirmar novo horário</Button></DialogContent></Dialog>}
  </section>;
}

function SeuDia({l}:{l:MeuTerapeutaLigacao}){
  const qc=useQueryClient();const id=l.folhas[0]?.id??'';
  const folha=useQuery({queryKey:['acomp-folha',id],queryFn:()=>meu.folha(id),enabled:!!id});
  useEffect(()=>{if(!folha.data||folha.data.vista_em)return;meu.vista(folha.data.id).then(()=>qc.invalidateQueries({queryKey:['meu-terapeuta']})).catch(()=>undefined);},[folha.data?.id]);
  return <div id="ac-seu-dia" className="ac-bloco">{!id?<section className="ac-card"><h2>Seu dia</h2><p>Depois da consulta, {l.terapeuta.primeiro_nome} manda aqui o seu dia.</p></section>:folha.error?<p role="alert">{folha.error.message}</p>:!folha.data?<p role="status">Carregando seu dia…</p>:<DoSeuTerapeuta folha={folha.data} acompanhamento/>}</div>;
}

function ConversaCurta({l}:{l:MeuTerapeutaLigacao}){
  const qc=useQueryClient();const nome=l.terapeuta.primeiro_nome;const [texto,setTexto]=useState('');const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);const [inteira,setInteira]=useState(false);
  const c=useQuery({queryKey:['chat-abrir',l.terapeuta.slug],queryFn:()=>chat.abrir(l.terapeuta.slug)});
  const m=useQuery({queryKey:['chat-mensagens',c.data?.id,'paciente'],queryFn:()=>chat.mensagens(c.data!.id),enabled:!!c.data,refetchInterval:120000});
  useEffect(()=>c.data?marcarAberta(c.data.id):undefined,[c.data?.id]);
  const ultimas=(m.data??[]).filter(x=>x.autor!=='sistema').slice(-4);
  const enviar=async()=>{if(!c.data||!texto.trim())return;setOcupado(true);setErro('');try{await chat.enviar(c.data.id,texto.trim());setTexto('');await qc.invalidateQueries({queryKey:['chat-mensagens',c.data.id]});}catch(e){setErro((e as Error).message);}finally{setOcupado(false);}};
  return <section className="ac-card" id="ac-conversa"><div className="ac-cab"><h2>Conversa com {nome}</h2>{c.data&&<Button variant="link" className="h-auto p-0" onClick={()=>setInteira(true)}>Ver conversa inteira</Button>}</div>
    {c.error?<p role="alert">{c.error.message}</p>:m.isLoading||c.isLoading?<p role="status" className="ac-muted">Carregando conversa…</p>:!ultimas.length?<p className="ac-muted">Nenhuma mensagem ainda.</p>:<div className="ac-msgs">{ultimas.map(x=><p key={x.id} className={`ac-msg ${x.autor==='paciente'?'eu':''}`}>{x.texto}<small>{horaBR(x.criado_em)}</small></p>)}</div>}
    <form className="ac-escrever" onSubmit={e=>{e.preventDefault();void enviar();}}><Textarea aria-label={`Escrever para ${nome}`} placeholder={`Escrever para ${nome}…`} rows={1} value={texto} onChange={e=>setTexto(e.target.value)} disabled={ocupado||!c.data}/><Button type="submit" disabled={ocupado||!texto.trim()}>Enviar</Button></form>{erro&&<p role="alert">{erro}</p>}
    {inteira&&c.data&&<Dialog open onOpenChange={v=>{if(!v)setInteira(false);}}><DialogContent className="max-w-2xl"><DialogTitle>Conversa com {nome}</DialogTitle><DialogDescription className="sr-only">Conversa completa</DialogDescription><div className="ac-chat"><Suspense fallback={<p>Carregando…</p>}><Conversa conversa={c.data} papel="paciente" marcar={()=>window.location.assign(`/terapeutas/${l.terapeuta.slug}#agenda`)}/></Suspense></div></DialogContent></Dialog>}
  </section>;
}

function Mandou({l}:{l:MeuTerapeutaLigacao}){
  const {doshaResult}=useUser();const {fotos}=useMeuAcompanhamento();const [mandar,setMandar]=useState(false);const nome=l.terapeuta.primeiro_nome;
  const lista=fotos.data?.fotos??[];
  return <section className="ac-card" id="ac-mandou"><h2>O que você mandou</h2>
    <p>{doshaResult?`Teste de dosha · Vata ${doshaResult.vatascore??0} · Pitta ${doshaResult.pittascore??0} · Kapha ${doshaResult.kaphascore??0}`:'Você ainda não fez o teste de dosha.'}</p>
    {fotos.error?<p role="alert">{fotos.error.message}</p>:lista.length>0&&<div className="ac-minis">{lista.slice(0,8).map(f=><span key={f.id} className="ac-mini"><FotoAssinada foto={f}/></span>)}</div>}
    <div className="ac-acoes"><Button variant="outline" onClick={()=>setMandar(true)} disabled={!fotos.data}>+ Mandar foto</Button><Button variant="outline" asChild><Link to="/teste-de-dosha">Refazer o teste</Link></Button></div>
    {mandar&&fotos.data&&<Dialog open onOpenChange={v=>{if(!v)setMandar(false);}}><DialogContent className="acompanhamento-dialogo max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogTitle>Mandar foto</DialogTitle><DialogDescription>As fotos guiadas de hoje. Só você e {nome} veem.</DialogDescription><Fotos dados={fotos.data} nome={nome}/></DialogContent></Dialog>}
  </section>;
}

export default function MeuAcompanhamento() {
  const {user,isAnonymous,loading}=useUser();const {ligacoes,consultas}=useMeuAcompanhamento();const [params,setParams]=useSearchParams();const [avaliar,setAvaliar]=useState('');const [agora,setAgora]=useState(Date.now());
  const [ver,setVer]=useState<{tipo:'avaliacao';id:string}|{tipo:'folha'}|null>(()=>params.get('avaliacao')?{tipo:'avaliacao',id:params.get('avaliacao')!}:null);
  const [comoFunciona,setComoFunciona]=useState(()=>{try{return !localStorage.getItem(COMO_FUNCIONA_CHAVE);}catch{return false;}});
  const l=ligacoes.data?.find(l=>l.ligacao===params.get('terapeuta')||l.terapeuta.slug===params.get('terapeuta'))??ligacoes.data?.[0];
  const avaliacoes=useQuery({queryKey:['minhas-avaliacoes',user?.id],queryFn:acompanhamento.avaliacoes,enabled:!!user&&!isAnonymous&&!!l,refetchInterval:30000,refetchIntervalInBackground:false});
  useEffect(()=>{const t=setInterval(()=>setAgora(Date.now()),30000);return()=>clearInterval(t);},[]);
  const bloco=blocoDaAba(params.get('aba'));
  useEffect(()=>{if(!bloco||!l)return;const t=setTimeout(()=>document.getElementById(bloco)?.scrollIntoView({behavior:'smooth',block:'start'}),300);return()=>clearTimeout(t);},[bloco,!!l]);
  if(loading)return <main className="p-6" role="status">Carregando…</main>;
  if(!user||isAnonymous)return <Navigate to={`/entrar?redirect=${encodeURIComponent('/meu-acompanhamento'+window.location.search)}`} replace/>;
  const head=<Helmet><title>Meu acompanhamento | Portal Ayurveda</title><meta name="description" content="Sua próxima consulta, seu dia e a conversa com seu terapeuta."/><meta name="robots" content="noindex, nofollow"/></Helmet>;
  if(ligacoes.error)return <main className="p-6">{head}<p role="alert">{ligacoes.error.message}</p><Button variant="outline" onClick={()=>void ligacoes.refetch()}>Tentar novamente</Button></main>;
  if(ligacoes.isLoading)return <main className="p-6" role="status">{head}Carregando acompanhamento…</main>;
  if(!l)return <main className="mx-auto max-w-xl space-y-5 px-6 py-16">{head}<h1 className="font-serif text-[28px] font-bold">Você ainda não tem terapeuta pelo Portal</h1><Button data-terapia-principal asChild variant="secondary"><Link to="/terapeutas-do-brasil">Encontrar um terapeuta</Link></Button></main>;
  const nome=l.terapeuta.primeiro_nome;const lista=avaliacoesDa(avaliacoes.data??[],l.terapeuta.slug);
  const historico=(consultas.data??[]).filter(c=>c.terapeuta_id===l.terapeuta.id&&Date.parse(c.inicio)<=agora).sort((a,b)=>Date.parse(b.inicio)-Date.parse(a.inicio));
  const seletor=(ligacoes.data?.length??0)>1?<Select value={l.ligacao} onValueChange={v=>setParams(p=>{p.set('terapeuta',v);p.delete('avaliacao');return p;})}><SelectTrigger aria-label="Escolher terapeuta" className="max-w-xs"><SelectValue/></SelectTrigger><SelectContent>{ligacoes.data?.map(l=><SelectItem value={l.ligacao} key={l.ligacao}>{l.terapeuta.nome}</SelectItem>)}</SelectContent></Select>:null;
  const entendi=()=>{try{localStorage.setItem(COMO_FUNCIONA_CHAVE,'1');}catch{/* navegador sem armazenamento */}setComoFunciona(false);};
  const consultasBloco=<section className="ac-card" id="ac-consultas"><h2>Consultas e avaliações</h2>{consultas.error&&<p role="alert">{consultas.error.message}</p>}{!historico.length?<p className="ac-muted">Nenhuma consulta ainda.</p>:historico.map(c=>{const a=lista.find(a=>a.id===c.avaliacao_id);return <div className="ac-linha" key={c.id}><span>{linhaConsultaMinha(c,!!a)}</span><span className="flex gap-3">{c.status==='realizada'&&c.nota==null&&<Button variant="link" className="h-auto p-0" onClick={()=>setAvaliar(c.id)}>avaliar</Button>}{(a||c.folha_enviada)&&<Button variant="link" className="h-auto p-0" onClick={()=>setVer(a?{tipo:'avaliacao',id:a.id}:{tipo:'folha'})}>ver</Button>}</span></div>;})}</section>;
  return <div className="acompanhamento ac-unica">{head}<main className="ac-main" id="ac-topo">
    <header className="ac-topo"><div><h1>Meu acompanhamento</h1><p className="ac-muted">Com {l.terapeuta.nome}, terapeuta · desde {desdeAcompanhamento(l.desde)}</p></div>{seletor}</header>
    {comoFunciona&&<section className="ac-como" aria-labelledby="ac-como-t"><h2 id="ac-como-t">Como funciona</h2><ol><li>Responda o formulário que {nome} mandou, antes da consulta.</li><li>A consulta é por vídeo, aqui no Portal. No dia, toque em "Entrar na sala".</li><li>Depois você recebe o seu dia: o que fazer de manhã, nas refeições e à noite.</li></ol><Button onClick={entendi}>Entendi</Button></section>}
    <div className="ac-colunas"><div className="ac-col"><Proxima l={l} agora={agora}/><SeuDia key={l.ligacao} l={l}/></div><div className="ac-col"><ConversaCurta key={l.ligacao} l={l}/><Mandou l={l}/>{consultasBloco}</div></div>
  </main>
  {avaliar&&<AvaliarConsulta id={avaliar} fechar={()=>setAvaliar('')}/>}
  {ver&&<Dialog open onOpenChange={v=>{if(!v){setVer(null);setParams(p=>{p.delete('avaliacao');return p;});}}}><DialogContent className="acompanhamento-dialogo max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogTitle>{ver.tipo==='avaliacao'?'Avaliação':'Folhas de indicações'}</DialogTitle><DialogDescription className="sr-only">Detalhe</DialogDescription>{ver.tipo==='avaliacao'?<Avaliacoes lista={lista.filter(a=>a.id===ver.id)} nome={nome}/>:<Indicacoes l={l}/>}</DialogContent></Dialog>}
  </div>;
}
