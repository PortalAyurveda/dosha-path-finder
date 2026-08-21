export type Funcao = "desenvolvimento" | "administrativo" | "design";
export type Status = "a_fazer" | "fazendo" | "feito";
export type Temperatura = "fresca" | "morna" | "quente" | "fervendo" | "concluida";

export type Anexo = {
  tipo: "link" | "caminho" | "imagem" | "arquivo";
  titulo: string;
  url?: string;
  path?: string;
};

export type Nota = {
  em?: string;
  por?: string;
  texto?: string;
  [k: string]: unknown;
};

export type Tarefa = {
  id: string;
  titulo: string;
  objetivo: string | null;
  funcoes: Funcao[] | null;
  status: Status;
  ordem: string | number | null;
  urgente: boolean;
  anexos: Anexo[] | null;
  notas: Nota[] | null;
  devlog_id: string | null;
  arquivada: boolean;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string | null;
  status_em: string | null;
  iniciada_em: string | null;
  concluida_em: string | null;
  temperatura: Temperatura;
  dias_parada: number | null;
  dias_na_coluna: number | null;
  dias_aberta: number | null;
  ultima_nota: string | null;
  ultima_nota_em: string | null;
  qtd_notas: number | null;
  qtd_anexos: number | null;
  devlog_modulo: string | null;
  devlog_titulo: string | null;
  criado_por_email: string | null;
  sugerir_arquivar: boolean | null;
};

export const FUNCOES: { key: Funcao; label: string; cor: string }[] = [
  { key: "desenvolvimento", label: "Desenvolvimento", cor: "#6B8AFF" },
  { key: "administrativo", label: "Administrativo", cor: "#352F54" },
  { key: "design", label: "Design", cor: "#E8806A" },
];

export const CORES_FUNCAO: Record<Funcao, string> = {
  desenvolvimento: "#6B8AFF",
  administrativo: "#352F54",
  design: "#E8806A",
};

export const COLUNAS: { key: Status; label: string }[] = [
  { key: "a_fazer", label: "A fazer" },
  { key: "fazendo", label: "Fazendo" },
  { key: "feito", label: "Feito" },
];

export const ESTILO_COLUNA: Record<Status, { bg: string; border: string; shadow: string }> = {
  a_fazer: { bg: "#FFFFFF", border: "#EDE8F5", shadow: "0 1px 2px rgba(53,47,84,0.05)" },
  fazendo: { bg: "#FFFDF7", border: "#F3E3C3", shadow: "0 4px 12px rgba(53,47,84,0.10)" },
  feito: { bg: "#F4F7F4", border: "#DCE8DC", shadow: "0 1px 2px rgba(53,47,84,0.04)" },
};

export const dataCurta = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

export const dataLonga = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
