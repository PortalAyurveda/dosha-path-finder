import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// =========================================================================
// Casca de marca do email (mesma usada nos outros emails do Portal)
// =========================================================================
export function casca(
  label: string,
  h1: string,
  h1sub: string,
  miolo: string,
  ctaTexto: string,
  ctaUrl: string,
) {
  const P = "#352F54",
    S = "#FF7676",
    A = "#FACC15",
    F = "#f0ede8",
    T = "#5a5675";
  const BASE =
    "https://api.portalayurveda.com/storage/v1/object/public/portal_images";
  const LOGO = BASE + "/logo-positivo.png";
  const CARIMBO = BASE + "/simbolo-positivo.png";

  const cta =
    ctaTexto && ctaUrl
      ? '<p style="margin:28px 0 4px;text-align:center;">' +
        '<a href="' +
        ctaUrl +
        '" style="display:inline-block;background:' +
        S +
        ";color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;\">" +
        ctaTexto +
        "</a>" +
        "</p>"
      : "";

  return (
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:' +
    F +
    ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' +
    F +
    ';padding:24px 12px;">' +
    "<tr><td align=\"center\">" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">' +
    '<tr><td align="center" style="padding:8px 0 20px;">' +
    '<img src="' +
    LOGO +
    '" alt="Portal Ayurveda" width="150" style="display:block;border:0;">' +
    "</td></tr>" +
    "<tr><td>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">' +
    '<tr><td style="height:6px;background:' +
    S +
    ';line-height:6px;font-size:0;">&nbsp;</td></tr>' +
    '<tr><td style="padding:28px 28px 8px;">' +
    '<p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:' +
    S +
    ';">' +
    label +
    "</p>" +
    '<h1 style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:26px;line-height:1.25;color:' +
    P +
    ';font-weight:700;">' +
    h1 +
    (h1sub
      ? '<br><span style="font-style:italic;font-weight:400;color:' +
        T +
        ';font-size:20px;">' +
        h1sub +
        "</span>"
      : "") +
    "</h1>" +
    "</td></tr>" +
    '<tr><td style="padding:12px 28px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:' +
    T +
    ';">' +
    miolo +
    cta +
    "</td></tr>" +
    '<tr><td style="height:4px;background:' +
    A +
    ';line-height:4px;font-size:0;">&nbsp;</td></tr>' +
    "</table>" +
    "</td></tr>" +
    '<tr><td align="center" style="padding:24px 12px 6px;">' +
    '<img src="' +
    CARIMBO +
    '" alt="" width="36" style="display:block;border:0;opacity:.8;">' +
    '<p style="margin:12px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:' +
    T +
    ';">Com carinho,</p>' +
    '<p style="margin:2px 0 0;font-family:Georgia,\'Times New Roman\',serif;font-size:18px;color:' +
    P +
    ';font-weight:700;">Akasha</p>' +
    '<p style="margin:4px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:' +
    T +
    ';">a inteligência que acompanha sua jornada no Portal Ayurveda</p>' +
    "</td></tr>" +
    '<tr><td align="center" style="padding:18px 12px 8px;">' +
    '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#8b87a3;">' +
    "Você está recebendo este email porque tem conta no Portal Ayurveda.<br>" +
    '<a href="https://portalayurveda.com/descadastro" style="color:#8b87a3;">Não quero mais receber</a>' +
    "</p>" +
    "</td></tr>" +
    "</table></td></tr></table></body></html>"
  );
}

// =========================================================================
// Tipos e helpers
// =========================================================================
type Destinatario = { email: string; nome: string };

