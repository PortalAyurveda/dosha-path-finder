/** Textos da vitrine /cursos: lidos pela tela (CursosVitrine), pelo pré-render e pelo FAQPage. */
export const FOTO_EDSON =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg";

export const hubCursos = {
  titulo: "Cursos de Ayurveda online | Portal Ayurveda",
  etiqueta: "Escola do Portal",
  h1: "Cursos de Ayurveda para aprender na prática",
  paragrafos: [
    "O Ayurveda não precisa começar com palavras difíceis. Pode começar pela alimentação, pelos horários do dia e pela observação do próprio corpo. São conhecimentos que, aos poucos, ajudam você a compreender melhor sua saúde.",
    "Aqui você encontra os cursos de Ayurveda online do Portal. Seja para cuidar de si, aprofundar seus conhecimentos ou aprender a cuidar de outras pessoas, existe um caminho para cada interesse.",
  ],
  comecar: {
    etiqueta: "POR ONDE COMEÇAR?",
    titulo: "Comece pela Alimentação Ayurvédica",
    frases: [
      "A alimentação é a porta de entrada para entender os doshas, a digestão e como os alimentos agem no nosso corpo.",
      "Com mais de 60 aulas, você aprende desde o básico até a cozinha terapêutica, mesmo que nunca tenha estudado Ayurveda.",
    ],
    botao: "Conhecer o Curso de Alimentação",
    botaoAluno: "Acessar seu curso",
    link: "/curso/alimentacao",
  },
  caminhos: {
    titulo: "Escolha seu caminho no Ayurveda",
    itens: [
      { titulo: "Autocuidado", texto: "Aprenda a cuidar da alimentação, organizar suas rotinas e reconhecer os sinais do próprio corpo com os cursos de Alimentação Ayurvédica, Rotinas Diárias e Diagnóstico." },
      { titulo: "Aprofundamento", texto: "Conheça as propriedades e os usos das ervas e especiarias do Ayurveda com o Curso Dravya Guna." },
      { titulo: "Formação", texto: "Para quem deseja atuar como terapeuta, a Formação em Terapeuta Ayurveda oferece 15 módulos que vão da teoria à prática clínica." },
    ],
  },
  professor: {
    titulo: "Quem está por trás do Portal?",
    foto: FOTO_EDSON,
    frases: [
      "Sou Edson Osorio, terapeuta e professor de Ayurveda há 15 anos, com mais de 6.000 alunos formados.",
      "Minha história com o Ayurveda começou em 2009, com um simples teste de dosha feito numa folha de caderno.",
    ],
  },
  faq: {
    titulo: "Perguntas frequentes",
    itens: [
      { q: "Nunca estudei Ayurveda. Por qual curso devo começar?", a: "O Curso de Alimentação Ayurvédica é a nossa porta de entrada. Ele começa do básico e foi feito tanto para quem nunca estudou Ayurveda quanto para profissionais de saúde." },
      { q: "O que vou aprender no Curso de Alimentação Ayurvédica?", a: "Você vai conhecer a lógica dos doshas na alimentação, o funcionamento da digestão (Agni), as combinações de alimentos e a cozinha terapêutica. São mais de 60 aulas." },
      { q: "O Curso de Alimentação tem certificado e por quanto tempo posso acessar?", a: "Sim, você recebe um certificado de curso livre de 40 horas e tem 2 anos de acesso. Também conta com um Tutor de IA disponível 24 horas por dia para ajudar nos estudos." },
      { q: "Qual curso ensina a observar os sinais do próprio corpo?", a: "O Curso de Diagnóstico é voltado ao autocuidado e ensina você a reconhecer sinais do corpo, como aqueles que aparecem na língua." },
      { q: "Quero trabalhar atendendo pessoas com Ayurveda. Qual curso escolher?", a: "A Formação em Terapeuta Ayurveda é o caminho para quem deseja atender. São 15 módulos de formação completa, desde os fundamentos teóricos até a prática clínica." },
    ],
  },
  /** Links estáticos dos cursos para o pré-render (os cartões da tela vêm do banco). */
  cursos: [
    { titulo: "Curso de Alimentação Ayurvédica", href: "/curso/alimentacao" },
    { titulo: "Curso de Rotinas Diárias do Ayurveda", href: "/curso/rotinas" },
    { titulo: "Curso de Diagnóstico e Autocuidado no Ayurveda", href: "/curso/diagnostico" },
    { titulo: "Curso Dravya Guna: Remédios Caseiros do Ayurveda", href: "/curso/dravya-guna" },
    { titulo: "Formação em Terapeuta Ayurveda", href: "/curso/formacao" },
  ],
};
