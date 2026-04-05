// Dravyaguna (Remedies) data for each dosha

export interface RemedyFoundation {
  emoji: string;
  title: string;
  description: string;
}

export interface RemedyCard {
  badge: string;
  badgeEmoji: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
}

export interface RemedyAlert {
  emoji: string;
  title: string;
  text: string;
  extraText?: string;
}

export interface RemedyMeasure {
  title: string;
  text: string;
}

export interface DoshaRemediesData {
  heroSubtitle: string;
  heroTagline: string;
  heroDescription: string;
  foundationTitle: string;
  foundations: RemedyFoundation[];
  grimoryTitle: string;
  grimorySubtitle: string;
  remedies: RemedyCard[];
  tipBlock: {
    emoji: string;
    title: string;
    text: string;
    extraText?: string;
  };
  alertBlock: RemedyAlert;
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaLink: string;
  // Kapha-specific
  journeySteps?: { step: number; title: string; text: string }[];
  measures?: RemedyMeasure[];
  habitBlock?: { title: string; subtitle: string; text: string; extraText: string };
  cutList?: string[];
}

export const vataRemediesData: DoshaRemediesData = {
  heroSubtitle: "Dravyaguna (Ciência das Substâncias)",
  heroTagline: "Alquimia e Aterramento\npara preencher o Vazio",
  heroDescription: "Vata é leve, frio, seco e móvel. A cura não é apenas \"dar ervas\", é preencher o espaço com substâncias densas, úmidas e aquecidas que contenham o movimento desordenado.",
  foundationTitle: "As Três Bases de Sustentação",
  foundations: [
    { emoji: "🌻", title: "1. Oleação Tática", description: "Utilizamos o Óleo de Girassol morno para selar o ressecamento, protegendo a pele e aprofundando o repouso." },
    { emoji: "☕", title: "2. Veículos Picantes e Leitosos", description: "O leite cozido com especiarias aquece e nutre, servindo de transporte para as ervas chegarem nos tecidos profundos." },
    { emoji: "🍯", title: "3. Pastas e Xaropes", description: "Preparos aderentes e densos que \"grudam\" nas mucosas, gerando umidade imediata onde o ar gerou secura." },
  ],
  grimoryTitle: "Grimório de Preparos Reais",
  grimorySubtitle: "Receitas anti-vata focadas em untuosidade, calor e densidade.",
  remedies: [
    { badge: "O Selo de Proteção", badgeEmoji: "🌻", title: "Óleo de Girassol Morno", subtitle: "Excelente para umectar sem sobrecarregar. Ideal para o outono e tempos secos.", description: "", details: ["Ação (Umbigo): 5 gotinhas mornas todas as noites. Aterra o corpo e reduz a ansiedade noturna.", "Dica Avançada: Cozinhar com ervas como Ashwagandha torna este óleo uma ferramenta super medicinal para os ossos."] },
    { badge: "O Melhor Veículo", badgeEmoji: "☕", title: "Chai (Picante e Leitoso)", subtitle: "O leite atua como o veículo que sustenta, enquanto as especiarias picantes organizam a digestão e \"tiram o peso ruim\" do laticínio.", description: "", details: ["Preparo: Metade leite gordo, metade água, gengibre, cravo, canela e cardamomo. Adicione uma colher de Ghee no final."] },
    { badge: "Pasta de Agni", badgeEmoji: "🫚", title: "Gengibre, Ghee e Mascavo", subtitle: "Uma forma concentrada e aderente que combina o calor do gengibre com a untuosidade do Ghee e o aterramento do mascavo.", description: "", details: ["Uso: Uma colherzinha em jejum ou antes do almoço para estabilizar o fogo digestivo irregular."] },
    { badge: "Melado Curativo", badgeEmoji: "🍯", title: "Xarope de Gengibre", subtitle: "A redução de água com açúcar faz os ingredientes \"grudarem na região\", diminuindo o esforço do Agni para nutrir as mucosas.", description: "", details: ["Ação: Lubrificante direto para as mucosas da respiração e digestão. Resolve ressecamento de pele de dentro para fora."] },
    { badge: "Poção do Sono", badgeEmoji: "🌸", title: "Leite, Água e Jasmim", subtitle: "Ferva metade leite, metade água, jasmim e uma pitada de sal. Aterra a mente e favorece o repouso profundo.", description: "", details: ["Uso: Tomar morno, meia hora antes de deitar. Sedosidade e contenção absoluta."] },
    { badge: "Alquimia do Respiro", badgeEmoji: "🌬️", title: "Nasya com Ghee", subtitle: "Pingar duas gotinhas de Ghee morno em cada narina antes de dormir.", description: "", details: ["Dica: Aqueça o frasco conta-gotas junto ao corpo por meia hora antes de usar para atingir a temperatura ideal."] },
  ],
  tipBlock: {
    emoji: "🍲",
    title: "Quando o Vata agrava: Prefira a Comida ao Chá",
    text: "Se o Vata está muito alto (gases, frio, insônia), um chá simples não resolve, pois é apenas \"água com efeito de planta\" e Vata é vazio. O que trata Vata é o Preenchimento.",
    extraText: "Canjas untuosas, purês quentes, arroz doce com especiarias e caldos densos são as verdadeiras poções de cura.",
  },
  alertBlock: {
    emoji: "⚠️",
    title: "O Perigo dos \"Remédios Secos\"",
    text: "Cuidado ao usar ervas secas e comprimidos de forma isolada. Todo prensado é, por natureza, leve, frio e seco — exatamente os atributos que agravam o Vata. Sem um veículo (Anupana) adequado, você está apenas colocando mais \"secura\" para dentro. Para Vata, o melhor anupana do mundo é o Chai.",
  },
  ctaTitle: "A Alquimia Magistral em um Frasco",
  ctaText: "Unimos o veículo correto e as especiarias de aterramento em formulações clínicas desenvolvidas para o dia a dia. Conheça a linha Anti-Vata da Samkhya.",
  ctaButtonText: "Explorar na Samkhya",
  ctaLink: "https://samkhya.com.br",
};

