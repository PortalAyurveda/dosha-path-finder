import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {sala} from '@/lib/consultaSala';
import {ERRO_GRAVACAO,iniciarGravacaoLocal,tempoGravacao,type GravacaoLocal} from '@/lib/videoConsulta';
/** Recording state and its clock are isolated from the assessment editor. */
export default function GravacaoConsulta({consulta,treino,nome,conectado}:{consulta:string;treino:boolean;nome?:string;conectado:boolean}) {
  const gravacao=useRef<GravacaoLocal>();const ativo=useRef(true);const inicio=useRef(0);const ocupado=useRef(false);
  const [gravando,setGravando]=useState(false);const [pendente,setPendente]=useState(false);const [segundos,setSegundos]=useState(0);const [erro,setErro]=useState('');
  const avisar=(on:boolean)=>{if(!treino)void sala.gravando(consulta,on).catch(()=>{if(ativo.current)setErro('Não foi possível atualizar o aviso de gravação.');});};
  useEffect(()=>{ativo.current=true;return()=>{ativo.current=false;gravacao.current?.parar();};},[]);
  useEffect(()=>{if(!gravando)return;const t=setInterval(()=>setSegundos(Math.floor((Date.now()-inicio.current)/1000)),1000);return()=>clearInterval(t);},[gravando]);
  const gravar=async()=>{
    if(ocupado.current)return;
    if(gravacao.current){gravacao.current.parar();return;}
    ocupado.current=true;setPendente(true);setErro('');
    try {
      const local=await iniciarGravacaoLocal(nome??'Paciente',()=>{gravacao.current=undefined;avisar(false);if(ativo.current){setGravando(false);setSegundos(0);}});
      gravacao.current=local;if(!ativo.current){local.parar();return;}
      inicio.current=Date.now();setSegundos(0);setGravando(true);avisar(true);
    }catch {if(ativo.current)setErro(ERRO_GRAVACAO);}finally{ocupado.current=false;if(ativo.current)setPendente(false);}
  };
  return <><Button variant="ghost" type="button" className="m-grav-btn" aria-pressed={gravando} disabled={!conectado||pendente} onClick={()=>void gravar()}>{gravando?'Parar gravação':pendente?'Abrindo gravação…':'Gravar no meu computador'}</Button>{gravando&&<span className="m-aviso" role="timer">● Gravando {tempoGravacao(segundos)}</span>}{erro&&<span role="alert" className="sala-gravacao-erro">{erro}</span>}</>;
}