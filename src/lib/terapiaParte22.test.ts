import { describe, expect, it } from 'vitest';
import { distanciaRetorno, iniciarIndicacoes, momentoDaChave, momentosDaFolha, verTexto } from './terapiaIndicacoes';
import { ordenarPorTeste } from './terapiaModelos';

describe('Parte 22 · adaptador de chaves antigas', () => {
  it.each([['cafe_manha','manha'],['almoco','refeicoes'],['lanche_tarde','refeicoes'],['jantar','refeicoes'],['chas','todo_dia'],['praticas','todo_dia'],['rotina','todo_dia'],['demais','todo_dia'],['literatura','ler'],['qualquer','todo_dia'],['noite','noite']])('%s → %s', (a, b) => expect(momentoDaChave(a)).toBe(b));
  it('junta itens antigos no momento novo sem perder nenhum', () => {
    const d = iniciarIndicacoes({ secoes: { almoco: [{ id: '1', titulo: 'A', nota: '' }], jantar: [{ id: '2', titulo: 'B', nota: '' }], refeicoes: [{ id: '3', titulo: 'C', nota: '' }] } });
    expect(d.secoes.refeicoes.map(i => i.id).sort()).toEqual(['1', '2', '3']);
  });
  it('sempre os 5 momentos na ordem', () => expect(momentosDaFolha([]).map(m => m.titulo)).toEqual(['Manhã', 'Refeições', 'Noite', 'Ao longo do dia', 'Para ler e assistir']));
});
describe('Parte 22 · próxima consulta e links', () => {
  it('em 3 semanas', () => expect(distanciaRetorno('2026-11-16', new Date(2026, 9, 26))).toBe('em 3 semanas'));
  it('texto do link por tipo', () => { expect(verTexto('receita')).toBe('ver receita'); expect(verTexto('aula')).toBe('ver aula'); expect(verTexto('produto')).toBe('ver produto'); });
});
describe('Parte 22 · folhas prontas', () => {
  it('as do mesmo dosha principal do teste vêm primeiro', () => {
    const r = ordenarPorTeste([{ id: 'a', nome: 'A', dosha: 'Pitta', itens: 1, usos: 0 }, { id: 'b', nome: 'B', dosha: 'Vata', itens: 1, usos: 0 }], 'Vata-Pitta');
    expect(r[0].id).toBe('b'); expect(r[0].combina).toBe(true); expect(r[1].combina).toBe(false);
  });
});
