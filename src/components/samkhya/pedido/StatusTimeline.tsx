import { Check } from "lucide-react";
import { samkhyaTokens } from "../tokens";

interface Props {
  etapa: number; // -1..4
  metodoPagamento?: string | null;
}

const FULL_STEPS = [
  "Pedido recebido",
  "Aguardando pagamento",
  "Preparando envio",
  "A caminho",
  "Entregue",
];

const StatusTimeline = ({ etapa, metodoPagamento }: Props) => {
  if (etapa === -1) {
    return (
      <div
        className="rounded-lg border px-4 py-3 text-sm"
        style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }}
      >
        Pedido cancelado.
      </div>
    );
  }

  // Esconde "Aguardando pagamento" se nunca foi boleto (card/pix já pago)
  const hideAguardando =
    metodoPagamento && metodoPagamento !== "boleto" && etapa !== 1;
  const steps = hideAguardando
    ? FULL_STEPS.filter((_, i) => i !== 1)
    : FULL_STEPS;

  // Mapeia o índice da etapa original para o índice visível
  const visibleEtapa = hideAguardando
    ? etapa === 0
      ? 0
      : etapa - 1
    : etapa;

  return (
    <ol className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-2 w-full">
      {steps.map((label, i) => {
        const done = i < visibleEtapa;
        const current = i === visibleEtapa;
        const future = i > visibleEtapa;

        const bg = done
          ? samkhyaTokens.roxo
          : current
          ? samkhyaTokens.ouro
          : "#E5E7EB";
        const color = done || current ? "#fff" : "#6B7280";
        const labelColor = current
          ? samkhyaTokens.roxo
          : done
          ? samkhyaTokens.texto
          : "#9CA3AF";

        return (
          <li
            key={label}
            className="flex md:flex-col md:items-center md:text-center items-center gap-3 md:gap-2 md:flex-1 relative"
          >
            <div
              className={`flex items-center justify-center rounded-full w-8 h-8 md:w-9 md:h-9 text-xs font-semibold shrink-0 ${
                current ? "ring-2 ring-offset-2" : ""
              }`}
              style={{
                background: bg,
                color,
                boxShadow: current ? `0 0 0 2px ${samkhyaTokens.ouro}40` : undefined,
              }}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className="text-xs md:text-[11px] leading-tight font-medium"
              style={{ color: labelColor, fontWeight: current ? 600 : 500 }}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className="hidden md:block absolute top-4 left-1/2 w-full h-px -z-0"
                style={{
                  background: i < visibleEtapa ? samkhyaTokens.roxo : "#E5E7EB",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default StatusTimeline;
