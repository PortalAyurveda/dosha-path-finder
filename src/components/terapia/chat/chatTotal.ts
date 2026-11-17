import {useQuery} from '@tanstack/react-query';
import {useUser} from '@/contexts/UserContext';
import {chat} from '@/lib/terapiaChat';
import {PING_MS} from '@/lib/terapia';

export function useChatTotal(){const {user,isAnonymous}=useUser();const q=useQuery({queryKey:['chat-total',user?.id],queryFn:chat.naoLidas,enabled:!!user&&!isAnonymous,refetchInterval:PING_MS,refetchIntervalInBackground:true});return user&&!isAnonymous?q.data??0:0;}
