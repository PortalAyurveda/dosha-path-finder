import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const TerapeutasDoBrasil = () => {
  return (
    <PageContainer title="Terapeutas do Brasil" description="Diretório de terapeutas ayurvédicos qualificados no Brasil.">
      <SectionTitle as="h1" subtitle="Encontre terapeutas ayurvédicos qualificados perto de você.">
        Terapeutas do Brasil
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground text-lg">🌿 O diretório de terapeutas será lançado em breve.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default TerapeutasDoBrasil;
