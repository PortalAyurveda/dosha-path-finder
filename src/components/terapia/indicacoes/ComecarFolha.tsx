import {useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import CTAButton from '@/components/CTAButton';
import {terapia,diaBR} from '@/lib/terapia';
import {modelosTerapia} from '@/lib/terapiaModelos';
import Modelos from './Modelos';
export default function ComecarFolha({paciente,avaliacao,consulta}:{paciente:string;avaliacao?:string;consulta?:string}){
 const navigate=useNavigate();const q=useQuery({queryKey:['folha-comecos',paciente],queryFn:()=>modelosTerapia.comecos(paciente)});const [ocupado,setOcupado]=useState(false);const [erro,setErro]=useState('');const iniciada=useRef(false);
 const fontes=useQuery({queryKey:['folha-comecos-fontes',paciente],queryFn:()=>terapia.indicacoesFontes(paciente)});
 const criar=async(modelo:string|null=null,origem:string|null=null)=>{setOcupado(true);setErro('');try{const id=modelo||origem?await modelosTerapia.novaDe(paciente,modelo,origem,avaliacao,consulta):await terapia.folhaNova(paciente,avaliacao,consulta);navigate(`/painel-terapeuta/paciente/${paciente}/indicacoes/${id}`,{replace:true});}catch(e){setErro(e instanceof Error?e.message:String(e));iniciada.current=false;}finally{setOcupado(false);}};
 useEffect(()=>{if(q.data&&!q.data.ultima&&!q.data.modelos.length&&!iniciada.current){iniciada.current=true;void criar();}},[q.data]);
 return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8"><h1 className="font-serif text-2xl font-bold">Começar a folha</h1>{q.error&&<p role="alert">{q.error.message}</p>}{q.isPending&&<p role="status">Carregando opções…</p>}{erro&&<p role="alert">{erro}</p>}{q.data&&<><div className="flex flex-wrap gap-3"><CTAButton className="px-4 py-2" disabled={ocupado} onClick={()=>void criar()}>Folha vazia</CTAButton>{q.data.ultima&&<Button variant="outline" disabled={ocupado} onClick={()=>void criar(null,q.data.ultima?.id??null)}>Copiar a folha de {diaBR(q.data.ultima.data)}</Button>}</div><Modelos lista={q.data.modelos} dosha={fontes.data?.dosha} sintomas={fontes.data?.queixas??[]} ocupado={ocupado} usar={m=>void criar(m.id)}/></>}</main>;
}