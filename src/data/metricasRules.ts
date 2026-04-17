// 49 rules engine for the Métricas tab in /meu-dosha
// Each rule has an `applies(ctx)` predicate and a copy template (titulo/subtitulo/descricao).
// Percentual and n_base are filled in at render time from `metricas_snapshot`.

export type CategoriaMetrica =
  | "Diagnostico"
  | "Critico"
  | "Alerta"
  | "Atencao"
  | "Paradoxo"
  | "Estrutural";

export interface UserMetricasContext {
  v: number; // vatascore
  p: number; // pittascore
  k: number; // kaphascore
  agni: string; // lower-cased agniPrincipal
  imc: number;
  age: number;
  sv: number; // nº sintomas Vata
  sp: number; // nº sintomas Pitta
  sk: number; // nº sintomas Kapha
  av: number; // nº alimentos Vata
  ap: number; // nº alimentos Pitta
  ak: number; // nº alimentos Kapha
}

export interface RuleCopy {
  titulo: string;
  subtitulo: string; // may include placeholders {pct}
  descricao: string; // may include placeholders {pct} and {n}
}

export interface RuleDefinition {
  id: string;
  categoria: CategoriaMetrica;
  applies: (ctx: UserMetricasContext) => boolean;
  copy: RuleCopy;
}

const countTags = (str: string | null | undefined): number => {
  if (!str) return 0;
  return str.split(",").map((s) => s.trim()).filter(Boolean).length;
};

export function buildContext(user: {
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  imc: number | string | null;
  idade: number | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  alimVata: string | null;
  alimPitta: string | null;
  alimKapha: string | null;
}): UserMetricasContext {
  const imcNum =
    typeof user.imc === "number"
      ? user.imc
      : parseFloat(String(user.imc || "0").replace(",", ".")) || 0;

  return {
    v: user.vatascore || 0,
    p: user.pittascore || 0,
    k: user.kaphascore || 0,
    agni: (user.agniPrincipal || "").toLowerCase(),
    imc: imcNum,
    age: user.idade || 0,
    sv: countTags(user.agravVataTags),
    sp: countTags(user.agravPittaTags),
    sk: countTags(user.agravKaphaTags),
    av: countTags(user.alimVata),
    ap: countTags(user.alimPitta),
    ak: countTags(user.alimKapha),
  };
}

