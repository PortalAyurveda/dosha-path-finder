import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { useUser } from "@/contexts/UserContext";
import FaixaAviso from "@/components/FaixaAviso";
import { Sparkles } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const { user, isAnonymous } = useUser();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {(() => {
        if (user && !isAnonymous) return null;
        const r = searchParams.get("redirect") ?? "";
        const caminho = r.split(/[?#]/)[0].replace(/\/+$/, "");
        const texto = /^\/cursos\/[^/]+\/(estudar|imprimir)(\/[^/]+)?$/.test(caminho)
          ? "Para abrir o seu curso, entre com o email que você usou na compra."
          : r.startsWith("/curso")
          ? "Para comprar este curso, faça login ou crie sua conta."
          : r.startsWith("/assinar")
            ? "Para assinar um plano, faça login ou crie sua conta."
            : r.startsWith("/revisao")
              ? "Para ver sua Revisão Mensal, faça login."
              : null;
        return texto ? <FaixaAviso texto={texto} /> : null;
      })()}
      <PageContainer title="Entrar" description="Acesse sua conta no Portal Ayurveda para acompanhar seus doshas e evolução.">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Portal Ayurveda
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Entre ou crie sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Use seu e-mail abaixo. Se ainda não tiver conta, criamos uma na hora — sem senha.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </PageContainer>
    </>
  );
};

export default Auth;
