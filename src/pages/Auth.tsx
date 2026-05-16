import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [waitingForDosha, setWaitingForDosha] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, doshaResult } = useUser();
  const { toast } = useToast();

  // When user logs in, wait briefly for doshaResult then redirect
  useEffect(() => {
    if (user && !waitingForDosha) {
      setWaitingForDosha(true);
    }
  }, [user]);

  useEffect(() => {
    if (!waitingForDosha) return;
    if (doshaResult?.idPublico) {
      navigate(`/meu-dosha?id=${doshaResult.idPublico}`, { replace: true });
      return;
    }
    // Fallback: if no dosha result after 3s, go to home
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [waitingForDosha, doshaResult, navigate]);

  useEffect(() => {
    const idPublico = searchParams.get("claim");
    if (idPublico) {
      localStorage.setItem("pendingClaimIdPublico", idPublico);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const storedDoshaId = localStorage.getItem("activeDoshaId");
    const redirectUrl = storedDoshaId
      ? `${window.location.origin}/meu-dosha?id=${storedDoshaId}`
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const storedDoshaId = localStorage.getItem("activeDoshaId");
    const redirectUrl = storedDoshaId
      ? `${window.location.origin}/meu-dosha?id=${storedDoshaId}`
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  };


  return (
    <PageContainer title="Entrar" description="Acesse sua conta no Portal Ayurveda para acompanhar seus doshas e evolução.">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Portal Ayurveda
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Entre para acessar seus resultados e evolução
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            {magicSent ? (
              <div className="text-center space-y-3 py-4">
                <Mail className="w-12 h-12 mx-auto text-primary" />
                <p className="text-foreground font-medium">Link enviado!</p>
                <p className="text-muted-foreground text-sm">
                  Verifique seu e-mail e clique no link para entrar automaticamente.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMagicSent(false)}
                  className="mt-2"
                >
                  Tentar outro e-mail
                </Button>
              </div>
            ) : (
              <>
                {/* Magic Link form */}
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar link de acesso
                  </Button>
                </form>

              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Auth;
