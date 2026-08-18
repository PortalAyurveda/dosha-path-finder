import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Loader2, QrCode, CheckCircle2, TimerOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PRIMARY = "#352F54";
const SALMAO = "#E8806A";
const SALMAO_HOVER = "#D26B55";
const SURFACE = "#FFF8EE";

export type PixCodigo = {
  assinatura_id: string;
  qr_code: string;
  qr_code_image_url: string | null;
  expira_em: string;
  valor: number;
};

export type PixAssinaturaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano: "rotina" | "mensal" | "anual";
  email: string;
  codigoInicial?: PixCodigo;
  onConfirmado?: () => void | Promise<void>;
};

const formatMoeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const mmss = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

type Tela = "carregando" | "qr" | "pago" | "expirado";

const PixAssinaturaDialog = ({
  open,
  onOpenChange,
  plano,
  email,
  codigoInicial,
  onConfirmado,
}: PixAssinaturaDialogProps) => {
  const navigate = useNavigate();
  const [tela, setTela] = useState<Tela>("carregando");
  const [codigo, setCodigo] = useState<PixCodigo | null>(null);
  const [restante, setRestante] = useState<number>(0);
  const pollRef = useRef<number | null>(null);

  const pararPoll = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const criar = useCallback(async () => {
    setTela("carregando");
    setCodigo(null);
    try {
      const { data, error } = await supabase.functions.invoke("criar-assinatura-pix", {
        body: { plano, email },
      });

      // Erros HTTP (409 inclusive) chegam com corpo em error.context
      let payload: any = data;
      if (error) {
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") payload = await ctx.json();
        } catch {
          /* ignore */
        }
      }

      if (payload?.precisa_login) {
        onOpenChange(false);
        navigate(`/entrar?redirect=/assinar`);
        return;
      }

      if (payload?.ja_pago) {
        setTela("pago");
        await onConfirmado?.();
        window.setTimeout(() => onOpenChange(false), 2000);
        return;
      }

      if (payload?.qr_code) {
        setCodigo({
          assinatura_id: payload.assinatura_id,
          qr_code: payload.qr_code,
          qr_code_image_url: payload.qr_code_image_url ?? null,
          expira_em: payload.expira_em,
          valor: Number(payload.valor ?? 0),
        });
        setTela("qr");
        return;
      }

      throw new Error(payload?.error || (error as any)?.message || "Não conseguimos gerar o Pix agora.");
    } catch (e: any) {
      toast.error(String(e?.message ?? "Não conseguimos gerar o Pix agora."));
      onOpenChange(false);
    }
  }, [plano, email, navigate, onOpenChange, onConfirmado]);

  // abrir / fechar
  useEffect(() => {
    if (!open) {
      pararPoll();
      return;
    }
    if (codigoInicial) {
      setCodigo(codigoInicial);
      setTela("qr");
    } else {
      criar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // contagem regressiva
  useEffect(() => {
    if (tela !== "qr" || !codigo?.expira_em) return;
    const alvo = new Date(codigo.expira_em).getTime();
    const tick = () => {
      const diff = alvo - Date.now();
      setRestante(diff);
      if (diff <= 0) setTela("expirado");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tela, codigo?.expira_em]);

  // polling
  useEffect(() => {
    pararPoll();
    if (tela !== "qr" || !codigo?.assinatura_id) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("criar-assinatura-pix", {
          body: { conferir: true, assinatura_id: codigo.assinatura_id },
        });
        const status = (data as any)?.status;
        if (status === "pago") {
          pararPoll();
          setTela("pago");
          await onConfirmado?.();
          window.setTimeout(() => onOpenChange(false), 2000);
        } else if (status === "expirado") {
          pararPoll();
          setTela("expirado");
        }
      } catch {
        /* silencioso */
      }
    }, 4000);
    return pararPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tela, codigo?.assinatura_id]);

  useEffect(() => pararPoll, []);

  const copiar = async () => {
    if (!codigo?.qr_code) return;
    try {
      await navigator.clipboard.writeText(codigo.qr_code);
      toast.success("Código Pix copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o código manualmente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" style={{ background: SURFACE }}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl" style={{ color: PRIMARY }}>
            {tela === "pago"
              ? "Assinatura ativa 🌿"
              : tela === "expirado"
              ? "Código expirado"
              : "Pagar com Pix"}
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {tela === "pago"
              ? "Pagamento confirmado. Bem-vinda ao Portal."
              : tela === "expirado"
              ? "Esse código não vale mais. Gere um novo para continuar."
              : "Abra o app do seu banco, escaneie o QR ou cole o código."}
          </DialogDescription>
        </DialogHeader>

        {tela === "carregando" && (
          <div className="py-10 flex flex-col items-center gap-3" style={{ color: PRIMARY }}>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Gerando seu código…</span>
          </div>
        )}

        {tela === "qr" && codigo && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-semibold" style={{ color: PRIMARY }}>
                {formatMoeda(codigo.valor)}
              </div>
              <div className="text-xs" style={{ color: PRIMARY, opacity: 0.6 }}>
                o código vale por 30 minutos · expira em {mmss(restante)}
              </div>
            </div>

            <div className="flex justify-center">
              {codigo.qr_code_image_url ? (
                <img
                  src={codigo.qr_code_image_url}
                  alt="QR Code do Pix"
                  className="w-52 h-52 rounded-xl bg-white p-2 border"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-52 h-52 rounded-xl bg-white border flex flex-col items-center justify-center gap-2 text-center px-4"
                  style={{ color: PRIMARY }}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-xs">
                    Não foi possível carregar a imagem. Use o código copia e cola abaixo.
                  </span>
                </div>
              )}
            </div>

            <div
              className="rounded-xl border bg-white px-3 py-2 text-[11px] font-mono break-all max-h-24 overflow-auto"
              style={{ color: PRIMARY }}
            >
              {codigo.qr_code}
            </div>

            <button
              onClick={copiar}
              className="w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: SALMAO }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SALMAO_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SALMAO)}
            >
              <Copy className="h-4 w-4" />
              Copiar código
            </button>

            <p className="text-center text-[11px]" style={{ color: PRIMARY, opacity: 0.6 }}>
              Assim que o pagamento cair, liberamos seu acesso automaticamente.
            </p>
          </div>
        )}

        {tela === "expirado" && (
          <div className="space-y-4 py-4 text-center">
            <TimerOff className="h-8 w-8 mx-auto" style={{ color: PRIMARY, opacity: 0.7 }} />
            <button
              onClick={criar}
              className="w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: SALMAO }}
            >
              Gerar novo código
            </button>
          </div>
        )}

        {tela === "pago" && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto" style={{ color: "#4B7A5A" }} />
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-2.5 rounded-full font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: SALMAO }}
            >
              Continuar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PixAssinaturaDialog;
