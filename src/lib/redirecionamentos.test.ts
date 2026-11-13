import { afterEach, describe, expect, it, vi } from "vitest";
import { extrairPrevia, previaDoDestino, LIMITE_PREVIA_MS } from "../../scripts/seo/redirecionamentos";
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

const base = "https://portalayurveda.com";
const padrao = {
  title: "Portal Ayurveda", description: "Descrição da home", ogTitle: "Portal Ayurveda",
  ogDescription: "Descrição da home", image: `${base}/og-image.jpg`,
};
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe("prévia do destino dos links curtos", () => {
  it("usa a rota gerada mesmo com parâmetros no destino, sem baixar HTML", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch");
    const rotas = [{ path: "/samkhya/kits/vata", title: "Kit Vata", description: "Sobre o kit", image: `${base}/kit.jpg` }];
    expect(await previaDoDestino("/samkhya/kits/vata?oferta=1", base, rotas, padrao)).toEqual({
      title: "Kit Vata", description: "Sobre o kit", ogTitle: "Kit Vata", ogDescription: "Sobre o kit", image: `${base}/kit.jpg`,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reconhece endereço completo de uma rota gerada pelo próprio site", async () => {
    expect((await previaDoDestino(`${base}/curso/rotinas`, base, [{ path: "/curso/rotinas", title: "Rotinas", description: "Curso" }], padrao)).title).toBe("Rotinas");
  });
  it("baixa a página externa e preserva title e OG distintos", async () => {
    const alvo = "https://api.portalayurveda.com/functions/v1/pagina-livre?p=cash-black";
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(`<title>Cash &amp; Black</title><meta content='Oferta' name='description'><meta content='Cash Black OG' property='og:title'><meta property='og:description' content='Oferta OG'><meta property='og:image' content='https://portalayurveda.com/cash.jpg'>`));
    expect(await previaDoDestino(alvo, base, [], padrao)).toEqual({
      title: "Cash & Black", description: "Oferta", ogTitle: "Cash Black OG", ogDescription: "Oferta OG", image: `${base}/cash.jpg`,
    });
    expect(fetcher.mock.calls[0][0]).toBe(alvo);
  });
  it("substitui somente os dados ausentes pelos dados padrão", () => {
    expect(extrairPrevia(`<title>Oferta</title><meta property="og:title" content="Oferta social">`, base, padrao)).toEqual({ ...padrao, title: "Oferta", ogTitle: "Oferta social" });
  });
  it("resolve imagem relativa e rejeita imagem com protocolo inseguro", () => {
    expect(extrairPrevia(`<meta property="og:image" content="/cash.jpg">`, base, padrao).image).toBe(`${base}/cash.jpg`);
    expect(extrairPrevia(`<meta property="og:image" content="javascript:alert(1)">`, base, padrao).image).toBe(padrao.image);
  });
  it("mantém a reserva quando o download falha", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await previaDoDestino("https://example.com/oferta", base, [], padrao)).toEqual(padrao);
  });
  it("mantém a reserva quando o destino responde erro HTTP", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 500 }));
    expect(await previaDoDestino("https://example.com/oferta", base, [], padrao)).toEqual(padrao);
  });
  it("interrompe o download aos 10 segundos e continua com a reserva", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new Error("timeout")));
    }));
    const resultado = previaDoDestino("https://example.com/oferta", base, [], padrao);
    await vi.advanceTimersByTimeAsync(9999);
    expect(LIMITE_PREVIA_MS).toBe(10000);
    await vi.advanceTimersByTimeAsync(1);
    expect(await resultado).toEqual(padrao);
  });
  it("não baixa rota local desconhecida", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch");
    expect(await previaDoDestino("/ausente", base, [], padrao)).toEqual(padrao);
    expect(fetcher).not.toHaveBeenCalled();
  });
});