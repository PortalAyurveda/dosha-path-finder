import { useQuery } from "@tanstack/react-query";
import { lojaSupabase } from "@/integrations/supabase/loja-client";

export type FreteGratisConfig = {
  frete_gratis_ativo: boolean;
  frete_gratis_minimo: number;
  cupom_automatico: string | null;
};

const DEFAULTS: FreteGratisConfig = {
  frete_gratis_ativo: true,
  frete_gratis_minimo: 350,
  cupom_automatico: null,
};

export const useFreteGratisConfig = () => {
  return useQuery<FreteGratisConfig>({
    queryKey: ["loja", "config_frete"],
    queryFn: async () => {
      const { data, error } = await lojaSupabase
        .from("config_frete" as never)
        .select("frete_gratis_ativo, frete_gratis_minimo, cupom_automatico")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return DEFAULTS;
      const row = data as {
        frete_gratis_ativo: boolean;
        frete_gratis_minimo: number | string;
        cupom_automatico: string | null;
      };
      return {
        frete_gratis_ativo: !!row.frete_gratis_ativo,
        frete_gratis_minimo: Number(row.frete_gratis_minimo) || DEFAULTS.frete_gratis_minimo,
        cupom_automatico: row.cupom_automatico || null,
      };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    placeholderData: DEFAULTS,
  });
};
