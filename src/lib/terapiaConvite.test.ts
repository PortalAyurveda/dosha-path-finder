import { describe, expect, it, vi } from "vitest";
import { depoisDeAceitar, etapasConvite, permissoesConvite, type Convite } from "./terapiaConvite";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
import { terapia } from "./terapia";
const base = { ativo: true, textos: { perms: [
  { chave: "teste", padrao: true }, { chave: "fotos", padrao: true },
  { chave: "rotina", padrao: true }, { chave: "akasha", padrao: false },
] } } as Convite;
describe("convite da terapeuta", () => {
  it("inclui Entrar somente para visitante", () => {
    expect(etapasConvite(false, false)).toEqual(["convite", "entrar", "permissoes", "teste", "pronto"]);
    expect(etapasConvite(true, false)).toEqual(["convite", "permissoes", "teste", "pronto"]);
  });
  it("omite Teste quando já existe resultado", () => {
    expect(etapasConvite(true, true)).toEqual(["convite", "permissoes", "pronto"]);
  });
  it("aplica os padrões entregues pelo convite", () => {
    expect(permissoesConvite(base)).toEqual({ teste: true, fotos: true, rotina: true, akasha: false });
  });
  it("respeita permissões existentes inclusive recusas", () => {
    expect(permissoesConvite({ ...base, eu: { logado: true, ja_ligado: true, perm: { teste: false, fotos: false, rotina: true, akasha: true } } })).toEqual({ teste: false, fotos: false, rotina: true, akasha: true });
  });
  it("pessoa já ligada segue para Pronto mesmo sem teste", () => {
    expect(depoisDeAceitar(true, false)).toBe("pronto");
  });
  it("novo vínculo sem teste segue para Teste", () => {
    expect(depoisDeAceitar(false, false)).toBe("teste");
    expect(depoisDeAceitar(false, true)).toBe("pronto");
  });
  it("envia as quatro permissões explícitas para a função existente", async () => {
    rpc.mockResolvedValueOnce({ data: { ligacao: "vinculo", tem_teste: false }, error: null });
    await terapia.aceitarConvite("juliana", { teste: false, fotos: true, rotina: false, akasha: true });
    expect(rpc).toHaveBeenCalledWith("terapia_convite_aceitar", { p_slug: "juliana", p_teste: false, p_fotos: true, p_rotina: false, p_akasha: true });
  });
});