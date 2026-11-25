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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalculadoraCobranca from "@/components/admin/CalculadoraCobranca";
import { Copy, RefreshCw, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { amanhaAluno, prazoAluno, rpcAlunos, type ConfigAlunos } from "@/components/admin/alunos/AlunosTodos";

type Entrega = "nenhum" | "curso" | "credito" | "produto_fisico";

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
  gateway: string | null;
  entrega_tipo: string | null;
  entrega_status: string | null;
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
  const [forma, setForma] = useState<"pix" | "cartao" | "mista">("mista");
  const [entrega, setEntrega] = useState<Entrega>("nenhum");
  const [config, setConfig] = useState<ConfigAlunos | null>(null);
  const [cursoIds, setCursoIds] = useState<string[]>([]);
  const [prazoIdx, setPrazoIdx] = useState(0);
  const [ate, setAte] = useState("");
  const [valorCredito, setValorCredito] = useState("");
  const [oQueE, setOQueE] = useState("");
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [formaGerada, setFormaGerada] = useState<"pix" | "cartao" | "mista">("mista");

  const [lista, setLista] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cobrancas")
      .select("id, descricao, valor, nome_cliente, email_cliente, status, url, created_at, paid_at, gateway, entrega_tipo, entrega_status")
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

  useEffect(() => {
    if (entrega !== "curso" || config) return;
    rpcAlunos<ConfigAlunos>("admin_alunos_config")
      .then((c) => { setConfig(c); setPrazoIdx(Math.max(0, c.prazos_liberar.findIndex((p) => p.padrao))); })
      .catch((e) => toast.error(e instanceof Error ? e.message : String(e)));
  }, [entrega, config]);

  const prazo = config?.prazos_liberar[prazoIdx];

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
    let entrega_tipo: string | undefined;
    let entrega_payload: Record<string, unknown> | undefined;
    if (entrega === "curso") {
      if (!prazo || cursoIds.length === 0) { toast.error("Escolha o curso e o prazo"); return; }
      if (prazo.modo === "data" && !(ate >= amanhaAluno())) { toast.error("Informe uma data a partir de amanhã"); return; }
      entrega_tipo = "curso";
      entrega_payload = { curso_ids: cursoIds, prazo: prazoAluno(prazo, ate) };
    } else if (entrega === "credito") {
      const vc = Number(valorCredito);
      if (!vc || Number.isNaN(vc) || vc <= 0) { toast.error("Informe o valor do crédito"); return; }
      entrega_tipo = "credito";
      entrega_payload = { valor: vc };
    } else if (entrega === "produto_fisico") {
      if (!oQueE.trim()) { toast.error("Informe o que é o produto"); return; }
      entrega_tipo = "produto_fisico";
      entrega_payload = { descricao: oQueE.trim() };
    }
    setGerando(true);
    setLinkGerado(null);
    const { data, error } = await supabase.functions.invoke("criar-cobranca", {
      body: { descricao: descricao.trim(), valor: v, nome: nome.trim() || undefined, email: email.trim() || undefined, forma, entrega_tipo, entrega_payload },
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
    const fg = (data as any)?.forma ?? forma;
    setFormaGerada(fg === "cartao" ? "cartao" : fg === "pix" ? "pix" : "mista");
    setLinkGerado(url);
    toast.success("Cobrança criada");
    setDescricao("");
    setValor("");
    setNome("");
    setEmail("");
    setEntrega("nenhum");
    setCursoIds([]);
    setAte("");
    setValorCredito("");
    setOQueE("");
    carregar();
  };

  const statusBadge = (status: string | null) => {
    const s = (status || "").toLowerCase();
    if (s === "pago" || s === "paid") {
      return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Pago</Badge>;
    }
    return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Pendente</Badge>;
  };

  const entregaBadge = (c: Cobranca) => {
    if (!c.entrega_tipo) return null;
    if (c.entrega_status === "entregue") return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Entregue</Badge>;
    if (c.entrega_status === "manual") return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">{c.entrega_tipo === "credito" ? "Entregar: crédito" : "Entregar: produto físico"}</Badge>;
    if (c.entrega_status === "erro") return <Badge className="bg-red-600 hover:bg-red-600 text-white">Erro na entrega</Badge>;
    return null;
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

        <Tabs defaultValue="cobrancas">
          <TabsList>
            <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
            <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
          </TabsList>
          <TabsContent value="calculadora" className="mt-4">
            <CalculadoraCobranca />
          </TabsContent>
          <TabsContent value="cobrancas" className="mt-4 space-y-6">
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
          <div>
            <Label>Forma de pagamento</Label>
            <div className="flex gap-2 mt-1">
              {(["pix", "cartao", "mista"] as const).map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={forma === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setForma(f)}
                >
                  {f === "pix" ? "Pix" : f === "cartao" ? "Cartão" : "Pix e Cartão"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>O que entregar quando a cobrança for paga</Label>
            <div className="flex flex-wrap gap-2">
              {([["nenhum", "Nenhum"], ["curso", "Curso"], ["credito", "Crédito"], ["produto_fisico", "Produto físico"]] as const).map(([k, r]) => (
                <Button key={k} type="button" size="sm" variant={entrega === k ? "default" : "outline"} aria-pressed={entrega === k} onClick={() => setEntrega(k)}>{r}</Button>
              ))}
            </div>
            {entrega === "curso" && (
              !config ? <p className="text-sm text-muted-foreground">Carregando cursos…</p> : (
                <div className="space-y-4">
                  <section className="space-y-2">
                    <Label>Cursos</Label>
                    {config.cursos.filter((c) => c.ativo).concat(config.cursos.filter((c) => !c.ativo)).map((c) => (
                      <label key={c.id} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${cursoIds.includes(c.id) ? "border-primary bg-primary/5" : "border-border"}`}>
                        <Checkbox checked={cursoIds.includes(c.id)} onCheckedChange={(v) => setCursoIds((old) => v ? [...old, c.id] : old.filter((x) => x !== c.id))} aria-label={c.titulo} />
                        <span className="flex-1 min-w-0 text-sm font-medium">{c.titulo}{!c.ativo && <span className="block text-xs text-muted-foreground font-normal">fora da vitrine</span>}</span>
                        <span className="text-xs text-muted-foreground text-right max-w-[40%]">padrão: {c.padrao_rotulo}</span>
                      </label>
                    ))}
                  </section>
                  <section className="space-y-2">
                    <Label>Prazo</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.prazos_liberar.map((p, i) => (
                        <Button key={i} type="button" size="sm" variant={prazoIdx === i ? "default" : "outline"} aria-pressed={prazoIdx === i} onClick={() => setPrazoIdx(i)}>{p.rotulo}</Button>
                      ))}
                    </div>
                    {prazo?.modo === "data" && <Input aria-label="Data limite" type="date" min={amanhaAluno()} value={ate} onChange={(e) => setAte(e.target.value)} />}
                  </section>
                </div>
              )
            )}
            {entrega === "credito" && (
              <div className="max-w-xs">
                <Label htmlFor="valor-credito">Valor do crédito (R$)</Label>
                <Input id="valor-credito" type="number" min="0" step="0.01" value={valorCredito} onChange={(e) => setValorCredito(e.target.value)} placeholder="0,00" />
              </div>
            )}
            {entrega === "produto_fisico" && (
              <div>
                <Label htmlFor="o-que-e">O que é</Label>
                <Input id="o-que-e" value={oQueE} onChange={(e) => setOQueE(e.target.value)} />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGerar} disabled={gerando}>
              {gerando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar link de pagamento
            </Button>
          </div>

          {linkGerado && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <p className="text-sm text-emerald-800 font-medium">{formaGerada === "pix" ? "Link Pix gerado:" : "Link de pagamento gerado:"}</p>
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
                      {entregaBadge(c)}
                      <Badge variant="outline">{c.gateway == null ? "Pix e Cartão" : c.gateway === "stripe" ? "Cartão" : "Pix"}</Badge>
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminCobranca;
