import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Sparkles, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "link" | "confirm">("email");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [waitingForDosha, setWaitingForDosha] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, doshaResult } = useUser();
  const { toast } = useToast();

  const isInstagram = useMemo(
    () => typeof navigator !== "undefined" && /Instagram/i.test(navigator.userAgent),
    []
  );

  const getIsMicrosoftEmail = (mail: string) => {
    const dominio = mail.split("@")[1]?.toLowerCase() ?? "";
    return /(outlook|hotmail|live|msn)\./.test(dominio);
  };

  useEffect(() => {
    if (user && !waitingForDosha) {
      setWaitingForDosha(true);
    }
  }, [user]);

  useEffect(() => {
    if (!waitingForDosha) return;
    const redirectParam = searchParams.get("redirect");
    const safeRedirect =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : null;
    if (safeRedirect) {
      navigate(safeRedirect, { replace: true });
      return;
    }
    const fallbackId = searchParams.get("claim") || doshaResult?.idPublico || localStorage.getItem("activeDoshaId");
    if (fallbackId) {
      navigate(`/meu-dosha?id=${fallbackId}`, { replace: true });
      return;
    }
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

  useEffect(() => {
    const claimId = searchParams.get("claim");
    if (!claimId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("email")
        .eq("idPublico", claimId)
        .maybeSingle();
      if (!cancelled && data?.email) setEmail(data.email);
    })();
    return () => { cancelled = true; };
  }, [searchParams]);

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (tokenHash && type) {
      setStep("confirm");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
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
      setGoogleLoading(false);
    }
  };

  // ⚠️ Fluxo de envio do email de autenticação.
  // Por padrão usamos OTP (código de 6 dígitos) — NÃO adicionar `emailRedirectTo`
  // no ramo OTP, isso reabriria o bug de alternância entre magic link e código
  // no mesmo email enviado pelo Supabase.
  //
  // Exceção: quando estamos dentro do navegador do Instagram E o email NÃO é
  // Microsoft (outlook/hotmail/live/msn), usamos magic link — o navegador
  // in-app do Instagram quebra a colagem do código OTP. Nesse caso
  // `emailRedirectTo` e `data.contexto: "magiclink"` são intencionais e o
  // template do Supabase precisa ser condicional ao contexto para escolher
  // entre `{{ .Token }}` (otp) e `{{ .ConfirmationURL }}` (magiclink).
  const sendOtp = async (contexto: "otp" | "magiclink") => {
    const options: any = { shouldCreateUser: true, data: { contexto } };
    if (contexto === "magiclink") {
      const idParaClaim = searchParams.get("claim") || localStorage.getItem("activeDoshaId");
      options.emailRedirectTo = idParaClaim
        ? `${window.location.origin}/entrar?claim=${idParaClaim}`
        : `${window.location.origin}/entrar`;
    }
    try {
      await supabase.functions.invoke("preparar-login", { body: { email, contexto } });
    } catch (_) { /* não bloquear o login */ }
    const { error } = await supabase.auth.signInWithOtp({ email, options });
    if (error) throw error;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const usarMagicLink = isInstagram && !getIsMicrosoftEmail(email);
      const contexto = usarMagicLink ? "magiclink" : "otp";
      await sendOtp(contexto);
      if (usarMagicLink) {
        setStep("link");
      } else {
        setStep("code");
        setCode("");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const contexto = step === "link" ? "magiclink" : "otp";
      await sendOtp(contexto);
      toast({
        title: contexto === "magiclink" ? "Link reenviado" : "Código reenviado",
        description: `Verifique seu e-mail ${email}.`,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setResending(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) {
      toast({
        title: "Código inválido",
        description: "Código inválido ou expirado. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
    // sucesso: useEffect cuida do redirect
  };

  const handleConfirmLink = async () => {
    setLoading(true);
    const token_hash = searchParams.get("token_hash") || "";
    const type = searchParams.get("type") || "";
    let { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: (type as any) || "email",
    });
    if (error && type !== "email") {
      const result = await supabase.auth.verifyOtp({ token_hash, type: "email" });
      error = result.error;
    }
    if (error) {
      toast({
        title: "Link expirado",
        description: "Este link já foi usado ou expirou. Peça um novo abaixo.",
        variant: "destructive",
      });
      setStep("email");
      setLoading(false);
    }
    // sucesso: useEffect cuida do redirect
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
            {step === "email" ? (
              <>
                <form onSubmit={handleSendCode} className="space-y-4">
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
                    Enviar código
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Já tem conta? É só usar o mesmo e-mail para entrar.
                  </p>
                </form>

                {!isInstagram && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Login com Google
                    </Button>
                  </>
                )}
              </>
            ) : step === "link" ? (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <Mail className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-lg font-heading font-semibold text-foreground">
                    Te enviamos um link!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Abra seu e-mail e toque no botão para entrar no portal.
                  </p>
                  <p className="text-sm font-medium text-foreground break-all">{email}</p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {resending ? "Reenviando..." : "Reenviar link"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center space-y-2">
                  <Mail className="w-10 h-10 mx-auto text-primary" />
                  <p className="text-sm text-foreground">
                    Digite o código de 6 dígitos enviado para
                  </p>
                  <p className="text-sm font-medium text-foreground break-all">{email}</p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    pattern="^[0-9]+$"
                    inputMode="numeric"
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Entrar
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {resending ? "Reenviando..." : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}
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
