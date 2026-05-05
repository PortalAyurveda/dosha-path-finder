import type { CourseData } from "./courseTypes";

export const alimentacaoData: CourseData = {
  meta: {
    slug: "alimentacao",
    title: "Curso de Alimentação Ayurveda | Portal Ayurveda",
    description:
      "Aprenda a Lógica da Alimentação Ayurveda em 60+ aulas. Sistema completo com Tutor de IA, receitas terapêuticas e certificado de 40h.",
  },
  branding: {
    logo: "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-alimentacao-extenso.svg",
    primaryColor: "#A8E6CF",
    darkColor: "#3F8F66",
    lightColor: "#D4F1E0",
    accentColor: "#3F8F66",
    warmBg: "#FAF9F6",
  },
  hero: {
    headline: "Você não precisa de mais informação sobre dieta.",
    subheadline: "Você precisa de uma ESTRUTURA para organizar a bagunça.",
    description:
      "Pare de depender de cardápios prontos que não duram uma semana. Aprenda a Lógica da Alimentação Ayurveda para montar a rotina da sua casa, ganhar autonomia e ter um Tutor de IA Pessoal para tirar dúvidas 24h.",
    priceOld: "De R$ 697",
    priceNew: "Por R$ 397",
    accessYears: "2 ANOS de acesso",
    ctaText: "QUERO O CAMINHO CERTEIRO",
  },
  problem: {
    title: "Quanto já custou não saber escolher?",
    intro:
      "Você sabe muito sobre 'comida saudável'. Leu livros. Seguiu nutricionistas. Testou dietas.\n\nE ainda acorda com o intestino preso. Ainda sente aquele cansaço que café não resolve. Ainda olha pro prato e pensa: 'será que isso é bom pra mim?'\n\nO problema nunca foi falta de informação. O problema é que ninguém te ensinou o SISTEMA.",
    bullets: [
      "Salada crua à noite piora sua ansiedade",
      "Iogurte com granola te deixa constipado",
      "Shot de própolis quando você tem febre aumenta a inflamação",
      "Aquela 'dieta saudável' da internet te fez inchar em vez de emagrecer",
    ],
    closing:
      "Você não está errando por falta de esforço. Você está errando porque está jogando sem as regras do jogo.",
  },
  solution: {
    title: "A diferença entre tentar e acertar",
    description:
      "Neste curso, você não recebe um cardápio. Você recebe um Sistema de Decisão. Você vai aprender a olhar para qualquer alimento e saber exatamente o que ele fará no SEU corpo.",
    benefits: [
      {
        iconName: "Brain",
        title: "A Base (O curso completo)",
        text: "Você vai entender a lógica. Por que misturar fruta com leite inflama? Por que salada à noite causa ansiedade? Você aprende a ler seu corpo como um mapa.",
      },
      {
        iconName: "Sparkles",
        title: "A Aplicação (IA 24h)",
        text: "Tutor de IA treinado com 15 anos de conteúdo. Testado por 800 alunos. 17.000 mensagens. Zero erros. É como ter o professor no seu bolso.",
      },
      {
        iconName: "Target",
        title: "Assertividade vs Tentativa",
        text: "Você nunca mais trava na hora de decidir o que comer. Sistema próprio, autonomia real, resultados consistentes.",
      },
    ],
  },
  modules: {
    title: "O que você vai aprender",
    modules: [
      {
        number: 1,
        title: "Desvendando seu Código Único",
        description:
          "Pare de lutar no escuro. Você vai entender profundamente o que são os Doshas (Vata, Pitta, Kapha), os Gunas (estados mentais) e as fases da vida. É o mapa para entender quem você é — e por que aquela dieta que funcionou pro seu amigo te fez passar mal.",
      },
      {
        number: 2,
        title: "A Mecânica da Digestão",
        description:
          "Você vai aprender sobre Agni (seu fogo digestivo) e Ama (toxinas). Entenda finalmente por que você estufa, por que tem gases, por que sente peso após comer. Aqui você descobre a raiz da saúde e da doença.",
      },
      {
        number: 3,
        title: "A Química dos Sabores e Antídotos",
        description:
          "A parte mais poderosa. Aprenda a usar os 6 Sabores para modular sua saúde. Descubra os Antídotos: o segredo para 'corrigir' um alimento que teoricamente faria mal ao seu Dosha, usando as especiarias certas.",
        highlights: [
          "Você não precisa ser radical",
          "Pode comer porcaria — sabendo como remediar",
          "Sistema de sabores completo",
        ],
      },
      {
        number: 4,
        title: "Cozinha Terapêutica (Mão na Massa)",
        description: "Aulas práticas filmadas na cozinha.",
        highlights: [
          "Receitas Anti-Vata: Para acalmar, aterrar e nutrir",
          "Receitas Anti-Pitta: Para refrescar, desinflamar e acalmar",
          "Receitas Anti-Kapha: Para secar, estimular e ativar",
          "Receitas Tradicionais: Ghee, Chapati, Lassi, Kitchari, Massalas e Panacéias",
        ],
      },
      {
        number: 5,
        title: "Acervo de Mentorias (O Aprofundamento)",
        description:
          "Acesso liberado às gravações das nossas melhores aulas ao vivo: Rotinas Sazonais • Psicologia da Alimentação • Estudos de Caso reais • Ganho de massa muscular • Perda de peso saudável • Superalimentos • Dietas para longevidade • Cuidados para mulheres • Alimentação para doenças virais",
        highlights: [
          "São + de 60 aulas completas",
          "Do fundamento filosófico até a panela no fogão",
        ],
      },
    ],
  },
  bonus: {
    title: "O que mais você leva",
    included: [
      "Curso Completo de Alimentação com 2 anos de acesso",
      "Tutor de IA Pessoal — Constrói seu tratamento e tira dúvidas 24h",
      "Certificado de Curso Livre com 40 horas de aula",
      "Material com receitas pronto para impressão",
      "Aulas completas para iniciantes — você nunca ouviu falar de Ayurveda? Perfeito.",
      "Aulas profundas para especialistas — nutricionistas e médicos usam como especialização",
    ],
    bonuses: [
      {
        iconName: "Calendar",
        title: "Curso completo de Rotinas Diárias do Ayurveda",
      },
      {
        iconName: "Heart",
        title: "Mindful Eating com Dr. Ricardo Balsimeli",
      },
      {
        iconName: "Users",
        title:
          "Acesso à comunidade no WhatsApp com alunos ativos trocando receitas e resultados",
      },
    ],
  },
  pricing: {
    priceOld: "R$ 697",
    priceNew: "R$ 397,00",
    installments: "12x de R$ 39,62",
    highlight: "R$ 16 por mês para ter um sistema que funciona",
    ctaText: "QUERO ENTRAR AGORA",
    guarantee:
      "Garantia de 7 dias: Você pode acessar tudo, assistir as aulas, imprimir o certificado. Se não se adaptar, devolvemos 100% do valor. Simples assim.",
  },
  testimonials: [
    {
      highlight: "A constipação de anos sumiu",
      quote:
        "Eu achava que era normal ir ao banheiro 2x na semana. Com as receitas Anti-Vata e a lógica das combinações, meu intestino funciona todo dia. A IA me ajudou a ajustar o jantar e foi tiro e queda.",
      name: "Marlene G.",
    },
    {
      highlight: "Vivi à base de omeprazol por anos",
      quote:
        "Achava que meu estresse era por conta do trabalho. O curso me mostrou que era excesso de calor no corpo (Pitta). Aprendi a usar os alimentos certos para 'esfriar' meu sistema. Em 20 dias, a azia sumiu, minha pele limpou e hoje durmo tranquila.",
      name: "Fernanda L.",
    },
    {
      highlight: "Finalmente entendi tudo que estudei antes",
      quote:
        "Só vim a compreender tudo que estudei no meu curso de formação quando conheci o prof. Edson e estudei essa base da alimentação. Foi quando entendi a potência da Ayurveda, muito além da dieta. Criei um olhar pra vida. Cuido de mim e de meus pais.",
      name: "Fernando C.",
    },
    {
      highlight: "Dores articulares e artrite — eu mal caminhava",
      quote:
        "Tenho 68 anos. Aprendi a usar as especiarias certas para 'tirar o frio' dos ossos. Hoje faço minhas caminhadas sem dor. O curso me devolveu a autonomia.",
      name: "Roberta B.",
    },
    {
      highlight: "Me sentia pesada, lenta, nada funcionava para emagrecer",
      quote:
        "O curso me ensinou que eu precisava 'acender' meu metabolismo, e não passar fome. As especiarias certas tiraram aquele inchaço todo e hoje acordo com disposição real, sem aquela preguiça eterna, inclusive comendo bem.",
      name: "Cláudia S.",
    },
  ],
  audience: {
    title: "Para quem é esse curso?",
    audiences: [
      {
        title: "Para o iniciante absoluto",
        description: "Nunca ouviu falar de Ayurveda e quer resultado",
      },
      {
        title: "Para quem 'já sabe um pouco'",
        description:
          "Mas sente que o conhecimento está bagunçado e precisa de lógica para conectar os pontos",
      },
      {
        title: "Para quem quer especialização",
        description: "Nutricionistas e médicos buscando refinamento nos atendimentos",
      },
      {
        title: "Para quem cuida da família",
        description: "Mães, pais, cuidadores que decidem o que entra na mesa de casa",
      },
    ],
  },
  professor: {
    name: "Edson Osorio",
    photo:
      "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg",
    bio: [
      "Sou terapeuta e professor há 15 anos, com mais de 6.000 alunos formados neste curso.",
      "Eu não gosto de truques. Eu entrego tudo que você necessita e ilumino seu caminho. A conquista é certa — basta você trilhar sua jornada pessoal de evolução.",
      "Fui diagnosticado com TDAH cedo e recusei aceitar que viveria à base de remédios. O Ayurveda foi minha cura.",
      "Pesava 54kg com 1,74m. Hoje peso 72kg. Transformei essa busca pessoal em um método organizado para brasileiros.",
      "Ayurveda mudou minha vida em 2009 por um teste de dosha que fiz em uma folha de caderno copiada da internet. Desde então dedico minha vida a estudar e compreender como usar esse conhecimento ao máximo.",
      "Agora disponível para você.",
    ],
  },
  finalCta: {
    headline: "Ayurveda é para todo mundo. E todo mundo merece conhecer Ayurveda.",
    subheadline:
      "Você pode esperar mais um mês. Pode testar mais uma dieta da moda. Pode continuar acumulando informação sem estrutura. Ou você pode escolher o caminho certeiro agora.",
    priceNew: "",
    installments: "",
    highlight: "",
    ctaText: "QUERO TRILHAR O CAMINHO CERTEIRO",
  },
  footer: {
    tagline: "Ayurveda é para todo mundo. E todo mundo merece conhecer Ayurveda.",
    phone: "(11) 99807-6111",
    email: "contato@portalayurveda.com",
    instagram: "@edson_ayurveda",
  },
  checkoutUrl: "#checkout",
};
