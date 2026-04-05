import { Helmet } from "react-helmet-async";
import DoshaSelector from "@/components/dosha/DoshaSelector";
import DoshaSection from "@/components/dosha/DoshaSection";
import CollapsibleSubdoshaCard from "@/components/dosha/CollapsibleSubdoshaCard";
import AdoecimentoSubdoshaCard from "@/components/dosha/AdoecimentoSubdoshaCard";
import { AlertTriangle, Droplets } from "lucide-react";

const DoshaKaphaAdoecimento = () => {
  return (
    <>
      <DoshaSelector />
      <Helmet>
        <title>Dosha Kapha e Subdoshas — Avançado | Portal Ayurveda</title>
        <meta name="description" content="Diagnóstico avançado do adoecimento de Kapha: fisiopatologia das 5 mucosas, sinais na língua, pulso, excreções e misturas com Vata e Pitta." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/kapha/adoecimento" />
      </Helmet>

      <section className="relative overflow-hidden bg-gradient-to-br from-kapha/10 via-background to-kapha/5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-kapha">Uso Clínico e Diagnóstico</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            Dosha Kapha e Subdoshas — Avançado
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Estagnação, o Bloqueio de Canais e o Afogamento Celular
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Este compêndio avançado detalha a fisiopatologia dos subdoshas. Focado na investigação de Vikriti (desequilíbrio), explora como os doshas perdem o ritmo, como transbordam de suas sedes e como se misturam (Samsarga) gerando quadros clínicos complexos, sinais na língua, pulsologia e eliminações.
          </p>
        </div>
      </section>

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

      {/* Subdoshas — Adequado/Distúrbio */}
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
  );
};

export default DoshaKaphaAdoecimento;
