import type { Leitura } from './terapiaAvaliacao';
export const INDICACOES_AUTOSAVE_MS = 2000;
export interface SecaoIndicacoes { chave: string; titulo: string }
export interface FonteIndicacao { queixa?:string; assunto?:string; id?: string | number; tipo?: string; titulo?: string; nome?: string; resumo?: string; texto?: string; livro?: string; referencia?: string; link?: string; slug?: string; imagem?: string; porque?: string; combina?: boolean; serve?:boolean; slot?: string; favorito?: boolean; vata?: number; pitta?: number; kapha?: number }
export interface ItemIndicacao extends FonteIndicacao { id: string; titulo: string; nota: string }
export interface DadosIndicacoes { secoes: Record<string, ItemIndicacao[]>; [chave: string]: unknown }
export interface FolhaIndicacoes { avaliacao_id?:string|null; id: string; paciente_user_id: string; paciente_nome: string; criado_em: string; atualizado_em: string; enviada_em: string | null; vista_em: string | null; dados: Partial<DadosIndicacoes>; diagnostico: string | null; tratamento: string | null; retorno: string | null; secoes: SecaoIndicacoes[]; avaliacao: { id?:string; leitura: Leitura; resumo: string; criado_em: string } | null }
export interface FolhaIndicacoesLista { id: string; criado_em: string; enviada_em: string | null; vista_em: string | null }
export interface FontesIndicacoes { minhas?:FonteIndicacao[]; favoritos?:FonteIndicacao[]; para_ela: FonteIndicacao[]; rotina_dela: FonteIndicacao[] | null; rotina: Record<string, FonteIndicacao[]>; samkhya: FonteIndicacao[]; aulas: FonteIndicacao[]; versos: FonteIndicacao[] }
export interface RascunhoIndicacoes { dados: DadosIndicacoes; diagnostico: string; tratamento: string; retorno: string }
export const iniciarIndicacoes = (d: Partial<DadosIndicacoes> | null): DadosIndicacoes => ({ ...d, secoes: d?.secoes ?? {} });
export function criarIndicacao(fonte: FonteIndicacao, id: string = crypto.randomUUID()): ItemIndicacao {
  return { ...fonte, id, titulo: fonte.titulo ?? fonte.nome ?? [fonte.livro, fonte.referencia].filter(Boolean).join(' · '), nota: '' };
}
export function inserirIndicacao(dados: DadosIndicacoes, secao: string, item: ItemIndicacao): DadosIndicacoes {
  return { ...dados, secoes: { ...dados.secoes, [secao]: [...(dados.secoes[secao] ?? []), item] } };
}
export function moverIndicacao(dados: DadosIndicacoes, itemId: string, destino: string, indice?: number): DadosIndicacoes {
  const item = Object.values(dados.secoes).flat().find(i => i.id === itemId);
  if (!item) return dados;
  const secoes = Object.fromEntries(Object.entries(dados.secoes).map(([s, itens]) => [s, itens.filter(i => i.id !== itemId)]));
  const lista = [...(secoes[destino] ?? [])];
  lista.splice(indice == null ? lista.length : Math.max(0, Math.min(indice, lista.length)), 0, item);
  return { ...dados, secoes: { ...secoes, [destino]: lista } };
}
export function diagnosticoDaAvaliacao(a: FolhaIndicacoes['avaliacao']) {
  if (!a) return '';
  return [a.resumo, a.leitura ? `Vata ${a.leitura.V ?? 0} · Pitta ${a.leitura.P ?? 0} · Kapha ${a.leitura.K ?? 0}` : ''].filter(Boolean).join('\n');
}
export function linkIndicacao(i: FonteIndicacao) { return i.link ?? (i.slug ? `/receita/${i.slug}` : ''); }
export function linkCurto(link: string) { try { const u = new URL(link, 'https://portalayurveda.com'); return `${u.host}${u.pathname}`; } catch { return link; } }
export const HORARIOS_INDICACOES: Record<string,string> = { cafe_manha:'Café da manhã', lanche_manha:'Lanche da manhã', almoco:'Almoço', lanche_tarde:'Lanche da tarde', jantar:'Jantar', ceia:'Ceia', acordar:'Ao acordar', dormir:'Antes de dormir', rotina_manha:'Ritual da manhã', bonus_diario:'Bônus do dia', tonico_noite:'Tônico da noite' };
export function minhasComFavoritos(minhas: FonteIndicacao[] = [], favoritos: FonteIndicacao[] = []) { return [...minhas, ...favoritos.map(f => ({ ...f, favorito: true }))]; }
