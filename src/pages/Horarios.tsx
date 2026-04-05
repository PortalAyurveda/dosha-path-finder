import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaClock from "@/components/dosha/DoshaClock";

const wisdomCards = [
  {
    icon: "🔥",
    title: "Você precisa digerir o que consome",
    text: "Melhor um alimento ruim bem digerido na hora certa, do que um alimento excelente mal digerido na hora errada. Digerir é sempre o mais importante na base do Ayurveda.",
  },
  {
    icon: "🛡️",
    title: "A resistência é a base de tudo",
    text: "Ayurveda não é sobre evitar alimentos que te fazem mal, mas conseguir digerir todos os alimentos que você precisa. A longevidade não está atrelada a uma vida austera, mas a uma vida equilibrada, com escolhas diferentes a cada momento de acordo com suas necessidades.",
  },
  {
    icon: "🍵",
    title: "O veículo dos nutrientes (Anupana)",
    text: 'De nada adianta consumir um chá para a mente se água com erva não é um bom veículo para o sistema nervoso. A forma como você escolhe veicular o nutriente precisa ser levada em conta tanto quanto o horário. "Aquilo que se dá com o remédio também é remédio."',
  },
  {
    icon: "🚫",
    title: "Atenção ao Anoitecer",
    text: "Independente do seu Dosha, o processo digestivo requer cuidado à noite. Após o sol se pôr, não combina comer salada, chás amargos ou frutas. Diminua o ritmo para não apagar o fogo digestivo que se prepara para o recolhimento.",
  },
];

const timelineSteps = [
  {
    icon: "🌅",
    title: "Despertar & Desjejum",
    time: "Por volta das 06h",
    dosha: "KAPHA",
    doshaColor: "text-kapha",
    paragraphs: [
      'Levantar da cama antes do pico do horário Kapha (06h às 10h) é fundamental para não se sentir pesado como lenha o resto do dia. É o momento ideal para movimento e mobilidade. Comece influenciando o corpo com algo quente e fluido no desjejum para auxiliar a eliminação (como água quente do seu dosha ou a Panaceia Desidratada da Samkhya).',
      'Após sentir-se vazio, o café da manhã entra como uma refeição valiosa. Consuma algo quente, doce e untuoso (como um Suco Matinal Ayurveda, podendo usar o Tônico da Samkhya ou Chyawanprash). Células abertas e úmidas estão prontas para receber bons alimentos com propriedade estrutural.',
    ],
  },
  {
    icon: "☕",
    title: "Lanche da Manhã",
    time: "Por volta das 10h",
    dosha: "PITTA",
    doshaColor: "text-pitta",
    paragraphs: [
      'Você pode lanchar de acordo com as suas necessidades: para uns é uma fruta, para outros é um chutney, suco, ou até mesmo um pão, sanduíche ou chai. O café preto não é um vilão absoluto, desde que não seja a sua primeira ação no desjejum com o estômago vazio (o que apaga o Agni). Use-o com inteligência.',
    ],
  },
  {
    icon: "☀️",
    title: "O Pico Digestivo",
    time: "Meio-dia (12h às 14h)",
    dosha: "PITTA",
    doshaColor: "text-pitta",
    checklist: [
      { label: "Estimule a Fome", text: "É hora de ter fome real. Se você não tem, usar o Madhu Anti-Vata 15 a 30 minutos antes do almoço é excelente para melhorar o Agni e estimular o apetite." },
      { label: "O Sabor Doce Primeiro", text: "O doce antes das refeições gera uma mucosa de absorção ideal. Pode ser uma tâmara hidratada ou até mesmo mastigar extremamente bem o arroz branco (gohan) no começo do prato." },
      { label: "Transformação & Especiarias", text: "Só digerimos bem aquilo que transformamos. Comer com especiarias elimina gases e remove a chance de letargia pós-refeição." },
      { label: "Fechando o Ciclo", text: "Termine a refeição com o sabor amargo (mesmo que seja mascando uma folha de rúcula ou alface). Isso sinaliza ao corpo que a ingestão acabou." },
      { label: "Os 100 Passos", text: "Dar 100 passos após comer (uma volta no quarteirão ou corredor) ajuda o corpo a mover o alimento misturando-o com o suco gástrico, evitando drasticamente a moleza da tarde." },
    ],
  },
  {
    icon: "🍃",
    title: "Tarde Ativa",
    time: "14h às 18h",
    dosha: "VATA",
    doshaColor: "text-vata",
    paragraphs: [
      'O período da tarde é excelente para lanches isolados, frutas ou chás medicinais. A regra fundamental aqui é não dormir. Fique alerta. Dormir no meio do dia, quando o Agni já está abaixando, vai estagnar o processo digestivo e gerar toxina (Ama).',
    ],
  },
  {
    icon: "🏡",
    title: "Novela das Seis & Recolhimento",
    time: "A partir das 18h até 20h",
    dosha: "KAPHA",
    doshaColor: "text-kapha",
    paragraphs: [
      'Às 18h o horário Kapha entra trazendo o instinto natural de conforto, resguardo e cuidado. Os animais se recolhem. Isso melhora sua conexão com a vitalidade e regeneração. Um banho tomado, roupa confortável, sofá, uma sopinha quente e uma atividade de lazer têm um valor clínico incrível para a mente.',
      'Jante até as 20h. Pessoas muito Pitta costumam pecar nisso, mas comer próximo ao horário de dormir prejudica severamente a digestão e o sono, gerando inflamação no corpo justamente na hora que ele deveria estar reciclando nutrientes e descartando toxinas.',
    ],
  },
  {
    icon: "🛌",
    title: "Repouso & Regeneração",
    time: "22h às 23h",
    dosha: "PITTA",
    doshaColor: "text-pitta",
    paragraphs: [
      'Deitar até as 22h é o ideal, mas se não for possível, coloque 23h como seu horário limite inegociável. Passar desse horário abre portas para a insônia do Vata ou a "fritação de pensamentos" noturna do Pitta.',
    ],
    tips: [
      { icon: "💡", text: "Tem fritação de pensamento (Pitta)? Evite terminantemente comer muito perto da hora de dormir." },
      { icon: "💡", text: "Acorda de madrugada com frio (Vata)? Experimente tomar um Chai denso e untuoso 1 hora antes de ir para a cama. Isso ajuda a aprofundar o sono e manter os tecidos aquecidos e nutridos a noite inteira." },
    ],
  },
];

