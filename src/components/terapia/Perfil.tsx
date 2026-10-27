import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CTAButton from "@/components/CTAButton";
import { Painel, terapia } from "@/lib/terapia";
import { TermoTexto, Secao } from "./Comuns";
import ConfiguracaoMensagens from './chat/ConfiguracaoMensagens';
export default function Perfil({
  painel,
  ocupado,
  mudar,
  executar,
  atualizar,
}: {
  painel: Painel;
  ocupado: boolean;
  mudar: (v: boolean) => void;
  executar: (fn: () => Promise<unknown>) => Promise<boolean>;
  atualizar: () => Promise<unknown>;
}) {
  const [perfil, setPerfil] = useState(painel.perfil);
  const [termo, setTermo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSalvando(true);
          try {
            await executar(async () => {
              await terapia.perfil(perfil);
              await atualizar();
            });
          } finally {
            setSalvando(false);
          }
        }}
        className="portal-cartao space-y-4"
      >
        {(
          [
            ["frase_card", "Frase do cartão"],
            ["instagram", "Instagram"],
            ["cidade", "Cidade"],
            ["estado", "Estado"],
            ["resumo", "Sobre"],
          ] as const
        ).map(([k, l]) => (
          <div key={k}>
            <Label htmlFor={`perfil-${k}`}>{l}</Label>
            {k === "resumo" ? (
              <Textarea
                id={`perfil-${k}`}
                className="mt-1 min-h-36"
                value={perfil[k] ?? ""}
                onChange={(e) => setPerfil({ ...perfil, [k]: e.target.value })}
              />
            ) : (
              <Input
                id={`perfil-${k}`}
                className="mt-1"
                value={perfil[k] ?? ""}
                onChange={(e) => setPerfil({ ...perfil, [k]: e.target.value })}
              />
            )}
          </div>
        ))}
        <CTAButton data-terapia-principal
          disabled={salvando}
          className="h-10 px-5 py-2 text-base"
          type="submit"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </CTAButton>
      </form>
      <div className="space-y-6">
        <div className="portal-cartao flex gap-4">
          {painel.terapeuta.imagem && (
            <img
              src={painel.terapeuta.imagem}
              alt={painel.terapeuta.nome}
              className="h-24 w-20 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="font-serif font-bold text-primary">
              {painel.terapeuta.nome}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Assim aparece no diretório
            </p>
            <Button asChild variant="link" className="h-auto p-0">
              <a
                href={painel.terapeuta.link_perfil}
                target="_blank"
                rel="noreferrer"
              >
                Ver meu perfil
              </a>
            </Button>
          </div>
        </div>
        <div className="portal-cartao"><ConfiguracaoMensagens painel={painel} atualizar={atualizar}/></div>
        <Secao titulo="Termo">
          <p className="text-xs text-muted-foreground">
            Termo aceito em{" "}
            {painel.sistema.termo_aceito_em
              ? new Date(painel.sistema.termo_aceito_em).toLocaleDateString(
                  "pt-BR",
                )
              : "sem data"}
          </p>
          <Button
            variant="link"
            size="sm"
            className="px-0"
            onClick={() => setTermo(true)}
          >
            Ler o termo
          </Button>
        </Secao>
      </div>
      <Dialog open={termo} onOpenChange={setTermo}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle className="sr-only">{painel.termo.titulo}</DialogTitle>
          <TermoTexto painel={painel} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
