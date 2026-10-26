import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface Regra {
  dia_semana: number;
  inicio: string;
  fim: string;
  duracao_min: number;
  intervalo_min: number;
}
export interface Bloqueio {
  id: string;
  dia: string;
  motivo: string | null;
}
export interface Consulta {
  id: string;
  paciente_id: string;
  nome: string;
  inicio: string;
  fim: string;
  primeira: boolean;
  hoje?: boolean;
  sala_abre_em?: string;
  tem_teste?: boolean;
  nascimento?: boolean;
}
export interface Semana {
  inicio: string;
  fim: string;
  regras: Regra[];
  bloqueios: Bloqueio[];
  consultas: Consulta[];
}
export interface Paciente {
  paciente_id: string;
  nome: string;
  perm_teste: boolean;
  perm_fotos: boolean;
  perm_rotina: boolean;
  perm_akasha: boolean;
  ultima: string | null;
  proxima: string | null;
  teste: {
    vata: number | null;
    pitta: number | null;
    kapha: number | null;
    dosha: string | null;
    atencao: number;
    pontos: string[];
  } | null;
}
export interface Perfil {
  frase_card: string | null;
  instagram: string | null;
  cidade: string | null;
  estado: string | null;
  resumo: string | null;
}
export interface Painel {
  terapeuta: {
    id: string;
    nome: string;
    primeiro_nome: string;
    imagem: string | null;
    link_convite: string;
    link_perfil: string;
  };
  perfil: Perfil;
  sistema: {
    no_sistema: boolean;
    termo_em_dia: boolean;
    termo_aceito_em: string | null;
    antecedencia_horas: number;
    pedir_nascimento: boolean;
  };
  termo: { titulo: string; texto: string; versao: string };
  textos: { saudacao: string; convite_mensagem: string };
  numeros: { pacientes: number; pelo_link: number; pela_agenda: number };
}
export interface Hoje {
  consultas: Consulta[];
  novidades: { texto: string; detalhe?: string }[];
  pendencias: { texto: string }[];
}
const read = async <T>(
  request: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T> => {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data as T;
};
export const terapia = {
  sou: () => read<boolean>(supabase.rpc("sou_terapeuta")),
  painel: () => read<Painel | null>(supabase.rpc("terapia_painel_eu")),
  hoje: () => read<Hoje>(supabase.rpc("terapia_hoje")),
  pacientes: () => read<Paciente[]>(supabase.rpc("acomp_meus_pacientes")),
  semana: (inicio?: string) =>
    read<Semana>(
      supabase.rpc("terapia_semana", inicio ? { p_inicio: inicio } : {}),
    ),
  agenda: () => read<Regra[]>(supabase.rpc("acomp_agenda_minha")),
  bloqueios: () => read<Bloqueio[]>(supabase.rpc("terapia_bloqueios")),
  aceitar: (versao: string) =>
    read<void>(supabase.rpc("terapia_termo_aceitar", { p_versao: versao })),
  sistema: (ligar: boolean) =>
    read<boolean>(supabase.rpc("terapia_no_sistema", { p_ligar: ligar })),
  ping: () => read<void>(supabase.rpc("terapia_ping")),
  salvarAgenda: (regras: Regra[]) =>
    read<void>(
      supabase.rpc("acomp_agenda_salvar", {
        p_regras: regras as unknown as Json,
      }),
    ),
  preferencias: (p: {
    antecedencia_horas: number;
    pedir_nascimento: boolean;
  }) => read<void>(supabase.rpc("terapia_preferencias_salvar", { p })),
  bloquear: (dia: string, motivo: string) =>
    read<void>(
      supabase.rpc("terapia_bloqueio_add", {
        p_dia: dia,
        p_motivo: motivo || undefined,
      }),
    ),
  desbloquear: (id: string) =>
    read<void>(supabase.rpc("terapia_bloqueio_tirar", { p_id: id })),
  perfil: (p: Perfil) =>
    read<void>(
      supabase.rpc("terapia_perfil_salvar", { p: p as unknown as Json }),
    ),
};
export const PING_MS = 120000;
export function saudacao(nome: string, hora: number) {
  return `${hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"}, ${nome}`;
}
export function regrasComDuracao(
  regras: Regra[],
  duracao: number,
  intervalo: number,
) {
  return regras.map((r) => ({
    ...r,
    duracao_min: duracao,
    intervalo_min: intervalo,
  }));
}
export function dataLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function mudarSemana(inicio: string, direcao: number) {
  const d = new Date(`${inicio}T12:00:00`);
  d.setDate(d.getDate() + direcao * 7);
  return dataLocal(d);
}
export const minutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};
export function limitesSemana(regras: Regra[]) {
  return {
    dias: [...new Set(regras.map((r) => r.dia_semana))].sort(
      (a, b) => (a || 7) - (b || 7),
    ),
    inicio: regras.length
      ? Math.floor(Math.min(...regras.map((r) => minutos(r.inicio))) / 60) * 60
      : 0,
    fim: regras.length
      ? Math.ceil(Math.max(...regras.map((r) => minutos(r.fim))) / 60) * 60
      : 0,
  };
}
export function salaAberta(c: Consulta, agora: number) {
  return !!c.sala_abre_em && agora >= new Date(c.sala_abre_em).getTime();
}
export const horaBR = (s: string) =>
  new Date(s).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
export const diaBR = (s: string | null) =>
  s
    ? new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString(
        "pt-BR",
        { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" },
      )
    : "—";
export const dataBR = (s: string) => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(s));
  const valor = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
};
