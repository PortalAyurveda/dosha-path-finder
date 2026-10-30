import { describe, it, expect } from "vitest";
import { adicionarDoCatalogo, calcular, montarDescricao, brl } from "./calculadoraCobranca";

const l = (nome: string, preco: number, qtd: number) => ({ chave: nome, nome, preco, qtd });

describe("calculadora de cobrança", () => {
  it("desconto em % incide sobre o subtotal", () => {
    expect(calcular([l("a", 100, 2)], 10, "pct", 15)).toEqual({ subtotal: 200, desconto: 20, frete: 15, total: 195 });
  });
  it("desconto em R$ nunca passa do subtotal", () => {
    expect(calcular([l("a", 50, 1)], 80, "brl", 10).total).toBe(10);
  });
  it("tocar em item já na conta soma 1", () => {
    const it = { tipo: "produto", grupo: "Produtos Samkhya", id: "1", nome: "Madhu Vata", preco: 40 };
    const r = adicionarDoCatalogo(adicionarDoCatalogo([], it), it);
    expect(r).toHaveLength(1);
    expect(r[0].qtd).toBe(2);
  });
  it("descrição com itens e desconto", () => {
    expect(montarDescricao([l("Madhu Vata", 1, 2), l("Curso de Alimentação", 1, 1)], 10, "pct"))
      .toBe("2x Madhu Vata + Curso de Alimentação — desconto 10%");
  });
  it("formato R$ 1.234,56", () => {
    expect(brl(1234.56).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  });
});
