import type { ConsultaPaciente, NotaPaciente, EvolucaoPaciente } from './terapiaPaciente';
import { proximaConsulta, salaPacienteAberta } from './terapiaPaciente';
import type { AvaliacaoLista } from './terapiaAvaliacao';
import type { FolhaIndicacoesLista } from './terapiaIndicacoes';

/** Menu do terapeuta: 5 itens + Meu perfil (Meu link, Perfil público, Configurações). */
export const MENU_TERAPEUTA = [['hoje', 'Hoje'], ['pessoas', 'Pessoas'], ['agenda', 'Agenda'], ['mensagens', 'Mensagens'], ['bibliotecas', 'Bibliotecas']] as const;
export const ABAS_MEU_PERFIL = [['link', 'Meu link'], ['perfil', 'Perfil público'], ['configuracoes', 'Configurações']] as const;
export type AbaPainel = typeof MENU_TERAPEUTA[number][0] | typeof ABAS_MEU_PERFIL[number][0];
/** Converte ?aba= (inclusive endereços antigos) na aba do painel. */
export function abaPainel(valor: string | null): AbaPainel {
  const v = valor === 'pacientes' ? 'pessoas' : valor === 'acervo' ? 'bibliotecas' : valor === 'config' ? 'configuracoes' : valor === 'meu-perfil' ? 'link' : valor;
  return ([...MENU_TERAPEUTA, ...ABAS_MEU_PERFIL] as readonly (readonly [string, string])[]).some(([k]) => k === v) ? v as AbaPainel : 'hoje';
}
export const ehMeuPerfil = (aba: string) => ABAS_MEU_PERFIL.some(([k]) => k === aba);

export interface PassoInicial { chave: string; titulo: string; ajuda: string | null; destino: string; feito: boolean }
export interface PrimeirosPassos { passos: PassoInicial[]; feitos: number; total: number }
/** Endereço para onde cada destino de "Comece por aqui" leva. */
export function urlDestino(destino: string) {
  if (destino === 'treino') return '/consulta/treino';
  return `/painel-terapeuta?aba=${abaPainel(destino)}`;
}

export type CartaoFicha = 'teste' | 'sintomas' | 'evolucao' | 'escreveu' | 'rotina' | 'akasha' | 'nascimento';
export type AbaPessoa = 'ficha' | 'consultas' | 'fotos' | 'conversa';
/** Converte ?aba= da página da pessoa (inclusive endereços antigos). */
export function abaPessoa(valor: string | null): { aba: AbaPessoa; cartao?: CartaoFicha } {
  if (valor === 'evolucao' || valor === 'rotina' || valor === 'akasha') return { aba: 'ficha', cartao: valor };
  if (valor === 'anotacoes') return { aba: 'consultas' };
  if (valor === 'consultas' || valor === 'fotos' || valor === 'conversa') return { aba: valor };
  return { aba: 'ficha' };
}

export type BotaoPrincipal = { tipo: 'sala'; consulta: string } | { tipo: 'indicacoes'; consulta: string } | { tipo: 'marcar' };
export function ultimaRealizada(consultas: ConsultaPaciente[], agora: number) {
  return consultas.filter(c => c.status === 'realizada' && Date.parse(c.inicio) <= agora).sort((a, b) => Date.parse(b.inicio) - Date.parse(a.inicio))[0];
}
/** Um único botão principal no topo da pessoa, conforme o momento. */
export function botaoPrincipal(consultas: ConsultaPaciente[], folhas: FolhaIndicacoesLista[], agora: number): BotaoPrincipal {
  const proxima = proximaConsulta(consultas, agora) ?? consultas.find(c => c.status === 'marcada' && Date.parse(c.inicio) < agora && salaPacienteAberta(c, agora) && agora - Date.parse(c.inicio) < 2 * 3600e3);
  if (proxima && salaPacienteAberta(proxima, agora)) return { tipo: 'sala', consulta: proxima.id };
  const ultima = ultimaRealizada(consultas, agora);
  if (ultima && !folhas.some(f => f.enviada_em && Date.parse(f.enviada_em) >= Date.parse(ultima.inicio))) return { tipo: 'indicacoes', consulta: ultima.id };
  return { tipo: 'marcar' };
}

export interface GrupoConsulta { consulta: ConsultaPaciente; avaliacoes: AvaliacaoLista[]; folhas: FolhaIndicacoesLista[]; notas: NotaPaciente[] }
/** Junta avaliação, folha e anotações de cada consulta; o que não pertence a nenhuma fica em "geral". */
export function agruparConsultas(consultas: ConsultaPaciente[], avaliacoes: AvaliacaoLista[], folhas: FolhaIndicacoesLista[], notas: NotaPaciente[]) {
  const ordem = [...consultas].sort((a, b) => Date.parse(b.inicio) - Date.parse(a.inicio));
  const grupos: GrupoConsulta[] = ordem.map(c => ({ consulta: c, avaliacoes: avaliacoes.filter(a => a.consulta_id === c.id), folhas: [], notas: notas.filter(n => n.consulta_id === c.id) }));
  const geral = { avaliacoes: avaliacoes.filter(a => !a.consulta_id || !consultas.some(c => c.id === a.consulta_id)), folhas: [] as FolhaIndicacoesLista[], notas: notas.filter(n => !n.consulta_id || !consultas.some(c => c.id === n.consulta_id)) };
  const realizadas = grupos.filter(g => g.consulta.status !== 'cancelada');
  for (const f of folhas) {
    const g = realizadas.find(g => Date.parse(g.consulta.inicio) <= Date.parse(f.criado_em));
    (g ? g.folhas : geral.folhas).push(f);
  }
  return { grupos, geral };
}

/** "4 revisões · Vata 46 → 38" (dosha mais alto no primeiro teste). */
export function resumoEvolucao(evolucao: EvolucaoPaciente[] | undefined) {
  const d = [...(evolucao ?? [])].sort((a, b) => Date.parse(a.data) - Date.parse(b.data));
  if (!d.length) return 'nenhum teste';
  const nome = d.length === 1 ? 'revisão' : 'revisões';
  const dosha = (['vata', 'pitta', 'kapha'] as const).reduce((m, k) => (d[0][k] ?? 0) > (d[0][m] ?? 0) ? k : m, 'vata' as const);
  const rotulo = dosha[0].toUpperCase() + dosha.slice(1);
  return d.length === 1 ? `1 ${nome} · ${rotulo} ${d[0][dosha] ?? 0}` : `${d.length} ${nome} · ${rotulo} ${d[0][dosha] ?? 0} → ${d[d.length - 1][dosha] ?? 0}`;
}

/** "hoje, 10h", "amanhã, 9h30" ou "12/09, 10h". */
export function quandoConsulta(inicio: string, agora: number) {
  const d = new Date(inicio); const h = new Date(agora);
  const dia = (x: Date) => x.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const amanha = new Date(agora + 864e5);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).replace(/^0/, '').replace(':00', 'h').replace(':', 'h');
  const quando = dia(d) === dia(h) ? 'hoje' : dia(d) === dia(amanha) ? 'amanhã' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  return `${quando}, ${hora}`;
}
