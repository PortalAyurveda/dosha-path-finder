import { AlertOctagon, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightAyurvedico {
  tipo: 'vermelho' | 'laranja' | 'amarelo';
  titulo: string;
  porcentagem: number;
  mensagem: string;
}

const TIPO_CONFIG = {
  vermelho: { color: '#DC2626', border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800', label: 'Crítico', Icon: AlertOctagon },
  laranja: { color: '#EA580C', border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-800', label: 'Alerta', Icon: AlertTriangle },
  amarelo: { color: '#CA8A04', border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-800', label: 'Atenção', Icon: Info },
} as const;

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
  const config = TIPO_CONFIG[insight.tipo] || TIPO_CONFIG.laranja;
  const { color, border, bg, text, label, Icon } = config;

  return (
    <div className={`rounded-xl border-2 ${border} ${bg} p-5 space-y-3`}>
      <div className="flex items-center gap-4">
        <CircularProgress value={insight.porcentagem} color={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 shrink-0 ${text}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${text}`}>
              {label}
            </span>
          </div>
          <h3 className={`font-serif font-bold ${text} text-sm leading-snug`}>
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
        <p className="text-foreground font-serif font-bold text-lg">Perfil em Equilíbrio</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Sua análise estatística não apresenta desequilíbrios críticos ou acúmulos expressivos neste momento. Continue mantendo seus hábitos saudáveis!
        </p>
      </div>
    );
  }

  const vermelhos = insights.filter(i => i.tipo === 'vermelho');
  const laranjas = insights.filter(i => i.tipo === 'laranja');
  const amarelos = insights.filter(i => i.tipo === 'amarelo');

  const sections = [
    { items: vermelhos, label: 'Críticos', Icon: AlertOctagon, textClass: 'text-red-600' },
    { items: laranjas, label: 'Alertas', Icon: AlertTriangle, textClass: 'text-orange-600' },
    { items: amarelos, label: 'Atenção', Icon: Info, textClass: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h2 className="font-serif font-bold text-foreground text-xl">Métricas Preditivas</h2>
        <p className="text-sm text-muted-foreground">
          Cruzamentos automáticos entre seus scores, sintomas e alimentação
        </p>
      </div>

      {sections.map(({ items, label, Icon, textClass }) =>
        items.length > 0 ? (
          <div key={label} className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textClass} flex items-center gap-1.5`}>
              <Icon className="w-3.5 h-3.5" /> {label} ({items.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((insight, i) => <InsightCard key={i} insight={insight} />)}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default MetricasTab;
export type { InsightAyurvedico };
