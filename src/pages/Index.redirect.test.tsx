import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const { account } = vi.hoisted(() => ({
  account: { user: null as { id: string } | null, isAnonymous: false, loading: false,
    doshaResult: null as { idPublico: string } | null, refreshProfile: vi.fn() },
}));
vi.mock("@/contexts/UserContext", () => ({ useUser: () => account }));
vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/components/home/Hero", () => ({ default: () => null }));
vi.mock("@/components/home/LoggedHero", () => ({ default: () => null }));
vi.mock("@/components/home/HojeNoPortal", () => ({ default: () => null }));
vi.mock("@/components/banners/BannerSlot", () => ({ default: () => null }));
vi.mock("@/components/index/SommelierIndex", () => ({ default: () => null }));
vi.mock("@/components/index/VersoERegistros", () => ({ default: () => null }));
vi.mock("@/components/index/PortasDosha", () => ({ default: () => null }));
vi.mock("@/components/index/FundamentosAyurveda", () => ({ default: () => null }));
vi.mock("@/components/samkhya/PrateleiraSamkhya", () => ({ default: () => null }));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [] }) }));
import Index from "./Index";

function Address() {
  const location = useLocation();
  return <output data-testid="address">{location.pathname + location.search}</output>;
}
function openHome() {
  return render(<MemoryRouter initialEntries={["/"]}><Address /><Routes>
    <Route path="/" element={<Index />} />
    <Route path="/meu-dosha" element={null} />
  </Routes></MemoryRouter>);
}
afterEach(() => {
  cleanup();
  Object.assign(account, { user: null, isAnonymous: false, loading: false, doshaResult: null });
  localStorage.clear();
});
describe("Meu Dosha as the signed-in home", () => {
  it("opens the personal result when a non-anonymous account has a test", async () => {
    Object.assign(account, { user: { id: "person" }, doshaResult: { idPublico: "teste-123" } });
    const view = openHome();
    await waitFor(() => expect(view.getByTestId("address").textContent).toBe("/meu-dosha?id=teste-123"));
  });
  it("keeps anonymous accounts on the home even with a test", () => {
    Object.assign(account, { user: { id: "visitor" }, isAnonymous: true, doshaResult: { idPublico: "teste-123" } });
    expect(openHome().getByTestId("address").textContent).toBe("/");
  });
  it("keeps signed-out visitors on the home", () => {
    account.doshaResult = { idPublico: "teste-123" };
    expect(openHome().getByTestId("address").textContent).toBe("/");
  });
  it("keeps accounts without a test on the home", () => {
    account.user = { id: "person" };
    expect(openHome().getByTestId("address").textContent).toBe("/");
  });
  it("waits for account loading to finish before redirecting", () => {
    Object.assign(account, { user: { id: "person" }, loading: true, doshaResult: { idPublico: "teste-123" } });
    expect(openHome().getByTestId("address").textContent).toBe("/");
  });
});