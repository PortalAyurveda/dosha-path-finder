import { ReactNode, useId } from "react";
import { Switch } from "@/components/ui/switch";
import { Painel } from "@/lib/terapia";
export function Secao({
  titulo,
  children,
  className = "",
}: {
  titulo?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`portal-cartao min-w-0 ${className}`}>
      {titulo && (
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {titulo}
        </h2>
      )}
      {children}
    </section>
  );
}
export function ChaveSistema({
  painel,
  ocupado,
  mudar,
}: {
  painel: Painel;
  ocupado: boolean;
  mudar: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-secondary/25 bg-secondary/5 p-3">
      <div>
        <label htmlFor={id} className="text-sm font-semibold">
          Participar do Portal
        </label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Ativar coloca você como terapeuta com agenda disponível no Portal.
        </p>
      </div>
      <Switch
        id={id}
        aria-label="Participar do Portal"
        checked={painel.sistema.participa ?? painel.sistema.no_sistema}
        disabled={ocupado}
        onCheckedChange={mudar}
        className="data-[state=checked]:bg-secondary"
      />
    </div>
  );
}
export function TermoTexto({ painel }: { painel: Painel }) {
  return (
    <>
      <h1 className="mb-5 font-serif text-2xl font-bold text-primary">
        {painel.termo.titulo}
      </h1>
      <ol className="ml-5 list-decimal space-y-3 text-sm leading-relaxed text-muted-foreground">
        {painel.termo.texto
          .split("\n")
          .filter(Boolean)
          .map((linha, i) => (
            <li key={i}>{linha.replace(/^\s*\d+[.)]\s*/, "")}</li>
          ))}
      </ol>
    </>
  );
}
export const inicial = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");

export function AvatarPessoa({nome, id, grande=false}: {nome:string; id?:string; grande?:boolean}) {
  const hash = Array.from(id || nome).reduce((n,c) => ((n * 31 + c.charCodeAt(0)) >>> 0), 0);
  return <span aria-hidden="true" className={`portal-avatar portal-avatar-${hash % 6} ${grande ? 'portal-avatar-grande' : ''}`}>{inicial(nome)}</span>;
}
