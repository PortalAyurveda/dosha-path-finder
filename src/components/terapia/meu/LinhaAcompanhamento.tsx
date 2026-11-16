import { Link } from "react-router-dom";
import { useMeuAcompanhamento } from "@/hooks/useMeuAcompanhamento";

/** Linha no topo do Meu Dosha para quem tem terapeuta pelo Portal. */
export default function LinhaAcompanhamento() {
  const { ligacoes } = useMeuAcompanhamento();
  const l = ligacoes.data?.[0];
  if (!l) return null;
  return (
    <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm" data-testid="linha-acompanhamento">
      Você está em acompanhamento com {l.terapeuta.primeiro_nome}.{" "}
      <Link to="/meu-acompanhamento" className="font-semibold text-secondary underline-offset-4 hover:underline">Ver Meu Acompanhamento ›</Link>
    </p>
  );
}
