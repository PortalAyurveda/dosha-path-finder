import type { ResumoAreas, TesteCompleto, TestePaciente, SomaParte } from './terapiaPaciente';

export const DOSHAS_TESTE = ['vata', 'pitta', 'kapha'] as const;
export const AGNIS_TESTE = [['irregular', 'vata', 'Irregular'], ['forte', 'pitta', 'Forte'], ['fraco', 'kapha', 'Fraco']] as const;
export function mesmoRegistro(completo?: TesteCompleto | null, teste?: TestePaciente | null) {
  return completo != null && teste?.id != null && String(completo.registro) === String(teste.id);
}
export function vencedorAgni(agni: { irregular: number; forte: number; fraco: number }) {
  let vencedor: 'irregular' | 'forte' | 'fraco' = 'irregular';
  for (const [tipo] of AGNIS_TESTE) if (agni[tipo] > agni[vencedor]) vencedor = tipo;
  return vencedor !== 'irregular' && agni[vencedor] - agni.irregular <= 2 ? 'irregular' : vencedor;
}
export function nivelAgni(soma: number) { return soma <= 2 ? 0 : soma <= 6 ? 1 : soma <= 10 ? 2 : 3; }
export function dataCurtaTeste(data: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);
  return match ? `${match[3]}/${match[2]}` : data;
}
export function pontosOrigem(composicao: ResumoAreas['composicao'], origem: 'queixas' | 'alimentacao' | 'idade' | 'imc' | 'perguntas' | 'total'): SomaParte {
  return { vata: composicao.vata?.[origem] ?? 0, pitta: composicao.pitta?.[origem] ?? 0, kapha: composicao.kapha?.[origem] ?? 0 };
}
export function linhasComposicao(resumo: ResumoAreas, completo?: TesteCompleto | null, teste?: TestePaciente | null) {
  const detalhado = mesmoRegistro(completo, teste);
  const composicao = detalhado && completo ? completo.composicao : resumo.composicao;
  const partes = detalhado && completo ? completo.partes.map(p => ({ titulo: p.titulo, soma: p.soma, separador: false })) : [{ titulo: 'Perguntas do teste', soma: pontosOrigem(composicao, 'perguntas'), separador: false }];
  return [...partes, ...(['queixas', 'alimentacao', 'idade', 'imc'] as const).map((origem, i) => ({
    titulo: origem === 'queixas' ? 'Sintomas dos doshas' : origem === 'alimentacao' ? 'Alimentação' : origem === 'idade' ? `Idade${detalhado && completo?.idade != null ? ` (${completo.idade} anos)` : ''}` : `Peso e altura${detalhado && completo?.imc != null ? ` (IMC ${completo.imc.toLocaleString('pt-BR')})` : ''}`,
    soma: pontosOrigem(composicao, origem), separador: detalhado && i === 0,
  }))];
}