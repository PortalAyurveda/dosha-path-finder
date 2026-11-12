import { describe, it, expect } from "vitest";
import { juntarBusca } from "./redirecionamentos";
describe("juntarBusca", () => {
  it("leva a busca com ? quando o destino não tem", () => {
    expect(juntarBusca("/loja", "?sk=kit-anti-vata:1")).toBe("/loja?sk=kit-anti-vata:1");
  });
  it("junta com & quando o destino já tem ?", () => {
    expect(juntarBusca("/p?utm=x", "?sk=kit-anti-vata:1")).toBe("/p?utm=x&sk=kit-anti-vata:1");
  });
  it("sem busca mantém destino", () => {
    expect(juntarBusca("/p", "")).toBe("/p");
  });
});
