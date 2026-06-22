export type Semaforo = "verde" | "amarelo" | "vermelho" | "cinza";

/**
 * Regra única do semáforo de estoque:
 *   meses = estoque / estimativaMensal
 *   verde   ≥ 2
 *   amarelo ≥ 1 e < 2
 *   vermelho < 1
 *   cinza   = sem estimativa
 */
export function mesesEstoqueSemaforo(
  estoque: number | null | undefined,
  estimativaMensal: number | null | undefined,
): Semaforo {
  const est = Number(estimativaMensal ?? 0);
  if (!est || est <= 0) return "cinza";
  const e = Number(estoque ?? 0);
  const meses = e / est;
  if (meses >= 2) return "verde";
  if (meses >= 1) return "amarelo";
  return "vermelho";
}

export function mesesEstoque(
  estoque: number | null | undefined,
  estimativaMensal: number | null | undefined,
): number | null {
  const est = Number(estimativaMensal ?? 0);
  if (!est || est <= 0) return null;
  return Number(estoque ?? 0) / est;
}

export const SEMAFORO_ORDEM: Record<Semaforo, number> = {
  vermelho: 0,
  amarelo: 1,
  verde: 2,
  cinza: 3,
};

export const SEMAFORO_BG: Record<Semaforo, string> = {
  verde: "bg-green-500",
  amarelo: "bg-yellow-500",
  vermelho: "bg-red-500",
  cinza: "bg-gray-300",
};

export const SEMAFORO_BG_LIGHT: Record<Semaforo, string> = {
  verde: "bg-green-50",
  amarelo: "bg-yellow-50",
  vermelho: "bg-red-50",
  cinza: "bg-gray-50",
};

export function SemaforoDot({ s }: { s: Semaforo }) {
  return <span className={`inline-block size-2.5 rounded-full ${SEMAFORO_BG[s]}`} />;
}
