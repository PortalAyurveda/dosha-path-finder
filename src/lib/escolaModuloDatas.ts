const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Lê YYYY-MM-DD (ou prefixo) como data LOCAL, sem deslocamento de timezone. */
export const parseLocalDate = (iso: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(iso);
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Linha 1 — fim de semana do módulo.
 * Sábado = data_inicio, Domingo = data_inicio + 1.
 * Ex.: "11 e 12 de Julho de 2026" ou "31 de Janeiro e 01 de Fevereiro de 2027".
 */
export const formatModuloFimDeSemana = (dataInicio: string): string => {
  const sab = parseLocalDate(dataInicio);
  const dom = new Date(sab.getFullYear(), sab.getMonth(), sab.getDate() + 1);

  const dSab = pad2(sab.getDate());
  const dDom = pad2(dom.getDate());
  const mSab = MESES_PT[sab.getMonth()];
  const mDom = MESES_PT[dom.getMonth()];
  const ano = dom.getFullYear();

  if (sab.getMonth() === dom.getMonth()) {
    return `${dSab} e ${dDom} de ${mSab} de ${ano}`;
  }
  return `${dSab} de ${mSab} e ${dDom} de ${mDom} de ${ano}`;
};

/** Linha 2 — horários fixos por tipo. */
export const formatModuloHorarios = (tipo: string | null | undefined): string => {
  if (tipo === "presencial") {
    return "Sábado 9h–17h · Domingo 9h–16h";
  }
  return "Sábado 9h–17h · Domingo 9h–13h";
};
