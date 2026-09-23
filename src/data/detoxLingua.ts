// Dados da Noite 2 da Jornada da Primavera: marcas da língua e bússola dos doshas.
import type { DoshaNome } from "@/data/doshaLevels";

export type MarcaOpcao = { slug: string; texto: string; normal?: boolean };
export type MarcaGrupo = { titulo: string; opcoes: MarcaOpcao[] };

export const MARCA_GRUPOS: MarcaGrupo[] = [
  {
    titulo: "A ponta da língua",
    opcoes: [
      { slug: "ponta_limpa", texto: "Vermelha e limpa, sem nada em cima", normal: true },
      { slug: "ponta_sem_brilho", texto: "Vermelha, mas sem brilho" },
      { slug: "ponta_arroxeada", texto: "Arroxeada ou azulada" },
      { slug: "ponta_treme", texto: "Treme quando eu ponho para fora" },
    ],
  },
  {
    titulo: "O meio da língua",
    opcoes: [
      { slug: "meio_vermelho_brilhante", texto: "Vermelha e brilhante", normal: true },
      { slug: "meio_capa_branca", texto: "Com uma capa branca por cima" },
      { slug: "meio_capa_amarela", texto: "Com uma capa amarelada" },
      { slug: "meio_geografia", texto: "Com rachaduras, como um mapa" },
    ],
  },
  {
    titulo: "O fundo da língua",
    opcoes: [
      { slug: "fundo_capinha_leve", texto: "Uma capinha branca leve", normal: true },
      { slug: "fundo_capa_grossa", texto: "Uma capa branca grossa, que não sai fácil" },
      { slug: "fundo_vermelho_irritado", texto: "Vermelha e irritada" },
    ],
  },
  {
    titulo: "A língua inteira",
    opcoes: [
      { slug: "marca_dos_dentes", texto: "Marca dos dentes na borda" },
      { slug: "risco_central", texto: "Um risco no meio, de cima até a ponta" },
      { slug: "muita_saliva", texto: "Muita saliva por cima" },
    ],
  },
];

export const MARCA_LEITURA: Record<string, string> = {
  fundo_capa_grossa: "Capa branca grossa no fundo: o fundo da língua é o cólon descendente, que é justamente a casa do vata.",
  marca_dos_dentes: "Marca dos dentes: língua inchada com marca dos dentes é inchaço vazio, é tecido mal nutrido. Não é kapha, é falta.",
  risco_central: "Um risco no meio: o risco central é o enraizamento das emoções na coluna.",
  meio_capa_branca: "Capa branca no meio: o meio da língua é a digestão. Capa ali é o agni pedindo ajuda.",
  meio_geografia: "Rachaduras como um mapa: é o que o professor chama de geografia, e fala de ressecamento antigo.",
  ponta_arroxeada: "Ponta arroxeada: azul é falta de prana e de agni, ligada à confusão mental e à insônia.",
  ponta_treme: "A língua treme quando você põe para fora: é uma mente com muitos vrittis, uma mente vazia.",
  ponta_sem_brilho: "Vermelha sem brilho na ponta: é o vermelho opaco, sem preenchimento, de quem não está dormindo bem.",
  meio_capa_amarela: "Capa amarelada no meio: amarelo puxa para o calor, para o pitta na digestão.",
  fundo_vermelho_irritado: "Fundo vermelho e irritado: calor chegando na região que é do intestino grosso.",
  muita_saliva: "Muita saliva: água em excesso, que é o lado do kapha.",
  ponta_limpa: "Ponta vermelha e limpa: é o normal, é exatamente o que se quer ver ali.",
  meio_vermelho_brilhante: "Meio vermelho e brilhante: é o normal, é exatamente o que se quer ver ali.",
  fundo_capinha_leve: "Capinha branca leve no fundo: é o normal, é exatamente o que se quer ver ali.",
};

export const CASA_DOSHA: Record<DoshaNome, string> = {
  vata: "intestino grosso",
  pitta: "sangue",
  kapha: "estômago",
};

