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

      <DoshaSection icon="👤" title="Prakriti (Corpo Físico)">
        <PrakritiSection
          description="O biotipo Vata é marcado pela leveza e irregularidade. Apresentam um corpo físico geralmente magro, com dificuldade estrutural para ganhar peso. A estrutura óssea é fina, os ossos são proeminentes e as articulações frequentemente estalam devido ao ressecamento natural. É comum a presença de assimetria física (desvios posturais ou feições assimétricas)."
          traits={[
            { label: "Olhos", text: "De proporções menores em relação ao rosto. A íris tende a ser densa e escura. A esclera (parte branca) apresenta tons levemente azulados, opacos, acinzentados ou arroxeados." },
            { label: "Unhas", text: "Esbranquiçadas, pálidas, finas, ásperas e com alta tendência a serem quebradiças ou empenadas." },
            { label: "Língua", text: 'Formato mais retangular/quadrado (aspecto de "U"), podendo ser fina, longa e apresentar tremores (falta de firmeza no vento) ao ser esticada.' },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="📍" title="Órgãos Sede">
        <OrganList
          intro="Cada dosha intoxica primeiro nos locais que compartilham suas características (espaço e secura). As moradas principais de Vata são:"
          organs={[
            { name: "Intestino Grosso (Cólon Descendente)", description: 'O grande órgão que "aguenta" Vata. Ele tem muito espaço vazio para a passagem de ventos, faz a secagem final dos dejetos puxando a água e coordena a eliminação de gases.' },
            { name: "Mente (Manas)", description: "Órgão sede crítico. É o campo mais fácil de ser agitado pelo Ar. O excesso de Vata se manifesta rapidamente aqui como confusão mental, hiperatividade, pensamentos em espiral, TDAH, ansiedade profunda e, em longo prazo, quadros degenerativos." },
            { name: "Sistema Circulatório e Coração", description: "A via onde o vento distribui nutrientes. O alojamento de Vata desorganiza o fluxo, gerando arritmias, ressecamento dos canais, palpitações e extremidades frias." },
            { name: "Tecido Ósseo", description: "Principalmente os grandes ossos (como bacia e fêmur). A lógica é o vazio (oco) do osso, que favorece o alojamento de Vata, causando leveza excessiva, desgastes severos, estalos e osteoporose." },
            { name: "Ouvidos", description: "Região ligada ao elemento Éter (espaço) onde Vata se aloja com grande facilidade. Seu ressecamento agudo é o principal responsável pelo zumbido crônico (tinnitus)." },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚖️" title="Balanço Energético">
        <BalanceCard
          equilibriumTitle="🌿 Em Equilíbrio (Prana & Srotas Livres)"
          equilibriumTexts={[
            "O Prana (Energia Vital) flui de maneira cristalina. A mente organiza as ideias com facilidade, a intuição é forte e clara, a criatividade atua sem confusão, e a respiração guia o ritmo do coração em perfeita harmonia.",
            "Os Srotas (Canais) desobstruídos e bem lubrificados garantem uma digestão rítmica, fezes moldadas e uma circulação que distribui calor e nutrição até a ponta dos dedos sem obstruções.",
          ]}
          disturbTitle="⚠️ Em Distúrbio (Ama & Transbordamento)"
          disturbTexts={[
            'Prana Adoecido: A mente perde o eixo e a confusão se instala. O pensamento acelera demais e as ideias ficam soltas, gerando ansiedade crônica, agitação motora (TDAH), insônia e a sensação de "frio na barriga" ou pânico.',
            'Srotas Obstruídos: O ressecamento trava a eliminação (fezes secas) e entope os canais de circulação. O vento reverte a direção, as extremidades ficam geladas, a digestão gera gases dolorosos e surgem desgastes ósseos e arritmias.',
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚙️" title="Os 5 Ventos do Corpo (Subdoshas)">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Os cinco ventos descrevem os padrões de movimento contínuos. Quando um vento seca, trava ou inverte a direção, ele invariavelmente puxa os outros. Digestão, eliminação e circulação formam uma cadeia vital inseparável.
        </p>
        <div className="space-y-4">
          <SubdoshaCard number={1} name="Prana Vayu" subtitle="O Vento das Ideias (Cérebro, Coração e Eixo Respiratório)" adequate='Governa a captação, direção e organização do fluxo mental. Quando livre, a mente percebe o mundo com clareza. (Dica: É comum ter uma forte e súbita "abertura de intuição" nos horários dominados por Vata, por volta das 03:30 da madrugada).' disturbed='O principal sinal é a confusão mental profunda. O indivíduo sente que "não consegue organizar o que pensa", as ideias ficam soltas, o pensamento torna-se obsessivamente rápido, o foco desaparece e a ansiedade se converte em pânico.' />
          <SubdoshaCard number={2} name="Udana Vayu" subtitle="O Vento da Expressão (Garganta e Voz)" adequate='Rege a energia ascendente que sai do coração para a garganta. Governa a comunicação, a capacidade de "colocar para fora" sentimentos profundos, o entusiasmo vocal e a certeza do próprio caminho (Dharma).' disturbed='A pessoa não consegue se expressar e "engole a voz". Fisicamente, gera rouquidão, tosses crônicas e está diretamente ligado aos distúrbios da tireoide (onde o relógio do corpo perde o compasso da expressão).' />
          <SubdoshaCard number={3} name="Samana Vayu" subtitle="O Ritmo Digestivo (Estômago e Intestino Delgado)" adequate="Funciona bem quando há um equilíbrio na tríade gástrica: o Agni (fogo), a mucosa (proteção Kapha) e o espaço funcional. Coordena de forma magistral o tempo de trânsito, processamento e trituração rítmica do alimento." disturbed='O ritmo quebra: a digestão torna-se inconstante, seca ou dolorosamente rápida e gasosa. O vento gera distensão abdominal severa e uma sensação de que a comida alterna entre "bater e passar direto" ou estagnar num nó digestivo.' />
          <SubdoshaCard number={4} name="Vyana Vayu" subtitle="O Distribuidor (Coração e Circulação Periférica)" adequate="Sua função é girar e puxar a nutrição do centro para a periferia. Regula as batidas serenas do coração e a dilatação sistêmica, garantindo que o calor chegue sem interrupções às mãos, braços e pernas." disturbed="A irregularidade no vento cardíaco manifesta-se através de fortes arritmias, palpitações rápidas e pontadas. Por não conseguir empurrar o sangue e os nutrientes, as mãos e os pés do indivíduo estão cronicamente gélidos ou dormentes." />
          <SubdoshaCard number={5} name="Apana Vayu" subtitle="A Descarga (Pelve e Cólon Descendente)" adequate='Governa todo movimento para baixo: eliminação (fezes/urina), ciclo menstrual pontual, descida da criança no parto, reflexos de orgasmo/ejaculação, aterrando o corpo e aliviando a cabeça.' disturbed='As fezes ressecam e saem como "bolinhas de cabrito". A pessoa sente frio e inchaço inferior, as dores lombares pioram e podem surgir gases crônicos. A menstruação atrasa ou trava, gerando cólicas intensas ou candidíase (caso o vento se misture com Pitta inflamatório na pelve).' />
        </div>
      </DoshaSection>

      <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
        <NutritionHabits
          approachTitle="Aproximar (Doce, Salgado, Ácido)"
          approachText="Como Vata é dominado pela secura e leveza perigosas, os sabores Doce (Terra + Água), Salgado (Água + Fogo) e Ácido (Terra + Fogo) agem como âncoras. Estes sabores aquecem internamente, nutrem profundamente as juntas e nervos que estalam, revestem o intestino grosso e conservam a umidade necessária para reverter as constipações severas."
          avoidTitle="Evitar (Amargo, Adstringente, Picante excessivo)"
          avoidText="O Amargo (Ar + Éter) esfria o corpo de quem já sofre com extremidades frias; o Adstringente (Terra + Ar) absorve todos os líquidos, ressecando e endurecendo as fezes com violência; e o excesso de Picante atrita a mucosa já deficiente de Samana Vayu, acelerando as batidas do coração e a agitação mental."
          doItems={[
            "Privilegiar refeições quentes, ultra-cozidas e untuosas (cremes de tubérculos, mingaus com leite e especiarias doces, caldos de osso).",
            "Praticar Abhyanga diária com óleos quentes e pesados 💆🏽‍♂️ (gergelim ou rícino na planta dos pés e ventre) para pacificar Apana e Vyana.",
            "Criar uma rotina inegociável de horários para ancorar a mente turbulenta e ansiosa.",
            "Descansar abundantemente, garantindo repouso físico para evitar o esgotamento do Prana.",
          ]}
          dontItems={[
            "Biscoitos secos, snacks estaladiços ou saladas totalmente frias e cruas que agridem as paredes digestivas e elevam o ar.",
            'Jejuns erráticos, que deixam as fornalhas "queimando no vazio" gerando tontura, confusão e frio.',
            "Estimulantes fortíssimos (café puro de estômago vazio) que disparam a arritmia de Vyana e a hiperatividade/pânico de Prana.",
            "Banhos de vento sem se agasalhar (especialmente as orelhas e ouvidos, onde Vata causa zumbido, e na lombar/pés).",
          ]}
        />
      </DoshaSection>
      {/* Link para Adoecimento */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <Link
          to="/dosha/vata/adoecimento"
          className="block w-full text-center bg-vata/90 hover:bg-vata text-white font-bold py-4 px-6 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm transition-all hover:shadow-lg hover:shadow-vata/25"
        >
          🩺 Adoecimento de Vata — Fisiopatologia Avançada
        </Link>
      </section>
    </>
  );
};

export default DoshaVata;
