import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  saldo: { total: 200, samkhya_e_portal: 200 },
  resposta: { pedido_id: "pedido-123", frete_coberto: 30, total_a_pagar: 0, precisa_pagar: false },
  rpc: vi.fn(), invoke: vi.fn(), invalidate: vi.fn(),
  itens: [{ slug: "produto", nome: "Produto", preco: 100, peso: 300, tipo: "produto", imagem_url: null }],
}));
vi.mock("@/contexts/UserContext", () => ({ useUser: () => ({ user: { id: "pessoa" }, isAnonymous: false, loading: false, profile: { is_premium: true } }) }));
vi.mock("@/lib/cashBlack", async (original) => ({ ...await original<typeof import("@/lib/cashBlack")>(), useMeuCashback: () => ({ data: mocks.saldo }) }));
vi.mock("@/hooks/useFreteGratisConfig", () => ({ useFreteGratisConfig: () => ({ data: { frete_gratis_ativo: false } }) }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({ data: queryKey[0] === "usar_credito_loja" ? mocks.itens : [] }),
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("@/integrations/supabase/loja-client", () => ({ lojaSupabase: {} }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  rpc: mocks.rpc, functions: { invoke: mocks.invoke },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: {
    endereco: { cep: "01001000", rua: "Rua", numero: "1", bairro: "Centro", cidade: "São Paulo", uf: "SP" }, nome: "Pessoa",
  } }) }) }) }),
} }));
import UsarCredito from "./UsarCredito";

function Address() {
  return <output data-testid="address">{useLocation().pathname}</output>;
}
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("resgate Samkhya na página", () => {
  for (const precisaPagar of [false, true]) {
    it(`seleciona produto, calcula frete e abre pedido ${precisaPagar ? "com" : "sem"} Pix`, async () => {
      mocks.saldo = { total: precisaPagar ? 120 : 200, samkhya_e_portal: precisaPagar ? 120 : 200 };
      mocks.resposta = { pedido_id: "pedido-123", frete_coberto: precisaPagar ? 20 : 30, total_a_pagar: precisaPagar ? 10 : 0, precisa_pagar: precisaPagar };
      mocks.rpc.mockResolvedValue({ data: mocks.resposta, error: null });
      mocks.invoke.mockImplementation(async (nome: string) => ({ data: nome === "calcular-frete" ? { opcoes: [{ id: 1, nome: "Entrega", preco: 30, prazo_dias: 5 }] } : {}, error: null }));
      const view = render(<MemoryRouter initialEntries={["/usar-credito"]}><Address /><Routes>
        <Route path="/usar-credito" element={<UsarCredito />} />
        <Route path="/samkhya/pedido/:id" element={null} />
      </Routes></MemoryRouter>);
      fireEvent.click(view.getByRole("tab", { name: "Samkhya" }));
      fireEvent.click(view.getByRole("button", { name: "Escolher" }));
      await waitFor(() => expect(view.getByRole("button", { name: "Usar meu crédito" })).not.toBeDisabled());
      fireEvent.click(view.getByRole("button", { name: "Usar meu crédito" }));
      await waitFor(() => expect(view.getByTestId("address").textContent).toBe("/samkhya/pedido/pedido-123"));
      expect(mocks.rpc).toHaveBeenCalledWith("cashback_resgatar_samkhya", expect.objectContaining({ p_itens: [{ slug: "produto", quantidade: 1 }], p_frete: expect.objectContaining({ preco: 30 }) }));
      const chamadasPix = mocks.invoke.mock.calls.filter(([nome]) => nome === "create-pix-pagamento");
      expect(chamadasPix).toEqual(precisaPagar ? [["create-pix-pagamento", { body: { renovar_pedido_id: "pedido-123" } }]] : []);
      expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["meu_cashback"] });
    });
  }
});