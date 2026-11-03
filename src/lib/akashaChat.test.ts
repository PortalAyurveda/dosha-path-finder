import { describe, it, expect, vi, afterEach } from "vitest";
import { alternarTipo, enviarBiblioteca, AKASHA_BIBLIOTECA_URL } from "./akashaChat";

afterEach(() => vi.restoreAllMocks());

describe("alternarTipo", () => {
  it("mantém pelo menos uma ficha marcada", () => {
    expect(alternarTipo(["video"], "video")).toEqual(["video"]);
  });
  it("desmarca e remarca na ordem fixa", () => {
    expect(alternarTipo(["receita", "video", "artigo", "produto"], "video")).toEqual(["receita", "artigo", "produto"]);
    expect(alternarTipo(["receita", "produto"], "video")).toEqual(["receita", "video", "produto"]);
  });
});

describe("enviarBiblioteca", () => {
  it("envia message, email, contactId e tipos e limita a 4 cards", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      resposta: "Achei", modo: "biblioteca", cards: [1, 2, 3, 4, 5].map((n) => ({ tipo: "receita", titulo: `R${n}`, link: "/r", imagem: null })),
    })));
    const r = await enviarBiblioteca({ message: "chá", email: "a@b.c", contactId: "x", tipos: ["receita"] });
    expect(f.mock.calls[0][0]).toBe(AKASHA_BIBLIOTECA_URL);
    expect(JSON.parse(f.mock.calls[0][1]!.body as string)).toEqual({ message: "chá", email: "a@b.c", contactId: "x", tipos: ["receita"] });
    expect(r.cards).toHaveLength(4);
  });
  it("falha quando o endereço responde erro", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("x", { status: 500 }));
    await expect(enviarBiblioteca({ message: "a", email: null, contactId: null, tipos: ["video"] })).rejects.toThrow();
  });
});
