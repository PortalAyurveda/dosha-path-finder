import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from "@/integrations/supabase/client";
import GraficoMeses from "./GraficoMeses";

const rpc = supabase.rpc as unknown as ReturnType<typeof vi.fn>;
const ver = (c: HTMLElement) => {
  const el = c.querySelector("#grafico");
  if (!el) throw new Error("cartão #grafico ausente");
  return el;
};
const mostrar = (html: string | null) => {
  rpc.mockResolvedValue({ data: html, error: null });
  const r = render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GraficoMeses idPublico="abc123" />
    </QueryClientProvider>,
  );
  return r;
};

beforeEach(() => {
  cleanup();
  rpc.mockReset();
});

describe("Gráfico do Meu Dosha vem pronto do banco", () => {
  it("pede o HTML pelo id público e o mostra dentro do cartão", async () => {
    const { container } = mostrar("<h2>Seus próximos 6 meses</h2><p>Agni moderado</p>");
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("meu_dosha_grafico_html", { p_idpublico: "abc123" }));
    const cartao = await waitFor(() => ver(container));
    expect(cartao.textContent).toContain("Seus próximos 6 meses");
    expect(cartao.textContent).toContain("Agni moderado");
  });
  it("some com o cartão quando o banco devolve vazio", async () => {
    const { container } = mostrar("   ");
    await waitFor(() => expect(rpc).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 40));
    expect(container.querySelector("#grafico")).toBeNull();
  });
  it("não chama o banco sem id público", () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <GraficoMeses idPublico="" />
      </QueryClientProvider>,
    );
    expect(rpc).not.toHaveBeenCalled();
  });
});
