import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

const RetesteCard = () => {
  const { user } = useUser();
  const email = user?.email || null;

  const { data } = useQuery({
    queryKey: ["reteste-card", email],
    enabled: !!email,
    staleTime: 60_000,
    queryFn: async () => {
      const [testeRes, concluidoRes, andamentoRes] = await Promise.all([
        supabase
          .from("doshas_registros")
          .select("created_at")
          .eq("email", email)
          .eq("tipo", "teste")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("reteste_sessao" as any)
          .select("id")
          .eq("user_email", email)
          .eq("status", "concluido")
          .gte("updated_at", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
          .limit(1)
          .maybeSingle(),
        supabase
          .from("reteste_sessao" as any)
          .select("id")
          .eq("user_email", email)
          .eq("status", "em_andamento")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        teste: testeRes.data as { created_at: string } | null,
        concluidoRecente: !!concluidoRes.data,
        emAndamento: !!andamentoRes.data,
      };
    },
  });

  if (!email || !data) return null;

  const { teste, concluidoRecente, emAndamento } = data;

  if (emAndamento) {
    return (
      <Link
        to="/revisao"
        className="group block rounded-2xl border border-akasha/30 bg-akasha/5 p-4 hover:bg-akasha/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-akasha/20 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-akasha" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-sm text-foreground">Continuar revisão</h3>
            <p className="text-xs text-muted-foreground">Você tem uma revisão em andamento.</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-akasha group-hover:translate-x-0.5 transition-transform">
            Continuar →
          </span>
        </div>
      </Link>
    );
  }

  if (!teste?.created_at) return null;
  const created = new Date(teste.created_at).getTime();
  const trintaDiasAtras = Date.now() - 30 * 24 * 3600 * 1000;
  if (created > trintaDiasAtras) return null;
  if (concluidoRecente) return null;

  return (
    <Link
      to="/revisao"
      className="group block rounded-2xl border border-akasha/30 bg-akasha/5 p-4 hover:bg-akasha/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-akasha/20 flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 text-akasha" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-sm text-foreground">30 dias · revisão disponível</h3>
          <p className="text-xs text-muted-foreground">Faz 30 dias desde seu diagnóstico. Hora de ver o que mudou.</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-akasha group-hover:translate-x-0.5 transition-transform">
          Iniciar revisão →
        </span>
      </div>
    </Link>
  );
};

export default RetesteCard;
