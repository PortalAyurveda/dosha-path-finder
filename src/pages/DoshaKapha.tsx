import { Helmet } from "react-helmet-async";
import DoshaHeroBanner from "@/components/dosha/DoshaHeroBanner";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import AgravamentosSection from "@/components/dosha/AgravamentosSection";
import DoshaSection from "@/components/dosha/DoshaSection";
import PrakritiSection from "@/components/dosha/PrakritiSection";
import OrganList from "@/components/dosha/OrganList";
import BalanceCard from "@/components/dosha/BalanceCard";
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
        description={'Nascido da junção de Terra e Água, Kapha é frio, pesado, úmido, denso e resistente. Ele governa a estrutura, a estabilidade e a inteligência das funções mucosas no corpo. Não é apenas "catarro"; é a proteção do estômago, a umidade da boca e a lubrificação que adere e sustenta os tecidos. Dá uma sensação profunda de "chão", paciência e calma à mente.'}
        badges={["Estabilidade", "Resistência"]}
      />

      <AgravamentosSection
        dosha="kapha"
        intro={'Kapha agrava quando há excesso de matéria e falta de transformação. O corpo aterra demais, produz muco e retém líquidos. A raiz costuma ser comer comida pesada, comer sem fome, comer e logo dormir, vivendo em uma rotina que não "queima" a matéria (Agni fraco).'}
        items={[
          { title: "Excesso de Muco e Fleuma", text: 'Comer além da capacidade gera muco direto no estômago. Os órgãos que "seguram" esse excesso são o estômago e o pulmão. O acúmulo nos alvéolos gera tosse, gripes crônicas e expectoração pesada.' },
          { title: "Peso Mental e Embotamento", text: 'Junto com o muco físico vem a letargia mental. A mente fica lenta, o indivíduo não quer realizar tarefas complexas e perde o acesso à clareza porque "aterrou demais".' },
          { title: "Letargia e Inércia Profunda", text: 'Dificuldade extrema de sair de casa, mudar rotinas ou até levantar da cama, especialmente quando a alimentação está com muita "lenha" e o metabolismo não transforma.' },
          { title: "Obesidade e Retenção", text: "O ganho de peso é visível, mas pessoas magras também podem ter Kapha agravado. Manifesta-se como retenção, sensação de pele pegajosa e sangue/linfa com características mucosas." },
          { title: "Plasma e Suor Mucosos", text: "A fleuma viaja pela linfa (plasma) e reflete-se no suor, que se torna mucoso. A coriza nasal deixa de ser leve e vira um acúmulo obstrutivo sério." },
          { title: "Problemas Respiratórios (Tosse/Gripe)", text: "A respiração fica pesada. O corpo tenta fluidificar o muco retido nos pulmões aumentando a temperatura, resultando em febres e gripes recorrentes para expulsar a toxina." },
          { title: "Melancolia e Depressão", text: 'A gordura e o excesso de muco geram melancolia e "pena de si mesmo". A depressão clássica tem forte assinatura Kapha: a sensação de estagnação e de não conseguir sair do lugar.' },
          { title: "Agni Fraco (Fogo Entorpecido)", text: "A base do ciclo de acúmulo. Ao consumir comida muito pesada, o fogo não dá conta de queimar e a digestão trava. Você pode adoecer simplesmente porque o seu Agni está fraco demais para a sua rotina." },
          { title: "Gatilhos Clássicos do Acúmulo", text: "Comer carne, massas, bolos, laticínios e queijos reaquecidos. Hábito de comer e dormir, comer por horário (sem fome) ou sedentarismo absoluto." },
        ]}
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
            { name: "Pulmões e Tórax", description: "A principal sede de armazenamento. Gera fleuma e sensação de peito carregado quando em excesso." },
            { name: "Estômago", description: "Sede mucosa principal que envelopa o alimento. Quando agravado, favorece o ganho extremo de peso." },
            { name: "Articulações", description: "Região de forte atuação estrutural que exige hidratação e proteção (líquido sinovial) contra os atritos do movimento." },
            { name: "Sistema Linfático e Plasma", description: 'A "fleuma" que viaja pelo corpo distribuindo nutrição, mas que pode estagnar em edemas profundos.' },
            { name: "Nariz, Garganta e Cérebro", description: "Eixos vitais da mucosa. O cérebro raramente agrava, mas a garganta e o nariz entopem com letargia facilmente." },
          ]}
        />
      </DoshaSection>

      <div id="alimentacao">
        <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
          <NutritionHabits
            approachTitle="Aproximar (Picante, Amargo, Adstringente)"
            approachText="Kapha é frio e denso. Precisa de fogo e secura para raspar a estagnação. Os sabores Picante, Amargo e Adstringente ativam a digestão, secam o muco e controlam os tecidos."
            approachDetail="Privilegie: Comida quente e leve, feijões (excelentes adstringentes), maçãs, peras, mel (poderoso raspador), cevada, painço e vegetais folhosos. Beba chás ou leites desnatados fervidos com cúrcuma ou gengibre."
            avoidTitle="Evitar (Doce, Azedo, Salgado)"
            avoidText={'Esses sabores multiplicam a massa (Terra) e a retenção (Água). O Salgado "segura" a água no corpo instantaneamente.'}
            avoidDetail="Fuja de: Açúcar, doces pesados, queijos amarelos, iogurtes frios, nozes (muito oleosas), abacate, banana, trigo pesado, tomate e pepino (muito aquosos e frios)."
            doItems={[
              "Exercício físico vigoroso todos os dias; o corpo precisa suar para quebrar a inércia e mobilizar a linfa pesada.",
              "Acordar cedo e dormir cedo. Manter-se estimulado e bem aquecido em dias frios.",
              "Buscar intencionalmente novas experiências, quebras de rotina e viagens para combater o apego excessivo.",
              "Usar temperos estimulantes nas refeições (gengibre, pimenta-do-reino, cravo) para acordar o metabolismo.",
            ]}
            dontItems={[
              "Dormir durante o dia: Isso aumenta instantaneamente o muco, a lentidão e o embotamento.",
              "Refeições pesadas, sorvetes, leite frio e alimentos fritos ou extremamente doces.",
              'Sedentarismo prolongado e a complacência de ficar "só no sofá".',
              "Climas frios e úmidos sem a proteção adequada, deixando o frio se instalar no peito.",
            ]}
          />
        </DoshaSection>
      </div>

      <DoshaSection icon="⚖️" title="Balanço Energético">
        <BalanceCard
          equilibriumTitle="🌿 Em Equilíbrio (Ojas & 7 Dhatus Fortes)"
          equilibriumTexts={[
            'O Ojas abundante traz imunidade fortíssima, paciência inabalável, capacidade de cuidar, compaixão e a sensação psicológica de ter "chão". Os tecidos (Dhatus) são bem nutridos, garantindo força física prolongada, articulações macias e mucosas eficientes sem produzir catarro excessivo.',
          ]}
          disturbTitle="⚠️ Em Distúrbio (Letargia & Estagnação)"
          disturbTexts={[
            "O corpo ganha volume rapidamente, retém água e incha. A digestão desacelera, gerando sensação de peso, muco no trato digestivo e congestão nas vias aéreas. A estabilidade mental converte-se em inércia, apego, possessividade e extrema dificuldade em mudar velhos padrões.",
          ]}
        />
      </DoshaSection>
    </>
  );
};

export default DoshaKapha;
