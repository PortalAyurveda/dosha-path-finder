/** Shared by the live room and both training views. Jitsi retains adaptive layers. */
export const VIDEO_CONFIG = {
  resolution: 720,
  constraints: { video: { height: { ideal: 720, max: 720, min: 180 }, frameRate: { ideal: 30, max: 30 } } },
  videoQuality: { codecPreferenceOrder: ['VP9','VP8','H264','AV1'], mobileCodecPreferenceOrder: ['VP8','H264','VP9'], enableAdaptiveMode: true, screenshareCodec: 'VP9' },
  p2p: { enabled: true, codecPreferenceOrder: ['VP9','VP8','H264'], screenshareCodec: 'VP9' },
  desktopSharingFrameRate: { min: 5, max: 15 },
  disableSimulcast: false,
};
export const ERRO_GRAVACAO = 'Seu navegador não deixou gravar. No computador, use o Chrome e escolha esta aba.';
export function tipoGravacao(suporta:(tipo:string)=>boolean) {
  return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(suporta);
}
export function nomeGravacao(nome:string,data:Date,tipo:string) {
  const dois=(n:number)=>String(n).padStart(2,'0');
  const seguro=(nome||'Paciente').replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim();
  return `Consulta ${seguro} ${dois(data.getDate())}-${dois(data.getMonth()+1)}-${data.getFullYear()} ${dois(data.getHours())}h${dois(data.getMinutes())}.${tipo.includes('mp4')?'mp4':'webm'}`;
}
export function tempoGravacao(segundos:number) {return `${String(Math.floor(segundos/60)).padStart(2,'0')}:${String(segundos%60).padStart(2,'0')}`;}
export interface GravacaoLocal { parar:()=>void; }
/** Captures only on an explicit click. Media never leaves the browser. */
export async function iniciarGravacaoLocal(nome:string,aoParar:()=>void):Promise<GravacaoLocal> {
  let aba:MediaStream|undefined;let microfone:MediaStream|undefined;let audio:AudioContext|undefined;let recorder:MediaRecorder|undefined;
  const limpar=()=>{aba?.getTracks().forEach(t=>t.stop());microfone?.getTracks().forEach(t=>t.stop());if(audio)void audio.close().catch(()=>undefined);};
  try {
    if(!navigator.mediaDevices?.getDisplayMedia||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined')throw new Error(ERRO_GRAVACAO);
    aba=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser',frameRate:{ideal:15,max:15}},audio:true,preferCurrentTab:true,systemAudio:'include',selfBrowserSurface:'include'} as DisplayMediaStreamOptions);
    const video=aba.getVideoTracks()[0];if(!video)throw new Error(ERRO_GRAVACAO);
    video.contentHint='detail';
    microfone=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    if(video.readyState==='ended')throw new Error(ERRO_GRAVACAO);
    audio=new AudioContext();await audio.resume();const destino=audio.createMediaStreamDestination();
    for(const stream of [aba,microfone])if(stream.getAudioTracks().length)audio.createMediaStreamSource(stream).connect(destino);
    const stream=new MediaStream([video,...destino.stream.getAudioTracks()]);const tipo=tipoGravacao(t=>MediaRecorder.isTypeSupported(t));
    recorder=new MediaRecorder(stream,tipo?{mimeType:tipo}:undefined);
    const gravador=recorder;const inicio=new Date();const partes:BlobPart[]=[];let parando=false;
    const parar=()=>{if(parando)return;parando=true;if(gravador.state!=='inactive')gravador.stop();};
    gravador.ondataavailable=e=>{if(e.data.size)partes.push(e.data);};
    gravador.onstop=()=>{limpar();aoParar();if(!partes.length)return;const mime=gravador.mimeType||tipo||'video/webm';const blob=new Blob(partes,{type:mime});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=nomeGravacao(nome,inicio,mime);document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
    gravador.onerror=()=>parar();video.addEventListener('ended',parar,{once:true});
    gravador.start(1000);return {parar};
  } catch {limpar();throw new Error(ERRO_GRAVACAO);}
}