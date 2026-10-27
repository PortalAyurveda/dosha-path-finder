import { lazy,Suspense,useEffect,useState } from 'react';
import { Link,Navigate,useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Camera,Leaf,Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { useMeuAcompanhamento } from '@/hooks/useMeuAcompanhamento';
import { ABAS_ACOMPANHAMENTO,abaValida,acompanhamento,avaliacoesDa,pendencias,dataAcompanhamento,desdeAcompanhamento,type AbaAcompanhamento } from '@/lib/meuAcompanhamento';
import { chat } from '@/lib/terapiaChat';
import Avaliacoes,{Leitura} from '@/components/terapia/meu/acompanhamento/Avaliacoes';
import Consultas,{ProximaConsulta,AvaliarConsulta} from '@/components/terapia/meu/acompanhamento/Consultas';
import Indicacoes from '@/components/terapia/meu/acompanhamento/Indicacoes';
import Fotos from '@/components/terapia/meu/acompanhamento/Fotos';
import '@/components/terapia/meu/acompanhamento/acompanhamento.css';
import '@/components/terapia/acoes.css';
const Grafico=lazy(()=>import('@/components/meudosha/v2/GraficoMeses'));
const Conversa=lazy(()=>import('@/components/terapia/chat/Conversa'));
function Chat({slug}:{slug:string}) {const q=useQuery({queryKey:['chat-abrir',slug],queryFn:()=>chat.abrir(slug)});return q.error?<p role="alert">{q.error.message}</p>:!q.data?<p role="status">Carregando conversa…</p>:<div className="ac-chat"><Suspense fallback={<p>Carregando…</p>}><Conversa key={q.data.id} conversa={q.data} papel="paciente" marcar={()=>window.location.assign(`/terapeutas/${slug}#agenda`)}/></Suspense></div>;}
export default function MeuAcompanhamento() {
  const {user,isAnonymous,loading,profile,doshaResult}=useUser();const {ligacoes,fotos,consultas,conversas}=useMeuAcompanhamento();const [params,setParams]=useSearchParams();const aba=abaValida(params.get('aba'));const [avaliar,setAvaliar]=useState('');const [agora,setAgora]=useState(Date.now());
  const l=ligacoes.data?.find(l=>l.ligacao===params.get('terapeuta'))??ligacoes.data?.[0];
  const avaliacoes=useQuery({queryKey:['minhas-avaliacoes',user?.id],queryFn:acompanhamento.avaliacoes,enabled:!!user&&!isAnonymous&&!!l,refetchInterval:30000,refetchIntervalInBackground:false});
  useEffect(()=>{const t=setInterval(()=>setAgora(Date.now()),30000);return()=>clearInterval(t);},[]);
  const trocar=(aba:AbaAcompanhamento,id?:string)=>{setParams(p=>{p.set('aba',aba);if(id)p.set('avaliacao',id);else p.delete('avaliacao');return p;});};
  if(loading)return <main className="p-6" role="status">Carregando…</main>;
  if(!user||isAnonymous)return <Navigate to={`/entrar?redirect=${encodeURIComponent('/meu-acompanhamento'+window.location.search)}`} replace/>;
  const head=<Helmet><title>Meu acompanhamento | Portal Ayurveda</title><meta name="description" content="Suas consultas, indicações e avaliações liberadas por seu terapeuta."/><meta name="robots" content="noindex, nofollow"/></Helmet>;
  if(ligacoes.error)return <main className="p-6">{head}<p role="alert">{ligacoes.error.message}</p><Button variant="outline" onClick={()=>void ligacoes.refetch()}>Tentar novamente</Button></main>;
  if(ligacoes.isLoading)return <main className="p-6" role="status">{head}Carregando acompanhamento…</main>;
  if(!l)return <main className="mx-auto max-w-xl space-y-5 px-6 py-16">{head}<h1 className="font-serif text-[28px] font-bold">Você ainda não tem terapeuta pelo Portal</h1><Button data-terapia-principal asChild variant="secondary"><Link to="/terapeutas-do-brasil">Encontrar um terapeuta</Link></Button></main>;
  const nome=l.terapeuta.primeiro_nome;const lista=avaliacoesDa(avaliacoes.data??[],l.terapeuta.slug);const ultima=lista[0];const p=pendencias(l,fotos.data,consultas.data);const conversaTotal=conversas.data?.find(c=>c.terapeuta.slug===l.terapeuta.slug)?.nao_lidas??0;
  const counts:Partial<Record<AbaAcompanhamento,number>>={inicio:p.total,indicacoes:p.folhas.length,fotos:p.pedidos.length,consultas:p.avaliar.length,conversa:conversaTotal};
  const nav=<nav aria-label="Abas do acompanhamento" className="ac-nav">{ABAS_ACOMPANHAMENTO.map(([k,n])=><Button variant="ghost" key={k} aria-pressed={aba===k} onClick={()=>trocar(k)}>{n}{!!counts[k]&&<span className="ac-badge">{counts[k]}</span>}</Button>)}</nav>;
  const seletor=(ligacoes.data?.length??0)>1?<Select value={l.ligacao} onValueChange={v=>setParams(p=>{p.set('terapeuta',v);p.delete('avaliacao');return p;})}><SelectTrigger aria-label="Escolher terapeuta"><SelectValue/></SelectTrigger><SelectContent>{ligacoes.data?.map(l=><SelectItem value={l.ligacao} key={l.ligacao}>{l.terapeuta.nome}</SelectItem>)}</SelectContent></Select>:null;
  const primeiro=(profile?.nome||doshaResult?.nome||user.user_metadata?.nome||'').split(' ')[0];
  return <div className="acompanhamento">{head}<aside className="ac-lateral">{seletor}<div className="ac-terapeuta">{l.terapeuta.imagem?<img src={l.terapeuta.imagem} alt={l.terapeuta.nome}/>:<span className="ac-avatar">{nome[0]}</span>}<div><b>{l.terapeuta.nome}</b><small>Terapeuta · desde {desdeAcompanhamento(l.desde)}</small></div></div>{nav}</aside><div className="ac-mobile">{seletor}{nav}</div><main className="ac-main"><h1>{aba==='inicio'?`Olá${primeiro?', '+primeiro:''}`:ABAS_ACOMPANHAMENTO.find(([k])=>k===aba)?.[1]}</h1>
    {aba==='inicio'&&<><div className="ac-g2"><ProximaConsulta l={l} agora={agora}/><section className="ac-card"><h3 className="ac-eti">Para você fazer</h3>{p.pedidos.map(f=><div className="ac-linha" key={f.id}><span className="ac-icone"><Camera size={18}/></span><div className="min-w-0 flex-1"><b>{nome} pediu {f.titulo}</b>{f.instrucao&&<p className="ac-muted">{f.instrucao}</p>}</div><Button variant="secondary" onClick={()=>trocar('fotos')}>Tirar foto</Button></div>)}{p.folhas.map(f=><div className="ac-linha" key={f.id}><span className="ac-icone"><Leaf size={18}/></span><div className="min-w-0 flex-1"><b>Indicações novas de {dataAcompanhamento(f.enviada_em)}</b>{f.diagnostico&&<p className="ac-muted">{f.diagnostico}</p>}</div><Button variant="outline" onClick={()=>trocar('indicacoes')}>Ver</Button></div>)}{p.avaliar.map(c=><div className="ac-linha" key={c.id}><span className="ac-icone"><Star size={18}/></span><div className="min-w-0 flex-1"><b>Como foi a consulta de {dataAcompanhamento(c.inicio)}?</b></div><Button variant="outline" onClick={()=>setAvaliar(c.id)}>Avaliar</Button></div>)}{!p.total&&<p>Nenhuma pendência por aqui.</p>}{fotos.error&&<p role="alert">{fotos.error.message}</p>}</section></div>{ultima&&<section className="ac-card"><h3 className="ac-eti">{nome} disse na última avaliação · {dataAcompanhamento(ultima.data)}</h3><Leitura a={ultima}/><p className="whitespace-pre-wrap">{ultima.resumo}</p><Button className="self-start" variant="outline" onClick={()=>trocar('avaliacao',ultima.id)}>Ver a avaliação</Button></section>}</>}
    {aba==='indicacoes'&&<><p className="ac-muted">O que {nome} preparou para você. Marque o que fez hoje.</p><Indicacoes key={l.ligacao} l={l}/></>}
    {aba==='consultas'&&consultas.error&&<p role="alert">{consultas.error.message}</p>}
    {aba==='consultas'&&<Consultas l={l} consultas={consultas.data??[]} avaliacoes={lista} abrirAvaliacao={id=>trocar('avaliacao',id)} avaliar={setAvaliar} agora={agora}/>}
    {aba==='avaliacao'&&<><p className="ac-muted">O que {nome} escolheu mostrar para você.</p>{avaliacoes.isLoading?<p role="status">Carregando avaliações…</p>:avaliacoes.error?<p role="alert">{avaliacoes.error.message}</p>:<Avaliacoes lista={params.get('avaliacao')?lista.filter(a=>a.id===params.get('avaliacao')):lista} nome={nome}/>}</>}
    {aba==='evolucao'&&<><p className="ac-muted">Seus testes de dosha, em pontos, e as leituras de {nome}.</p>{doshaResult?.idPublico?<Suspense fallback={<p>Carregando gráfico…</p>}><Grafico idPublico={doshaResult.idPublico}/></Suspense>:<p>Você ainda não fez o teste de dosha.</p>}<Button asChild variant="secondary" className="self-start"><Link to="/teste-de-dosha">Refazer o teste</Link></Button><section className="ac-card"><h3 className="ac-eti">Leituras de {nome}</h3>{lista.map(a=><div className="ac-linha" key={a.id}><div><b>{dataAcompanhamento(a.data)}</b><Leitura a={a}/></div></div>)}{!lista.length&&<p>Nenhuma avaliação liberada ainda.</p>}</section></>}
    {aba==='fotos'&&(fotos.error?<p role="alert">{fotos.error.message}</p>:!fotos.data?<p role="status">Carregando fotos…</p>:<Fotos dados={fotos.data} nome={nome}/>)}
    {aba==='conversa'&&<Chat key={l.ligacao} slug={l.terapeuta.slug}/>}
  </main>{avaliar&&<AvaliarConsulta id={avaliar} fechar={()=>setAvaliar('')}/>}</div>;
}