export const RULES: RuleDefinition[] = [
  // Diagnostico
  {
    id: "R01",
    categoria: "Diagnostico",
    applies: (c) => c.v >= 50 && c.k <= 14 && c.agni.includes("irregular"),
    copy: {
      titulo: "A tríade do esgotamento seco",
      subtitulo: "Diagnóstico · 100%",
      descricao:
        "Vata fixado, Kapha em déficit e digestão irregular — esse é o padrão mais grave que encontramos na base. 100% das pessoas nessa combinação têm digestão irregular. O corpo secou, perdeu estrutura, e a digestão colapsou junto.",
    },
  },
  {
    id: "R02",
    categoria: "Diagnostico",
    applies: (c) => c.p >= 50 && !c.agni.includes("forte"),
    copy: {
      titulo: "Pitta alto sem fogo digestivo próprio",
      subtitulo: "Diagnóstico · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado mas sem digestão forte também têm digestão irregular. A inflamação não vem do fogo próprio — vem do vento que esquenta por baixo.",
    },
  },
  {
    id: "R03",
    categoria: "Diagnostico",
    applies: (c) => c.agni.includes("irregular") && c.agni.includes("nivel 3") && c.v >= 36,
    copy: {
      titulo: "Digestão caótica confirma Vata em colapso",
      subtitulo: "Diagnóstico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão inconstante no nível mais grave também têm Vata adoecido. Vata é o dosha do movimento e da irregularidade — quando ele colapsa, a digestão vai junto.",
    },
  },
  {
    id: "R04",
    categoria: "Diagnostico",
    applies: (c) => c.agni.includes("forte") && c.agni.includes("nivel 3") && c.p >= 41,
    copy: {
      titulo: "Fogo digestivo intenso confirma Pitta em colapso",
      subtitulo: "Diagnóstico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão muito intensa também têm Pitta adoecido. Queimar tudo rápido demais é o fogo fora de controle.",
    },
  },
  {
    id: "R05",
    categoria: "Diagnostico",
    applies: (c) => c.agni === "digestão constante - boa",
    copy: {
      titulo: "Sua digestão está boa — e os dados confirmam",
      subtitulo: "Diagnóstico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão constante e boa têm scores baixos nos três doshas. A digestão saudável é o principal indicador de equilíbrio no Ayurveda — e você está nesse grupo.",
    },
  },

  // Critico
  {
    id: "R06",
    categoria: "Critico",
    applies: (c) => c.p >= 50 && !c.agni.includes("forte") && c.v >= 36,
    copy: {
      titulo: "A inflamação tem raiz em Vata, não em Pitta",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado mas sem fogo digestivo forte também têm Vata adoecido. A causa do desequilíbrio não é o fogo em si — é o vento que esquentou sem direção.",
    },
  },
  {
    id: "R07",
    categoria: "Critico",
    applies: (c) => c.p >= 50 && c.v >= 25,
    copy: {
      titulo: "Pitta em colapso quase sempre carrega Vata por baixo",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado também têm Vata em Acúmulo ou pior. É o padrão do burnout: fogo alto sem movimento equilibrado gera colapso sistêmico.",
    },
  },
  {
    id: "R08",
    categoria: "Critico",
    applies: (c) => c.v >= 50 && c.p >= 41 && c.agni.includes("irregular"),
    copy: {
      titulo: "Três doshas, um colapso",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata fixado e Pitta adoecido também têm digestão irregular. É o desequilíbrio mais complexo — mas também o mais reconhecível.",
    },
  },
  {
    id: "R09",
    categoria: "Critico",
    applies: (c) => c.v + c.p + c.k > 100 && c.agni.includes("irregular"),
    copy: {
      titulo: "Sobrecarga sistêmica com digestão irregular",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com score total acima de 100 também têm digestão irregular. Quando tudo está alto, o Agni Irregular é o denominador comum — sinal de que o sistema inteiro está sobrecarregado.",
    },
  },
  {
    id: "R10",
    categoria: "Critico",
    applies: (c) => c.p >= 50 && c.v >= 36 && c.agni.includes("irregular"),
    copy: {
      titulo: "Fogo, vento e caos digestivo simultâneos",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado e Vata adoecido também têm digestão irregular. Cada desequilíbrio alimenta o outro.",
    },
  },
  {
    id: "R11",
    categoria: "Critico",
    applies: (c) => c.p >= 50 && c.sv >= 5,
    copy: {
      titulo: "O fogo virou ansiedade",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado também relatam 5 ou mais sintomas de Vata — ansiedade, insônia, dispersão. Quando o fogo fica sem direção, ele converte em vento. O padrão clássico do burnout.",
    },
  },
  {
    id: "R12",
    categoria: "Critico",
    applies: (c) => c.k >= 36 && c.sv >= 5,
    copy: {
      titulo: "Corpo pesado, mente dispersa",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Kapha em Acúmulo também relatam 5 ou mais sintomas de Vata. Corpo estagnado e mente agitada ao mesmo tempo — dois opostos que se encontram com mais frequência do que se imagina.",
    },
  },
  {
    id: "R13",
    categoria: "Critico",
    applies: (c) => c.agni.includes("irregular") && c.v > c.p && c.v > c.k,
    copy: {
      titulo: "Digestão irregular significa Vata no comando",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão irregular têm Vata como o dosha mais alto. O Agni Irregular é a assinatura digestiva do Vata — quando a digestão oscila, o vento está no comando.",
    },
  },
  {
    id: "R14",
    categoria: "Critico",
    applies: (c) => c.v >= 50 && c.v > c.p + c.k,
    copy: {
      titulo: "Vata consome tudo",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata fixado têm ele maior que Pitta e Kapha somados. O vento não está apenas alto — ele domina o sistema inteiro, secando e dispersando cada aspecto da fisiologia.",
    },
  },
  {
    id: "R15",
    categoria: "Critico",
    applies: (c) => c.agni.includes("irregular") && c.ap <= 2,
    copy: {
      titulo: "Digestão caótica sem o fogo que a ancoraria",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão irregular consomem poucos alimentos de Pitta. Especiarias, fermentados, o que aquece e dá ritmo à digestão — justamente o que está faltando.",
    },
  },
  {
    id: "R16",
    categoria: "Critico",
    applies: (c) => c.sv >= 6 && c.ap <= 2,
    copy: {
      titulo: "Seus sintomas pedem fogo — e ele está ausente",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com 6 ou mais sintomas de Vata também consomem poucos alimentos de Pitta. O calor digestivo é o que ancora o movimento excessivo. Sem ele, o ciclo se mantém.",
    },
  },
  {
    id: "R17",
    categoria: "Critico",
    applies: (c) => c.v >= 50 && c.ap <= 2,
    copy: {
      titulo: "Vata fixado sem o contrapeso do fogo",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata fixado consomem poucos alimentos de Pitta. No estado mais grave de Vata, o fogo que equilibraria o excesso de vento está ausente da dieta.",
    },
  },
  {
    id: "R18",
    categoria: "Critico",
    applies: (c) => (c.agni.includes("fraca") || c.agni.includes("lenta")) && c.ap <= 2,
    copy: {
      titulo: "Fogo apagado — e sem o que o acenderia",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão fraca ou lenta também não consomem os alimentos de Pitta que acenderiam esse fogo. Uma espiral que se fecha sobre si mesma.",
    },
  },
  {
    id: "R19",
    categoria: "Critico",
    applies: (c) => c.sk >= 6 && c.ap <= 2,
    copy: {
      titulo: "Estagnação sem o fogo que dissolve",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com 6 ou mais sintomas de Kapha também não consomem alimentos de Pitta. O fogo é o principal antídoto à estagnação — e está ausente da dieta da maioria.",
    },
  },
  {
    id: "R20",
    categoria: "Critico",
    applies: (c) => c.k >= 60 && c.ap <= 2,
    copy: {
      titulo: "Kapha fixado sem o fogo que dissolve",
      subtitulo: "Crítico · {pct}%",
      descricao:
        "{pct}% das pessoas com Kapha no estado mais grave também não consomem alimentos de Pitta. Quando a montanha cai, ela cai sem o calor que a teria dissolvido antes.",
    },
  },

  // Alerta
  {
    id: "R21",
    categoria: "Alerta",
    applies: (c) => c.v >= 25 && c.v <= 35 && c.ap <= 2,
    copy: {
      titulo: "Vata acumulando sem o fogo que o direciona",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata em Acúmulo também consomem poucos alimentos de Pitta. O fogo regula o vento — e está ausente da dieta da maioria que chega nesse estado.",
    },
  },
  {
    id: "R22",
    categoria: "Alerta",
    applies: (c) => c.age >= 50 && c.agni.includes("irregular"),
    copy: {
      titulo: "A fase Vata da vida com digestão errática",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com 50 anos ou mais têm digestão irregular. A partir dos 50, o Ayurveda descreve uma fase naturalmente mais Vata — os dados confirmam.",
    },
  },
  {
    id: "R23",
    categoria: "Alerta",
    applies: (c) => c.k >= 36 && c.k <= 50 && c.ap <= 2,
    copy: {
      titulo: "Kapha acumulando sem o que o moveria",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com Kapha em Acúmulo consomem poucos alimentos de Pitta. O fogo é o antídoto natural da estagnação — e a maioria nesse estado não o consome.",
    },
  },
  {
    id: "R24",
    categoria: "Alerta",
    applies: (c) =>
      (c.agni.includes("fraca") || c.agni.includes("lenta")) &&
      (c.agni.includes("nivel 2") || c.agni.includes("nivel 3")) &&
      c.k >= 36,
    copy: {
      titulo: "Digestão lenta e Kapha acumulando juntos",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão fraca ou lenta em nível moderado também têm Kapha em Acúmulo. Quando o fogo é insuficiente para transformar, a matéria se acumula.",
    },
  },
  {
    id: "R25",
    categoria: "Alerta",
    applies: (c) =>
      c.imc >= 26 &&
      c.imc <= 60 &&
      (c.agni.includes("fraca") || c.agni.includes("lenta")) &&
      c.sk >= 4,
    copy: {
      titulo: "Três marcadores de Kapha alinhados",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com IMC acima de 26, digestão lenta e 4 ou mais sintomas de Kapha têm os três marcadores confirmados. Quando o corpo, a digestão e os sintomas concordam, o caminho fica claro.",
    },
  },
  {
    id: "R26",
    categoria: "Alerta",
    applies: (c) =>
      c.agni.includes("forte") &&
      (c.agni.includes("nivel 2") || c.agni.includes("nivel 3")) &&
      c.p >= 41 &&
      c.v >= 25,
    copy: {
      titulo: "Fogo intenso com Pitta adoecido quase sempre tem Vata por baixo",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com fogo digestivo muito intenso e Pitta adoecido também têm Vata em Acúmulo. Fogo acelerado sem movimento equilibrado gera turbulência — e Vata aparece.",
    },
  },
  {
    id: "R27",
    categoria: "Alerta",
    applies: (c) =>
      (c.agni.includes("fraca") || c.agni.includes("lenta")) &&
      (c.agni.includes("nivel 2") || c.agni.includes("nivel 3")) &&
      c.k >= 36 &&
      c.p <= 30,
    copy: {
      titulo: "Digestão lenta com Kapha alto quase sempre apaga o Pitta",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão fraca e Kapha em Acúmulo têm Pitta normal ou em déficit. Sem fogo digestivo, o peso acumula — e o metabolismo se ausenta.",
    },
  },
  {
    id: "R28",
    categoria: "Alerta",
    applies: (c) =>
      c.imc >= 28 &&
      c.imc <= 60 &&
      (c.agni.includes("fraca") || c.agni.includes("lenta")) &&
      c.av <= 2,
    copy: {
      titulo: "Corpo denso sem movimento na dieta",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com IMC alto e digestão lenta consomem poucos alimentos de Vata. Leveza, movimento, o que circula — justamente o que o corpo mais precisaria nesse estado.",
    },
  },
  {
    id: "R29",
    categoria: "Alerta",
    applies: (c) => c.agni.includes("forte") && c.av <= 2,
    copy: {
      titulo: "Fogo alto sem a leveza que o refresca",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com digestão forte e intensa consomem poucos alimentos de Vata. Sem leveza e frescor na dieta, o fogo não encontra alívio e acumula ainda mais.",
    },
  },
  {
    id: "R30",
    categoria: "Alerta",
    applies: (c) => c.p >= 31 && c.p <= 40 && c.av <= 2,
    copy: {
      titulo: "Pitta acumulando sem a leveza de Vata",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta em Acúmulo consomem poucos alimentos de Vata. Sem leveza e movimento na dieta, o fogo não encontra saída e acumula ainda mais.",
    },
  },
  {
    id: "R31",
    categoria: "Alerta",
    applies: (c) => c.sk >= 6 && c.av <= 2,
    copy: {
      titulo: "Estagnação sem o movimento que dissolve",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com 6 ou mais sintomas de Kapha também não consomem alimentos de Vata. O movimento é o antídoto natural da letargia — e está ausente da dieta da maioria.",
    },
  },
  {
    id: "R32",
    categoria: "Alerta",
    applies: (c) => c.k >= 36 && c.k <= 50 && c.av <= 2,
    copy: {
      titulo: "Kapha pesado sem o vento que o moveria",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas com Kapha em Acúmulo consomem poucos alimentos de Vata. A leveza e o movimento que dissolveriam a estagnação estão ausentes da dieta.",
    },
  },
  {
    id: "R33",
    categoria: "Alerta",
    applies: (c) => c.age >= 13 && c.age <= 49 && c.p >= 31,
    copy: {
      titulo: "A fase Pitta sobrecarregada",
      subtitulo: "Alerta · {pct}%",
      descricao:
        "{pct}% das pessoas entre 13 e 49 anos — a fase naturalmente Pitta da vida — já está com Pitta em Acúmulo. O fogo da vida está sendo acelerado além do que o corpo sustenta.",
    },
  },

  // Atencao
  {
    id: "R34",
    categoria: "Atencao",
    applies: (c) => c.p >= 0 && c.p <= 14 && !c.agni.includes("forte") && c.ap <= 1,
    copy: {
      titulo: "Apagando o próprio fogo",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta em déficit e digestão sem intensidade também não consomem alimentos de Pitta. Falta de fogo mais falta do que acende — um ciclo de apagamento que precisa ser quebrado.",
    },
  },
  {
    id: "R35",
    categoria: "Atencao",
    applies: (c) => c.p >= 0 && c.p <= 14 && c.age >= 50,
    copy: {
      titulo: "Pitta baixo — a fase Vata chegou",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta em déficit têm 50 anos ou mais. O Ayurveda descreve isso como natural: após os 50, o fogo da maturidade começa a dar lugar à fase Vata da vida.",
    },
  },
  {
    id: "R36",
    categoria: "Atencao",
    applies: (c) => c.v >= 0 && c.v <= 14 && !c.agni.includes("irregular") && c.av <= 1,
    copy: {
      titulo: "Vata baixo sem estímulo de movimento",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata em déficit e sem irregularidade digestiva também consomem poucos alimentos de Vata. Quando falta movimento, ele precisa ser estimulado — e não está vindo da dieta.",
    },
  },
  {
    id: "R37",
    categoria: "Atencao",
    applies: (c) => c.v >= 36 && c.v <= 49 && c.p >= 25 && c.p <= 40,
    copy: {
      titulo: "Vata adoece primeiro — Pitta ainda está chegando lá",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata adoecido ainda têm Pitta apenas em Acúmulo — não adoeceu. Isso confirma a sequência: Vata vai primeiro, e arrasta Pitta depois. Você está vendo a progressão em tempo real.",
    },
  },
  {
    id: "R38",
    categoria: "Atencao",
    applies: (c) => c.sp >= 6 && c.av <= 2,
    copy: {
      titulo: "Sintomas de fogo sem o que o resfriaria",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com 6 ou mais sintomas de Pitta consomem poucos alimentos de Vata. A leveza, o frescor, o que dissipa o calor — está ausente da dieta de quem mais precisa.",
    },
  },
  {
    id: "R39",
    categoria: "Atencao",
    applies: (c) => c.v >= 50 && c.sp >= 5,
    copy: {
      titulo: "O vento pegou fogo",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata fixado também têm 5 ou mais sintomas de Pitta. Quando Vata está no nível mais grave, ele começa a agitar o fogo de Pitta — e os dois ardem juntos.",
    },
  },
  {
    id: "R40",
    categoria: "Atencao",
    applies: (c) => c.age >= 50 && c.v >= 36,
    copy: {
      titulo: "A fase Vata chegou com força",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com 50 anos ou mais já está com Vata adoecido. A fase da vida pede mais aterramento, calor e nutrição — e o corpo sinaliza quando não está recebendo.",
    },
  },
  {
    id: "R41",
    categoria: "Atencao",
    applies: (c) => c.v >= 36 && c.p >= 31,
    copy: {
      titulo: "Vata arrastando Pitta",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata adoecido também têm Pitta em Acúmulo. O desequilíbrio primário de Vata vai contaminando o fogo de Pitta — a progressão natural quando o vento não é tratado.",
    },
  },
  {
    id: "R42",
    categoria: "Atencao",
    applies: (c) => c.v >= 50 && c.p >= 31,
    copy: {
      titulo: "Vata no topo arrasta Pitta junto",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata fixado também têm Pitta em Acúmulo. O colapso do vento não fica isolado — ele contamina o fogo digestivo e emocional.",
    },
  },
  {
    id: "R43",
    categoria: "Atencao",
    applies: (c) => c.p >= 50 && c.av <= 2,
    copy: {
      titulo: "Pitta fixado sem o que o aliviaria",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta fixado consomem poucos alimentos de Vata. A leveza e o movimento que resfriariam o excesso de fogo estão ausentes da dieta de quem está no nível mais grave.",
    },
  },
  {
    id: "R44",
    categoria: "Atencao",
    applies: (c) => c.v >= 15 && c.v <= 24 && c.agni.includes("irregular"),
    copy: {
      titulo: "Sinal precoce: digestão irregular antes do score subir",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata ainda em Normal já têm digestão irregular. É um sinal antes do sinal — o Agni aparece como alerta antes que o score reflita o desequilíbrio.",
    },
  },
  {
    id: "R45",
    categoria: "Atencao",
    applies: (c) => c.v >= 15 && c.v <= 24 && c.sv >= 4,
    copy: {
      titulo: "Os sintomas chegam antes do score",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Vata aparentemente normal já relatam 4 ou mais sintomas de Vata. O corpo sente antes que o teste reflita — vale prestar atenção ao que está se manifestando.",
    },
  },
  {
    id: "R46",
    categoria: "Atencao",
    applies: (c) => c.p <= 30 && c.sp >= 4,
    copy: {
      titulo: "Pitta oculto: sintomas além do score",
      subtitulo: "Atenção · {pct}%",
      descricao:
        "{pct}% das pessoas com Pitta em nível normal ou baixo ainda relatam 4 ou mais sintomas de Pitta. O fogo pode estar se manifestando além do que a pontuação captura — refluxo, irritação, inflamação.",
    },
  },

  // Paradoxo
  {
    id: "R47",
    categoria: "Paradoxo",
    applies: (c) => c.v >= 50 && c.agni.includes("forte"),
    copy: {
      titulo: "Paradoxo: Vata e fogo intenso quase não coexistem",
      subtitulo: "Paradoxo · {pct}%",
      descricao:
        "Apenas {pct}% das pessoas com Vata fixado também têm digestão forte. Vata e fogo intenso são quase incompatíveis — o vento quase sempre apaga o fogo, não o intensifica.",
    },
  },
  {
    id: "R48",
    categoria: "Paradoxo",
    applies: (c) =>
      c.imc >= 5 && c.imc <= 18.4 && (c.agni.includes("fraca") || c.agni.includes("lenta")),
    copy: {
      titulo: "Paradoxo: ser magro raramente é Kapha",
      subtitulo: "Paradoxo · {pct}%",
      descricao:
        "Apenas {pct}% das pessoas com IMC abaixo de 18.5 têm digestão fraca ou lenta. Ser magro quase nunca é Kapha — o corpo leve é quase sempre uma expressão de Vata, não de inércia.",
    },
  },

  // Estrutural
  {
    id: "R49",
    categoria: "Estrutural",
    applies: (c) => c.av >= 3 && c.ap >= 3 && c.ak >= 3,
    copy: {
      titulo: "A dieta como causa: 36 pontos de diferença",
      subtitulo: "Estrutural",
      descricao:
        "Quem consome alimentos dos três doshas intensamente tem score médio de 101 pontos — 36 pontos acima de quem não marca nenhum. Os alimentos do teste são agravantes: quanto mais você consome, mais agrava. O equilíbrio está em saber o que reduzir.",
    },
  },
];

