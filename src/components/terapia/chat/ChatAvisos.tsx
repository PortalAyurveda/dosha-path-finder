import {useEffect,useRef,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useLocation,useNavigate} from 'react-router-dom';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useUser} from '@/contexts/UserContext';
import {supabase} from '@/integrations/supabase/client';
import {chat,estaAberta,linkConversa,primeirasPalavras,type Conversa} from '@/lib/terapiaChat';
import {PING_MS} from '@/lib/terapia';
import {avisoTitulo} from '@/lib/avisosTitulo';
import {somConsulta} from '@/lib/consultaAgoraAvisos';
import {useOnlineTerapeuta} from '../online/OnlineTerapeuta';
import {AvatarPessoa} from '../Comuns';
import './chat.css';

interface Linha {id:number;conversa_id:string;autor:string;texto:string}
interface Cartao {nome:string;imagem:string|null;avatarId:string;texto:string;link:string;mais:number}
const AVISO_MS=10000;

export function useChatTotal(){const {user,isAnonymous}=useUser();const q=useQuery({queryKey:['chat-total',user?.id],queryFn:chat.naoLidas,enabled:!!user&&!isAnonymous,refetchInterval:PING_MS,refetchIntervalInBackground:true});return user&&!isAnonymous?q.data??0:0;}

export default function ChatAvisos(){
 const total=useChatTotal();const {user,isAnonymous}=useUser();const qc=useQueryClient();const location=useLocation();const navigate=useNavigate();
 const online=useOnlineTerapeuta();const ehTerapeuta=!!online;const somLigado=!!online?.online;
 const anterior=useRef<number>();const conta=useRef<string>();const vistos=useRef(new Set<number>());
 const [cartao,setCartao]=useState<Cartao|null>(null);const [tentativa,setTentativa]=useState(0);
 const estado=useRef({ehTerapeuta,somLigado});estado.current={ehTerapeuta,somLigado};
 const uid=user&&!isAnonymous?user.id:undefined;

 const atualizar=(conversa?:string)=>{if(conversa)void qc.invalidateQueries({queryKey:['chat-mensagens',conversa]});else void qc.invalidateQueries({queryKey:['chat-mensagens']});void qc.invalidateQueries({queryKey:['chat-lista']});void qc.invalidateQueries({queryKey:['chat-total']});};

 // Uma escuta só por usuário logado.
 useEffect(()=>{
  if(!uid)return;
  const canal=supabase.channel(`chat-${uid}-${tentativa}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_mensagens'},payload=>{
   const m=payload.new as Linha;if(!m?.conversa_id||vistos.current.has(m.id))return;vistos.current.add(m.id);
   atualizar(m.conversa_id);
   if(m.autor==='sistema'||estaAberta(m.conversa_id))return;
   void (async()=>{
    const {ehTerapeuta:ter,somLigado:som}=estado.current;
    const [comoTer,comoPac]=await Promise.all([ter?qc.fetchQuery({queryKey:['chat-lista',true,uid],queryFn:chat.terapeuta,staleTime:0}).catch(()=>[] as Conversa[]):Promise.resolve([] as Conversa[]),qc.fetchQuery({queryKey:['chat-lista',false,uid],queryFn:chat.minhas,staleTime:0}).catch(()=>[] as Conversa[])]);
    const t=comoTer.find(c=>c.id===m.conversa_id);const p=t?undefined:comoPac.find(c=>c.id===m.conversa_id);
    const papel=t?'terapeuta':p?'paciente':null;const c=t??p;
    if(!papel||!c||m.autor===papel||estaAberta(m.conversa_id))return;
    const nome=papel==='terapeuta'?c.paciente.nome:c.terapeuta.nome;const link=linkConversa(papel,c);
    setCartao(a=>({nome,imagem:papel==='paciente'?c.terapeuta.imagem:null,avatarId:papel==='terapeuta'?c.paciente.id:c.terapeuta.id,texto:primeirasPalavras(m.texto),link,mais:a?a.mais+1:0}));
    if(papel==='terapeuta'&&som){
     somConsulta();
     if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){try{const n=new Notification(`Nova mensagem de ${nome}`,{body:primeirasPalavras(m.texto),tag:`chat-${m.conversa_id}`});n.onclick=()=>{window.focus();navigate(link);n.close();};}catch{/* sem suporte */}}
    }
   })();
  }).subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')setTimeout(()=>setTentativa(n=>n+1),5000);});
  return()=>{void supabase.removeChannel(canal);};
 },[uid,tentativa]);

 // Some sozinho em 10 segundos.
 useEffect(()=>{if(!cartao)return;const t=setTimeout(()=>setCartao(null),AVISO_MS);return()=>clearTimeout(t);},[cartao]);

 useEffect(()=>{void qc.invalidateQueries({queryKey:['chat-total']});},[location.key,qc]);

 // Título da aba.
 useEffect(()=>{
  if(conta.current!==uid){anterior.current=undefined;conta.current=uid;}
  if(ehTerapeuta&&somLigado)avisoTitulo('mensagem',total?`(${total}) Nova mensagem`:null,true);
  else{if(document.hidden&&anterior.current!==undefined&&total>anterior.current)avisoTitulo('mensagem',`(${total}) Nova mensagem`);if(!total)avisoTitulo('mensagem',null);}
  anterior.current=total;
 },[total,uid,ehTerapeuta,somLigado]);

 // Ao voltar para a aba ou destravar o celular, busca tudo de novo.
 useEffect(()=>{const mostrar=()=>{if(document.hidden)return;if(!(estado.current.ehTerapeuta&&estado.current.somLigado))avisoTitulo('mensagem',null);atualizar();setTentativa(n=>n+1);};document.addEventListener('visibilitychange',mostrar);return()=>{document.removeEventListener('visibilitychange',mostrar);avisoTitulo('mensagem',null);};},[qc]);

 if(!cartao)return null;
 return <div className="chat-aviso" role="status" aria-live="polite">
  {cartao.imagem?<img src={cartao.imagem} alt="" className="chat-aviso-foto"/>:<AvatarPessoa nome={cartao.nome} id={cartao.avatarId}/>}
  <div className="min-w-0 flex-1"><p className="chat-aviso-titulo">Nova mensagem de {cartao.nome}</p><p className="chat-aviso-texto">{cartao.texto}</p>{cartao.mais>0&&<p className="chat-aviso-mais">+{cartao.mais} {cartao.mais===1?'mensagem':'mensagens'}</p>}
   <Button size="sm" variant="secondary" className="mt-2" onClick={()=>{navigate(cartao.link);setCartao(null);}}>Abrir conversa</Button></div>
  <button type="button" className="chat-aviso-fechar" aria-label="Fechar aviso" onClick={()=>setCartao(null)}><X className="h-4 w-4"/></button>
 </div>;
}
