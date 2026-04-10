import PageContainer from "@/components/PageContainer";

const PoliticaDePrivacidade = () => {
  return (
    <PageContainer
      title="Política de Privacidade"
      description="Saiba como o Portal Ayurveda trata seus dados pessoais."
    >
      <div className="prose prose-lg max-w-3xl mx-auto text-foreground">
        <h1 className="text-3xl font-heading font-bold text-primary mb-8">
          Política de Privacidade — Portal Ayurveda
        </h1>
        <p className="text-muted-foreground mb-6">
          Esta política explica como o Portal Ayurveda trata seus dados ao utilizar o login do Google:
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Dados Coletados</h2>
        <p className="text-muted-foreground mb-4">
          Coletamos apenas seu nome e e-mail fornecidos pelo Google para criar e identificar sua conta de membro.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Finalidade</h2>
        <p className="text-muted-foreground mb-4">
          Utilizamos esses dados exclusivamente para liberar seu acesso aos cursos e conteúdos restritos da plataforma.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Compartilhamento</h2>
        <p className="text-muted-foreground mb-4">
          Não vendemos ou compartilhamos seus dados com terceiros. Eles são usados apenas internamente para a gestão da sua assinatura.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Segurança</h2>
        <p className="text-muted-foreground mb-4">
          Seus dados são armazenados em ambiente seguro (Supabase) com proteção de acesso.
        </p>

        <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Contato</h2>
        <p className="text-muted-foreground mb-4">
          Para solicitar a exclusão de seus dados, envie um e-mail para{" "}
          <a href="mailto:portalayurveda@gmail.com" className="text-accent hover:underline">
            portalayurveda@gmail.com
          </a>.
        </p>
      </div>
    </PageContainer>
  );
};

export default PoliticaDePrivacidade;
