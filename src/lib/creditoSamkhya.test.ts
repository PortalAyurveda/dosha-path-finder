import { describe, expect, it, vi } from "vitest";
import { prepararPedidoSamkhya, totaisCreditoSamkhya } from "./creditoSamkhya";

describe("frete com crédito Samkhya", () => {
  it("cobre todo o frete quando o crédito restante basta", () => {
    expect(totaisCreditoSamkhya(200, 100, 30)).toEqual({ freteCoberto: 30, totalAPagar: 0 });
  });
  it("cobra por Pix só a parte do frete que não cabe no crédito", () => {
    expect(totaisCreditoSamkhya(120, 100, 30)).toEqual({ freteCoberto: 20, totalAPagar: 10 });
  });
  it("não cobre frete quando os produtos consomem todo o crédito", () => {
    expect(totaisCreditoSamkhya(100, 100, 30)).toEqual({ freteCoberto: 0, totalAPagar: 30 });
  });
  it("nunca deixa o frete coberto negativo", () => {
    expect(totaisCreditoSamkhya(90, 100, 30)).toEqual({ freteCoberto: 0, totalAPagar: 30 });
  });
  it("mantém frete grátis sem cobrança", () => {
    expect(totaisCreditoSamkhya(200, 100, 0)).toEqual({ freteCoberto: 0, totalAPagar: 0 });
  });
  it("calcula valores de centavos", () => {
    const resultado = totaisCreditoSamkhya(120.5, 100.25, 30.75);
    expect(resultado).toEqual({ freteCoberto: 20.25, totalAPagar: 10.5 });
  });
  it("vai ao pedido sem gerar Pix quando o banco diz precisa_pagar falso", async () => {
    const gerarPix = vi.fn();
    const resposta = { pedido_id: "pedido-sem-pix", frete_coberto: 30, total_a_pagar: 0, precisa_pagar: false };
    expect(await prepararPedidoSamkhya(resposta, gerarPix)).toBe("/samkhya/pedido/pedido-sem-pix");
    expect(gerarPix).not.toHaveBeenCalled();
    expect(resposta).toEqual({ pedido_id: "pedido-sem-pix", frete_coberto: 30, total_a_pagar: 0, precisa_pagar: false });
  });
  it("gera Pix para o pedido retornado quando precisa_pagar é verdadeiro", async () => {
    const gerarPix = vi.fn().mockResolvedValue({});
    expect(await prepararPedidoSamkhya({ pedido_id: "pedido-com-pix", frete_coberto: 20, total_a_pagar: 10, precisa_pagar: true }, gerarPix)).toBe("/samkhya/pedido/pedido-com-pix");
    expect(gerarPix).toHaveBeenCalledExactlyOnceWith("pedido-com-pix");
  });
});