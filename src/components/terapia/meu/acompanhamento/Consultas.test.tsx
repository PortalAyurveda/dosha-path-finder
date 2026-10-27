import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
const { ProximaConsulta } = await import("./Consultas");
import { salaLiberada, meu, type MeuTerapeutaLigacao } from "@/lib/terapiaMeu";

const cancelar = vi.fn();
Object.assign(meu, { cancelar, horarios: vi.fn() });

const ligacao = (pode: boolean) =>
  ({
    terapeuta: { id: "t1", slug: "maria", primeiro_nome: "Maria" },
    proxima: {
      id: "c1",
      inicio: "2026-10-28T13:00:00Z",
      fim: "2026-10-28T14:00:00Z",
      sala_abre_em: "2026-10-28T12:40:00Z",
      pode_cancelar: pode,
    },
    regras: { texto: "Cancelamentos com 24h." },
  }) as unknown as MeuTerapeutaLigacao;

beforeEach(() => {
  cleanup();
  cancelar.mockReset();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("Próxima consulta: Remarcar e Cancelar voltam como links", () => {
  it("mostra Remarcar · Cancelar em cinza abaixo do botão principal, que fica sozinho", () => {
    const { container } = render(<ProximaConsulta l={ligacao(true)} agora={Date.parse("2026-10-28T12:00:00Z")} />);
    const acoes = container.querySelector(".ac-acoes");
    expect(acoes).not.toBeNull();
    const principal = acoes!.querySelector("[data-terapia-principal]");
    expect(principal?.textContent).toBe("Entrar na sala");
    expect(principal!.children.length).toBe(0);
    const links = acoes!.querySelector(".ac-links");
    expect(links?.textContent).toContain("Remarcar");
    expect(links?.textContent).toContain("Cancelar");
    expect(links!.querySelectorAll("button.ac-link")).toHaveLength(2);
    expect(links!.querySelectorAll("button")).toHaveLength(2);
  });
  it("esconde os links quando a sala já abriu ou a consulta não pode ser cancelada", () => {
    const aberta = render(<ProximaConsulta l={ligacao(true)} agora={Date.parse("2026-10-28T12:40:00Z")} />);
    expect(salaLiberada(aberta.container.querySelector(".ac-card") ? ligacao(true).proxima : null, Date.parse("2026-10-28T12:40:00Z"))).toBe(true);
    expect(aberta.container.querySelector(".ac-links")).toBeNull();
    aberta.unmount();
    const travada = render(<ProximaConsulta l={ligacao(false)} agora={Date.parse("2026-10-28T12:00:00Z")} />);
    expect(travada.container.querySelector(".ac-links")).toBeNull();
  });
  it("Cancelar confirma e chama o cancelamento", async () => {
    const { container } = render(<ProximaConsulta l={ligacao(true)} agora={Date.parse("2026-10-28T12:00:00Z")} />);
    (container.querySelector(".ac-links button:last-child") as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 0));
    expect(window.confirm).toHaveBeenCalled();
    expect(cancelar).toHaveBeenCalledWith("c1");
  });
});
