import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, MessageCircle, LineChart } from "lucide-react";
import { C, SERIF, SANS, LEAF, fmtDate } from "./theme";
import { useLatestDate } from "./useMetricasData";

interface MetricasShellProps {
  children: ReactNode;
  title: string;
  description: string;
  canonicalPath: string;
}

const TABS = [
  { to: "/metricas", label: "Métricas", icon: BarChart3, color: "#352F54" },
  { to: "/metricas/graficos", label: "Gráficos", icon: LineChart, color: "#0EA5E9" },
  { to: "/metricas/akasha", label: "Akasha", icon: MessageCircle, color: "#9b73ad" },
];

const MetricasShell = ({ children, title, description, canonicalPath }: MetricasShellProps) => {
  const { pathname } = useLocation();
  const { data: date } = useLatestDate();

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://www.portalayurveda.com${canonicalPath}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Hero */}
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <h1
            className="font-bold leading-tight"
            style={{ fontFamily: SERIF, color: C.primary, fontSize: "clamp(28px,5vw,42px)" }}
          >
            O que os dados revelam
          </h1>
          <p className="text-sm md:text-base" style={{ color: C.muted, fontFamily: SANS }}>
            Padrões reais cruzados com milhares de diagnósticos da nossa base. Cada número é uma regra clínica observada
            na prática.
          </p>
        </header>

        {/* Tabs (rotas reais) */}
        <div
          className="sticky top-0 z-[60] -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 backdrop-blur-sm border-b"
          style={{ background: `${C.bg}f2`, borderColor: C.border }}
        >
          <nav className="flex gap-3 max-w-2xl mx-auto">
            {TABS.map(({ to, label, icon: Icon, color }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 md:py-4 text-sm md:text-base font-semibold transition-all"
                  style={{
                    fontFamily: SANS,
                    borderRadius: LEAF,
                    background: active ? color : "transparent",
                    color: active ? "#fff" : C.primary,
                    border: `1.5px solid ${active ? color : C.border}`,
                    boxShadow: active ? `0 8px 24px -10px ${color}80` : "none",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo da rota */}
        {children}

        {/* Rodapé */}
        <footer className="text-center pt-4 border-t" style={{ borderColor: C.border }}>
          <p className="text-xs" style={{ color: C.muted, fontFamily: SANS }}>
            Dados atualizados em <strong style={{ color: C.primary }}>{fmtDate(date ?? null)}</strong>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MetricasShell;
