import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DoshaHeroBanner from "@/components/dosha/DoshaHeroBanner";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaSection from "@/components/dosha/DoshaSection";
import PrakritiSection from "@/components/dosha/PrakritiSection";
import OrganList from "@/components/dosha/OrganList";
import BalanceCard from "@/components/dosha/BalanceCard";
import SubdoshaCard from "@/components/dosha/SubdoshaCard";
import NutritionHabits from "@/components/dosha/NutritionHabits";

const DoshaKapha = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Guia do Dosha Kapha — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Kapha: corpo físico, órgãos sede, as 5 mucosas do corpo, sabores, nutrição e hábitos de ouro para equilibrar Terra e Água." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/kapha" />
      </Helmet>

      <DoshaHeroBanner
        dosha="kapha"
        emoji="⛰️"
        title="Kapha"
        elements="Terra + Água"
        subtitle="As 5 Mucosas do Corpo"
        description='Nascido da junção de Terra e Água, Kapha é frio, pesado, úmido, denso e resistente. Ele governa a estrutura, a estabilidade e a inteligência das funções mucosas no corpo. Não é apenas "catarro"; é a proteção do estômago, a umidade da boca e a lubrificação que adere e sustenta os tecidos. Dá uma sensação profunda de "chão", paciência e calma à mente.'
        badges={["Estabilidade", "Resistência"]}
      />

      <DoshaSection icon="👤" title="Prakriti (Corpo Físico)">
        <PrakritiSection
          description="O biotipo Kapha é marcado pela estabilidade e resistência. Apresentam ossos mais curtos ou muito densos, peito mais avantajado e grande facilidade estrutural para ganhar volume. Possuem excelente resistência física e imunológica, embora sofram com a lentidão e extrema dificuldade com mudanças bruscas."
          traits={[
            { label: "Olhos", text: "Grandes, amendoados ou redondos, com cílios espessos. O olhar é calmo, magnético e amoroso. A esclera é branca e límpida." },
            { label: "Unhas", text: "Grossas, fortes, largas e levemente oleosas. Têm excelente estruturação capilar e unhas que não quebram facilmente." },
            { label: "Língua", text: "Formato grande, arredondado e espesso. É mais pálida e tem forte tendência a acumular saburra grossa, branca e pegajosa." },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="📍" title="Órgãos Sede">
        <OrganList
          intro="Onde os outros doshas eliminam, Kapha armazena. Suas moradas de proteção e umidade são:"
          organs={[
            { name: "Pulmões e Tórax", description: "A principal sede de armazenamento. Assim como Vata elimina no cólon, Kapha armazena excesso no pulmão, gerando fleuma e sensação de peito carregado." },
            { name: "Estômago", description: "Sede mucosa principal que envelopa o alimento. Quando agravado, favorece o acúmulo e o ganho extremo de peso." },
            { name: "Articulações", description: "Região de forte atuação estrutural de Kapha, que exige constante hidratação e proteção articular (cápsula sinovial) contra os atritos do movimento." },
            { name: "Sistema Linfático e Plasma", description: 'Atuam como a "fleuma" que viaja pelo corpo, distribuindo nutrição, mas também estagnando em edemas profundos.' },
            { name: "Nariz, Garganta e Cérebro", description: "Eixos vitais da mucosa que necessitam de umidade densa. O cérebro raramente agrava, mas a garganta e nariz entopem com letargia facilmente." },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚖️" title="Balanço Energético">
        <BalanceCard
          equilibriumTitle="🌿 Em Equilíbrio (Ojas & 7 Dhatus Fortes)"
          equilibriumTexts={[
            'O Ojas Abundante traz ao indivíduo uma imunidade fortíssima, uma paciência inabalável, capacidade de cuidar, compaixão e a sensação psicológica de ter "chão".',
            "Os 7 Tecidos (Dhatus) são perfeitamente formados e nutridos. Há força física prolongada, articulações macias e lubrificadas, e as mucosas funcionam como escudos eficientes sem produzir catarro excessivo.",
          ]}
          disturbTitle="⚠️ Em Distúrbio (Letargia & Estagnação)"
          disturbTexts={[
            "A Fisiologia Pesa: O corpo ganha volume rapidamente, retém água e incha. A digestão desacelera drasticamente, gerando sensação de peso, muco no trato digestivo, congestão crônica nas vias aéreas e alergias constantes.",
            "A Mente Estagna: A estabilidade converte-se em inércia. O indivíduo torna-se letárgico, complacente e demonstra uma extrema dificuldade em mudar velhos padrões, gerando apego e possessividade.",
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚙️" title="As 5 Mucosas do Corpo (Subdoshas)">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Os cinco subdoshas descrevem os centros de aderência, memória e umidade. Quando adoecem, o excesso de Terra e Água sufoca o movimento (Vata) e apaga o fogo (Pitta).
        </p>
        <div className="space-y-4">
          <SubdoshaCard number={1} name="Avalambaka Kapha" subtitle="O Pulmão e a Sustentação" adequate="A grande força do tórax. Transforma o etéreo (ar inspirado) em líquido/denso, permitindo que os alvéolos absorvam oxigênio e reponham energia diretamente no sangue e músculos. É a base da resistência física." disturbed='Como Kapha armazena excessos aqui, o adoecimento se evidencia por forte acúmulo de fleuma, congestão e um "pulmão carregado". Gera sensação de peso no tórax, asma, bronquite e letargia.' />
          <SubdoshaCard number={2} name="Bodhaka Kapha" subtitle="A Boca e a Fala" adequate="Da mesma forma que Pitta compreende pelos olhos, Kapha compreende pela boca. Regula a saliva, o paladar refinado e a mucosa oral, garantindo o bom funcionamento da garganta e uma voz macia e melodiosa." disturbed="Gera embotamento do paladar, rouquidão evidente ou perda de voz. Aviso: Beber água fervendo quando a voz já está rouca pode piorar, pois seca a pouca umidade que resta." />
          <SubdoshaCard number={3} name="Kledaka Kapha" subtitle="A Fleuma Digestiva (Estômago)" adequate='É o muco protetor que engloba o alimento, dando "molejo" ao bolo digestivo. Garante que o fogo ácido de Pitta processe a comida sem corroer as paredes e os tecidos do estômago, ditando o ritmo calmo da digestão.' disturbed="A digestão trava e torna-se excessivamente letárgica e mucosa. O indivíduo sente uma âncora no estômago após comer, náuseas, tendência a refluxo com muco e sofre com a péssima absorção dos nutrientes." />
          <SubdoshaCard number={4} name="Tarpaka Kapha" subtitle="A Memória (Cérebro e Sinus)" adequate='Conecta Vata (fluxo de ideias) e Pitta (discernimento), servindo como a "cola" e o aterramento da mente. É o que proporciona uma memória profunda e duradoura, sustentando o foco sem agitação.' disturbed='Quando em excesso, a mente fica pesada, "esquecida por letargia" e as vias aéreas entopem. Se faltar, a memória falha drasticamente por pura falta de base/retenção.' />
          <SubdoshaCard number={5} name="Shleshaka Kapha" subtitle="A Lubrificação Articular" adequate="Garante a fluidez e a maciez das cápsulas articulares (líquido sinovial). É o amortecedor estrutural que protege os ossos e permite a mobilidade ampla e livre de dores ou desgastes mecânicos." disturbed="Quando Vata aumenta, ele drena essa umidade causando estalos constantes e dor seca. Quando Kapha entra em excesso, as juntas incham com líquidos, tornando-se frouxas, edemaciadas e pesadas." />
        </div>
      </DoshaSection>

      <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
        <NutritionHabits
          approachTitle="Aproximar (Picante, Amargo, Adstringente)"
          approachText="Kapha é frio e denso. Precisa de fogo e secura para raspar a estagnação. Os sabores Picante, Amargo e Adstringente ativam a digestão, secam o muco e controlam os tecidos. Privilegie: Comida quente e leve, feijões (excelentes adstringentes), maçãs, peras, mel (poderoso raspador), cevada, painço e vegetais folhosos. Beba leite desnatado fervido com cúrcuma ou gengibre."
          avoidTitle="Evitar (Doce, Azedo, Salgado)"
          avoidText='Esses sabores multiplicam a massa (Terra) e a retenção (Água). O Salgado "segura" a água no corpo instantaneamente. Fuja de: Açúcar, doces pesados, queijos amarelos, iogurtes frios, nozes (muito oleosas), abacate, banana, trigo pesado, tomate e pepino (muito aquosos e frios).'
          doItems={[
            "Exercício físico vigoroso todos os dias; o corpo precisa suar para quebrar a inércia e mobilizar a linfa pesada.",
            "Acordar cedo e dormir cedo. Manter-se estimulado e bem aquecido em dias frios.",
            "Buscar intencionalmente novas experiências, quebras de rotina e viagens para combater o apego excessivo.",
            "Usar temperos estimulantes nas refeições (gengibre, pimenta-do-reino, cravo) para acordar o metabolismo.",
          ]}
          dontItems={[
            "Dormir durante o dia: Isso aumenta instantaneamente o muco, a lentidão e o embotamento.",
            "Refeições pesadas, sorvetes, leite frio e alimentos fritos ou extremamente doces.",
            'Sedentarismo prolongado e a complacência de ficar "só no sofá" (agrava Tarpaka e Avalambaka).',
            "Climas frios e úmidos sem a proteção adequada, deixando o frio se instalar no peito.",
          ]}
        />
      </DoshaSection>
      {/* Link para Adoecimento */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <Link
          to="/dosha/kapha/adoecimento"
          className="block w-full text-center bg-kapha/90 hover:bg-kapha text-white font-bold py-4 px-6 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm transition-all hover:shadow-lg hover:shadow-kapha/25"
        >
          🩺 Adoecimento de Kapha — Fisiopatologia Avançada
        </Link>
      </section>
    </>
  );
};

export default DoshaKapha;
