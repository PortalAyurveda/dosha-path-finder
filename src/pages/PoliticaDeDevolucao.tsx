import { Helmet } from "react-helmet-async";
import PageContainer from "@/components/PageContainer";

const PoliticaDeDevolucao = () => {
  return (
    <>
      <PageContainer
        title="Trocas e devoluções | Samkhya"
        description="Política de trocas e devoluções da loja Samkhya, do Portal Ayurveda."
      >
        <div className="prose prose-lg max-w-3xl mx-auto text-foreground">
          <h1 className="text-3xl font-heading font-bold text-primary mb-8">
            Trocas e devoluções
          </h1>
          <p className="text-muted-foreground mb-6">
            Esta política vale para as compras feitas na loja Samkhya, dentro do Portal Ayurveda.
          </p>

          <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Desistência da compra</h2>
          <p className="text-muted-foreground mb-4">
            Você pode desistir da compra em até 7 dias corridos, contados a partir do dia em que recebeu o pedido. O produto precisa estar fechado, sem uso e na embalagem original. Devolvemos o valor total pago, incluindo o frete.
          </p>

          <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Produto com defeito ou danificado</h2>
          <p className="text-muted-foreground mb-4">
            Se o produto chegar com defeito, danificado ou diferente do que você pediu, avise em até 30 dias depois de receber. Trocamos por um produto igual, sem custo para você.
          </p>

          <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Frete</h2>
          <p className="text-muted-foreground mb-4">
            O frete da devolução e da troca é por nossa conta. Depois do seu contato, enviamos as instruções para o envio.
          </p>

          <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Reembolso</h2>
          <p className="text-muted-foreground mb-4">
            O valor volta pelo mesmo meio de pagamento da compra, em até 7 dias úteis depois que o produto chega até nós. No cartão de crédito, o estorno aparece na fatura conforme o prazo do seu banco.
          </p>

          <h2 className="text-xl font-heading font-semibold text-primary mt-8 mb-3">Como pedir</h2>
          <p className="text-muted-foreground mb-4">
            Escreva para contato@portalayurveda.com com o número do pedido e conte o que aconteceu. Se for defeito ou dano, mande uma foto do produto.
          </p>
        </div>
      </PageContainer>
      {/* Depois do PageContainer para valer o título exato, sem o sufixo "— Portal Ayurveda". */}
      <Helmet defer={false}>
        <title>Trocas e devoluções | Samkhya</title>
        <meta name="description" content="Política de trocas e devoluções da loja Samkhya, do Portal Ayurveda." />
        <link rel="canonical" href="https://portalayurveda.com/politica-de-devolucao" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Trocas e devoluções | Samkhya" />
        <meta property="og:description" content="Política de trocas e devoluções da loja Samkhya, do Portal Ayurveda." />
        <meta property="og:url" content="https://portalayurveda.com/politica-de-devolucao" />
        <meta property="og:site_name" content="Portal Ayurveda" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trocas e devoluções | Samkhya" />
        <meta name="twitter:description" content="Política de trocas e devoluções da loja Samkhya, do Portal Ayurveda." />
      </Helmet>
    </>
  );
};

export default PoliticaDeDevolucao;
