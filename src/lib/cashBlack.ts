import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CashBlackAgora = { ativa: boolean; fim?: string; inicio?: string; pix20?: boolean };

/** Estado da campanha, guardado por 5 minutos. Fora da campanha (ou erro), ativa = false. */
export function useCashBlack() {
  const q = useQuery({
    queryKey: ["cash_black_agora"],
    queryFn: async (): Promise<CashBlackAgora> => {
      const { data, error } = await supabase.rpc("cash_black_agora");
      if (error || !data) return { ativa: false };
      return data as unknown as CashBlackAgora;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const d = q.data;
  const fimMs = d?.fim ? new Date(d.fim).getTime() : NaN;
  const ativa = !!d?.ativa && (!Number.isFinite(fimMs) || fimMs > Date.now());
  return { ativa, fim: d?.fim ?? null, fimMs };
}

/** Relógio que anda a cada segundo enquanto `ligado`. */
export function useAgora(ligado = true) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (!ligado) return;
    const t = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [ligado]);
  return agora;
}

export function partesRestantes(fimMs: number, agora: number) {
  const s = Math.max(0, Math.floor((fimMs - agora) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, total: s };
}

/** Menos de 3 dias para o fim. */
export function faltamMenosDe3Dias(fimMs: number, agora: number) {
  return Number.isFinite(fimMs) && fimMs - agora < 3 * 86400 * 1000;
}

export const brl = (n: number) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const brlSemCentavos = (n: number) =>
  Math.round(Number(n || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Monta o endereço /cash-black?sk=slug:qtd,slug:qtd */
export function linkCashBlack(itens: { slug: string; quantidade: number }[]) {
  return `/cash-black?sk=${itens.map((i) => `${i.slug}:${i.quantidade}`).join(",")}`;
}

export type MeuCashback = {
  total: number;
  samkhya_e_portal: number;
  so_portal: number;
  movimentos: { tipo: string; valor: number; vale_em: string; descricao: string | null; pago_em: string | null }[];
};
