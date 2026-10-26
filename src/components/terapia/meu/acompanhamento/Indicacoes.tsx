import { useEffect,useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { meu,type MeuTerapeutaLigacao } from '@/lib/terapiaMeu';
import { diaBR } from '@/lib/terapia';
import DoSeuTerapeuta from '../DoSeuTerapeuta';
export default function Indicacoes({l}:{l:MeuTerapeutaLigacao}) {
  const [id,setId]=useState(l.folhas[0]?.id??'');const qc=useQueryClient();
  const recentes=useQuery({queryKey:['acomp-indicacoes'],queryFn:meu.indicacoes});
  const folha=useQuery({queryKey:['acomp-folha',id],queryFn:()=>meu.folha(id),enabled:!!id});
  useEffect(()=>{if(!folha.data||folha.data.vista_em)return;meu.vista(folha.data.id).then(()=>qc.invalidateQueries({queryKey:['meu-terapeuta']})).catch(()=>undefined);},[folha.data?.id]);
  const atual=folha.data??recentes.data?.find(f=>f.terapeuta.slug===l.terapeuta.slug);
  return <>{folha.error?<p role="alert">{folha.error.message}</p>:folha.isFetching&&!atual?<p role="status">Carregando indicações…</p>:atual?<DoSeuTerapeuta folha={atual} acompanhamento/>:<p>A {l.terapeuta.primeiro_nome} ainda não te enviou indicações.</p>}<section className="ac-card"><h3 className="ac-eti">Folhas anteriores</h3>{l.folhas.filter(f=>f.id!==id).map(f=><div className="ac-linha" key={f.id}><div><b>Folha de {diaBR(f.enviada_em)}</b>{f.diagnostico&&<p className="ac-muted">{f.diagnostico}</p>}</div><Button variant="outline" onClick={()=>setId(f.id)}>Abrir</Button></div>)}{l.folhas.filter(f=>f.id!==id).length===0&&<p>Nenhuma folha anterior.</p>}</section></>;
}