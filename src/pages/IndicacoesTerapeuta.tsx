import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import '@/components/terapia/indicacoes/folhaEsqueleto.css';

import {MesaHeader} from '@/components/terapia/mesa/Mesa';
import FichaIndicacoes from '@/components/terapia/indicacoes/FichaIndicacoes';
import type {FichaPaciente} from '@/lib/terapiaPaciente';
import '@/components/terapia/indicacoes/mesaIndicacoes.css';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSouTerapeuta } from '@/hooks/useSouTerapeuta';
import { terapia, diaBR, horaBR } from '@/lib/terapia';
import { INDICACOES_AUTOSAVE_MS, criarIndicacao, diagnosticoDaAvaliacao, distanciaRetorno, iniciarIndicacoes, momentosDaFolha, inserirIndicacao, moverIndicacao, situacaoIndicacoes } from '@/lib/terapiaIndicacoes';
import type { FolhaIndicacoes, FonteIndicacao, FontesIndicacoes, RascunhoIndicacoes } from '@/lib/terapiaIndicacoes';
import ComecarFolha from '@/components/terapia/indicacoes/ComecarFolha';
import Modelos from '@/components/terapia/indicacoes/Modelos';
import {modelosTerapia,juntarModelo} from '@/lib/terapiaModelos';
import Catalogo from '@/components/terapia/indicacoes/Catalogo';
import Secao from '@/components/terapia/indicacoes/Secao';
/** Editor da folha; com `sala` fica embutido na sala de consulta (sem cabeçalho, busca em gaveta); `treino` nunca grava. */
export function Editor({folha,fontes,terapeuta,userId,ficha,sala=false,treino=false,onSaveReady}:{ficha:FichaPaciente;folha:FolhaIndicacoes;fontes:FontesIndicacoes;terapeuta:string;userId?:string;sala?:boolean;treino?:boolean;onSaveReady?:(salvar:()=>Promise<boolean>)=>void}) {
 const largo=()=>!sala&&window.innerWidth>980;const [alvo,setAlvo]=useState<string|null>(null);
 const [fichaAberta,setFichaAberta]=useState(largo);const [buscaAberta,setBuscaAberta]=useState(largo);
 const navigate=useNavigate();const qc=useQueryClient();const base=`/painel-terapeuta/paciente/${folha.paciente_user_id}`;
 const [rascunho,setRascunho]=useState<RascunhoIndicacoes>(()=>({dados:iniciarIndicacoes(folha.dados),diagnostico:folha.diagnostico??'',tratamento:folha.tratamento??'',retorno:folha.retorno??''}));
 const [versao,setVersao]=useState(0);const [salva,setSalva]=useState(0);const [salvando,setSalvando]=useState(false);const [ocupado,setOcupado]=useState(false);const [erro,setErro]=useState('');const [salvoEm,setSalvoEm]=useState(folha.atualizado_em);const [enviada,setEnviada]=useState(folha.enviada_em);const [adicionar,setAdicionar]=useState<FonteIndicacao|null>(null);
 const [juntar,setJuntar]=useState(false);const [nomeModelo,setNomeModelo]=useState('');const [salvarModelo,setSalvarModelo]=useState(false);const modelos=useQuery({queryKey:['terapia-modelos',userId],queryFn:modelosTerapia.lista,enabled:juntar});
 const atual=useRef({rascunho,versao});atual.current={rascunho,versao};const fila=useRef<Promise<unknown>>(Promise.resolve());
 const mudar=(fn:(r:RascunhoIndicacoes)=>RascunhoIndicacoes)=>{setRascunho(fn);setVersao(v=>v+1);};
 const salvar=useCallback(()=>{const s=atual.current;if(treino){setSalva(s.versao);return Promise.resolve(true);}const tarefa=fila.current.catch(()=>undefined).then(async()=>{setSalvando(true);setErro('');try{const r=s.rascunho;const t=await terapia.folhaSalvar(folha.id,r.dados,r.diagnostico,r.tratamento,r.retorno);setSalva(s.versao);setSalvoEm(t);await qc.invalidateQueries({queryKey:['indicacoes-lista',userId,folha.paciente_user_id]});return true;}catch(e){setErro(e instanceof Error?e.message:String(e));return false;}finally{setSalvando(false);}});fila.current=tarefa;return tarefa;},[folha.id,folha.paciente_user_id,qc,userId,treino]);
 useEffect(()=>{onSaveReady?.(salvar);},[onSaveReady,salvar]);
 useEffect(()=>{if(versao===salva||ocupado)return;const t=setTimeout(()=>void salvar(),INDICACOES_AUTOSAVE_MS);return()=>clearTimeout(t);},[versao,salva,salvar,ocupado]);
 useEffect(()=>{const fn=(e:BeforeUnloadEvent)=>{if(!treino&&atual.current.versao!==salva){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',fn);return()=>window.removeEventListener('beforeunload',fn);},[salva]);
 const abrir=async(destino:string)=>{setOcupado(true);if(await salvar()){await Promise.all([qc.invalidateQueries({queryKey:['indicacoes-folha']}),qc.invalidateQueries({queryKey:['indicacoes-editor',userId,folha.paciente_user_id,folha.id]})]);navigate(destino);}else setOcupado(false);};
 const enviar=async()=>{if(treino){setErro('Treino: nada é enviado para ninguém.');return;}setOcupado(true);if(await salvar()){try{setEnviada(await terapia.folhaEnviar(folha.id));await qc.invalidateQueries({queryKey:['indicacoes-lista',userId,folha.paciente_user_id]});}catch(e){setErro(e instanceof Error?e.message:String(e));}}setOcupado(false);};
 const nome=folha.paciente_nome.split(' ')[0];const secoes=momentosDaFolha(folha.secoes);
 const [abertas,setAbertas]=useState<Record<string,boolean>>({});
 const [piscando,setPiscando]=useState<string|null>(null);
 const inserir=(s:string,f:FonteIndicacao)=>{const item=criarIndicacao(f);mudar(r=>({...r,dados:inserirIndicacao(r.dados,s,item)}));setAbertas(a=>({...a,[s]:true}));setPiscando(item.id);setTimeout(()=>setPiscando(p=>p===item.id?null:p),1500);setTimeout(()=>document.getElementById(`ind-item-${item.id}`)?.scrollIntoView({behavior:'smooth',block:'center'}),60);if(!largo())setBuscaAberta(false);};
 const mover=(id:string,s:string,i?:number)=>mudar(r=>({...r,dados:moverIndicacao(r.dados,id,s,i)}));
 const mudarItem=(id:string,campo:'nota'|'dias',v:unknown)=>mudar(r=>({...r,dados:{...r.dados,secoes:Object.fromEntries(Object.entries(r.dados.secoes).map(([s,itens])=>[s,itens.map(i=>{if(i.id!==id)return i;const novo={...i,[campo]:v};if(campo==='dias'&&(v as number[]).length===7)delete novo.dias;return novo;})]))}}));
 const sensores=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 const quando=distanciaRetorno(rascunho.retorno);
 // "O que está acontecendo" cresce com o texto, sem rolagem interna.
 const areaRef=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{const el=areaRef.current;if(!el)return;el.style.height='auto';el.style.height=`${el.scrollHeight+2}px`;},[rascunho.diagnostico]);
 const usarModelo=async(m:{id:string})=>{setOcupado(true);try{const modelo=await modelosTerapia.modelo(m.id);mudar(r=>({...r,dados:juntarModelo(r.dados,iniciarIndicacoes(modelo.dados??{})),diagnostico:[r.diagnostico,modelo.tratamento].filter(t=>t?.trim()).join('\n')}));setJuntar(false);}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}};
 const Raiz=sala?'div':'main';
 return <Raiz className={`mesa-indicacoes fe ${sala?'fe-sala':'mesa'}`}>{!sala&&<MesaHeader nome={terapeuta}/>}
 {sala?<div className="fe-barra"><div className="fe-acoes"><Button disabled={ocupado||treino} onClick={()=>setJuntar(true)}>Usar uma folha pronta</Button><Button data-terapia-principal variant="secondary" disabled={ocupado} onClick={()=>void enviar()}>{enviada?'Reenviar com ajustes':`Enviar para ${nome}`}</Button></div></div>:<div className="fe-barra"><p className="fe-volta"><Button variant="link" disabled={ocupado} onClick={()=>void abrir(`${base}?aba=consultas`)}>← {folha.paciente_nome}</Button><small> · Consulta de {new Date(folha.criado_em).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} · {folha.avaliacao?'Avaliação concluída · ':''}{situacaoIndicacoes({enviada_em:enviada})}</small></p>
  <div className="fe-acoes"><Button disabled={ocupado} onClick={()=>setJuntar(true)}>Usar uma folha pronta</Button><Button variant="outline" disabled={ocupado||salvando} onClick={()=>setSalvarModelo(true)}>Salvar como folha pronta</Button><Button variant="outline" disabled={ocupado||salvando} onClick={()=>void abrir(`${base}/indicacoes/${folha.id}/folha`)}>Ver para imprimir</Button><Button data-terapia-principal variant="secondary" disabled={ocupado} onClick={()=>void enviar()}>{enviada?'Reenviar com ajustes':`Enviar para ${nome}`}</Button></div></div>}
 <p role="status" aria-live="polite" className="fe-nota">{treino?'Treino: nada aqui é salvo nem enviado.':enviada?`Enviada em ${diaBR(enviada)}. Mudanças só chegam quando você reenviar.`:'A pessoa só vê esta folha depois que você enviar.'} · {salvando?'Salvando…':versao!==salva?'Alterações não salvas':`Salvo às ${horaBR(salvoEm)}`}</p>
 {erro&&<p role="alert" className="px-4 text-sm text-destructive">{erro}</p>}
 <DndContext sensors={sensores} onDragEnd={({active,over})=>{if(!over||ocupado)return;const destino=over.data.current?.secao as string|undefined;if(!destino)return;const f=active.data.current?.fonte as FonteIndicacao|undefined;if(f)inserir(destino,f);else{const i=(rascunho.dados.secoes[destino]??[]).findIndex(item=>item.id===over.id);mover(String(active.id),destino,i<0?undefined:i);}}}>
 <div aria-busy={ocupado} className={`fe-corpo ${fichaAberta?'':'sem-ficha'} ${buscaAberta?'':'sem-busca'} ${ocupado?'pointer-events-none opacity-70':''}`}>
  {fichaAberta&&!sala&&<div className="fe-ficha"><FichaIndicacoes ficha={ficha} folha={folha} userId={userId} fechar={()=>setFichaAberta(false)}/></div>}
  <div className="fe-meio">
   <div className="fe-mob">{!fichaAberta&&!sala&&<Button variant="outline" size="sm" onClick={()=>setFichaAberta(true)}>Ver ficha</Button>}</div>
   {!fichaAberta&&!sala&&<Button variant="outline" size="sm" className="fe-ver-ficha" onClick={()=>setFichaAberta(true)}>Ver ficha</Button>}
   <article className="fe-papel">
    <div className="fe-parte"><span>1</span><h3>O que está acontecendo</h3>{folha.avaliacao&&!treino&&<button type="button" className="fe-link" onClick={()=>mudar(r=>({...r,diagnostico:[r.diagnostico,diagnosticoDaAvaliacao(folha.avaliacao)].filter(t=>t.trim()).join('\n')}))}>Trazer da avaliação</button>}</div>
    <Textarea ref={areaRef} rows={3} aria-label="O que está acontecendo" className="fe-area" placeholder="Em palavras simples: o que está acontecendo e o que vamos fazer" value={rascunho.diagnostico} onChange={e=>mudar(r=>({...r,diagnostico:e.target.value}))}/>
    <div className="fe-parte"><span>2</span><h3>O que fazer</h3></div>
    {secoes.map(s=><Secao key={s.chave} secao={s} itens={rascunho.dados.secoes[s.chave]??[]} aberta={sala||(abertas[s.chave]??false)} abrir={()=>setAbertas(a=>({...a,[s.chave]:true}))} piscando={piscando} buscar={()=>{setAlvo(sala?s.chave:null);setBuscaAberta(true);}} rotuloBuscar={sala?'+ Buscar':undefined} livre={(s,t)=>inserir(s,{titulo:t,tipo:'texto'})} nota={(id,v)=>mudarItem(id,'nota',v)} dias={(id,v)=>mudarItem(id,'dias',v)} tirar={id=>mudar(r=>({...r,dados:{...r.dados,secoes:Object.fromEntries(Object.entries(r.dados.secoes).map(([s,itens])=>[s,itens.filter(i=>i.id!==id)]))}}))}/>)}
    <div className="fe-parte"><span>3</span><h3>Próxima consulta</h3></div>
    <div className="fe-data"><Input aria-label="Próxima consulta" type="date" value={rascunho.retorno} onChange={e=>mudar(r=>({...r,retorno:e.target.value}))}/>{quando&&<small>{quando}</small>}</div>
   </article>
  </div>
  {sala?<Sheet open={buscaAberta} onOpenChange={v=>{setBuscaAberta(v);if(!v)setAlvo(null);}}><SheetContent side="right" className="fe-gaveta mesa w-full p-0 sm:max-w-md"><SheetTitle className="sr-only">Buscar para {secoes.find(x=>x.chave===alvo)?.titulo??'a folha'}</SheetTitle>{alvo&&<p className="fe-gaveta-alvo">Adicionando em <b>{secoes.find(x=>x.chave===alvo)?.titulo}</b></p>}<Catalogo fontes={fontes} nome={nome} rotuloAdicionar={alvo?'Adicionar neste momento':undefined} adicionar={f=>{if(alvo){inserir(alvo,f);setBuscaAberta(false);setAlvo(null);}else setAdicionar(f);}} itens={Object.values(rascunho.dados.secoes).flat()}/></SheetContent></Sheet>:buscaAberta?<div className="fe-lado"><Catalogo fontes={fontes} nome={nome} adicionar={setAdicionar} fechar={()=>setBuscaAberta(false)} itens={Object.values(rascunho.dados.secoes).flat()}/></div>:<Button className="fe-buscar-fixo" onClick={()=>setBuscaAberta(true)}><Search className="mr-1 h-4 w-4"/>Buscar</Button>}
 </div></DndContext>
 <Dialog open={!!adicionar} onOpenChange={v=>{if(!v)setAdicionar(null);}}><DialogContent><DialogHeader><DialogTitle>Em qual momento?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{adicionar?.titulo??adicionar?.nome}</p><div className="grid gap-2">{secoes.map(s=><Button key={s.chave} variant="outline" className="justify-start" onClick={()=>{if(adicionar)inserir(s.chave,adicionar);setAdicionar(null);}}>{s.titulo}</Button>)}</div></DialogContent></Dialog>
 <Dialog open={salvarModelo} onOpenChange={v=>{if(!ocupado)setSalvarModelo(v);}}><DialogContent><DialogTitle>Salvar como folha pronta</DialogTitle><Input aria-label="Nome da folha pronta" value={nomeModelo} onChange={e=>setNomeModelo(e.target.value)}/><Button className="px-4 py-2" disabled={ocupado||!nomeModelo.trim()} onClick={async()=>{setOcupado(true);try{if(await salvar()){await modelosTerapia.salvar(folha.id,nomeModelo);await qc.invalidateQueries({queryKey:['terapia-modelos']});setSalvarModelo(false);setNomeModelo('');}}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}}}>Salvar</Button>{erro&&<p role="alert">{erro}</p>}</DialogContent></Dialog>
 <Dialog open={juntar} onOpenChange={v=>{if(!ocupado)setJuntar(v);}}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl"><DialogTitle>Usar uma folha pronta</DialogTitle>{modelos.error&&<p role="alert">{modelos.error.message}</p>}{modelos.isPending?<p role="status">Carregando folhas prontas…</p>:<Modelos lista={modelos.data??[]} dosha={fontes.dosha} sintomas={fontes.queixas??[]} ocupado={ocupado} usar={m=>void usarModelo(m)}/>}</DialogContent></Dialog>
 </Raiz>;
}
export default function IndicacoesTerapeuta() {
 const {id,folhaId}=useParams();const [params]=useSearchParams();const acesso=useSouTerapeuta();const navigate=useNavigate();const [erroNova,setErroNova]=useState('');const criando=useRef(false);
 const ficha=useQuery({queryKey:['paciente-ficha',acesso.userId,id],queryFn:()=>{if(!id)throw new Error('Paciente não encontrado.');return terapia.ficha(id);},enabled:acesso.permitido&&!!id,retry:false});
 const q=useQuery({queryKey:['indicacoes-editor',acesso.userId,id,folhaId],enabled:acesso.permitido&&!!ficha.data&&!!folhaId&&folhaId!=='nova',retry:false,queryFn:async()=>{if(!id||!folhaId)throw new Error('Folha não encontrada.');const [folha,fontes,painel]=await Promise.all([terapia.folha(folhaId),terapia.indicacoesFontes(id),terapia.painel()]);if(folha.paciente_user_id!==id)throw new Error('Folha não encontrada.');return {folha,fontes,painel};}});
 if(!acesso.carregando&&!acesso.permitido&&!acesso.error)return <Navigate to="/" replace/>;
 const erro=acesso.error?.message||ficha.error?.message||erroNova||q.error?.message;
 if(acesso.permitido&&ficha.data&&id&&folhaId==='nova')return <ComecarFolha paciente={id} avaliacao={params.get('avaliacao')??undefined} consulta={params.get('consulta')??undefined}/>;
 return <><Helmet><title>Ficha de indicações | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow"/></Helmet>{erro?<main className="mx-auto max-w-6xl space-y-4 p-6"><p role="alert">{erro}</p><Button variant="outline" asChild><Link to={`/painel-terapeuta/paciente/${id}?aba=consultas`}>Voltar para a paciente</Link></Button></main>:!q.data?<main role="status" className="p-8">Carregando indicações…</main>:<Editor key={q.data.folha.id} folha={q.data.folha} fontes={q.data.fontes} terapeuta={q.data.painel?.terapeuta.nome??''} userId={acesso.userId} ficha={ficha.data as FichaPaciente}/>}</>;
}