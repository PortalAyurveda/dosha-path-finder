import {AvatarPessoa} from '../Comuns';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useSearchParams,useNavigate} from 'react-router-dom';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {chat,CHAT_LISTA_MS} from '@/lib/terapiaChat';
import {horaBR} from '@/lib/terapia';
import {useOnlineTerapeuta} from '../online/OnlineTerapeuta';
import Conversa from './Conversa';
import ConversaPessoa from './ConversaPessoa';
import {useUser} from '@/contexts/UserContext';
export default function ListaConversas({terapeuta=false,convite,userId}:{terapeuta?:boolean;convite?:string;userId?:string}){
 const {user,isAnonymous}=useUser();
 const q=useQuery({queryKey:['chat-lista',terapeuta,userId??user?.id],queryFn:terapeuta?chat.terapeuta:chat.minhas,enabled:!!user&&!isAnonymous,refetchInterval:CHAT_LISTA_MS});const online=useOnlineTerapeuta();const [busca,setBusca]=useState('');const [id,setId]=useState('');const [params,setParams]=useSearchParams();const navigate=useNavigate();
 const paciente=params.get('paciente');const escolhida=q.data?.find(c=>c.id===id||(!id&&c.paciente.id===paciente));const lista=q.data?.filter(c=>(terapeuta?c.paciente.nome:c.terapeuta.nome).toLowerCase().includes(busca.toLowerCase()))??[];
 const fechar=()=>{setId('');setParams(p=>{const n=new URLSearchParams(p);n.delete('paciente');return n;});};
 return <div className={`chat-lista grid gap-0 ${terapeuta?'md:grid-cols-[320px_minmax(0,1fr)]':''}`}><div className="space-y-3 overflow-y-auto md:pr-4">{terapeuta&&online&&<div className="space-y-1"><label className="flex items-center justify-between text-sm">Estou online<Switch checked={online.online} disabled={online.mudando||!online.participa} onCheckedChange={v=>void online.mudar(v)} className="data-[state=checked]:bg-secondary"/></label>{online.online&&<p className="text-xs text-muted-foreground">Você aparece como online agora</p>}</div>}<Input aria-label="Buscar conversas" placeholder="Buscar pelo nome" value={busca} onChange={e=>setBusca(e.target.value)}/>{q.isPending&&<p role="status">Carregando conversas…</p>}{q.error&&<p role="alert">{q.error.message}</p>}{q.data&&!lista.length&&<p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>}{lista.map(c=>{const nome=terapeuta?c.paciente.nome:c.terapeuta.nome;return <Button key={c.id} variant="ghost" className={`h-auto w-full justify-start gap-3 whitespace-normal rounded-lg border border-border p-3 text-left ${escolhida?.id===c.id?'bg-secondary/10':''}`} onClick={()=>setId(c.id)}><AvatarPessoa nome={nome} id={c.paciente.id}/><span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{nome}</span>{terapeuta&&<span className={`my-1 inline-block rounded px-1 text-xs ${c.paciente.ligada?'bg-muted':'portal-atencao'}`}>{c.paciente.ligada?'paciente':'ainda não é paciente'}</span>}<span className="block truncate text-xs text-muted-foreground">{c.ultima?.texto}</span><span className="block text-xs text-muted-foreground">{c.ultima?.criado_em?horaBR(c.ultima.criado_em):''}</span></span>{c.nao_lidas>0&&<span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">{c.nao_lidas}</span>}</Button>;})}</div>{escolhida&&(terapeuta?<div className="chat-mobile-aberta min-h-0 md:border-l md:border-border"><Conversa key={escolhida.id} conversa={escolhida} papel="terapeuta" voltar={fechar} convite={convite}/></div>:<ConversaPessoa slug={escolhida.terapeuta.slug} fechar={fechar} marcar={()=>navigate(`/terapeutas/${escolhida.terapeuta.slug}#agenda`)}/>)}{terapeuta&&!escolhida&&<p className="hidden p-6 text-sm text-muted-foreground md:block">{q.data?.length?'Selecione uma conversa.':'Nenhuma conversa ainda.'}</p>}</div>;
}
