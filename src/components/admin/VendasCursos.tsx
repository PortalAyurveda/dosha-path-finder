import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, Loader2, RefreshCw } from "lucide-react";

type Situacao = "pago" | "pago_sem_acesso" | "estornado" | "recusado" | "pix_aguardando" | "cancelado" | "outro";

interface Linha {
  mp_payment_id: string | number;
  quando: string | null;
  curso_slug: string | null;
  curso_titulo: string | null;
  situacao: Situacao;
  status_mp: string | null;
  status_detalhe: string | null;
  metodo: string | null;
  meio: string | null;
  parcelas: number | null;
  valor: number | null;
  taxa_mp: number | null;
  valor_liquido: number | null;
  liberado_em: string | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  sem_login: boolean | null;
  email_informado: string | null;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtData = (s: string | null) => {
  if (!s) return "-";
  const d = new Date(s);
  const p = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("day")}/${g("month")} ${g("hour")}:${g("minute")}`;
};

const inicioHojeBrasilia = () => {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return new Date(`${hoje}T00:00:00-03:00`);
};

type Periodo = "hoje" | "7" | "30" | "tudo";
const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "hoje", label: "Hoje" }, { key: "7", label: "7 dias" }, { key: "30", label: "30 dias" }, { key: "tudo", label: "Tudo" },
];

type Chip = "pagas" | "nao" | "estornadas" | "todas";
const CHIPS: { key: Chip; label: string; ok: (s: Situacao) => boolean }[] = [
  { key: "pagas", label: "Pagas", ok: (s) => s === "pago" || s === "pago_sem_acesso" },
  { key: "nao", label: "Não concluídas", ok: (s) => s === "recusado" || s === "pix_aguardando" || s === "cancelado" },
  { key: "estornadas", label: "Estornadas", ok: (s) => s === "estornado" },
  { key: "todas", label: "Todas", ok: () => true },
];

const isPaga = (s: Situacao) => s === "pago" || s === "pago_sem_acesso";
const forma = (l: Linha) => (l.metodo === "pix" ? "Pix" : `Cartão ${l.parcelas ?? 1}x`);

const SituacaoBadge = ({ l }: { l: Linha }) => {
  switch (l.situacao) {
    case "pago": return <Badge className="bg-green-600 hover:bg-green-600 text-white">Pago</Badge>;
    case "pago_sem_acesso": return <Badge variant="destructive">Sem acesso</Badge>;
    case "estornado": return <Badge variant="outline" className="border-destructive text-destructive">Estornado</Badge>;
    case "recusado": return (
      <div>
        <Badge variant="secondary">Recusado</Badge>
        {l.status_detalhe && <p className="text-xs text-muted-foreground mt-1">{l.status_detalhe}</p>}
      </div>
    );
    case "pix_aguardando": return <Badge className="bg-yellow-400 hover:bg-yellow-400 text-foreground">Pix aguardando</Badge>;
    case "cancelado": return <Badge variant="secondary">Cancelado</Badge>;
    default: return <Badge variant="outline">{l.status_mp ?? "Outro"}</Badge>;
  }
};

const VendasCursos = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultima, setUltima] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [curso, setCurso] = useState("todos");
  const [chip, setChip] = useState<Chip>("pagas");
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [liberando, setLiberando] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [lRes, sRes] = await Promise.all([
      (supabase as any).rpc("admin_vendas_cursos"),
      (supabase as any).from("curso_pagamentos_sync").select("ultima_em").eq("id", 1).maybeSingle(),
    ]);
    if (lRes.error) toast.error(lRes.error.message);
    setLinhas((lRes.data as Linha[]) ?? []);
    setUltima(sRes.data?.ultima_em ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sincronizar = async () => {
    setSincronizando(true);
    const { error } = await supabase.functions.invoke("vendas-cursos-mp", { body: { acao: "sincronizar", dias: 60 } });
    if (error) toast.error(error.message);
    await load();
    setSincronizando(false);
    if (!error) toast.success("Vendas atualizadas");
  };

  const cursos = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.curso_titulo).filter(Boolean) as string[])).sort(),
    [linhas],
  );

  const filtradas = useMemo(() => {
    let desde: Date | null = null;
    if (periodo === "hoje") desde = inicioHojeBrasilia();
    else if (periodo !== "tudo") desde = new Date(Date.now() - Number(periodo) * 86400000);
    return linhas.filter((l) => {
      if (curso !== "todos" && l.curso_titulo !== curso) return false;
      if (desde && (!l.quando || new Date(l.quando) < desde)) return false;
      return true;
    });
  }, [linhas, periodo, curso]);

  const resumo = useMemo(() => {
    const pagas = filtradas.filter((l) => isPaga(l.situacao));
    const pix = pagas.filter((l) => l.metodo === "pix").length;
    const soma = (k: "valor" | "taxa_mp" | "valor_liquido") => pagas.reduce((s, l) => s + (Number(l[k]) || 0), 0);
    return { n: pagas.length, pix, cartao: pagas.length - pix, bruto: soma("valor"), taxa: soma("taxa_mp"), liquido: soma("valor_liquido") };
  }, [filtradas]);

  const semAcesso = useMemo(() => linhas.filter((l) => l.situacao === "pago_sem_acesso"), [linhas]);

  const tabela = useMemo(() => {
    const ok = CHIPS.find((c) => c.key === chip)!.ok;
    return filtradas.filter((l) => ok(l.situacao));
  }, [filtradas, chip]);

  const liberar = async (l: Linha) => {
    const id = String(l.mp_payment_id);
    const email = (emails[id] ?? "").trim();
    if (!email) { toast.error("Informe o email"); return; }
    setLiberando(id);
    const { data, error } = await (supabase as any).rpc("admin_vincular_pagamento_curso", { p_mp_payment_id: l.mp_payment_id, p_email: email });
    if (error) { toast.error(error.message); setLiberando(null); return; }
    if (data?.ok) {
      await supabase.functions.invoke("vendas-cursos-mp", { body: { acao: "vincular" } });
      toast.success(`Acesso liberado para ${email}`);
      await load();
    } else {
      toast.error(data?.erro ?? "Não foi possível liberar");
    }
    setLiberando(null);
  };

  const baixar = () => {
    const cab = ["Data", "Nome", "Email", "Curso", "Forma", "Valor", "Taxa", "Líquido", "Situação", "mp_payment_id", "telefone"];
    const num = (v: number | null) => (v == null ? "" : String(Number(v).toFixed(2)).replace(".", ","));
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = tabela.map((l) => [
      fmtData(l.quando), l.nome ?? "", l.email ?? "", l.curso_titulo ?? "", forma(l),
      num(l.valor), num(l.taxa_mp), num(l.valor_liquido), l.situacao, l.mp_payment_id, l.telefone ?? "",
    ].map(esc).join(";"));
    const csv = "\uFEFF" + [cab.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-cursos-${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ultimaTxt = ultima ? fmtData(ultima).replace(" ", " às ") : "-";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {PERIODOS.map((p) => (
            <Button key={p.key} size="sm" variant={periodo === p.key ? "default" : "outline"} onClick={() => setPeriodo(p.key)}>
              {p.label}
            </Button>
          ))}
        </div>
        <select
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="todos">Todos os cursos</option>
          {cursos.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={sincronizar} disabled={sincronizando}>
            {sincronizando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Atualizar com o Mercado Pago
          </Button>
          <span className="text-xs text-muted-foreground">Última atualização: {ultimaTxt}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Vendas</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{loading ? "…" : resumo.n}</p>
            <p className="text-xs text-muted-foreground">{resumo.cartao} no cartão · {resumo.pix} no Pix</p>
          </CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Faturamento bruto</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{formatBRL(resumo.bruto)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Taxas do Mercado Pago</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{formatBRL(resumo.taxa)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Líquido</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{formatBRL(resumo.liquido)}</p></CardContent></Card>
      </div>

      {semAcesso.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-3">
          <div>
            <p className="font-semibold text-destructive">Pagaram e ainda estão sem acesso</p>
            <p className="text-sm text-foreground">
              O Mercado Pago esconde o email de quem paga no Pix. Procure o número do pagamento no painel do Mercado Pago, copie o email da pessoa e libere aqui.
            </p>
          </div>
          {semAcesso.map((l) => {
            const id = String(l.mp_payment_id);
            return (
              <div key={id} className="flex flex-wrap items-center gap-3 rounded-md bg-background p-3 text-sm">
                <span>{fmtData(l.quando)}</span>
                <span className="font-medium">{formatBRL(Number(l.valor) || 0)}</span>
                <span>{l.curso_titulo ?? "-"}</span>
                <span className="flex items-center gap-1">
                  Pagamento nº {id}
                  <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Copiar número"
                    onClick={() => { navigator.clipboard.writeText(id); toast.success("Número copiado"); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </span>
                <Input
                  type="email" placeholder="email da pessoa" className="h-9 w-60"
                  value={emails[id] ?? ""} onChange={(e) => setEmails((m) => ({ ...m, [id]: e.target.value }))}
                />
                <Button size="sm" onClick={() => liberar(l)} disabled={liberando === id}>
                  {liberando === id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Liberar acesso
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {CHIPS.map((c) => (
          <Button key={c.key} size="sm" variant={chip === c.key ? "default" : "outline"} className="rounded-full" onClick={() => setChip(c.key)}>
            {c.label}
          </Button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={baixar} disabled={!tabela.length}>
          <Download className="w-4 h-4 mr-2" /> Baixar planilha
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
        </div>
      ) : tabela.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma venda de curso no período.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Curso</TableHead>
                <TableHead>Forma</TableHead><TableHead>Valor</TableHead><TableHead>Taxa</TableHead><TableHead>Líquido</TableHead><TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabela.map((l) => (
                <TableRow key={String(l.mp_payment_id)}>
                  <TableCell className="whitespace-nowrap">{fmtData(l.quando)}</TableCell>
                  <TableCell>
                    <span>{l.nome || "-"}</span>
                    {l.sem_login && <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">sem login</Badge>}
                  </TableCell>
                  <TableCell>{l.email || "-"}</TableCell>
                  <TableCell>{l.curso_titulo ?? "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">{forma(l)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatBRL(Number(l.valor) || 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatBRL(Number(l.taxa_mp) || 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatBRL(Number(l.valor_liquido) || 0)}</TableCell>
                  <TableCell><SituacaoBadge l={l} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VendasCursos;
