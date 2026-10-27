import { describe, it, expect } from 'vitest';
import { abaPainel, abaPessoa, botaoPrincipal, agruparConsultas, resumoEvolucao, urlDestino } from './terapiaPessoa';

const agora = Date.parse('2026-10-27T13:00:00Z');
describe('endereços antigos', () => {
  it('painel', () => {
    expect(abaPainel('pacientes')).toBe('pessoas');
    expect(abaPainel('acervo')).toBe('bibliotecas');
    expect(abaPainel('link')).toBe('link');
    expect(abaPainel('perfil')).toBe('perfil');
    expect(abaPainel('configuracoes')).toBe('configuracoes');
    expect(abaPainel(null)).toBe('hoje');
  });
  it('pessoa', () => {
    expect(abaPessoa('resumo')).toEqual({ aba: 'ficha' });
    expect(abaPessoa('evolucao')).toEqual({ aba: 'ficha', cartao: 'evolucao' });
    expect(abaPessoa('akasha')).toEqual({ aba: 'ficha', cartao: 'akasha' });
    expect(abaPessoa('anotacoes')).toEqual({ aba: 'consultas' });
    expect(abaPessoa('fotos')).toEqual({ aba: 'fotos' });
  });
  it('destinos', () => {
    expect(urlDestino('treino')).toBe('/consulta/treino');
    expect(urlDestino('link')).toBe('/painel-terapeuta?aba=link');
  });
});
describe('botão principal', () => {
  it('marcar sem consulta', () => expect(botaoPrincipal([], [], agora).tipo).toBe('marcar'));
  it('entrar na sala quando abre', () => expect(botaoPrincipal([{ id: 'a', inicio: '2026-10-27T13:05:00Z', status: 'marcada' }], [], agora).tipo).toBe('sala'));
  it('montar indicações depois de realizada sem folha enviada', () => {
    const c = [{ id: 'r', inicio: '2026-10-20T13:00:00Z', status: 'realizada' }];
    expect(botaoPrincipal(c, [], agora).tipo).toBe('indicacoes');
    expect(botaoPrincipal(c, [{ id: 'f', criado_em: '2026-10-20T14:00:00Z', enviada_em: '2026-10-20T15:00:00Z', vista_em: null }], agora).tipo).toBe('marcar');
  });
});
it('agrupa notas e folhas por consulta', () => {
  const r = agruparConsultas([{ id: 'c1', inicio: '2026-10-01T12:00:00Z', status: 'realizada' }], [], [{ id: 'f', criado_em: '2026-10-02T12:00:00Z', enviada_em: null, vista_em: null }], [{ id: 'n1', texto: 'a', em: '', consulta_id: 'c1' }, { id: 'n2', texto: 'b', em: '', consulta_id: null }]);
  expect(r.grupos[0].folhas.map(f => f.id)).toEqual(['f']);
  expect(r.grupos[0].notas.map(n => n.id)).toEqual(['n1']);
  expect(r.geral.notas.map(n => n.id)).toEqual(['n2']);
});
it('resumo da evolução', () => {
  expect(resumoEvolucao([{ data: '2026-01-01', vata: 46, pitta: 30, kapha: 20 }, { data: '2026-02-01', vata: 40, pitta: 30, kapha: 20 }, { data: '2026-03-01', vata: 39, pitta: 30, kapha: 20 }, { data: '2026-04-01', vata: 38, pitta: 30, kapha: 20 }])).toBe('4 revisões · Vata 46 → 38');
});
