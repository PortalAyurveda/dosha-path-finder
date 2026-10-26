import {useQuery} from '@tanstack/react-query';
import {Sheet,SheetContent,SheetTitle} from '@/components/ui/sheet';
import {chat} from '@/lib/terapiaChat';
import Conversa from './Conversa';
export default function ConversaPessoa({slug,fechar,marcar}:{slug:string;fechar:()=>void;marcar:()=>void}){
 const q=useQuery({queryKey:['chat-abrir',slug],queryFn:()=>chat.abrir(slug)});
 return <Sheet open onOpenChange={v=>{if(!v)fechar();}}><SheetContent side="right" className="chat-pessoa w-full max-w-none p-0 sm:max-w-lg"><SheetTitle className="sr-only">Conversa</SheetTitle>{q.error?<p role="alert" className="p-6">{q.error.message}</p>:!q.data?<p role="status" className="p-6">Carregando conversa…</p>:<Conversa key={q.data.id} conversa={q.data} papel="paciente" voltar={fechar} marcar={marcar}/>}</SheetContent></Sheet>;
}
