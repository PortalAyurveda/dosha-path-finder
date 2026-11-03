import { Library, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TIPOS_BIBLIOTECA, alternarTipo, type AkashaModo, type TipoBiblioteca } from "@/lib/akashaChat";

interface Props {
  modo: AkashaModo;
  onModo: (m: AkashaModo) => void;
  tipos: TipoBiblioteca[];
  onTipos: (t: TipoBiblioteca[]) => void;
  disabled?: boolean;
}

/** Linha discreta acima do campo: chave "Pesquisar na biblioteca" + fichas com ✓. */
const AkashaModoBarra = ({ modo, onModo, tipos, onTipos, disabled }: Props) => {
  const ligado = modo === "biblioteca";

  return (
    <div className="mb-1.5 space-y-1.5">
      <label className="flex min-h-[32px] cursor-pointer items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
        <Switch
          checked={ligado}
          disabled={disabled}
          onCheckedChange={(v) => onModo(v ? "biblioteca" : "conversa")}
          aria-label="Pesquisar na biblioteca do Portal"
          className="data-[state=checked]:bg-akasha"
        />
        <Library className={`h-3.5 w-3.5 ${ligado ? "text-akasha" : ""}`} />
        <span className={ligado ? "text-akasha" : ""}>Pesquisar na biblioteca</span>
      </label>
      {ligado && (
        <div className="flex flex-wrap gap-1.5 px-1" role="group" aria-label="O que procurar">
          {TIPOS_BIBLIOTECA.map(({ tipo, rotulo }) => {
            const marcado = tipos.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                role="checkbox"
                aria-checked={marcado}
                disabled={disabled}
                onClick={() => onTipos(alternarTipo(tipos, tipo))}
                className={`flex min-h-[32px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                  marcado ? "border-akasha/50 bg-akasha/10 text-akasha" : "border-border bg-card text-muted-foreground hover:border-akasha/30"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                    marcado ? "border-akasha bg-akasha text-primary-foreground" : "border-muted-foreground/40"
                  }`}
                >
                  {marcado && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                {rotulo}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AkashaModoBarra;