// Priority order for limiting to 6 cards
const CATEGORY_PRIORITY: Record<CategoriaMetrica, number> = {
  Diagnostico: 1,
  Critico: 2,
  Alerta: 3,
  Atencao: 4,
  Paradoxo: 5,
  Estrutural: 6,
};

/**
 * Returns the rule IDs applicable to the user, after dedup rules are applied.
 * Dedup rules:
 * - R06/R07/R10 are subsets of R02 → if any of R06/R07/R10 applies, drop R02.
 * - R15 and R16 → keep only R16 if both apply.
 * - R41 and R42 → keep only R42 if both apply (more severe).
 * - R05 (positive) only appears if no negative Critico/Diagnostico card applies.
 */
export function getApplicableRuleIds(ctx: UserMetricasContext): string[] {
  const applicable = new Set(RULES.filter((r) => r.applies(ctx)).map((r) => r.id));

  if (applicable.has("R06") || applicable.has("R07") || applicable.has("R10")) {
    applicable.delete("R02");
  }
  if (applicable.has("R15") && applicable.has("R16")) {
    applicable.delete("R15");
  }
  if (applicable.has("R41") && applicable.has("R42")) {
    applicable.delete("R41");
  }
  if (applicable.has("R05")) {
    const hasNegative = RULES.some(
      (r) =>
        applicable.has(r.id) &&
        r.id !== "R05" &&
        (r.categoria === "Diagnostico" || r.categoria === "Critico"),
    );
    if (hasNegative) applicable.delete("R05");
  }

  return Array.from(applicable);
}

