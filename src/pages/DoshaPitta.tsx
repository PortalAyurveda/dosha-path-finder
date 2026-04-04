import { Helmet } from "react-helmet-async";
import DoshaHeroBanner from "@/components/dosha/DoshaHeroBanner";
import DoshaSection from "@/components/dosha/DoshaSection";
import PrakritiSection from "@/components/dosha/PrakritiSection";
import OrganList from "@/components/dosha/OrganList";
import BalanceCard from "@/components/dosha/BalanceCard";
import SubdoshaCard from "@/components/dosha/SubdoshaCard";
import NutritionHabits from "@/components/dosha/NutritionHabits";

const DoshaPitta = () => {
  return (
    <>
      <Helmet>
        <title>Guia do Dosha Pitta — Portal Ayurveda</title>
        <meta name="description" content="Tudo sobre o dosha Pitta: corpo físico, órgãos sede, os 5 fogos do corpo, sabores, nutrição e hábitos de ouro para equilibrar Fogo e Água." />
        <link rel="canonical" href="https://portalayurveda.com.br/dosha/pitta" />
      </Helmet>

      <DoshaHeroBanner
        dosha="pitta"
        emoji="☀️"
        title="Pitta"
        elements="Fogo + Água"
        subtitle="Os 5 Fogos do Corpo"
        description='Nascido da junção de Fogo e Água, Pitta é quente e "estressado" por natureza. Ele governa todo o metabolismo, a digestão, a percepção sensorial e a transformação. Operando através de uma inteligência distribuída em cinco fogos, Pitta é a principal fonte de calor que transforma tanto o alimento em nutrientes quanto as experiências em compreensão profunda.'
        badges={["Calor", "Intensidade"]}
      />

      <DoshaSection icon="👤" title="Prakriti (Corpo Físico)">
        <PrakritiSection
          description="O biotipo Pitta é marcado pela intensidade. Apresentam um corpo físico mediano, boa musculatura e facilidade para ganhar ou perder peso. O calor corporal é alto, gerando suor abundante e extremidades frequentemente quentes. São altamente sensíveis ao calor estacional (primavera/verão) e a sabores ácidos e picantes."
          traits={[
            { label: "Olhos", text: "De proporções medianas, com olhar penetrante e analítico. A conjuntiva é mais avermelhada; a esclera pode ser levemente amarelada e aquosa." },
            { label: "Unhas", text: "Macias, flexíveis e com coloração bem avermelhada ou rubrosa, refletindo a forte irrigação sanguínea." },
            { label: "Língua", text: 'Formato em "V" (pontiaguda). Costuma ter coloração mais avermelhada, propensa a inflamações, aftas e saburra amarelada.' },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="📍" title="Órgãos Sede">
        <OrganList
          intro="Cada dosha intoxica primeiro onde consegue se alojar. Para Pitta, a inteligência de transformação atua nestas sedes principais:"
          organs={[
            { name: "Metabolismo Digestivo", description: "A fornalha central. Inclui o Intestino Delgado (sede principal, secreção biliar/acidificação), Fígado (quebra e metabolização), Pâncreas e Estômago (que apesar de ter muco protetor - traço Kapha - é vulnerável a dores e excesso de ácido)." },
            { name: "Sangue", description: "Sede importantíssima que herda a bile/Agni. Quando quente ou intoxicado, expressa-se sistemicamente." },
            { name: "Pele", description: 'O campo de expressão onde Pitta transborda do intestino delgado para o "lado de fora" (causando acne que queima, dermatites e psoríase).' },
            { name: "Discernimento Mental & Olhos", description: "Sede da mente que compreende, processa ideias e metaboliza a percepção visual direta." },
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚖️" title="Balanço Energético">
        <BalanceCard
          equilibriumTitle="🌿 Em Equilíbrio (Agni & Tejas)"
          equilibriumTexts={[
            "O Agni (Fogo Digestivo) atua como uma fornalha bem direcionada pelo fluxo constante de alimentos, extraindo o melhor da nutrição sem superaquecer o corpo, mantendo o brilho saudável da pele e as mucosas protegidas.",
            "O Tejas (Discernimento Mental) traz a capacidade cristalina de organizar ideias. A mente compreende rapidamente o que é dito, com liderança natural e motivação construtiva.",
          ]}
          disturbTitle="⚠️ Em Distúrbio (Ama & Transbordamento)"
          disturbTexts={[
            'Agni Inflamado: Como a natureza de Pitta é estressada, os excessos de ácido do inverno "estouram" na primavera/verão. A digestão fica tão quente e ácida que corrói a mucosa. O calor transborda para o sangue gerando reatividade na pele.',
            "Tejas Obscurecido: A mente perde a clareza e vira um juiz implacável. Isso se converte em irritabilidade severa, críticas mordazes, explosões de raiva e um comportamento ditatorial e workaholic.",
          ]}
        />
      </DoshaSection>

      <DoshaSection icon="⚙️" title="Os 5 Fogos do Corpo (Subdoshas)">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Pitta não é apenas "calor"; é uma inteligência de transformação rigorosa distribuída em cinco centros interdependentes. Quando adoecem, o calor agride e intoxica a cadeia de tecidos.
        </p>
        <div className="space-y-4">
          <SubdoshaCard number={1} name="Pachaka Pitta" subtitle="A Fornalha (Estômago e Intestino Delgado)" adequate="É o subdosha principal, a grande fornalha e sede do Agni que dá base para os outros fogos. Alimentado pelo fluxo constante de alimento, esse fogo ganha direção, processando a nutrição de forma inteligente." disturbed="Quando excessivo ou irritado, a digestão fica extremamente ácida e dolorosa (úlcera, azia). Ao intoxicar, ele empurra agressivamente o excesso de calor e bile para os próximos tecidos da cadeia, atingindo o sangue." />
          <SubdoshaCard number={2} name="Ranjaka Pitta" subtitle="O Radiador (Sangue e Fígado)" adequate={'O sangue é o primeiro tecido produzido e "herda" diretamente o Agni/bile da digestão. Ranjaka Pitta atua como o radiador de um carro: utiliza o sistema circulatório girando pelo corpo para dissipar, distribuir e regular perfeitamente esse calor.'} disturbed={'Se o "radiador" falha, o sangue ferve. A carga de calor excessiva gera hipertensão arterial e transborda imediatamente para a periferia, expressando-se como borbulhas, inflamações severas e pele muito reativa (acne, vermelhidão).'} />
          <SubdoshaCard number={3} name="Sadhaka Pitta" subtitle="O Discernimento (Mente)" adequate="É o fogo mental. Governa a capacidade de compreender o que é dito, organizar informações e transformar percepções cruas em sabedoria e conhecimento articulado." disturbed='A informação fica confusa e a mente perde o fio da meada. (Dica: Um pouco de chai morno antes dos estudos pode estimular levemente o Agni, "acordando" Sadhaka Pitta para clarear a compreensão).' />
          <SubdoshaCard number={4} name="Bhrajaka Pitta" subtitle="A Barreira (Pele)" adequate="A pele também é um órgão de metabolismo que transforma e processa o que colocamos sobre ela, refletindo nossa saúde interna através de um brilho macio e natural." disturbed="Recebe o transbordamento direto do intestino/sangue. Manifesta erupções avermelhadas, rosácea, acne inflamatória e manchas, agravando-se drasticamente ao tomar sol sem a devida proteção." />
          <SubdoshaCard number={5} name="Alochaka Pitta" subtitle="A Visão (Olhos)" adequate="Governa a saúde ótica e o metabolismo da luz, cores e formas. Trabalha junto com a mente para uma percepção de mundo nítida, equilibrada e não agressiva." disturbed="Manifesta a irritação sistêmica na forma de calor ocular, ardência, fotofobia e condições inflamatórias evidentes e incômodas, como a conjuntivite." />
        </div>
      </DoshaSection>

      <DoshaSection icon="🍲" title="Sabores & Nutrição / Hábitos de Ouro">
        <NutritionHabits
          approachTitle="Aproximar (Doce, Amargo, Adstringente)"
          approachText='Pitta é ardente. Para apagá-lo, o corpo necessita de peso, frio e alcalinidade. A regra de ouro é: Sabor Doce antes das refeições para "assentar" o fogo (ex: coma uma tâmara hidratada para proteger a mucosa se o fogo estiver queimando demais). Sabor Amargo depois das refeições para "fechar" o processo e reduzir a hiperprodução de enzimas.'
          approachDetail="Privilegie: Dieta refrescante e alcalinizante. Arroz branco, basmati ou jasmim (são mais estáveis; evite o integral que exige muito ácido). Peras, melão e coco. Abasteça-se de folhas amargas e adicione Ghee nas refeições (1 colher de sopa/dia) por suas propriedades doces, pesadas e frias que acalmam Pitta perfeitamente."
          avoidTitle="Evitar (Ácido, Picante, Salgado)"
          avoidText="Altamente sensíveis a qualquer acidez. O sabor Picante atrita a digestão e o sangue como querosene no fogo. Preste muita atenção aos gatilhos ácidos que, se consumidos no inverno, \"estouram\" em forma de doenças na primavera e no verão."
          avoidDetail="Fuja de acidificantes diários: Tomate, pimentão, berinjela, conservas, enlatados, embutidos, vinagre e shoyu. Evite frutas cítricas e azeite quando Pitta estiver agravado. Corte picantes extremos (pimenta malagueta, pimenta-do-reino, calabresa)."
          doItems={[
            "Mantenha a mucosa digestiva como prioridade máxima: proteja o estômago antes de comer se ele estiver irritado.",
            "Hidratação alcalinizante para baixar o fogo: beba água de coco fresca ou água de coentro/salsinha (deixe 1 ramo em infusão em 1,5L de água por 2h).",
            'Mastigue folhas amargas (agrião ou rúcula) no fim da refeição para "finalizar" a boca, em vez de escovar os dentes imediatamente.',
            "Se sentir que vai agravar (ou se errou num doce que serve de gatilho), faça um jejum bem curto focado apenas em hidratação refrescante.",
            'Estratégia pontual para sangue quente: a doação de sangue pode ser usada como "sangria terapêutica" para aliviar o fogo sistêmico, cuidando para não se desvitalizar.',
          ]}
          dontItems={[
            "Não comece a refeição com salada fria! O Agni alto precisa de substância primeiro; deixe o amargo e o frio das folhas para o final.",
            "Pular refeições: um Agni irritado sem comida agride a própria mucosa gástrica e inflama o sangue.",
            "Redobre a atenção e evite totalmente sol forte e alimentos ácidos em climas quentes/úmidos (primavera e verão).",
            "Rotinas puramente intelectuais sem pausas de relaxamento; a mente hiperativa ferve Sadhaka Pitta.",
          ]}
        />
      </DoshaSection>
    </>
  );
};

export default DoshaPitta;
