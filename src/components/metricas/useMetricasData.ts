import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Snapshot = {
  metrica_id: string;
  familia: string;
  categoria: string;
  descricao: string;
  percentual: number | null;
  n_base: number | null;
  data_calculo: string;
};

export const useLatestDate = () =>
  useQuery({
    queryKey: ["metricas-latest-date"],
    queryFn: async () => {
      const { data } = await supabase
        .from("metricas_snapshot")
        .select("data_calculo")
        .order("data_calculo", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.data_calculo ?? null) as string | null;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useSnapshot = (date: string | null, ids: string[] | "akasha") =>
  useQuery({
    queryKey: ["metricas-snapshot", date, ids],
    enabled: !!date,
    queryFn: async () => {
      let q = supabase
        .from("metricas_snapshot")
        .select(
          "metrica_id, familia, categoria, descricao, percentual, n_base, data_calculo",
        )
        .eq("data_calculo", date!);
      if (ids === "akasha") q = q.in("familia", ["Akasha", "Temporal"]);
      else q = q.in("metrica_id", ids);
      const { data } = await q;
      return (data ?? []) as Snapshot[];
    },
    staleTime: 30 * 60 * 1000,
  });

export type GraficoRow = {
  grafico_id: string;
  titulo: string;
  subtitulo: string | null;
  tipo_grafico: "line" | "bar" | string;
  grupo: string | null;
  ordem: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dados: any;
};

export const useGraficos = () =>
  useQuery({
    queryKey: ["portal-graficos", "v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_graficos")
        .select("grafico_id, titulo, subtitulo, tipo_grafico, grupo, ordem, dados, atualizado_em")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as GraficoRow[];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

export type AkashaDia = { dia: string; msgs: number; usuarios: number };
export type AkashaHora = { hora: number; msgs: number; percentual: number };

export const useAkashaEvolucaoDiaria = () =>
  useQuery({
    queryKey: ["akasha-evolucao-diaria-full"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("akasha_evolucao_diaria");
      if (error) throw error;
      return ((data ?? []) as Array<{ dia: string; msgs: number; usuarios: number }>).map((r) => ({
        dia: r.dia,
        msgs: Number(r.msgs),
        usuarios: Number(r.usuarios),
      })) as AkashaDia[];
    },
    staleTime: 15 * 60 * 1000,
  });

export const useAkashaDistribuicaoHoras = () =>
  useQuery({
    queryKey: ["akasha-distribuicao-horas-full"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("akasha_distribuicao_horas");
      if (error) throw error;
      return ((data ?? []) as Array<{ hora: number; msgs: number; percentual: number }>).map((r) => ({
        hora: Number(r.hora),
        msgs: Number(r.msgs),
        percentual: Number(r.percentual),
      })) as AkashaHora[];
    },
    staleTime: 15 * 60 * 1000,
  });
