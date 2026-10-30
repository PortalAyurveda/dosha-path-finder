export type ItemCatalogo = { tipo: string; grupo: string; id: string; nome: string; preco: number };
export type LinhaConta = { chave: string; id?: string; nome: string; preco: number; precoOriginal?: number; qtd: number };
export type TipoDesconto = "pct" | "brl";

export const GRUPOS = ["Produtos Samkhya", "Kits Samkhya", "Cursos"];

export const brl = (v: number) =>
  (Number.isFinite(v) ? v : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const r2 = (v: number) => Math.round(v * 100) / 100;

export function calcular(linhas: LinhaConta[], desconto: number, tipo: TipoDesconto, frete: number) {
  const subtotal = r2(linhas.reduce((s, l) => s + (l.preco || 0) * l.qtd, 0));
  const d = Math.max(0, desconto || 0);
  const valorDesconto = r2(tipo === "pct" ? Math.min(subtotal, (subtotal * Math.min(d, 100)) / 100) : Math.min(d, subtotal));
  const f = Math.max(0, frete || 0);
  return { subtotal, desconto: valorDesconto, frete: r2(f), total: r2(subtotal - valorDesconto + f) };
}

export function montarDescricao(linhas: LinhaConta[], desconto: number, tipo: TipoDesconto) {
  const itens = linhas
    .filter((l) => l.nome.trim())
    .map((l) => `${l.qtd > 1 ? `${l.qtd}x ` : ""}${l.nome.trim()}`)
    .join(" + ");
  if (!(desconto > 0)) return itens;
  const d = tipo === "pct" ? `${String(desconto).replace(".", ",")}%` : brl(desconto);
  return `${itens} — desconto ${d}`;
}

export function adicionarDoCatalogo(linhas: LinhaConta[], item: ItemCatalogo): LinhaConta[] {
  const chave = `${item.tipo}:${item.id}`;
  if (linhas.some((l) => l.chave === chave)) {
    return linhas.map((l) => (l.chave === chave ? { ...l, qtd: l.qtd + 1 } : l));
  }
  return [...linhas, { chave, id: item.id, nome: item.nome, preco: Number(item.preco) || 0, precoOriginal: Number(item.preco) || 0, qtd: 1 }];
}

export const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function parseValor(s: string): number {
  const t = s.trim().replace(/\s|R\$/g, "");
  if (!t) return 0;
  const n = t.includes(",") ? Number(t.replace(/\./g, "").replace(",", ".")) : Number(t);
  return Number.isFinite(n) ? n : 0;
}
