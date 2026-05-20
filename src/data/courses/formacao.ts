export interface FormacaoModule {
  number: number;
  title: string;
  format: "Online" | "Presencial SP";
  date: string;
  description: string;
  details: string[];
}

export interface FormacaoSemester {
  title: string;
  subtitle: string;
  modules: FormacaoModule[];
}

export interface FormacaoFAQ {
  question: string;
  answer: string;
}

export interface FormacaoDifferential {
  number: number;
  title: string;
  body: string;
  bullets?: string[];
}

export interface FormacaoData {
  meta: { title: string; description: string; slug: string };
  branding: {
    primaryColor: string;
    darkColor: string;
    lightColor: string;
    accentColor: string;
    bulletSvg: string;
    portalLogo: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    details: string;
    startDate: string;
    endDate: string;
    ctaText: string;
    ctaSubtext: string;
  };
  paraQuem: { title: string; items: string[] };
  problema: {
    title: string;
    intro: string;
    closing: string;
  };
  solucao: {
    title: string;
    subtitle: string;
    listIntro: string;
    items: string[];
    closing: string;
  };
  programa: {
    title: string;
    intro: string;
    listIntro: string;
    benefits: { icon: string; title: string; text: string }[];
    bridge: string;
    semesters: FormacaoSemester[];
    cargaTitle: string;
    cargaItems: string[];
    extrasTitle: string;
    extras: { emoji: string; text: string }[];
    closing: string;
  };
  diferenciais: { title: string; items: FormacaoDifferential[] };
  professor: {
    name: string;
    role: string;
    photo: string;
    bullets: string[];
    text: string;
  };
  investimento: {
    title: string;
    subtitle: string;
    breakdownTitle: string;
    breakdown: string[];
    total: string;
    condicoesTitle: string;
    condicoes: string[];
    condicoesNote: string;
    inclusoTitle: string;
    incluso: string[];
    naoInclusoTitle: string;
    naoIncluso: string[];
  };
  faq: { title: string; items: FormacaoFAQ[] };
  finalCta: {
    title: string;
    body: string;
    primaryCta: string;
    primarySub: string;
    secondaryCta: string;
  };
}

