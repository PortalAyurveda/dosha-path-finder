import { useQuery } from '@tanstack/react-query';
import { chat, CHAT_LISTA_MS } from '@/lib/terapiaChat';
import Conversa from './chat/Conversa';

/** A mesma conversa da aba Mensagens, já aberta com esta pessoa. */
export default function PessoaConversa({ paciente, userId }: { paciente: string; userId?: string }) {
  const q = useQuery({ queryKey: ['chat-lista', true, userId], queryFn: chat.terapeuta, refetchInterval: CHAT_LISTA_MS });
  const conversa = q.data?.find(c => c.paciente.id === paciente);
  if (q.isPending) return <p role="status">Carregando conversa…</p>;
  if (q.error) return <p role="alert">{q.error.message}</p>;
  if (!conversa) return <p className="text-sm text-muted-foreground">Ainda não há conversa com ela. Quando ela mandar a primeira mensagem, a conversa aparece aqui.</p>;
  return <div className="pessoa-conversa max-w-4xl"><Conversa key={conversa.id} conversa={conversa} papel="terapeuta" /></div>;
}
