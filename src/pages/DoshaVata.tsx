import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DoshaHeroBanner from "@/components/dosha/DoshaHeroBanner";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaNavPills from "@/components/dosha/DoshaNavPills";
import AgravamentosSection from "@/components/dosha/AgravamentosSection";
import DoshaSection from "@/components/dosha/DoshaSection";
import PrakritiSection from "@/components/dosha/PrakritiSection";
import OrganList from "@/components/dosha/OrganList";
import BalanceCard from "@/components/dosha/BalanceCard";
import SubdoshaCard from "@/components/dosha/SubdoshaCard";
import NutritionHabits from "@/components/dosha/NutritionHabits";

const DoshaVata = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Guia do Dosha Vata — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Vata: corpo físico, órgãos sede, os 5 ventos (Vayus), sabores, nutrição e hábitos de ouro para equilibrar Ar e Éter." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/vata" />
      </Helmet>

      <DoshaHeroBanner
        dosha="vata"
        emoji="🌬️"
        title="Vata"
        elements="Éter + Ar"
        subtitle="Os 5 Ventos do Corpo"
        description="Nascido da junção de Éter e Ar, Vata é leve, irregular e seco por natureza. Ele governa o movimento, a rapidez, a difusão e a criatividade. Operando através de uma inteligência distribuída em cinco ventos (Vayus), Vata é a força vital (Prana) que distribui os nutrientes, coordena a mente, rege a respiração e empurra as eliminações. Como Pitta e Kapha são inertes sem ele, todo adoecimento sistêmico envolve uma quebra no ritmo de Vata."
        badges={["Movimento", "Sutil"]}
      />

      <DoshaNavPills dosha="vata" />

      <AgravamentosSection
        dosha="vata"
        intro="Quando Vata acumula e agrava devido ao excesso de frio, secura e irregularidade, ele manifesta-se primeiro no sistema digestivo e na mente. Se ignorado, ele transborda para os tecidos (Dhatus), especialmente o ósseo e o nervoso."
        items={[
          { title: "Gases e Distensão Abdominal", text: "Sinal de acúmulo no tubo digestivo. O movimento irregular e a secura favorecem a fermentação e o \"vento\" no intestino." },
          { title: "Constipação e Intestino Seco", text: "Fezes duras e evacuação irregular. É o quadro típico do Vata elevado, muito comum após os 50 anos (a fase Vata da vida)." },
          { title: "Secura Sistêmica", text: "Pele seca e sensação de \"plasma secando\". Indica que o desequilíbrio saiu da digestão e já afeta os tecidos profundos." },
          { title: "Sono Leve e Insônia", text: "Mente hiperalerta e sono não restaurador. O ciclo \"café + pão\" agrava isso: o pão resseca e o café gera ansiedade." },
          { title: "Ansiedade e Confusão Mental", text: "O excesso de Vata não se fixa; ele circula, gerando inquietude, pânico e a sensação de que \"algo está errado\"." },
          { title: "Frio nas Extremidades", text: "Falta de calor físico e emocional, contribuindo para uma sensação de desamparo e hipervigilância." },
          { title: "Estalos Articulares e Dores", text: "Rigidez e desgaste, especialmente na lombar e quadril (áreas que o Vata \"adora\" ocupar no corpo)." },
          { title: "Evolução para Osteoporose", text: "O agravamento crônico no tecido ósseo (oco) leva ao enfraquecimento estrutural grave." },
          { title: "Zumbido no Ouvido (Tinnitus)", text: "Manifestação do Vata nas estruturas finas do sistema nervoso e elemento Éter." },
          { title: "Irregularidade de Fome e Energia", text: "Instabilidade no Agni (fogo digestivo), podendo evoluir para quadros de anemia e fadiga crônica." },
          { title: "Azia Secundária por Estresse", text: "A pressão interna da ansiedade e o intestino seco podem forçar uma produção errática de bile, gerando queimação." },
        ]}
      />

      <DoshaSection icon="👤" title="Prakriti (Corpo Físico)">
        <PrakritiSection
          description="O biotipo Vata é marcado pela leveza e irregularidade. Apresentam um corpo físico geralmente magro, com dificuldade estrutural para ganhar peso. A estrutura óssea é fina, os ossos são proeminentes e as articulações frequentemente estalam devido ao ressecamento natural."
          traits={[
            { label: "Olhos", text: "De proporções menores em relação ao rosto. A íris tende a ser densa e escura. A esclera apresenta tons levemente azulados, opacos ou acinzentados." },
            { label: "Unhas", text: "Esbranquiçadas, pálidas, finas, ásperas e quebradiças." },
            { label: "Língua", text: "Formato em \"U\", fina, longa e com tremores (falta de firmeza no vento) ao ser esticada." },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="📍" title="Órgãos Sede">
        <OrganList
          intro="As moradas principais onde Vata intoxica primeiro:"
          organs={[
            { name: "Intestino Grosso (Cólon)", description: "O órgão que \"aguenta\" Vata, coordenando ventos e eliminação." },
            { name: "Mente (Manas)", description: "O campo mais fácil de ser agitado pelo elemento Ar." },
            { name: "Sistema Circulatório", description: "A via onde o vento distribui nutrientes (ou espalha o frio)." },
            { name: "Tecido Ósseo", description: "Onde a leveza excessiva gera desgaste e porosidade." },
            { name: "Ouvidos", description: "Região ligada ao elemento Éter (espaço)." },
          ]}
        />
      </DoshaSection>

      <div id="alimentacao">
        <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
          <NutritionHabits
            approachTitle="Aproximar (Doce, Salgado, Ácido)"
            approachText="Como Vata é dominado pela secura, os sabores Doce (Terra + Água), Salgado (Água + Fogo) e Ácido (Terra + Fogo) agem como âncoras. Eles aquecem, nutrem os nervos, revestem o intestino e conservam a umidade necessária."
            avoidTitle="Evitar (Amargo, Adstringente, Picante excessivo)"
            avoidText="O Amargo esfria o corpo; o Adstringente absorve líquidos e resseca as fezes; o Picante em excesso atrita a mucosa e dispara a agitação mental e cardíaca."
            doItems={[
              "Privilegiar refeições quentes, ultra-cozidas e untuosas (cremes, mingaus, caldos ricos).",
              "Praticar Abhyanga diária com óleos quentes e pesados (gergelim) para pacificar os ventos Vyana e Apana.",
              "Criar uma rotina inegociável de horários para ancorar a mente.",
              "Descansar abundantemente para evitar o esgotamento do Prana.",
            ]}
            dontItems={[
              "Biscoitos secos, snacks estaladiços ou saladas totalmente frias e cruas.",
              "Jejuns erráticos, que deixam as \"fornalhas queimando no vazio\".",
              "Estimulantes (café puro em jejum) que disparam pânico e arritmias.",
              "Exposição ao vento sem agasalhar ouvidos, lombar e pés.",
            ]}
          />
        </DoshaSection>
      </div>

      <DoshaSection icon="⚙️" title="Os 5 Ventos do Corpo (Subdoshas)">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Os cinco ventos descrevem os padrões de movimento contínuos. Quando um vento seca, trava ou inverte a direção, ele invariavelmente puxa os outros.
        </p>
        <div className="space-y-4">
          <SubdoshaCard number={1} name="Prana Vayu" subtitle="O Vento das Ideias (Cérebro, Coração e Eixo Respiratório)" adequate="Governa a captação, direção e organização do fluxo mental. Quando livre, a mente percebe o mundo com clareza." disturbed="Confusão profunda e incapacidade de organizar o pensamento. Ansiedade e pânico." />
          <SubdoshaCard number={2} name="Udana Vayu" subtitle="O Vento da Expressão (Garganta e Voz)" adequate="Rege a energia ascendente que sai do coração para a garganta. Governa a comunicação e a capacidade de expressar sentimentos." disturbed="Rouquidão, dificuldade de colocar sentimentos para fora. Ligado à tireoide." />
          <SubdoshaCard number={3} name="Samana Vayu" subtitle="O Ritmo Digestivo (Estômago e Intestino Delgado)" adequate="Coordena o tempo de trânsito, processamento e trituração rítmica do alimento." disturbed="Digestão inconstante, gases dolorosos e distensão abdominal severa." />
          <SubdoshaCard number={4} name="Vyana Vayu" subtitle="O Distribuidor (Coração e Circulação Periférica)" adequate="Puxa a nutrição do centro para a periferia. Garante calor nas mãos, braços e pernas." disturbed="Mãos e pés gélidos, dormências, palpitações e arritmias." />
          <SubdoshaCard number={5} name="Apana Vayu" subtitle="A Descarga (Pelve e Cólon Descendente)" adequate="Governa todo movimento para baixo: eliminação, ciclo menstrual, reflexos de parto." disturbed="Fezes como \"bolinhas\", dores lombares, cólicas intensas e candidíase." />
        </div>
      </DoshaSection>

      <DoshaSection icon="⚖️" title="Balanço Energético">
        <BalanceCard
          equilibriumTitle="🌿 Em Equilíbrio (Prana & Srotas Livres)"
          equilibriumTexts={[
            "O Prana flui de maneira cristalina. A mente organiza as ideias com facilidade, a intuição é clara e a criatividade atua sem confusão. Os canais (Srotas) lubrificados garantem digestão rítmica e circulação calorosa até a ponta dos dedos.",
          ]}
          disturbTitle="⚠️ Em Distúrbio (Ama & Transbordamento)"
          disturbTexts={[
            "A mente perde o eixo. O pensamento acelera, gerando ansiedade crônica e pânico. O ressecamento trava a eliminação e entope os canais. O vento reverte a direção, as extremidades esfriam e surgem desgastes ósseos.",
          ]}
        />
      </DoshaSection>

      {/* Link para Adoecimento Avançado */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <Link
          to="/dosha/vata/adoecimento"
          className="block w-full text-center bg-vata/90 hover:bg-vata text-white font-bold py-4 px-6 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm transition-all hover:shadow-lg hover:shadow-vata/25"
        >
          🩺 Fisiopatologia Avançada de Vata — Subdoshas & Mistura
        </Link>
      </section>
    </>
  );
};

export default DoshaVata;
