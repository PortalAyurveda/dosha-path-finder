import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2 } from "lucide-react";

type Cobranca = {
  id: string;
  descricao: string | null;
  valor: number | null;
  nome_cliente: string | null;
  email_cliente: string | null;
  status: string | null;
  url: string | null;
  created_at: string;
  paid_at: string | null;
};

const brl = (v: number | null | undefined) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copiado");
  } catch {
    toast.error("Não consegui copiar");
  }
};

const AdminCobranca = () => {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [gerando, setGerando] = useState(false);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);

  const [lista, setLista] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cobrancas")
      .select("id, descricao, valor, nome_cliente, email_cliente, status, url, created_at, paid_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setLista((data ?? []) as Cobranca[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleGerar = async () => {
    if (!descricao.trim()) {
      toast.error("Informe a descrição");
      return;
    }
    const v = Number(valor);
    if (!v || Number.isNaN(v) || v <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setGerando(true);
    setLinkGerado(null);
    const { data, error } = await supabase.functions.invoke("criar-cobranca", {
      body: { descricao: descricao.trim(), valor: v, nome: nome.trim() || undefined, email: email.trim() || undefined },
    });
    setGerando(false);
    if (error) {
      toast.error(error.message || "Erro ao gerar cobrança");
      return;
    }
    if ((data as any)?.error) {
      toast.error((data as any).error);
      return;
    }
    const url = (data as any)?.url;
    if (!url) {
      toast.error("A função não retornou um link");
      return;
    }
    setLinkGerado(url);
    toast.success("Cobrança criada");
    setDescricao("");
    setValor("");
    setNome("");
    setEmail("");
    carregar();
  };

  const statusBadge = (status: string | null) => {
    const s = (status || "").toLowerCase();
    if (s === "pago" || s === "paid") {
      return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Pago</Badge>;
    }
    return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Pendente</Badge>;
  };

  return (
    <>
      <Seo title="Cobranças — Admin" description="Gerar e acompanhar cobranças" noindex />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Cobranças</h1>
          <p className="text-sm text-muted-foreground">Crie um link de pagamento e acompanhe as cobranças.</p>
        </div>

        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-semibold">Nova cobrança</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição / o que é *</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Formação Ayurveda 2026 - Fulana"
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="nome">Nome da pessoa</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="email">E-mail da pessoa</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGerar} disabled={gerando}>
              {gerando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar link de pagamento
            </Button>
          </div>

          {linkGerado && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <p className="text-sm text-emerald-800 font-medium">Link gerado:</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <a
                  href={linkGerado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-900 underline break-all flex-1"
                >
                  {linkGerado}
                </a>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(linkGerado)}>
                  <Copy className="w-4 h-4 mr-2" /> Copiar link
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cobranças criadas</h2>
            <Button size="sm" variant="outline" onClick={carregar} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Atualizar
            </Button>
          </div>

          {loading && lista.length === 0 ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma cobrança criada ainda.</p>
          ) : (
            <div className="space-y-2">
              {lista.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-border p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{c.descricao || "—"}</span>
                      {statusBadge(c.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {brl(c.valor)}
                      {(c.nome_cliente || c.email_cliente) && (
                        <> · {c.nome_cliente || ""}{c.nome_cliente && c.email_cliente ? " · " : ""}{c.email_cliente || ""}</>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Criada em {fmtDate(c.created_at)}
                      {c.paid_at && <> · Paga em {fmtDate(c.paid_at)}</>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!c.url}
                      onClick={() => c.url && copyToClipboard(c.url)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copiar link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default AdminCobranca;
