import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { toast } = useToast();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get("redirect") || "/meu-dosha";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, searchParams]);

  // Store pending claim id
  useEffect(() => {
    const idPublico = searchParams.get("claim");
    if (idPublico) {
      localStorage.setItem("pendingClaimIdPublico", idPublico);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome },
      },
    });

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Conta criada!",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Entrar | Portal Ayurveda</title>
        <meta name="description" content="Acesse sua conta no Portal Ayurveda para acompanhar seus doshas e evolução." />
      </Helmet>

      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Portal Ayurveda
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {mode === "signup" ? "Crie sua conta" : "Acesse sua conta"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "signup"
                ? "Tome posse do seu teste e inicie sua jornada"
                : "Entre para acessar seus resultados e evolução"}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            {(["login", "signup", "magic"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMagicSent(false); }}
                className={`flex-1 py-2 px-3 text-sm rounded-md font-medium transition-colors ${
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Entrar" : m === "signup" ? "Cadastrar" : "Magic Link"}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {mode === "magic" ? (
              magicSent ? (
                <div className="text-center space-y-3 py-4">
                  <Mail className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-foreground font-medium">Link enviado!</p>
                  <p className="text-muted-foreground text-sm">
                    Verifique seu e-mail e clique no link para entrar automaticamente.
                  </p>
                </div>
              ) : (
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
                    Enviar Magic Link
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </Button>
              </form>
            )}
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Auth;
