import {memo,lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {Link,Navigate,useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {Helmet} from 'react-helmet-async';
import {Star,Copy} from 'lucide-react';
import {Textarea} from '@/components/ui/textarea';
import {useUser} from '@/contexts/UserContext';
import {useSouTerapeuta} from '@/hooks/useSouTerapeuta';
import {terapia,diaBR} from '@/lib/terapia';
import {meu,dataExtenso} from '@/lib/terapiaMeu';
import {isInAppBrowser} from '@/lib/inAppBrowser';
import {sala,faseSala,destinoSaida,fichaTreino,presencaRecente,enderecoTreinoPessoa,ESPERA_SALA_MS,AO_VIVO_MS} from '@/lib/consultaSala';
import type {SalaConsulta,SalaTreino} from '@/lib/consultaSala';
import type {Avaliacao} from '@/lib/terapiaAvaliacao';
import type {QuadroSalvo} from '@/lib/terapiaQuadro';
import {MesaHeader} from '@/components/terapia/mesa/Mesa';
import FimConsulta from '@/components/terapia/sala/FimConsulta';
import CameraPrevia from '@/components/terapia/sala/CameraPrevia';
import VideoConsulta,{SLOT_CONTROLES,SLOT_VIDEO} from '@/components/terapia/sala/VideoConsulta';
import '@/components/terapia/sala/sala.css';
const Editor=lazy(()=>import('./AvaliacaoTerapeuta').then(m=>({default:m.Editor})));
const primeiro=(n:string)=>n.split(' ')[0];
const minutos=(de:string,ate:number)=>Math.max(0,Math.floor((ate-Date.parse(de))/60000));
function navegador(){const ua=navigator.userAgent;return /Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':/Firefox\//.test(ua)?'Firefox':'navegador';}

/** Cabeçalho escuro da sala da pessoa. */
function CabecaPessoa({titulo,detalhe,gravando}:{titulo:string;detalhe:string;gravando?:string}) {
 return <header className="sala-p-hdr"><span><b>{titulo}</b> <span className="tempo">· {detalhe}</span></span>{gravando&&<span className="gravando">{gravando}</span>}</header>;
}
/** Quadro que a terapeuta está mostrando, como a pessoa vê. */
function QuadroMostrado({nome,item,em,imagem,erro}:{nome:string;item:string;em?:string;imagem?:string;erro?:string}) {
 const [visivel,setVisivel]=useState<string>();useEffect(()=>{if(!imagem)return;let ativo=true;const img=new Image();img.onload=()=>{if(ativo)setVisivel(imagem);};img.src=imagem;return()=>{ativo=false;};},[imagem]);
 return <section className="sala-p-quadro" aria-label="Quadro de aula compartilhado"><p className="m-eti">A {nome.toUpperCase()} ESTÁ MOSTRANDO: {item.toUpperCase()}{em?` · ${diaBR(em)}`:''}</p>{visivel&&<img src={visivel} alt={`Quadro: ${item}`}/>}{erro&&<p role="alert">{erro}</p>}<p className="nota">Ela pode mostrar fotos, os subdoshas, os 7 dhatus e riscar por cima. Você só vê; a {nome} guarda o quadro depois.</p></section>;
}
function Encerrada({dados,agora}:{dados:SalaConsulta;agora:number}) {
 const [nota,setNota]=useState(0);const [comentario,setComentario]=useState('');const [enviada,setEnviada]=useState(dados.ja_avaliou);const [ocupado,setOcupado]=useState(false);const [erro,setErro]=useState('');
 const ligacoes=useQuery({queryKey:['sala-retorno',dados.consulta],queryFn:meu.terapeuta});
 const terapeuta=ligacoes.data?.find(t=>t.historico.some(c=>c.id===dados.consulta)||t.proxima?.id===dados.consulta);
 const nome=dados.terapeuta.primeiro_nome;const duracao=Math.max(1,Math.round((Math.min(agora,Date.parse(dados.fim))-Date.parse(dados.inicio))/60000));
 const retorno=terapeuta?`/terapeutas/${terapeuta.terapeuta.slug}#agenda`:dados.terapeuta.slug?`/terapeutas/${dados.terapeuta.slug}#agenda`:'/meu-acompanhamento?aba=consultas';
 return <div className="sala-p-centro"><main className="sala-fim"><h1>Consulta encerrada · {duracao} min</h1><p>A {nome} vai preparar as suas indicações. Quando ela mandar, as indicações aparecem em Meu acompanhamento.</p>{enviada?<p role="status">Obrigado pela avaliação</p>:<form className="space-y-3" onSubmit={async e=>{e.preventDefault();setOcupado(true);setErro('');try{await sala.avaliar(dados.consulta,nota,comentario);setEnviada(true);}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}}}><h2 className="font-serif text-lg font-bold">Como foi a consulta?</h2><div className="estrelas" role="group" aria-label="Nota da consulta">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={`${n} ${n===1?'estrela':'estrelas'}`} aria-pressed={nota===n} className={n<=nota?'on':''} onClick={()=>setNota(n)}><Star className={`h-7 w-7 ${n<=nota?'fill-current':''}`}/></button>)}</div><Textarea aria-label="Comentário opcional" placeholder="Comentário (opcional)" value={comentario} onChange={e=>setComentario(e.target.value)}/><button data-terapia-principal className="m-btn pri" disabled={!nota||ocupado} type="submit">Enviar avaliação</button>{erro&&<p role="alert">{erro}</p>}</form>}<div className="acoes"><Link className="m-btn sal" to={retorno}>Marcar o retorno</Link><Link className="m-btn" to="/meu-acompanhamento">Ver em Meu acompanhamento</Link></div></main></div>;
}
function FichaSalaConteudo({dados,userId,treino,videoTopo,onQuadroChange,onSaveReady,onQuadroLocal,onExibir}:{onQuadroChange?:(aberto:boolean)=>void;onSaveReady?:(salvar:()=>Promise<boolean>)=>void;onQuadroLocal?:(q:QuadroSalvo)=>void;onExibir?:(v:boolean)=>void;dados?:SalaConsulta;userId:string;treino?:SalaTreino;videoTopo?:React.ReactNode}) {
 const criando=useRef<Promise<string>>();const [erro,setErro]=useState('');
 const ficha=useQuery({queryKey:['sala-ficha',userId,dados?.paciente_id],queryFn:()=>terapia.ficha(dados?.paciente_id??''),enabled:!!dados});
 const avaliacao=useQuery({queryKey:['sala-avaliacao',userId,dados?.consulta],queryFn:async()=>{if(!dados)throw new Error('Consulta não encontrada');let id=dados.avaliacao_id;if(!id){criando.current??=terapia.avaliacaoNova(dados.paciente_id,dados.consulta);id=await criando.current;}return terapia.avaliacao(id);},enabled:!!dados&&!!ficha.data,retry:false});
 const conteudo=useQuery({queryKey:['avaliacao-conteudo',userId],queryFn:terapia.fichaConteudo});const biblioteca=useQuery({queryKey:['avaliacao-biblioteca',userId],queryFn:terapia.biblioteca,enabled:!treino});
 const f=treino?fichaTreino(treino):ficha.data;
 const a:Avaliacao|undefined=treino?{id:'treino',paciente_id:'treino',paciente_nome:treino.paciente.nome,consulta_id:null,consulta_inicio:null,dados:{},leitura:null,resumo:'',criado_em:new Date().toISOString(),atualizado_em:new Date().toISOString()}:avaliacao.data;
 const falha=erro||ficha.error?.message||avaliacao.error?.message||conteudo.error?.message||biblioteca.error?.message;
 useEffect(()=>{setErro('');},[dados?.consulta]);
 if(falha)return <div role="alert" className="space-y-3 p-5">{falha}<button type="button" className="m-btn" onClick={()=>{criando.current=undefined;void ficha.refetch();void avaliacao.refetch();}}>Tentar novamente</button></div>;
 if(!f||!a||!conteudo.data||(!treino&&!biblioteca.data))return <div role="status" className="p-5">Carregando ficha…</div>;
 return <Suspense fallback={<p role="status" className="p-5">Carregando ficha…</p>}><Editor key={a.id} onQuadroChange={onQuadroChange} onSaveReady={onSaveReady} onQuadroLocal={onQuadroLocal} onExibir={onExibir} embedded treino={!!treino} consulta={dados?.consulta} videoTopo={videoTopo} fotosTreino={treino?.fotos} avaliacao={a} ficha={f} conteudo={conteudo.data} biblioteca={biblioteca.data??{}} userId={userId}/></Suspense>;
}
const FichaSala=memo(FichaSalaConteudo);
const slotQuadro=<><div id={SLOT_VIDEO} className="slot" aria-hidden="true"/><div id={SLOT_CONTROLES} className="ctl"/></>;
function Treino({userId}:{userId:string}) {
 const acesso=useSouTerapeuta();const config=useQuery({queryKey:['sala-treino-config'],queryFn:terapia.config,enabled:acesso.permitido});
 const video=useQuery({queryKey:['sala-treino-video',userId],queryFn:sala.treino,enabled:acesso.permitido,retry:false,staleTime:0});
 useEffect(()=>{if(!video.data)return;const tempo=Date.parse(video.data.fecha_em)-Date.now();if(tempo<=0){void video.refetch();return;}const t=setTimeout(()=>void video.refetch(),Math.min(tempo,2147483647));return()=>clearTimeout(t);},[video.data?.fecha_em]);
 const [quadroAberto,setQuadroAberto]=useState(false);const [vista,setVista]=useState(false);const [mostrado,setMostrado]=useState<QuadroSalvo|null>(null);const [exibindo,setExibindo]=useState(false);const [copiado,setCopiado]=useState('');const [saiu,setSaiu]=useState(false);
 const dados=(config.data as (typeof config.data & {sala_treino?:SalaTreino}))?.sala_treino;
 if(acesso.carregando)return <p role="status" className="p-8">Carregando…</p>;
 if(!acesso.permitido)return <Navigate to="/" replace/>;
 if(!dados)return <p className="p-8" role={config.error?'alert':'status'}>{config.error?.message??'Carregando sala de treino…'}</p>;
 const copiar=async()=>{if(!video.data)return;try{await navigator.clipboard.writeText(enderecoTreinoPessoa(window.location.origin,video.data.codigo_paciente));setCopiado('Endereço copiado');}catch{setCopiado('Não foi possível copiar');}};
 const quadroVisto=exibindo?mostrado:null;
 return <><MesaHeader userId={userId}/><div className="m-treino"><span>{dados.titulo} · Treino: nada aqui é salvo.</span><button type="button" className="m-btn" aria-pressed={vista} onClick={()=>setVista(!vista)}>{vista?'Fechar a vista da pessoa':'Ver como a pessoa vê'}</button><button type="button" className="m-btn" disabled={!video.data} onClick={()=>void copiar()}><Copy className="mr-1 inline h-4 w-4"/>Abrir como pessoa em outro aparelho</button>{copiado&&<span role="status" className="!mr-0">{copiado}</span>}<Link className="m-btn" to="/painel-terapeuta">← Portal do terapeuta</Link></div>
  <main className="mesa-sala"><section className="mesa-sala-video">{video.error?<p role="alert" className="p-6">{video.error.message}</p>:!video.data?<p role="status" className="p-6">Abrindo o vídeo do treino…</p>:saiu?<div className="grid flex-1 place-items-center gap-3 p-6 text-center"><p>Você saiu do vídeo do treino.</p><button type="button" className="m-btn" onClick={()=>{void video.refetch();setSaiu(false);}}>Entrar de novo</button></div>:<VideoConsulta treino onRetry={video.refetch} codigo={video.data.codigo} consulta="treino" terapeuta terapeutaNome="você" pessoaNome={dados.paciente.nome} sair={()=>setSaiu(true)} quadroAberto={quadroAberto}/>}</section><aside className="mesa-sala-ficha"><FichaSala userId={userId} treino={dados} onQuadroChange={setQuadroAberto} onQuadroLocal={setMostrado} onExibir={setExibindo} videoTopo={slotQuadro}/></aside></main>
  {vista&&<aside className="sala-vista mesa sala-p" aria-label="Como a pessoa vê"><CabecaPessoa titulo="Como a pessoa vê" detalhe="treino"/><div className="space-y-3 p-3">{quadroVisto?<QuadroMostrado nome="você" item={quadroVisto.item} imagem={quadroVisto.imagem_path??undefined}/>:<p className="text-sm">Nenhum quadro na tela. Ligue “Exibir quadro de aula” no quadro para a pessoa ver.</p>}<div className="sala-camera">Vídeo da consulta</div></div></aside>}
 </>;
}
export default function ConsultaSala() {
 const {id}=useParams();const {user,loading,isAnonymous}=useUser();const [agora,setAgora]=useState(Date.now());const [entrou,setEntrou]=useState(false);const [saiuDaSala,setSaiuDaSala]=useState(false);const [encerrou,setEncerrou]=useState(false);const [camera,setCamera]=useState(false);const [copiado,setCopiado]=useState(false);const [quadroAberto,setQuadroAberto]=useState(false);const salvarFicha=useRef<()=>Promise<boolean>>(async()=>true);const registrarSalvar=useCallback((fn:()=>Promise<boolean>)=>{salvarFicha.current=fn;},[]);
 const consulta=useQuery({queryKey:['consulta-sala',user?.id,id],queryFn:()=>sala.consultar(id??''),enabled:!!user&&!isAnonymous&&id!=='treino',refetchInterval:ESPERA_SALA_MS,retry:false});
 const dados=consulta.data;const fase=dados?faseSala(dados,agora):null;const fechada=encerrou||fase==='encerrada';
 const vivo=useQuery({queryKey:['consulta-ao-vivo',user?.id,id],queryFn:()=>sala.aoVivo(id??''),enabled:entrou&&!fechada&&dados?.papel==='paciente',refetchInterval:AO_VIVO_MS,retry:false});
 const quadro=vivo.data?.quadro;const imagem=useQuery({queryKey:['consulta-quadro-url',quadro?.path,quadro?.atualizado_em],queryFn:()=>terapia.arquivoAssinado(quadro?.bucket??'terapia-quadros',quadro?.path??''),enabled:!!quadro,gcTime:0,staleTime:0});
 const fotos=useQuery({queryKey:['sala-minhas-fotos',user?.id],queryFn:meu.fotos,enabled:dados?.papel==='paciente'&&!entrou});
 const config=useQuery({queryKey:['sala-treino-config'],queryFn:terapia.config,enabled:dados?.papel==='paciente'&&!entrou,staleTime:10*60*1000});
 useEffect(()=>{const t=setInterval(()=>setAgora(Date.now()),1000);return()=>clearInterval(t);},[]);
 const sair=useCallback(()=>{if(dados?.papel==='terapeuta'){void (async()=>{if(!(await salvarFicha.current()))return;await sala.mostrar(dados.consulta,null).catch(()=>undefined);await sala.gravando(dados.consulta,false).catch(()=>undefined);setEntrou(false);setSaiuDaSala(true);if(dados&&destinoSaida(dados,Date.now())==='encerrada')setEncerrou(true);})();}else{setEntrou(false);setSaiuDaSala(true);if(dados&&destinoSaida(dados,Date.now())==='encerrada')setEncerrou(true);}},[dados]);
 useEffect(()=>{if(entrou&&fase==='encerrada')sair();},[entrou,fase,sair]);
 if(loading)return <p role="status" className="p-8">Carregando…</p>;
 if(!user||isAnonymous)return <Navigate to={`/entrar?redirect=${encodeURIComponent(`/consulta/${id??''}`)}`} replace/>;
 const head=<Helmet><title>{id==='treino'?'Sala de treino':'Sala da consulta'} | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow"/></Helmet>;
 if(id==='treino')return <div className="mesa">{head}<Treino userId={user.id}/></div>;
 if(!dados)return <div className="mesa sala-p">{head}<main className="mx-auto max-w-xl space-y-5 p-8"><p role={consulta.error?'alert':'status'}>{consulta.error?'Consulta não encontrada':'Carregando consulta…'}</p>{consulta.error&&<Link className="m-btn" to="/meu-perfil">Voltar para Meu Perfil</Link>}</main></div>;
 const tNome=dados.terapeuta.primeiro_nome;
 if(isInAppBrowser())return <div className="mesa sala-p">{head}<CabecaPessoa titulo={`Consulta com ${dados.papel==='paciente'?dados.terapeuta.nome:dados.paciente_nome}`} detalhe={dataExtenso(dados.inicio)}/><div className="sala-p-centro"><main className="sala-fim"><h1>Abra no Chrome ou no Safari</h1><p>A câmera e o microfone não funcionam bem no navegador do Instagram ou do Facebook.</p><ol className="list-decimal space-y-2 pl-5"><li>Toque nos três pontos do navegador.</li><li>Escolha abrir no navegador externo.</li><li>Entre na sua conta e abra este link.</li></ol><button type="button" className="m-btn pri" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopiado(true);}catch{setCopiado(false);}}}><Copy className="mr-2 inline h-4 w-4"/>{copiado?'Link copiado':'Copiar o link da sala'}</button></main></div></div>;
 if(fechada)return dados.papel==='terapeuta'?<div className="mesa">{head}<MesaHeader nome={tNome}/><FimConsulta dados={dados}/></div>:<div className="mesa sala-p">{head}<CabecaPessoa titulo={`Consulta com ${dados.terapeuta.nome}`} detalhe="encerrada"/><Encerrada dados={dados} agora={agora}/></div>;
 if(fase==='cancelada')return <div className="mesa sala-p">{head}<CabecaPessoa titulo="Consulta cancelada" detalhe={dataExtenso(dados.inicio)}/><div className="sala-p-centro"><Link className="m-btn" to="/meu-perfil">Meu Perfil</Link></div></div>;
 if(saiuDaSala&&!fechada)return <div className="mesa sala-p">{head}<CabecaPessoa titulo="Você saiu da sala" detalhe={dataExtenso(dados.inicio)}/><div className="sala-p-centro"><main className="sala-fim"><h1>Você saiu da sala</h1><button data-terapia-principal className="m-btn sal" onClick={()=>{setSaiuDaSala(false);setEntrou(true);}}>Entrar de novo</button><Link className="m-btn" to={dados.papel==='terapeuta'?'/painel-terapeuta':'/meu-acompanhamento'}>Voltar</Link></main></div></div>;
 if(!entrou){const segundos=Math.max(0,Math.ceil((Date.parse(dados.abre_em)-agora)/1000));const total=config.data?.fotos_guiadas?.length??fotos.data?.guiadas?.length??0;const enviadas=fotos.data?.guiadas?.filter(g=>fotos.data?.fotos.some(f=>f.tipo===g.chave)).length??0;const chegou=presencaRecente(dados.presenca?.terapeuta,agora);const outro=dados.papel==='paciente'?tNome:primeiro(dados.paciente_nome);
  const titulo=fase==='aguarde'?`A sala abre em ${Math.floor(segundos/3600)}h ${Math.floor(segundos%3600/60)}min ${segundos%60}s`:dados.papel==='paciente'?(chegou?`A ${tNome} chegou`:`Esperando a ${tNome} entrar…`):`Consulta com ${outro}`;
  return <div className="mesa sala-p">{head}<CabecaPessoa titulo={`Consulta com ${dados.papel==='paciente'?dados.terapeuta.nome:dados.paciente_nome}`} detalhe={dataExtenso(dados.inicio)}/><div className="sala-p-centro"><main className="sala-espera"><CameraPrevia mudar={setCamera}/><div><h1 role={fase==='aguarde'?'timer':undefined} aria-live="polite">{titulo}</h1><ul className="sala-check"><li><i>✓</i>Você está no {navegador()}</li><li><i className={camera?'':'off'}>{camera?'✓':'○'}</i>Câmera e microfone {camera?'funcionando':'· toque em testar'}</li><li><i className="am">!</i>Use fone, se tiver: o som fica melhor</li>{dados.papel==='paciente'&&<li><i className={total>0&&enviadas>=total?'':'am'}>{total>0&&enviadas>=total?'✓':'!'}</i>Fotos enviadas: {enviadas} de {total}</li>}</ul>{fotos.error&&<p role="alert">{fotos.error.message}</p>}{fase!=='aguarde'&&<button data-terapia-principal type="button" className="sala-entrar" onClick={()=>setEntrou(true)}>Entrar na consulta</button>}</div></main></div></div>;}
 if(dados.papel==='terapeuta'){
  const video=<VideoConsulta codigo={dados.codigo} consulta={dados.consulta} terapeuta terapeutaNome={tNome} pessoaNome={dados.paciente_nome} sair={sair} encerrar={()=>{void salvarFicha.current().then(ok=>{if(ok){setEntrou(false);setEncerrou(true);}});}} quadroAberto={quadroAberto}/>;
  return <div className="mesa">{head}<MesaHeader nome={tNome} direita={<span>{tNome} · {minutos(dados.inicio,agora)} min</span>}/><main className="mesa-sala"><section className="mesa-sala-video">{video}</section><aside className="mesa-sala-ficha"><FichaSala dados={dados} userId={user.id} onQuadroChange={setQuadroAberto} onSaveReady={registrarSalvar} videoTopo={slotQuadro}/></aside></main></div>;
 }
 const video=<VideoConsulta codigo={dados.codigo} consulta={dados.consulta} terapeuta={false} sair={sair}/>;
 return <div className="mesa sala-p">{head}<CabecaPessoa titulo={`Consulta com ${dados.terapeuta.nome}`} detalhe={`${minutos(dados.inicio,agora)} min`} gravando={vivo.data?.gravando?`A ${tNome} está gravando no computador dela`:undefined}/><main className={`sala-p-main ${quadro?'com-quadro':''}`}>{quadro?<QuadroMostrado nome={tNome} item={quadro.item??'quadro de aula'} em={quadro.atualizado_em} imagem={imagem.data??undefined} erro={imagem.error?.message}/>:null}{video}</main>{vivo.error&&<p role="alert" className="p-3">{vivo.error.message}</p>}</div>;
}
