import { supabase } from '@/integrations/supabase/client';
export interface PedidoFoto {id:string;titulo:string;instrucao:string|null;modelo:string|null;ate:string|null;status?:'pedido'|'enviada';foto_id?:string|null;terapeuta?:string}
const rpc = supabase.rpc.bind(supabase) as unknown as (n:string,p?:Record<string,unknown>)=>PromiseLike<{data:unknown;error:{message:string}|null}>;
async function read<T>(n:string,p?:Record<string,unknown>):Promise<T>{const {data,error}=await rpc(n,p);if(error)throw new Error(error.message);return data as T;}
export const fotosPedidos={
 lista:(paciente:string)=>read<PedidoFoto[]>('terapia_foto_pedidos',{p_paciente:paciente}),
 pedir:(paciente:string,titulo:string,instrucao:string,modelo:string,ate:string)=>read<string>('terapia_foto_pedir',{p_paciente:paciente,p_titulo:titulo,p_instrucao:instrucao||null,p_modelo:modelo||null,p_ate:ate||null}),
 cancelar:(id:string)=>read<void>('terapia_foto_pedido_cancelar',{p_id:id}),
};