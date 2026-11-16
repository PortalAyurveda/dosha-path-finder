import { describe, it, expect } from 'vitest';
import { momentoPessoa, linhaHistorico, abaPessoaNova } from './terapiaPessoa';
const agora = Date.parse('2026-11-16T15:00:00Z');
const h = (x: number) => new Date(agora + x * 3600e3).toISOString();
describe('momento da pessoa', () => {
  it('pedido novo vem primeiro', () => expect(momentoPessoa([], [], { id: 'p', inicio: h(24), status: 'aguardando' }, agora).tipo).toBe('pedido'));
  it('pedido já sugerido não vira pedido novo', () => expect(momentoPessoa([], [], { id: 'p', inicio: h(24), status: 'sugerida' }, agora).tipo).toBe('marcar'));
  it('consulta marcada no futuro', () => expect(momentoPessoa([{ id: 'c', inicio: h(5), status: 'marcada' }], [], undefined, agora).tipo).toBe('marcada'));
  it('sala abre 10 minutos antes', () => {
    expect(momentoPessoa([{ id: 'c', inicio: new Date(agora + 9 * 60e3).toISOString(), status: 'marcada' }], [], undefined, agora).tipo).toBe('agora');
    expect(momentoPessoa([{ id: 'c', inicio: new Date(agora + 11 * 60e3).toISOString(), status: 'marcada' }], [], undefined, agora).tipo).toBe('marcada');
  });
  it('consulta feita sem folha', () => expect(momentoPessoa([{ id: 'c', inicio: h(-48), status: 'realizada' }], [], undefined, agora)).toMatchObject({ tipo: 'sem_folha', consulta: 'c' }));
  it('folha enviada depois da consulta', () => expect(momentoPessoa([{ id: 'c', inicio: h(-48), status: 'realizada' }], [{ id: 'f', criado_em: h(-40), enviada_em: h(-30), vista_em: null }], undefined, agora)).toMatchObject({ tipo: 'folha', folha: 'f' }));
  it('linha do histórico', () => expect(linhaHistorico(h(-24 * 95), [{ id: 'c', inicio: h(-48), status: 'realizada' }], [{ id: 'f', criado_em: h(-40), enviada_em: '2026-11-14T15:00:00Z', vista_em: null }], agora)).toBe('Com você há 3 meses · 1 consulta · última folha em 14/11'));
  it('endereços antigos abrem O que a pessoa mandou', () => { expect(abaPessoaNova('fotos')).toBe('mandou'); expect(abaPessoaNova('ficha')).toBe('mandou'); expect(abaPessoaNova(null)).toBe('consultas'); });
});
