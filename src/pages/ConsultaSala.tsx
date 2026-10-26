import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {Link,Navigate,useNavigate,useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {Helmet} from 'react-helmet-async';
import {Star,Copy} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import CTAButton from '@/components/CTAButton';
import {useUser} from '@/contexts/UserContext';
import {useSouTerapeuta} from '@/hooks/useSouTerapeuta';
import {terapia} from '@/lib/terapia';
import {meu,dataExtenso} from '@/lib/terapiaMeu';
import {isInAppBrowser} from '@/lib/inAppBrowser';
import {sala,faseSala,fichaTreino,presencaRecente,ESPERA_SALA_MS,AO_VIVO_MS} from '@/lib/consultaSala';
import type {SalaConsulta,SalaTreino} from '@/lib/consultaSala';
import type {Avaliacao} from '@/lib/terapiaAvaliacao';
import CameraPrevia from '@/components/terapia/sala/CameraPrevia';
import VideoConsulta from '@/components/terapia/sala/VideoConsulta';
import '@/components/terapia/sala/sala.css';
const Editor=lazy(()=>import('./AvaliacaoTerapeuta').then(m=>({default:m.Editor})));
function Encerrada({dados}:{dados:SalaConsulta}) {
 const [nota,setNota]=useState(0);const [comentario,setComentario]=useState('');const [enviada,setEnviada]=useState(dados.ja_avaliou);const [ocupado,setOcupado]=useState(false);const [erro,setErro]=useState('');
 const ligacoes=useQuery({queryKey:['sala-retorno',dados.consulta],queryFn:meu.terapeuta});
 const terapeuta=ligacoes.data?.find(t=>t.historico.some(c=>c.id===dados.consulta)||t.proxima?.id===dados.consulta);
 return <main className="mx-auto max-w-xl space-y-6 px-5 py-12"><h1 className="font-serif text-3xl font-bold">Consulta encerrada</h1><p>Suas indicações ficam em Meu Perfil, Meu terapeuta. Você também pode acompanhar sua rotina.</p>{enviada?<p role="status">Obrigado pela avaliação</p>:<form className="space-y-4" onSubmit={async e=>{e.preventDefault();setOcupado(true);setErro('');try{await sala.avaliar(dados.consulta,nota,comentario);setEnviada(true);}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}}}><h2 className="font-serif text-lg">Como foi a consulta?</h2><div className="flex gap-2" role="group" aria-label="Nota da consulta">{[1,2,3,4,5].map(n=><Button type="button" key={n} variant="ghost" size="icon" aria-label={`${n} ${n===1?'estrela':'estrelas'}`} aria-pressed={nota===n} className={n<=nota?'text-secondary':''} onClick={()=>setNota(n)}><Star className={n<=nota?'fill-current':''}/></Button>)}</div><Textarea aria-label="Comentário opcional" placeholder="Comentário (opcional)" value={comentario} onChange={e=>setComentario(e.target.value)}/><CTAButton disabled={!nota||ocupado} type="submit" className="px-5 py-2">Enviar avaliação</CTAButton>{erro&&<p role="alert">{erro}</p>}</form>}<div className="flex flex-wrap gap-3"><Button variant="outline" asChild><Link to={terapeuta?`/terapeutas/${terapeuta.terapeuta.slug}#agenda`:dados.terapeuta.slug?`/terapeutas/${dados.terapeuta.slug}#agenda`:'/meu-perfil#meu-terapeuta'}>Marcar o retorno</Link></Button><CTAButton asChild className="px-5 py-2"><Link to="/minha-rotina">Ir para a Minha Rotina</Link></CTAButton></div></main>;
}
function FichaSala({dados,userId,treino,videoTopo,onQuadroChange,onSaveReady}:{onQuadroChange?:(aberto:boolean)=>void;onSaveReady?:(salvar:()=>Promise<boolean>)=>void;dados?:SalaConsulta;userId:string;treino?:SalaTreino;videoTopo?:React.ReactNode}) {
 const criando=useRef<Promise<string>>();const [erro,setErro]=useState('');
 const ficha=useQuery({queryKey:['sala-ficha',userId,dados?.paciente_id],queryFn:()=>terapia.ficha(dados?.paciente_id??''),enabled:!!dados});
 const avaliacao=useQuery({queryKey:['sala-avaliacao',userId,dados?.consulta],queryFn:async()=>{if(!dados)throw new Error('Consulta não encontrada');let id=dados.avaliacao_id;if(!id){criando.current??=terapia.avaliacaoNova(dados.paciente_id,dados.consulta);id=await criando.current;}return terapia.avaliacao(id);},enabled:!!dados&&!!ficha.data,retry:false});
 const conteudo=useQuery({queryKey:['avaliacao-conteudo',userId],queryFn:terapia.fichaConteudo});const biblioteca=useQuery({queryKey:['avaliacao-biblioteca',userId],queryFn:terapia.biblioteca,enabled:!treino});
 const f=treino?fichaTreino(treino):ficha.data;
 const a:Avaliacao|undefined=treino?{id:'treino',paciente_id:'treino',paciente_nome:treino.paciente.nome,consulta_id:null,consulta_inicio:null,dados:{},leitura:null,resumo:'',criado_em:new Date().toISOString(),atualizado_em:new Date().toISOString()}:avaliacao.data;
 const falha=erro||ficha.error?.message||avaliacao.error?.message||conteudo.error?.message||biblioteca.error?.message;
 useEffect(()=>{setErro('');},[dados?.consulta]);
 if(falha)return <div role="alert" className="sala-ficha">{falha}<Button variant="outline" onClick={()=>{criando.current=undefined;void ficha.refetch();void avaliacao.refetch();}}>Tentar novamente</Button></div>;
 if(!f||!a||!conteudo.data||(!treino&&!biblioteca.data))return <div role="status" className="sala-ficha">Carregando ficha…</div>;
 return <Suspense fallback={<p role="status">Carregando ficha…</p>}><Editor key={a.id} onQuadroChange={onQuadroChange} onSaveReady={onSaveReady} embedded treino={!!treino} consulta={dados?.consulta} videoTopo={videoTopo} fotosTreino={treino?.fotos} avaliacao={a} ficha={f} conteudo={conteudo.data} biblioteca={biblioteca.data??{}} userId={userId}/></Suspense>;
}
function Treino({userId}:{userId:string}) {
 const acesso=useSouTerapeuta();const config=useQuery({queryKey:['sala-treino-config'],queryFn:terapia.config,enabled:acesso.permitido});
 const dados=(config.data as (typeof config.data & {sala_treino?:SalaTreino}))?.sala_treino;
 if(acesso.carregando)return <p role="status" className="p-8">Carregando…</p>;
 if(!acesso.permitido)return <Navigate to="/" replace/>;
 if(!dados)return <p className="p-8" role={config.error?'alert':'status'}>{config.error?.message??'Carregando sala de treino…'}</p>;
 const video=<div className="grid gap-4 p-4 sm:grid-cols-2"><div className="sala-camera font-serif text-xl">Paciente exemplo</div><CameraPrevia/></div>;
 return <><header className="mx-auto max-w-7xl space-y-3 px-5 py-6"><Button variant="outline" asChild><Link to="/painel-terapeuta">← Portal do terapeuta</Link></Button><h1 className="font-serif text-2xl font-bold">{dados.titulo}</h1><p className="text-sm">{dados.texto}</p><p className="text-sm">Treino: nada aqui é salvo.</p></header><div className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><section>{video}</section><FichaSala userId={userId} treino={dados} videoTopo={<div className="sala-video-no-quadro grid grid-cols-2 gap-3 p-3"><div className="sala-camera">Paciente exemplo</div><CameraPrevia/></div>}/></div></>;
}
export default function ConsultaSala() {
 const {id}=useParams();const {user,loading,isAnonymous}=useUser();const navigate=useNavigate();const [agora,setAgora]=useState(Date.now());const [entrou,setEntrou]=useState(false);const [encerrou,setEncerrou]=useState(false);const [camera,setCamera]=useState(false);const [copiado,setCopiado]=useState(false);const [quadroAberto,setQuadroAberto]=useState(false);const salvarFicha=useRef<()=>Promise<boolean>>(async()=>true);const registrarSalvar=useCallback((fn:()=>Promise<boolean>)=>{salvarFicha.current=fn;},[]);
 const consulta=useQuery({queryKey:['consulta-sala',user?.id,id],queryFn:()=>sala.consultar(id??''),enabled:!!user&&!isAnonymous&&id!=='treino',refetchInterval:ESPERA_SALA_MS,retry:false});
 const dados=consulta.data;const fase=dados?faseSala(dados,agora):null;const fechada=encerrou||fase==='encerrada';
 const vivo=useQuery({queryKey:['consulta-ao-vivo',user?.id,id],queryFn:()=>sala.aoVivo(id??''),enabled:entrou&&!fechada&&dados?.papel==='paciente',refetchInterval:AO_VIVO_MS,retry:false});
 const quadro=vivo.data?.quadro;const imagem=useQuery({queryKey:['consulta-quadro-url',quadro?.path,quadro?.atualizado_em],queryFn:()=>terapia.arquivoAssinado(quadro?.bucket??'terapia-quadros',quadro?.path??''),enabled:!!quadro,gcTime:0,staleTime:0});
 const fotos=useQuery({queryKey:['sala-minhas-fotos',user?.id],queryFn:meu.fotos,enabled:dados?.papel==='paciente'&&!entrou});
 useEffect(()=>{const t=setInterval(()=>setAgora(Date.now()),1000);return()=>clearInterval(t);},[]);
 const sair=useCallback(()=>{if(dados?.papel==='terapeuta'){void (async()=>{if(!(await salvarFicha.current()))return;await sala.mostrar(dados.consulta,null).catch(()=>undefined);await sala.gravando(dados.consulta,false).catch(()=>undefined);navigate(`/painel-terapeuta/paciente/${dados.paciente_id}`);})();}else{setEntrou(false);setEncerrou(true);}},[dados,navigate]);
 useEffect(()=>{if(entrou&&fase==='encerrada')sair();},[entrou,fase,sair]);
 if(loading)return <p role="status" className="p-8">Carregando…</p>;
 if(!user||isAnonymous)return <Navigate to={`/entrar?redirect=${encodeURIComponent(`/consulta/${id??''}`)}`} replace/>;
 const head=<Helmet><title>{id==='treino'?'Sala de treino':'Sala da consulta'} | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow"/></Helmet>;
 if(id==='treino')return <div className="consulta-sala">{head}<Treino userId={user.id}/></div>;
 if(consulta.error||!dados)return <div className="consulta-sala">{head}<main className="mx-auto max-w-xl space-y-5 p-8"><p role={consulta.error?'alert':'status'}>{consulta.error?'Consulta não encontrada':'Carregando consulta…'}</p>{consulta.error&&<Button variant="outline" asChild><Link to="/meu-perfil">Voltar para Meu Perfil</Link></Button>}</main></div>;
 if(isInAppBrowser())return <div className="consulta-sala">{head}<main className="mx-auto max-w-lg space-y-5 p-6"><h1 className="font-serif text-2xl font-bold">Abra no Chrome ou no Safari</h1><p>A câmera e o microfone não funcionam bem no navegador do Instagram ou do Facebook.</p><ol className="list-decimal space-y-3 pl-5"><li>Toque nos três pontos do navegador.</li><li>Escolha abrir no navegador externo.</li><li>Entre na sua conta e abra este link.</li></ol><Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopiado(true);}catch{setCopiado(false);}}}><Copy className="mr-2 h-4 w-4"/>{copiado?'Link copiado':'Copiar o link da sala'}</Button></main></div>;
 if(fechada)return <div className="consulta-sala">{head}{dados.papel==='paciente'?<Encerrada dados={dados}/>:<main className="p-8"><h1>Consulta encerrada</h1><Button asChild variant="outline"><Link to={`/painel-terapeuta/paciente/${dados.paciente_id}`}>Voltar para a ficha da pessoa</Link></Button></main>}</div>;
 if(fase==='cancelada')return <div className="consulta-sala">{head}<main className="p-8">Consulta cancelada<Button asChild variant="outline"><Link to="/meu-perfil">Meu Perfil</Link></Button></main></div>;
 if(!entrou){const segundos=Math.max(0,Math.ceil((Date.parse(dados.abre_em)-agora)/1000));const enviadas=fotos.data?.guiadas?.filter(g=>fotos.data?.fotos.some(f=>f.tipo===g.chave)).length??0;return <div className="consulta-sala">{head}<main className="mx-auto max-w-3xl space-y-6 px-5 py-8"><header className="space-y-3"><h1 className="font-serif text-2xl font-bold">Consulta com {dados.papel==='paciente'?dados.terapeuta.primeiro_nome:dados.paciente_nome}</h1><p>{dataExtenso(dados.inicio)}</p></header>{fase==='aguarde'?<p role="timer">A sala abre em {Math.floor(segundos/3600)}h {Math.floor(segundos%3600/60)}min {segundos%60}s</p>:<><CameraPrevia mudar={setCamera}/><ul className="space-y-2 text-sm"><li>✓ Chrome ou Safari</li><li>{camera?'✓':'○'} Câmera e microfone</li><li>Use fone, se tiver.</li>{dados.papel==='paciente'&&<li>Fotos enviadas: {enviadas} de {fotos.data?.guiadas?.length??7}{fotos.error&&<p role="alert">{fotos.error.message}</p>}</li>}</ul>{dados.papel==='paciente'&&!presencaRecente(dados.presenca?.terapeuta,agora)&&<p role="status">Esperando a {dados.terapeuta.primeiro_nome} entrar…</p>}<CTAButton className="px-5 py-3" onClick={()=>setEntrou(true)}>Entrar na consulta</CTAButton></>}</main></div>;}
 const video=<VideoConsulta codigo={dados.codigo} consulta={dados.consulta} terapeuta={dados.papel==='terapeuta'} sair={sair} compacto={!!quadro||quadroAberto} quadroAberto={quadroAberto}/>;
 return <div className="consulta-sala">{head}<header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 px-5 py-4"><h1 className="font-serif text-lg font-bold">{dados.papel==='terapeuta'?dados.paciente_nome:`Consulta com ${dados.terapeuta.primeiro_nome}`}</h1><span className="text-sm">{Math.max(0,Math.floor((agora-Date.parse(dados.inicio))/60000))} min</span></header>{dados.papel==='terapeuta'?<main className="mx-auto grid max-w-[1700px] gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"><section>{video}</section><FichaSala dados={dados} userId={user.id} onQuadroChange={setQuadroAberto} onSaveReady={registrarSalvar} videoTopo={<div id="sala-video-quadro" className="sala-video-no-quadro"/>}/></main>:<main className="mx-auto max-w-6xl space-y-4 p-4">{vivo.data?.gravando&&<p role="status" className="border border-secondary p-3 text-sm">A {dados.terapeuta.primeiro_nome} está gravando no computador dela</p>}{quadro&&<section><p className="mb-3 text-sm">A {dados.terapeuta.primeiro_nome} está mostrando</p>{imagem.data&&<img src={imagem.data} alt="Quadro de aula compartilhado" className="max-h-[64dvh] w-full object-contain"/>}{imagem.error&&<p role="alert">{imagem.error.message}</p>}</section>}{video}{vivo.error&&<p role="alert">{vivo.error.message}</p>}</main>}</div>;
}