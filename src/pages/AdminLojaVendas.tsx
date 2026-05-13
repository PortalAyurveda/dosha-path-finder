import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Search, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import AdminNav from "@/components/admin/AdminNav";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PedidoStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_preparacao"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface Pedido {
  id: string;
  numero_pedido: string | null;
  comprador_nome: string;
  comprador_email: string;
  comprador_telefone: string | null;
  comprador_cpf: string | null;
  total: number;
  subtotal: number;
  frete_valor: number;
  frete_servico: string | null;
  frete_servico_id: number | null;
  frete_prazo_dias: number | null;
  frete_codigo_rastreio: string | null;
  status: PedidoStatus;
  status_pagamento: string;
  endereco_entrega: Record<string, string>;
  itens: Array<{
    slug: string;
    tipo?: string;
    nome: string;
    quantidade: number;
    preco_pix?: number;
    preco_unitario?: number;
    peso_gramas?: number;
  }>;
  bling_nfe_numero: string | null;
  bling_nfe_url: string | null;
  bling_nfe_status: string | null;
  notas_internas: string | null;
  observacoes_comprador: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export const STATUS_META: Record<PedidoStatus, { label: string; cls: string }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  pago: { label: "Pago", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  em_preparacao: { label: "Em preparação", cls: "bg-orange-100 text-orange-800 border-orange-300" },
  enviado: { label: "Enviado", cls: "bg-purple-100 text-purple-800 border-purple-300" },
  entregue: { label: "Entregue", cls: "bg-green-100 text-green-800 border-green-300" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-800 border-red-300" },
};

export const formatBRL = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export const onlyDigits = (s: string | null | undefined) => (s || "").replace(/\D/g, "");

export const whatsappLink = (telefone: string | null | undefined) => {
  const d = onlyDigits(telefone);
  if (!d) return "";
  const withDDI = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${withDDI}`;
};

const StatusBadge = ({ status }: { status: PedidoStatus }) => {
  const meta = STATUS_META[status] ?? STATUS_META.aguardando_pagamento;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const AdminLojaVendas = () => {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);

  const carregarPedidos = async () => {
    setLoading(true);
    const { data, error } = await lojaSupabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error(error);
      setPedidos([]);
    } else {
      setPedidos((data || []) as unknown as Pedido[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      if (!q) return true;
      return (
        (p.numero_pedido || "").toLowerCase().includes(q) ||
        (p.comprador_nome || "").toLowerCase().includes(q) ||
        (p.comprador_email || "").toLowerCase().includes(q)
      );
    });
  }, [pedidos, busca, statusFiltro]);

  const pagosVisiveis = useMemo(
    () => filtrados.filter((p) => p.status === "pago"),
    [filtrados],
  );
  const todosPagosSelecionados =
    pagosVisiveis.length > 0 && pagosVisiveis.every((p) => selecionados.has(p.id));

  const toggleOne = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosPagosSelecionados) {
        pagosVisiveis.forEach((p) => next.delete(p.id));
      } else {
        pagosVisiveis.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const enviarMelhorEnvio = async () => {
    if (selecionados.size === 0) return;
    setEnviando(true);
    try {
      const { data, error } = await supabase.functions.invoke("enviar-melhorenvio", {
        body: { pedido_ids: Array.from(selecionados) },
      });
      if (error) throw error;
      const resultados = (data?.resultados ?? []) as Array<{ ok?: boolean; status?: string }>;
      const sucessos = resultados.filter((r) => r.ok || r.status === "ok").length || resultados.length;
      if (data?.print_url) {
        window.open(data.print_url, "_blank", "noopener,noreferrer");
      }
      toast.success(`${sucessos} pedido(s) enviado(s) com sucesso`);
      setSelecionados(new Set());
      await carregarPedidos();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Falha ao enviar para o MelhorEnvio");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendas — Loja Samkhya</title>
      </Helmet>
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Vendas — Loja Samkhya</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Carregando..." : `${filtrados.length} de ${pedidos.length} pedido(s)`}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/loja">← Voltar para a loja</Link>
          </Button>
        </header>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs text-muted-foreground mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, email ou número do pedido"
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selecionados.size > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted px-4 py-3">
            <span className="text-sm font-medium">
              {selecionados.size} pedido(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelecionados(new Set())}
                disabled={enviando}
              >
                Limpar
              </Button>
              <Button size="sm" onClick={enviarMelhorEnvio} disabled={enviando}>
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar para MelhorEnvio
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden bg-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    {pagosVisiveis.length > 0 ? (
                      <Checkbox
                        checked={todosPagosSelecionados}
                        onCheckedChange={toggleAll}
                        aria-label="Selecionar todos os pagos"
                      />
                    ) : null}
                  </TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((p) => (
                  <TableRow key={p.id} data-state={selecionados.has(p.id) ? "selected" : undefined}>
                    <TableCell>
                      {p.status === "pago" ? (
                        <Checkbox
                          checked={selecionados.has(p.id)}
                          onCheckedChange={() => toggleOne(p.id)}
                          aria-label={`Selecionar pedido ${p.numero_pedido || p.id.slice(0, 8)}`}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.numero_pedido || p.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(p.created_at)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{p.comprador_nome}</div>
                      <div className="text-xs text-muted-foreground">{p.comprador_email}</div>
                    </TableCell>
                    <TableCell>
                      {p.comprador_telefone ? (
                        <a
                          href={whatsappLink(p.comprador_telefone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
                        >
                          {p.comprador_telefone} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(p.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/loja/vendas/${p.id}`}>Ver detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLojaVendas;
