import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightAyurvedico {
  tipo: 'alerta' | 'sucesso';
  titulo: string;
  porcentagem: number;
  mensagem: string;
}

const CircularProgress = ({ value, color }: { value: number; color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
      <circle
        cx="44" cy="44" r={radius} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        className="transition-all duration-700"
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold fill-foreground">
        {value.toFixed(1)}%
      </text>
    </svg>
  );
};

const InsightCard = ({ insight }: { insight: InsightAyurvedico }) => {
  const isAlerta = insight.tipo === 'alerta';
  const color = isAlerta ? '#F97316' : '#22C55E';
  const borderClass = isAlerta ? 'border-orange-400/50' : 'border-emerald-400/50';
  const bgClass = isAlerta ? 'bg-orange-500/5' : 'bg-emerald-500/5';
  const Icon = isAlerta ? AlertTriangle : ShieldCheck;

  return (
    <div className={`rounded-xl border-2 ${borderClass} ${bgClass} p-5 space-y-3`}>
      <div className="flex items-center gap-4">
        <CircularProgress value={insight.porcentagem} color={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 shrink-0" style={{ color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
              {isAlerta ? 'Alerta' : 'Positivo'}
            </span>
          </div>
          <h3 className="font-serif font-bold text-foreground text-sm leading-snug">
            {insight.titulo}
          </h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {insight.mensagem}
      </p>
    </div>
  );
};

interface MetricasTabProps {
  registroUuid: string | null;
  insights: InsightAyurvedico[] | undefined;
  isLoading: boolean;
}

const MetricasTab = ({ insights, isLoading }: MetricasTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            O algoritmo está cruzando seus dados com nossa base de pacientes...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-foreground font-serif font-bold">Nenhum cruzamento extremo encontrado</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Seu perfil não ativou nenhuma das regras preditivas. Isso pode significar um equilíbrio moderado ou dados insuficientes para análise avançada.
        </p>
      </div>
    );
  }

  const alertas = insights.filter(i => i.tipo === 'alerta');
  const sucessos = insights.filter(i => i.tipo === 'sucesso');

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h2 className="font-serif font-bold text-foreground text-xl">Métricas Preditivas</h2>
        <p className="text-sm text-muted-foreground">
          Cruzamentos automáticos entre seus scores, sintomas e alimentação
        </p>
      </div>

      {alertas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Alertas ({alertas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertas.map((insight, i) => <InsightCard key={i} insight={insight} />)}
          </div>
        </div>
      )}

      {sucessos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Pontos Positivos ({sucessos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sucessos.map((insight, i) => <InsightCard key={i} insight={insight} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricasTab;
export type { InsightAyurvedico };