export const pittaRemediesData: DoshaRemediesData = {
  heroSubtitle: "Dravyaguna (Ciência das Substâncias)",
  heroTagline: "Táticas Alquímicas\npara acalmar o Fogo",
  heroDescription: "Pitta é quente, penetrante e ácido. A alquimia aqui não é sobre estimular, mas refrescar, alcalinizar e conter a penetrabilidade do fogo nos tecidos e no sangue.",
  foundationTitle: "As Leis do Resfriamento",
  foundations: [
    { emoji: "🚫", title: "1. Banimento Ácido", description: "A retirada imediata de dravyas que fermentam e aquecem o sangue, como vinagre e tomate." },
    { emoji: "🛡️", title: "2. Escudo de Mucosa", description: "Iniciar com o sabor doce para criar uma armadura gástrica antes da liberação enzimática." },
    { emoji: "🌿", title: "3. O Freio Amargo", description: "Encerrar a refeição com amargos para purificar a bile e sinalizar saciedade ao cérebro." },
  ],
  grimoryTitle: "Elixires de Pacificação",
  grimorySubtitle: "Substâncias que estabilizam o Tikshnagni (fogo agudo) e protegem o sistema.",
  remedies: [
    { badge: "O Antídoto de Bile", badgeEmoji: "🥛", title: "Buttermilk com Coentro e Tâmara", subtitle: "O melhor anupana para Pitta. Antiácido, nutritivo e purificador.", description: "", details: ["Preparo: Batido morno com coentro fresco, tâmara e uma pitada de sal do Himalaia. Tomar 3 a 4 vezes por semana.", "Ação: Promove a limpeza da \"bile tóxica\" no intestino, alcalinizando o sistema."] },
    { badge: "O Escudo de Ghee", badgeEmoji: "🥣", title: "Sneha Interno e Local", subtitle: "O Ghee é doce e frio, sendo o estabilizador ideal para Pittas ácidos e irritados.", description: "", details: ["Uso Oral: 1 colher de sopa dividida entre as refeições.", "Uso Tático: Em caso de irritação anal por bile, aplicar algodão com Ghee no local antes de dormir."] },
    { badge: "Grãos de Estabilidade", badgeEmoji: "🍚", title: "Arroz Basmati ou Branco", subtitle: "Fuja do arroz integral. As camadas extras exigem mais acidez e agravam o calor.", description: "", details: ["Por que: Arroz branco é doce e refrescante para os tecidos, mantendo a digestão leve e sem esforço ácido."] },
    { badge: "Resiliência de Raiz", badgeEmoji: "🥔", title: "Mandioca com Manteiga Doce", subtitle: "Pitta é penetrante e precisa de alimentos \"pesados e resistentes\" para conter sua ação.", description: "", details: ["Lógica: A densidade da mandioca segura a penetrabilidade do fogo nos tecidos sensíveis."] },
    { badge: "O Alerta Magistral", badgeEmoji: "⚠️", title: "Cúrcuma e Gengibre", subtitle: "Nem todo \"anti-inflamatório\" serve para Pitta. Cúrcuma e gengibre são quentes e secos.", description: "", details: ["Atenção: Se você já está seco e ácido, o uso excessivo dessas ervas pode \"queimar\" ainda mais o sistema."] },
    { badge: "Água de Coentro", badgeEmoji: "🌿", title: "O Refresco Simples", subtitle: "Um recurso básico e extremamente eficaz para reduzir irritações e inflamações rápidas.", description: "", details: ["Uso: Infusão fria de sementes ou folhas para purificar o Pitta ao longo do dia."] },
  ],
  tipBlock: {
    emoji: "🥗",
    title: "A Ordem Altera a Cura",
    text: "Não comece com a salada. O amargo e o frio chocam o Agni Pitta no início.",
    extraText: "Comece com uma tâmara (doce) para proteger a mucosa. Use as folhas amargas (rúcula/agrião) apenas no final para encerrar a produção enzimática e purificar o sangue.",
  },
  alertBlock: {
    emoji: "🥛",
    title: "O Paradoxo do Estímulo",
    text: "Não adianta ser Pitta e buscar mais estímulo; você já é estimulado por natureza. O desafio é controlar o desejo por sabores agressivos e suplementos \"quentes\". Para resfriar e nutrir sem apagar o fogo, o seu Anupana supremo é o Buttermilk (Lassi).",
  },
  cutList: [
    "Vinagre / Tomate",
    "Embutidos / Enlatados",
    "Pimentas Fortes",
    "Crustáceos",
    "Shoyu / Cogumelos",
  ],
  ctaTitle: "A Alquimia da Purificação",
  ctaText: "Desenvolvemos formulações clínicas para pacificar a acidez e purificar o sangue sem apagar o fogo harmonioso. Conheça a linha Anti-Pitta da Samkhya.",
  ctaButtonText: "Explorar na Samkhya",
  ctaLink: "https://samkhya.com.br",
};

