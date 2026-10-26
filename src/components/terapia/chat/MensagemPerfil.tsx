import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import LoginForm from '@/components/auth/LoginForm';
import {useUser} from '@/contexts/UserContext';
import ConversaPessoa from './ConversaPessoa';
export default function MensagemPerfil({slug,permitido}:{slug:string;permitido:boolean}){
 const {user,isAnonymous}=useUser();const [aberta,setAberta]=useState(false);const location=useLocation();const logado=!!user&&!isAnonymous;
 useEffect(()=>{if(location.hash==='#mensagens')setAberta(true);},[location.hash]);
 if(!permitido)return null;
 return <div className="mb-4 space-y-3"><Button variant="secondary" onClick={()=>setAberta(true)}>Mandar mensagem</Button>{aberta&&(logado?<ConversaPessoa slug={slug} fechar={()=>setAberta(false)} marcar={()=>{setAberta(false);document.getElementById('agenda')?.scrollIntoView({block:'start'});}}/>:<LoginForm embedded emailOnly redirectPath={`/terapeutas/${slug}#mensagens`}/>)}</div>;
}
