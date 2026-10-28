import { describe, expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from '@/integrations/supabase/client';
import { diasDoItem, dowDaData, itemValeNoDia, momentosDaFolha, resumoDias } from './terapiaIndicacoes';
import { alternarFeitoDia, feitoNoDia, meu, progressoSecao, rotuloDiaMarcando } from './terapiaMeu';

const rpcMock = () => vi.mocked(supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null } as never);

describe('Parte 28 · dias da semana no item da folha', () => {
  it('sem "dias" ou com lista vazia vale todo dia', () => {
    expect(diasDoItem({})).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(diasDoItem({ dias: [] })).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('normaliza, ordena e tira repetições e valores fora de 1–7', () => {
    expect(diasDoItem({ dias: [7, 3, 3, 5, 0, 9] })).toEqual([3, 5, 7]);
  });
  it('resume os dias: "qua, sex e dom"; vazio quando vale todo dia', () => {
    expect(resumoDias({ dias: [3, 5, 7] })).toBe('qua, sex e dom');
    expect(resumoDias({ dias: [3] })).toBe('qua');
    expect(resumoDias({})).toBe('');
  });
  it('diz se o item vale no dia da semana', () => {
    expect(itemValeNoDia({ dias: [3, 5, 7] }, 5)).toBe(true);
    expect(itemValeNoDia({ dias: [3, 5, 7] }, 2)).toBe(false);
    expect(itemValeNoDia({}, 2)).toBe(true);
  });
  it('converte data em dia da semana (1 = segunda … 7 = domingo)', () => {
    expect(dowDaData('2026-10-26')).toBe(1);
    expect(dowDaData('2026-10-25')).toBe(7);
  });
  it('o momento todo_dia aparece como "Ao longo do dia" mesmo quando o banco manda "Todo dia"', () => {
    const momentos = momentosDaFolha([{ chave: 'todo_dia', titulo: 'Todo dia' }]);
    expect(momentos.find(m => m.chave === 'todo_dia')?.titulo).toBe('Ao longo do dia');
  });
});

describe('Parte 28 · marcar dias anteriores', () => {
  it('marca e desmarca um item numa data específica sem mexer nos outros dias', () => {
    const f = alternarFeitoDia([{ item: 'a', dia: '2026-10-26' }], 'a', true, '2026-10-27');
    expect(feitoNoDia(f, 'a', '2026-10-26')).toBe(true);
    expect(feitoNoDia(f, 'a', '2026-10-27')).toBe(true);
    expect(feitoNoDia(alternarFeitoDia(f, 'a', false, '2026-10-26'), 'a', '2026-10-26')).toBe(false);
  });
  it('monta a faixa amarela: ontem, anteontem e dias mais antigos', () => {
    expect(rotuloDiaMarcando('2026-10-26', '2026-10-27')).toBe('Marcando ontem, segunda-feira 26');
    expect(rotuloDiaMarcando('2026-10-25', '2026-10-27')).toBe('Marcando anteontem, domingo 25');
    expect(rotuloDiaMarcando('2026-10-24', '2026-10-27')).toBe('Marcando sábado, 24');
  });
  it('envia p_dia para indicacao_marcar quando a pessoa marca outro dia', async () => {
    rpcMock();
    await meu.marcar('f1', 'i1', true, '2026-10-26');
    expect(supabase.rpc).toHaveBeenLastCalledWith('indicacao_marcar', { p_folha: 'f1', p_item: 'i1', p_feito: true, p_dia: '2026-10-26' });
  });
  it('não envia p_dia quando marca hoje', async () => {
    rpcMock();
    await meu.marcar('f1', 'i1', true);
    expect(supabase.rpc).toHaveBeenLastCalledWith('indicacao_marcar', { p_folha: 'f1', p_item: 'i1', p_feito: true });
  });
  it('busca a fita dos últimos 7 dias', async () => {
    rpcMock();
    await meu.fita();
    expect(supabase.rpc).toHaveBeenLastCalledWith('cuidados_fita', undefined);
  });
  it('contagem do momento: "1 de 2 feito hoje", "0 de 2" e "1 de 1 visto"', () => {
    expect(progressoSecao(1, 2)).toBe('1 de 2 feito hoje');
    expect(progressoSecao(0, 2)).toBe('0 de 2');
    expect(progressoSecao(1, 1, true)).toBe('1 de 1 visto');
  });
});
