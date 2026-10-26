import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {modelosTerapia} from '@/lib/terapiaModelos';
export default function ModelosPessoais({busca,userId}:{busca:string;userId?:string}){
 const q=useQuery({queryKey:['terapia-modelos',userId],queryFn:modelosTerapia.lista});const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);const lista=q.data?.filter(m=>!m.do_portal&&m.nome.toLowerCase().includes(busca.toLowerCase()))??[];
 return <>{q.isPending&&<p role="status">Carregando modelos…</p>}{(q.error||erro)&&<p role="alert">{erro||q.error?.message}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{lista.map(m=><article key={m.id} className="rounded-lg border border-border p-4"><h2 className="font-semibold">{m.nome}</h2><p className="my-3 text-xs text-muted-foreground">{m.itens} itens · {m.usos} usos</p><Button variant="outline" size="sm" disabled={ocupado} onClick={async()=>{if(!window.confirm(`Apagar “${m.nome}”?`))return;setOcupado(true);setErro('');try{await modelosTerapia.apagar(m.id);await q.refetch();}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}}}>Apagar</Button></article>)}</div>{q.data&&!lista.length&&<p className="py-6 text-sm text-muted-foreground">Nenhum modelo.</p>}</>;
}