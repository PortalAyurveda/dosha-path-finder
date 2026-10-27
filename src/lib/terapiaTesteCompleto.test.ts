import { describe, it, expect } from 'vitest';
import { vencedorAgni, nivelAgni, mesmoRegistro, linhasComposicao } from './terapiaTesteCompleto';
import type { ResumoAreas, TesteCompleto } from './terapiaPaciente';

const composicao = { vata: { total: 35, perguntas: 21, queixas: 12, alimentacao: 2, idade: 0, imc: 0 }, pitta: { total: 26, perguntas: 18, queixas: 4, alimentacao: 1, idade: 2, imc: 1 }, kapha: { total: 14, perguntas: 9, queixas: 2, alimentacao: 2, idade: 0, imc: 1 } };
const resumo: ResumoAreas = { composicao, areas: [], alimentacao: { vata: [], pitta: [], kapha: [], de_cada: 6 }, agni: { tipo: 'irregular', texto: '', nivel: 1, irregular: 4, forte: 3, fraco: 2 }, ligacoes: [], queixas_total: 0, queixas_de: 42 };
const completo: TesteCompleto = { registro: 10, id: 'ABC', data: '2026-09-18', tipo: 'completo', vata: 35, pitta: 26, kapha: 14, idade: 41, imc: 23.1, composicao, agni: resumo.agni, partes: [{ parte: 'part1', titulo: 'Mente e emoções', soma: { vata: 7, pitta: 1, kapha: 0, agni_irregular: 2 }, perguntas: [] }] };

describe('Parte 21 · regras do agni', () => {
  it('maior soma vence quando irregular está a mais de dois pontos', () => {
    expect(vencedorAgni({ irregular: 4, forte: 7, fraco: 2 })).toBe('forte');
    expect(vencedorAgni({ irregular: 4, forte: 2, fraco: 7 })).toBe('fraco');
  });
  it('forte ou fraco até dois pontos acima de irregular dá vitória a irregular', () => {
    expect(vencedorAgni({ irregular: 4, forte: 6, fraco: 2 })).toBe('irregular');
    expect(vencedorAgni({ irregular: 4, forte: 2, fraco: 6 })).toBe('irregular');
    expect(vencedorAgni({ irregular: 4, forte: 4, fraco: 4 })).toBe('irregular');
  });
  it('até dois pontos significa digestão boa', () => { expect(nivelAgni(2)).toBe(0); });
  it('três a seis pontos significa nível um', () => { expect(nivelAgni(3)).toBe(1); expect(nivelAgni(6)).toBe(1); });
  it('sete a dez pontos significa nível dois', () => { expect(nivelAgni(7)).toBe(2); expect(nivelAgni(10)).toBe(2); });
  it('onze ou mais pontos significa nível três', () => { expect(nivelAgni(11)).toBe(3); });
});
describe('Parte 21 · composição histórica', () => {
  it('compara registro com teste.id, nunca o id público nem a data', () => {
    expect(mesmoRegistro(completo, { id: '10' } as never)).toBe(true);
    expect(mesmoRegistro(completo, { id: 'ABC' } as never)).toBe(false);
    expect(mesmoRegistro(completo, { data: completo.data } as never)).toBe(false);
  });
  it('mesmo registro usa pontos históricos das partes e modificadores', () => {
    const linhas = linhasComposicao(resumo, completo, { id: 10 } as never);
    expect(linhas[0].soma.vata).toBe(7);
    expect(linhas[3].soma.pitta).toBe(2);
    expect(linhas[4].soma.kapha).toBe(1);
    expect(linhas[1].separador).toBe(true);
  });
  it('outro registro usa a composição do cartão, sem misturar partes antigas', () => {
    const linhas = linhasComposicao(resumo, completo, { id: 11 } as never);
    expect(linhas).toHaveLength(5);
    expect(linhas[0].soma.vata).toBe(21);
    expect(linhas[3].soma.pitta).toBe(2);
    expect(linhas[4].soma.kapha).toBe(1);
  });
});