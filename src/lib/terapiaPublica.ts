export interface NumerosTerapeuta { nota: number | null; avaliacoes: number; comentarios?: number; atendimentos: number }
export interface PontoAtencao { slug: string; nome: string; especialidades: string[] }
export interface PreviaConvite { slug: string; titulo: string; descricao: string; imagem_previa: string }
export interface ConfigPublica { quadro_pranchas?: import('./terapiaQuadro').PranchaQuadro[]; chat_textos?: import("./terapiaChat").ChatTextos; especialidades?: string[]; diretorio_ordem?: string; fotos_guiadas?: { chave: string; titulo: string; instrucao?: string; modelo?: string }[]; consulta_agora?: { prazo_min: number; som_repetir_seg: number } }
export interface AvaliacaoPublica { nota: number; comentario: string; primeiro_nome: string; quando: string }
export interface ConsultaMarcada { consulta: string; inicio: string; fim: string }
export const AGORA_ESPERA_MS = 15000;
export const RESERVA_MINUTOS = 15;
export function horarioNestaSemana(inicio: string | null, agora = new Date()) {
  if (!inicio) return false;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(agora);
  const p = (tipo: string) => parts.find(x => x.type === tipo)?.value ?? '';
  const hoje = new Date(`${p('year')}-${p('month')}-${p('day')}T00:00:00-03:00`);
  const fim = hoje.getTime() + (7 - ((hoje.getUTCDay() + 6) % 7)) * 86400000;
  return Date.parse(inicio) >= agora.getTime() && Date.parse(inicio) < fim;
}
export function ordenarDiretorio<T extends { id: string; teste?: boolean }>(lista: T[], sistema: { id: string; proximo: string | null; teste?: boolean }[], ordem: string) {
  const rank = new Map(sistema.map((s, i) => [String(s.id), i]));
  const porId = new Map(sistema.map(s => [String(s.id), s]));
  return [...lista].sort((a, b) => {
    const sa = porId.get(String(a.id)), sb = porId.get(String(b.id));
    if (!!sa?.teste !== !!sb?.teste) return sa?.teste ? -1 : 1;
    if (ordem === 'recentes') return 0;
    if (ordem === 'proximo') return (Date.parse(sa?.proximo ?? '') || Infinity) - (Date.parse(sb?.proximo ?? '') || Infinity);
    return (rank.get(String(a.id)) ?? Infinity) - (rank.get(String(b.id)) ?? Infinity);
  });
}
export function tempoPedido(expira: string | null, agora: number) {
  const segundos = Math.max(0, Math.ceil(((expira ? Date.parse(expira) : agora) - agora) / 1000));
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
}
const escaparICS = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
export function consultaICS(c: ConsultaMarcada, nome: string) {
  const data = (s: string) => new Date(s).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Portal Ayurveda//Consulta//PT-BR','BEGIN:VEVENT',`UID:${c.consulta}@portalayurveda.com`,`DTSTAMP:${data(new Date().toISOString())}`,`DTSTART:${data(c.inicio)}`,`DTEND:${data(c.fim)}`,`SUMMARY:${escaparICS(`Consulta com ${nome}`)}`,`URL:https://portalayurveda.com/consulta/${encodeURIComponent(c.consulta)}`,'LOCATION:Sala online do Portal Ayurveda','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}