export const normalizar = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Cada tag do teste de dosha vai para a casa do dosha ("casa") ou para um lugar fora dela.
const LUGARES: Record<DoshaNome, Record<string, string>> = {
  vata: {
    "estufamento abdominal": "casa",
    estufamento: "casa",
    gases: "casa",
    constipacao: "casa",
    indigestao: "casa",
    "problemas osseos": "osso",
    ossos: "osso",
    ansiedade: "mente",
    "ansiedade extrema": "mente",
    "confusao mental": "mente",
    confusao: "mente",
    insonia: "mente",
    tremores: "mente",
    arritmia: "coração",
    "frio nas extremidades": "circulação",
    frio: "circulação",
    anemia: "circulação",
    "zumbido no ouvido": "ouvido",
    zumbido: "ouvido",
  },
  pitta: {
    inflamacoes: "casa",
    inflamacao: "casa",
    "infeccoes recorrentes": "casa",
    infeccao: "casa",
    "calor nas extremidades": "casa",
    calor: "casa",
    azia: "intestino delgado",
    refluxo: "intestino delgado",
    "dejetos mal formados": "intestino delgado",
    dejetos: "intestino delgado",
    "fome excessiva": "intestino delgado",
    fome: "intestino delgado",
    "rosacea/melasma": "pele",
    dermatite: "pele",
    pele: "pele",
    "problemas de visao": "olhos",
    visao: "olhos",
  },
  kapha: {
    "digestao lenta": "casa",
    indigestao: "casa",
    "salivacao excessiva": "casa",
    salivacao: "casa",
    "sensacao de peso": "casa",
    peso: "casa",
    muco: "casa",
    "tosse mucosa": "pulmão",
    tosse: "pulmão",
    asma: "pulmão",
    "respiracao pesada": "pulmão",
    respiracao: "pulmão",
  },
};

const ARTIGO: Record<string, string> = {
  osso: "no osso",
  mente: "na mente",
  coração: "no coração",
  circulação: "na circulação",
  ouvido: "no ouvido",
  "intestino delgado": "no intestino delgado",
  pele: "na pele",
  olhos: "nos olhos",
  músculo: "no músculo",
  tendões: "nos tendões",
  pulmão: "no pulmão",
  articulações: "nas articulações",
  garganta: "na garganta",
  líquor: "no líquor",
};

const NUMEROS = ["nenhum", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
export const emPalavras = (n: number): string => NUMEROS[n] ?? String(n);

const capitalizar = (t: string) => (t ? `${t[0].toUpperCase()}${t.slice(1)}` : t);

export type Etapa = "acúmulo" | "agravamento" | "transbordamento" | "circulação" | "alojamento" | "fixação";
export const ETAPAS: Etapa[] = ["acúmulo", "agravamento", "transbordamento", "circulação", "alojamento", "fixação"];

export type Bussola = {
  casa: string;
  naCasa: string[];
  fora: Array<{ tag: string; frase: string }>;
  soltos: string[];
  etapa: Etapa | null;
  explicacao: string;
};

export function montarBussola(dosha: DoshaNome, tagsBrutas: string | null | undefined): Bussola {
  const casa = CASA_DOSHA[dosha];
  const mapa = LUGARES[dosha];
  const tags = (tagsBrutas ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && normalizar(t) !== "nenhum");

  const naCasa: string[] = [];
  const fora: Array<{ tag: string; frase: string }> = [];
  const soltos: string[] = [];

  for (const tag of tags) {
    const lugar = mapa[normalizar(tag)];
    if (lugar === "casa") naCasa.push(capitalizar(tag));
    else if (lugar) fora.push({ tag: capitalizar(tag), frase: `${capitalizar(tag)}, ${ARTIGO[lugar] ?? lugar}.` });
    else soltos.push(capitalizar(tag));
  }

  let etapa: Etapa | null = null;
  let explicacao = "";
  if (naCasa.length && fora.length) {
    etapa = "alojamento";
    explicacao = `Você tem sinais dentro da casa e também fora dela. O dosha saiu do ${casa} e já encontrou lugar em outros tecidos.`;
  } else if (naCasa.length) {
    etapa = "acúmulo";
    explicacao = "Os seus sinais estão todos dentro da casa. O seu dosha ainda está em casa. Isso é raro e é bom.";
  } else if (fora.length) {
    etapa = "transbordamento";
    explicacao = `Os seus sinais estão todos fora da casa. O dosha transbordou do ${casa} e está circulando.`;
  }

  return { casa, naCasa, fora, soltos, etapa, explicacao };
}
