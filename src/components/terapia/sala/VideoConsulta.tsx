import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Button} from '@/components/ui/button';
import {Mic,MicOff,Video,VideoOff} from 'lucide-react';
import {sala,sairBeacon,PRESENCA_MS} from '@/lib/consultaSala';
interface JitsiAPI { addListener:(event:string,cb:(payload:any)=>void)=>void; executeCommand:(command:string,...args:unknown[])=>void; dispose:()=>void }
declare global { interface Window { JitsiMeetExternalAPI?:new(domain:string,options:Record<string,unknown>)=>JitsiAPI } }
const scripts=new Map<string,Promise<void>>();
function carregar(domain:string) {
 if(!/^[a-z0-9.-]+(?::\d+)?$/i.test(domain))return Promise.reject(new Error('Endereço de vídeo inválido.'));
 const existente=scripts.get(domain);if(existente)return existente;
 const p=new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src=`https://${domain}/external_api.js`;script.onload=()=>resolve();script.onerror=()=>{scripts.delete(domain);reject(new Error('Não foi possível carregar o vídeo.'));};document.head.appendChild(script);});scripts.set(domain,p);return p;
}
/** Ids dos lugares que o quadro de aula reserva para o vídeo e os botões. */
export const SLOT_VIDEO='sala-video-quadro';export const SLOT_CONTROLES='sala-quadro-controles';
/**
 * O iframe do Jitsi fica sempre no mesmo nó (trocar de pai recarrega a chamada).
 * Com o quadro aberto, só a posição muda: o vídeo segue o retângulo reservado pelo quadro.
 */
