import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DoshaHeroBanner from "@/components/dosha/DoshaHeroBanner";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import AgravamentosSection from "@/components/dosha/AgravamentosSection";
import DoshaSection from "@/components/dosha/DoshaSection";
import PrakritiSection from "@/components/dosha/PrakritiSection";
import OrganList from "@/components/dosha/OrganList";
import BalanceCard from "@/components/dosha/BalanceCard";
import NutritionHabits from "@/components/dosha/NutritionHabits";
import CollapsibleSubdoshaCard from "@/components/dosha/CollapsibleSubdoshaCard";
import AdoecimentoSubdoshaCard from "@/components/dosha/AdoecimentoSubdoshaCard";
import DoshaRoutineContent from "@/components/dosha/DoshaRoutineContent";
import DoshaFoodContent from "@/components/dosha/DoshaFoodContent";
import DoshaRemediesContent from "@/components/dosha/DoshaRemediesContent";
import DoshaVideosContent from "@/components/dosha/DoshaVideosContent";
import { vataRoutineData } from "@/data/routineData";
import { vataFoodData } from "@/data/foodData";
import { vataRemediesData } from "@/data/remediesData";
import { type DoshaTab } from "@/components/dosha/DoshaNavPills";
import { AlertTriangle, Droplets } from "lucide-react";

interface DoshaVataProps {
  defaultTab?: DoshaTab;
}