export const kaphaRemediesData: DoshaRemediesData = {
  heroSubtitle: "Dravyaguna (Ciência das Substâncias)",
  heroTagline: "Alquimias de Desobstrução\npara agitar a Inércia",
  heroDescription: "Kapha tende ao peso, densidade e adesão. No nível avançado de Dravyaguna, nossa missão não é apenas \"emagrecer\", mas sim ignizar o metabolismo e remover o muco que obstrui estômago e pulmões.",
  foundationTitle: "As Alavancas de Transformação",
  foundations: [
    { emoji: "🔥", title: "1. Ignis (O Motor)", description: "Incorporar especiarias motoras (pimenta, cravo, canela) para agitar o metabolismo antes mesmo de retirar os alimentos pesados." },
    { emoji: "🍯", title: "2. Lekhana (Raspagem)", description: "O mel e os dravyas amargos raspam a gordura e a umidade \"pegajosa\" aderida nos tecidos profundos." },
    { emoji: "🚿", title: "3. Shodhana (Limpeza)", description: "Usar banhos quentes, jejuns e pular refeições estratégicas para fluidificar e expulsar o muco estagnado." },
  ],
  journeySteps: [
    { step: 1, title: "Sede Primária: Estômago", text: "Comer volumes que você não é capaz de digerir gera muco imediato no estômago. Este é o depósito inicial que alimenta a obesidade, o enjoo matinal e a letargia sistêmica." },
    { step: 2, title: "Sede Secundária: Pulmão", text: "Quando o acúmulo no plasma se prolonga, o pulmão vira o depósito de escape. Gripes e tosses são mecanismos de defesa para expulsar esse excesso de Kapha do sangue." },
  ],
  grimoryTitle: "Grimório de Preparos Reais",
  grimorySubtitle: "Receitas anti-kapha focadas em termogênese, secagem e fluidez.",
  remedies: [
    { badge: "A Sopa da Cura", badgeEmoji: "🥣", title: "Arroz, Assafétida e Gengibre", subtitle: "A refeição leve definitiva para quando o corpo está congestionado por gripe ou excesso de muco pulmonar.", description: "", details: ["Ação: Favorece a filtração de toxinas do plasma e ajuda o pulmão a expulsar o Kapha excedente sem \"jogar lenha\" na fogueira."] },
    { badge: "A Pasta Motor", badgeEmoji: "🌶️", title: "Trikatu Concentrado com Mel", subtitle: "Pimenta-do-reino, gengibre e cravo em pó. O mel serve como veículo adstringente que cristaliza e desidrata o muco.", description: "", details: ["Uso: Tomar três vezes ao dia junto às refeições até que a sensação de peso e o empanzinamento linfático diminuam."] },
    { badge: "Solvente Matinal", badgeEmoji: "🍋", title: "Água Morna, Limão e Panaceia", subtitle: "Mobiliza as toxinas (ama) acumuladas à noite, combatendo a letargia, a melancolia e o enjoo matinal.", description: "", details: ["Regra de Ouro: Use sempre separado das refeições para não diluir o fogo digestivo. Se for suco matinal, evite raízes durante crises de muco."] },
    { badge: "Alerta de Mistura", badgeEmoji: "⚠️", title: "Erro Pesado vs Frio", subtitle: "Evite o erro clássico de misturar ovos (pesados) com frutas (frias e leves) pela manhã.", description: "", details: ["Correção: Essa mistura gera muco imediato. Se precisar consumir, aqueça e use especiarias para equilibrar a digestão Kapha-Vata."] },
  ],
  measures: [
    { title: "1. A Qualidade do Suor", text: "O fleuma se reflete no plasma e na linfa. O tratamento está funcionando quando o seu suor deixa de ser \"mucoso e pegajoso\", sinalizando que a estagnação sistêmica está sendo descolada." },
    { title: "2. A Mente e a Disposição", text: "A letargia de Kapha é um sintoma metabólico, não moral. Quando o Agni acende, a melancolia e a dificuldade de levantar desaparecem junto com o muco." },
  ],
  habitBlock: {
    title: "O Hábito que Cura o Kapha",
    subtitle: "A Regra dos 100 Passos",
    text: "Comer e dormir, ou comer por horário sem fome real, são as formas mais rápidas de entupir o corpo. Não existe fórmula que compense a inércia pós-refeição.",
    extraText: "O ideal é comer e caminhar imediatamente. Isso funciona como a alavanca mecânica que impede que o alimento se transforme em acúmulo no estômago.",
  },
  tipBlock: {
    emoji: "🚫",
    title: "O Gerador de Adesão",
    text: "Evite reaquecer alimentos pesados (massas, queijos, carnes) no micro-ondas. Esse processo aumenta a mucosidade e a \"cola\" dessas substâncias no estômago, sobrecarregando o Agni e gerando obesidade.",
    extraText: "Dica Avançada: Em casos de Agni fraco, é melhor adicionar especiarias-motor (pimenta, cravo, canela) antes de retirar o pesado, garantindo que o corpo não fique ainda mais frio e letárgico durante a transição.",
  },
  alertBlock: {
    emoji: "🚫",
    title: "O Gerador de Adesão",
    text: "Evite reaquecer alimentos pesados (massas, queijos, carnes) no micro-ondas. Esse processo aumenta a mucosidade e a \"cola\" dessas substâncias no estômago, sobrecarregando o Agni e gerando obesidade.",
  },
  ctaTitle: "A Alquimia da Desobstrução",
  ctaText: "Utilizamos especiarias motoras e veículos adstringentes em formulações clínicas para descolar o muco e reduzir a obesidade sistêmica. Conheça a linha Anti-Kapha da Samkhya.",
  ctaButtonText: "Explorar na Samkhya",
  ctaLink: "https://samkhya.com.br",
};
