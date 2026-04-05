import DoshaRoutinePage from "@/components/dosha/DoshaRoutinePage";

const clockSegments = [
  { label: "12h (Pico Pitta)", dosha: "Pitta", color: "text-pitta", highlight: true },
  { label: "14h (Fim Pitta)", dosha: "Vata", color: "text-vata", highlight: true },
  { label: "18h", dosha: "Kapha", color: "text-kapha" },
  { label: "22h (Início Pitta)", dosha: "Pitta", color: "text-pitta", highlight: true },
  { label: "00h (Meia-noite)", dosha: "Pitta", color: "text-pitta" },
  { label: "02h (Fim Pitta)", dosha: "Vata", color: "text-vata", highlight: true },
  { label: "06h", dosha: "Kapha", color: "text-kapha" },
  { label: "10h (Início Pitta)", dosha: "Pitta", color: "text-pitta", highlight: true },
];

const principles = [
  {
    icon: "🚫",
    title: "Evitar Ácidos e Picantes Extremos",
    text: "Como hábito diário, corte itens que estimulam demais a digestão e irritam o intestino, levando à perda de energia. Evite transformar em rotina: vinagre, tomate, pimentão, berinjela, conservas, enlatados, embutidos, azeite (que é ácido), pimenta malagueta, pimenta-do-reino e calabresa.",
  },
  {
    icon: "🎨",
    title: "Variedade com Critério",
    text: "Pitta não precisa ir para monodieta de restrição total. Pratos coloridos e dietas variadas são muito adequados porque o fogo digestivo do Pitta dá conta. A boa rotina não é restringir por medo, é variar mantendo as travas de \"sem ácido e sem picante extremo\".",
  },
  {
    icon: "🥗",
    title: "Composição Sazonal (70/30)",
    text: "Pitta lida bem com alimentos crus, mas a rotina pede ajuste. No verão intenso, a proporção ideal no prato é cerca de 70% cozido e 30% cru. Se o clima esfriar, priorize 100% cozido ou refogue a salada para não aumentar o estresse térmico.",
  },
  {
    icon: "🛡️",
    title: "A Ordem Fisiológica dos Sabores",
    text: "Essa é a maior estratégia tática: não comece a refeição com a salada fria ou amarga. Use e abuse do sabor doce antes das refeições (para proteger a mucosa) e do sabor amargo no final (para fechar as enzimas e gerar saciedade).",
  },
];

const timeline = [
  {
    icon: "🌅",
    title: "Prevenção Matinal",
    time: "Por volta das 10h",
    steps: [
      { icon: "🛡️", text: "Proteção Contraintuitiva: Para combater a azia que costuma estourar ao meio-dia, o tratamento deve ser feito às 10h da manhã (quando o Pitta está começando a subir, e não no seu pico). Utilizar o Madhu Anti-Pitta neste momento prepara e protege o estômago suavemente antes do fogo explodir." },
    ],
  },
  {
    icon: "🍲",
    title: "O Almoço Tático e os Sabores",
    time: "12h00 às 14h00",
    steps: [
      { icon: "☀️", text: 'Almoço Inegociável: O meio-dia, com o sol a pino, é o momento onde mais produzimos enzimas. Pular o almoço ou comer "dieta de passarinho" esfria o fogo e deixa o Pitta agressivo, irritado e nervoso. Coma uma refeição completa.' },
      { icon: "🍯", text: "Início Doce: Inicie com o sabor doce. A digestão começa na mucosa, que protege o estômago; o doce envolve o alimento de forma amigável." },
      { icon: "🌿", text: 'Fechamento Amargo (Higiene Oral): Termine a refeição com o sabor amargo. Se não for escovar os dentes imediatamente, mastigue algumas folhas de agrião ou rúcula. Isso "limpa" os dentes, refresca o hálito, fecha o excesso de enzimas (saciedade) e tem efeito purificante no sangue, removendo a irritabilidade.' },
      { icon: "🚶🏽‍♂️", text: "Os 100 Passos: Após a refeição, sente-se por 15 minutos e depois caminhe 100 passos. Isso ajuda a assentar a energia imensa gerada sem estagnar a mente." },
    ],
  },
  {
    icon: "🥛",
    title: "Final de Tarde & Refrescância",
    time: "17h às 20h",
    steps: [
      { icon: "💧", text: "Acalmando o Sistema: O fim da tarde pede refrescância. O uso de Buttermilk (soro de leite/leitelho com temperos frescos) ou uma nova dose de Madhu Anti-Pitta são excelentes para baixar a acidez acumulada do dia." },
      { icon: "🥗", text: "Jantar Leve: A refeição noturna deve acontecer até às 20h. É fundamental não consumir nada excessivamente pesado à noite, pois o fígado precisará de espaço para processar toxinas de madrugada. Sabores amargos e adstringentes à noite auxiliam enormemente." },
    ],
  },
  {
    icon: "🛌",
    title: "Processamento Profundo",
    time: "22h às 02h",
    steps: [
      { icon: "🛑", text: 'O Risco da Insônia Pitta: Este é o horário de processamento interno e limpeza do sangue. Se o Pitta estiver acordado após as 22h, o corpo entende que você precisa da energia para ação: a consequência é irritação profunda, "fritação de pensamento", fome noturna estressante e início de cascatas inflamatórias.' },
      { icon: "🫀", text: "Cuidado com Inflamações: Grande parte das arritmias, infartos e picos de inflamação ocorrem neste ciclo de madrugada por conta da união do estresse sanguíneo (Pitta) e o movimento celular forçado. O repouso profundo (dormindo antes das 22h) é a cura definitiva." },
    ],
  },
];

const HorariosPitta = () => (
  <DoshaRoutinePage
    dosha="pitta"
    emoji="🔥"
    heroTitle="Rotina para Pitta: O Resfriamento"
    heroDescription='As rotinas diárias para o dosha Pitta giram em torno de manter o fogo digestivo eficiente sem "irritar" o sistema e sem aumentar o excesso de calor e acidez. Como o Pitta já é naturalmente estimulado, a rotina ideal é aquela que reduz a intensidade, refresca e protege o trato digestivo.'
    clockLabel="Ciclo Pitta"
    clockSubtitle="Moderação"
    clockSegments={clockSegments}
    principlesTitle="Princípios de Ouro do Pitta 🌐"
    principlesSubtitle='A rotina alimentar não é "colocar mais fogo para digerir melhor"; é parar de provocar um fogo que já é intenso por natureza.'
    principles={principles}
    timelineTitle="A Jornada do Dinacharya Pitta"
    timelineSubtitle="Um guia cronológico com as práticas de resfriamento e organização metabólica do seu dia."
    timeline={timeline}
    metaTitle="Rotina para Pitta: O Guia do Dinacharya"
    metaDescription="Guia profundo de rotinas diárias específicas para apaziguar o dosha Pitta, mantendo o fogo digestivo eficiente sem irritação."
  />
);

export default HorariosPitta;
