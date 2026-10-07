import { describe, expect, it } from "vitest";
import { misturarAbas, type AbaExtra } from "./base";

const fixas = ["aulas", "material", "rotina", "avaliacao", "trocas"].map((id, i) => ({ aba: { id }, pos: (i + 1) * 10 }));
const extra = (id: string, ordem: number): AbaExtra => ({ id, titulo: id, icone: null, ordem, ativa: true, total_atividades: 1 });
const ids = (r: ReturnType<typeof misturarAbas>) => r.map((x) => x.aba.id);

describe("posição das abas extras", () => {
  it("45 fica entre a 4ª e a 5ª fixa", () => {
    expect(ids(misturarAbas(fixas, [extra("x", 45)]))).toEqual(["aulas", "material", "rotina", "avaliacao", "x", "trocas"]);
  });
  it("60 fica no fim", () => {
    expect(ids(misturarAbas(fixas, [extra("x", 60)])).at(-1)).toBe("x");
  });
  it("mesmo valor de uma fixa entra depois dela", () => {
    expect(ids(misturarAbas(fixas, [extra("x", 20)])).slice(0, 3)).toEqual(["aulas", "material", "x"]);
  });
});
