import { describe, expect, it } from "vitest";
import { alternarFeito, feitoHoje, salaLiberada, semanaDoItem } from "./terapiaMeu";

const agora = new Date("2026-10-26T15:00:00Z");
describe("Do seu terapeuta", () => {
  it("mostra 7 pontinhos, o último é hoje", () => {
    const s = semanaDoItem([{ item: "a", dia: "2026-10-26" }, { item: "a", dia: "2026-10-20" }, { item: "b", dia: "2026-10-25" }], "a", agora);
    expect(s).toHaveLength(7);
    expect(s[6]).toEqual({ dia: "2026-10-26", feito: true });
    expect(s[0]).toEqual({ dia: "2026-10-20", feito: true });
    expect(s[5].feito).toBe(false);
  });
  it("marcar e desmarcar feito hoje", () => {
    const f = alternarFeito([], "a", true, agora);
    expect(feitoHoje(f, "a", agora)).toBe(true);
    expect(feitoHoje(alternarFeito(f, "a", false, agora), "a", agora)).toBe(false);
  });
  it("sala abre 10 minutos antes", () => {
    const p = { sala_abre_em: "2026-10-26T14:50:00Z" };
    expect(salaLiberada(p, Date.parse("2026-10-26T14:49:00Z"))).toBe(false);
    expect(salaLiberada(p, Date.parse("2026-10-26T14:50:00Z"))).toBe(true);
  });
});
