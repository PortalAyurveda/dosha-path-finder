import { Link } from "react-router-dom";
import { FileText, Package } from "lucide-react";
import StatusBadge from "./statusBadge";
import { samkhyaTokens } from "../tokens";

export interface PedidoListItem {
  numero_pedido: string;
  session_id: string;
  total: number;
  qtd_itens: number;
  metodo_pagamento?: string | null;
  status_label: string;
  status_etapa: number;
  tem_nfe?: boolean;
  rastreio?: string | null;
  created_at: string;
}

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const MiniTimeline = ({ etapa }: { etapa: number }) => {
  const total = 5;
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const active = etapa === -1 ? false : i <= etapa;
        return (
          <span
            key={i}
            className="w-5 h-1.5 rounded-full"
            style={{
              background:
                etapa === -1
                  ? "#FCA5A5"
                  : active
                  ? samkhyaTokens.roxo
                  : "#E5E7EB",
            }}
          />
        );
      })}
    </div>
  );
};

const PedidoCard = ({ pedido }: { pedido: PedidoListItem }) => {
  return (
    <Link
      to={`/samkhya/pedido/${pedido.session_id}`}
      className="block rounded-lg border p-4 md:p-5 transition-shadow hover:shadow-md bg-white"
      style={{ borderColor: samkhyaTokens.cardBorder }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div
            className="text-base font-semibold"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
          >
            {pedido.numero_pedido}
          </div>
          <div className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
            {fmtDate(pedido.created_at)} · {pedido.qtd_itens}{" "}
            {pedido.qtd_itens === 1 ? "item" : "itens"}
          </div>
        </div>
        <StatusBadge etapa={pedido.status_etapa} label={pedido.status_label} />
      </div>

      <div className="flex items-end justify-between gap-3 mt-3">
        <MiniTimeline etapa={pedido.status_etapa} />
        <div className="flex items-center gap-3">
          {pedido.tem_nfe && (
            <FileText
              className="w-4 h-4"
              style={{ color: samkhyaTokens.ouro }}
              aria-label="Com nota fiscal"
            />
          )}
          {pedido.rastreio && (
            <Package
              className="w-4 h-4"
              style={{ color: samkhyaTokens.roxo }}
              aria-label="Com rastreio"
            />
          )}
          <span
            className="font-semibold"
            style={{ color: samkhyaTokens.texto }}
          >
            {fmtBRL(pedido.total)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PedidoCard;
