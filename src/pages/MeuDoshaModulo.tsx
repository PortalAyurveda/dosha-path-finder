import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useUser } from "@/contexts/UserContext";
import SecoesSlot from "@/components/secoes/SecoesSlot";

const MeuDoshaModulo = () => {
  const { modulo = "" } = useParams();
  const navigate = useNavigate();
  const { user, isAnonymous, loading } = useUser();

  if (!/^[a-z0-9_]{1,40}$/.test(modulo)) return <Navigate to="/meu-dosha" replace />;
  if (loading) {
    return (
      <PageContainer title="Meu Dosha" description="Carregando..." noindex>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }
  if (!user || isAnonymous) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(`/meu-dosha/${modulo}`)}`} replace />;
  }
  return (
    <PageContainer title="Meu Dosha" description="Sua página pessoal no Portal Ayurveda" noindex>
      <div className="max-w-3xl mx-auto">
        <SecoesSlot
          slot={`meu_dosha_${modulo}`}
          alturaMinima={700}
          aoRefazerTeste={() => navigate("/meu-dosha")}
          fallback={
            <div className="py-12 text-center space-y-4">
              <p className="text-lg text-foreground">Não deu para abrir esta parte agora.</p>
              <Link to="/meu-dosha" className="inline-flex items-center gap-2 text-lg font-bold underline min-h-[48px] text-foreground">
                <ArrowLeft className="w-6 h-6" />
                Voltar para Meu Dosha
              </Link>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
};

export default MeuDoshaModulo;