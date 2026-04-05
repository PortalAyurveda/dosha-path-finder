import { Helmet } from "react-helmet-async";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaSection from "@/components/dosha/DoshaSection";
import SubdoshaCard from "@/components/dosha/SubdoshaCard";
import AdoecimentoSubdoshaCard from "@/components/dosha/AdoecimentoSubdoshaCard";
import CollapsibleSubdoshaCard from "@/components/dosha/CollapsibleSubdoshaCard";
import { AlertTriangle, Droplets } from "lucide-react";

const DoshaVataAdoecimento = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Dosha Vata e Subdoshas — Avançado | Portal Ayurveda</title>
        <meta name="description" content="Diagnóstico avançado do adoecimento de Vata: fisiopatologia dos 5 ventos (Vayus), sinais na língua, pulso, excreções e misturas com Pitta e Kapha." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/vata/adoecimento" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vata/10 via-background to-vata/5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-vata">Uso Clínico e Diagnóstico</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            Dosha Vata e Subdoshas — Avançado
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Desintegração do Movimento e o Ressecamento Sistêmico
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

      {/* Subdoshas — Adequado/Distúrbio */}
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

      {/* Patologia dos 5 Ventos */}
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
  );
};

export default DoshaVataAdoecimento;
