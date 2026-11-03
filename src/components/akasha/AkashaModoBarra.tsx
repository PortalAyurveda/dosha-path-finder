import { MessageCircle, Library, Check } from "lucide-react";
import { TIPOS_BIBLIOTECA, alternarTipo, type AkashaModo, type TipoBiblioteca } from "@/lib/akashaChat";

interface Props {
  modo: AkashaModo;
  onModo: (m: AkashaModo) => void;
  tipos: TipoBiblioteca[];
  onTipos: (t: TipoBiblioteca[]) => void;
  disabled?: boolean;
}

/** Barra acima do campo: Conversar / Biblioteca do Portal + fichas de tipo. */
const AkashaModoBarra = ({ modo, onModo, tipos, onTipos, disabled }: Props) => {
  const botao = (m: AkashaModo, rotulo: string, Icon: typeof Library) => {
    const ativo = modo === m;
    return (
      <button
        type="button"
        onClick={() => onModo(m)}
        disabled={disabled}
        aria-pressed={ativo}
        className={`flex-1 min-h-[44px] rounded-full px-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 ${
          ativo ? "bg-akasha text-white shadow-sm" : "text-akasha hover:bg-akasha/10"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{rotulo}</span>
      </button>
    );
  };

  return (
    <div className="space-y-1.5 mb-1.5">
      <div className="flex gap-1 rounded-full border border-akasha/20 bg-akasha/5 p-1" role="group" aria-label="Modo da Akasha">
        {botao("conversa", "Conversar", MessageCircle)}
        {botao("biblioteca", "Biblioteca do Portal", Library)}
      </div>
      {modo === "biblioteca" && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="O que procurar">
          {TIPOS_BIBLIOTECA.map(({ tipo, rotulo }) => {
            const marcado = tipos.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                disabled={disabled}
                aria-pressed={marcado}
                onClick={() => onTipos(alternarTipo(tipos, tipo))}
                className={`min-h-[40px] rounded-full border px-3 text-sm font-medium flex items-center gap-1 transition-colors ${
                  marcado ? "border-akasha bg-akasha/10 text-akasha" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {marcado && <Check className="w-3.5 h-3.5" />}
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
