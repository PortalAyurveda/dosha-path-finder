import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Painel } from "@/lib/terapia";
import { Secao } from "./Comuns";
export default function MeuLink({
  painel,
  executar,
}: {
  painel: Painel;
  executar: (fn: () => Promise<unknown>) => Promise<boolean>;
}) {
  const link = painel.terapeuta.link_convite;
  const mensagem = (painel.textos.convite_mensagem ?? "")
    .split("{link}")
    .join(link);
  const copiar = (texto: string) =>
    executar(() => navigator.clipboard.writeText(texto));
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
      <Secao titulo="Mande para os seus pacientes">
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-muted p-3">
          <p className="min-w-0 flex-1 break-words text-sm font-semibold">
            {link}
          </p>
          <Button variant="outline" size="sm" onClick={() => copiar(link)}>
            <Copy />
            Copiar
          </Button>
        </div>
        <h2 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
          Mensagem pronta
        </h2>
        <p className="mb-4 rounded-xl bg-muted p-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
          {mensagem}
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => copiar(mensagem)}
        >
          <Copy />
          Copiar mensagem
        </Button>
      </Secao>
      <Secao titulo="QR Code" className="">
        <QRCodeSVG
          value={link}
          size={168}
          marginSize={2}
          className="h-44 w-44 max-w-full fill-primary [&>path:first-of-type]:fill-background [&>path:last-of-type]:fill-primary"
        />
        <p className="my-4 text-xs text-muted-foreground">
          Para imprimir no consultório ou pôr no Instagram.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["pacientes", "pacientes"],
            ["pelo_link", "pelo link"],
            ["pela_agenda", "pela agenda"],
          ].map(([k, l]) => (
            <div key={k} className="rounded-xl border border-border p-3">
              <p className="font-serif text-2xl font-bold text-secondary">
                {painel.numeros[k as keyof Painel["numeros"]]}
              </p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </Secao>
    </div>
  );
}
