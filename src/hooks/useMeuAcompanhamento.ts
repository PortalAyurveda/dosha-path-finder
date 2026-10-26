import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { meu } from '@/lib/terapiaMeu';
import { acompanhamento,pendencias } from '@/lib/meuAcompanhamento';
import { chat } from '@/lib/terapiaChat';
export function useMeuAcompanhamento() {
  const {user,isAnonymous}=useUser();const enabled=!!user&&!isAnonymous;
  const ligacoes=useQuery({queryKey:['meu-terapeuta',user?.id],queryFn:meu.terapeuta,enabled,refetchInterval:30000,refetchIntervalInBackground:false});
  const fotos=useQuery({queryKey:['fotos-minhas',user?.id],queryFn:meu.fotos,enabled:enabled&&!!ligacoes.data?.length,refetchInterval:30000,refetchIntervalInBackground:false});
  const consultas=useQuery({queryKey:['acomp-consultas',user?.id],queryFn:acompanhamento.consultas,enabled:enabled&&!!ligacoes.data?.length,refetchInterval:30000,refetchIntervalInBackground:false});
  const conversas=useQuery({queryKey:['chat-lista',false,user?.id],queryFn:chat.minhas,enabled:enabled&&!!ligacoes.data?.length,refetchInterval:30000,refetchIntervalInBackground:false});
  const total=(ligacoes.data??[]).reduce((n,l)=>n+pendencias(l,fotos.data,consultas.data).total+(conversas.data?.find(c=>c.terapeuta.slug===l.terapeuta.slug)?.nao_lidas??0),0);
  return {ligacoes,fotos,consultas,conversas,total};
}