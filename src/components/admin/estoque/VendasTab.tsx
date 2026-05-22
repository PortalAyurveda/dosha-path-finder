import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useNovaVenda, useProdutos, useVendas } from "@/hooks/useSamkhyaEstoque";

const CANAIS = [
  { value: "loja_online", label: "Loja online" },
  { value: "kit", label: "Kit" },
  { value: "terapeuta", label: "Terapeuta" },
  { value: "aluno", label: "Aluno" },
  { value: "outro", label: "Outro" },
];

const today = () => new Date().toISOString().slice(0, 10);

const fmtBR = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  const d = s.includes("T") ? new Date(s) : new Date(s + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
};

export default function VendasTab() {
  const { data: produtos } = useProdutos();
  const { data: vendas, isLoading } = useVendas();
  const create = useNovaVenda();

  const DRAFT_KEY = "samkhya:vendas:draft";
  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {
      produto_id: "",
      quantidade: "1",
      preco_unitario: "",
      canal: "loja_online",
      data_venda: today(),
      notas: "",
    };
  });

  // Autosave do rascunho — evita perder dados ao trocar de aba do navegador
  // ou ao haver remount da página por refresh de sessão.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  const ativos = (produtos ?? []).filter((p) => p.ativo !== false);

  const submit = async () => {
    if (!form.produto_id) { toast.error("Escolha um produto"); return; }
    const qtd = Number(form.quantidade);
    const preco = Number(form.preco_unitario);
    if (!qtd || qtd <= 0) { toast.error("Quantidade inválida"); return; }
    if (Number.isNaN(preco) || preco < 0) { toast.error("Preço inválido"); return; }
    try {
      await create.mutateAsync({
        produto_id: Number(form.produto_id),
        quantidade: qtd,
        preco_unitario: preco,
        canal: form.canal,
        data_venda: form.data_venda,
        notas: form.notas.trim() || null,
      });
      toast.success("Venda registrada");
      const reset = { ...form, quantidade: "1", preco_unitario: "", notas: "" };
      setForm(reset);
      try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar venda");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Registrar venda</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="grid gap-1.5">
            <Label>Produto</Label>
            <Select value={form.produto_id} onValueChange={(v) => setForm({ ...form, produto_id: v })}>
              <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
              <SelectContent>
                {ativos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Quantidade</Label>
            <Input type="number" min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Preço unitário (R$)</Label>
            <Input type="number" step="0.01" value={form.preco_unitario} onChange={(e) => setForm({ ...form, preco_unitario: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Canal</Label>
            <Select value={form.canal} onValueChange={(v) => setForm({ ...form, canal: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CANAIS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Data</Label>
            <Input type="date" value={form.data_venda} onChange={(e) => setForm({ ...form, data_venda: e.target.value })} />
          </div>
          <div className="grid gap-1.5 md:col-span-3">
            <Label>Observações</Label>
            <Textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Salvando..." : "Registrar venda"}
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Últimas 50 vendas</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Preço unit.</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando…</TableCell></TableRow>
              )}
              {!isLoading && (vendas ?? []).length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem vendas registradas.</TableCell></TableRow>
              )}
              {(vendas ?? []).map((v) => {
                const total = (Number(v.quantidade) || 0) * (Number(v.preco_unitario) || 0);
                return (
                  <TableRow key={v.id}>
                    <TableCell>{fmtDate(v.data_venda)}</TableCell>
                    <TableCell>{v.produtos?.nome ?? `#${v.produto_id}`}</TableCell>
                    <TableCell className="text-right tabular-nums">{v.quantidade}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtBR(Number(v.preco_unitario))}</TableCell>
                    <TableCell>{CANAIS.find((c) => c.value === v.canal)?.label ?? v.canal ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{fmtBR(total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
