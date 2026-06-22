import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package } from "lucide-react";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import PedidoCard, { PedidoListItem } from "@/components/samkhya/pedido/PedidoCard";
import { Skeleton } from "@/components/ui/skeleton";

const SamkhyaCompras = () => {
  const { user, loading: userLoading } = useUser();
  const [pedidos, setPedidos] = useState<PedidoListItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.functions
      .invoke("meus-pedidos")
      .then(({ data, error }) => {
        if (error || !data) {
          setPedidos([]);
        } else {
          setPedidos((data as any).pedidos ?? []);
        }
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [user, userLoading]);

  return (
    <>
      <Helmet>
        <title>Minhas compras — Loja Samkhya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SamkhyaLayout>
        <div className="max-w-3xl mx-auto py-6 md:py-10">
          <h1
            className="text-3xl md:text-4xl mb-6"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
          >
            Minhas compras
          </h1>

          {(userLoading || (user && loading)) && (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          )}

          {!userLoading && !user && (
            <div
              className="rounded-lg border p-8 text-center bg-white"
              style={{ borderColor: samkhyaTokens.cardBorder }}
            >
              <p className="mb-4" style={{ color: samkhyaTokens.textoSec }}>
                Entre para ver o histórico das suas compras.
              </p>
              <Link
                to={`/entrar?redirect=${encodeURIComponent("/samkhya/compras")}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-white text-sm font-medium"
                style={{ background: samkhyaTokens.roxo }}
              >
                Entrar
              </Link>
            </div>
          )}

          {!loading && user && pedidos && pedidos.length === 0 && (
            <div
              className="rounded-lg border p-10 text-center bg-white flex flex-col items-center gap-4"
              style={{ borderColor: samkhyaTokens.cardBorder }}
            >
              <Package className="w-12 h-12" style={{ color: samkhyaTokens.ouro }} />
              <p style={{ color: samkhyaTokens.textoSec }}>
                Você ainda não tem compras.
              </p>
              <Link
                to="/samkhya"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-white text-sm font-medium"
                style={{ background: samkhyaTokens.roxo }}
              >
                Ir às compras
              </Link>
            </div>
          )}

          {!loading && user && pedidos && pedidos.length > 0 && (
            <div className="space-y-3">
              {pedidos.map((p) => (
                <PedidoCard key={p.session_id} pedido={p} />
              ))}
            </div>
          )}
        </div>
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaCompras;