const clinicalCards = [
  {
    title: "O Perigo das Dietas Frias e Fibras",
    text: "Alimentos crus (saladas) possuem propriedade fisiológica gelada e constritora. Consumir fibras puras/secas para soltar intestino preso não faz sentido; o corpo precisa de alimentos emolientes, untuosos e fluidificantes.",
  },
  {
    title: "A Ilusão dos Suplementos Secos",
    text: "Proteínas veganas (isolado de ervilha/soja) entregam pó cru e seco. Quando alguém com secura toma pílulas ressecadas, perde o brilho vital. Todo pó precisa de um veículo untuoso e fluido (Anupana) para que o plasma transporte.",
  },
  {
    title: "A Magia da Monodieta & Arroz Doce",
    text: "A monodieta real cria cremosidade cozinhando tudo junto (arroz basmati, lentilhas, raízes). O arroz doce é fantástico, mas nunca deve ser comido gelado; exige antídotos picantes (cravo, canela) para liberar seu potencial de néctar celular.",
  },
  {
    title: "A Armadilha: Ghee + Mel",
    text: "Nunca consuma as mesmas proporções de Mel e Ghee juntos. O mel absorve de forma agressivamente rápida, e o Ghee muito lentamente; o corpo entra em pane digestiva total, agravando simultaneamente os três doshas.",
  },
];

const doshaCards = [
  {
    emoji: "💨",
    label: "Rotina para Vata",
    desc: "Aterramento, nutrição profunda e estabilidade para a mente aérea.",
    to: "/biblioteca/vata?tab=horarios",
    color: "border-vata/40 hover:border-vata bg-vata/5 hover:bg-vata/10",
    textColor: "text-vata",
  },
  {
    emoji: "🔥",
    label: "Rotina para Pitta",
    desc: "Resfriamento, moderação de estresse e foco na qualidade da digestão.",
    to: "/biblioteca/pitta?tab=horarios",
    color: "border-pitta/40 hover:border-pitta bg-pitta/5 hover:bg-pitta/10",
    textColor: "text-pitta",
  },
  {
    emoji: "🪨",
    label: "Rotina para Kapha",
    desc: "Estímulo, termogênese matinal e leveza estrutural para combater inércia.",
    to: "/biblioteca/kapha?tab=horarios",
    color: "border-kapha/40 hover:border-kapha bg-kapha/5 hover:bg-kapha/10",
    textColor: "text-kapha",
  },
];

