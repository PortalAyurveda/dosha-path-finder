import { describe, expect, it } from "vitest";
import { diasDeCuidado } from "./terapiaMeu";
import { contagemItem, linhaFolha, pctItem, subItem, vaziosAntes } from "./terapiaConstancia";
import { dataCuidados, dowISO, marcado, partesCuidado, refCuidado, tresDiasAtras } from "./rotinaCuidados";

describe("Parte 28 · singular", () => {
  it("1 dia de cuidado", () => expect(diasDeCuidado(1)).toBe("1 dia de cuidado"));
  it("18 dias de cuidado", () => expect(diasDeCuidado(18)).toBe("18 dias de cuidado"));
});

describe("Parte 29 · constância", () => {
  it("linha da folha", () => expect(linhaFolha({ id: "f", enviada_em: "2026-10-24T15:00:00Z", desde: "2026-10-24", dias_desde: 5 })).toBe("folha de 24/10 · desde então, 5 dias"));
  it("momento e dias", () => {
    expect(subItem({ item_id: "a", titulo: "x", secao: "manha" })).toBe("Manhã · todo dia");
    expect(subItem({ item_id: "a", titulo: "x", secao: "todo_dia", dias: [3, 5, 7] })).toBe("Ao longo do dia · qua, sex e dom");
    expect(subItem({ item_id: "a", titulo: "x", secao: "ler" })).toBe("Para ler e assistir");
  });
  it("contagem e barra", () => {
    const i = { item_id: "a", titulo: "x", secao: "manha", esperados: 4, feitos: 3 };
    expect(contagemItem(i)).toBe("3 de 4 dias");
    expect(contagemItem(i, true)).toBe("3 de 4");
    expect(contagemItem({ ...i, esperados: 1, feitos: 0 })).toBe("0 de 1 dia");
    expect(pctItem(i)).toBe(75);
  });
  it("mapa começa alinhado ao dia da semana", () => expect(vaziosAntes({ mapa: [{ dia: "2026-09-28", dow: 1, cuidou: false }] } as never)).toBe(0));
});

describe("Parte 30 · cuidados", () => {
  it("texto com travessão vira título e linha", () => expect(partesCuidado("Dormir antes das 22h — Vata piora muito com vigília noturna")).toEqual({ titulo: "Dormir antes das 22h", sub: "Vata piora muito com vigília noturna" }));
  it("sem travessão usa o período", () => expect(partesCuidado("Tomar água morna", "manhã")).toEqual({ titulo: "Tomar água morna", sub: "manhã" }));
  it("referência por dia da semana", () => { expect(dowISO("2026-10-27")).toBe(2); expect(refCuidado(2, "rotina_manha")).toBe("dia2:rotina_manha"); });
  it("marcado só no dia e tipo certos", () => {
    const p = [{ data: "2026-10-26", tipo: "evitei", referencia: "dia1:Água gelada" }];
    expect(marcado(p, "2026-10-26", "evitei", "dia1:Água gelada")).toBe(true);
    expect(marcado(p, "2026-10-27", "evitei", "dia1:Água gelada")).toBe(false);
  });
  it("até 3 dias atrás", () => expect(tresDiasAtras("2026-11-02")).toBe("2026-10-30"));
  it("data do cabeçalho", () => expect(dataCuidados("2026-10-27")).toBe("terça, 27 de outubro"));
});
