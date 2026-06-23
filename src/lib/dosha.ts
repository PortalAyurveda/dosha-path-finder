const PRIORIDADE: Record<string, number> = { Vata: 0, Pitta: 1, Kapha: 2 };

export function normalizarDosha(nome: string | null | undefined): string | null {
  if (!nome) return null;

  const partes = nome.split("-").map((s) => s.trim());

  const doshas = partes
    .filter((p) => p in PRIORIDADE)
    .sort((a, b) => PRIORIDADE[a] - PRIORIDADE[b]);

  const resto = partes.filter((p) => !(p in PRIORIDADE)); // preserva "Deficit"

  return [...doshas, ...resto].join("-");
}
