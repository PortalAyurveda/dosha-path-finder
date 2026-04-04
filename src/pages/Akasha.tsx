import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const Akasha = () => {
  return (
    <PageContainer title="Akasha IA" description="Dashboard de inteligência artificial para orientações personalizadas de Ayurveda.">
      <SectionTitle as="h1" subtitle="Sua assistente pessoal de Ayurveda com inteligência artificial.">
        Akasha — I.A. Ayurveda
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sky border border-border">
          <p className="text-muted-foreground text-lg">🤖 A inteligência Akasha será ativada em breve.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Akasha;
