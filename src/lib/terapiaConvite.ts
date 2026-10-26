export type PermissaoChave = "teste" | "fotos" | "rotina" | "akasha";
export type PermissoesConvite = Record<PermissaoChave, boolean>;
export type EtapaConvite = "convite" | "entrar" | "permissoes" | "teste" | "pronto";
export interface ConviteTextos {
  chapeu: string; titulo: string; intro: string;
  itens: { titulo: string; texto: string }[];
  botao: string; mini: string; entrar_titulo: string; entrar_mini: string;
  perm_titulo: string; perm_mini: string;
  perms: { chave: PermissaoChave; titulo: string; texto: string; padrao: boolean }[];
  teste_titulo: string; teste_texto: string; teste_botao: string; teste_mini: string;
  pronto_titulo: string; pronto_texto: string; pronto_rotina: string;
  erro_titulo: string; erro_texto: string; proprio_texto: string; proprio_botao: string;
}
export interface Convite {
  ativo: boolean;
  textos: ConviteTextos;
  terapeuta?: { nome: string; primeiro_nome: string; imagem: string | null; especialidade: string | null; cidade: string | null; estado: string | null; slug: string };
  eu?: { logado: boolean; proprio?: boolean; ja_ligado?: boolean; tem_teste?: boolean; perm?: PermissoesConvite | null };
}
export function textoConvite(texto: string, terapeuta: Convite["terapeuta"]) {
  return texto?.split("{nome}").join(terapeuta?.nome ?? "").split("{primeiro}").join(terapeuta?.primeiro_nome ?? "") ?? "";
}
export function permissoesConvite(convite: Convite): PermissoesConvite {
  const perm = { teste: false, fotos: false, rotina: false, akasha: false };
  for (const item of convite.textos.perms ?? []) {
    perm[item.chave] = convite.eu?.ja_ligado ? convite.eu.perm?.[item.chave] === true : item.padrao === true;
  }
  return perm;
}
export function etapasConvite(logado: boolean, temTeste: boolean): EtapaConvite[] {
  return ["convite", ...(!logado ? ["entrar" as const] : []), "permissoes", ...(!temTeste ? ["teste" as const] : []), "pronto"];
}
export function depoisDeAceitar(jaLigado: boolean, temTeste: boolean): EtapaConvite {
  return jaLigado || temTeste ? "pronto" : "teste";
}