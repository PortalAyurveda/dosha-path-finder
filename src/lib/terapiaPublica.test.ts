import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc:vi.fn()}}));
import { supabase } from '@/integrations/supabase/client';
import { terapia, valorDigitado } from './terapia';
import { AGORA_ESPERA_MS, RESERVA_MINUTOS, ordenarDiretorio, horarioNestaSemana, tempoPedido, consultaICS } from './terapiaPublica';
const rpc = vi.mocked(supabase.rpc as unknown as ReturnType<typeof vi.fn>);
describe('Parte 8',()=>{
  it('valor zero é válido e vazio não é informado',()=>{expect(valorDigitado('0')).toBe(0);expect(valorDigitado('')).toBeNull();expect(valorDigitado('-1')).toBeNull();});
  it('recomendados preserva ordem do banco e põe os outros depois',()=>{expect(ordenarDiretorio([{id:'a'},{id:'b'},{id:'c'}],[{id:'b',proximo:null},{id:'a',proximo:null}],'recomendados').map(t=>t.id)).toEqual(['b','a','c']);});
  it('perfil teste recebido vem antes dos outros',()=>{expect(ordenarDiretorio([{id:'a'},{id:'t'}],[{id:'a',proximo:null},{id:'t',proximo:null,teste:true}],'recentes').map(t=>t.id)).toEqual(['t','a']);});
  it('semana termina na segunda-feira de São Paulo',()=>{const agora=new Date('2026-10-26T16:00:00Z');expect(horarioNestaSemana('2026-11-01T12:00:00Z',agora)).toBe(true);expect(horarioNestaSemana('2026-11-02T12:00:00Z',agora)).toBe(false);});
  it('consulta pública pede catorze dias',async()=>{rpc.mockResolvedValueOnce({data:{},error:null});await terapia.agendaPublica('ana');expect(rpc).toHaveBeenLastCalledWith('terapeuta_agenda_publica',{p_slug:'ana',p_dias:14});});
  it('reserva usa slug e horário e dura quinze minutos',async()=>{rpc.mockResolvedValueOnce({data:'fim',error:null});await terapia.reservar('ana','inicio');expect(rpc).toHaveBeenLastCalledWith('terapeuta_reservar',{p_slug:'ana',p_inicio:'inicio'});expect(RESERVA_MINUTOS).toBe(15);});
  it('confirmação pública envia motivo e as quatro permissões',async()=>{rpc.mockResolvedValueOnce({data:{consulta:'c'},error:null});await terapia.marcarPublico('ana','inicio','Sono',{teste:true,fotos:true,rotina:true,akasha:false});expect(rpc).toHaveBeenLastCalledWith('terapeuta_marcar_publico',{p_slug:'ana',p_inicio:'inicio',p_motivo:'Sono',p_teste:true,p_fotos:true,p_rotina:true,p_akasha:false});});
  it('polling sem pedido é quinze segundos',()=>expect(AGORA_ESPERA_MS).toBe(15000));
  it('contagem usa expiração do banco',()=>expect(tempoPedido('2026-10-26T16:05:00Z',Date.parse('2026-10-26T16:00:28Z'))).toBe('4:32'));
  it('agenda do celular contém início e fim reais',()=>{const texto=consultaICS({consulta:'c',inicio:'2026-10-27T12:00:00Z',fim:'2026-10-27T13:00:00Z'},'Ana');expect(texto).toContain('DTSTART:20261027T120000Z');expect(texto).toContain('DTEND:20261027T130000Z');});
});