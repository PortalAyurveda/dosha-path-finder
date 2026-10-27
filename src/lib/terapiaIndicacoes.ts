import type { Leitura } from './terapiaAvaliacao';
export const INDICACOES_AUTOSAVE_MS = 2000;
export interface SecaoIndicacoes { chave: string; titulo: string }
export interface FonteIndicacao { ref?: string; sanscrito?: string; queixa?:string; assunto?:string; id?: string | number; tipo?: string; titulo?: string; nome?: string; resumo?: string; texto?: string; livro?: string; referencia?: string; link?: string; slug?: string; imagem?: string; porque?: string; combina?: boolean; serve?:boolean; slot?: string; favorito?: boolean; origem?:string; vata?: number; pitta?: number; kapha?: number }
export interface ItemIndicacao extends FonteIndicacao { id: string; titulo: string; nota: string }
export interface DadosIndicacoes { secoes: Record<string, ItemIndicacao[]>; [chave: string]: unknown }
export interface FolhaIndicacoes { avaliacao_id?:string|null; id: string; paciente_user_id: string; paciente_nome: string; criado_em: string; atualizado_em: string; enviada_em: string | null; vista_em: string | null; dados: Partial<DadosIndicacoes>; diagnostico: string | null; tratamento: string | null; retorno: string | null; secoes: SecaoIndicacoes[]; avaliacao: { id?:string; leitura: Leitura; resumo: string; criado_em: string } | null }
export interface FolhaIndicacoesLista { id: string; criado_em: string; enviada_em: string | null; vista_em: string | null }
export interface FontesIndicacoes { dosha?:string|null; queixas?:string[]; minhas?:FonteIndicacao[]; favoritos?:FonteIndicacao[]; para_ela: FonteIndicacao[]; rotina_dela: FonteIndicacao[] | null; rotina: Record<string, FonteIndicacao[]>; samkhya: FonteIndicacao[]; aulas: FonteIndicacao[]; versos: FonteIndicacao[] }
export interface RascunhoIndicacoes { dados: DadosIndicacoes; diagnostico: string; tratamento: string; retorno: string }
/** Os 5 momentos da folha, na ordem em que aparecem. */
export const MOMENTOS: SecaoIndicacoes[] = [{chave:'manha',titulo:'Manhã'},{chave:'refeicoes',titulo:'Refeições'},{chave:'noite',titulo:'Noite'},{chave:'todo_dia',titulo:'Todo dia'},{chave:'ler',titulo:'Para ler e assistir'}];
const CHAVES_MOMENTO = new Set(MOMENTOS.map(m => m.chave));
/** Chaves antigas da folha e o momento novo de cada uma; desconhecidas vão para "Todo dia". */
export function momentoDaChave(chave: string): string {
  if (CHAVES_MOMENTO.has(chave)) return chave;
  const k = chave.toLowerCase();
  if (k.startsWith('cafe')) return 'manha';
  if (k.startsWith('almoco') || k.startsWith('lanche') || k.startsWith('jantar')) return 'refeicoes';
  if (k.startsWith('literatura')) return 'ler';
  return 'todo_dia';
}
/** Abre os dados da folha já com as chaves dos 5 momentos (adaptador de segurança para folhas antigas). */
export const iniciarIndicacoes = (d: Partial<DadosIndicacoes> | null): DadosIndicacoes => {
  const secoes: Record<string, ItemIndicacao[]> = {};
  for (const [chave, itens] of Object.entries(d?.secoes ?? {})) { const m = momentoDaChave(chave); secoes[m] = [...(secoes[m] ?? []), ...(Array.isArray(itens) ? itens : [])]; }
  return { ...d, secoes };
};
/** Momentos na ordem fixa, com os títulos que o banco mandar quando houver. */
export function momentosDaFolha(secoes?: SecaoIndicacoes[] | null): SecaoIndicacoes[] {
  return MOMENTOS.map(m => secoes?.find(s => s.chave === m.chave) ?? m);
}
/** "em 3 semanas", "em 5 dias", "hoje" ou "" para data passada/vazia. */
export function distanciaRetorno(retorno: string, hoje: Date = new Date()): string {
  if (!retorno) return '';
  const alvo = new Date(`${retorno}T12:00:00`); const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);
  const dias = Math.round((alvo.getTime() - base.getTime()) / 86400000);
  if (Number.isNaN(dias) || dias < 0) return '';
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  if (dias < 14) return `em ${dias} dias`;
  if (dias < 60) { const s = Math.round(dias / 7); return `em ${s} semanas`; }
  const m = Math.round(dias / 30); return `em ${m} meses`;
}
/** Texto do link para a pessoa conforme o tipo do item. */
export function verTexto(tipo?: string): string {
  const t = (tipo ?? '').toLowerCase();
  if (t === 'receita') return 'ver receita';
  if (['aula', 'video', 'vídeo', 'live'].includes(t)) return 'ver aula';
  if (t === 'produto') return 'ver produto';
  return 'ver';
}
/** Linha cinza das caixas da busca: tipo · para quê. */
export function linhaFonte(f: FonteIndicacao): string {
  const tipos: Record<string, string> = { receita: 'Receita', produto: 'Produto Samkhya', aula: 'Aula', video: 'Aula', live: 'Aula', verso: 'Texto clássico', artigo: 'Artigo', pratica: 'Prática', 'prática': 'Prática' };
  const t = tipos[(f.tipo ?? '').toLowerCase()] ?? (f.tipo ? f.tipo[0].toUpperCase() + f.tipo.slice(1) : 'Texto');
  const para = f.queixa ?? f.assunto ?? '';
  return [t, para].filter(Boolean).join(' · ');
}
export function criarIndicacao(fonte: FonteIndicacao, id: string = crypto.randomUUID()): ItemIndicacao {
  return { ...fonte, id, titulo: fonte.titulo ?? fonte.nome ?? [fonte.livro, fonte.referencia].filter(Boolean).join(' · '), nota: '' };
}
export function inserirIndicacao(dados: DadosIndicacoes, secao: string, item: ItemIndicacao): DadosIndicacoes {
  const key = item.slug || item.link || (item.tipo!=="texto" ? `${item.tipo}:${item.titulo}` : "");
  if (key && Object.values(dados.secoes).flat().some(i => (i.slug || i.link || (i.tipo!=="texto" ? `${i.tipo}:${i.titulo}` : "")) === key)) return dados;
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

/** A função atual identifica a queixa no texto de origem, sem inventar agrupamentos. */
export function queixaIndicacao(f:FonteIndicacao){return f.queixa??f.assunto??f.porque?.match(/relatou\s+["“]([^"”]+)["”]/i)?.[1]??'';}

/** Título da seção fechada na folha da terapeuta: contagem e primeiros nomes, ou "vazio". */
export function tituloSecaoFechada(titulo:string,itens:ItemIndicacao[]) {
 if(!itens.length) return `${titulo} · vazio`;
 return `${titulo} · ${itens.length} ${itens.length===1?'item':'itens'} · ${itens.map(i=>i.titulo).join(', ')}`;
}
/** Situação da folha para a linha de contexto: rascunho ou data de envio. */
export function situacaoIndicacoes(folha:Pick<FolhaIndicacoes,'enviada_em'>) {
 return folha.enviada_em?`Indicações enviadas em ${new Date(folha.enviada_em).toLocaleDateString('pt-BR')}`:'Indicações em rascunho';
}
export function origemIndicacao(item:FonteIndicacao) {
 if(item.tipo==='texto') return '';
 if(item.origem==='acervo' || /acervo|material|minha/.test(item.tipo??'')) return 'Do seu acervo';
 if(item.tipo==='produto') return 'Produto Samkhya';
 if(item.tipo==='receita') return 'Receita do Portal';
 if(['aula','video','live'].includes(item.tipo??'')) return 'Aula do Portal';
 return item.tipo==='artigo'?'Artigo do Portal':item.tipo==='verso'?'Texto clássico do Portal':'';
}