export default function VideoConsulta({codigo,consulta,terapeuta,sair,quadroAberto=false,treino=false,terapeutaNome,pessoaNome,encerrar}:{encerrar?:()=>void;quadroAberto?:boolean;codigo:string;consulta:string;terapeuta:boolean;sair:()=>void;treino?:boolean;terapeutaNome?:string;pessoaNome?:string;compacto?:boolean}) {
 const parent=useRef<HTMLDivElement>(null);const api=useRef<JitsiAPI>();const sairRef=useRef(sair);sairRef.current=sair;
 const participantes=useRef(new Set<string>());const [temPessoa,setTemPessoa]=useState(false);
 const [erro,setErro]=useState('');const [conectado,setConectado]=useState(false);const [mic,setMic]=useState(false);const [cam,setCam]=useState(false);const [gravando,setGravando]=useState(false);const [tela,setTela]=useState(false);const [tentativa,setTentativa]=useState(0);const [slotCtl,setSlotCtl]=useState<HTMLElement|null>(null);
 useEffect(()=>{const el=parent.current;if(!el)return;if(!quadroAberto){el.classList.remove('mini');el.removeAttribute('style');setSlotCtl(null);return;}let raf=0;let ultimo='';
  const seguir=()=>{const slot=document.getElementById(SLOT_VIDEO);const ctl=document.getElementById(SLOT_CONTROLES);setSlotCtl(c=>c===ctl?c:ctl);if(slot){const r=slot.getBoundingClientRect();const k=`${r.top}|${r.left}|${r.width}|${r.height}`;if(k!==ultimo){ultimo=k;el.classList.add('mini');Object.assign(el.style,{top:`${r.top}px`,left:`${r.left}px`,width:`${r.width}px`,height:`${r.height}px`,visibility:r.bottom<41||r.top>window.innerHeight?'hidden':'visible'});}}else if(ultimo!=='x'){ultimo='x';el.style.visibility='hidden';}raf=requestAnimationFrame(seguir);};
  seguir();return()=>{cancelAnimationFrame(raf);};},[quadroAberto]);
 useEffect(()=>{if(conectado)api.current?.executeCommand('setTileView',quadroAberto);},[quadroAberto,conectado]);
 useEffect(()=>{setErro('');setConectado(false);let ativo=true;let timer:ReturnType<typeof setInterval>|undefined;let joined=false;let ended=false;const erroEvento=(e:unknown)=>{if(ativo)setErro(e instanceof Error?e.message:String(e));};const evento=(e:'entrou'|'pulso'|'saiu'|'outro_entrou'|'outro_saiu')=>void sala.evento(codigo,e).catch(erroEvento);
  const fechar=()=>{if(ended)return;ended=true;if(joined){joined=false;evento('saiu');}sairRef.current();};
  sala.entrar(codigo).then(async d=>{await carregar(d.dominio);if(!ativo||!parent.current)return;const Constructor=window.JitsiMeetExternalAPI;if(!Constructor)throw new Error('Não foi possível iniciar o vídeo.');const instance=new Constructor(d.dominio,{roomName:d.sala,jwt:d.jwt,parentNode:parent.current,width:'100%',height:'100%',lang:'ptBR',userInfo:{displayName:d.nome},configOverwrite:{prejoinConfig:{enabled:false},disableInviteFunctions:true,toolbarButtons:[],startWithAudioMuted:false,startWithVideoMuted:false,localRecording:{enabled:terapeuta,notifyAllParticipants:true},hideConferenceSubject:true},interfaceConfigOverwrite:{SHOW_JITSI_WATERMARK:false,SHOW_WATERMARK_FOR_GUESTS:false,SHOW_BRAND_WATERMARK:false,SHOW_POWERED_BY:false,TOOLBAR_BUTTONS:[]}});api.current=instance;
  instance.addListener('videoConferenceJoined',()=>{joined=true;setErro('');setConectado(true);evento('entrou');timer=setInterval(()=>evento('pulso'),PRESENCA_MS);});
  instance.addListener('participantJoined',e=>{participantes.current.add(e.id);setTemPessoa(true);if(treino&&terapeuta){instance.executeCommand('setTileView',false);instance.executeCommand('pinParticipant',e.id);}evento('outro_entrou');});instance.addListener('participantLeft',e=>{participantes.current.delete(e.id);setTemPessoa(participantes.current.size>0);evento('outro_saiu');});
  instance.addListener('audioMuteStatusChanged',e=>setMic(!!e.muted));instance.addListener('videoMuteStatusChanged',e=>setCam(!!e.muted));
  instance.addListener('screenSharingStatusChanged',e=>setTela(!!e.on));
  instance.addListener('recordingStatusChanged',e=>{if(e.mode!=='local')return;const on=!!e.on;setGravando(on);if(terapeuta&&!treino)void sala.gravando(consulta,on).catch(erroEvento);if(e.error)setErro('A gravação local não pôde iniciar neste navegador.');});
  instance.addListener('videoConferenceLeft',fechar);instance.addListener('readyToClose',fechar);
  }).catch(erroEvento);
  const unload=()=>sairBeacon(codigo);window.addEventListener('pagehide',unload);
  return()=>{ativo=false;if(timer)clearInterval(timer);window.removeEventListener('pagehide',unload);if(joined){void sala.evento(codigo,'saiu').catch(()=>undefined);if(terapeuta&&!treino)void sala.gravando(consulta,false).catch(()=>undefined);}api.current?.dispose();api.current=undefined;};
 },[codigo,consulta,terapeuta,tentativa,treino]);
 const gravar=()=>gravando?api.current?.executeCommand('stopRecording','local'):api.current?.executeCommand('startRecording',{mode:'local'});
 const botoesTerapeuta=terapeuta&&<><Button variant="ghost" type="button" className="m-grav-btn" aria-pressed={gravando} disabled={!conectado} onClick={gravar}>{gravando?'Parar gravação':'Gravar no meu computador'}</Button>{gravando&&<span className="m-aviso">Gravando no computador da {terapeutaNome??'terapeuta'}{pessoaNome?` · a ${pessoaNome.split(' ')[0]} vê este aviso`:''}</span>}<Button variant="ghost" type="button" className="m-grav-btn" aria-pressed={tela} disabled={!conectado} onClick={()=>api.current?.executeCommand('toggleShareScreen')}>{tela?'Parar de compartilhar':'Compartilhar minha tela'}</Button>{tela&&<span className="m-aviso info">Você está compartilhando a tela</span>}{encerrar&&<Button variant="ghost" className="m-grav-btn" onClick={encerrar}>Encerrar consulta</Button>}</>;
 const controles=(mini:boolean)=><div className={mini?'ctl':'m-controles'}><Button variant="ghost" type="button" className="m-redondo" aria-label={mic?'Ligar microfone':'Desligar microfone'} disabled={!conectado} onClick={()=>api.current?.executeCommand('toggleAudio')}>{mic?<MicOff className="h-5 w-5"/>:<Mic className="h-5 w-5"/>}</Button><Button variant="ghost" type="button" className="m-redondo" aria-label={cam?'Ligar câmera':'Desligar câmera'} disabled={!conectado} onClick={()=>api.current?.executeCommand('toggleVideo')}>{cam?<VideoOff className="h-5 w-5"/>:<Video className="h-5 w-5"/>}</Button><Button variant="ghost" type="button" className="m-sair" onClick={()=>{api.current?.executeCommand('hangup');sairRef.current();}}>Sair</Button></div>;
 return <section className={`sala-palco relative ${treino&&terapeuta&&!temPessoa&&!quadroAberto?'treino-esperando':''}`}>
{treino&&terapeuta&&!temPessoa&&!quadroAberto&&<div className="treino-paciente"><h2>Paciente exemplo</h2></div>}
  {terapeuta&&!quadroAberto&&<div className="m-grav">{botoesTerapeuta}</div>}
  <div ref={parent} className="sala-video" aria-label="Vídeo da consulta"/>
  {erro&&<div role="alert" className="flex flex-wrap items-center justify-center gap-3 p-2 text-sm"><p>{erro}</p><Button variant="ghost" type="button" className="m-btn" onClick={()=>{setErro('');setTentativa(t=>t+1);}}>Tentar novamente</Button></div>}
  {!quadroAberto&&controles(false)}
  {quadroAberto&&slotCtl&&createPortal(terapeuta?<div className="ctl">{botoesTerapeuta}</div>:controles(true),slotCtl)}
 </section>;
}
