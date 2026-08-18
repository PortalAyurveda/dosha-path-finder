import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Copy, CheckCheck, Loader2, CheckCircle2, TimerOff, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PRIMARY = "#352F54";

type Dados = {
  cobranca_id: string;
  descricao: string | null;
  valor: number | null;
  primeiro_nome: string | null;
  status: "pago" | "pendente" | "expirado";
  qr_code?: string | null;
  qr_code_base64?: string | null;
  expira_em?: string | null;
};

const brl = (v: number | null | undefined) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

const mmss = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const Cobranca = () => {
  const { id } = useParams<{ id: string }>();
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const pollRef = useRef<number | null>(null);

  const pararPoll = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const buscar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase.functions.invoke("cobranca-pix", {
        body: { cobranca_id: id },
      });
      let payload: any = data;
      if (error) {
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") payload = await ctx.json();
        } catch {
          /* ignore */
        }
      }
      if (!payload || payload.error) {
        setDados(null);
        setErro(payload?.error || (error as any)?.message || "Não conseguimos carregar esta cobrança.");
        return;
      }
      setDados(payload as Dados);
    } catch (e: any) {
      setErro(String(e?.message ?? "Não conseguimos carregar esta cobrança."));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  // polling a cada 5s enquanto pendente
  useEffect(() => {
    pararPoll();
    if (!id || dados?.status !== "pendente") return;
    pollRef.current = window.setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("cobranca-pix", {
          body: { cobranca_id: id, conferir: true },
        });
        const status = (data as any)?.status;
        if (status === "pago" || status === "expirado") {
          pararPoll();
          setDados((d) => (d ? { ...d, status } : d));
        }
      } catch {
        /* silencioso */
      }
    }, 5000);
    return pararPoll;
  }, [id, dados?.status]);

  useEffect(() => pararPoll, []);

  // contador
  useEffect(() => {
    if (dados?.status !== "pendente" || !dados?.expira_em) return;
    const t = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [dados?.status, dados?.expira_em]);

  const copiar = async () => {
    if (!dados?.qr_code) return;
    try {
      await navigator.clipboard.writeText(dados.qr_code);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const restante = dados?.expira_em ? new Date(dados.expira_em).getTime() - agora : 0;
  const expiradoLocal = dados?.status === "expirado" || (dados?.status === "pendente" && restante <= 0);

  return (
    <>
      <Helmet>
        <title>Pagamento — Portal Ayurveda</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
          {carregando ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : erro ? (
            <div className="text-center space-y-4">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
              <h1 className="text-xl font-serif font-semibold" style={{ color: PRIMARY }}>
                {erro.toLowerCase().includes("nao encontrada") ? "Este link não é válido" : "Não deu certo"}
              </h1>
              <p className="text-sm text-muted-foreground">{erro}</p>
              <Button variant="outline" onClick={buscar}>
                Tentar de novo
              </Button>
            </div>
          ) : dados?.status === "pago" ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 mx-auto" style={{ color: "#4B7A5A" }} />
              <h1 className="text-xl font-serif font-semibold" style={{ color: PRIMARY }}>
                Pagamento confirmado{dados.primeiro_nome ? `, ${dados.primeiro_nome}` : ""}! 🌿
              </h1>
              <p className="text-sm text-muted-foreground">{dados.descricao}</p>
              <p className="text-lg font-semibold" style={{ color: PRIMARY }}>
                {brl(dados.valor)}
              </p>
            </div>
          ) : expiradoLocal ? (
            <div className="text-center space-y-4">
              <TimerOff className="h-10 w-10 mx-auto text-muted-foreground" />
              <h1 className="text-xl font-serif font-semibold" style={{ color: PRIMARY }}>
                Este código expirou
              </h1>
              <p className="text-sm text-muted-foreground">
                Gere um novo código para concluir o pagamento.
              </p>
              <Button onClick={buscar}>
                {carregando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gerar novo código
              </Button>
            </div>
          ) : dados ? (
            <>
              <div className="text-center space-y-1">
                {dados.primeiro_nome && (
                  <p className="text-sm text-muted-foreground">Olá, {dados.primeiro_nome}!</p>
                )}
                <h1 className="text-xl font-serif font-semibold" style={{ color: PRIMARY }}>
                  {dados.descricao || "Pagamento via Pix"}
                </h1>
                <p className="text-2xl font-semibold" style={{ color: PRIMARY }}>
                  {brl(dados.valor)}
                </p>
                {dados.expira_em && (
                  <p className="text-xs text-muted-foreground">Faltam {mmss(restante)}</p>
                )}
              </div>

              {dados.qr_code_base64 ? (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-md border border-border">
                    <img
                      src={`data:image/png;base64,${dados.qr_code_base64}`}
                      alt="QR Code Pix"
                      className="w-full"
                      style={{ maxWidth: 240 }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground">
                  Escaneie com a câmera do banco ou copie o código abaixo.
                </p>
              )}

              <p className="text-sm text-center text-muted-foreground">
                Abra o app do seu banco, escolha Pix e escaneie o código. Ou copie o código abaixo.
              </p>

              <div className="rounded-lg border border-border bg-muted/40 p-3 max-h-28 overflow-auto">
                <code className="text-[11px] break-all font-mono">{dados.qr_code}</code>
              </div>

              <Button className="w-full" onClick={copiar}>
                {copiado ? (
                  <>
                    <CheckCheck className="h-4 w-4 mr-2" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copiar código Pix
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Esta página avança sozinha assim que o pagamento cair.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Cobranca;
