import { supabase } from '@/integrations/supabase/client';
export interface SugestaoRetorno {dias:number;inicio:string|null;fim:string|null}
const rpc = supabase.rpc.bind(supabase) as unknown as (n:string,p?:Record<string,unknown>)=>PromiseLike<{data:unknown;error:{message:string}|null}>;
async function read<T>(n:string,p?:Record<string,unknown>):Promise<T>{const {data,error}=await rpc(n,p);if(error)throw new Error(error.message);return data as T;}
export const fimTerapia={retornos:(paciente:string)=>read<SugestaoRetorno[]>('terapia_retorno_sugestoes',{p_paciente:paciente}),nota:(paciente:string,texto:string,consulta:string)=>read<string>('acomp_nota_salvar',{p_paciente:paciente,p_texto:texto,p_consulta:consulta})};