const Horarios = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Relógio dos Doshas & Dinacharya — Portal Ayurveda</title>
        <meta name="description" content="Guia profundo e completo sobre o ciclo natural de 24 horas dos Doshas, englobando sono, rotinas, alimentação e fisiologia clínica." />
        <link rel="canonical" href="https://portalayurveda.com.br/biblioteca/horarios" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-b from-surface-sun to-background py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Compêndio Completo</p>
              <h1 className="text-3xl md:text-5xl font-serif font-bold italic text-primary leading-tight mb-4">
                O Relógio dos Doshas & Dinacharya 🕰️
              </h1>
              <p className="text-foreground/80 text-base md:text-lg leading-relaxed mb-6">
                Entender o relógio dos doshas é fundamental para que o tratamento ayurvédico flua sem radicalismos. Este processo de ciclar o seu dia garante a colheita de resultados a longo prazo, alinhando sua fisiologia ao ritmo do planeta.
              </p>
              <div className="flex flex-wrap gap-3">
                {doshaCards.map((card) => (
                  <Link
                    key={card.to}
                    to={card.to}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${card.color}`}
                  >
                    {card.emoji} {card.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80">
                <DoshaClock variant="neutral" centerLabel="Ciclo" centerValue="24h" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wisdom cards */}
      <section id="fisiologia" className="py-12 bg-surface-sun/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2">
              Visão Geral: Sabedoria Fisiológica 🌐
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              A busca pela individualidade e a relação profunda entre a capacidade digestiva, a mente e os tecidos do corpo.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {wisdomCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 flex gap-4">
                <span className="text-3xl shrink-0">{card.icon}</span>
                <div>
                  <h4 className="font-sans font-bold text-primary text-base mb-1">{card.title}</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Dança dos Elementos */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">A Dança dos Elementos</h2>
            <p className="text-foreground/70 text-lg max-w-3xl mx-auto">
              Aprofundamento na fisiologia, nas emoções e nas rotinas para equilibrar Vata, Pitta e Kapha ao longo do dia.
            </p>
          </div>

          {/* Vata */}
          <div className="bg-surface-sun rounded-2xl border-l-8 border-vata p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none">💨</div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">Ciclo Vata: O Movimento, o Éter e o Prana</h3>
            <p className="text-vata font-bold mb-6 md:mb-8 uppercase tracking-widest text-xs sm:text-sm">02h às 06h (Madrugada) | 14h às 18h (Tarde)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Atributos & Horários</h4>
                  <p className="text-foreground/80"><strong>Qualidades:</strong> Leve, frio, seco, móvel, difuso.</p>
                  <p className="text-foreground/80 mt-2">A <strong>madrugada</strong> é fria, etérea e silenciosa, marcando o pico de Prana e criatividade. A <strong>tarde</strong> é propensa ao embotamento mental e moleza caso o fogo digestivo do almoço não tenha sido estimulado adequadamente com picantes.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Características do Desequilíbrio</h4>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    <li><strong>O Despertar Vata:</strong> Insônia letárgica ou paralisia na madrugada; a pessoa desperta subitamente, sem sono, com a mente difusa e frio nas extremidades.</li>
                    <li>Primeira crise de labirintite ou paralisia de ouvido geralmente estoura neste horário.</li>
                    <li>Viver apenas de saladas, sucos verdes e jejuns para "ficar leve" agrava severamente a secura do corpo e as articulações.</li>
                    <li>Na terceira idade (50+), o corpo seca naturalmente, aumentando a constipação e os estalos.</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 text-primary bg-white px-4 py-2 rounded-md shadow-sm">Rotinas e Aterramento (O que fazer)</h4>
                <ul className="space-y-4 text-foreground/80">
                  <li className="flex gap-3"><span className="text-xl">🛌</span><span><strong>O Segredo do Sono:</strong> O indivíduo Vata deve tentar deitar até as 22h. Se ficar acordado, acumula a insônia Vata da madrugada com o estresse Pitta noturno. É permitido permanecer na cama até as 7h, 8h ou 9h se estiver em tratamento focado.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🥛</span><span><strong>Estratégia Noturna:</strong> Tomar um leite quente (animal ou vegetal denso) ou um <strong>Chai</strong> bem cozido com especiarias meia hora antes de dormir aterra a insônia.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🍯</span><span><strong>Alimentação e Constipação:</strong> Comer tâmaras hidratadas antes das refeições ajuda no ganho de peso (sabor doce antes das refeições aterra o corpo). Para tratar a constipação de forma profunda, a solução é usar o <strong>Madhu Anti-Vata</strong> da Samkhya no almoço e 30 minutos antes de dormir.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🚫</span><span><strong>Evite à Tarde:</strong> Banho frio, vento e exposição a intempéries. Se viajar, tome um banho quente assim que chegar em seu destino para aterrar imediatamente.</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pitta */}
          <div className="bg-surface-sun rounded-2xl border-l-8 border-pitta p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none">🔥</div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">Ciclo Pitta: O Metabolismo, a Transformação e o Tejas</h3>
            <p className="text-pitta font-bold mb-6 md:mb-8 uppercase tracking-widest text-xs sm:text-sm">10h às 14h (Dia) | 22h às 02h (Noite)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Atributos & Horários</h4>
                  <p className="text-foreground/80"><strong>Qualidades:</strong> Calor, metabolismo, penetrabilidade, brilhante e leve.</p>
                  <p className="text-foreground/80 mt-2">O <strong>meio-dia</strong> é o momento de maior acidez estomacal, fome, irritabilidade mental e pico da capacidade digestiva (gerador de Tejas). A <strong>noite</strong> é o horário de processamento interno e limpeza do sangue.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Características do Desequilíbrio</h4>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    <li><strong>A Insônia Pitta:</strong> Estar acordado entre 22h e 02h gera irritação, "fritação de pensamento", fome noturna estressante e inflamações severas.</li>
                    <li>Pular o almoço ou comer "dieta de passarinho" esfria o fogo, frustra as células e não gera nutrição. Se o Pitta não come ao meio-dia, fica agressivo e nervoso.</li>
                    <li>O excesso gera estresse, queimação, problemas de pele e dores pulsantes (tendinites). Grande parte das arritmias/infartos estouram na madrugada pela soma de sangue estressado (Pitta) com arritmia de movimento (Vata).</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 text-primary bg-white px-4 py-2 rounded-md shadow-sm">Rotinas e Apaziguamento (O que fazer)</h4>
                <ul className="space-y-4 text-foreground/80">
                  <li className="flex gap-3"><span className="text-xl">☀️</span><span><strong>Almoço Absoluto:</strong> O meio-dia, com o sol a pino, é o momento perfeito e inegociável para a refeição mais pesada e complexa.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🚶🏽‍♂️</span><span><strong>100 Passos da Digestão:</strong> Após almoçar, não volte ao trabalho rápido. Sente-se de pernas cruzadas de olhos abertos para contemplar por 15 minutos e depois caminhe levemente cem passos para firmar a energia sem letargia.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🛡️</span><span><strong>Prevenção de Azia:</strong> Para combater a azia e diminuir a acidez, o tratamento deve ocorrer às 10h da manhã (quando o Pitta está começando, não no pico). O uso do <strong>Madhu Anti-Pitta</strong> (às 10h e no fim da tarde) é ideal.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🌿</span><span><strong>Para Diminuir Acidez:</strong> Buttermilk, sabores amargos e adstringentes são excelentes aliados. É fundamental não comer nada pesado depois das 20h.</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Kapha */}
          <div className="bg-surface-sun rounded-2xl border-l-8 border-kapha p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none">🪨</div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">Ciclo Kapha: A Estrutura, a Nutrição e o Ojas</h3>
            <p className="text-kapha font-bold mb-6 md:mb-8 uppercase tracking-widest text-xs sm:text-sm">06h às 10h (Manhã) | 18h às 22h (Noite)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Atributos & Horários</h4>
                  <p className="text-foreground/80"><strong>Qualidades:</strong> Estrutura, peso, umidade, densidade.</p>
                  <p className="text-foreground/80 mt-2">A <strong>manhã</strong> traz sensação de proteção, cama pesada e enorme capacidade celular de absorção. A <strong>noite</strong> é o momento onde o corpo pede colo, sofá, família e coisas fáceis para a mente descansar.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary border-b border-border pb-2">Características do Desequilíbrio</h4>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    <li><strong>A Armadilha do Sono Kapha:</strong> A "depressão de cama" e a inércia em levantar ocorrem porque a pessoa volta a dormir após as 06h, horário onde a cama se torna pesada como lenha.</li>
                    <li><strong>A Ilusão do Doce:</strong> A "ansiedade pelo sabor doce" às 18h não é um vício mental; é o corpo implorando por nutrição estrutural que não foi entregue durante o dia.</li>
                    <li>O Kapha letárgico come pequenas refeições o tempo todo sem ter fome, entupindo o corpo de muco, peso e odor forte.</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 text-primary bg-white px-4 py-2 rounded-md shadow-sm">Rotinas e Estimulação (O que fazer)</h4>
                <ul className="space-y-4 text-foreground/80">
                  <li className="flex gap-3"><span className="text-xl">🔥</span><span><strong>Café Estruturado & Termogênese:</strong> O foco matinal é a termogênese. Não use café preto puramente. Consuma alimentos doces ou salgados, mas cozidos com bastante especiaria. Se for tomar um café, que seja com massala doce. O café puro apaga o agni, principalmente em jejum.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🏃🏽‍♂️</span><span><strong>Estratégia Anti-Kapha:</strong> Quem quer remover muco deve acordar cedo, tomar um chá quente com o <strong>Madhu Anti-Kapha</strong> (no desjejum e na hora do almoço) e movimentar o corpo antes das 06h.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🌶️</span><span><strong>Dica Kapha:</strong> Use bastante o sabor picante nas refeições. É válido até mesmo beber um cálice de vinho 10 minutos antes de uma refeição pesada (como fazem os italianos) para aquecer o apetite e despertar a digestão.</span></li>
                  <li className="flex gap-3"><span className="text-xl">🍎</span><span><strong>O Truque das 10h:</strong> Se bater fome às 10h, uma fruta crua esfria o agni. O genial é comer uma fruta cozida com um cravo, mantendo o estômago aquecido até as 11h30.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dinacharya timeline */}
      <section id="dinacharya" className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2">
              A Jornada do Dinacharya Padrão
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Um guia universal cronológico de como influenciar positivamente seu corpo através dos ciclos naturais das 24 horas.
            </p>
          </div>

          <div className="space-y-6">
            {timelineSteps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                  <span className="text-2xl">{step.icon}</span>
                  <div>
                    <h3 className="font-serif font-bold text-primary text-lg leading-tight">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.time} — <span className={`font-bold ${step.doshaColor}`}>{step.dosha}</span>
                    </p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {step.paragraphs?.map((p, j) => (
                    <p key={j} className="text-sm text-foreground/80 leading-relaxed">{p}</p>
                  ))}
                  {step.checklist && (
                    <ul className="space-y-2">
                      {step.checklist.map((item, j) => (
                        <li key={j} className="flex gap-2 text-sm">
                          <span className="text-kapha font-bold mt-0.5">✔</span>
                          <span className="text-foreground/80"><strong className="text-primary">{item.label}:</strong> {item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.tips && (
                    <div className="mt-3 space-y-2">
                      {step.tips.map((tip, j) => (
                        <p key={j} className="text-sm bg-accent/10 rounded-lg p-3 text-foreground/80">
                          {tip.icon} {tip.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical deepdive */}
      <section className="py-12 bg-surface-sky/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2 text-center">
            Aprofundamento Clínico: O Paradoxo da Alimentação Moderna 🧪
          </h2>
          <div className="mt-8">
            <Accordion type="multiple" className="grid sm:grid-cols-2 gap-4">
              {clinicalCards.map((card, i) => (
                <AccordionItem key={i} value={`clinical-${i}`} className="bg-white rounded-2xl border border-border px-5 py-1">
                  <AccordionTrigger className="text-sm font-bold text-primary hover:no-underline py-4">{card.title}</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">{card.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-border p-5 flex gap-4">
            <span className="text-3xl shrink-0">👶🏽</span>
            <div>
              <h4 className="font-sans font-bold text-primary text-base mb-1">Dica de Ouro: Especiarias para Crianças</h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Crianças que consomem muitos doces e massas precisam ter especiarias introduzidas silenciosamente no preparo da comida. Canela, gengibre, erva-doce, cardamomo, cúrcuma e anis ajudam o corpinho a processar todo o excesso de muco formador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Samkhya CTA */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold italic mb-3">
            Potencialize sua Rotina com a Loja Samkhya
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6 text-sm md:text-base">
            Acesse formulações autênticas desenvolvidas clinicamente. De especiarias a composições como o Madhu Anti-Kapha, Anti-Pitta e Anti-Vata, encontre o veículo perfeito para tratar a raiz do seu desequilíbrio metabólico.
          </p>
          <a
            href="https://www.lojasamkhya.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
            Acessar a Loja Oficial
          </a>
        </div>
      </section>
    </>
  );
};

export default Horarios;
