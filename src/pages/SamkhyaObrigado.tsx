import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2 } from "lucide-react";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import { useCart } from "@/contexts/CartContext";
import { trackPixel } from "@/lib/metaPixel";

const SamkhyaObrigado = () => {
  const { limparCarrinho } = useCart();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    limparCarrinho();
    trackPixel("Purchase", { currency: "BRL", content_type: "product" });
  }, [limparCarrinho]);

  return (
    <>
      <Helmet>
        <title>Obrigado pela sua compra — Loja Samkhya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SamkhyaLayout>
        <div className="max-w-xl mx-auto text-center py-16 md:py-24 flex flex-col items-center gap-6">
          <CheckCircle2 className="h-16 w-16" style={{ color: samkhyaTokens.ouro }} />
          <h1
            className="text-3xl md:text-4xl"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Obrigado pela sua compra
          </h1>
          <p style={{ color: samkhyaTokens.textoSec }} className="text-base leading-relaxed">
            Seu pedido foi recebido com sucesso. Você receberá em breve um email com os detalhes da compra e o código de rastreio assim que despachado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {sessionId && (
              <Link
                to={`/samkhya/pedido/${sessionId}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md text-white text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: samkhyaTokens.roxo }}
              >
                Acompanhar meu pedido
              </Link>
            )}
            <Link
              to="/samkhya"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium border transition hover:bg-white"
              style={{ borderColor: samkhyaTokens.roxo, color: samkhyaTokens.roxo }}
            >
              Voltar à loja
            </Link>
          </div>
        </div>
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaObrigado;
