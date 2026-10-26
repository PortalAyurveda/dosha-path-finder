import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));
import {
  PING_MS,
  saudacao,
  regrasComDuracao,
  mudarSemana,
  limitesSemana,
  salaAberta,
  terapia,
} from "./terapia";
import { supabase } from "@/integrations/supabase/client";
const regras = [
  {
    dia_semana: 1,
    inicio: "09:00",
    fim: "12:00",
    duracao_min: 30,
    intervalo_min: 0,
  },
  {
    dia_semana: 3,
    inicio: "15:00",
    fim: "17:00",
    duracao_min: 40,
    intervalo_min: 5,
  },
];
describe("Regras do painel da terapeuta", () => {
  it("usa saudação pela hora e primeiro nome", () => {
    expect(saudacao("Juliana", 8)).toBe("Bom dia, Juliana");
    expect(saudacao("Juliana", 12)).toBe("Boa tarde, Juliana");
    expect(saudacao("Juliana", 18)).toBe("Boa noite, Juliana");
  });
  it("aplica duração única em todas as faixas", () => {
    expect(regrasComDuracao(regras, 50, 10).map((r) => r.duracao_min)).toEqual([
      50, 50,
    ]);
  });
  it("aplica intervalo único em todas as faixas", () => {
    expect(
      regrasComDuracao(regras, 50, 10).map((r) => r.intervalo_min),
    ).toEqual([10, 10]);
  });
  it("colunas só dos dias com faixas e linhas da primeira à última hora", () => {
    expect(limitesSemana(regras)).toEqual({
      dias: [1, 3],
      inicio: 540,
      fim: 1020,
    });
  });
  it("setas movem exatamente uma semana", () => {
    expect(mudarSemana("2026-10-26", -1)).toBe("2026-10-19");
    expect(mudarSemana("2026-10-26", 1)).toBe("2026-11-02");
  });
  it("mantém ping a cada dois minutos", () => {
    expect(PING_MS).toBe(120000);
  });
  it("sala só abre a partir do instante informado", () => {
    const c = {
      id: "c",
      paciente_id: "p",
      nome: "Ana",
      inicio: "",
      fim: "",
      primeira: true,
      sala_abre_em: "2026-10-26T12:50:00Z",
    };
    expect(salaAberta(c, Date.parse("2026-10-26T12:49:59Z"))).toBe(false);
    expect(salaAberta(c, Date.parse("2026-10-26T12:50:00Z"))).toBe(true);
  });
  it("agenda busca a semana pela função acordada", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: { inicio: "2026-10-26" },
      error: null,
    } as never);
    await terapia.semana("2026-10-26");
    expect(supabase.rpc).toHaveBeenCalledWith("terapia_semana", {
      p_inicio: "2026-10-26",
    });
  });
});
