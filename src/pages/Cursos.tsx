import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const Cursos = () => {
  return (
    <PageContainer title="Cursos" description="Área de membros com cursos e formações em Ayurveda.">
      <SectionTitle as="h1" subtitle="Cursos e formações para sua jornada no Ayurveda.">
        Cursos
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sky border border-border">
          <p className="text-muted-foreground text-lg">🎓 A área de cursos será lançada em breve.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Cursos;