type EnvioRow = {
  id: string;
  assunto: string;
  label: string;
  h1: string;
  h1sub: string | null;
  corpo_html: string;
  cta_texto: string | null;
  cta_url: string | null;
  status: string;
  total_destinatarios: number;
  total_enviados: number;
  criado_em: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function parseDestinatarios(texto: string) {
  const validos: Destinatario[] = [];
  const invalidas: string[] = [];
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((linha) => {
      const [emailBruto, ...resto] = linha.split(",");
      const email = (emailBruto ?? "").trim().toLowerCase();
      const nome = resto.join(",").trim();
      if (EMAIL_RE.test(email)) validos.push({ email, nome });
      else invalidas.push(linha);
    });
  return { validos, invalidas };
}

const fmtData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const estiloStatus = (status: string) => {
  if (status === "enviado") return { ponto: "bg-green-500", label: "enviado" };
  if (status === "enviando") return { ponto: "bg-yellow-500", label: "enviando" };
  return { ponto: "bg-muted-foreground/50", label: "rascunho" };
};

// =========================================================================
// Preview
// =========================================================================
const PreviewEmail = ({
  html,
  className,
}: {
  html: string;
  className?: string;
}) => (
  <iframe
    title="Preview do email"
    srcDoc={html}
    className={
      className ??
      "w-full h-[640px] rounded-xl border border-border bg-white"
    }
  />
);

// =========================================================================
// Aba Envios
// =========================================================================
const EnviosAvulsos = () => {
  const qc = useQueryClient();

  const [label, setLabel] = useState("AVISO");
  const [assunto, setAssunto] = useState("");
  const [h1, setH1] = useState("");
  const [h1sub, setH1sub] = useState("");
  const [corpo, setCorpo] = useState("");
  const [ctaTexto, setCtaTexto] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [destinatariosTexto, setDestinatariosTexto] = useState("");

  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [verEnvio, setVerEnvio] = useState<EnvioRow | null>(null);

  const { validos, invalidas } = useMemo(
    () => parseDestinatarios(destinatariosTexto),
    [destinatariosTexto],
  );

  const previewHtml = useMemo(
    () =>
      casca(
        label || "AVISO",
        (h1 || "Título do email").replace(/\{\{nome\}\}/g, "Maria"),
        (h1sub || "").replace(/\{\{nome\}\}/g, "Maria"),
        (corpo || "<p>Escreva o corpo do email…</p>").replace(
          /\{\{nome\}\}/g,
          "Maria",
        ),
        ctaTexto.trim(),
        ctaUrl.trim(),
      ),
    [label, h1, h1sub, corpo, ctaTexto, ctaUrl],
  );

  const { data: envios, isLoading } = useQuery({
    queryKey: ["admin-envios-avulsos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("envios_avulsos")
        .select(
          "id,assunto,label,h1,h1sub,corpo_html,cta_texto,cta_url,status,total_destinatarios,total_enviados,criado_em",
        )
        .order("criado_em", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as EnvioRow[];
    },
  });

  const podeEnviar =
    validos.length > 0 && assunto.trim() && h1.trim() && corpo.trim();

  const enviar = async () => {
    setConfirmando(false);
    setEnviando(true);
    try {
      const { data: sessao } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("envios_avulsos")
        .insert({
          assunto: assunto.trim(),
          label: label.trim() || "AVISO",
          h1: h1.trim(),
          h1sub: h1sub.trim() || null,
          corpo_html: corpo,
          cta_texto: ctaTexto.trim() || null,
          cta_url: ctaUrl.trim() || null,
          destinatarios: validos,
          total_destinatarios: validos.length,
          criado_por: sessao?.user?.email ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: fnError } = await supabase.functions.invoke(
        "envio-avulso-disparo",
        { body: { id: data.id } },
      );
      if (fnError) throw fnError;

      toast.success(
        "Envio iniciado! Os emails estão sendo enviados agora, isso pode levar alguns minutos para listas grandes.",
      );
      setLabel("AVISO");
      setAssunto("");
      setH1("");
      setH1sub("");
      setCorpo("");
      setCtaTexto("");
      setCtaUrl("");
      setDestinatariosTexto("");
      qc.invalidateQueries({ queryKey: ["admin-envios-avulsos"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao iniciar o envio");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ea-label">Rótulo</Label>
            <Input
              id="ea-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="AVISO, NOVIDADE…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ea-assunto">Assunto do email</Label>
            <Input
              id="ea-assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ea-h1">Título</Label>
            <Input
              id="ea-h1"
              value={h1}
              onChange={(e) => setH1(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ea-h1sub">Complemento do título</Label>
            <Input
              id="ea-h1sub"
              value={h1sub}
              onChange={(e) => setH1sub(e.target.value)}
              placeholder="opcional"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ea-corpo">Corpo do email</Label>
            <Textarea
              id="ea-corpo"
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              rows={12}
              placeholder="<p>Olá {{nome}}, …</p>"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Escreva {"{{nome}}"} em qualquer lugar do texto que o sistema
              troca pelo primeiro nome de cada pessoa.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Botão (opcional)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={ctaTexto}
                onChange={(e) => setCtaTexto(e.target.value)}
                placeholder="Texto do botão"
                aria-label="Texto do botão"
              />
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="Link do botão"
                aria-label="Link do botão"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ea-dest">Destinatários</Label>
            <Textarea
              id="ea-dest"
              value={destinatariosTexto}
              onChange={(e) => setDestinatariosTexto(e.target.value)}
              rows={8}
              placeholder={"maria@exemplo.com, Maria\njoao@exemplo.com"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              {validos.length} destinatário{validos.length === 1 ? "" : "s"}{" "}
              reconhecido{validos.length === 1 ? "" : "s"}
            </p>
            {invalidas.length > 0 && (
              <div className="text-xs text-destructive space-y-0.5">
                <p>Linhas que não parecem um email válido:</p>
                {invalidas.map((l, i) => (
                  <p key={i} className="font-mono break-all">
                    {l}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Preview */}
        <section className="space-y-3">
          <Label>Preview</Label>
          <PreviewEmail html={previewHtml} />
          <Button
            className="w-full gap-2"
            disabled={!podeEnviar || enviando}
            onClick={() => setConfirmando(true)}
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar para {validos.length} destinatário
            {validos.length === 1 ? "" : "s"}
          </Button>
        </section>
      </div>

      {/* Envios anteriores */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-foreground">
          Envios anteriores
        </h2>
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (envios ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum envio avulso ainda.
          </p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Data</th>
                  <th className="text-left font-medium px-3 py-2">Assunto</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                  <th className="text-right font-medium px-3 py-2">Enviados</th>
                </tr>
              </thead>
              <tbody>
                {(envios ?? []).map((e) => {
                  const s = estiloStatus(e.status);
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setVerEnvio(e)}
                      className="border-t border-border cursor-pointer hover:bg-muted/40"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {fmtData(e.criado_em)}
                      </td>
                      <td className="px-3 py-2 text-foreground">{e.assunto}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${s.ponto}`}
                          />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {e.total_enviados} de {e.total_destinatarios}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Confirmação */}
      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma o envio deste email para {validos.length} pessoas? Essa
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={enviar}>Sim, enviar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview de envio antigo */}
      <Dialog open={!!verEnvio} onOpenChange={(v) => !v && setVerEnvio(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{verEnvio?.assunto}</DialogTitle>
          </DialogHeader>
          {verEnvio && (
            <PreviewEmail
              className="w-full h-[70vh] rounded-xl border border-border bg-white"
              html={casca(
                verEnvio.label ?? "",
                (verEnvio.h1 ?? "").replace(/\{\{nome\}\}/g, "Maria"),
                (verEnvio.h1sub ?? "").replace(/\{\{nome\}\}/g, "Maria"),
                (verEnvio.corpo_html ?? "").replace(/\{\{nome\}\}/g, "Maria"),
                verEnvio.cta_texto ?? "",
                verEnvio.cta_url ?? "",
              )}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnviosAvulsos;
