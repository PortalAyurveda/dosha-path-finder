import type { Avaliacao, ConteudoFicha, Conhecimento, Biblioteca, DadosAvaliacao, Leitura } from "./terapiaAvaliacao";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Convite, PermissoesConvite } from "./terapiaConvite";
import type { FichaPaciente, FotosPaciente, NascimentoPaciente, RotinaPaciente, HorarioPaciente, FotoPaciente } from "./terapiaPaciente";
import { FOTO_EXPIRA_SEGUNDOS } from "./terapiaPaciente";
import type { Carta } from './terapiaAdicoes';
import type { DadosIndicacoes, FolhaIndicacoes, FolhaIndicacoesLista, FontesIndicacoes } from './terapiaIndicacoes';
import type { ItemAcervo,OpcoesAcervo } from './terapiaAcervo';
import type { EstadoQuadro,QuadroSalvo } from './terapiaQuadro';
export interface MunicipioNascimento { codigo_ibge:number; nome:string; uf:string; fuso:string }

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
  config: () => read<{acervo_opcoes:OpcoesAcervo}>(supabase.rpc('terapia_config_publica')),
  acervo: () => read<ItemAcervo[]>(supabase.rpc('terapia_acervo')),
  acervoSalvar: (item:ItemAcervo) => read<ItemAcervo>(supabase.rpc('terapia_acervo_salvar',{p:item as unknown as Json})),
  acervoApagar: (id:string) => read<string|null>(supabase.rpc('terapia_acervo_apagar',{p_id:id})),
  acervoItem: (slug:string,item:string) => read<ItemAcervo|null>(supabase.rpc('acervo_item',{p_terapeuta_slug:slug,p_item_slug:item})),
  quadros: (avaliacao:string) => read<QuadroSalvo[]>(supabase.rpc('terapia_quadros_da',{p_avaliacao:avaliacao})),
  quadroGuardar: (avaliacao:string,item:string,path:string,tracos:EstadoQuadro,id?:string) => read<string>(supabase.rpc('terapia_quadro_guardar',{p_avaliacao:avaliacao,p_item:item,p_imagem_path:path,p_tracos:tracos as unknown as Json,...(id?{p_id:id}:{})})),
  quadroMostrar: (id:string,mostrar:boolean) => read<void>(supabase.rpc('terapia_quadro_mostrar',{p_id:id,p_mostrar:mostrar})),
  quadroApagar: (id:string) => read<string|null>(supabase.rpc('terapia_quadro_apagar',{p_id:id})),
  arquivoAssinado: async (bucket:string,path:string) => { const {data,error}=await supabase.storage.from(bucket).createSignedUrl(path,3600);if(error)throw new Error(error.message);if(!data?.signedUrl)throw new Error('Não foi possível abrir o arquivo.');return data.signedUrl; },
  arquivoEnviar: async (bucket:string,path:string,arquivo:File|Blob) => {const {error}=await supabase.storage.from(bucket).upload(path,arquivo,{upsert:true});if(error)throw new Error(error.message);return path;},
  arquivoApagar: async (bucket:string,path:string) => {const {error}=await supabase.storage.from(bucket).remove([path]);if(error)throw new Error(error.message);},
  folhaNova: (paciente: string, avaliacao?: string, consulta?: string) => read<string>(supabase.rpc('terapia_folha_nova', { p_paciente: paciente, ...(avaliacao ? { p_avaliacao: avaliacao } : {}), ...(consulta ? { p_consulta: consulta } : {}) })),
  folha: (id: string) => read<FolhaIndicacoes>(supabase.rpc('terapia_folha', { p_id: id })),
  folhasDa: (paciente: string) => read<FolhaIndicacoesLista[]>(supabase.rpc('terapia_folhas_da', { p_paciente: paciente })),
  indicacoesFontes: (paciente: string) => read<FontesIndicacoes>(supabase.rpc('terapia_indicacoes_fontes', { p_paciente: paciente })),
  folhaSalvar: (id: string, dados: DadosIndicacoes, diagnostico: string, tratamento: string, retorno: string) => read<string>(supabase.rpc('terapia_folha_salvar', { p_id: id, p_dados: dados as unknown as Json, p_diagnostico: diagnostico, p_tratamento: tratamento, ...(retorno ? { p_retorno: retorno } : {}) })),
  folhaEnviar: (id: string) => read<string>(supabase.rpc('terapia_folha_enviar', { p_id: id })),
  tarotLista: () => read<Carta[]>(supabase.rpc('terapia_tarot')),
  tarotCarta: (numero:number) => read<Carta | null>(supabase.rpc('terapia_tarot',{p_numero:numero})),
  tarotFoto: async (path:string) => {
    const {data,error}=await supabase.storage.from('osho-tarot').createSignedUrl(path,3600);
    if(error)throw new Error(error.message);
    if(!data?.signedUrl)throw new Error('Não foi possível abrir a carta.');
    return data.signedUrl;
  },
  aniversario: (mes:number,dia:number) => read<Record<string,unknown>|null>(supabase.rpc('terapia_aniversario',{p_mes:mes,p_dia:dia})),
  municipios: (texto:string,uf?:string) => read<MunicipioNascimento[]>(supabase.rpc('municipios_busca',{p_q:texto,...(uf?{p_uf:uf}:{})})),
  nascimentoSalvar: (paciente:string,n:{data:string;hora?:string;hora_conhecida:boolean;municipio?:number;exterior?:string}) => read<NascimentoPaciente>(supabase.rpc('acomp_nascimento_salvar',{p_paciente:paciente,p_data:n.data,p_hora:n.hora,p_hora_conhecida:n.hora_conhecida,p_municipio:n.municipio,p_exterior:n.exterior})),
  avaliacaoNova: (paciente: string, consulta?: string) => read<string>(supabase.rpc('terapia_avaliacao_nova', { p_paciente: paciente, ...(consulta ? { p_consulta: consulta } : {}) })),
  avaliacao: (id: string) => read<Avaliacao>(supabase.rpc('terapia_avaliacao', { p_id: id })),
  fichaConteudo: () => read<ConteudoFicha>(supabase.rpc('terapia_ficha_conteudo')),
  conhecimentoBusca: (texto: string) => read<Conhecimento[]>(supabase.rpc('terapia_conhecimento_busca', { p_q: texto })),
  biblioteca: () => read<Biblioteca>(supabase.rpc('terapia_biblioteca')),
  bibliotecaSalvar: (dados: Biblioteca) => read<void>(supabase.rpc('terapia_biblioteca_salvar', { p_dados: dados as unknown as Json })),
  avaliacaoSalvar: (id: string, dados: DadosAvaliacao, leitura: Leitura, resumo: string) => read<string>(supabase.rpc('terapia_avaliacao_salvar', { p_id: id, p_dados: dados as unknown as Json, p_leitura: leitura as unknown as Json, p_resumo: resumo })),
  ficha: (paciente: string) => read<FichaPaciente>(supabase.rpc('acomp_ficha', { p_paciente: paciente })),
  fotosPaciente: (paciente: string) => read<FotosPaciente>(supabase.rpc('acomp_fotos', { p_paciente: paciente })),
  nascimentoPaciente: (paciente: string) => read<NascimentoPaciente | null>(supabase.rpc('acomp_nascimento', { p_paciente: paciente })),
  rotinaPaciente: (paciente: string) => read<RotinaPaciente>(supabase.rpc('acomp_rotina', { p_paciente: paciente })),
  horariosPaciente: (terapeuta: string) => read<HorarioPaciente[]>(supabase.rpc('acomp_horarios_livres', { p_terapeuta: terapeuta, p_dias: 14 })),
  marcarPaciente: (paciente: string, inicio: string) => read<{ consulta: string; inicio: string; fim: string }>(supabase.rpc('terapia_marcar_para', { p_paciente: paciente, p_inicio: inicio })),
  salvarNota: (paciente: string, texto: string) => read<string>(supabase.rpc('acomp_nota_salvar', { p_paciente: paciente, p_texto: texto })),
  editarNota: (nota: string, texto: string) => read<void>(supabase.rpc('acomp_nota_editar', { p_nota: nota, p_texto: texto })),
  apagarNota: (nota: string) => read<void>(supabase.rpc('acomp_nota_apagar', { p_nota: nota })),
  fotoAssinada: async (foto: FotoPaciente) => {
    const { data, error } = await supabase.storage.from(foto.bucket).createSignedUrl(foto.path, FOTO_EXPIRA_SEGUNDOS);
    if (error) throw new Error(error.message);
    if (!data?.signedUrl) throw new Error('Não foi possível abrir a foto.');
    return data.signedUrl;
  },
  convite: (slug: string) => read<Convite>(supabase.rpc("terapia_convite", { p_slug: slug })),
  aceitarConvite: (slug: string, perm: PermissoesConvite) =>
    read<{ ligacao: string; terapeuta: string; tem_teste: boolean }>(supabase.rpc("terapia_convite_aceitar", {
      p_slug: slug, p_teste: perm.teste, p_fotos: perm.fotos, p_rotina: perm.rotina, p_akasha: perm.akasha,
    })),
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
