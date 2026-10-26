import { ReactNode } from "react";
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
    <section className={`min-w-0 ${className}`}>
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
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-secondary/25 bg-secondary/5 p-3">
      <div>
        <label htmlFor="sistema-chave" className="text-sm font-semibold">
          Estou no sistema
        </label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {painel.sistema.no_sistema
            ? "Seu cartão mostra agenda e “Marcar consulta”."
            : "Seu cartão continua como hoje."}
        </p>
      </div>
      <Switch
        id="sistema-chave"
        aria-label="Estou no sistema"
        checked={painel.sistema.no_sistema}
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
