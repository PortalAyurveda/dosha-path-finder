import DoshaRoutinePage from "@/components/dosha/DoshaRoutinePage";

const clockSegments = [
  { label: "12h", dosha: "Pitta", color: "text-pitta" },
  { label: "14h", dosha: "Vata", color: "text-vata" },
  { label: "18h (Início Kapha)", dosha: "Kapha", color: "text-kapha", highlight: true },
  { label: "22h (Fim Kapha)", dosha: "Pitta", color: "text-pitta", highlight: true },
  { label: "00h", dosha: "Pitta", color: "text-pitta" },
  { label: "02h", dosha: "Vata", color: "text-vata" },
  { label: "06h (Início Kapha)", dosha: "Kapha", color: "text-kapha", highlight: true },
  { label: "10h (Fim Kapha)", dosha: "Pitta", color: "text-pitta", highlight: true },
];

const principles = [
  {
    icon: "🏃🏽‍♂️",
    title: "A Rotina-Mãe: Não Estagnar",
    text: "Kapha precisa manter o movimento do corpo para garantir a eliminação constante. Quando Kapha não elimina os dejetos, ele engorda e obstrui os canais (srotas). A rotina não pode admitir letargia prolongada no sofá ou na cama.",
  },
  {
    icon: "🌶️",
    title: "Temperar é Obrigatório",
    text: "Em vez de encher o prato com muito alimento, o foco do Kapha deve estar nas especiarias (termogênese). O alimento entra apenas para saciar, enquanto as especiarias entram como ação medicinal para ajudar na queima de toxinas (ama).",
  },
  {
    icon: "🍽️",
    title: "Comer para Saciar, não para Encher",
    text: "A rotina alimentar correta é a moderação. Comer apenas o suficiente para acalmar a fome. O excesso para Kapha vira retenção, peso e lentidão quase instantaneamente. Evite refeições volumosas e alimentos pesados como queijos, massas e raízes em excesso.",
  },
  {
    icon: "🚫",
    title: "Evitar os Hábitos Frios",
    text: "Corte da rotina: alimentos de geladeira, comer sem fome real e ingredientes ácidos ou produtores de muco (como vinagre, tomate, berinjela, embutidos e cogumelos). O uso constante da masala anti-kapha nas refeições é a melhor defesa.",
  },
];

const timeline = [
  {
    icon: "🌅",
    title: "Quebrando a Inércia",
    time: "05h30 às 06h00",
    steps: [
      { icon: "⏰", text: "Antecipe o Horário Pesado: Pessoas com agravamento de Kapha devem, de forma terapêutica, levantar antes das 06h (horário em que a energia de estagnação começa e a cama pesa como lenha). Jejum e monodieta leve pela manhã são ótimos recursos para evitar a inércia digestiva." },
      { icon: "💧", text: "A Panaceia Diária: Começar o dia com um copo de água morna é uma prática excelente. Para Kapha, água morna com limão ou o uso da panaceia (uma colher de sopa de panaceia separada das refeições para não diluir o Agni) ajuda a eliminar ama logo cedo." },
      { icon: "🍯", text: 'A Adstringência do Mel: O mel, diferentemente dos outros doces, tem caráter adstringente. Ele tende a "secar e cristalizar", ajudando a reduzir a umidade excessiva nos tecidos do Kapha quando consumido em água morna.' },
    ],
  },
  {
    icon: "🔥",
    title: "Fogo, Termogênese e Os 100 Passos",
    time: "12h00 às 13h30",
    steps: [
      { icon: "🍵", text: "Acelerador de Fome: O Kapha deve garantir que tem fome. Usar o Madhu Anti-Kapha na hora do almoço melhora a capacidade digestiva. Um cálice de vinho antes da refeição também funciona maravilhosamente para aquecer o trato gastrointestinal." },
      { icon: "🌶️", text: "Refeição Leve e Temperada: Esqueça o exagero. O prato deve ser bem condimentado com sabores picantes e adstringentes. Se tiver massas pesadas (lenha), é obrigatório o uso de muita pimenta para evitar estagnação." },
      { icon: "🚶🏽‍♂️", text: "A Disciplina Fixa (100 Passos): É vital: após comer, jamais durma ou sente no sofá. Fazer os 100 passos da digestão (10 minutos de caminhada leve) impede que o fogo apague e que a refeição se torne um bloco de estagnação." },
    ],
  },
  {
    icon: "☕",
    title: "Tarde Quente e Picante",
    time: "16h00",
    steps: [
      { icon: "🍵", text: "O Lanche Funcional: Se houver fome, por volta das 16h é recomendado um lanche picante. Bebidas quentes (gengibre, erva-doce, canela e cravo) são indicadas." },
      { icon: "🔥", text: "Esquentando o Sistema: Duas doses diárias de chá de semente de mostarda com erva-doce e canela ajudam a manter o Kapha aquecido até o fim do dia." },
    ],
  },
  {
    icon: "🏡",
    title: "Nutrição Leve e Sono",
    time: "18h às 22h",
    steps: [
      { icon: "🥣", text: "Fome Estrutural: A vontade de colo e o peso natural das 18h pedem nutrição, mas o jantar não deve gerar muco. Uma sopa quente, leve e muito bem temperada é a melhor saída para entregar conforto sem inflamar o dosha." },
      { icon: "🛌", text: "Recolhimento Ativo: Mesmo no horário de conforto, lembre-se: comer e ir direto dormir é destrutivo. Dê tempo para a digestão antes de deitar às 22h, evitando que o sono crie acúmulos pesados no dia seguinte." },
    ],
  },
];

const HorariosKapha = () => (
  <DoshaRoutinePage
    dosha="kapha"
    emoji="🪨"
    heroTitle="Rotina para Kapha: O Movimento"
    heroDescription='Boas rotinas para o dosha Kapha são aquelas que criam movimento, aumentam o Agni e diminuem a estagnação. Kapha tende a ficar pesado, denso, frio, mucoso e com a digestão entorpecida quando a vida entra no modo "parado". O eixo é sempre o mesmo: termogênese e fluidez.'
    clockLabel="Ciclo Kapha"
    clockSubtitle="Estímulo Físico"
    clockSegments={clockSegments}
    principlesTitle="Princípios de Ouro do Kapha 🌐"
    principlesSubtitle='A regra é quebrar a inércia. Kapha tem grande capacidade de absorver e reter, então a rotina deve impedir o padrão de "comer e sentar".'
    principles={principles}
    timelineTitle="A Jornada do Dinacharya Kapha"
    timelineSubtitle='Um guia cronológico focado em estimular o Agni e "secar" a umidade logo no início do dia.'
    timeline={timeline}
    metaTitle="Rotina para Kapha: O Guia do Dinacharya"
    metaDescription="Guia profundo de rotinas diárias específicas para apaziguar o dosha Kapha, trazendo movimento, termogênese e leveza."
  />
);

export default HorariosKapha;
