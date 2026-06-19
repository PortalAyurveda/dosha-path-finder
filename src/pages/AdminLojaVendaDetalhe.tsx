import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Loader2, ExternalLink, Save, ArrowLeft, MapPin, Mail, Gift } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  STATUS_META,
  formatBRL,
  formatDateTime,
  whatsappLink,
  type Pedido,
  type PedidoStatus,
} from "./AdminLojaVendas";

const enderecoCompleto = (e: Record<string, string>) =>
  [
    e.logradouro && `${e.logradouro}${e.numero ? `, ${e.numero}` : ""}`,
    e.complemento,
    e.bairro,
    e.cidade && e.estado ? `${e.cidade} - ${e.estado}` : e.cidade || e.estado,
    e.cep,
  ]
    .filter(Boolean)
    .join(", ");

const AdminLojaVendaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [rastreio, setRastreio] = useState("");
  const [savingRastreio, setSavingRastreio] = useState(false);
  const [notas, setNotas] = useState("");
  const [savingNotas, setSavingNotas] = useState(false);
  const [emailAssunto, setEmailAssunto] = useState("");
  const [emailMensagem, setEmailMensagem] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await lojaSupabase
        .from("pedidos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Pedido não encontrado");
        setPedido(null);
      } else {
        const p = data as unknown as Pedido;
        setPedido(p);
        setRastreio(p.frete_codigo_rastreio || "");
        setNotas(p.notas_internas || "");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!pedido) {
    return (
      <>
        <AdminNav />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Pedido não encontrado.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/admin/loja/vendas">Voltar</Link>
          </Button>
        </div>
      </>
    );
  }

  const handleStatusChange = async (novo: PedidoStatus) => {
    if (!pedido) return;
    setSavingStatus(true);
    const patch: Record<string, unknown> = { status: novo };
    if (novo === "enviado" && !pedido.shipped_at) patch.shipped_at = new Date().toISOString();
    if (novo === "entregue" && !pedido.delivered_at) patch.delivered_at = new Date().toISOString();
    if (novo === "pago") {
      if (!pedido.paid_at) patch.paid_at = new Date().toISOString();
      patch.status_pagamento = "paid";
    }
    const { error } = await lojaSupabase.from("pedidos").update(patch).eq("id", pedido.id);
    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      setPedido({ ...pedido, ...(patch as Partial<Pedido>) });
      toast.success("Status atualizado");
    }
    setSavingStatus(false);
  };

  const handleMarcarBrinde = async () => {
    if (!pedido) return;
    if (!confirm("Marcar este pedido como brinde? Subtotal e total serão zerados.")) return;
    setSavingStatus(true);
    const patch = {
      status: "pago" as PedidoStatus,
      status_pagamento: "paid",
      metodo_pagamento: "brinde",
      subtotal: 0,
      total: 0,
      paid_at: new Date().toISOString(),
    };
    const { error } = await lojaSupabase.from("pedidos").update(patch).eq("id", pedido.id);
    if (error) {
      toast.error("Erro ao marcar como brinde");
    } else {
      setPedido({ ...pedido, ...(patch as unknown as Partial<Pedido>) });
      toast.success("Pedido marcado como brinde ✓");
    }
    setSavingStatus(false);
  };

  const handleSaveRastreio = async () => {
    if (!pedido) return;
    setSavingRastreio(true);
    const { error } = await lojaSupabase
      .from("pedidos")
      .update({ frete_codigo_rastreio: rastreio || null })
      .eq("id", pedido.id);
    if (error) toast.error("Erro ao salvar rastreio");
    else {
      setPedido({ ...pedido, frete_codigo_rastreio: rastreio || null });
      toast.success("Rastreio salvo");
    }
    setSavingRastreio(false);
  };

  const handleSaveNotas = async () => {
    if (!pedido) return;
    setSavingNotas(true);
    const { error } = await lojaSupabase
      .from("pedidos")
      .update({ notas_internas: notas || null })
      .eq("id", pedido.id);
    if (error) toast.error("Erro ao salvar notas");
    else {
      setPedido({ ...pedido, notas_internas: notas || null });
      toast.success("Notas salvas");
    }
    setSavingNotas(false);
  };

  const handleSendEmail = async () => {
    if (!pedido) return;
    if (!emailAssunto.trim() || !emailMensagem.trim()) {
      toast.error("Preencha o assunto e a mensagem do email.");
      return;
    }
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-aluno-email", {
        body: {
          to: pedido.comprador_email,
          nome: pedido.comprador_nome,
          subject: emailAssunto.trim(),
          message: emailMensagem.trim(),
          extra_record: { numero_pedido: pedido.numero_pedido },
        },
      });
      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error || error?.message || "Erro");
      }
      toast.success("Email enviado com sucesso!");
      setEmailAssunto("");
      setEmailMensagem("");
    } catch (err) {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setSendingEmail(false);
    }
  };

  const e = pedido.endereco_entrega || {};
  const mapsQuery = encodeURIComponent(enderecoCompleto(e));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const pesoTotal = pedido.itens.reduce(
    (acc, it) => acc + (Number(it.peso_gramas) || 0) * Number(it.quantidade),
    0,
  );

  return (
    <>
      <Helmet>
        <title>{`Pedido ${pedido.numero_pedido || pedido.id.slice(0, 8)} — Loja Samkhya`}</title>
      </Helmet>
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/loja/vendas">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para vendas
          </Link>
        </Button>

        {/* Cabeçalho */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="font-mono">
                  {pedido.numero_pedido || pedido.id.slice(0, 8)}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Criado em {formatDateTime(pedido.created_at)}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={pedido.status}
                    onValueChange={(v) => handleStatusChange(v as PedidoStatus)}
                    disabled={savingStatus}
                  >
                    <SelectTrigger className="min-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <div>
              <span className="block">Pago em</span>
              <span className="text-foreground">
                {pedido.paid_at ? formatDateTime(pedido.paid_at) : "—"}
              </span>
            </div>
            <div>
              <span className="block">Enviado em</span>
              <span className="text-foreground">
                {pedido.shipped_at ? formatDateTime(pedido.shipped_at) : "—"}
              </span>
            </div>
            <div>
              <span className="block">Entregue em</span>
              <span className="text-foreground">
                {pedido.delivered_at ? formatDateTime(pedido.delivered_at) : "—"}
              </span>
            </div>
            <div>
              <span className="block">Pagamento</span>
              <span className="text-foreground">{pedido.status_pagamento}</span>
            </div>
          </CardContent>
        </Card>

        {/* Comprador */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comprador</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p>
                <span className="text-muted-foreground">Nome: </span>
                {pedido.comprador_nome}
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                <a href={`mailto:${pedido.comprador_email}`} className="text-primary hover:underline">
                  {pedido.comprador_email}
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">Telefone: </span>
                {pedido.comprador_telefone ? (
                  <a
                    href={whatsappLink(pedido.comprador_telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline inline-flex items-center gap-1"
                  >
                    {pedido.comprador_telefone} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <span className="text-muted-foreground">CPF: </span>
                {pedido.comprador_cpf || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Endereço de entrega</p>
              <p>{e.logradouro}{e.numero ? `, ${e.numero}` : ""}{e.complemento ? ` — ${e.complemento}` : ""}</p>
              <p>{e.bairro}</p>
              <p>
                {e.cidade}
                {e.estado ? ` - ${e.estado}` : ""}
              </p>
              <p>CEP: {e.cep}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                <MapPin className="h-3 w-3" /> Ver no Google Maps
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens do pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Peso unit.</TableHead>
                  <TableHead className="text-right">Preço unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.itens.map((it, i) => {
                  const preco = Number(it.preco_unitario ?? it.preco_pix ?? 0);
                  const sub = preco * Number(it.quantidade);
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="text-sm">{it.nome}</div>
                        <div className="text-xs text-muted-foreground font-mono">{it.slug}{it.tipo ? ` · ${it.tipo}` : ""}</div>
                      </TableCell>
                      <TableCell className="text-right">{it.quantidade}</TableCell>
                      <TableCell className="text-right text-xs">{it.peso_gramas ?? 0}g</TableCell>
                      <TableCell className="text-right">{formatBRL(preco)}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(sub)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              Peso total: <span className="font-medium text-foreground">{pesoTotal}g</span>
            </p>
          </CardContent>
        </Card>

        {/* Frete */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <span className="text-muted-foreground block text-xs">Serviço</span>
                {pedido.frete_servico || "—"}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Prazo</span>
                {pedido.frete_prazo_dias != null
                  ? `${pedido.frete_prazo_dias} dia${pedido.frete_prazo_dias === 1 ? "" : "s"} útil${pedido.frete_prazo_dias === 1 ? "" : "eis"}`
                  : "—"}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Valor</span>
                {formatBRL(pedido.frete_valor)}
              </div>
            </div>
            <div>
              <Label htmlFor="rastreio" className="text-xs">
                Código de rastreio
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="rastreio"
                  value={rastreio}
                  onChange={(ev) => setRastreio(ev.target.value)}
                  placeholder="Ex: BR123456789BR"
                />
                <Button onClick={handleSaveRastreio} disabled={savingRastreio} size="sm">
                  {savingRastreio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totais */}
        <Card>
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{formatBRL(pedido.frete_valor)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatBRL(pedido.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notas internas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas internas</CardTitle>
            <p className="text-xs text-muted-foreground">Visível apenas para administradores.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={notas}
              onChange={(ev) => setNotas(ev.target.value)}
              rows={4}
              placeholder="Anotações sobre este pedido..."
            />
            <Button onClick={handleSaveNotas} disabled={savingNotas} size="sm">
              {savingNotas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar notas
            </Button>
          </CardContent>
        </Card>

        {/* Bling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bling — NF-e</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {pedido.bling_nfe_numero ? (
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">Número da NF-e: </span>
                  <span className="font-medium">{pedido.bling_nfe_numero}</span>
                </p>
                {pedido.bling_nfe_status && (
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    {pedido.bling_nfe_status}
                  </p>
                )}
                {pedido.bling_nfe_url && (
                  <a
                    href={pedido.bling_nfe_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Abrir DANFE <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">NF-e não emitida</p>
            )}
          </CardContent>
        </Card>

        {pedido.observacoes_comprador && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações do comprador</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">
              {pedido.observacoes_comprador}
            </CardContent>
          </Card>
        )}

        {/* Enviar email para o cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar email para o cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-assunto" className="text-xs">
                Assunto
              </Label>
              <Input
                id="email-assunto"
                value={emailAssunto}
                onChange={(ev) => setEmailAssunto(ev.target.value)}
                placeholder="Ex: Atualização sobre seu pedido"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-mensagem" className="text-xs">
                Mensagem
              </Label>
              <Textarea
                id="email-mensagem"
                value={emailMensagem}
                onChange={(ev) => setEmailMensagem(ev.target.value)}
                placeholder="Digite a mensagem aqui..."
                rows={5}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="min-w-[140px]"
            >
              {sendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Enviar email
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLojaVendaDetalhe;
