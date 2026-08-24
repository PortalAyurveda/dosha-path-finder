import { useQuery } from "@tanstack/react-query";
import { lojaSupabase } from "@/integrations/supabase/loja-client";

export type FreteGratisConfig = {
  frete_gratis_ativo: boolean;
  frete_gratis_minimo: number;
  cupom_automatico: string | null;
  /** Percentual da campanha de vitrine, ou null se desligada/vencida. */
  desconto_vitrine_pct: number | null;
};

const DEFAULTS: FreteGratisConfig = {
  frete_gratis_ativo: true,
  frete_gratis_minimo: 350,
  cupom_automatico: null,
  desconto_vitrine_pct: null,
};

export const useFreteGratisConfig = () => {
  return useQuery<FreteGratisConfig>({
    queryKey: ["loja", "config_frete"],
    queryFn: async () => {
      const { data, error } = await lojaSupabase
        .from("config_frete" as never)
        .select("frete_gratis_ativo, frete_gratis_minimo, cupom_automatico, desconto_vitrine_pct, promo_frete_ate")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return DEFAULTS;
      const row = data as {
        frete_gratis_ativo: boolean;
        frete_gratis_minimo: number | string;
        cupom_automatico: string | null;
        desconto_vitrine_pct: number | string | null;
        promo_frete_ate: string | null;
      };
      const pct = Number(row.desconto_vitrine_pct) || 0;
      const fim = row.promo_frete_ate ? new Date(row.promo_frete_ate) : null;
      const vencida = fim ? fim.getTime() < Date.now() : false;
      return {
        frete_gratis_ativo: !!row.frete_gratis_ativo,
        frete_gratis_minimo: Number(row.frete_gratis_minimo) || DEFAULTS.frete_gratis_minimo,
        cupom_automatico: row.cupom_automatico || null,
        desconto_vitrine_pct: pct > 0 && !vencida ? pct : null,
      };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    placeholderData: DEFAULTS,
  });
};
