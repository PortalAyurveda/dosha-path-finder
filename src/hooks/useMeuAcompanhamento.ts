import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { meu } from '@/lib/terapiaMeu';
import { sala, type SalaConsulta } from '@/lib/consultaSala';
import { pendencias } from '@/lib/meuAcompanhamento';
export function useMeuAcompanhamento() {
  const {user,isAnonymous}=useUser();const enabled=!!user&&!isAnonymous;
  const ligacoes=useQuery({queryKey:['meu-terapeuta',user?.id],queryFn:meu.terapeuta,enabled,refetchInterval:30000,refetchIntervalInBackground:false});
  const fotos=useQuery({queryKey:['fotos-minhas',user?.id],queryFn:meu.fotos,enabled:enabled&&!!ligacoes.data?.length,refetchInterval:30000,refetchIntervalInBackground:false});
  const ids=(ligacoes.data??[]).flatMap(l=>l.historico.filter(c=>c.status==='realizada').map(c=>c.id));
  const salas=useQuery({queryKey:['acomp-salas',user?.id,ids],queryFn:async()=>{
    const resultados=await Promise.all(ids.map(async id=>{try{return [id,await sala.consultar(id)] as const;}catch{return null;}}));
    return Object.fromEntries(resultados.filter((r):r is readonly [string,SalaConsulta]=>r!==null)) as Record<string,SalaConsulta>;
  },enabled:enabled&&ids.length>0,refetchInterval:30000,refetchIntervalInBackground:false});
  const total=(ligacoes.data??[]).reduce((n,l)=>n+pendencias(l,fotos.data,salas.data).total,0);
  return {ligacoes,fotos,salas,total};
}