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
  dataBR,
} from "./terapia";
import { supabase } from "@/integrations/supabase/client";
import { filtrarPacientes } from '@/components/terapia/Pacientes';
import type { Paciente } from './terapia';
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
  it('consulta identidade pelo banco sem inferir por perfil público', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({data:false,error:null} as never);
    expect(await terapia.sou()).toBe(false);
    expect(supabase.rpc).toHaveBeenCalledWith('sou_terapeuta');
  });
  it('filtro de consulta exige próxima consulta preenchida', () => {
    const lista = [{nome:'Ana',proxima:null},{nome:'Maria',proxima:'2026-10-27T12:00:00Z'}] as Paciente[];
    expect(filtrarPacientes(lista,'','consulta').map(p=>p.nome)).toEqual(['Maria']);
  });
  it('filtro de atenção exige pontos de atenção maiores que zero', () => {
    const lista = [{nome:'Ana',teste:{atencao:0}},{nome:'Maria',teste:{atencao:1}}] as Paciente[];
    expect(filtrarPacientes(lista,'','atencao').map(p=>p.nome)).toEqual(['Maria']);
  });
  it('posiciona consultas pelo dia de São Paulo, inclusive virada UTC', () => {
    expect(dataBR('2026-10-27T01:00:00Z')).toBe('2026-10-26');
  });
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

import { valorDigitado, passosFaltando, podeLigarParticipar, pedidoAberto } from "./terapia";
import { minhasComFavoritos } from "./terapiaIndicacoes";
describe("participar do portal", () => {
  it("lê o valor em reais", () => { expect(valorDigitado("R$ 180")).toBe(180); expect(valorDigitado("1.250,50")).toBe(1250.5); expect(valorDigitado("")).toBeNull(); });
  it("lista o que falta na ordem premium, termo, agenda, valor", () => { expect(passosFaltando(["valor", "premium"])).toEqual(["premium", "valor"]); });
  it("só deixa ligar quando não falta nada", () => { expect(podeLigarParticipar([])).toBe(true); expect(podeLigarParticipar(["agenda"])).toBe(false); });
  it("pedido aberto só em pedido ou aceito", () => { expect(pedidoAberto("aceito")).toBe(true); expect(pedidoAberto("expirado")).toBe(false); });
  it("favoritos entram em Minhas com selo", () => { expect(minhasComFavoritos([{ titulo: "a" }], [{ titulo: "b" }]).map(f => !!f.favorito)).toEqual([false, true]); });
});
