import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface Assinante {
  nome: string | null;
  email: string;
  subscription_status: string | null;
  premium_since: string | null;
  premium_until: string | null;
  plano: "mensal" | "anual" | "rotina";
  valor: number;
  stripe_subscription_id: string | null;
  isCortesia: boolean;
  is_premium: boolean;
  tokens_akasha: number | null;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (s: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const derivarPlano = (
  premium_since: string | null,
  premium_until: string | null,
): { plano: "mensal" | "anual"; valor: number } => {
  if (premium_since && premium_until) {
    const since = new Date(premium_since).getTime();
    const until = new Date(premium_until).getTime();
    const dias = (until - since) / (1000 * 60 * 60 * 24);
    if (dias >= 360) return { plano: "anual", valor: 597.0 };
  }
  return { plano: "mensal", valor: 79.9 };
};

const planoBadge = (plano: string) => {
  const p = plano?.toLowerCase();
  if (p === "anual")
    return <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-transparent">anual</Badge>;
  if (p === "rotina")
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-transparent">rotina</Badge>;
  return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-transparent">mensal</Badge>;
};

const statusBadge = (status: string | null) => {
  const s = status?.toLowerCase();
  if (s === "active")
    return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">active</Badge>;
  if (s === "canceled")
    return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">canceled</Badge>;
  if (s === "past_due")
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">past_due</Badge>;
  return <Badge variant="outline">{status ?? "—"}</Badge>;
};

const AssinaturasTable = ({
  data,
  loading,
  onChanged,
}: {
  data: Assinante[];
  loading: boolean;
  onChanged: () => void;
}) => {
  const toggleCortesia = async (a: Assinante) => {
    const novo = !a.isCortesia;
    const { error } = await supabase
      .from("user_profiles")
      .update({ is_cortesia: novo } as any)
      .ilike("email", a.email);
    if (error) {
      toast.error(`Erro ao atualizar: ${error.message}`);
      return;
    }
    toast.success(novo ? "Marcado como cortesia" : "Cortesia removida");
    onChanged();
  };

  const trocarPlano = async (a: Assinante, plano: "mensal" | "anual" | "rotina") => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ plano } as any)
      .ilike("email", a.email);
    if (error) {
      toast.error(`Erro ao trocar plano: ${error.message}`);
      return;
    }
    toast.success(`Plano alterado para ${plano}`);
    onChanged();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">Nenhuma assinatura encontrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[60px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((a) => (
          <TableRow key={a.email}>
            <TableCell className="whitespace-nowrap">{formatDate(a.premium_since)}</TableCell>
            <TableCell>{a.nome || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{a.email}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 flex-wrap">
                {planoBadge(a.plano)}
                {a.isCortesia && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600 text-[10px] px-1.5 py-0">
                    cortesia
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{formatBRL(Number(a.valor))}</TableCell>
            <TableCell>{statusBadge(a.subscription_status)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleCortesia(a)}>
                    {a.isCortesia ? "Remover cortesia" : "Marcar como cortesia"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Trocar plano</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => trocarPlano(a, "mensal")}>Mensal</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => trocarPlano(a, "anual")}>Anual</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => trocarPlano(a, "rotina")}>Rotina</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ResumoCards = ({ data }: { data: Assinante[] }) => {
  const ativos = data.filter((a) => a.subscription_status === "active");
  const mensaisAtivos = ativos.filter((a) => a.plano?.toLowerCase() === "mensal" && !a.isCortesia).length;
  const anuaisAtivos = ativos.filter((a) => a.plano?.toLowerCase() === "anual" && !a.isCortesia).length;
  const cortesiasAtivas = ativos.filter((a) => a.isCortesia).length;
  const mrr = mensaisAtivos * 79.9 + anuaisAtivos * 49.75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Assinantes ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{ativos.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">MRR</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{formatBRL(mrr)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mensaisAtivos} mensal × R$ 79,90 + {anuaisAtivos} anual × R$ 49,75
            {cortesiasAtivas > 0 && (
              <span className="block text-amber-600">({cortesiasAtivas} cortesia{cortesiasAtivas > 1 ? "s" : ""} não contabilizada{cortesiasAtivas > 1 ? "s" : ""})</span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Total de assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{data.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const ResumoCardsRotinas = ({ data }: { data: Assinante[] }) => {
  const ativos = data.filter((a) => a.subscription_status === "active");
  const ativosPagantes = ativos.filter((a) => !a.isCortesia).length;
  const cortesiasAtivas = ativos.filter((a) => a.isCortesia).length;
  const mrr = ativosPagantes * 30.0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Assinantes ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{ativos.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">MRR</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{formatBRL(mrr)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {ativosPagantes} rotina × R$ 30,00
            {cortesiasAtivas > 0 && (
              <span className="block text-amber-600">({cortesiasAtivas} cortesia{cortesiasAtivas > 1 ? "s" : ""} não contabilizada{cortesiasAtivas > 1 ? "s" : ""})</span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Total de assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{data.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminVendasAkasha = () => {
  const [tab, setTab] = useState("premium");

  // ----- Premium tab state -----
  const [data, setData] = useState<Assinante[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssinaturas = useCallback(async () => {
    setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("nome, nome_completo, email, subscription_status, premium_since, premium_until, is_premium, stripe_subscription_id, is_cortesia, tokens_akasha")
        .eq("is_premium", true)
        .order("premium_since", { ascending: false, nullsFirst: false });
      if (!error && data) {
        const rows: Assinante[] = (data as any[]).map((r) => {
          const { plano, valor } = derivarPlano(r.premium_since, r.premium_until);
          const stripeId = r.stripe_subscription_id;
          return {
            nome: r.nome_completo || r.nome || null,
            email: r.email,
            subscription_status: r.subscription_status ?? null,
            premium_since: r.premium_since ?? null,
            premium_until: r.premium_until ?? null,
            plano,
            valor,
            stripe_subscription_id: stripeId ?? null,
            isCortesia: !!r.is_cortesia,
            is_premium: !!r.is_premium,
            tokens_akasha: r.tokens_akasha ?? null,
          };
        });
        setData(rows);
      }
    setLoading(false);
  }, []);

  // ----- Rotinas tab state -----
  const [rotinasData, setRotinasData] = useState<Assinante[]>([]);
  const [rotinasLoading, setRotinasLoading] = useState(true);

  const loadRotinas = useCallback(async () => {
    setRotinasLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("nome, nome_completo, email, subscription_status, premium_since, premium_until, plano, stripe_subscription_id, is_cortesia")
        .eq("plano", "rotina")
        .order("premium_since", { ascending: false, nullsFirst: false });
      if (!error && data) {
        const rows: Assinante[] = (data as any[]).map((r) => {
          const stripeId = r.stripe_subscription_id;
          return {
            nome: r.nome_completo || r.nome || null,
            email: r.email,
            subscription_status: r.subscription_status ?? null,
            premium_since: r.premium_since ?? null,
            premium_until: r.premium_until ?? null,
            plano: "rotina" as const,
            valor: 30.0,
            stripe_subscription_id: stripeId ?? null,
            isCortesia: !!r.is_cortesia,
          };
        });
        setRotinasData(rows);
      }
    setRotinasLoading(false);
  }, []);

  useEffect(() => {
    loadAssinaturas();
    loadRotinas();
  }, [loadAssinaturas, loadRotinas]);

  // ----- Manual premium activation panel -----
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    nome: string;
    email: string;
    is_premium: boolean;
    subscription_status: string | null;
  } | null>(null);
  const [planoSel, setPlanoSel] = useState<"mensal" | "anual">("mensal");
  const [activating, setActivating] = useState(false);

  const handleBuscar = async () => {
    const email = searchEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Informe um email");
      return;
    }
    setSearching(true);
    setFoundUser(null);
    const [profileRes, doshaRes] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("nome, nome_completo, email, is_premium, subscription_status")
        .ilike("email", email)
        .maybeSingle(),
      supabase
        .from("doshas_registros")
        .select("nome, email, created_at")
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setSearching(false);

    const profile = profileRes.data as any;
    const dosha = doshaRes.data as any;

    if (!profile && !dosha) {
      toast.error("Usuário não encontrado");
      return;
    }

    const nome =
      profile?.nome_completo || profile?.nome || dosha?.nome || email;

    setFoundUser({
      nome,
      email,
      is_premium: !!profile?.is_premium,
      subscription_status: profile?.subscription_status ?? null,
    });

    if (profile?.is_premium) {
      toast.warning(`${nome} já é premium (${profile.subscription_status ?? "ativo"})`);
    } else {
      toast.success(`Usuário encontrado: ${nome}`);
    }
  };

  const handleAtivar = async () => {
    if (!foundUser) return;
    setActivating(true);
    const now = new Date();
    const until = new Date(now);
    if (planoSel === "mensal") {
      until.setMonth(until.getMonth() + 1);
    } else {
      until.setMonth(until.getMonth() + 12);
    }

    const { data: updated, error } = await supabase
      .from("user_profiles")
      .update({
        is_premium: true,
        subscription_status: "active",
        premium_since: now.toISOString(),
        premium_until: until.toISOString(),
        stripe_subscription_id: "manual",
      })
      .ilike("email", foundUser.email)
      .select("id, email");

    if (error) {
      setActivating(false);
      toast.error(`Erro ao ativar: ${error.message}`);
      return;
    }

    if (!updated || updated.length === 0) {
      setActivating(false);
      toast.error(
        `Nenhum perfil atualizado para ${foundUser.email}. Verifique se o usuário existe em user_profiles.`,
      );
      return;
    }


    // Fire-and-forget webhook
    try {
      await fetch("https://n8n.portalayurveda.com/webhook/samkhya-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "premium",
          email: foundUser.email,
          nome: foundUser.nome,
          plano: planoSel,
        }),
      });
    } catch (e) {
      console.error("Webhook n8n falhou", e);
    }

    toast.success(`Premium ${planoSel} ativado para ${foundUser.nome}`);

    setActivating(false);
    setFoundUser(null);
    setSearchEmail("");
    loadAssinaturas();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Assinaturas Premium — Admin" description="Painel de assinaturas Akasha" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Assinaturas Premium</h1>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="rotinas">Rotinas</TabsTrigger>
          </TabsList>

          <TabsContent value="premium" className="space-y-6">
            <ResumoCards data={data} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ativar Premium Manualmente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="manual-premium-email">Email do usuário</Label>
                    <Input
                      id="manual-premium-email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={searchEmail}
                      onChange={(e) => {
                        setSearchEmail(e.target.value);
                        setFoundUser(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleBuscar();
                      }}
                    />
                  </div>
                  <Button onClick={handleBuscar} disabled={searching}>
                    {searching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>

                {foundUser && (
                  <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{foundUser.nome}</p>
                      <p className="text-muted-foreground">{foundUser.email}</p>
                      {foundUser.is_premium ? (
                        <p className="mt-1 text-yellow-600 font-medium">
                          ⚠ Já é premium (status: {foundUser.subscription_status ?? "active"})
                        </p>
                      ) : (
                        <p className="mt-1 text-muted-foreground">Status: não premium</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Plano</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {([
                          { v: "mensal", label: "Mensal — R$ 79,90/mês", sub: "+ 1 mês" },
                          { v: "anual", label: "Anual — R$ 597,00/ano", sub: "+ 12 meses" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => setPlanoSel(opt.v)}
                            className={`text-left rounded-md border p-3 transition-colors ${
                              planoSel === opt.v
                                ? "border-primary bg-primary/5"
                                : "border-input hover:bg-accent"
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">premium_until = now() {opt.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleAtivar} disabled={activating} className="w-full sm:w-auto">
                      {activating ? "Ativando..." : "Ativar Premium"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <AssinaturasTable data={data} loading={loading} onChanged={() => { loadAssinaturas(); loadRotinas(); }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rotinas" className="space-y-6">
            <ResumoCardsRotinas data={rotinasData} />

            <Card>
              <CardContent className="p-0">
                <AssinaturasTable data={rotinasData} loading={rotinasLoading} onChanged={() => { loadAssinaturas(); loadRotinas(); }} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminVendasAkasha;

