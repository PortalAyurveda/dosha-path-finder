import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Ticket } from "lucide-react";

type Cupom = {
  id: string;
  codigo: string;
  descricao: string | null;
  tipo_cupom: string;
  tipo_desconto: string;
  valor_desconto: number;
  escopo: string;
  limite_usos_total: number | null;
  usos_realizados: number | null;
  limite_usos_por_usuario: number | null;
  valido_de: string | null;
  valido_ate: string | null;
  terapeuta_nome: string | null;
  terapeuta_email: string | null;
  ativo: boolean;
  created_at: string | null;
};

type CupomUso = {
  id: string;
  cupom_id: string;
  pedido_id: string | null;
  email_comprador: string | null;
  desconto_aplicado: number;
  created_at: string | null;
};

const tiposCupom = [
  { value: "uso_unico", label: "Uso único" },
  { value: "premium", label: "Premium" },
  { value: "aluno", label: "Aluno" },
  { value: "terapeuta", label: "Terapeuta" },
  { value: "generico", label: "Genérico" },
];

const escopos = [
  { value: "loja", label: "Loja Samkhya" },
  { value: "site", label: "Site/Assinatura" },
  { value: "ambos", label: "Ambos" },
];

const formatBRL = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDesconto = (c: Cupom) =>
  c.tipo_desconto === "percentual"
    ? `${Number(c.valor_desconto)}%`
    : formatBRL(Number(c.valor_desconto));

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
};

const blankForm = {
  codigo: "",
  descricao: "",
  tipo_cupom: "generico",
  tipo_desconto: "percentual",
  valor_desconto: "",
  escopo: "loja",
  limite_usos_total: "",
  limite_usos_por_usuario: "",
  valido_de: "",
  valido_ate: "",
  terapeuta_nome: "",
  terapeuta_email: "",
  ativo: true,
};

