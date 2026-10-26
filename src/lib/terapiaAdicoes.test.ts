import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: vi.fn(async () => ({
          data: { signedUrl: "signed" },
          error: null,
        })),
      })),
    },
  },
}));
import { supabase } from "@/integrations/supabase/client";
import { terapia } from "./terapia";
import {
  extras,
  posicoes,
  cartaAoAcaso,
  removerAdicao,
  linhasFolha,
} from "./terapiaAdicoes";
import { iniciarDados, novaMarca } from "./terapiaAvaliacao";
import {
  calcularMapa,
  nascimentoUTC,
  lahiri,
  ascendente,
} from "./terapiaAstro";
import type { ConteudoFicha } from "./terapiaAvaliacao";
const c = { AGNIS: [], DEF: {}, SINT: {} } as unknown as ConteudoFicha;
describe("Adições da avaliação", () => {
  it("mantém dados do núcleo e extras ao reabrir o objeto único", () => {
    const d = iniciarDados(
      {
        versao: 1,
        extras: {
          adicoes: [{ id: "mente", nome: "Mente" }],
          conversa: {},
          tarot: [],
        },
      },
      null,
      c,
    );
    expect(extras(d).adicoes[0].id).toBe("mente");
    expect(d.versao).toBe(1);
  });
  it("limita tiragem de uma a cinco posições", () => {
    expect(posicoes([], 0)).toHaveLength(1);
    expect(posicoes([], 9)).toHaveLength(5);
  });
  it("tiragem preserva títulos e notas ao ajustar quantidade", () => {
    expect(posicoes([{ titulo: "Assunto", nota: "Texto" }], 3)[0]).toEqual({
      titulo: "Assunto",
      nota: "Texto",
    });
  });
  it("acaso não repete carta já escolhida", () => {
    const cs = [
      { numero: 1, nome: "A", foto_path: "a" },
      { numero: 2, nome: "B", foto_path: "b" },
    ];
    expect(
      cartaAoAcaso(cs, [{ titulo: "A", nota: "", carta: cs[0] }], () => 0)
        ?.numero,
    ).toBe(2);
  });
  it("tirar área remove suas marcas e notas sem alterar núcleo", () => {
    const d = iniciarDados({ versao: 1 }, null, c);
    d.extras = { adicoes: [{ id: "mente", nome: "Mente" }] };
    d.marcas.a = novaMarca({ id: "a", nome: "A", setor: "mente" });
    d.marcas.b = novaMarca({ id: "b", nome: "B", setor: "sintomas" });
    d.notas.mente = "Nota";
    const r = removerAdicao(d, "mente");
    expect(r.marcas.a).toBeUndefined();
    expect(r.marcas.b).toBeDefined();
    expect(r.notas.mente).toBeUndefined();
    expect(extras(r).adicoes).toEqual([]);
  });
  it("etapa escolhida é única no objeto", () => {
    const d = iniciarDados({}, null, c);
    d.extras = { ...extras(d), etapa: "Acúmulo" };
    d.extras = { ...extras(d), etapa: "Agravamento" };
    expect(extras(d).etapa).toBe("Agravamento");
  });
  it("folha omite partes não preenchidas e inclui notas livres", () => {
    const d = iniciarDados({ versao: 1 }, null, c);
    expect(linhasFolha(d, c)).toEqual([]);
    d.notas.sintomas = "Minha nota";
    expect(linhasFolha(d, c)).toEqual([
      { id: "sintomas", nome: "Sintomas", linhas: ["Minha nota"] },
    ]);
  });
  it("assina cartas no bucket privado por uma hora", async () => {
    expect(await terapia.tarotFoto("carta.jpg")).toBe("signed");
    expect(supabase.storage.from).toHaveBeenCalledWith("osho-tarot");
    const r = vi.mocked(supabase.storage.from).mock.results[
      vi.mocked(supabase.storage.from).mock.results.length - 1
    ]?.value;
    expect(r.createSignedUrl).toHaveBeenCalledWith("carta.jpg", 3600);
  });
  it("usa nascimento e busca de cidades existentes", async () => {
    vi.mocked(supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {},
      error: null,
    } as never);
    await terapia.nascimentoSalvar("p", {
      data: "1990-01-02",
      hora_conhecida: false,
      municipio: 3550308,
    });
    expect(supabase.rpc).toHaveBeenCalledWith("acomp_nascimento_salvar", {
      p_paciente: "p",
      p_data: "1990-01-02",
      p_hora: undefined,
      p_hora_conhecida: false,
      p_municipio: 3550308,
      p_exterior: undefined,
    });
    await terapia.municipios("São", "SP");
    expect(supabase.rpc).toHaveBeenCalledWith("municipios_busca", {
      p_q: "São",
      p_uf: "SP",
    });
  });
});
describe("Mapa local", () => {
  const n = {
    data: "2000-01-01",
    hora: "09:00",
    hora_conhecida: true,
    cidade: "São Paulo",
    uf: "SP",
    local_exterior: null,
    latitude: -23.55,
    longitude: -46.63,
    fuso: "America/Sao_Paulo",
  };
  it("converte fuso histórico com horário de verão", () => {
    expect(
      nascimentoUTC("2000-01-01", "09:00", "America/Sao_Paulo").toISOString(),
    ).toBe("2000-01-01T11:00:00.000Z");
  });
  it("mapa fornece Sol Lua Ascendente Vênus e nakshatra", () => {
    const l = calcularMapa(n, "tradicional");
    expect(l.map((x) => x.nome)).toEqual([
      "Sol",
      "Lua",
      "Ascendente",
      "Vênus",
      "Nakshatra da Lua",
    ]);
    expect(l[0].valor).toContain("Capricórnio");
    expect(l[2].valor).not.toBe("precisa da hora");
  });
  it("sem hora não calcula ascendente", () => {
    expect(
      calcularMapa(
        { ...n, hora: null, hora_conhecida: false },
        "tradicional",
      )[2].valor,
    ).toBe("precisa da hora");
  });
  it("Lahiri em J2000 e leitura védica diferem da tropical", () => {
    expect(lahiri(new Date("2000-01-01T12:00:00Z"))).toBeCloseTo(23.8530556, 6);
    expect(calcularMapa(n, "vedico")[0].valor).toContain("Sagitário");
  });
  it("Ascendente aponta para horizonte leste em latitude zero", () => {
    const date = new Date("2000-01-01T12:00:00Z");
    expect(ascendente(date, 0, 0)).toBeCloseTo(11.378, 1);
  });
});