const DoshaVata = ({ defaultTab = "principal" }: DoshaVataProps) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as DoshaTab | null;
  const [activeTab, setActiveTab] = useState<DoshaTab>(tabFromUrl || defaultTab);

  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>{activeTab === "avancado" ? "Dosha Vata e Subdoshas — Avançado" : "Guia do Dosha Vata"} — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Vata: corpo físico, órgãos sede, os 5 ventos (Vayus), sabores, nutrição e hábitos de ouro para equilibrar Ar e Éter." />
        <link rel="canonical" href={`https://portalayurveda.com.br/biblioteca/vata${activeTab === "principal" ? "" : "/" + activeTab}`} />
      </Helmet>

      <DoshaHeroBanner
        dosha="vata"
        emoji="🌬️"
        title="Vata"
        elements="Éter + Ar"
        subtitle="Os 5 Ventos do Corpo"
        description="Nascido da junção de Éter e Ar, Vata é leve, irregular e seco por natureza. Ele governa o movimento, a rapidez, a difusão e a criatividade. Operando através de uma inteligência distribuída em cinco ventos (Vayus), Vata é a força vital (Prana) que distribui os nutrientes, coordena a mente, rege a respiração e empurra as eliminações. Como Pitta e Kapha são inertes sem ele, todo adoecimento sistêmico envolve uma quebra no ritmo de Vata."
        badges={["Movimento", "Sutil"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "alimentacao" ? (
        <DoshaFoodContent dosha="vata" {...vataFoodData} />
      ) : activeTab === "remedios" ? (
        <DoshaRemediesContent dosha="vata" {...vataRemediesData} />
      ) : activeTab === "videos" ? (
        <DoshaVideosContent dosha="vata" />
      ) : activeTab === "principal" ? (
        <>
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
        </>
      ) : activeTab === "horarios" ? (
        <DoshaRoutineContent dosha="vata" {...vataRoutineData} />
      ) : (
        <>
          {/* AVANÇADO */}
          <DoshaSection icon="🔍" title="Sinais Diagnósticos">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-vata" />
                  <h3 className="font-bold text-primary">💩 Excreções (Malas)</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-vata">Fezes (Purisha):</span> Secas, duras, empedradas ("bolinhas de cabrito") e irregulares.</li>
                  <li><span className="font-semibold text-vata">Urina (Mutra):</span> Escassa e espumosa.</li>
                  <li><span className="font-semibold text-vata">Suor (Sweda):</span> Escasso ou ausente (pele muito seca).</li>
                </ul>
              </div>

              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <h3 className="font-bold text-primary">👅 Língua e Pulso</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-vata">Língua:</span> Fina, longa, frequentemente trêmula, pálida ou com aspecto escurecido/cinzento. Fissuras no fundo indicam desequilíbrio profundo no cólon.</li>
                  <li><span className="font-semibold text-vata">Pulso:</span> Irregular, rastejante como uma cobra, rápido e vazio sob os dedos.</li>
                </ul>
              </div>

              <div className="border border-pitta/30 bg-pitta/5 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-pitta" />
                  <h3 className="font-bold text-pitta">⚠️ Quadro de Alerta</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Emagrecimento repentino, debilidade severa, falta de entusiasmo, tremores constantes, distensão abdominal por gases, insônia crônica, desorientação sensorial, vertigem e depressão agitada.
                </p>
              </div>
            </div>
          </DoshaSection>

          <DoshaSection icon="⚙️" title="Os 5 Ventos do Corpo (Subdoshas)">
            <p className="text-sm text-muted-foreground -mt-2 mb-4">
              Os cinco ventos descrevem os padrões de movimento contínuos. Quando um vento seca, trava ou inverte a direção, ele invariavelmente puxa os outros.
            </p>
            <div className="space-y-2">
              <CollapsibleSubdoshaCard number={1} name="Prana Vayu" subtitle="O Vento das Ideias (Cérebro, Coração e Eixo Respiratório)" adequate="Governa a captação, direção e organização do fluxo mental. Quando livre, a mente percebe o mundo com clareza." disturbed="Confusão profunda e incapacidade de organizar o pensamento. Ansiedade e pânico." />
              <CollapsibleSubdoshaCard number={2} name="Udana Vayu" subtitle="O Vento da Expressão (Garganta e Voz)" adequate="Rege a energia ascendente que sai do coração para a garganta. Governa a comunicação e a capacidade de expressar sentimentos." disturbed="Rouquidão, dificuldade de colocar sentimentos para fora. Ligado à tireoide." />
              <CollapsibleSubdoshaCard number={3} name="Samana Vayu" subtitle="O Ritmo Digestivo (Estômago e Intestino Delgado)" adequate="Coordena o tempo de trânsito, processamento e trituração rítmica do alimento." disturbed="Digestão inconstante, gases dolorosos e distensão abdominal severa." />
              <CollapsibleSubdoshaCard number={4} name="Vyana Vayu" subtitle="O Distribuidor (Coração e Circulação Periférica)" adequate="Puxa a nutrição do centro para a periferia. Garante calor nas mãos, braços e pernas." disturbed="Mãos e pés gélidos, dormências, palpitações e arritmias." />
              <CollapsibleSubdoshaCard number={5} name="Apana Vayu" subtitle="A Descarga (Pelve e Cólon Descendente)" adequate="Governa todo movimento para baixo: eliminação, ciclo menstrual, reflexos de parto." disturbed={'Fezes como "bolinhas", dores lombares, cólicas intensas e candidíase.'} />
            </div>
          </DoshaSection>

          <DoshaSection icon="🔬" title="Patologia dos 5 Ventos (Subdoshas)">
            <div className="space-y-5">
              <AdoecimentoSubdoshaCard number={1} name="Prana Vayu" subtitle="Sede Original do Distúrbio" tagline="Mente / Intelecto" description="Quando o vento que rege a percepção de fora para dentro adoece, a mente perde o eixo. É aqui que nascem as doenças psicossomáticas graves e as psicoses." mixEffects={[
                { emoji: "🌪️", label: "Puro Vata (Ar+Éter)", text: "Síndrome do pânico, medo irracional de se mover, sensação de perseguição crônica, estresse, mente em espiral e impressão de não dar conta." },
                { emoji: "🔥", label: "Se empurrar Pitta", text: "O vento atiça o fogo. O indivíduo torna-se supercrítico, julgador implacável, com pensamentos acelerados que exaurem o sistema nervoso." },
                { emoji: "⛰️", label: "Se empurrar Kapha", text: "O vento esbarra na inércia. Causa estagnação mental profunda, letargia, depressão paralítica e incapacidade de mudança." },
              ]} />
              <AdoecimentoSubdoshaCard number={2} name="Udana Vayu" subtitle="Alvo: Garganta e Cordas Vocais" tagline="Expressão / Tireoide" description="O adoecimento do vento ascendente sufoca a expressão do Ser. Ele ofusca o paciente ou o faz exacerbar o mecanismo da fala." mixEffects={[
                { emoji: "🌪️", label: "Puro Vata (Ar+Éter)", text: "Inibição severa do Dharma, tosse seca crônica, resfriamento vocal e engasgo da verdade por vergonha. Raiz do hipotireoidismo." },
                { emoji: "🔥", label: "Se empurrar Pitta", text: 'Necessidade agressiva de "convencer com a voz". Raiz de inflamações agudas na garganta e hipertireoidismo nervoso.' },
                { emoji: "⛰️", label: "Se empurrar Kapha", text: "Falsa aceitação. Excesso de muco engasgando a voz e bronquite com secreção espessa na garganta." },
              ]} />
              <AdoecimentoSubdoshaCard number={3} name="Samana Vayu" subtitle="Alvo: Intestino Delgado e Estômago" tagline="Agni / Trato Digestivo" description="A quebra deste vento destrói o Jatar Agni. O alimento é movimentado de forma errática, perdendo a capacidade de separação nutricional." mixEffects={[
                { emoji: "🌪️", label: "Puro Vata (Ar+Éter)", text: "Vishma Agni (digestão intermitente). Excesso de gases, língua fina com tremores e dores abdominais por distensão." },
                { emoji: "🔥", label: "Se empurrar Pitta", text: "Superprodução de suco gástrico. Causa azia severa, acidez gástrica e inflamação da mucosa digestiva." },
                { emoji: "⛰️", label: "Se empurrar Kapha", text: 'Digestão afogada em muco, letargia extrema após comer e depósito de gordura (Ama) diretamente no fígado.' },
              ]} />
              <AdoecimentoSubdoshaCard number={4} name="Apana Vayu" subtitle="O Grande Vilão de Vata" tagline="Excreção / Pelve" description='É a raiz sistêmica do adoecimento. Um cólon intoxicado e "enfezado" reverte os ventos, empurrando Ama de volta para o sangue.' mixEffects={[
                { emoji: "🌪️", label: "Puro Vata (Ar+Éter)", text: 'Constipação severa. Fezes em "bolinhas". Causa divertículos, dor lombar e má distribuição de prana.' },
                { emoji: "🔥", label: "Se empurrar Pitta", text: "Intestino solto e ácido, inflamação urogenital (candidíase de repetição) e fezes amareladas com ardência." },
                { emoji: "⛰️", label: "Se empurrar Kapha", text: "Fezes pesadas com muco. Letargia pélvica, aumento prostático e ciclos menstruais com fluxo lento e coágulos." },
              ]} />
              <AdoecimentoSubdoshaCard number={5} name="Vyana Vayu" subtitle="Alvo: Tecido Sanguíneo e Cardíaco" tagline="Circulação / Coração" description='Quando o vento distribuidor perde a nutrição, o coração gira "no vazio", esgotando o Ojas (vitalidade) e a imunidade.' mixEffects={[
                { emoji: "🌪️", label: "Puro Vata (Ar+Éter)", text: 'Má circulação, extremidades geladas, plasma fraco, fortes arritmias e sensação de "vazio no coração".' },
                { emoji: "🔥", label: "Se empurrar Pitta", text: "Tendência a problemas cardíacos agudos, inflamação vascular, hipertensão e ataques de raiva fulminantes." },
                { emoji: "⛰️", label: "Se empurrar Kapha", text: "Letargia cardíaca. Inchaço do coração, entupimento gradual de artérias por muco/gordura e varizes profundas." },
              ]} />
            </div>
          </DoshaSection>
        </>
      )}
    </>
  );
};

export default DoshaVata;
