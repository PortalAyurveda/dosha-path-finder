import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ invoke: vi.fn(), signInWithOtp: vi.fn(), verifyOtp: vi.fn(), toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: auth.invoke }, auth } }));
vi.mock("@/contexts/UserContext", () => ({ useUser: () => ({ user: null, isAnonymous: false, doshaResult: null }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: auth.toast }) }));
vi.mock("@/lib/inAppBrowser", () => ({ isInAppBrowser: () => false }));
import LoginForm from "./LoginForm";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  localStorage.clear(); vi.clearAllMocks();
  auth.invoke.mockResolvedValue({ error: null });
  auth.signInWithOtp.mockResolvedValue({ error: null });
  auth.verifyOtp.mockResolvedValue({ error: null });
});
afterEach(async () => { cleanup(); await new Promise(resolve => setTimeout(resolve, 100)); });
const open = () => render(<MemoryRouter><LoginForm embedded emailOnly redirectPath="/terapeutas/juliana/convite?etapa=permissoes" /></MemoryRouter>);
describe("login compartilhado do convite", () => {
  it("usa preparar-login e o mesmo envio OTP sem emailRedirectTo", async () => {
    open();
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "test@example.invalid" } });
    fireEvent.submit(screen.getByLabelText("E-mail").closest("form") as HTMLFormElement);
    await waitFor(() => expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: "test@example.invalid", options: { shouldCreateUser: true, data: { contexto: "otp" } } }));
    expect(auth.invoke).toHaveBeenCalledWith("preparar-login", { body: { email: "test@example.invalid", contexto: "otp" } });
  });
  it("restaura código pendente e impede reenvio antes de 60 segundos", () => {
    localStorage.setItem("portal:login-pendente", JSON.stringify({ email: "test@example.invalid", step: "code", em: Date.now() }));
    open();
    expect(screen.getByRole("button", { name: /Reenviar em/ })).toBeDisabled();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });
  it("ignora login pendente com mais de 15 minutos", () => {
    localStorage.setItem("portal:login-pendente", JSON.stringify({ email: "test@example.invalid", step: "code", em: Date.now() - 15 * 60 * 1000 - 1 }));
    open();
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("button", { name: /Reenviar em/ })).toBeNull();
  });
  it("verifica com type email e não aceita menos de seis dígitos", async () => {
    localStorage.setItem("portal:login-pendente", JSON.stringify({ email: "test@example.invalid", step: "code", em: Date.now() }));
    open();
    const input = document.querySelector<HTMLInputElement>('input[autocomplete="one-time-code"]');
    if (!input) throw new Error("Campo de código ausente");
    fireEvent.change(input, { target: { value: "12345" } });
    expect(screen.getByRole("button", { name: /^Entrar$/ })).toBeDisabled();
    expect(auth.verifyOtp).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^Entrar$/ }));
    await waitFor(() => expect(auth.verifyOtp).toHaveBeenCalledWith({ email: "test@example.invalid", token: "123456", type: "email" }));
  });
  it("não grava o destino no localStorage no modo embutido", () => {
    open();
    expect(localStorage.getItem("pendingLoginRedirect")).toBeNull();
  });
  it("fora do modo embutido, grava o destino no localStorage", () => {
    render(<MemoryRouter><LoginForm redirectPath="/assinar" /></MemoryRouter>);
    expect(localStorage.getItem("pendingLoginRedirect")).toBe("/assinar");
  });
});