import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DoshaRoutineContent from "@/components/dosha/DoshaRoutineContent";
import DoshaFoodContent from "@/components/dosha/DoshaFoodContent";
import DoshaRemediesContent from "@/components/dosha/DoshaRemediesContent";
import DoshaVideosContent from "@/components/dosha/DoshaVideosContent";
import { kaphaRoutineData } from "@/data/routineData";
import { kaphaFoodData } from "@/data/foodData";
import { kaphaRemediesData } from "@/data/remediesData";
import { type DoshaTab } from "@/components/dosha/DoshaNavPills";
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
import { AlertTriangle, Droplets } from "lucide-react";

interface DoshaKaphaProps {
  defaultTab?: DoshaTab;
}

const DoshaKapha = ({ defaultTab = "principal" }: DoshaKaphaProps) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as DoshaTab | null;
  const [activeTab, setActiveTab] = useState<DoshaTab>(tabFromUrl || defaultTab);

  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>{activeTab === "avancado" ? "Dosha Kapha e Subdoshas — Avançado" : "Guia do Dosha Kapha"} — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Kapha: corpo físico, órgãos sede, as 5 mucosas do corpo, sabores, nutrição e hábitos de ouro para equilibrar Terra e Água." />
        <link rel="canonical" href={`https://portalayurveda.com.br/biblioteca/kapha${activeTab === "principal" ? "" : "/" + activeTab}`} />
      </Helmet>

      <DoshaHeroBanner
        dosha="kapha"
        emoji="⛰️"
        title="Kapha"
        elements="Terra + Água"
        subtitle="As 5 Mucosas do Corpo"
        description={'Nascido da junção de Terra e Água, Kapha é frio, pesado, úmido, denso e resistente. Ele governa a estrutura, a estabilidade e a inteligência das funções mucosas no corpo. Não é apenas "catarro"; é a proteção do estômago, a umidade da boca e a lubrificação que adere e sustenta os tecidos. Dá uma sensação profunda de "chão", paciência e calma à mente.'}
        badges={["Estabilidade", "Resistência"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "alimentacao" ? (
        <DoshaFoodContent dosha="kapha" {...kaphaFoodData} />
      ) : activeTab === "remedios" ? (
        <DoshaRemediesContent dosha="kapha" {...kaphaRemediesData} />
      ) : activeTab === "videos" ? (
        <DoshaVideosContent dosha="kapha" />
      ) : activeTab === "principal" ? (
        <>
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
      ) : activeTab === "horarios" ? (
        <DoshaRoutineContent dosha="kapha" {...kaphaRoutineData} />
      ) : (
        <>
          <DoshaSection icon="🔍" title="Sinais Diagnósticos">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-kapha" />
                  <h3 className="font-bold text-primary">💩 Excreções (Malas)</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-kapha">Fezes (Purisha):</span> Volumosas, untuosas, pesadas e com frequente presença de muco denso não digerido.</li>
                  <li><span className="font-semibold text-kapha">Urina (Mutra):</span> Amarela e turva, demonstrando a densidade e sobrecarga dos filtros do corpo.</li>
                  <li><span className="font-semibold text-kapha">Suor (Sweda):</span> Grudento, oleoso e frio. O corpo tenta excretar o excesso de linfa e gordura pela pele.</li>
                </ul>
              </div>

              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <h3 className="font-bold text-primary">👅 Língua e Pulso</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-kapha">Língua:</span> Grossa, grande, redonda, extremamente pálida ou esbranquiçada. Apresenta forte cobertura de saburra grossa e pegajosa (sinal clássico de Ama/toxinas).</li>
                  <li><span className="font-semibold text-kapha">Pulso:</span> Lento, rítmico, profundo e contínuo (movimento majestoso do cisne).</li>
                </ul>
              </div>

              <div className="border border-kapha/30 bg-kapha/5 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-kapha" />
                  <h3 className="font-bold text-kapha">⚠️ Quadro de Alerta</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Depressão profunda do fogo digestivo, náusea frequente, letargia extrema, ganho de peso inexplicável, coloração pálida da pele, calafrios, tosse pesada com muito muco e sono incontrolável.
                </p>
              </div>
            </div>
          </DoshaSection>

          <DoshaSection icon="⚙️" title="As 5 Mucosas do Corpo (Subdoshas)">
            <p className="text-sm text-muted-foreground -mt-2 mb-4">
              Os centros de aderência, memória e umidade. Quando adoecem, o excesso de Terra e Água sufoca o movimento (Vata) e apaga o fogo (Pitta).
            </p>
            <div className="space-y-2">
              <CollapsibleSubdoshaCard number={1} name="Avalambaka Kapha" subtitle="O Pulmão e a Sustentação" adequate="A grande força do tórax. Transforma o ar em oxigênio denso." disturbed="Gera pulmão carregado, asma, bronquite e forte congestão." />
              <CollapsibleSubdoshaCard number={2} name="Bodhaka Kapha" subtitle="A Boca e a Fala" adequate="Regula a saliva e o paladar. Garante voz macia e melodiosa." disturbed="Embotamento do paladar, perda de voz e rouquidão por adesão." />
              <CollapsibleSubdoshaCard number={3} name="Kledaka Kapha" subtitle="A Fleuma Digestiva (Estômago)" adequate="Muco protetor que engloba o alimento. Dita o ritmo calmo da digestão." disturbed={'A digestão trava (inércia mucosa). A pessoa sente uma "âncora" no estômago após comer e sofre de náuseas.'} />
              <CollapsibleSubdoshaCard number={4} name="Tarpaka Kapha" subtitle="A Memória (Cérebro e Sinus)" adequate={'A "cola" da mente que sustenta o foco. Proporciona memória profunda e duradoura.'} disturbed="A mente fica letárgica e as vias aéreas entopem cronicamente (sinusites)." />
              <CollapsibleSubdoshaCard number={5} name="Shleshaka Kapha" subtitle="A Lubrificação Articular" adequate="Líquido sinovial que protege os ossos. Permite mobilidade ampla e livre de dores." disturbed="As juntas incham com líquidos retidos, tornando-se frouxas, doloridas e edemaciadas." />
            </div>
          </DoshaSection>

          <DoshaSection icon="🔬" title="Patologia das 5 Mucosas (Subdoshas)">
            <div className="space-y-5">
              <AdoecimentoSubdoshaCard number={1} name="Avalambaka Kapha" subtitle="A Grande Morada do Excesso" tagline="Sustentação / Pulmão" description="É a sede onde o Kapha sistêmico armazena seu excesso. O pulmão, em vez de transformar ar em energia, afoga-se nos próprios fluidos." mixEffects={[
                { emoji: "⛰️", label: "Puro Kapha (Água+Terra)", text: "Bronquite com catarro espesso, baixa vitalidade física, peito pesado e extrema dificuldade respiratória mucosa." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Vento resseca o muco. Asma seca, tosse irritativa, queda de imunidade e baixa libido." },
                { emoji: "🔥", label: "Se misturar com Pitta", text: "Fleuma ferve. Inflamação aguda nos brônquios, asma nervosa e sinusites amareladas com dor." },
              ]} />
              <AdoecimentoSubdoshaCard number={2} name="Kledaka Kapha" subtitle="Alvo: Parede Gástrica e Digestão" tagline="A Fleuma do Estômago" description="O muco protetor torna-se um pântano. O fogo digestivo (Agni) é completamente apagado por excesso de densidade." mixEffects={[
                { emoji: "⛰️", label: "Puro Kapha (Água+Terra)", text: "Sem fome, paralisia digestiva, obesidade do muco e necessidade de Vamana." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Proteção seca irregularmente. Digestão trancada, muitos gases, fome e sede erráticas." },
                { emoji: "🔥", label: "Se misturar com Pitta", text: "Lama ácida. Muco corrosivo com refluxo azedo e queimação mesmo com volume mucoso." },
              ]} />
              <AdoecimentoSubdoshaCard number={3} name="Tarpaka Kapha" subtitle="Alvo: Sistema Nervoso e Emoções" tagline="Mente e Bainha de Mielina" description="A base sólida da mente congestiona de inércia (Tamas), gerando apegos patológicos e depressão arrastada." mixEffects={[
                { emoji: "⛰️", label: "Puro Kapha (Água+Terra)", text: "Embotamento absoluto. Mente melancólica aprisionada no passado e perda de estímulo vital." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Degradação da mielina. Insegurança, medos paranoicos e agressividade por desproteção nervosa." },
                { emoji: "🔥", label: "Se misturar com Pitta", text: "Inflamação na bainha. Tensão nervosa ácida, cefaleias latejantes e amargura constante." },
              ]} />
              <AdoecimentoSubdoshaCard number={4} name="Bodhaka Kapha" subtitle="Alvo: Língua e Papilas" tagline="Boca e Fala" description="O sabor da vida desaparece, sendo substituído por fome emocional e incapacidade de processar experiências." mixEffects={[
                { emoji: "⛰️", label: "Puro Kapha (Água+Terra)", text: "Fala arrastada, paladar coberto por muco branco e salivação noturna excessiva." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Muco seca. Rouquidão crônica, pigarros secos e fala hiperativa que cansa rápido." },
                { emoji: "🔥", label: "Se misturar com Pitta", text: "Salivação ácida, halitose forte e úlceras recorrentes na cavidade oral." },
              ]} />
              <AdoecimentoSubdoshaCard number={5} name="Shleshaka Kapha" subtitle="Alvo: Cápsulas e Juntas" tagline="Óleo Articular" description="A lubrificação torna-se retenção hídrica massiva para compensar agressões externas." mixEffects={[
                { emoji: "⛰️", label: "Puro Kapha (Água+Terra)", text: 'Edemas e juntas inchadas ("borrachudas"), rigidez matinal e peso articular.' },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Vento drena o óleo. Estalos secos, perda de cápsula sinovial e artrose." },
                { emoji: "🔥", label: "Se misturar com Pitta", text: "Inflamação ferve a água. Bursite, tendinites e calor localizado na junta." },
              ]} />
            </div>
          </DoshaSection>
        </>
      )}
    </>
  );
};

export default DoshaKapha;
