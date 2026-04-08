export interface ScoreValues {
  v?: number;
  p?: number;
  k?: number;
  agni_irregular?: number;
  agni_forte?: number;
  agni_fraco?: number;
}

export interface QuestionOption {
  label: string;
  scores: ScoreValues;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface FoodTag {
  label: string;
  dosha: 'v' | 'p' | 'k';
}

export const PART1_QUESTIONS: Question[] = [
  {
    id: 'q1_1',
    text: 'Sua maneira de se expressar é mais:',
    options: [
      { label: 'Rápida, com gesticulação (movimento) ou, às vezes, um pouco rouca.', scores: { v: 2 } },
      { label: 'Clara, intensa e, por vezes, crítica ou argumentativa.', scores: { p: 2 } },
      { label: 'Lenta, suave ou reservada (prefiro ouvir).', scores: { k: 2 } },
    ],
  },
  {
    id: 'q1_2',
    text: 'Como você lida com mudanças inesperadas em sua rotina?',
    options: [
      { label: 'Fico ansioso(a), inseguro(a), com medo ou dúvida.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Fico estressado(a) e imediatamente busco a melhor solução e ordem.', scores: { p: 2 } },
      { label: 'Fico resistente e prefiro manter o que é familiar e confortável.', scores: { k: 2 } },
    ],
  },
  {
    id: 'q1_3',
    text: 'Qual emoção você sente com mais frequência ou intensidade quando está sob estresse?',
    options: [
      { label: 'Ansiedade, nervosismo ou medo de que algo ruim aconteça.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Irritação, raiva ou impaciência com a lentidão dos outros.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Melancolia, apatia ou busca por conforto (comer, dormir).', scores: { k: 2, agni_fraco: 2 } },
      { label: 'Oscilo entre ansiedade e frustração/raiva.', scores: { v: 1, p: 1 } },
    ],
  },
  {
    id: 'q1_4',
    text: 'Como está o fluxo de suas ideias e sua capacidade de concentração?',
    options: [
      { label: 'Tenho muitas ideias e sou criativo(a), mas a mente está dispersa e me esqueço dos detalhes.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Minha mente é focada, analítica e busca o discernimento rápido para resolver problemas.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Mente estável e calma, mas demoro para iniciar novos projetos (letargia mental).', scores: { k: 2 } },
      { label: 'Mente agitada e analítica ao mesmo tempo (ansiedade com necessidade de controle).', scores: { v: 1, p: 1 } },
      { label: 'Mente lenta para iniciar e dispersa para finalizar.', scores: { v: 1, k: 1 } },
    ],
  },
];

export const PART2_QUESTIONS: Question[] = [
  {
    id: 'q2_1',
    text: 'Meu apetite é geralmente:',
    options: [
      { label: 'Irregular, às vezes como, às vezes me esqueço de comer.', scores: { v: 2, agni_irregular: 2 } },
      { label: 'Forte e intenso (fico irritado se não como na hora certa).', scores: { p: 2, agni_forte: 2 } },
      { label: 'Fraco ou lento para aparecer, tenho peso no estômago.', scores: { k: 2, agni_fraco: 2 } },
    ],
  },
  {
    id: 'q2_2',
    text: 'O que você sente mais frequentemente após as refeições?',
    options: [
      { label: 'Gases ou estufamento (espaço vazio e movimento no trato digestivo).', scores: { v: 2, agni_irregular: 2 } },
      { label: 'Acidez ou queimação (fogo/calor).', scores: { p: 2, agni_forte: 2 } },
      { label: 'Sonolência e peso na barriga.', scores: { k: 2, v: 1, agni_fraco: 2 } },
      { label: 'Gases com queimação ou acidez.', scores: { v: 2, p: 2, agni_irregular: 1, agni_forte: 1 } },
      { label: 'Peso e letargia com estufamento e gases.', scores: { v: 2, k: 2, agni_fraco: 1, agni_irregular: 1 } },
    ],
  },
  {
    id: 'q2_3',
    text: 'Sua capacidade de transformar o que come é:',
    options: [
      { label: 'Irregular (digestão inconstante, ora rápida, ora lenta demais).', scores: { v: 1, agni_irregular: 1 } },
      { label: 'Intensa (o alimento é queimado rápido e tenho muita fome logo depois).', scores: { p: 1, agni_forte: 1 } },
      { label: 'Lenta e fraca (demora para sentir fome novamente).', scores: { v: 2, k: 2, agni_fraco: 1 } },
      { label: 'Intensa e lenta (acidez e peso estomacal).', scores: { p: 2, k: 2 } },
    ],
  },
];

export const PART3_QUESTIONS: Question[] = [
  {
    id: 'q3_1',
    text: 'Minha urina é:',
    options: [
      { label: 'Escassa, posso segurar, faço pouco xixi.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Amarelada escura ou quente, constante e abundante.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Com odor, posso ir pouco mas é volumosa.', scores: { k: 2, agni_fraco: 1 } },
    ],
  },
  {
    id: 'q3_2',
    text: 'Meu suor e odor corporal é:',
    options: [
      { label: 'Quase não suo, e minha pele é seca.', scores: { v: 2 } },
      { label: 'Suor excessivo, quente ou com odor forte/ácido.', scores: { p: 2 } },
      { label: 'Suor moderado, pele oleosa ou com tendência a retenção de líquido.', scores: { k: 1 } },
      { label: 'Pouco suor e pele quente e seca.', scores: { v: 1, p: 1 } },
      { label: 'Suor quente, amarelado, oleoso e úmido.', scores: { p: 2, k: 2 } },
    ],
  },
  {
    id: 'q3_3',
    text: 'Minhas evacuações são tipicamente:',
    options: [
      { label: 'Constipadas, secas, difíceis de eliminar.', scores: { v: 3 } },
      { label: 'Soltas, com cheiro forte e tendência à diarreia.', scores: { p: 3 } },
      { label: 'Grandes, pesadas, pastosas ou com muco.', scores: { k: 3 } },
    ],
  },
];

export const PART4_QUESTIONS: Question[] = [
  {
    id: 'q4_1',
    text: 'Meu corpo tende a ser:',
    options: [
      { label: 'Magro ou leve, assimétrico, com dificuldade em ganhar peso.', scores: { v: 2 } },
      { label: 'Mediano, atlético, simétrico, ganha tônus com facilidade.', scores: { p: 3 } },
      { label: 'Robusto, arredondado com facilidade em ganhar peso e dificuldade em perder.', scores: { k: 3 } },
    ],
  },
  {
    id: 'q4_2',
    text: 'Sinto minhas articulações e ossos com mais:',
    options: [
      { label: 'Estalos, rigidez ou dor que muda de lugar, às vezes some.', scores: { v: 2 } },
      { label: 'Inflamação articular, tendinite, dores quentes pulsantes.', scores: { p: 1 } },
      { label: 'Peso, inchaço ou edemas, retendo líquido.', scores: { k: 1 } },
    ],
  },
  {
    id: 'q4_3',
    text: 'Minha pele é mais:',
    options: [
      { label: 'Seca, fria e áspera (falta de umidade/nutrição).', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Sensível, com vermelhidão ou manchas e pintas.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Oleosa, fria e densa (untuosidade).', scores: { k: 2, agni_fraco: 1 } },
    ],
  },
  {
    id: 'q4_4',
    text: 'Saúde Íntima / Ciclo Menstrual:',
    options: [
      { label: 'Ciclo irregular, cólicas fortes, pouco fluxo.', scores: { v: 2 } },
      { label: 'Fluxo intenso, sangue bem vermelho, queimação ou TPM com irritação.', scores: { p: 2 } },
      { label: 'Fluxo denso, retenção de líquido, cólica pesada e constante.', scores: { k: 2 } },
      { label: 'Não menstruo / Menopausa / Sou homem.', scores: {} },
    ],
  },
];

export const PART5_QUESTIONS: Question[] = [
  {
    id: 'q5_1',
    text: 'Minha energia física e vigor são:',
    options: [
      { label: 'Oscilantes, com picos e quedas, sentindo pouca vitalidade.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Intensos, mas me sinto esgotado(a) se não descansar (alto metabolismo).', scores: { p: 2, agni_forte: 1 } },
      { label: 'Estáveis, com grande resistência e paciência.', scores: { k: 2 } },
    ],
  },
  {
    id: 'q5_2',
    text: 'Em relação à minha saúde geral, eu:',
    options: [
      { label: 'Adoeço facilmente, sinto que minha imunidade é frágil.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Sou propenso(a) a infecções ou inflamações (ites).', scores: { p: 2, agni_forte: 1 } },
      { label: 'Sou propenso(a) a muco, congestionamento, inchaço e edemas.', scores: { k: 2, agni_fraco: 1 } },
    ],
  },
];

export const PART6_QUESTIONS: Question[] = [
  {
    id: 'q6_1',
    text: 'Meu sono costuma ser mais:',
    options: [
      { label: 'Leve, com insônia ou dificuldade em manter o sono. Acordo facilmente.', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Penso muito pra dormir mas quando apago consigo aprofundar, posso acordar irritado.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Durmo com facilidade, sinto dificuldade em acordar ou tenho letargia.', scores: { k: 2, agni_fraco: 1 } },
    ],
  },
  {
    id: 'q6_2',
    text: 'Meu ritmo e horários diários (comer, dormir) são:',
    options: [
      { label: 'Irregulares e inconstantes (não tenho horários fixos).', scores: { v: 2, agni_irregular: 1 } },
      { label: 'Intensos, acelerados e cheios de compromissos.', scores: { p: 2, agni_forte: 1 } },
      { label: 'Lentos, estáveis e busco o conforto.', scores: { k: 2, agni_fraco: 1 } },
    ],
  },
  {
    id: 'q6_3',
    text: 'Meu estilo de trabalho ou hobbies é:',
    options: [
      { label: 'Criativo, envolvo-me em multitarefas e adoro viajar.', scores: { v: 1 } },
      { label: 'Competitivo, focado em resultados e liderança.', scores: { p: 1 } },
      { label: 'Estável, prefiro ambientes acolhedores e familiares.', scores: { k: 2 } },
      { label: 'Multitarefas e competitivo.', scores: { v: 2, p: 2 } },
    ],
  },
  {
    id: 'q6_4',
    text: 'Quando você tem um tempo livre para lazer, que tipo de energia você prefere gastar?',
    options: [
      { label: 'Gosto de usar minha imaginação e criatividade. Prefiro atividades leves, artísticas ou mentais.', scores: { v: 2 } },
      { label: 'Gosto de atividades que exigem foco, disputa e desafio, gosto de testar meus limites.', scores: { p: 2 } },
      { label: 'Gosto mais de ficar em casa e relaxar, optar por ler ou assistir algo, passear levemente.', scores: { k: 2 } },
    ],
  },
];

export const PART7_QUESTIONS: Question[] = [
  {
    id: 'q7_1',
    text: 'O clima que mais me incomoda ou agrava minha saúde é:',
    options: [
      { label: 'Frio, vento e tempo seco.', scores: { v: 1, k: 1 } },
      { label: 'Calor, sol forte ou tempo quente em geral.', scores: { p: 1, k: 1 } },
      { label: 'Tempo úmido, chuvoso e frio.', scores: { v: 1, k: 1 } },
    ],
  },
  {
    id: 'q7_2',
    text: 'Quando preciso tomar decisões, eu as tomo de forma:',
    options: [
      { label: 'Confusa ou indecisa, mudando de ideia facilmente.', scores: { v: 2 } },
      { label: 'Penetrante, com clareza e convicção (discernimento abundante).', scores: { p: 2 } },
      { label: 'Lenta, com resistência ou por falta de clareza.', scores: { k: 2 } },
    ],
  },
  {
    id: 'q7_3',
    text: 'Meu corpo se sente mais frequentemente:',
    options: [
      { label: 'Frio ou com as extremidades frias (mãos e pés).', scores: { v: 2 } },
      { label: 'Quente ou com tendência a calor nas extremidades.', scores: { p: 2 } },
      { label: 'Frio, mas com sensação de densidade ou peso.', scores: { k: 2 } },
    ],
  },
  {
    id: 'q7_4',
    text: 'Em termos de constituição física, eu sou mais:',
    options: [
      { label: 'Alto(a), magro(a), com ossos proeminentes.', scores: { v: 2 } },
      { label: 'De altura média, atlético(a) ou com densidade muscular.', scores: { p: 2 } },
      { label: 'Robusto(a), com ganho de peso, com estrutura larga.', scores: { k: 3 } },
    ],
  },
];

export const FOOD_TAGS: FoodTag[] = [
  // Vata (6)
  { label: 'Saladas', dosha: 'v' },
  { label: 'Frutas', dosha: 'v' },
  { label: 'Chás', dosha: 'v' },
  { label: 'Integrais', dosha: 'v' },
  { label: 'Torradas', dosha: 'v' },
  { label: 'Germinados', dosha: 'v' },
  // Pitta (6)
  { label: 'Conservas', dosha: 'p' },
  { label: 'Molhos', dosha: 'p' },
  { label: 'Bebidas Alcoólicas', dosha: 'p' },
  { label: 'Pimentas', dosha: 'p' },
  { label: 'Especiarias', dosha: 'p' },
  { label: 'Fermentados', dosha: 'p' },
  // Kapha (6)
  { label: 'Beliscos/Petiscos', dosha: 'k' },
  { label: 'Doces', dosha: 'k' },
  { label: 'Massas', dosha: 'k' },
  { label: 'Queijos', dosha: 'k' },
  { label: 'Sementes', dosha: 'k' },
  { label: 'Frituras/Salgados', dosha: 'k' },
];

export const AGRAVAMENTOS_VATA = [
  'Ansiedade', 'Insônia', 'Confusão mental', 'Zumbido no ouvido',
  'Estufamento abdominal', 'Frio nas extremidades', 'Anemia',
  'Ressecamento de pele', 'Constipação', 'Gases', 'Dor nas articulações',
  'Arritmia', 'Indigestão', 'Problemas ósseos',
];

export const AGRAVAMENTOS_PITTA = [
  'Estresse', 'Nervosismo', 'Rosácea/melasma', 'Refluxo', 'Burnout',
  'Inflamações', 'Azia', 'Dejetos mal formados', 'Fome excessiva',
  'Aftas', 'Calor nas extremidades', 'Problemas de visão', 'Dermatite',
  'Infecções recorrentes',
];

export const AGRAVAMENTOS_KAPHA = [
  'Letargia', 'Sensação de peso', 'Obesidade', 'Asma', 'Tosse mucosa',
  'Salivação excessiva', 'Sono excessivo', 'Respiração pesada', 'Flacidez',
  'Diabetes', 'Fungos', 'Edema', 'Digestão lenta', 'Suor pegajoso',
];

export const ALL_QUESTIONS: Question[] = [
  ...PART1_QUESTIONS,
  ...PART2_QUESTIONS,
  ...PART3_QUESTIONS,
  ...PART4_QUESTIONS,
  ...PART5_QUESTIONS,
  ...PART6_QUESTIONS,
  ...PART7_QUESTIONS,
];

export const STEP_CONFIG = [
  { title: 'Parte 1: Mente e Emoções', subtitle: 'Comportamento, expressão e concentração.', part: 'part1' },
  { title: 'Parte 2: Digestão e Fome', subtitle: 'Apetite, pós-refeição e alimentação.', part: 'part2' },
  { title: 'Parte 3: Excreção', subtitle: 'Urina, suor e evacuações.', part: 'part3' },
  { title: 'Parte 4: Tecidos Corporais', subtitle: 'Corpo, articulações, pele e ciclo.', part: 'part4' },
  { title: 'Parte 5: Vitalidade', subtitle: 'Energia e imunidade.', part: 'part5' },
  { title: 'Parte 6: Rotina Diária', subtitle: 'Sono, ritmo, trabalho e lazer.', part: 'part6' },
  { title: 'Parte 7: Adicionais', subtitle: 'Clima, decisões e constituição.', part: 'part7' },
  { title: 'Parte 8: Agravamentos', subtitle: 'Marque os sintomas que você sente atualmente.', part: 'part8' },
  { title: 'Finalização', subtitle: 'Seus dados complementares, interesses e relato pessoal.', part: 'interests' },
];
