import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type TendenciaRow = {
  dia: string;
  envios: number | null;
  aberturas: number | null;
  cliques: number | null;
};

type LinkRow = { url: string | null; cliques: number | null };

type EdicaoRow = {
  edicao: string | null;
  envios: number | null;
  primeiro_envio: string | null;
  aberturas: number | null;
  cliques: number | null;
  bounces: number | null;
  descadastros: number | null;
  taxa_abertura: number | null;
  taxa_clique: number | null;
};

const fmtPct = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `${Number(v).toFixed(1).replace(".", ",")}%`;

const fmtDia = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString(
      "pt-BR",
      { day: "2-digit", month: "2-digit" },
    );
  } catch {
    return String(iso);
  }
};

const truncaMeio = (url: string, max = 52) => {
  if (url.length <= max) return url;
  const inicio = url.slice(0, Math.ceil(max / 2) - 1);
  const fim = url.slice(-(Math.floor(max / 2) - 2));
  return `${inicio}…${fim}`;
};

const Bloco = ({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-card p-5 space-y-4">
    <h3 className="font-heading font-bold text-foreground">{titulo}</h3>
    {children}
  </section>
);

const Tendencia = ({ id }: { id: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-agenda-tendencia", id],
    queryFn: async (): Promise<TendenciaRow[]> => {
      const { data, error } = await (supabase as any).rpc(
        "admin_agenda_tendencia",
        { p_comunicacao_id: id, p_dias: 30 },
      );
      if (error) throw error;
      return (data ?? []) as TendenciaRow[];
    },
  });

  const linhas = (data ?? []).map((r) => ({
    dia: fmtDia(r.dia),
    envios: Number(r.envios ?? 0),
    aberturas: Number(r.aberturas ?? 0),
    cliques: Number(r.cliques ?? 0),
  }));
  const vazio =
    linhas.length === 0 ||
    linhas.every((l) => l.envios === 0 && l.aberturas === 0 && l.cliques === 0);

  return (
    <Bloco titulo="Tendência (últimos 30 dias)">
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : vazio ? (
        <p className="text-sm text-muted-foreground">
          sem envio nos últimos 30 dias
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={linhas} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="envios"
                name="Envios"
                stroke="#352F54"
                fill="#352F54"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="aberturas"
                name="Aberturas"
                stroke="#6B7FF2"
                fill="#6B7FF2"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="cliques"
                name="Cliques"
                stroke="#C75100"
                fill="#C75100"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Bloco>
  );
};

const CliquesPorLink = ({ id }: { id: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-agenda-cliques-link", id],
    queryFn: async (): Promise<LinkRow[]> => {
      const { data, error } = await (supabase as any).rpc(
        "admin_agenda_cliques_por_link",
        { p_comunicacao_id: id, p_dias: 30 },
      );
      if (error) throw error;
      return (data ?? []) as LinkRow[];
    },
  });

  return (
    <Bloco titulo="Cliques por link (últimos 30 dias)">
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          nenhum clique registrado nos últimos 30 dias
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {(data ?? []).map((r, i) => (
            <li key={`${r.url}-${i}`} className="flex items-center gap-3 py-2">
              <span className="w-12 shrink-0 text-sm font-semibold text-foreground tabular-nums">
                {Number(r.cliques ?? 0)}
              </span>
              <a
                href={r.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                title={r.url ?? ""}
                className="text-sm text-muted-foreground hover:text-foreground truncate"
              >
                {truncaMeio(r.url ?? "—")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Bloco>
  );
};

const Edicoes = ({ id }: { id: string }) => {
  const { data } = useQuery({
    queryKey: ["admin-agenda-edicoes", id],
    queryFn: async (): Promise<EdicaoRow[]> => {
      const { data, error } = await (supabase as any).rpc(
        "admin_agenda_edicoes",
        { p_comunicacao_id: id },
      );
      if (error) throw error;
      return (data ?? []) as EdicaoRow[];
    },
  });

  if (!data || data.length <= 1) return null;

  return (
    <Bloco titulo="Comparação entre edições">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Edição</th>
              <th className="py-2 pr-3 font-medium">1º envio</th>
              <th className="py-2 pr-3 font-medium">Envios</th>
              <th className="py-2 pr-3 font-medium">Abertura</th>
              <th className="py-2 pr-3 font-medium">Clique</th>
              <th className="py-2 pr-3 font-medium">Bounces</th>
              <th className="py-2 font-medium">Descad.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((e, i) => (
              <tr key={`${e.edicao}-${i}`}>
                <td className="py-2 pr-3 font-medium text-foreground">
                  {e.edicao ?? "—"}
                </td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {fmtDia(e.primeiro_envio)}
                </td>
                <td className="py-2 pr-3 tabular-nums">{Number(e.envios ?? 0)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmtPct(e.taxa_abertura)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmtPct(e.taxa_clique)}</td>
                <td className="py-2 pr-3 tabular-nums">{Number(e.bounces ?? 0)}</td>
                <td className="py-2 tabular-nums">{Number(e.descadastros ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Bloco>
  );
};

const DetalheAnalytics = ({ id }: { id: string }) => (
  <>
    <Tendencia id={id} />
    <CliquesPorLink id={id} />
    <Edicoes id={id} />
  </>
);

export default DetalheAnalytics;
