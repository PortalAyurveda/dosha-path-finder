/** Número da noite da Jornada da Primavera no fuso de Brasília: 1 até 22/09, 2 em 23/09, 3 de 24/09 em diante. */
export function noiteDaJornada(agora: Date = new Date()): 1 | 2 | 3 {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
  if (dia <= "2026-09-22") return 1;
  if (dia === "2026-09-23") return 2;
  return 3;
}
