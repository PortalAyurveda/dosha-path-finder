import DoshaRoutinePage from "@/components/dosha/DoshaRoutinePage";

const clockSegments = [
  { label: "12h", dosha: "Pitta", color: "text-pitta" },
  { label: "14h (Início Vata)", dosha: "Vata", color: "text-vata", highlight: true },
  { label: "18h (Fim Vata)", dosha: "Kapha", color: "text-kapha", highlight: true },
  { label: "22h", dosha: "Pitta", color: "text-pitta" },
  { label: "00h", dosha: "Vata", color: "text-vata" },
  { label: "02h (Início Vata)", dosha: "Vata", color: "text-vata", highlight: true },
  { label: "06h (Fim Vata)", dosha: "Kapha", color: "text-kapha", highlight: true },
  { label: "10h", dosha: "Pitta", color: "text-pitta" },
];

const principles = [
  {
    icon: "🧘🏽‍♂️",
    title: "A Força da Constância",
    text: "A boa rotina de Vata é uma sequência de pequenas constâncias. Vata precisa de horários regulares e fixos para acordar, comer, tomar banho e dormir. É a repetição desses elementos que constrói o efeito terapêutico.",
  },
  {
    icon: "🧹",
    title: "O Ambiente Reflete a Mente",
    text: "Não deixe o ambiente virar bagunça. Arrumar o quarto, manter a casa limpa, lavar a louça constantemente e cultivar o silêncio são passos simples que ancoram a mente aérea do Vata na realidade material.",
  },
  {
    icon: "🔥",
    title: "Conforto Térmico Sempre",
    text: 'Vata se beneficia enormemente do calor e da contenção. Criar um ambiente com sensação de acolhimento (edredom pesado, roupas quentes, e até dormir de touca) ajuda a "aterrar" os pensamentos e diminuir a dispersão induzida pelo frio.',
  },
  {
    icon: "🍲",
    title: 'Nutrição que "Assenta"',
    text: "A regra alimentar é clara: prefira sempre alimentos quentes, densos e pastosos (como mingau e sopas creme). Se precisar de um lanche, a fruta deve ser cozida e consumida sozinha. Fuja das saladas cruas e dietas excessivamente leves.",
  },
];

const timeline = [
  {
    icon: "🌅",
    title: "Despertar Caloroso & Eliminação",
    time: "Entre 07h30 e 08h00",
    steps: [
      { icon: "⏰", text: "O Ajuste do Despertar: Evite o padrão de acordar às 4h30 da manhã, pois isso deixa o Vata ainda mais leve, etéreo e disperso. Acorde quando o dia já estiver mais quentinho (entre 7h30 e 8h00). Esperar o sol chegar faz toda a diferença estrutural." },
      { icon: "💧", text: "A Panaceia Matinal: Comece o dia com água morna em jejum. Ela mobiliza o corpo e ajuda na eliminação vital dos dejetos (fezes, urina). A lógica é: o adoecimento do Vata começa quando ele não elimina o que não lhe pertence." },
      { icon: "🚿", text: "Banho de Aterramento: O banho quente entra como uma ferramenta essencial para devolver umidade e calor à pele seca logo pela manhã, especialmente após ir ao banheiro." },
    ],
  },
  {
    icon: "🍲",
    title: "Geração de Fome & Almoço Denso",
    time: "12h00 às 13h30",
    steps: [
      { icon: "🍵", text: "O Cultivo da Fome: Nunca \"empurre comida\" sem fome. A orientação é gerar a fome. Meia hora antes do almoço, tome um chá de gengibre com coentro ou use o Madhu Anti-Vata para acender o fogo digestivo instável." },
      { icon: "🤫", text: 'Ambiente Sagrado: Coma em horários regulares e, estritamente, em um ambiente tranquilo e silencioso. O excesso de conversa e estímulo durante a mastigação introduz "ar" no sistema, gerando gases e inchaço.' },
      { icon: "🧘🏽‍♂️", text: "O Descanso Pós-Almoço: Um detalhe de ouro: após o almoço, não deite. Sente-se de pernas cruzadas e feche os olhos por 10 a 20 minutos. Isso favorece a absorção e mantém uma digestão privilegiada sem a letargia do sono deitado." },
    ],
  },
  {
    icon: "🛡️",
    title: "O Horário de Alerta Vata",
    time: "14h às 18h",
    steps: [
      { icon: "🚫", text: "Evite a Frieza: Banho frio, vento e exposição excessiva a intempéries são proibitivos neste horário, pois o ambiente já está assumindo qualidades dispersas. Proteja o pescoço, ouvidos e articulações." },
      { icon: "🧳", text: "O Antídoto da Viagem: Viagens de carro, ônibus ou avião agravam imensamente o Vata. A regra principal: tome um banho quente assim que chegar no seu destino para ancorar a energia imediatamente." },
    ],
  },
  {
    icon: "🛌",
    title: "Abhyanga & O Sono Profundo",
    time: "20h às 22h30",
    steps: [
      { icon: "🛢️", text: "A Magia da Automassagem (Abhyanga): Prática essencial antes de dormir. Use óleo de gergelim morno (nunca óleo de coco, que é ressecante). Aplique uma camada fina nas mãos, solas dos pés, umbigo, topo da cabeça e orelhas. Cuidado: jamais saia no frio logo após a massagem." },
      { icon: "🍯", text: "Tratamento Interno: Trinta minutos antes de dormir é o horário excelente para a dose noturna do Madhu Anti-Vata, ancorando a constipação de forma profunda e sistêmica." },
      { icon: "🥛", text: "A Bebida do Sono: Chás muito leves e ralos não combinam com a qualidade pesada necessária para o sono. Prefira um leite quente denso (leite de girassol, tâmara ou animal bem fervido) ou um Chai com especiarias untuosas." },
      { icon: "🧠", text: 'Envelopamento Físico: Para quem sofre da insônia Vata (acordar de madrugada com a mente difusa e frio nas mãos e pés), dormir com um edredom pesado ou até com uma touca de algodão na cabeça é uma tática imediata de contorno e estabilidade.' },
    ],
  },
];

const HorariosVata = () => (
  <DoshaRoutinePage
    dosha="vata"
    emoji="💨"
    heroTitle="Rotina para Vata: O Aterramento"
    heroDescription="Boas rotinas para o dosha Vata são aquelas que acalmam, trazem disciplina, vigor e vitalidade. A constância é o antídoto perfeito para reduzir a dispersão típica deste dosha (fazer muitas coisas ao mesmo tempo). Sem rotina, fica impossível equilibrar corpo e mente."
    clockLabel="Ciclo Vata"
    clockSubtitle="Foco e Disciplina"
    clockSegments={clockSegments}
    principlesTitle="Princípios de Ouro do Vata 🌐"
    principlesSubtitle="A disciplina nas coisas físicas organiza o campo sutil. Para o Vata, a organização externa e o silêncio ajudam a acalmar o movimento interno."
    principles={principles}
    timelineTitle="A Jornada do Dinacharya Vata"
    timelineSubtitle="Um guia cronológico com as constâncias táticas para ancorar sua energia todos os dias."
    timeline={timeline}
    metaTitle="Rotina para Vata: O Guia do Dinacharya"
    metaDescription="Guia profundo de rotinas diárias específicas para apaziguar o dosha Vata, trazendo disciplina, aterramento e vigor."
  />
);

export default HorariosVata;
