import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import RetesteChat from "@/components/reteste/RetesteChat";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

interface DoshaTeste {
  id: string;
  idPublico: string;
  nome: string | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  doshaprincipal: string | null;
}

const PIE_COLORS: Record<string, string> = {
  Vata: "#4F75FF",
  Pitta: "#FF5C5C",
  Kapha: "#22C55E",
};

const getNivel = (score: number, dosha: "Vata" | "Pitta" | "Kapha"): string => {
  if (dosha === "Vata") {
    if (score >= 50) return "Fixado";
    if (score >= 36) return "Adoecido";
    if (score >= 25) return "Acúmulo";
    if (score >= 15) return "Normal";
    return "Pouco";
  }
  if (dosha === "Pitta") {
    if (score >= 50) return "Fixado";
    if (score >= 41) return "Adoecido";
    if (score >= 31) return "Acúmulo";
    if (score >= 15) return "Normal";
    return "Pouco";
  }
  if (score >= 60) return "Fixado";
  if (score >= 51) return "Adoecido";
  if (score >= 36) return "Acúmulo";
  if (score >= 15) return "Normal";
  return "Pouco";
};

const NIVEL_BADGE: Record<string, string> = {
  Fixado: "bg-red-100 text-red-700 border-red-300",
  Adoecido: "bg-orange-100 text-orange-700 border-orange-300",
  Acúmulo: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Normal: "bg-green-100 text-green-700 border-green-300",
  Pouco: "bg-slate-100 text-slate-600 border-slate-300",
};

const Revisao = () => {
  const { user, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [teste, setTeste] = useState<DoshaTeste | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const email = user.email!;

      const { data: testeData } = await supabase
        .from("doshas_registros")
        .select('id, "idPublico", nome, vatascore, pittascore, kaphascore, "agniPrincipal", doshaprincipal')
        .eq("email", email)
        .eq("tipo", "teste")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (!testeData) {
        setLoading(false);
        return;
      }
      setTeste(testeData as DoshaTeste);

      const { data: existingSessao } = await supabase
        .from("reteste_sessao" as any)
        .select("id")
        .eq("user_email", email)
        .eq("status", "em_andamento")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let activeSessaoId: string | null = (existingSessao as any)?.id ?? null;

      if (!activeSessaoId) {
        const { data: novaSessao, error: insertErr } = await supabase
          .from("reteste_sessao" as any)
          .insert({
            user_email: email,
            status: "em_andamento",
            dosha_registro_origem_id: (testeData as any).id,
          } as any)
          .select("id")
          .single();
        if (insertErr) {
          console.error("Erro criando reteste_sessao", insertErr);
        }
        activeSessaoId = (novaSessao as any)?.id ?? null;
      } else {
        const { data: history } = await supabase
          .from("reteste_chat_history" as any)
          .select("role, content, created_at")
          .eq("sessao_id", activeSessaoId)
          .order("created_at", { ascending: true });
        if (history && Array.isArray(history)) {
          setInitialMessages(
            (history as any[])
              .filter((r) => r.role === "user" || r.role === "assistant")
              .map((r) => ({ role: r.role, content: r.content })),
          );
        }
      }

      if (cancelled) return;
      setSessaoId(activeSessaoId);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.email]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-akasha" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar?redirect=/revisao" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-akasha" />
      </div>
    );
  }

  if (!teste) {
    return (
      <PageContainer title="Revisão · Akasha" description="Revisão do seu diagnóstico Ayurveda">
        <div className="max-w-2xl mx-auto py-10 text-center">
          <p className="text-sm text-muted-foreground">Você ainda não tem um teste de dosha para revisar.</p>
        </div>
      </PageContainer>
    );
  }

  const v = teste.vatascore ?? 0;
  const p = teste.pittascore ?? 0;
  const k = teste.kaphascore ?? 0;
  const pieData = [
    { name: "Vata", value: v },
    { name: "Pitta", value: p },
    { name: "Kapha", value: k },
  ].filter((d) => d.value > 0);

  return (
    <>
      <Helmet>
        <title>Revisão · Akasha</title>
      </Helmet>
      <PageContainer title="Revisão · Akasha" description="Revisão do seu diagnóstico Ayurveda">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Resumo compacto */}
          <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <div className="w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={18}
                    outerRadius={36}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={PIE_COLORS[d.name]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Seu diagnóstico</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {([
                  ["Vata", v],
                  ["Pitta", p],
                  ["Kapha", k],
                ] as [ "Vata" | "Pitta" | "Kapha", number ][]).map(([name, score]) => {
                  const nivel = getNivel(score, name);
                  return (
                    <span
                      key={name}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${NIVEL_BADGE[nivel]}`}
                    >
                      {name} {score} · {nivel}
                    </span>
                  );
                })}
              </div>
              {teste.agniPrincipal && (
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  Agni: <span className="text-foreground font-medium">{teste.agniPrincipal}</span>
                </p>
              )}
            </div>
          </div>

          {/* Chat */}
          {sessaoId && (
            <RetesteChat
              email={user.email!}
              nome={teste.nome || "Visitante"}
              sessaoId={sessaoId}
              idPublico={teste.idPublico}
              initialMessages={initialMessages}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default Revisao;
