import { describe, expect, it } from "vitest";
import { cartoesAssinatura, linhaAssinatura, totalPlano } from "./creditoAssinatura";

const hoje = new Date(2026, 10, 16);
const m = { rotina: 3, mensal: 2, anual: 12 };
const br = (d: Date) => d.toLocaleDateString("pt-BR");

describe("assinatura com crédito", () => {
  it("totais", () => { expect(totalPlano("rotina", 3)).toBe(90); expect(totalPlano("mensal", 2)).toBe(159.8); expect(totalPlano("anual", 5)).toBe(597); });
  it("sem assinatura: tudo ligado, datas a partir de hoje", () => {
    const [r, p, a] = cartoesAssinatura(null, m, hoje);
    expect([r.ligado, p.ligado, a.ligado]).toEqual([true, true, true]);
    expect(br(r.data)).toBe("16/02/2027"); expect(br(a.data)).toBe("16/11/2027");
  });
  it("Premium: rotina desligada e datas somam após pago_ate", () => {
    const [r, p, a] = cartoesAssinatura({ plano: "anual", premium: true, via: "pix", pago_ate: "2027-01-10" }, m, hoje);
    expect(r.ligado).toBe(false); expect(r.aviso).toBe("O Premium já inclui a Minha Rotina.");
    expect(p.titulo).toBe("Somar mais meses ao seu Premium"); expect(br(p.data)).toBe("10/03/2027");
    expect(a.titulo).toBe("Somar 12 meses ao seu Premium");
  });
  it("Rotina no cartão: mensal desligado, anual sobe a partir de hoje", () => {
    const [r, p, a] = cartoesAssinatura({ plano: "rotina", premium: false, via: "cartao", pago_ate: "2026-12-01" }, m, hoje);
    expect(r.rotuloData).toBe("O cartão volta a cobrar em"); expect(br(r.data)).toBe("01/03/2027");
    expect(p.ligado).toBe(false); expect(a.ligado).toBe(true); expect(br(a.data)).toBe("16/11/2027");
  });
  it("Premium mensal no cartão: mensal ligado com pausa, rotina desligada", () => {
    const [r, p] = cartoesAssinatura({ plano: "mensal", premium: true, via: "cartao", pago_ate: "2026-12-01" }, m, hoje);
    expect(r.ligado).toBe(false); expect(p.ligado).toBe(true); expect(p.rotuloData).toBe("O cartão volta a cobrar em");
  });
  it("linha do topo", () => {
    expect(linhaAssinatura({ plano: "rotina", premium: false, via: "cartao", pago_ate: "2026-12-01" })).toBe("Sua assinatura hoje: Minha Rotina, no cartão, paga até 01/12/2026.");
    expect(linhaAssinatura({ plano: "anual", premium: true, via: "pix", pago_ate: "2027-01-10" })).toBe("Sua assinatura hoje: Premium Anual, liberado até 10/01/2027.");
  });
});
