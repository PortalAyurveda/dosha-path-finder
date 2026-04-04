import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";

const Biblioteca = () => {
  return (
    <PageContainer title="Biblioteca" description="Acervo de conteúdos sobre Ayurveda: artigos, vídeos e materiais educativos.">
      <SectionTitle as="h1" subtitle="Artigos, vídeos e materiais para aprofundar seu conhecimento.">
        Biblioteca Ayurveda
      </SectionTitle>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-12 rounded-2xl bg-surface-sun border border-border">
          <p className="text-muted-foreground text-lg">📚 O acervo será carregado aqui em breve.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Biblioteca;