export const formacaoData: FormacaoData = {
  meta: {
    slug: "formacao",
    title: "Formação Profissionalizante em Ayurveda | Portal Ayurveda",
    description:
      "Torne-se Terapeuta Ayurveda. 400h de certificação | 15 módulos em 1,5 ano | Online + 3 imersões em SP. Início em 11 e 12 de Julho de 2026.",
  },
  branding: {
    primaryColor: "#6B7FF2",
    darkColor: "#352F54",
    lightColor: "#E0E7FF",
    accentColor: "#FCA5A5",
    bulletSvg:
      "https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg",
    portalLogo:
      "https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png",
  },
  hero: {
    headline:
      "Torne-se Terapeuta Ayurveda e construa uma carreira com propósito cuidando da sua vitalidade e do próximo",
    subheadline:
      "Para quem já sentiu na pele o poder do Ayurveda — e agora quer dominar essa ciência de verdade, com autonomia para cuidar de si e transformar vidas ao seu redor.",
    details:
      "400 horas de certificação<br>15 módulos ao longo de 1 ano e meio<br>12 encontros online ao vivo + 3 imersões presenciais em SP",
    startDate: "Início: 11 e 12 de Julho de 2026",
    endDate: "Término: 06 e 07 de Novembro de 2027",
    ctaText: "Inscrições abrem início de maio",
    ctaSubtext: "Apenas 50 vagas.",
  },
  paraQuem: {
    title: "Para quem é esta formação",
    items: [
      "Já experimentou Ayurveda na pele — melhorou sua saúde, sua energia, sua clareza mental — e agora quer ir além da experiência pessoal",
      "Quer se tornar terapeuta profissional, mas não sabe por onde começar ou tem medo de que o conhecimento seja complicado demais",
      "Busca uma mudança de carreira com propósito — uma profissão que una autoconhecimento, saúde e autonomia financeira",
      "Já fez cursos variados de Ayurveda como Nutrição Ayurvédica, Dravya Guna, Dinacharyas, Detox e agora quer dar o próximo passo com estrutura para atender pacientes com precisão",
      "Quer aprender com quem pratica: Professor com 15 anos de clínica ativa, mais de 4.500 alunos formados em diferentes áreas do Ayurveda",
      "Tem um chamado para ajudar pessoas — e quer fazer isso com precisão, consciência e uma base sólida que te permita atuar com segurança e ética",
    ],
  },
  problema: {
    title: "O problema não é falta de informação",
    intro:
      "Você já assistiu dezenas de lives. Já leu sobre doshas, agni, ama. Talvez até tenha feito cursos introdutórios.\n\nVocê já experimentou os frutos do Ayurveda — sentiu a diferença na pele, na energia, na digestão.\n\n**Mas agora você quer mais.**\n\nVocê quer plantar sua própria árvore. Não apenas colher os frutos, mas dominar a semente, a raiz, o cultivo. Para ter autonomia real. Para oferecer esses frutos a quem te procura.",
    closing:
      "Porque uma coisa é experimentar os resultados. Outra coisa é olhar para uma língua e, em segundos, conectar subdoshas, digestão, excreção — e transformar a vida de alguém.\n\n**Essa é a diferença entre consumir Ayurveda e praticar Ayurveda.**",
  },
  solucao: {
    title: "A solução: estrutura + prática + vivência",
    subtitle:
      "Esta formação foi desenhada para te capacitar de verdade. Não é só assistir aulas. É viver Ayurveda enquanto aprende Ayurveda.",
    listIntro: "Aqui você vai:",
    items: [
      "Dominar a teoria que importa — Filosofia Samkhya, Doshas, Dhathu, Subdoshas, Diagnóstico, Dravya Guna, Terapias — tudo conectado, sem lacunas",
      "Praticar desde o início — Você vai preparar medicamentos, fazer abhyangas, aplicar terapias, atender pacientes reais no ambulatório ao vivo",
      "Viver a experiência em comunidade — A cada módulo, você recebe um cardápio, uma rotina (dinacharya), preparações para fazer em casa. Você não estuda Ayurveda. Você vive Ayurveda junto com a turma.",
      "Ter suporte completo — Acesso à área interna do Portal Ayurveda com Guia completo de Alimentação e Nutrição, Guia completo de Dravya Guna, Protocolo de Atendimento, apostilas detalhadas, comunidade de terapeutas e as próximas novidades ainda por vir.",
      "Aprender com UM professor do início ao fim (exceto o módulo de Saúde da Mulher) — Edson Osorío, 15 anos de clínica, mais de 4.500 alunos formados, te guiando módulo a módulo com coerência e profundidade",
      "Aplicar Ayurveda no Brasil de verdade — com ervas nacionais, clima tropical, alimentos locais. Não é tradução da Índia: é Ayurveda adaptado à nossa realidade",
    ],
    closing:
      "Essa é a diferença entre \"fazer mais um curso\" e \"se tornar terapeuta de verdade\". Você não vai só acumular informação. Você vai plantar raízes profundas — fundação, estrutura, domínio clínico.\n\nNão é sobre o que eu experimentei e vou te passar. Você vai experienciar Ayurveda a cada encontro, no online e no presencial, vamos nos aprofundar a cada degrau.",
  },
  programa: {
    title: "Esta não é uma formação comum. É uma jornada completa.",
    intro:
      "Ao longo de 1 ano e meio, você vai percorrer os 15 módulos que te transformam de praticante em terapeuta profissional. Mas isso vai muito além das 189 horas de aula ao vivo.",
    listIntro: "A cada módulo, você recebe:",
    benefits: [
      {
        icon: "🍲",
        title: "Cardápio Prático",
        text: "Receitas e preparações alinhadas ao tema do fim de semana",
      },
      {
        icon: "🌅",
        title: "Rotina de Dinacharya",
        text: "Práticas diárias para você aplicar em casa durante o módulo",
      },
      {
        icon: "🌿",
        title: "Experiências Vivenciais",
        text: "Preparações, terapias e cronogramas para fazer em conjunto com a turma",
      },
      {
        icon: "📚",
        title: "Materiais Completos",
        text: "Apostilas detalhadas, acesso vitalício às gravações, suporte contínuo",
      },
      {
        icon: "📝",
        title: "Diário de Evolução Clínica",
        text: "Você se torna seu próprio caso de estudo: registra mudanças físicas, mentais e emocionais, pratica autoanamnese e aplica diagnóstico em si mesmo",
      },
    ],
    bridge:
      "Você não vai apenas assistir aulas. Você vai viver Ayurveda — na teoria, na prática, no corpo, na rotina.",
    semesters: [
      {
        title: "Semestre 1",
        subtitle: "Fundação",
        modules: [
          {
            number: 1,
            title: "Cosmologia e Filosofia Samkhya",
            format: "Online",
            date: "11-12 de Julho/2026",
            description:
              "A base de tudo: de onde vem o Ayurveda, como ele enxerga o universo e o ser humano.",
            details: [
              "A jornada da consciência à matéria: Purusha e Prakriti",
              "Os 24 Tattvas: Mahat, Ahamkara, Manas, Indriyas, Tanmatras e Mahabhutas",
              "A lógica invisível do adoecimento: Prajnaparadha e a separação da natureza",
            ],
          },
          {
            number: 2,
            title: "Doshas, Dhatus e os 6 Sabores",
            format: "Online",
            date: "08-09 de Agosto/2026",
            description:
              "A estrutura central: Vata, Pitta, Kapha, os tecidos corporais e a lógica dos sabores.",
            details: [
              "Os Tridoshas e seus Gunas (atributos intrínsecos)",
              "Sapta Dhatus: formação dos 7 tecidos e produção de Ojas",
              "Shad Rasa: mecânica dos 6 sabores e impacto nos Doshas",
            ],
          },
          {
            number: 3,
            title: "Fisiologia 1: Órgãos-Sede e Caminhos dos Doshas",
            format: "Online",
            date: "12-13 de Setembro/2026",
            description:
              "Como os doshas se movem, onde moram, como causam desequilíbrio.",
            details: [
              "Agni (fogo biológico) e Ama (biotoxinas): raiz de saúde e doença",
              "Srotas: anatomia sutil dos canais de circulação",
              "Kostha: locais de acúmulo e trajeto de disseminação dos Doshas",
            ],
          },
          {
            number: 4,
            title: "Teoria das Terapias Ayurvédicas",
            format: "Online",
            date: "03-04 de Outubro/2026",
            description:
              "Abhyanga, Shirodhara, Swedana, Basti — a lógica por trás de cada terapia.",
            details: [
              "Panchakarma (purificação) e Shamana (pacificação)",
              "Purvakarma: Snehana (oleação) e Swedana (sudorese)",
              "Indicações, contraindicações e mecânica de desintoxicação",
            ],
          },
          {
            number: 5,
            title: "Prática: Terapias Ayurvédicas (Abhyanga e outras)",
            format: "Presencial SP",
            date: "07-08 de Novembro/2026",
            description: "Mão na massa. Você aplica, sente, aprende fazendo.",
            details: [
              "Abhyanga, Udvartana, Garshana e Pindas Sweda",
              "Posicionamento, ritmo e pressão do terapeuta",
              "Transferência de intenção através do toque terapêutico",
            ],
          },
        ],
      },
      {
        title: "Semestre 2",
        subtitle: "Estrutura Clínica",
        modules: [
          {
            number: 6,
            title: "Ahara: Nutrição Ayurvédica Completa",
            format: "Online",
            date: "30-31 de Janeiro/2027",
            description:
              "A alimentação como medicina. Teoria profunda, aplicação prática.",
            details: [
              "Farmacologia do alimento: Virya, Vipaka e Prabhava",
              "Viruddha Ahara (incompatibilidades) e doenças inflamatórias",
              "Uso de especiarias (Deepana/Pachana) e dietoterapia corretiva",
            ],
          },
          {
            number: 7,
            title: "Dravya Guna: A Ciência das Plantas (Teoria)",
            format: "Online",
            date: "20-21 de Fevereiro/2027",
            description:
              "Como as plantas agem no corpo, classificação, propriedades, uso clínico.",
            details: [
              "Introdução à farmacologia ayurvédica botânica",
              "Perfil energético de ervas principais (Guduchi, Ashwagandha, Triphala)",
              "Anupana: veículos carreadores para tecidos específicos",
            ],
          },
          {
            number: 8,
            title: "Fisiologia Avançada: Subdoshas e Correspondências",
            format: "Online",
            date: "20-21 de Março/2027",
            description:
              "O refinamento do diagnóstico: os 15 subdoshas e suas relações.",
            details: [
              "Os 15 subdoshas (Prana, Udana, Samana, Apana, Vyana; Pachaka, Ranjaka, Sadhaka, Alochaka, Bhrajaka; Kledaka, Avalambaka, Bodhaka, Tarpaka, Shleshaka)",
              "Relação entre mente, emoções e subdoshas nos órgãos",
              "Mapeamento de coração, fígado, cérebro e intestinos",
            ],
          },
          {
            number: 9,
            title: "Diagnóstico Teórico: Fundamentos e Excreções",
            format: "Online",
            date: "10-11 de Abril/2027",
            description:
              "Língua, pulso, urina, fezes — como ler o corpo com precisão.",
            details: [
              "Métodos clássicos: Trividha, Ashtavidha e Dashavidha Pariksha",
              "Jihva Pariksha (língua), Mala (fezes) e Mutra (urina)",
              "Identificação de Ama sistêmico por observação externa",
            ],
          },
          {
            number: 10,
            title: "Prática: Dravya Guna e Alquimia (Preparo de Óleos)",
            format: "Presencial SP",
            date: "15-16 de Maio/2027",
            description:
              "Laboratório vivo. Você prepara medicamentos, óleos, panaceias.",
            details: [
              "Extração e concentração de princípios ativos",
              "Preparo de Tailas (óleos), Ghritas (ghee), Kashayas (decocções) e Churnas (pós)",
              "Processos de cura térmica e conservação",
            ],
          },
        ],
      },
      {
        title: "Semestre 3",
        subtitle: "Domínio Terapêutico",
        modules: [
          {
            number: 11,
            title: "Caminhos de Tratamento e Estrutura de Atendimento",
            format: "Online",
            date: "10-11 de Julho/2027",
            description:
              "Como montar um plano terapêutico completo do zero.",
            details: [
              "Samprapti: 6 estágios de progressão da doença",
              "Protocolo de primeira consulta (anamnese à linha terapêutica)",
              "Raciocínio clínico para tratar a causa primária",
            ],
          },
          {
            number: 12,
            title: "Saúde da Mulher, Gestante e Bebê<br>\nProfª convidada Micheline Souza",
            format: "Online",
            date: "14-15 de Agosto/2027",
            description:
              "Ciclos femininos, gestação, pós-parto, cuidados infantis.",
            details: [
              "Ciclo menstrual pela ótica dos Doshas e Dhatus",
              "Garbhini Paricharya: cuidados mês a mês na gestação",
              "Sutika Paricharya (puerpério) e Bala Roga (pediatria básica)",
            ],
          },
          {
            number: 13,
            title: "Rasayanas (Rejuvenescimento) e Vajikaranas",
            format: "Online",
            date: "11-12 de Setembro/2027",
            description: "Longevidade, vitalidade, força reprodutiva.",
            details: [
              "Terapias de reconstrução celular, imunidade e longevidade (Rasayana)",
              "Saúde reprodutiva e vitalidade (Vajikarana)",
              "Protocolos Brimhana pós-purificação e resgate de Ojas",
            ],
          },
          {
            number: 14,
            title: "Diagnóstico Avançado (Nadi Pariksha e outros)",
            format: "Online",
            date: "02-03 de Outubro/2027",
            description:
              "Leitura de pulso, refinamento diagnóstico, sutilezas clínicas.",
            details: [
              "Nadi Pariksha: teoria e mecânica da leitura de pulso",
              "Cruzamento de anamnese, língua, fezes e pulso",
              "Resolução de casos reais complexos",
            ],
          },
          {
            number: 15,
            title: "Prática Clínica: Ambulatório e Encerramento",
            format: "Presencial SP",
            date: "06-07 de Novembro/2027",
            description:
              "Atendimento real. Casos reais. Você encerra como terapeuta.",
            details: [
              "Atendimento de pacientes reais sob supervisão",
              "Fechamento de diagnóstico e prescrição completa",
              "TCC e cerimonial de encerramento",
            ],
          },
        ],
      },
    ],
    cargaTitle: "Carga horária total: 400 horas certificadas",
    cargaItems: [
      "225 horas de aulas ao vivo (online + presencial)",
      "175 horas de atividades obrigatórias:",
      "→ 30h de questionários de avaliação (1 por módulo)",
      "→ 45h de prática pessoal (dinacharya e relatórios)",
      "→ 40h de leitura e pesquisa dirigida",
      "→ 30h de diário de evolução clínica e pessoal",
      "→ 30h de TCC (trabalho de conclusão de curso)",
    ],
    extrasTitle: "Você também recebe",
    extras: [
      { emoji: "🎯", text: "Motor de Teste de Dosha — Ferramenta profissional para seus pacientes" },
      { emoji: "🍲", text: "Guia completo de Alimentação e Nutrição Ayurvédica" },
      { emoji: "🌿", text: "Guia completo de Dravya Guna" },
      { emoji: "📋", text: "Protocolo de Atendimento Zero — Passo a passo para estruturar consultas" },
      { emoji: "👥", text: "Comunidade de Terapeutas do Portal — Estudos de caso, troca entre alunos, mentoria coletiva" },
      { emoji: "🎥", text: "Acesso vitalício às gravações" },
    ],
    closing:
      "Essa formação te prepara para atuar. De verdade. Não é teoria solta. Não é informação sem aplicação. É a base sólida para você se tornar terapeuta — com segurança, profundidade e autonomia.",
  },
  diferenciais: {
    title: "Por que esta formação é diferente",
    items: [
      {
        number: 1,
        title: "Você aprende com quem pratica — e ensina — há anos",
        body: "Edson Osorío não é só professor. É terapeuta ativo, com clínica real, pacientes reais, casos reais. Tudo o que você vai aprender aqui vem de 15 anos de prática clínica e mais de 13 anos de sala de aula.",
      },
      {
        number: 2,
        title: "Um professor do início ao fim",
        body: "Com exceção do módulo de Saúde da Mulher, que teremos nossa professora convidada Micheline Souza, todos os 15 módulos são conduzidos por Edson. Isso significa: coerência, linha condutora, profundidade sem lacunas. Você não vai ter que \"traduzir\" diferentes estilos de ensino ou juntar as peças sozinho.",
      },
      {
        number: 3,
        title: "Ayurveda prático, aplicável, para a realidade brasileira",
        body: "Aqui você aprende a filosofia que sustenta a prática — mas o foco está em te capacitar para atuar com segurança e eficácia. O curso é denso em fundamentos, mas cada conceito está conectado à aplicação clínica real. Você aprende para diagnosticar, tratar e transformar vidas.",
      },
      {
        number: 4,
        title: "Online + Presencial: o melhor dos dois mundos",
        body: "12 módulos online ao vivo — você estuda de casa, com interação em tempo real, sem perder finais de semana viajando. 3 imersões presenciais em São Paulo — nos momentos certos (prática de terapias, preparo de medicamentos, ambulatório clínico). Você tem profundidade teórica sem precisar viajar todo mês, e prática real nos momentos em que ela é essencial.",
      },
      {
        number: 5,
        title: "Vivência real, não apenas aulas gravadas",
        body: "A cada módulo, você recebe:",
        bullets: [
          "Cardápio prático para preparar em casa",
          "Rotina de dinacharya alinhada ao tema",
          "Experiências para fazer em conjunto com a turma",
        ],
      },
      {
        number: 6,
        title: "Infraestrutura completa de suporte",
        body: "Você não fica sozinho.",
        bullets: [
          "🎯 Acesso interno ao Portal Ayurveda — ferramenta profissional pronta",
          "🍲 Guia completo de Alimentação e Nutrição Ayurvédica",
          "🌿 Guia completo de Dravya Guna",
          "📋 Protocolo de Atendimento do Zero — estrutura pronta para consultas",
          "👥 Comunidade de terapeutas do Portal — troca, estudos de caso, mentoria coletiva",
        ],
      },
      {
        number: 7,
        title: "Você faz parte da primeira turma oficial",
        body: "Esta é a primeira turma de Terapeutas Ayurveda formada oficialmente pelo Portal Ayurveda. Mais de 3.000 alunos já fizeram o curso de Nutrição e Culinária. Mais de 1.000 já estudaram Dravya Guna. Mais de 500 já passaram pelo curso de Diagnóstico e Autocuidado. Agora chegou a hora da formação completa. E você pode ser um dos pioneiros.",
      },
    ],
  },
  professor: {
    name: "Edson Osorío",
    role: "Terapeuta Ayurveda | Professor | Fundador do Portal Ayurveda",
    photo:
      "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg",
    bullets: [
      "15 anos de prática clínica ativa",
      "13 anos de sala de aula",
      "Mais de 4.500 alunos formados em cursos de Nutrição, Dravya Guna, Diagnóstico e Rotinas",
      "Criador de conteúdo Ayurveda com milhares de seguidores e centenas de aulas públicas no YouTube",
    ],
    text: "Edson não ensina teoria pela teoria. Ele ensina o que funciona na clínica. Sua abordagem é direta, acolhedora, profunda — e totalmente focada em te dar as ferramentas para você sair daqui e atuar com segurança.",
  },
  investimento: {
    title: "Investimento",
    subtitle:
      "Esta formação custa menos do que você imagina — e vale mais do que qualquer outro investimento em saúde e carreira.",
    breakdownTitle: "Como funciona o pagamento",
    breakdown: [
      "💰 Módulos Online (12 meses): R$ 540/mês",
      "💰 Módulos Presenciais (3 meses): R$ 630/mês",
    ],
    total: "Investimento total: R$ 8.370 ao longo de 1,5 ano",
    condicoesTitle: "Condições especiais — 1º lote",
    condicoes: [
      "10% de desconto para pagamento à vista no PIX",
      "Garantia de vaga com desconto válido até 12 de junho de 2026",
      "Apenas 50 vagas disponíveis",
    ],
    condicoesNote: "Após 12 de junho, o valor volta ao preço cheio.",
    inclusoTitle: "O que está incluso",
    incluso: [
      "225 horas de aulas ao vivo (online + presencial)",
      "175 horas de atividades obrigatórias",
      "Acesso vitalício às gravações",
      "Motor de Teste de Dosha + Guia de Alimentação e Nutrição + Guia de Dravya Guna",
      "Protocolo de Atendimento Zero",
      "Comunidade de Terapeutas",
      "Certificação de 400 horas",
      "Cardápios, rotinas e experiências mensais",
    ],
    naoInclusoTitle: "O que não está incluso",
    naoIncluso: [
      "Hospedagem e alimentação nos módulos presenciais (você organiza sua estadia em SP)",
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        question:
          "Tenho medo de ser tarde demais. Consigo começar mesmo depois de aposentar?",
        answer:
          "Minha mãe vive Ayurveda comigo há 15 anos. Aos 75, ela fez o Caminho de Santiago de Compostela. Agora, aos 80, quer fazer de novo.\n\nNunca é tarde para viver o sonho. Ayurveda não tem prazo de validade. Quanto antes você começar, mais tempo terá para colher — e oferecer — os frutos.\n\nVocê vai colher frutos que te darão energia para trilhar suas maratonas e sonhos.",
      },
      {
        question:
          "Tenho medo de não conseguir aprender. Ayurveda parece muito complicado.",
        answer:
          "Parece complicado porque você vê o resultado pronto. Você me vê olhando uma língua e dando uma resposta precisa em segundos. Você vê as sacadas nas lives, os insights rápidos, a conexão entre subdoshas, digestão, excreção. Mas eu nem sempre soube isso. Eu aprendi passo a passo. Fundação, estrutura, prática. E é exatamente isso que você vai fazer aqui. Não é sobre ser genial. É sobre ter método, repetição, acompanhamento próximo. Eu te aponto por onde andar, e juntos vamos trilhar o caminho.",
      },
      {
        question: "Não tenho tempo para 1,5 ano de curso.",
        answer:
          "Entendo. Mas pensa comigo: você vai viver os próximos 1,5 anos de qualquer jeito. A pergunta é: você quer chegar ao final desse tempo do mesmo jeito que está hoje? Ou quer chegar certificado, capacitado, com segurança para atender pacientes e viver de Ayurveda? Os finais de semana são espaçados (4 a 5 semanas entre módulos). As aulas são gravadas. As atividades são integradas à sua rotina. Você não precisa parar sua vida. Você vai transformar sua vida.",
      },
      {
        question:
          "E se eu não conseguir acompanhar ou tiver que faltar em algum módulo?",
        answer:
          "Todas as aulas ficam gravadas e disponíveis. As aulas têm acesso vitalício. Se você perder um encontro ao vivo, assiste depois no seu tempo. Além disso, você tem a comunidade dos terapeutas, suporte contínuo e materiais completos para revisar sempre que precisar.",
      },
      {
        question: "Vou conseguir atender pacientes depois dessa formação?",
        answer:
          "Sim. Você vai sair daqui com técnica completa de Diagnóstico, montagem de plano terapêutico completo, prática de terapias corporais, preparo de receitas e medicamentos, protocolo de atendimento estruturado e ambulatório clínico com casos reais. Fora isso, toda a base estrutural de filosofia, doshas, subdoshas, e tudo mais que fundamenta a estrutura básica do Ayurveda para terapeutas. Você não vai sair só com teoria. Você sai pronto.",
      },
      {
        question: "Posso parcelar o pagamento?",
        answer:
          "Sim. As mensalidades são pagas mês a mês, conforme o módulo correspondente. Você também pode optar por pagamento à vista no PIX com 10% de desconto (válido até 12 de junho).",
      },
      {
        question: "Como funciona a certificação?",
        answer:
          "Ao concluir os 15 módulos e as 175 horas de atividades obrigatórias, você recebe o Certificado de Formação em Ayurveda — 400 horas, emitido pelo Portal Ayurveda.",
      },
    ],
  },
  finalCta: {
    title: "Esta é a sua chance",
    body: "Você já sabe que Ayurveda funciona. Você já experimentou na pele. Você já sentiu a diferença na saúde, na energia, na clareza.\n\nAgora é a hora de ir além. De sair de espectadora para protagonista. De deixar de ser paciente para se tornar terapeuta. De transformar sua própria vida — e a vida de outras pessoas.\n\nEsta é a primeira turma oficial de Terapeutas Ayurveda formada pelo Portal Ayurveda. São apenas 50 vagas. O desconto de 10% é válido até 12 de junho. A primeira aula começa em 12 de julho de 2026.",
    primaryCta: "Inscrições abrem início de maio",
    primarySub: "Apenas 50 vagas.",
    secondaryCta: "",
  },
};
