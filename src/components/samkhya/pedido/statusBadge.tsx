// Mapa etapa → estilo de badge para Loja Samkhya
export type StatusEtapa = -1 | 0 | 1 | 2 | 3 | 4;

export interface StatusBadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const STATUS_ETAPAS = [
  "Pedido recebido",
  "Aguardando pagamento",
  "Preparando envio",
  "A caminho",
  "Entregue",
] as const;

export function statusStyle(etapa: number, label?: string): StatusBadgeStyle {
  if (etapa === -1) {
    return { label: label ?? "Cancelado", bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" };
  }
  if (etapa === 4) {
    return { label: label ?? "Entregue", bg: "#DCFCE7", text: "#166534", border: "#86EFAC" };
  }
  if (etapa === 3) {
    return { label: label ?? "A caminho", bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" };
  }
  if (etapa === 2) {
    return { label: label ?? "Preparando envio", bg: "#F3EAF0", text: "#5C3249", border: "#D9C3D0" };
  }
  if (etapa === 1) {
    return { label: label ?? "Aguardando pagamento", bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
  }
  return { label: label ?? "Pedido recebido", bg: "#E5E7EB", text: "#374151", border: "#D1D5DB" };
}

interface Props {
  etapa: number;
  label?: string;
  className?: string;
}

const StatusBadge = ({ etapa, label, className }: Props) => {
  const s = statusStyle(etapa, label);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className ?? ""}`}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
};

export default StatusBadge;
