import { Info } from "lucide-react";

/**
 * Faixa de aviso no topo do conteúdo (abaixo do menu), empurrando a página para baixo.
 * Usada quando um visitante deslogado chega a uma área que pede login/teste.
 */
export default function FaixaAviso({ texto }: { texto: string }) {
  return (
    <div
      role="status"
      style={{
        backgroundColor: "#fff0ec",
        borderBottom: "1px solid #ffc3b6",
        color: "#7a2f22",
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: "#ffffff", color: "#ff7676" }}
          aria-hidden="true"
        >
          <Info className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold leading-snug" style={{ color: "#7a2f22" }}>
          {texto}
        </p>
      </div>
    </div>
  );
}
