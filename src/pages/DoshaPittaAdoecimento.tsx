import { Helmet } from "react-helmet-async";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaSection from "@/components/dosha/DoshaSection";
import AdoecimentoSubdoshaCard from "@/components/dosha/AdoecimentoSubdoshaCard";
import { AlertTriangle, Droplets } from "lucide-react";

const DoshaPittaAdoecimento = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Adoecimento de Pitta — Fisiopatologia Avançada | Portal Ayurveda</title>
        <meta name="description" content="Diagnóstico avançado do adoecimento de Pitta: fisiopatologia dos 5 fogos, sinais na língua, pulso, excreções e misturas com Vata e Kapha." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/pitta/adoecimento" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pitta/10 via-background to-pitta/5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-pitta">Uso Clínico e Diagnóstico</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            Fisiopatologia de Pitta
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Fermentação, o Calor Excessivo e a Corrosão Sistêmica
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Este compêndio avançado detalha a fisiopatologia dos subdoshas. Focado na investigação de Vikriti (desequilíbrio), explora como os doshas perdem o ritmo, como transbordam de suas sedes e como se misturam (Samsarga) gerando quadros clínicos complexos, sinais na língua, pulsologia e eliminações.
          </p>
        </div>
      </section>

      {/* Sinais Diagnósticos */}
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

      {/* Patologia dos 5 Fogos */}
      <DoshaSection icon="⚙️" title="Patologia dos 5 Fogos (Subdoshas)">
        <div className="space-y-5">
          <AdoecimentoSubdoshaCard
            number={1}
            name="Pachaka Pitta"
            subtitle="A Fornalha Central (Sede Origem)"
            tagline="Agni Digestivo"
            description='É a morada do Agni. Quando agrava, o fogo quebra seus limites, deixando de digerir apenas o alimento e passando a consumir e corroer as mucosas corporais (úlcera).'
            mixEffects={[
              { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: 'Excesso letal de suco gástrico, destruição da mucosa estomacal, azia cortante e sensação de que o estômago "ferve". Fome que gera tremores e raiva.' },
              { emoji: "🌪️", label: "Se misturar com Vata", text: 'O vento "sopra" a fogueira irregularmente. Digestão rápida e ácida, eructação com gosto de ácido e queimação com muitos gases.' },
              { emoji: "⛰️", label: "Se misturar com Kapha", text: "A lama ácida. Há muco na digestão e obesidade gerada por muco ácido intenso. O alimento ferve e azeda, gerando necessidade de purgação." },
            ]}
          />

          <AdoecimentoSubdoshaCard
            number={2}
            name="Ranjaka Pitta"
            subtitle="Alvo: Plasma e Corrente Sanguínea"
            tagline="O Sangue e Fígado"
            description="É a via de transbordamento do fogo. O fígado perde a capacidade de processar a bile corretamente, descarregando calor corrosivo e toxinas no sangue."
            mixEffects={[
              { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: '"Sangue quente". Icterícia, inflamações hepáticas, febres agudas, infecções fulminantes e explosões de raiva tóxica.' },
              { emoji: "🌪️", label: "Se misturar com Vata", text: "O fogo seca o sangue. Anemia, cansaço extremo, pressão oscilante e baixa, e distribuição irregular de toxinas para as juntas (Gota)." },
              { emoji: "⛰️", label: "Se misturar com Kapha", text: 'O sangue se torna uma "sopa grossa". Colesterol alto, triglicerídeos elevados e acúmulo de gordura letárgica no fígado.' },
            ]}
          />

          <AdoecimentoSubdoshaCard
            number={3}
            name="Sadhaka Pitta"
            subtitle="O Grande Vilão Psicológico de Pitta"
            tagline="Discernimento / Mente"
            description="Quando o fogo do discernimento entra em curto-circuito, a razão torna-se uma ditadura de orgulho e inflamação emocional."
            mixEffects={[
              { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: "Crença nas próprias mentiras. Comportamento supercrítico, autoritário, vício em trabalho e impaciência destrutiva." },
              { emoji: "🌪️", label: "Se misturar com Vata", text: "A Síndrome de Burnout. Ansiedade fervilhante onde a pessoa exige perfeição absoluta enquanto a mente colapsa de esgotamento." },
              { emoji: "⛰️", label: "Se misturar com Kapha", text: "Egoismo denso e rancor profundo. Papel de vítima agressiva-passiva e manifesta uma severa inércia espiritual." },
            ]}
          />

          <AdoecimentoSubdoshaCard
            number={4}
            name="Alochaka Pitta"
            subtitle="Alvo: Sistema Ocular e Percepção"
            tagline="A Visão e os Olhos"
            description='O excesso do calor nos olhos. Em desequilíbrio, a visão "queima" quem vê e quem é visto. O indivíduo torna-se intolerante ao diferente.'
            mixEffects={[
              { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: 'Olhos vermelhos, ardência severa e fotofobia. Mentalmente, o indivíduo "quer que o mundo seja linear e perfeito".' },
              { emoji: "🌪️", label: "Se misturar com Vata", text: "Percepção visual errática e tiques nervosos. O ressecamento dos canais oculares gera fortes quadros de Glaucoma por tensão." },
              { emoji: "⛰️", label: "Se misturar com Kapha", text: "Visão sem brilho. O calor condensa os fluidos oculares (Catarata). Olhos pesados e cheios de secreções purulentas." },
            ]}
          />

          <AdoecimentoSubdoshaCard
            number={5}
            name="Bhrajaka Pitta"
            subtitle="Alvo: Epiderme e Glândulas Sudoríparas"
            tagline="A Barreira da Pele"
            description="A pele reflete o transbordamento do Pitta digestivo. É este subdosha que explode em forma de supuração e inflamação."
            mixEffects={[
              { emoji: "🔥", label: "Puro Pitta (Fogo+Água)", text: "Alergias quentes, manchas vermelhas, espinhas inflamadas, furúnculos e reatividade brutal à exposição solar." },
              { emoji: "🌪️", label: "Se misturar com Vata", text: "Barreira comprometida pelo ressecamento. Infecções fúngicas, descamações ardentes e forte incidência de Vitiligo." },
              { emoji: "⛰️", label: "Se misturar com Kapha", text: "Inflamação obstrui os poros. Acne grave e purulenta (cística), verrugas, pintas vermelhas proeminentes e mucosidade." },
            ]}
          />
        </div>
      </DoshaSection>
    </>
  );
};

export default DoshaPittaAdoecimento;
