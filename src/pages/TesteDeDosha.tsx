import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const TesteDeDosha = () => {
  return (
    <PageContainer title="Teste de Dosha" description="Descubra seu dosha predominante com nosso teste personalizado baseado no Ayurveda.">
      <SectionTitle as="h1" subtitle="Responda as perguntas abaixo para descobrir seu biotipo ayurvédico.">
        Teste de Dosha
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground text-lg">🧘 O teste será carregado aqui em breve.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default TesteDeDosha;
