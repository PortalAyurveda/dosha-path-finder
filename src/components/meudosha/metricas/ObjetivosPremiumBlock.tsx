import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { ObjetivoTratamento } from "@/integrations/supabase/premium-client";

interface Props {
  objetivo: ObjetivoTratamento | null;
  isPremium: boolean;
}

const NARR_LABELS: Record<string, string> = {
  bloco_1_situacao: "Situação atual",
  bloco_2_causas: "Causas",
  bloco_3_sabores: "Sabores",
  bloco_4_proximos: "Próximos passos",
};

export default function ObjetivosPremiumBlock({ objetivo, isPremium }: Props) {
  if (!objetivo) return null;

  const objetivos = (objetivo.objetivos ?? []).filter(Boolean);
  const narr = objetivo.narrativa_clinica || {};

  return (
    <div className="relative rounded-2xl border bg-card p-5 md:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
        <h3
          className="font-bold text-lg"
          style={{ color: "hsl(var(--primary))", fontFamily: "'Roboto Serif', serif" }}
        >
          Seu plano clínico
        </h3>
      </div>

      <div className={!isPremium ? "blur-sm select-none pointer-events-none space-y-5" : "space-y-5"}>
        {objetivos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Objetivos
            </h4>
            <ul className="space-y-1.5">
              {objetivos.map((o, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span style={{ color: "hsl(var(--primary))" }}>•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Object.entries(NARR_LABELS).map(([key, label]) => {
          const text = (narr as any)[key];
          if (!text) return null;
          return (
            <div key={key} className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </h4>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          );
        })}
      </div>

      {!isPremium && (
        <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <p
            className="font-bold text-lg max-w-xs"
            style={{ color: "hsl(var(--primary))", fontFamily: "'Roboto Serif', serif" }}
          >
            Acesse seu plano completo
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Receba sua narrativa clínica personalizada e o caminho de tratamento.
          </p>
          <Link
            to="/samkhya"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            Conhecer o plano
          </Link>
        </div>
      )}
    </div>
  );
}
