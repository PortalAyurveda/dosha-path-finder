import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { GraduationCap, Plus, Pencil, Mail, Save, FileText, Printer, X } from "lucide-react";

import ContratoFormacao from "@/components/ContratoFormacao";

type Aluno = {
  id: string;
  matricula: string | null;
  nome_completo: string;
  email: string;
  cpf: string | null;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  objetivo: string | null;
  como_conheceu: string | null;
  plano_pagamento: string;
  plano_descricao: string | null;
  dosha_resultado: string | null;
  dosha_v: number | null;
  dosha_p: number | null;
  dosha_k: number | null;
  status: string;
  aprovado_em: string | null;
  aprovado_por: string | null;
  eh_bolsista: boolean | null;
  percentual_bolsa: number | null;
  valor_mensalidade: number | null;
  contrato_valor_total: string | null;
  contrato_forma_pagamento: string | null;
  contrato_observacao: string | null;
  contrato_disponivel_aluno: boolean | null;
  created_at: string | null;
};

type Pagamento = {
  id: string;
  aluno_id: string;
  mes_referencia: string; // date YYYY-MM-DD
  valor_esperado: number | null;
  valor_pago: number | null;
  status: string;
  data_pagamento: string | null;
  observacao: string | null;
};

type Anotacao = {
  id: string;
  aluno_id: string;
  conteudo: string;
  autor: string | null;
  created_at: string | null;
};

const TURMA_ID = "28aceb41-ad27-427c-94b2-c61063e97252";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "trancado", label: "Trancado" },
  { value: "formado", label: "Formado" },
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "aprovado":
      return "bg-green-100 text-green-800 border-green-200";
    case "pendente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "reprovado":
      return "bg-red-100 text-red-800 border-red-200";
    case "trancado":
      return "bg-gray-200 text-gray-700 border-gray-300";
    case "formado":
      return "text-white border-transparent";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatBRL = (v: number | null | undefined) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
};

// 15 meses: jul/2026 a set/2027 = 15? jul(1) ago(2) set(3) out(4) nov(5) dez(6) jan(7) fev(8) mar(9) abr(10) mai(11) jun(12) jul(13) ago(14) set(15)
// User said "jul/2026 a nov/2027 (15 meses)" — that's 17 meses; respeitar o "15 meses" como verdade.
const MESES = (() => {
  const list: { key: string; label: string }[] = [];
  const start = new Date(2026, 6, 1); // julho 2026 (mês index 6)
  for (let i = 0; i < 15; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    list.push({ key, label });
  }
  return list;
})();

const blankNovo = {
  nome_completo: "",
  email: "",
  cpf: "",
  whatsapp: "",
  cidade: "",
  estado: "",
  objetivo: "",
  como_conheceu: "",
  plano_pagamento: "mensal",
  plano_descricao: "",
};

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovados" },
  { key: "trancado", label: "Trancados" },
  { key: "formado", label: "Formados" },
];

const AdminAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  const [selected, setSelected] = useState<Aluno | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Aluno>>({});
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [novaNota, setNovaNota] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const [novoOpen, setNovoOpen] = useState(false);
  const [novoForm, setNovoForm] = useState({ ...blankNovo });
  const [savingNovo, setSavingNovo] = useState(false);

  // Contrato
  const [contratoOpen, setContratoOpen] = useState(false);
  const [contratoValor, setContratoValor] = useState("");
  const [contratoFormaPag, setContratoFormaPag] = useState("");
  const [contratoObs, setContratoObs] = useState("");
  const [contratoCidade, setContratoCidade] = useState("");
  const [contratoData, setContratoData] = useState(() => new Date().toISOString().slice(0, 10));

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("escola_alunos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar alunos");
    setAlunos((data as Aluno[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filtro === "todos") return alunos;
    return alunos.filter((a) => a.status === filtro);
  }, [alunos, filtro]);

  const openFicha = async (a: Aluno) => {
    setSelected(a);
    setEditing(false);
    setEditForm(a);
    setNovaNota("");
    setEmailSubject("");
    setEmailBody("");

    setContratoValor(a.contrato_valor_total || "");
    setContratoFormaPag(a.contrato_forma_pagamento || a.plano_descricao || "");
    setContratoObs(a.contrato_observacao || "");
    setContratoCidade(a.cidade || "");
    setContratoData(new Date().toISOString().slice(0, 10));

    const [pg, an] = await Promise.all([
      supabase
        .from("escola_pagamentos")
        .select("*")
        .eq("aluno_id", a.id)
        .order("mes_referencia", { ascending: true }),
      supabase
        .from("escola_anotacoes")
        .select("*")
        .eq("aluno_id", a.id)
        .order("created_at", { ascending: false }),
    ]);
    setPagamentos((pg.data as Pagamento[]) || []);
    setAnotacoes((an.data as Anotacao[]) || []);
  };

  const refreshSelected = async () => {
    if (!selected) return;
    const { data } = await supabase
      .from("escola_alunos")
      .select("*")
      .eq("id", selected.id)
      .maybeSingle();
    if (data) {
      setSelected(data as Aluno);
      setEditForm(data as Aluno);
      setAlunos((arr) => arr.map((x) => (x.id === selected.id ? (data as Aluno) : x)));
    }
  };

  const salvarFicha = async () => {
    if (!selected) return;
    const payload: Partial<Aluno> = {
      nome_completo: editForm.nome_completo ?? selected.nome_completo,
      email: editForm.email ?? selected.email,
      cpf: editForm.cpf ?? selected.cpf,
      whatsapp: editForm.whatsapp ?? selected.whatsapp,
      cidade: editForm.cidade ?? selected.cidade,
      estado: editForm.estado ?? selected.estado,
      objetivo: editForm.objetivo ?? selected.objetivo,
      como_conheceu: editForm.como_conheceu ?? selected.como_conheceu,
      plano_pagamento: editForm.plano_pagamento ?? selected.plano_pagamento,
      plano_descricao: editForm.plano_descricao ?? selected.plano_descricao,
    };
    const { error } = await supabase
      .from("escola_alunos")
      .update(payload)
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao salvar");
    toast.success("Dados atualizados");
    setEditing(false);
    refreshSelected();
  };

  const atualizarStatus = async (novoStatus: string) => {
    if (!selected) return;
    const patch: Partial<Aluno> = { status: novoStatus };
    if (novoStatus === "aprovado") {
      patch.aprovado_em = new Date().toISOString();
      patch.aprovado_por = "Edson";
    }
    const { error } = await supabase
      .from("escola_alunos")
      .update(patch)
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao atualizar status");
    toast.success("Status atualizado");
    refreshSelected();
  };

  const atualizarFinanceiro = async (
    patch: Partial<Pick<Aluno, "eh_bolsista" | "percentual_bolsa" | "valor_mensalidade">>,
  ) => {
    if (!selected) return;
    const { error } = await supabase
      .from("escola_alunos")
      .update(patch)
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao atualizar");
    refreshSelected();
  };

  const upsertPagamento = async (
    mesKey: string,
    patch: Partial<Pagamento>,
  ) => {
    if (!selected) return;
    const existing = pagamentos.find((p) => p.mes_referencia.startsWith(mesKey.slice(0, 7)));
    if (existing) {
      const { error } = await supabase
        .from("escola_pagamentos")
        .update(patch)
        .eq("id", existing.id);
      if (error) return toast.error("Erro ao atualizar pagamento");
    } else {
      const valorEsperado =
        selected.valor_mensalidade != null ? Number(selected.valor_mensalidade) : 540;
      const { error } = await supabase.from("escola_pagamentos").insert({
        aluno_id: selected.id,
        mes_referencia: mesKey,
        valor_esperado: valorEsperado,
        status: "pendente",
        criado_por: "Edson",
        ...patch,
      });
      if (error) return toast.error("Erro ao criar pagamento");
    }
    const { data } = await supabase
      .from("escola_pagamentos")
      .select("*")
      .eq("aluno_id", selected.id)
      .order("mes_referencia", { ascending: true });
    setPagamentos((data as Pagamento[]) || []);
    toast.success("Pagamento atualizado");
  };

  const marcarPago = async (mesKey: string) => {
    if (!selected) return;
    const valorEsperado =
      selected.valor_mensalidade != null ? Number(selected.valor_mensalidade) : 540;
    await upsertPagamento(mesKey, {
      status: "pago",
      valor_pago: valorEsperado,
      data_pagamento: new Date().toISOString().slice(0, 10),
    });
  };

  const adicionarNota = async () => {
    if (!selected || !novaNota.trim()) return;
    const { error } = await supabase.from("escola_anotacoes").insert({
      aluno_id: selected.id,
      conteudo: novaNota.trim(),
      autor: "Edson",
    });
    if (error) return toast.error("Erro ao adicionar nota");
    setNovaNota("");
    const { data } = await supabase
      .from("escola_anotacoes")
      .select("*")
      .eq("aluno_id", selected.id)
      .order("created_at", { ascending: false });
    setAnotacoes((data as Anotacao[]) || []);
    toast.success("Nota adicionada");
  };

  const enviarEmail = async () => {
    if (!selected || !emailSubject.trim() || !emailBody.trim()) {
      return toast.error("Preencha assunto e mensagem");
    }
    setSendingEmail(true);
    const { data, error } = await supabase.functions.invoke("send-aluno-email", {
      body: {
        to: selected.email,
        nome: selected.nome_completo,
        subject: emailSubject.trim(),
        message: emailBody.trim(),
      },
    });
    setSendingEmail(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Erro ao enviar email");
      return;
    }
    toast.success("Email enviado");
    setEmailSubject("");
    setEmailBody("");
  };

  const criarAlunoManual = async () => {
    if (!novoForm.nome_completo.trim() || !novoForm.email.trim() || !novoForm.whatsapp.trim()) {
      return toast.error("Nome, email e WhatsApp são obrigatórios");
    }
    setSavingNovo(true);
    const matricula = `M${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("escola_alunos").insert({
      turma_id: TURMA_ID,
      matricula,
      nome_completo: novoForm.nome_completo.trim(),
      email: novoForm.email.trim().toLowerCase(),
      cpf: novoForm.cpf.trim() || null,
      whatsapp: novoForm.whatsapp.trim(),
      cidade: novoForm.cidade.trim() || null,
      estado: novoForm.estado.trim().toUpperCase() || null,
      objetivo: novoForm.objetivo.trim() || null,
      como_conheceu: novoForm.como_conheceu.trim() || null,
      plano_pagamento: novoForm.plano_pagamento,
      plano_descricao: novoForm.plano_descricao.trim() || null,
      status: "pendente",
    });
    setSavingNovo(false);
    if (error) return toast.error(error.message || "Erro ao criar aluno");
    toast.success("Aluno cadastrado");
    setNovoOpen(false);
    setNovoForm({ ...blankNovo });
    load();
  };

  const salvarDadosContrato = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("escola_alunos")
      .update({
        contrato_valor_total: contratoValor || null,
        contrato_forma_pagamento: contratoFormaPag || null,
        contrato_observacao: contratoObs || null,
      })
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao salvar dados do contrato");
    toast.success("Dados do contrato salvos");
    refreshSelected();
  };

  const toggleContratoDisponivel = async (novo: boolean) => {
    if (!selected) return;
    const { error } = await supabase
      .from("escola_alunos")
      .update({ contrato_disponivel_aluno: novo })
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao atualizar disponibilidade");
    toast.success(novo ? "Contrato disponibilizado" : "Contrato ocultado");
    refreshSelected();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Alunos — Admin" description="Gestão dos alunos da Formação Ayurveda" />
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Alunos — Formação
            </h1>
            <p className="text-sm text-muted-foreground">
              Inscrições, status, pagamentos e anotações.
            </p>
          </div>
          <Button onClick={() => setNovoOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar aluno manualmente
          </Button>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filtro === f.key ? "default" : "outline"}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <section className="border border-border rounded-xl bg-card overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum aluno encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inscrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer"
                    onClick={() => openFicha(a)}
                  >
                    <TableCell className="font-mono text-xs">
                      {a.matricula || "—"}
                    </TableCell>
                    <TableCell className="font-medium">{a.nome_completo}</TableCell>
                    <TableCell className="text-xs">{a.email}</TableCell>
                    <TableCell className="text-xs">{a.whatsapp}</TableCell>
                    <TableCell className="text-xs">
                      {[a.cidade, a.estado].filter(Boolean).join("/")}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {a.plano_pagamento}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(a.status)}
                        style={a.status === "formado" ? { backgroundColor: "#7b4963" } : undefined}
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(a.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>

      {/* Drawer ficha do aluno */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-heading">
                  {selected.nome_completo}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {selected.matricula || "sem matrícula"}
                  </span>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(selected.status)}
                    style={selected.status === "formado" ? { backgroundColor: "#7b4963", color: "#fff" } : undefined}
                  >
                    {selected.status}
                  </Badge>
                  {selected.dosha_resultado && (
                    <Badge variant="secondary">{selected.dosha_resultado}</Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-8 py-6">
                {/* Seção 1 — Dados */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold">Dados do aluno</h3>
                    {editing ? (
                      <Button size="sm" onClick={salvarFicha} className="gap-1">
                        <Save className="w-4 h-4" /> Salvar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(true)}
                        className="gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { k: "nome_completo", label: "Nome" },
                      { k: "email", label: "Email" },
                      { k: "cpf", label: "CPF" },
                      { k: "whatsapp", label: "WhatsApp" },
                      { k: "cidade", label: "Cidade" },
                      { k: "estado", label: "Estado" },
                      { k: "plano_pagamento", label: "Plano" },
                      { k: "plano_descricao", label: "Descrição plano" },
                    ].map((f) => (
                      <div key={f.k}>
                        <Label className="text-xs text-muted-foreground">{f.label}</Label>
                        {editing ? (
                          <Input
                            value={(editForm as any)[f.k] || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, [f.k]: e.target.value })
                            }
                          />
                        ) : (
                          <p>{(selected as any)[f.k] || "—"}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Objetivo</Label>
                      {editing ? (
                        <Textarea
                          value={editForm.objetivo || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, objetivo: e.target.value })
                          }
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{selected.objetivo || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Como conheceu</Label>
                      {editing ? (
                        <Textarea
                          value={editForm.como_conheceu || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, como_conheceu: e.target.value })
                          }
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{selected.como_conheceu || "—"}</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Seção Contrato */}
                <section className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-heading font-semibold">Contrato</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Valor total</Label>
                      <Input
                        placeholder="R$ 8.100,00"
                        value={contratoValor}
                        onChange={(e) => setContratoValor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Forma de pagamento</Label>
                      <Input
                        value={contratoFormaPag}
                        onChange={(e) => setContratoFormaPag(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cidade da assinatura</Label>
                      <Input
                        value={contratoCidade}
                        onChange={(e) => setContratoCidade(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Data da assinatura</Label>
                      <Input
                        type="date"
                        value={contratoData}
                        onChange={(e) => setContratoData(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Observação</Label>
                      <Textarea
                        value={contratoObs}
                        onChange={(e) => setContratoObs(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={!!selected.contrato_disponivel_aluno}
                      onCheckedChange={toggleContratoDisponivel}
                    />
                    <Label className="text-sm">
                      Disponibilizar contrato na área do aluno
                    </Label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={salvarDadosContrato}
                    >
                      <Save className="w-4 h-4" /> Salvar dados do contrato
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setContratoOpen(true)}
                    >
                      <FileText className="w-4 h-4" /> Gerar contrato para impressão
                    </Button>
                  </div>
                </section>


                {/* Seção 2 — Status e financeiro */}
                <section className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-heading font-semibold">Status e financeiro</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={selected.status} onValueChange={atualizarStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selected.aprovado_em && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Aprovado em {formatDate(selected.aprovado_em)} por{" "}
                          {selected.aprovado_por || "—"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Valor mensalidade
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={selected.valor_mensalidade ?? 540}
                        onBlur={(e) =>
                          atualizarFinanceiro({ valor_mensalidade: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        checked={!!selected.eh_bolsista}
                        onCheckedChange={(v) => atualizarFinanceiro({ eh_bolsista: v })}
                      />
                      <Label className="text-sm">Bolsista</Label>
                    </div>

                    {selected.eh_bolsista && (
                      <div>
                        <Label className="text-xs text-muted-foreground">% de bolsa</Label>
                        <Input
                          type="number"
                          step="1"
                          defaultValue={selected.percentual_bolsa ?? 0}
                          onBlur={(e) =>
                            atualizarFinanceiro({ percentual_bolsa: Number(e.target.value) })
                          }
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Seção 3 — Pagamentos */}
                <section className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-heading font-semibold">Pagamentos mês a mês</h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead>Esperado</TableHead>
                          <TableHead>Pago</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MESES.map((m) => {
                          const p = pagamentos.find((x) =>
                            x.mes_referencia.startsWith(m.key.slice(0, 7)),
                          );
                          const valorEsperado = p?.valor_esperado ??
                            (selected.valor_mensalidade != null
                              ? Number(selected.valor_mensalidade)
                              : 540);
                          return (
                            <TableRow
                              key={m.key}
                              className={!p ? "bg-muted/40" : ""}
                            >
                              <TableCell className="capitalize text-xs">{m.label}</TableCell>
                              <TableCell className="text-xs">{formatBRL(valorEsperado)}</TableCell>
                              <TableCell className="text-xs">
                                {p?.valor_pago != null ? formatBRL(p.valor_pago) : "—"}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={p?.status || "pendente"}
                                  onValueChange={(v) =>
                                    upsertPagamento(m.key, { status: v })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pago">pago</SelectItem>
                                    <SelectItem value="pendente">pendente</SelectItem>
                                    <SelectItem value="atrasado">atrasado</SelectItem>
                                    <SelectItem value="isento">isento</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-xs">
                                {formatDate(p?.data_pagamento ?? null)}
                              </TableCell>
                              <TableCell>
                                {p?.status !== "pago" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => marcarPago(m.key)}
                                  >
                                    Marcar pago
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </section>

                {/* Seção 4 — Notas internas */}
                <section className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-heading font-semibold">Notas internas</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Nova nota interna..."
                      value={novaNota}
                      onChange={(e) => setNovaNota(e.target.value)}
                    />
                    <Button size="sm" onClick={adicionarNota} className="gap-1">
                      <Plus className="w-4 h-4" /> Adicionar nota
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {anotacoes.map((n) => (
                      <li
                        key={n.id}
                        className="text-sm border border-border rounded-md p-3 bg-muted/30"
                      >
                        <p className="whitespace-pre-wrap">{n.conteudo}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {n.autor || "—"} · {formatDate(n.created_at)}
                        </p>
                      </li>
                    ))}
                    {anotacoes.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nenhuma nota ainda.</p>
                    )}
                  </ul>
                </section>

                {/* Seção 5 — Email */}
                <section className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-heading font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Enviar email
                  </h3>
                  <Input
                    placeholder="Assunto"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Mensagem..."
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                  <Button onClick={enviarEmail} disabled={sendingEmail} className="gap-1">
                    <Mail className="w-4 h-4" />
                    {sendingEmail ? "Enviando..." : `Enviar para ${selected.email}`}
                  </Button>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {contratoOpen && selected && (
        <div
          id="contrato-print"
          className="fixed inset-0 bg-white z-[9999] overflow-auto"
        >
          <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-2 bg-white border-b border-border px-4 py-3 shadow-sm">
            <div className="text-sm text-muted-foreground">
              Pré-visualização do contrato
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setContratoOpen(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" /> Fechar
              </Button>
            </div>
          </div>

          <ContratoFormacao
            nome_completo={selected.nome_completo}
            cpf={selected.cpf}
            email={selected.email}
            whatsapp={selected.whatsapp}
            cidade={contratoCidade}
            contrato_valor_total={contratoValor}
            contrato_forma_pagamento={contratoFormaPag}
            contrato_observacao={contratoObs}
            data={contratoData}
          />
        </div>
      )}


      {/* Dialog novo aluno */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar aluno manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Nome completo *</Label>
                <Input
                  value={novoForm.nome_completo}
                  onChange={(e) =>
                    setNovoForm({ ...novoForm, nome_completo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={novoForm.email}
                  onChange={(e) => setNovoForm({ ...novoForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={novoForm.cpf}
                  onChange={(e) => setNovoForm({ ...novoForm, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label>WhatsApp *</Label>
                <Input
                  value={novoForm.whatsapp}
                  onChange={(e) => setNovoForm({ ...novoForm, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={novoForm.cidade}
                  onChange={(e) => setNovoForm({ ...novoForm, cidade: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado (UF)</Label>
                <Input
                  maxLength={2}
                  value={novoForm.estado}
                  onChange={(e) => setNovoForm({ ...novoForm, estado: e.target.value })}
                />
              </div>
              <div>
                <Label>Plano</Label>
                <Select
                  value={novoForm.plano_pagamento}
                  onValueChange={(v) => setNovoForm({ ...novoForm, plano_pagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="avista">À vista</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição do plano</Label>
                <Input
                  value={novoForm.plano_descricao}
                  onChange={(e) =>
                    setNovoForm({ ...novoForm, plano_descricao: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Textarea
                value={novoForm.objetivo}
                onChange={(e) => setNovoForm({ ...novoForm, objetivo: e.target.value })}
              />
            </div>
            <div>
              <Label>Como conheceu</Label>
              <Textarea
                value={novoForm.como_conheceu}
                onChange={(e) =>
                  setNovoForm({ ...novoForm, como_conheceu: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNovoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={criarAlunoManual} disabled={savingNovo}>
                {savingNovo ? "Salvando..." : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAlunos;
