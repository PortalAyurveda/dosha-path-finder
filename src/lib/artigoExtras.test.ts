import { describe, it, expect } from "vitest";
import { cursoDoArtigo, dataBRArtigo } from "./artigoExtras";

describe("cursoDoArtigo", () => {
  it("usa as tags sem acento e sem emoji", () => {
    expect(cursoDoArtigo("⚗️Dravyaguna & Herbologia", "Qualquer").rota).toBe("/curso/dravya-guna");
    expect(cursoDoArtigo("🔍Diagnóstico", "x").rota).toBe("/curso/diagnostico");
  });
  it("tags vêm antes do título", () => {
    expect(cursoDoArtigo("sono", "Receita de kitchari").rota).toBe("/curso/rotinas");
  });
  it("cai no título quando as tags não decidem", () => {
    expect(cursoDoArtigo("doshas", "O que a língua revela").rota).toBe("/curso/diagnostico");
  });
  it("o resto vai para Alimentação", () => {
    expect(cursoDoArtigo(null, "Vata e o outono").rota).toBe("/curso/alimentacao");
  });
});

it("data em dd/mm/aaaa", () => {
  expect(dataBRArtigo("2026-03-05T12:00:00Z")).toBe("05/03/2026");
});