/**
 * Snapshot row from `metricas_snapshot` indexed by metrica_id.
 */
export interface SnapshotEntry {
  metrica_id: string;
  categoria?: string | null;
  percentual: number | null;
  n_base: number | null;
}

export interface MetricaCardData {
  id: string;
  categoria: CategoriaMetrica;
  titulo: string;
  subtitulo: string;
  descricao: string;
  percentual: number;
  n_base: number;
}

function fillTemplate(
  template: string,
  pct: number,
  n: number,
): string {
  // Format pct: keep one decimal if not integer, otherwise no decimal
  const pctStr = Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace(".", ",");
  return template.replace(/\{pct\}/g, pctStr).replace(/\{n\}/g, String(n));
}

/**
 * Combines applicable rules with snapshot data and returns the cards to render.
 * - Drops rules with n_base < 10
 * - Sorts by category priority then percentual desc
 * - Limits to maxCards (default 6)
 */
export function buildMetricasCards(
  ctx: UserMetricasContext,
  snapshots: SnapshotEntry[],
  maxCards = 6,
): MetricaCardData[] {
  const snapshotMap = new Map<string, SnapshotEntry>();
  for (const s of snapshots) snapshotMap.set(s.metrica_id, s);

  const applicableIds = new Set(getApplicableRuleIds(ctx));

  const cards: MetricaCardData[] = [];
  for (const rule of RULES) {
    if (!applicableIds.has(rule.id)) continue;
    const snap = snapshotMap.get(rule.id);
    if (!snap) continue;

    const pct = Number(snap.percentual ?? 0);
    const n = Number(snap.n_base ?? 0);

    // Skip rules with insufficient sample size, except R49 (Estrutural — pct=101 is the score, not a %)
    if (rule.categoria !== "Estrutural" && n < 10) continue;

    cards.push({
      id: rule.id,
      categoria: rule.categoria,
      titulo: rule.copy.titulo,
      subtitulo: fillTemplate(rule.copy.subtitulo, pct, n),
      descricao: fillTemplate(rule.copy.descricao, pct, n),
      percentual: pct,
      n_base: n,
    });
  }

  cards.sort((a, b) => {
    const pa = CATEGORY_PRIORITY[a.categoria];
    const pb = CATEGORY_PRIORITY[b.categoria];
    if (pa !== pb) return pa - pb;
    return b.percentual - a.percentual;
  });

  return cards.slice(0, maxCards);
}

export const CATEGORY_LABELS: Record<CategoriaMetrica, string> = {
  Diagnostico: "Diagnóstico",
  Critico: "Críticos",
  Alerta: "Alertas",
  Atencao: "Atenção",
  Paradoxo: "Paradoxos",
  Estrutural: "Estrutural",
};
