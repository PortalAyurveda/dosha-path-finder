import {useEffect,useRef,useState} from 'react';
import {Mic,MicOff,Video,VideoOff,PhoneOff,Disc} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {sala,sairBeacon,PRESENCA_MS} from '@/lib/consultaSala';
interface JitsiAPI { addListener:(event:string,cb:(payload:any)=>void)=>void; executeCommand:(command:string,...args:unknown[])=>void; dispose:()=>void }
declare global { interface Window { JitsiMeetExternalAPI?:new(domain:string,options:Record<string,unknown>)=>JitsiAPI } }
const scripts=new Map<string,Promise<void>>();
function carregar(domain:string) {
 if(!/^[a-z0-9.-]+(?::\d+)?$/i.test(domain))return Promise.reject(new Error('Endereço de vídeo inválido.'));
 const existente=scripts.get(domain);if(existente)return existente;
 const p=new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src=`https://${domain}/external_api.js`;script.onload=()=>resolve();script.onerror=()=>{scripts.delete(domain);reject(new Error('Não foi possível carregar o vídeo.'));};document.head.appendChild(script);});scripts.set(domain,p);return p;
}
export default function VideoConsulta({codigo,consulta,terapeuta,sair,compacto=false,quadroAberto=false}:{quadroAberto?:boolean;codigo:string;consulta:string;terapeuta:boolean;sair:()=>void;compacto?:boolean}) {
 const root=useRef<HTMLElement>(null);const origem=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=root.current;if(!el)return;if(!origem.current)origem.current=el.parentElement;if(quadroAberto){const slot=document.getElementById("sala-video-quadro");if(slot)slot.appendChild(el);}else if(origem.current)origem.current.appendChild(el);return()=>{if(origem.current&&el.parentElement!==origem.current)origem.current.appendChild(el);};},[quadroAberto]);
 const parent=useRef<HTMLDivElement>(null);const api=useRef<JitsiAPI>();const sairRef=useRef(sair);sairRef.current=sair;
 const [erro,setErro]=useState('');const [conectado,setConectado]=useState(false);const [mic,setMic]=useState(false);const [cam,setCam]=useState(false);const [gravando,setGravando]=useState(false);const [tentativa,setTentativa]=useState(0);
 useEffect(()=>{let ativo=true;let timer:ReturnType<typeof setInterval>|undefined;let joined=false;let ended=false;const erroEvento=(e:unknown)=>{if(ativo)setErro(e instanceof Error?e.message:String(e));};const evento=(e:'entrou'|'pulso'|'saiu'|'outro_entrou'|'outro_saiu')=>void sala.evento(codigo,e).catch(erroEvento);
 const fechar=()=>{if(ended)return;ended=true;if(joined){joined=false;evento('saiu');}sairRef.current();};
 sala.entrar(codigo).then(async d=>{await carregar(d.dominio);if(!ativo||!parent.current)return;const Constructor=window.JitsiMeetExternalAPI;if(!Constructor)throw new Error('Não foi possível iniciar o vídeo.');const instance=new Constructor(d.dominio,{roomName:d.sala,jwt:d.jwt,parentNode:parent.current,width:'100%',height:'100%',lang:'ptBR',userInfo:{displayName:d.nome},configOverwrite:{prejoinConfig:{enabled:false},disableInviteFunctions:true,toolbarButtons:[],startWithAudioMuted:false,startWithVideoMuted:false,localRecording:{enabled:terapeuta,notifyAllParticipants:true},hideConferenceSubject:true},interfaceConfigOverwrite:{SHOW_JITSI_WATERMARK:false,SHOW_WATERMARK_FOR_GUESTS:false,SHOW_BRAND_WATERMARK:false,SHOW_POWERED_BY:false,TOOLBAR_BUTTONS:[]}});api.current=instance;
 instance.addListener('videoConferenceJoined',()=>{joined=true;setConectado(true);evento('entrou');timer=setInterval(()=>evento('pulso'),PRESENCA_MS);});
 instance.addListener('participantJoined',()=>evento('outro_entrou'));instance.addListener('participantLeft',()=>evento('outro_saiu'));
 instance.addListener('audioMuteStatusChanged',e=>setMic(!!e.muted));instance.addListener('videoMuteStatusChanged',e=>setCam(!!e.muted));
 instance.addListener('recordingStatusChanged',e=>{if(e.mode!=='local')return;const on=!!e.on;setGravando(on);if(terapeuta)void sala.gravando(consulta,on).catch(erroEvento);if(e.error)setErro('A gravação local não pôde iniciar neste navegador.');});
 instance.addListener('videoConferenceLeft',fechar);instance.addListener('readyToClose',fechar);
 }).catch(erroEvento);
 const unload=()=>sairBeacon(codigo);window.addEventListener('pagehide',unload);
 return()=>{ativo=false;if(timer)clearInterval(timer);window.removeEventListener('pagehide',unload);if(joined){void sala.evento(codigo,'saiu').catch(()=>undefined);if(terapeuta)void sala.gravando(consulta,false).catch(()=>undefined);}api.current?.dispose();api.current=undefined;};
 },[codigo,consulta,terapeuta,tentativa]);
 return <section ref={root} className="space-y-3"><div ref={parent} className={`sala-video ${compacto?'sala-video-compacto':''}`} aria-label="Vídeo da consulta"/>{erro&&<div role="alert" className="text-sm"><p>{erro}</p><Button variant="outline" onClick={()=>setTentativa(t=>t+1)}>Tentar novamente</Button></div>}<div className="flex flex-wrap items-center justify-center gap-3"><Button size="icon" variant="outline" aria-label={mic?'Ligar microfone':'Desligar microfone'} disabled={!conectado} onClick={()=>api.current?.executeCommand('toggleAudio')}>{mic?<MicOff/>:<Mic/>}</Button><Button size="icon" variant="outline" aria-label={cam?'Ligar câmera':'Desligar câmera'} disabled={!conectado} onClick={()=>api.current?.executeCommand('toggleVideo')}>{cam?<VideoOff/>:<Video/>}</Button><Button variant="destructive" onClick={()=>{api.current?.executeCommand('hangup');sairRef.current();}}><PhoneOff className="mr-2 h-4 w-4"/>Sair</Button>{terapeuta&&<Button variant="outline" disabled={!conectado} onClick={()=>gravando?api.current?.executeCommand('stopRecording','local'):api.current?.executeCommand('startRecording',{mode:'local'})}><Disc className="mr-2 h-4 w-4"/>{gravando?'Parar gravação':'Gravar no meu computador'}</Button>}</div></section>;
}