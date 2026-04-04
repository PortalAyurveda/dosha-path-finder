import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const MeuDosha = () => {
  return (
    <PageContainer title="Meu Dosha" description="Veja seu resultado personalizado do teste de dosha e receba recomendações.">
      <SectionTitle as="h1" subtitle="Sua análise personalizada baseada nas suas respostas.">
        Meu Dosha
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sky border border-border">
          <p className="text-muted-foreground text-lg">📊 Seus resultados aparecerão aqui após o teste.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default MeuDosha;
