import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from "@/integrations/supabase/client";
import AlunosTodos, { acessoAluno, dataAluno, prazoAluno, tempoAluno, vencimentoAluno, type ConfigAlunos, type CursoAluno } from "./AlunosTodos";
import LiberarCursoDialog from "./LiberarCursoDialog";
import EstenderCursoDialog from "./EstenderCursoDialog";
const rpc = supabase.rpc as unknown as ReturnType<typeof vi.fn>;
const config: ConfigAlunos = { cursos: [{ id: "c1", slug: "curso", titulo: "Curso teste", ativo: true, padrao_rotulo: "12 meses" }], tipos: [{ chave: "cortesia", rotulo: "Cortesia" }], prazos_liberar: [{ rotulo: "Padrão", modo: "padrao", padrao: true }, { rotulo: "Vitalício", modo: "vitalicio" }], prazos_estender: [{ rotulo: "3 meses", modo: "meses", meses: 3 }, { rotulo: "Vitalício", modo: "vitalicio" }] };
const curso = { matricula_id: "m1", curso_id: "c1", titulo: "Curso teste", slug: "curso", situacao: "ativo", expira_em: "2026-11-30", pct: 10 } as CursoAluno;
beforeEach(() => { cleanup(); rpc.mockReset(); });
describe("Regras de alunos admin", () => {
  it("formata datas brasileiras sem deslocar data sem hora", () => { expect(dataAluno("2026-10-26")).toBe("26/10/2026"); });
  it("último acesso usa hoje, ontem e até sete dias", () => { const agora = new Date(2026, 9, 26, 20); expect(acessoAluno(new Date(2026, 9, 26, 10, 5).toISOString(), agora)).toBe("hoje, 10:05"); expect(acessoAluno(new Date(2026, 9, 25).toISOString(), agora)).toBe("ontem"); expect(acessoAluno(new Date(2026, 9, 19).toISOString(), agora)).toBe("há 7 dias"); expect(acessoAluno(new Date(2026, 9, 18).toISOString(), agora)).toBe("18/10/2026"); expect(acessoAluno(null, agora)).toBe("nunca entrou"); });
  it("tempo de aula em mm:ss e h:mm:ss", () => { expect(tempoAluno(65)).toBe("01:05"); expect(tempoAluno(3661)).toBe("1:01:01"); });
  it("monta os quatro objetos de prazo exatos", () => { expect(prazoAluno({ rotulo: "P", modo: "padrao" }, "")).toEqual({ modo: "padrao" }); expect(prazoAluno({ rotulo: "M", modo: "meses", meses: 3 }, "")).toEqual({ modo: "meses", meses: 3 }); expect(prazoAluno({ rotulo: "V", modo: "vitalicio" }, "")).toEqual({ modo: "vitalicio" }); expect(prazoAluno({ rotulo: "D", modo: "data" }, "2027-01-10")).toEqual({ modo: "data", ate: "2027-01-10" }); });
  it("estende vencimento futuro ou hoje quando venceu, respeitando fim do mês", () => { const p = { rotulo: "1 mês", modo: "meses", meses: 1 } as const; expect(vencimentoAluno({ ...curso, expira_em: "2027-01-31" }, p, "", new Date(2026, 9, 26))).toBe("2027-02-28"); expect(vencimentoAluno({ ...curso, expira_em: "2026-01-01" }, p, "", new Date(2026, 9, 26))).toBe("2026-11-26"); });
  it("lista pede 50 e acrescenta a próxima página pelo offset", async () => {
    const itens = Array.from({ length: 50 }, (_, i) => ({ chave: `a${i}`, nome: `Aluno ${i}`, email: `aluno${i}@example.test`, cursos: [], progresso: null }));
    rpc.mockResolvedValueOnce({ data: { total: 51, itens }, error: null }).mockResolvedValueOnce({ data: { total: 51, itens: [{ ...itens[0], chave: "a50" }] }, error: null });
    render(<AlunosTodos config={config} revisao={0} onAbrir={vi.fn()} />);
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("admin_alunos_lista", { p_busca: null, p_curso_id: null, p_situacao: "todos", p_limite: 50, p_offset: 0 }));
    fireEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));
    await waitFor(() => expect(rpc).toHaveBeenLastCalledWith("admin_alunos_lista", { p_busca: null, p_curso_id: null, p_situacao: "todos", p_limite: 50, p_offset: 50 }));
  });
  it("busca aguarda 300 ms e reinicia offset", async () => {
    rpc.mockResolvedValue({ data: { total: 0, itens: [] }, error: null }); render(<AlunosTodos config={config} revisao={0} onAbrir={vi.fn()} />); await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Maria" } }); expect(rpc).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(rpc).toHaveBeenLastCalledWith("admin_alunos_lista", { p_busca: "Maria", p_curso_id: null, p_situacao: "todos", p_limite: 50, p_offset: 0 }));
  });
  it("liberação usa cursos, tipo e prazo da configuração, sem cadastro", async () => {
    rpc.mockImplementation((nome: string) => Promise.resolve({ error: null, data: nome === "admin_aluno_ficha" ? { tem_conta: false, email: "teste@example.test", cursos: [], convites: [], historico: [], conta: null, formacao: null } : { ok: true, tem_conta: false, email_enviado: true } }));
    const sucesso = vi.fn(); render(<LiberarCursoDialog open config={config} inicial={{ email: "teste@example.test", cursos: ["c1"] }} onOpenChange={vi.fn()} onSucesso={sucesso} />);
    const enviar = await screen.findByRole("button", { name: "Enviar convite" }); fireEvent.click(enviar);
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("admin_liberar_cursos", { p_email: "teste@example.test", p_curso_ids: ["c1"], p_prazo: { modo: "padrao" }, p_tipo: "cortesia", p_enviar_email: true, p_obs: null })); expect(sucesso).toHaveBeenCalledTimes(1);
  });
  it("acesso vitalício não pode ser estendido em meses", () => { render(<EstenderCursoDialog curso={{ ...curso, vitalicio: true }} config={config} onClose={vi.fn()} onSucesso={vi.fn()} />); expect(screen.getByRole("button", { name: "3 meses" })).toBeDisabled(); });
  it("extensão passa matrícula e prazo exatos", async () => { rpc.mockResolvedValue({ data: { ok: true, expira_em: "2027-02-28" }, error: null }); render(<EstenderCursoDialog curso={curso} config={config} onClose={vi.fn()} onSucesso={vi.fn()} />); fireEvent.click(screen.getByRole("button", { name: "Estender", exact: true })); await waitFor(() => expect(rpc).toHaveBeenCalledWith("admin_estender_curso", { p_matricula_id: "m1", p_prazo: { modo: "meses", meses: 3 }, p_enviar_email: true, p_obs: null })); });
});
