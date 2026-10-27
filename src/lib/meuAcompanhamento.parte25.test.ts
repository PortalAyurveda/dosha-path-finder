import { describe, it, expect } from 'vitest';
import { blocoDaAba, explicarTermo, linhaConsultaMinha, icsConsulta } from './meuAcompanhamento';
describe('Meu acompanhamento página única', () => {
  it('endereços antigos levam ao bloco', () => {
    expect(blocoDaAba('conversa')).toBe('ac-conversa');
    expect(blocoDaAba('indicacoes')).toBe('ac-seu-dia');
    expect(blocoDaAba('avaliacao')).toBe('ac-consultas');
    expect(blocoDaAba('fotos')).toBe('ac-mandou');
    expect(blocoDaAba('evolucao')).toBe('ac-mandou');
    expect(blocoDaAba(null)).toBeNull();
  });
  it('explica palavras técnicas', () => {
    expect(explicarTermo('Agni irregular')).toBe('Agni irregular (agni: a força da digestão)');
    expect(explicarTermo('Ama V1 P0 K0')).toContain('ama: resíduos');
    expect(explicarTermo('Pele seca')).toBe('Pele seca');
  });
  it('linha da consulta', () => {
    expect(linhaConsultaMinha({ inicio: '2026-10-26T13:00:00Z', folha_enviada: true, status: 'realizada' }, true)).toBe('26/10 · avaliação e folha');
  });
  it('calendário', () => expect(icsConsulta({ id: 'c', inicio: '2026-10-28T13:00:00Z', fim: '2026-10-28T14:00:00Z' }, 'Ana', 'u')).toContain('DTSTART:20261028T130000Z'));
});
