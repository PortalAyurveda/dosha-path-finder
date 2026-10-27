import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { terapia } from '@/lib/terapia';
import { COR } from '@/lib/terapiaAvaliacao';
export default function ServePara({valor,mudar,readonly=false}:{valor:string[];mudar:(v:string[])=>void;readonly?:boolean}) {
 const [busca,setBusca]=useState(''); const [aberto,setAberto]=useState(false);
 const q=useQuery({queryKey:['terapia-ficha-conteudo'],queryFn:terapia.fichaConteudo});
 const grupos=q.data?.SIST??{};
 const lista=Object.values(grupos).flatMap(g=>Object.entries(g).flatMap(([d,s])=>(s??[]).map(nome=>({nome,d}))));
 const unicos=lista.filter((s,i)=>lista.findIndex(x=>x.nome===s.nome)===i);
 return <div className="space-y-2"><div className="flex flex-wrap gap-2">{valor.map(s=>{const d=unicos.find(x=>x.nome===s)?.d;return <Button key={s} type="button" size="sm" variant="outline" disabled={readonly} className={`h-auto whitespace-normal text-left ${d&&d in COR?COR[d as keyof typeof COR]:''}`} aria-label={`Tirar ${s}`} onClick={()=>mudar(valor.filter(x=>x!==s))}>{s}{!readonly&&<X className="ml-1 h-3 w-3 shrink-0"/>}</Button>;})}{!readonly&&<Button type="button" size="icon" variant="outline" aria-label="Adicionar sintoma" onClick={()=>setAberto(v=>!v)}><Plus size={16}/></Button>}</div>{aberto&&<><Input aria-label="Buscar sintomas" placeholder="Buscar sintomas" value={busca} onChange={e=>setBusca(e.target.value)}/><div className="max-h-48 space-y-1 overflow-y-auto">{unicos.filter(s=>busca.trim()&&s.nome.toLowerCase().includes(busca.toLowerCase())&&!valor.includes(s.nome)).slice(0,30).map(s=><Button key={s.nome} type="button" size="sm" variant="outline" className={`mr-1 h-auto whitespace-normal text-left ${COR[s.d as keyof typeof COR]??''}`} onClick={()=>{mudar([...valor,s.nome]);setBusca('');setAberto(false);}}>{s.nome}</Button>)}</div>{q.error&&<p role="alert">{q.error.message}</p>}</>}</div>;
}
