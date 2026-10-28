import { describe, it, expect } from 'vitest';
import { fraseResumoAreas, maiorDoshaComposicao, doshaMaisAlimentos } from './terapiaPaciente';
import type { ResumoAreas } from './terapiaPaciente';
import { tituloSecaoFechada, situacaoIndicacoes } from './terapiaIndicacoes';
import { situacaoAvaliacao, marcadosNoSistema, iniciarDados, novaMarca } from './terapiaAvaliacao';
import { secoesDaHora, progressoSecao } from './terapiaMeu';

const resumo: ResumoAreas = {
  composicao: { vata: { total: 35, perguntas: 21, queixas: 12, alimentacao: 2 }, pitta: { total: 26, perguntas: 21, queixas: 4, alimentacao: 1 }, kapha: { total: 14, perguntas: 10, queixas: 2, alimentacao: 2 } },
  areas: [{ area: 'Mente e sono', de: 8, qtd: 3, marcou: [{ queixa: 'Insônia', dosha: 'vata' }] }],
  alimentacao: { vata: ['Saladas', 'Frutas'], pitta: ['Molhos'], kapha: ['Massas', 'Queijos'], de_cada: 6 },
  agni: { tipo: 'irregular', nivel: 1, texto: 'Nível 1 · iniciando', irregular: 4, forte: 3, fraco: 2 },
  ligacoes: [], queixas_total: 9, queixas_de: 42,
};

describe('Parte 20 · resumo por área', () => {
  it('frase resume queixas, área principal, agni e alimentos do dosha com mais marcas', () => {
    expect(fraseResumoAreas(resumo)).toBe('Marcou 9 de 42 sintomas, a maioria em Mente e sono (3). Agni irregular. Come muito saladas e frutas.');
  });
  it('sem queixas a frase começa pelo agni e usa "e" antes do último alimento', () => {
    expect(fraseResumoAreas({ ...resumo, queixas_total: 0, areas: [] })).toBe('Agni irregular. Come muito saladas e frutas.');
    expect(fraseResumoAreas({ ...resumo, alimentacao: { vata: ['Saladas'], pitta: [], kapha: [], de_cada: 6 } })).toContain('Come muito saladas.');
  });
  it('maior dosha da composição e dosha com mais alimentos seguem Vata, Pitta, Kapha no empate', () => {
    expect(maiorDoshaComposicao(resumo.composicao)).toBe('vata');
    expect(doshaMaisAlimentos(resumo.alimentacao)).toBe('vata');
    expect(doshaMaisAlimentos({ vata: [], pitta: ['A', 'B'], kapha: ['C'], de_cada: 6 })).toBe('pitta');
  });
});

describe('Parte 20 · sanfona da folha de indicações', () => {
  it('seção fechada mostra contagem e primeiros nomes, ou "vazio"', () => {
    expect(tituloSecaoFechada('Jantar', [])).toBe('Jantar · vazio');
    expect(tituloSecaoFechada('Café da manhã', [{ id: '1', titulo: 'Mingau', nota: '' }, { id: '2', titulo: 'Chá de hortelã', nota: '' }, { id: '3', titulo: 'Fruta', nota: '' }])).toBe('Café da manhã · 3 itens · Mingau, Chá de hortelã, Fruta');
    expect(tituloSecaoFechada('Ceia', [{ id: '1', titulo: 'Leite morno', nota: '' }])).toBe('Ceia · 1 item · Leite morno');
  });
  it('situação da folha: rascunho ou data de envio', () => {
    expect(situacaoIndicacoes({ enviada_em: null })).toBe('Indicações em rascunho');
    expect(situacaoIndicacoes({ enviada_em: '2026-10-26T13:00:00Z' })).toBe('Indicações enviadas em 26/10/2026');
  });
});

describe('Parte 20 · mesa de avaliação', () => {
  it('avaliação concluída só quando há leitura de dosha', () => {
    expect(situacaoAvaliacao({ leitura: null })).toBe('Avaliação em andamento');
    expect(situacaoAvaliacao({ leitura: { V: 0, P: 0, K: 0 } })).toBe('Avaliação em andamento');
    expect(situacaoAvaliacao({ leitura: { V: 2, P: 1, K: 0 } })).toBe('Avaliação concluída');
  });
  it('conta marcados por sistema sem misturar outros setores', () => {
    const d = iniciarDados({ versao: 1 }, null);
    d.marcas.a = { ...novaMarca({ id: 'a', nome: 'Azia', setor: 'sintomas' }), marcado: true };
    d.marcas.b = { ...novaMarca({ id: 'b', nome: 'Insônia', setor: 'sintomas' }), marcado: true };
    d.marcas.c = { ...novaMarca({ id: 'c', nome: 'Azia', setor: 'dhatus' }), marcado: true };
    d.marcas.d = { ...novaMarca({ id: 'd', nome: 'Refluxo', setor: 'sintomas' }) };
    expect(marcadosNoSistema(d, { V: ['Insônia'], P: ['Azia', 'Refluxo'], K: [] })).toBe(2);
  });
});

describe('Parte 22 · Seu dia no celular', () => {
  // Parte 28: no celular todos os momentos ficam abertos (sem sanfona), então secoesDaHora deixou de existir.
  it('contagem do momento', () => {
    expect(progressoSecao(1, 2)).toBe('1 de 2 feito hoje');
  });
});
