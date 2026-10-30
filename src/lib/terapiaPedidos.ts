import { supabase } from '@/integrations/supabase/client';
import type { PermissoesConvite } from './terapiaConvite';

export type StatusPedido = 'preenchendo' | 'aguardando' | 'sugerida' | 'confirmada' | 'recusada' | 'cancelada' | 'expirada';
export interface PedidoConsulta {
  id: string; status: StatusPedido; inicio: string; fim: string; motivo: string | null;
  permissoes: PermissoesConvite; guardado_ate: string; enviada_em: string | null; pedido_inicio: string;
  sugerido_inicio: string | null; sugerido_fim: string | null; resposta_texto: string | null; respondida_em: string | null;
  consulta_id: string | null; dados: { fotos?: number; tem_teste?: boolean; tem_nascimento?: boolean } | null;
  criado_em: string; atualizado_em: string;
  terapeuta: { id: string; nome: string; primeiro_nome: string; imagem: string | null; slug: string };
}
export interface PedidoTerapeuta extends PedidoConsulta { paciente_id: string; nome: string; horas_esperando: number | null }
export type AcaoPedido = 'confirmar' | 'sugerir' | 'recusar';

async function rpc<T>(nome: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(nome as never, args as never);
  if (error) throw new Error(error.message);
  return data as T;
}
const perm = (p: PermissoesConvite) => ({ p_teste: p.teste, p_fotos: p.fotos, p_rotina: p.rotina, p_akasha: p.akasha });

export const pedidos = {
  solicitar: (slug: string, inicio: string) => rpc<PedidoConsulta>('terapeuta_solicitar', { p_slug: slug, p_inicio: inicio }),
  meu: (slug: string) => rpc<PedidoConsulta | null>('consulta_pedido_meu', { p_slug: slug }),
  salvar: (id: string, motivo: string, p: PermissoesConvite) => rpc<PedidoConsulta>('consulta_pedido_salvar', { p_id: id, p_motivo: motivo, ...perm(p) }),
  enviar: (id: string, motivo: string, p: PermissoesConvite) => rpc<PedidoConsulta>('consulta_pedido_enviar', { p_id: id, p_motivo: motivo, ...perm(p) }),
  cancelar: (id: string) => rpc<void>('consulta_pedido_cancelar', { p_id: id }),
  meus: () => rpc<PedidoConsulta[]>('meus_pedidos_consulta'),
  daTerapeuta: () => rpc<PedidoTerapeuta[]>('terapeuta_pedidos'),
  responder: (id: string, acao: AcaoPedido, inicio?: string, texto?: string) => rpc<PedidoConsulta>('terapeuta_pedido_responder', { p_id: id, p_acao: acao, p_inicio: inicio ?? null, p_texto: texto ?? null }),
  sugestao: (id: string, aceitar: boolean) => rpc<PedidoConsulta>('consulta_sugestao_responder', { p_id: id, p_aceitar: aceitar }),
};

export const PEDIDO_HORAS = 2;
export function quandoPedido(s: string) {
  return new Date(s).toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}
/** Texto curto de situação mostrado à pessoa. */
export function situacaoPedido(p: Pick<PedidoConsulta, 'status' | 'terapeuta'>) {
  const n = p.terapeuta.primeiro_nome;
  switch (p.status) {
    case 'preenchendo': return 'Falta enviar o pedido';
    case 'aguardando': return `Pedido enviado. ${n} vai confirmar.`;
    case 'sugerida': return `${n} sugeriu outro horário`;
    case 'confirmada': return 'Consulta confirmada';
    case 'recusada': return `${n} não pôde atender neste horário`;
    case 'expirada': return 'O pedido venceu sem resposta';
    default: return 'Pedido cancelado';
  }
}
export function tempoRestante(ate: string, agora: number) {
  const min = Math.max(0, Math.ceil((Date.parse(ate) - agora) / 60000));
  if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return `${h} h${m ? ` ${m} min` : ''}`; }
  return `${min} min`;
}