const AdminCupons = () => {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...blankForm });

  // Drawer de usos
  const [selected, setSelected] = useState<Cupom | null>(null);
  const [usos, setUsos] = useState<CupomUso[]>([]);
  const [loadingUsos, setLoadingUsos] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await lojaSupabase
      .from("cupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar cupons");
    } else {
      setCupons((data as Cupom[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const ordered = useMemo(
    () =>
      [...cupons].sort((a, b) =>
        Number(b.ativo) - Number(a.ativo) ||
        (b.created_at || "").localeCompare(a.created_at || "")
      ),
    [cupons],
  );

  const toggleAtivo = async (c: Cupom) => {
    const prev = c.ativo;
    setCupons((arr) =>
      arr.map((x) => (x.id === c.id ? { ...x, ativo: !prev } : x)),
    );
    const { error } = await lojaSupabase
      .from("cupons")
      .update({ ativo: !prev })
      .eq("id", c.id);
    if (error) {
      toast.error("Erro ao atualizar");
      setCupons((arr) =>
        arr.map((x) => (x.id === c.id ? { ...x, ativo: prev } : x)),
      );
    }
  };

  const handleSubmit = async () => {
    const codigo = form.codigo.trim().toUpperCase();
    if (!codigo) return toast.error("Informe o código do cupom");
    const valor = Number(form.valor_desconto);
    if (!(valor > 0)) return toast.error("Informe um valor de desconto válido");

    setSaving(true);
    const payload = {
      codigo,
      descricao: form.descricao.trim() || null,
      tipo_cupom: form.tipo_cupom,
      tipo_desconto: form.tipo_desconto,
      valor_desconto: valor,
      escopo: form.escopo,
      limite_usos_total: form.limite_usos_total
        ? Number(form.limite_usos_total)
        : null,
      limite_usos_por_usuario: form.limite_usos_por_usuario
        ? Number(form.limite_usos_por_usuario)
        : null,
      valido_de: form.valido_de
        ? new Date(form.valido_de).toISOString()
        : null,
      valido_ate: form.valido_ate
        ? new Date(form.valido_ate + "T23:59:59").toISOString()
        : null,
      terapeuta_nome:
        form.tipo_cupom === "terapeuta" ? form.terapeuta_nome.trim() || null : null,
      terapeuta_email:
        form.tipo_cupom === "terapeuta"
          ? form.terapeuta_email.trim().toLowerCase() || null
          : null,
      ativo: form.ativo,
    };

    const { error } = await lojaSupabase.from("cupons").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao criar cupom");
      return;
    }
    toast.success("Cupom criado");
    setOpen(false);
    setForm({ ...blankForm });
    load();
  };

  const openUsos = async (c: Cupom) => {
    setSelected(c);
    setLoadingUsos(true);
    const { data, error } = await lojaSupabase
      .from("cupom_usos")
      .select("*")
      .eq("cupom_id", c.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar usos");
    setUsos((data as CupomUso[]) || []);
    setLoadingUsos(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Cupons — Admin" description="Gerenciamento de cupons de desconto" />
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              Cupons de desconto
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os cupons da loja e do portal.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo cupom
          </Button>
        </header>

        <section className="border border-border rounded-xl bg-card overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : ordered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum cupom cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Escopo</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead>Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => openUsos(c)}
                  >
                    <TableCell className="font-mono font-medium">{c.codigo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.tipo_cupom}</Badge>
                    </TableCell>
                    <TableCell>{formatDesconto(c)}</TableCell>
                    <TableCell className="capitalize">{c.escopo}</TableCell>
                    <TableCell>
                      {c.usos_realizados ?? 0}
                      {c.limite_usos_total != null ? ` / ${c.limite_usos_total}` : " / ∞"}
                    </TableCell>
                    <TableCell>{formatDate(c.valido_ate)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={!!c.ativo}
                        onCheckedChange={() => toggleAtivo(c)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>

      {/* Dialog criar cupom */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo cupom</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({ ...form, codigo: e.target.value.toUpperCase() })
                  }
                  placeholder="SAMKHYA10"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Cupom de lançamento"
                />
              </div>

              <div>
                <Label>Tipo do cupom</Label>
                <Select
                  value={form.tipo_cupom}
                  onValueChange={(v) => setForm({ ...form, tipo_cupom: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tiposCupom.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Escopo</Label>
                <Select
                  value={form.escopo}
                  onValueChange={(v) => setForm({ ...form, escopo: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {escopos.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de desconto</Label>
                <Select
                  value={form.tipo_desconto}
                  onValueChange={(v) => setForm({ ...form, tipo_desconto: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor">
                  Valor do desconto {form.tipo_desconto === "percentual" ? "(%)" : "(R$)"}
                </Label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor_desconto}
                  onChange={(e) => setForm({ ...form, valor_desconto: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="lim_total">Limite de usos total</Label>
                <Input
                  id="lim_total"
                  type="number"
                  min="1"
                  value={form.limite_usos_total}
                  onChange={(e) =>
                    setForm({ ...form, limite_usos_total: e.target.value })
                  }
                  placeholder="Ilimitado se vazio"
                />
              </div>
              <div>
                <Label htmlFor="lim_user">Limite de usos por usuário</Label>
                <Input
                  id="lim_user"
                  type="number"
                  min="1"
                  value={form.limite_usos_por_usuario}
                  onChange={(e) =>
                    setForm({ ...form, limite_usos_por_usuario: e.target.value })
                  }
                  placeholder="Ilimitado se vazio"
                />
              </div>

              <div>
                <Label htmlFor="de">Válido de</Label>
                <Input
                  id="de"
                  type="date"
                  value={form.valido_de}
                  onChange={(e) => setForm({ ...form, valido_de: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ate">Válido até</Label>
                <Input
                  id="ate"
                  type="date"
                  value={form.valido_ate}
                  onChange={(e) => setForm({ ...form, valido_ate: e.target.value })}
                />
              </div>

              {form.tipo_cupom === "terapeuta" && (
                <>
                  <div>
                    <Label htmlFor="tnome">Nome do terapeuta</Label>
                    <Input
                      id="tnome"
                      value={form.terapeuta_nome}
                      onChange={(e) =>
                        setForm({ ...form, terapeuta_nome: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="temail">Email do terapeuta</Label>
                    <Input
                      id="temail"
                      type="email"
                      value={form.terapeuta_email}
                      onChange={(e) =>
                        setForm({ ...form, terapeuta_email: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
              <Label className="cursor-pointer">Ativo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Salvando..." : "Criar cupom"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawer de usos */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono">{selected?.codigo}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground">
                {selected.descricao || "Sem descrição"}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Tipo</div>
                  <div>{selected.tipo_cupom}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Desconto</div>
                  <div>{formatDesconto(selected)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Usos</div>
                  <div>
                    {selected.usos_realizados ?? 0}
                    {selected.limite_usos_total != null
                      ? ` / ${selected.limite_usos_total}`
                      : " / ∞"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Válido até</div>
                  <div>{formatDate(selected.valido_ate)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Histórico de usos</h3>
                {loadingUsos ? (
                  <Skeleton className="h-24 w-full" />
                ) : usos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este cupom ainda não foi utilizado.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usos.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-xs">
                            {u.email_comprador || "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {u.pedido_id ? u.pedido_id.slice(0, 8) : "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatBRL(Number(u.desconto_aplicado))}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(u.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCupons;
