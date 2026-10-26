import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CTAButton from "@/components/CTAButton";
import { Painel, passosFaltando, reais, terapia, valorDigitado } from "@/lib/terapia";
import { ChaveSistema, Secao } from "./Comuns";

const NOMES = {
  premium: "Assinar o Premium",
  termo: "Aceitar o termo",
  agenda: "Configurar a agenda",
  valor: "Informar o valor da consulta",
} as const;

export function ValorConsulta({ painel, executar, atualizar, id = "valor-consulta" }: { painel: Painel; executar: (fn: () => Promise<unknown>) => Promise<boolean>; atualizar: () => Promise<unknown>; id?: string }) {
  const atual = painel.sistema.valor_consulta;
  const [texto, setTexto] = useState(atual != null ? String(atual).replace(".", ",") : "");
  const [salvando, setSalvando] = useState(false);
  const valor = valorDigitado(texto);
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSalvando(true);
        try { await executar(async () => { await terapia.valor(valor); await atualizar(); }); } finally { setSalvando(false); }
      }}
    >
      <div className="min-w-0 flex-1">
        <Label htmlFor={id}>Valor da consulta (R$)</Label>
        <Input id={id} inputMode="decimal" placeholder="180" className="mt-1" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <p className="mt-1 text-xs text-muted-foreground">{valor === 0 ? "Consulta gratuita" : valor != null ? `Aparece como ${reais(valor)}, combinado direto com você.` : "Combinado direto com a pessoa."}</p>
      </div>
      <CTAButton type="submit" disabled={salvando || valor === null} className="h-10 px-5 py-2 text-sm">{salvando ? "Salvando…" : "Salvar"}</CTAButton>
    </form>
  );
}

export function PassosParticipar({ painel, ocupado, mudar, irPara, abrirTermo, executar, atualizar }: { painel: Painel; ocupado: boolean; mudar: (v: boolean) => void; irPara: (aba: string) => void; abrirTermo: () => void; executar: (fn: () => Promise<unknown>) => Promise<boolean>; atualizar: () => Promise<unknown> }) {
  const falta = passosFaltando(painel.sistema.falta);
  if (!falta.length) return <ChaveSistema painel={painel} ocupado={ocupado} mudar={mudar} />;
  const p = painel.premium_textos;
  return (
    <section aria-label="Para participar do Portal" className="rounded-lg border border-secondary/25 bg-secondary/5 p-4">
      <h2 className="font-serif text-lg font-bold text-primary">Para participar do Portal</h2>
      <p className="mt-1 text-sm text-muted-foreground">Ativar coloca você como terapeuta com agenda disponível no Portal. Falta:</p>
      <ol className="mt-4 space-y-3">
        {(["premium", "termo", "agenda", "valor"] as const).map((f, i) => {
          const pronto = !falta.includes(f);
          return (
            <li key={f} className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${pronto ? "border-secondary bg-secondary text-secondary-foreground" : "border-border text-muted-foreground"}`}>{pronto ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className={`flex-1 text-sm font-semibold ${pronto ? "text-muted-foreground line-through" : ""}`}>{NOMES[f]}</span>
                {!pronto && f === "termo" && <Button size="sm" variant="outline" onClick={abrirTermo}>Ler e aceitar</Button>}
                {!pronto && f === "agenda" && <Button size="sm" variant="outline" onClick={() => irPara("agenda")}>Ir para a Agenda</Button>}
              </div>
              {!pronto && f === "premium" && (
                <div className="mt-3 rounded-md border border-border p-3">
                  {p?.titulo && <p className="text-sm font-semibold">{p.titulo}</p>}
                  {p?.texto && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.texto}</p>}
                  <CTAButton to={p?.link || "/assinar"} className="mt-3 h-9 px-4 py-2 text-sm">{p?.botao || "Assinar o Premium"}</CTAButton>
                </div>
              )}
              {!pronto && f === "valor" && <div className="mt-3"><ValorConsulta painel={painel} executar={executar} atualizar={atualizar} id="valor-passo" /></div>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function Configuracoes({ painel, ocupado, mudar, executar, atualizar }: { painel: Painel; ocupado: boolean; mudar: (v: boolean) => void; executar: (fn: () => Promise<unknown>) => Promise<boolean>; atualizar: () => Promise<unknown> }) {
  const participa = painel.sistema.participa ?? painel.sistema.no_sistema;
  return (
    <div className="max-w-xl space-y-8">
      <Secao titulo="Portal">
        {participa ? <ChaveSistema painel={painel} ocupado={ocupado} mudar={mudar} /> : <p className="text-sm text-muted-foreground">Complete os passos no topo do painel para ativar “Participar do Portal”.</p>}
      </Secao>
      <Secao titulo="Consulta">
        <ValorConsulta painel={painel} executar={executar} atualizar={atualizar} />
      </Secao>
    </div>
  );
}
