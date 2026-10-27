import { supabase } from "@/integrations/supabase/client";
import type { HorarioPaciente } from "./terapiaPaciente";
import type { DadosIndicacoes, SecaoIndicacoes } from "./terapiaIndicacoes";
import type { PedidoFoto } from './terapiaFotoPedidos';

export interface MeuTerapeutaLigacao {
  ligacao: string;
  desde: string;
  origem?: string | null;
  permissoes: { teste: boolean; fotos: boolean; rotina: boolean; akasha: boolean };
  terapeuta: { id: string; nome: string; primeiro_nome: string; imagem: string | null; slug: string; instagram?: string | null; especialidade?: string | null };
  pedir_nascimento: boolean;
  tem_nascimento: boolean;
  fotos_guiadas: number;
  fotos_total_guiadas: number;
  proxima: { id: string; inicio: string; fim: string; motivo: string | null; sala_abre_em: string; pode_cancelar: boolean } | null;
  historico: { id: string; inicio: string; status: string }[];
  folhas: { id: string; enviada_em: string; vista_em: string | null; diagnostico: string | null }[];
  regras: { texto?: string; sala?: string; cancelar_gratis_horas?: number; [k: string]: unknown } | null;
}
export interface GuiadaMinha { chave: string; titulo: string; instrucao?: string; texto?: string; modelo?: string }
export interface FotoMinha { id: string; tipo: string; titulo: string | null; path: string; criado_em: string }
export interface FotosMinhas { guiadas: GuiadaMinha[] | null; fotos: FotoMinha[]; pedidos?:PedidoFoto[] }
export interface MinhaFolha {
  id: string; enviada_em: string; vista_em: string | null;
  dados: Partial<DadosIndicacoes> | null; diagnostico: string | null; tratamento: string | null; retorno: string | null;
  secoes: SecaoIndicacoes[] | null;
  terapeuta: { nome: string; primeiro_nome: string; imagem: string | null; slug: string };
  feitos: { item: string; dia: string }[];
}
export const BUCKET_FOTOS_PACIENTE = "pacientes-fotos";

const read = async <T>(request: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> => {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data as T;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (nome: string, args?: Record<string, unknown>) => (supabase.rpc as any)(nome, args);

export const meu = {
  terapeuta: () => read<MeuTerapeutaLigacao[]>(rpc("meu_terapeuta")),
  horarios: (terapeuta: string) => read<HorarioPaciente[]>(rpc("acomp_horarios_livres", { p_terapeuta: terapeuta, p_dias: 14 })),
  remarcar: (consulta: string, inicio: string) => read<unknown>(rpc("consulta_remarcar", { p_consulta: consulta, p_inicio: inicio })),
  cancelar: (consulta: string) => read<void>(rpc("acomp_cancelar", { p_consulta: consulta })),
  motivo: (consulta: string, texto: string) => read<void>(rpc("consulta_motivo_salvar", { p_consulta: consulta, p_texto: texto })),
  fotos: () => read<FotosMinhas>(rpc("fotos_minhas")),
  fotoRegistrar: (tipo: string, path: string, titulo?: string, pedido?:string) => read<string>(rpc("foto_registrar", { p_tipo: tipo, p_path: path, ...(titulo ? { p_titulo: titulo } : {}), ...(pedido?{p_pedido:pedido}:{}) })),
  fotoApagar: (id: string) => read<string | null>(rpc("foto_apagar", { p_id: id })),
  fotoEnviar: async (userId: string, arquivo: File) => {
    const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET_FOTOS_PACIENTE).upload(path, arquivo, { upsert: false, contentType: arquivo.type || undefined });
    if (error) throw new Error(error.message);
    return path;
  },
  fotoTirarDoStorage: async (path: string) => { const { error } = await supabase.storage.from(BUCKET_FOTOS_PACIENTE).remove([path]); if (error) throw new Error(error.message); },
  fotoUrl: async (path: string) => { const { data, error } = await supabase.storage.from(BUCKET_FOTOS_PACIENTE).createSignedUrl(path, 3600); if (error) throw new Error(error.message); return data.signedUrl; },
  nascimento: (n: { data: string; hora?: string; hora_conhecida: boolean; municipio?: number; exterior?: string }) =>
    read<unknown>(rpc("nascimento_salvar", { p_data: n.data, ...(n.hora ? { p_hora: n.hora } : {}), p_hora_conhecida: n.hora_conhecida, ...(n.municipio ? { p_municipio: n.municipio } : {}), ...(n.exterior ? { p_exterior: n.exterior } : {}) })),
  indicacoes: () => read<MinhaFolha[]>(rpc("minhas_indicacoes")),
  folha: (id: string) => read<MinhaFolha>(rpc("minha_folha", { p_id: id })),
  vista: (folha: string) => read<void>(rpc("indicacao_vista", { p_folha: folha })),
  marcar: (folha: string, item: string, feito: boolean) => read<void>(rpc("indicacao_marcar", { p_folha: folha, p_item: item, p_feito: feito })),
  permissoes: (ligacao: string, p: MeuTerapeutaLigacao["permissoes"]) => read<void>(rpc("acomp_permissoes", { p_ligacao: ligacao, p_teste: p.teste, p_fotos: p.fotos, p_rotina: p.rotina, p_akasha: p.akasha })),
  desligar: (ligacao: string) => read<void>(rpc("acomp_desligar", { p_ligacao: ligacao })),
};

/** Dia (AAAA-MM-DD) em São Paulo. */
export function diaSP(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const v = (t: string) => p.find(x => x.type === t)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}`;
}
/** Os 7 dias até hoje (mais antigo primeiro), marcando os feitos de um item. */
export function semanaDoItem(feitos: { item: string; dia: string }[], item: string, agora: Date) {
  const dias = new Set(feitos.filter(f => f.item === item).map(f => f.dia.slice(0, 10)));
  return Array.from({ length: 7 }, (_, i) => { const d = diaSP(new Date(agora.getTime() - (6 - i) * 86400000)); return { dia: d, feito: dias.has(d) }; });
}
export const feitoHoje = (feitos: { item: string; dia: string }[], item: string, agora: Date) => feitos.some(f => f.item === item && f.dia.slice(0, 10) === diaSP(agora));
export const salaLiberada = (p: { sala_abre_em: string } | null, agora: number) => !!p && agora >= Date.parse(p.sala_abre_em);
export function alternarFeito(feitos: { item: string; dia: string }[], item: string, feito: boolean, agora: Date) {
  const hoje = diaSP(agora);
  const sem = feitos.filter(f => !(f.item === item && f.dia.slice(0, 10) === hoje));
  return feito ? [...sem, { item, dia: hoje }] : sem;
}
export const dataExtenso = (s: string) => new Date(s).toLocaleString("pt-BR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
/** Seções da folha que combinam com a hora do dia (manhã, meio do dia, tarde, noite). */
export function secoesDaHora(hora: number): string[] {
  if (hora < 12) return ["acordar", "rotina_manha", "cafe_manha", "lanche_manha"];
  if (hora < 15) return ["almoco"];
  if (hora < 18) return ["lanche_tarde"];
  return ["jantar", "ceia", "dormir", "tonico_noite"];
}
/** Título da seção fechada em Meu acompanhamento: progresso do dia, com ✓ quando tudo feito. */
export function progressoSecao(titulo: string, feitos: number, total: number) {
  return `${titulo} · ${feitos} de ${total} feitos${total > 0 && feitos >= total ? " ✓" : ""}`;
}
