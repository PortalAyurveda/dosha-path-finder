import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink, FileDown, Copy, CheckCheck } from "lucide-react";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import { supabase } from "@/integrations/supabase/client";
import StatusTimeline from "@/components/samkhya/pedido/StatusTimeline";
import StatusBadge from "@/components/samkhya/pedido/statusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco_pix?: number;
  preco?: number;
  imagem_url?: string | null;
}

interface PedidoDetalhe {
  numero_pedido: string;
  comprador_nome: string;
  comprador_email_mascarado: string;
  itens: ItemPedido[];
  subtotal: number;
  frete_valor: number;
  total: number;
  metodo_pagamento: string;
  frete_servico?: string | null;
  endereco_entrega: {
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  created_at: string;
  paid_at?: string | null;
  status_label: string;
  status_etapa: number;
  status_descricao?: string | null;
  rastreio_codigo?: string | null;
  rastreio_url?: string | null;
  entregue_at?: string | null;
  boleto_url?: string | null;
  nfe_url?: string | null;
  nfe_numero?: string | null;
}

const fmtBRL = (n: number) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const SamkhyaPedido = () => {
  const { session_id } = useParams<{ session_id: string }>();
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session_id) return;
    setLoading(true);
    setNotFound(false);
    supabase.functions
      .invoke("buscar-pedido", { body: { session_id } })
      .then(({ data, error }) => {
        if (error || !data || (data as any).error) {
          setNotFound(true);
          setPedido(null);
        } else {
          setPedido(data as PedidoDetalhe);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [session_id]);

  const copyRastreio = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <>
      <Helmet>
        <title>Acompanhe seu pedido — Loja Samkhya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SamkhyaLayout>
        <div className="max-w-3xl mx-auto py-6 md:py-10">
          <Link
            to="/samkhya"
            className="inline-flex items-center gap-1 text-sm mb-4 hover:opacity-70"
            style={{ color: samkhyaTokens.textoSec }}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à loja
          </Link>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {!loading && notFound && (
            <div
              className="rounded-lg border p-8 text-center"
              style={{ borderColor: samkhyaTokens.cardBorder, background: "#fff" }}
            >
              <h1
                className="text-2xl mb-2"
                style={{
                  color: samkhyaTokens.roxo,
                  fontFamily: "Georgia, serif",
                }}
              >
                Pedido não encontrado
              </h1>
              <p style={{ color: samkhyaTokens.textoSec }} className="mb-6">
                Verifique o link recebido por email ou volte à loja.
              </p>
              <Link
                to="/samkhya"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-white text-sm font-medium"
                style={{ background: samkhyaTokens.roxo }}
              >
                Ir à loja
              </Link>
            </div>
          )}

          {!loading && pedido && (
            <div className="space-y-6">
              {/* Header */}
              <header
                className="rounded-lg border p-5 md:p-6 bg-white"
                style={{ borderColor: samkhyaTokens.cardBorder }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h1
                      className="text-2xl md:text-3xl"
                      style={{
                        color: samkhyaTokens.roxo,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      Pedido {pedido.numero_pedido}
                    </h1>
                    <p
                      className="text-xs mt-1"
                      style={{ color: samkhyaTokens.textoSec }}
                    >
                      Feito em {fmtDate(pedido.created_at)} ·{" "}
                      {pedido.comprador_email_mascarado}
                    </p>
                  </div>
                  <StatusBadge
                    etapa={pedido.status_etapa}
                    label={pedido.status_label}
                  />
                </div>

                <div className="pt-4 border-t" style={{ borderColor: samkhyaTokens.cardBorder }}>
                  <StatusTimeline
                    etapa={pedido.status_etapa}
                    metodoPagamento={pedido.metodo_pagamento}
                  />
                </div>

                {pedido.status_descricao && (
                  <p
                    className="text-sm mt-4 text-center md:text-left"
                    style={{ color: samkhyaTokens.textoSec }}
                  >
                    {pedido.status_descricao}
                  </p>
                )}
              </header>

              {/* Ações */}
              {(pedido.boleto_url || pedido.rastreio_url || pedido.nfe_url) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {pedido.boleto_url && (
                    <a
                      href={pedido.boleto_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-4 text-white font-medium flex items-center justify-between gap-3 hover:opacity-90 transition"
                      style={{ background: samkhyaTokens.roxo }}
                    >
                      <span>Pagar boleto</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {pedido.rastreio_url && (
                    <div
                      className="rounded-lg border p-4 bg-white"
                      style={{ borderColor: samkhyaTokens.cardBorder }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <a
                          href={pedido.rastreio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium hover:opacity-70"
                          style={{ color: samkhyaTokens.roxo }}
                        >
                          Rastrear envio <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {pedido.rastreio_codigo && (
                        <button
                          type="button"
                          onClick={() => copyRastreio(pedido.rastreio_codigo!)}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs hover:opacity-70"
                          style={{ color: samkhyaTokens.textoSec }}
                        >
                          {copied ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {pedido.rastreio_codigo}
                        </button>
                      )}
                    </div>
                  )}
                  {pedido.nfe_url && (
                    <a
                      href={pedido.nfe_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border p-4 bg-white flex items-center justify-between gap-3 hover:shadow transition"
                      style={{ borderColor: samkhyaTokens.cardBorder, color: samkhyaTokens.texto }}
                    >
                      <span className="font-medium inline-flex items-center gap-2">
                        <FileDown className="w-4 h-4" style={{ color: samkhyaTokens.ouro }} />
                        Baixar nota fiscal
                        {pedido.nfe_numero && (
                          <span
                            className="text-xs font-normal"
                            style={{ color: samkhyaTokens.textoSec }}
                          >
                            nº {pedido.nfe_numero}
                          </span>
                        )}
                      </span>
                    </a>
                  )}
                </div>
              )}

              {/* Itens */}
              <section
                className="rounded-lg border bg-white p-5"
                style={{ borderColor: samkhyaTokens.cardBorder }}
              >
                <h2
                  className="text-lg mb-4"
                  style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
                >
                  Itens
                </h2>
                <ul className="divide-y" style={{ borderColor: samkhyaTokens.cardBorder }}>
                  {pedido.itens?.map((it, idx) => {
                    const preco = it.preco_pix ?? it.preco ?? 0;
                    return (
                      <li key={idx} className="py-3 flex items-center gap-3">
                        {it.imagem_url && (
                          <img
                            src={it.imagem_url}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: samkhyaTokens.texto }}
                          >
                            {it.nome}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: samkhyaTokens.textoSec }}
                          >
                            {it.quantidade} × {fmtBRL(preco)}
                          </div>
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: samkhyaTokens.texto }}
                        >
                          {fmtBRL(preco * it.quantidade)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Resumo + Endereço */}
              <div className="grid gap-4 md:grid-cols-2">
                <section
                  className="rounded-lg border bg-white p-5"
                  style={{ borderColor: samkhyaTokens.cardBorder }}
                >
                  <h2
                    className="text-base mb-3"
                    style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
                  >
                    Resumo
                  </h2>
                  <dl className="text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <dt style={{ color: samkhyaTokens.textoSec }}>Subtotal</dt>
                      <dd>{fmtBRL(pedido.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ color: samkhyaTokens.textoSec }}>
                        Frete{pedido.frete_servico ? ` (${pedido.frete_servico})` : ""}
                      </dt>
                      <dd>
                        {pedido.frete_valor > 0
                          ? fmtBRL(pedido.frete_valor)
                          : "Grátis"}
                      </dd>
                    </div>
                    <div
                      className="flex justify-between pt-2 mt-2 border-t font-semibold text-base"
                      style={{ borderColor: samkhyaTokens.cardBorder, color: samkhyaTokens.roxo }}
                    >
                      <dt>Total</dt>
                      <dd>{fmtBRL(pedido.total)}</dd>
                    </div>
                  </dl>
                </section>

                <section
                  className="rounded-lg border bg-white p-5"
                  style={{ borderColor: samkhyaTokens.cardBorder }}
                >
                  <h2
                    className="text-base mb-3"
                    style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
                  >
                    Endereço de entrega
                  </h2>
                  <address
                    className="not-italic text-sm leading-relaxed"
                    style={{ color: samkhyaTokens.texto }}
                  >
                    <div>{pedido.comprador_nome}</div>
                    <div>
                      {pedido.endereco_entrega?.rua}
                      {pedido.endereco_entrega?.numero
                        ? `, ${pedido.endereco_entrega.numero}`
                        : ""}
                      {pedido.endereco_entrega?.complemento
                        ? ` — ${pedido.endereco_entrega.complemento}`
                        : ""}
                    </div>
                    <div>
                      {pedido.endereco_entrega?.bairro}
                      {pedido.endereco_entrega?.bairro ? " · " : ""}
                      {pedido.endereco_entrega?.cidade}/
                      {pedido.endereco_entrega?.estado}
                    </div>
                    {pedido.endereco_entrega?.cep && (
                      <div style={{ color: samkhyaTokens.textoSec }}>
                        CEP {pedido.endereco_entrega.cep}
                      </div>
                    )}
                  </address>
                </section>
              </div>
            </div>
          )}
        </div>
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaPedido;
