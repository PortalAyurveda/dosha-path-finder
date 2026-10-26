import {useEffect,useRef} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useLocation} from 'react-router-dom';
import {useUser} from '@/contexts/UserContext';
import {chat} from '@/lib/terapiaChat';
import {PING_MS} from '@/lib/terapia';
import {avisoTitulo} from '@/lib/avisosTitulo';
export function useChatTotal(){const {user,isAnonymous}=useUser();const q=useQuery({queryKey:['chat-total',user?.id],queryFn:chat.naoLidas,enabled:!!user&&!isAnonymous,refetchInterval:PING_MS,refetchIntervalInBackground:true});return user&&!isAnonymous?q.data??0:0;}
export default function ChatAvisos(){const total=useChatTotal();const {user}=useUser();const qc=useQueryClient();const location=useLocation();const anterior=useRef<number>();const conta=useRef<string>();
 useEffect(()=>{void qc.invalidateQueries({queryKey:['chat-total']});avisoTitulo('mensagem',null);},[location.key,qc]);
 useEffect(()=>{if(conta.current!==user?.id){anterior.current=undefined;conta.current=user?.id;}if(document.hidden&&anterior.current!==undefined&&total>anterior.current)avisoTitulo('mensagem',`(${total}) Nova mensagem`);if(!total)avisoTitulo('mensagem',null);anterior.current=total;},[total,user?.id]);
 useEffect(()=>{const mostrar=()=>{if(!document.hidden){avisoTitulo('mensagem',null);void qc.invalidateQueries({queryKey:['chat-total']});}};document.addEventListener('visibilitychange',mostrar);return()=>{document.removeEventListener('visibilitychange',mostrar);avisoTitulo('mensagem',null);};},[qc]);return null;}
