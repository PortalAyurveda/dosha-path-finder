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

interface Assinatura {
  id: string;
  nome: string | null;
  email: string;
  plano: string;
  valor: number;
  status: string;
  created_at: string;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const planoBadge = (plano: string) => {
  const p = plano?.toLowerCase();
  if (p === "anual")
    return <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-transparent">anual</Badge>;
  return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-transparent">mensal</Badge>;
};

const statusBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "active")
    return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">active</Badge>;
  if (s === "canceled")
    return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">canceled</Badge>;
  if (s === "past_due")
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">past_due</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

const AdminVendasAkasha = () => {
  const [data, setData] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssinaturas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assinaturas")
      .select("id, nome, email, plano, valor, status, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setData(data as Assinatura[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAssinaturas();
  }, [loadAssinaturas]);

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

    const { error } = await supabase
      .from("user_profiles")
      .update({
        is_premium: true,
        subscription_status: "active",
        premium_since: now.toISOString(),
        premium_until: until.toISOString(),
        stripe_subscription_id: "manual",
      })
      .ilike("email", foundUser.email);

    if (error) {
      setActivating(false);
      toast.error(`Erro ao ativar: ${error.message}`);
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

    toast.success(`Premium ativado para ${foundUser.nome}`);
    setActivating(false);
    setFoundUser(null);
    setSearchEmail("");
    loadAssinaturas();
  };

  const ativos = data.filter((a) => a.status === "active");
  const mensaisAtivos = ativos.filter((a) => a.plano?.toLowerCase() === "mensal").length;
  const anuaisAtivos = ativos.filter((a) => a.plano?.toLowerCase() === "anual").length;
  const mrr = mensaisAtivos * 79.9 + anuaisAtivos * 49.75;

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Assinaturas Premium — Admin" description="Painel de assinaturas Akasha" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Assinaturas Premium</h1>

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

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : data.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Nenhuma assinatura encontrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(a.created_at)}</TableCell>
                      <TableCell>{a.nome || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                      <TableCell>{planoBadge(a.plano)}</TableCell>
                      <TableCell>{formatBRL(Number(a.valor))}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminVendasAkasha;
