import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface AssinaturaRow {
  plano: string | null;
  valor: number | null;
  status: string | null;
  created_at: string | null;
  stripe_subscription_id: string | null;
}

interface PedidoRow {
  total: number | null;
  frete_valor: number | null;
  status: string | null;
  created_at: string | null;
}

type PeriodoKey = "1" | "7" | "30" | "365";

const PERIODOS: { key: PeriodoKey; label: string; dias: number }[] = [
  { key: "1", label: "1 dia", dias: 1 },
  { key: "7", label: "7 dias", dias: 7 },
  { key: "30", label: "30 dias", dias: 30 },
  { key: "365", label: "365 dias", dias: 365 },
];

const isStripeReal = (id: string | null | undefined) =>
  !!id && id.trim() !== "" && id !== "manual";

const AdminFinanceiro = () => {
  const [assinaturas, setAssinaturas] = useState<AssinaturaRow[]>([]);
  const [pedidos, setPedidos] = useState<PedidoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [periodo, setPeriodo] = useState<PeriodoKey>("30");
  const [fontes, setFontes] = useState({
    premium: true,
    rotinas: true,
    samkhya: true,
    escola: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [aRes, pRes] = await Promise.all([
      (supabase as any)
        .from("assinaturas")
        .select("plano, valor, status, created_at, stripe_subscription_id")
        .limit(10000),
      lojaSupabase
        .from("pedidos")
        .select("total, frete_valor, status, created_at")
        .limit(10000),
    ]);
    if (aRes.data) setAssinaturas(aRes.data as AssinaturaRow[]);
    if (pRes.data) setPedidos(pRes.data as PedidoRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Bloco 1 — Assinantes ativos
  const ativos = useMemo(() => {
    const act = assinaturas.filter((a) => a.status === "active");
    const premiumAnual = act.filter((a) => a.plano === "anual").length;
    const premiumMensal = act.filter((a) => a.plano === "mensal").length;
    const rotinas = act.filter((a) => a.plano === "rotina").length;
    return {
      premiumAnual,
      premiumMensal,
      rotinas,
      total: premiumAnual + premiumMensal + rotinas,
    };
  }, [assinaturas]);

  // Bloco 2/3 — Financeiro por período
  const periodoDias = PERIODOS.find((p) => p.key === periodo)!.dias;
  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - periodoDias);
    return d;
  }, [periodoDias]);

  const receitas = useMemo(() => {
    const inPeriod = (s: string | null) => s && new Date(s) >= since;

    const premium = assinaturas
      .filter(
        (a) =>
          (a.plano === "anual" || a.plano === "mensal") &&
          isStripeReal(a.stripe_subscription_id) &&
          inPeriod(a.created_at),
      )
      .reduce((sum, a) => sum + (Number(a.valor) || 0), 0);

    const rotinas = assinaturas
      .filter(
        (a) =>
          a.plano === "rotina" &&
          isStripeReal(a.stripe_subscription_id) &&
          inPeriod(a.created_at),
      )
      .reduce((sum, a) => sum + (Number(a.valor) || 0), 0);

    const samkhya = pedidos
      .filter((p) => p.status !== "cancelado" && inPeriod(p.created_at))
      .reduce(
        (sum, p) =>
          sum + ((Number(p.total) || 0) - (Number(p.frete_valor) || 0)),
        0,
      );

    const escola = 0;

    return { premium, rotinas, samkhya, escola };
  }, [assinaturas, pedidos, since]);

  const toggleFonte = (key: keyof typeof fontes) =>
    setFontes((f) => ({ ...f, [key]: !f[key] }));

  const total =
    (fontes.premium ? receitas.premium : 0) +
    (fontes.rotinas ? receitas.rotinas : 0) +
    (fontes.samkhya ? receitas.samkhya : 0) +
    (fontes.escola ? receitas.escola : 0);

  const breakdown: { label: string; value: number }[] = [];
  if (fontes.premium) breakdown.push({ label: "Premium", value: receitas.premium });
  if (fontes.rotinas) breakdown.push({ label: "Rotinas", value: receitas.rotinas });
  if (fontes.samkhya) breakdown.push({ label: "Samkhya", value: receitas.samkhya });
  if (fontes.escola) breakdown.push({ label: "Escola", value: receitas.escola });

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Financeiro — Admin" description="Painel financeiro" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Painel Financeiro</h1>

        {/* Bloco 1 — Assinantes ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assinantes ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Total" value={ativos.total} highlight />
                <Stat label="Premium anual" value={ativos.premiumAnual} />
                <Stat label="Premium mensal" value={ativos.premiumMensal} />
                <Stat label="Rotinas" value={ativos.rotinas} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloco 2 — Financeiro por período */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Vendas novas no período
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Não inclui renovações de mensalidades já existentes. Cortesias
                    (sem stripe_subscription_id real) também ficam de fora.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seletor de período */}
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((p) => (
                <Button
                  key={p.key}
                  size="sm"
                  variant={periodo === p.key ? "default" : "outline"}
                  onClick={() => setPeriodo(p.key)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Checkboxes de fontes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FonteCheck
                label="Premium"
                value={receitas.premium}
                checked={fontes.premium}
                onChange={() => toggleFonte("premium")}
              />
              <FonteCheck
                label="Rotinas"
                value={receitas.rotinas}
                checked={fontes.rotinas}
                onChange={() => toggleFonte("rotinas")}
              />
              <FonteCheck
                label="Samkhya"
                value={receitas.samkhya}
                checked={fontes.samkhya}
                onChange={() => toggleFonte("samkhya")}
              />
              <FonteCheck
                label="Escola"
                value={receitas.escola}
                checked={fontes.escola}
                onChange={() => toggleFonte("escola")}
                hint="em breve"
              />
            </div>

            {/* Bloco 3 — Total */}
            <div className="rounded-lg border bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Vendas novas no período ({PERIODOS.find((p) => p.key === periodo)!.label})
              </p>
              {loading ? (
                <Skeleton className="h-12 w-48 mt-2" />
              ) : (
                <>
                  <p className="text-4xl font-bold text-foreground mt-1">{formatBRL(total)}</p>
                  {breakdown.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {breakdown
                        .map((b) => `${b.label} ${formatBRL(b.value)}`)
                        .join(" + ")}
                    </p>
                  )}
                  {breakdown.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Nenhuma fonte selecionada.
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div className="rounded-md border bg-card p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={`mt-1 font-bold text-foreground ${
        highlight ? "text-3xl" : "text-2xl"
      }`}
    >
      {value}
    </p>
  </div>
);

const FonteCheck = ({
  label,
  value,
  checked,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  checked: boolean;
  onChange: () => void;
  hint?: string;
}) => (
  <label
    className={`flex items-start gap-2 rounded-md border p-3 cursor-pointer transition-colors ${
      checked ? "border-primary bg-primary/5" : "bg-card"
    }`}
  >
    <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{formatBRL(value)}</p>
      {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
    </div>
  </label>
);

export default AdminFinanceiro;
