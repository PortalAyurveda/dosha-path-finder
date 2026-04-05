import { useState } from "react";
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
import { AlertTriangle, Droplets } from "lucide-react";

interface DoshaPittaProps {
  defaultTab?: "principal" | "avancado";
}

const DoshaPitta = ({ defaultTab = "principal" }: DoshaPittaProps) => {
  const [activeTab, setActiveTab] = useState<"principal" | "avancado">(defaultTab);

  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>{activeTab === "avancado" ? "Dosha Pitta e Subdoshas — Avançado" : "Guia do Dosha Pitta"} — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Pitta: corpo físico, órgãos sede, os 5 fogos, sabores, nutrição e hábitos de ouro para equilibrar Fogo e Água." />
        <link rel="canonical" href={activeTab === "avancado" ? "https://portalayurveda.com.br/dosha/pitta/adoecimento" : "https://portalayurveda.com.br/dosha/pitta"} />
      </Helmet>

      <DoshaHeroBanner
        dosha="pitta"
        emoji="☀️"
        title="Pitta"
        elements="Fogo + Água"
        subtitle="Os 5 Fogos do Corpo"
        description={'Nascido da junção de Fogo e Água, Pitta é quente e "estressado" por natureza. Ele governa todo o metabolismo, a digestão, a percepção sensorial e a transformação. Operando através de uma inteligência distribuída em cinco fogos, Pitta é a principal fonte de calor que transforma tanto o alimento em nutrientes quanto as experiências em compreensão profunda.'}
        badges={["Transformação", "Intensidade"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "principal" ? (
        <>
          <AgravamentosSection
            dosha="pitta"
            intro="Pitta agrava quando o fogo, que deveria estar localizado na digestão, extravasa e vira calor sistêmico, acidez e inflamação. O gatilho é somar substâncias ácidas e picantes a um organismo que já possui fogo alto."
            items={[
              { title: "Intestino Irritado e Perda de Energia", text: "O excesso de ácidos e picantes extremos estimula demais a digestão, irritando a mucosa e drenando a vitalidade do indivíduo através do trato intestinal." },
              { title: "Azia e Acidez Digestiva", text: "Consequência direta do fogo estimulado além da conta. A queimação é o sinal de que o ácido está corroendo a própria proteção do estômago." },
              { title: "Fome Alta e Pouca Saciedade", text: 'Pitta agravado mantém as enzimas digestivas sempre "ligadas". O indivíduo sente fome persistente e agressividade se não comer imediatamente.' },
              { title: "Ama de Pitta (Toxina Quente)", text: 'Diferente de outros doshas, a toxina de Pitta é penetrante, ácida e irritativa. Ela inflama e "queima" por onde passa.' },
              { title: "Acne Forte e Inflamatória", text: "Aquela acne que queima e dói. É o transbordamento do calor do sangue para a pele, exigindo purificantes amargos para estabilizar." },
              { title: "Inflamações de Pele (Dermatites e Psoríase)", text: 'Furúnculos, coceiras e vermelhidão são sinais de que o Pitta está "fervendo" o sangue. A psoríase é um quadro clássico de excesso de Pitta.' },
              { title: "Conjuntivite e Irritação Ocular", text: "Olhos vermelhos, com remela ou ardência (fotofobia) indicam que o calor subiu para a sede da visão." },
              { title: '"Brad Pitta" (Transbordamento)', text: "Metáfora para o fogo da cozinha pegando nas paredes da casa. É o calor saindo da sede digestiva e manifestando inflamação na periferia do corpo." },
              { title: "Sangue Quente e Raiva", text: "O excesso de Pitta no sangue manifesta-se emocionalmente como irritabilidade, explosões de raiva e impaciência." },
              { title: "Gatilhos Alimentares Críticos", text: "O uso de vinagre, tomate, pimentão, conservas, embutidos, azeite (óleo ácido) e crustáceos (camarão/ostras) são os maiores convites ao desequilíbrio." },
            ]}
          />

          <DoshaSection icon="👤" title="Prakriti (Corpo Físico)">
            <PrakritiSection
              description="O biotipo Pitta é marcado pela intensidade e simetria. Apresentam corpo mediano, boa musculatura e facilidade para ganhar ou perder peso. O calor corporal é alto, com suor abundante."
              traits={[
                { label: "Olhos", text: "Proporções medianas, olhar penetrante e analítico. Conjuntiva avermelhada; esclera levemente amarelada ou aquosa." },
                { label: "Unhas", text: "Macias, flexíveis e avermelhadas, refletindo a forte irrigação sanguínea." },
                { label: "Língua", text: 'Formato em "V" (pontiaguda). Coloração avermelhada, propensa a aftas e saburra amarelada.' },
              ]}
            />
          </DoshaSection>

          <DoshaSection icon="📍" title="Órgãos Sede">
            <OrganList
              intro="As moradas principais onde Pitta intoxica primeiro:"
              organs={[
                { name: "Metabolismo Digestivo", description: "Intestino Delgado (sede principal), Fígado e Pâncreas." },
                { name: "Sangue (Rakta)", description: "Sede que herda a bile e o calor da digestão." },
                { name: "Pele", description: 'Onde o Pitta transborda do "lado de dentro" para o "lado de fora".' },
                { name: "Olhos e Discernimento", description: "Onde processamos a luz e as ideias." },
              ]}
            />
          </DoshaSection>

          <div id="alimentacao">
            <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
              <NutritionHabits
                approachTitle="Aproximar (Doce, Amargo, Adstringente)"
                approachText="Para apagar o incêndio, o corpo precisa de peso e frescor."
                approachDetail='Regra de Ouro: Sabor Doce antes da refeição (ex: uma tâmara) para proteger a mucosa do ácido. Sabor Amargo depois (ex: mastigar rúcula) para "desligar" as enzimas e trazer saciedade. Destaques: Arroz basmati, coco, melão, peras e o uso diário de Ghee (frio, doce e pesado).'
                avoidTitle="Evitar (Ácido, Picante, Salgado)"
                avoidText="O picante é querosene no fogo de Pitta. O ácido corrói."
                avoidDetail="Fuja de: Vinagre, conservas, pimentas fortes, tomate, beringela, álcool e café em excesso."
                doItems={[
                  "Priorizar a proteção da mucosa gástrica: nunca deixe o estômago queimar no vazio.",
                  "Hidratação Alcalina: Água de coco ou água de coentro (infusão a frio).",
                  "Finalização Amarga: Termine as refeições com folhas amargas para reduzir a hiperprodução enzimática.",
                  "Doação de Sangue: Funciona como uma \"sangria terapêutica\" para aliviar o calor sistêmico (se estiver vitalizado).",
                ]}
                dontItems={[
                  "Pular refeições: O Agni alto, sem alimento, começa a digerir a própria parede do estômago.",
                  "Salada gelada no início: O fogo precisa de substância primeiro; o frio entra no final.",
                  "Sol forte: Evitar exposição direta, especialmente na primavera e verão.",
                ]}
              />
            </DoshaSection>
          </div>

          <DoshaSection icon="⚖️" title="Balanço Energético">
            <BalanceCard
              equilibriumTitle="🌿 Em Equilíbrio (Agni & Tejas)"
              equilibriumTexts={[
                "O Agni extrai a nutrição sem queimar o corpo. O Tejas (brilho mental) traz liderança, inteligência clara e capacidade de organização. A pele brilha e a digestão é silenciosa e eficiente.",
              ]}
              disturbTitle="⚠️ Em Distúrbio (Ama & Transbordamento)"
              disturbTexts={[
                "O fogo vira incêndio. A mente torna-se um juiz implacável e raivoso. A digestão corrói as mucosas e o calor transborda para o sangue, gerando erupções cutâneas e reatividade emocional.",
              ]}
            />
          </DoshaSection>
        </>
      ) : (
        <>
          <DoshaSection icon="🔍" title="Sinais Diagnósticos">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-pitta" />
                  <h3 className="font-bold text-primary">💩 Excreções (Malas)</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-pitta">Fezes (Purisha):</span> Abundantes, constantes, amolecidas e de coloração intensamente amarelada ou esverdeada (bile livre).</li>
                  <li><span className="font-semibold text-pitta">Urina (Mutra):</span> Abundante, de cor amarela forte, quente e com odor ácido.</li>
                  <li><span className="font-semibold text-pitta">Suor (Sweda):</span> Abundante, quente, profuso e com forte odor azedo/carnal.</li>
                </ul>
              </div>

              <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-5 space-y-3">
                <h3 className="font-bold text-primary">👅 Língua e Pulso</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><span className="font-semibold text-pitta">Língua:</span> Formato em "V" (pontiaguda). Vermelha viva, com bordas inflamadas, aftas, ardência e presença de saburra amarela indicando sobrecarga hepática.</li>
                  <li><span className="font-semibold text-pitta">Pulso:</span> Forte, saltitante e com ritmo marcante (leitura do "sapo pulando").</li>
                </ul>
              </div>

              <div className="border border-pitta/30 bg-pitta/5 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-pitta" />
                  <h3 className="font-bold text-pitta">⚠️ Quadro de Alerta</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Fome e sede insaciáveis, ardência/queimação pelo corpo, febres crônicas, inflamações generalizadas, dificuldade de dormir por agitação térmica e ataques fulminantes de raiva.
                </p>
              </div>
            </div>
          </DoshaSection>

          <DoshaSection icon="⚙️" title="Os 5 Fogos do Corpo (Subdoshas)">
            <p className="text-sm text-muted-foreground -mt-2 mb-4">
              Os cinco fogos descrevem os padrões de transformação contínuos. Quando um fogo superaquece, ele inevitavelmente empurra calor para os demais.
            </p>
            <div className="space-y-2">
              <CollapsibleSubdoshaCard number={1} name="Pachaka Pitta" subtitle="A Fornalha (Estômago e Intestino Delgado)" adequate="Sede principal da digestão. Extrai a nutrição do alimento com precisão e eficiência." disturbed="Gera azia e úlceras, empurrando calor para o sangue e inflamando a periferia." />
              <CollapsibleSubdoshaCard number={2} name="Ranjaka Pitta" subtitle="O Radiador (Fígado e Sangue)" adequate="Distribui o calor pelo corpo e dá cor ao sangue. Metaboliza toxinas no fígado." disturbed={'O "sangue ferve", gerando hipertensão, hepatites e inflamações cutâneas.'} />
              <CollapsibleSubdoshaCard number={3} name="Sadhaka Pitta" subtitle="O Discernimento (Mente e Coração)" adequate="Fogo mental que processa informações com clareza. Traz liderança e inteligência." disturbed="Obsessão, raiva controladora e perda do fio da meada." />
              <CollapsibleSubdoshaCard number={4} name="Bhrajaka Pitta" subtitle="A Barreira (Pele)" adequate="Metabolismo da pele saudável. Brilho e luminosidade natural." disturbed="Manchas, rosácea e acne inflamatória — reflexo do transbordamento interno." />
              <CollapsibleSubdoshaCard number={5} name="Alochaka Pitta" subtitle="A Visão (Olhos)" adequate="Metabolismo da luz nos olhos. Visão clara e percepção aguçada." disturbed="Ardência ocular, conjuntivite e fotofobia como manifestação sistêmica." />
            </div>
          </DoshaSection>

          <DoshaSection icon="🔬" title="Patologia dos 5 Fogos (Subdoshas)">
            <div className="space-y-5">
              <AdoecimentoSubdoshaCard number={1} name="Pachaka Pitta" subtitle="A Fornalha Central (Sede Origem)" tagline="Agni Digestivo" description='É a morada do Agni. Quando agrava, o fogo quebra seus limites, deixando de digerir apenas o alimento e passando a consumir e corroer as mucosas corporais (úlcera).' mixEffects={[
                { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: 'Excesso letal de suco gástrico, destruição da mucosa estomacal, azia cortante e sensação de que o estômago "ferve". Fome que gera tremores e raiva.' },
                { emoji: "🌪️", label: "Se misturar com Vata", text: 'O vento "sopra" a fogueira irregularmente. Digestão rápida e ácida, eructação com gosto de ácido e queimação com muitos gases.' },
                { emoji: "⛰️", label: "Se misturar com Kapha", text: "A lama ácida. Há muco na digestão e obesidade gerada por muco ácido intenso. O alimento ferve e azeda, gerando necessidade de purgação." },
              ]} />
              <AdoecimentoSubdoshaCard number={2} name="Ranjaka Pitta" subtitle="Alvo: Plasma e Corrente Sanguínea" tagline="O Sangue e Fígado" description="É a via de transbordamento do fogo. O fígado perde a capacidade de processar a bile corretamente, descarregando calor corrosivo e toxinas no sangue." mixEffects={[
                { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: '"Sangue quente". Icterícia, inflamações hepáticas, febres agudas, infecções fulminantes e explosões de raiva tóxica.' },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "O fogo seca o sangue. Anemia, cansaço extremo, pressão oscilante e baixa, e distribuição irregular de toxinas para as juntas (Gota)." },
                { emoji: "⛰️", label: "Se misturar com Kapha", text: 'O sangue se torna uma "sopa grossa". Colesterol alto, triglicerídeos elevados e acúmulo de gordura letárgica no fígado.' },
              ]} />
              <AdoecimentoSubdoshaCard number={3} name="Sadhaka Pitta" subtitle="O Grande Vilão Psicológico de Pitta" tagline="Discernimento / Mente" description="Quando o fogo do discernimento entra em curto-circuito, a razão torna-se uma ditadura de orgulho e inflamação emocional." mixEffects={[
                { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: "Crença nas próprias mentiras. Comportamento supercrítico, autoritário, vício em trabalho e impaciência destrutiva." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "A Síndrome de Burnout. Ansiedade fervilhante onde a pessoa exige perfeição absoluta enquanto a mente colapsa de esgotamento." },
                { emoji: "⛰️", label: "Se misturar com Kapha", text: "Egoismo denso e rancor profundo. Papel de vítima agressiva-passiva e manifesta uma severa inércia espiritual." },
              ]} />
              <AdoecimentoSubdoshaCard number={4} name="Alochaka Pitta" subtitle="Alvo: Sistema Ocular e Percepção" tagline="A Visão e os Olhos" description='O excesso do calor nos olhos. Em desequilíbrio, a visão "queima" quem vê e quem é visto.' mixEffects={[
                { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: 'Olhos vermelhos, ardência severa e fotofobia. Mentalmente, o indivíduo "quer que o mundo seja linear e perfeito".' },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Percepção visual errática e tiques nervosos. O ressecamento dos canais oculares gera fortes quadros de Glaucoma por tensão." },
                { emoji: "⛰️", label: "Se misturar com Kapha", text: "Visão sem brilho. O calor condensa os fluidos oculares (Catarata). Olhos pesados e cheios de secreções purulentas." },
              ]} />
              <AdoecimentoSubdoshaCard number={5} name="Bhrajaka Pitta" subtitle="Alvo: Epiderme e Glândulas Sudoríparas" tagline="A Barreira da Pele" description="A pele reflete o transbordamento do Pitta digestivo. É este subdosha que explode em forma de supuração e inflamação." mixEffects={[
                { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: "Alergias quentes, manchas vermelhas, espinhas inflamadas, furúnculos e reatividade brutal à exposição solar." },
                { emoji: "🌪️", label: "Se misturar com Vata", text: "Barreira comprometida pelo ressecamento. Infecções fúngicas, descamações ardentes e forte incidência de Vitiligo." },
                { emoji: "⛰️", label: "Se misturar com Kapha", text: "Inflamação obstrui os poros. Acne grave e purulenta (cística), verrugas, pintas vermelhas proeminentes e mucosidade." },
              ]} />
            </div>
          </DoshaSection>
        </>
      )}
    </>
  );
};

export default DoshaPitta;
