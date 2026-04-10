import PageContainer from "@/components/PageContainer";

const TermosDeUso = () => {
  return (
    <PageContainer
      title="Termos de Uso"
      description="Termos de uso do Portal Ayurveda — Samkhya Ayurveda LTDA."
    >
      <div className="prose prose-lg max-w-3xl mx-auto text-foreground">
        <h1 className="text-3xl font-heading font-bold text-primary mb-8">
          Termos de Uso — Portal Ayurveda
        </h1>
        <p className="text-muted-foreground mb-6">
          Ao acessar o Portal Ayurveda, de propriedade da <strong>Samkhya Ayurveda LTDA</strong>, você concorda com os seguintes termos:
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Uso da Conta</h2>
        <p className="text-muted-foreground mb-4">
          O login via Google é pessoal e intransferível. Você é responsável pela segurança do seu acesso.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Propriedade Intelectual</h2>
        <p className="text-muted-foreground mb-4">
          Todo o conteúdo (vídeos, textos e materiais) pertence ao Portal Ayurveda e não pode ser reproduzido sem autorização.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Conteúdo Educativo</h2>
        <p className="text-muted-foreground mb-4">
          As informações aqui contidas têm caráter exclusivamente educativo sobre Ayurveda e não substituem consulta médica ou tratamentos de saúde profissionais.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Cancelamento</h2>
        <p className="text-muted-foreground mb-4">
          Reservamo-nos o direito de suspender acessos que violem as regras de conduta da comunidade ou em casos de inadimplência.
        </p>
      </div>
    </PageContainer>
  );
};

export default TermosDeUso;
