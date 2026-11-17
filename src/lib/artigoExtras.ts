// Quadro "Continue aprendendo", autor e data do artigo: usados igual na tela (BlogArticle.tsx)
// e no HTML do build (scripts/seo/corpos.ts), para os dois mostrarem a mesma coisa.
import { NOME_CURSO } from "../data/courses/nomes";

export const AUTOR_ARTIGO = {
  nome: "Edson Osorio",
  linha: "Terapeuta e professor de Ayurveda há 15 anos",
  foto: "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg",
};

export type CursoArtigo = { nome: string; rota: string };

const CURSOS: { curso: CursoArtigo; palavras: string[] }[] = [
  { curso: { nome: NOME_CURSO.alimentacao, rota: "/curso/alimentacao" }, palavras: ["alimentacao", "dieta", "receita", "receitas", "digestao", "agni", "ama"] },
  { curso: { nome: NOME_CURSO.rotinas, rota: "/curso/rotinas" }, palavras: ["rotina", "rotinas", "dinacharya", "sono", "horarios", "acordar"] },
  { curso: { nome: NOME_CURSO.diagnostico, rota: "/curso/diagnostico" }, palavras: ["lingua", "diagnostico", "pulso", "fezes", "excrecao"] },
  { curso: { nome: NOME_CURSO.dravyaGuna, rota: "/curso/dravya-guna" }, palavras: ["ervas", "erva", "chas", "cha", "especiarias", "herbologia", "dravyaguna", "remedio caseiro", "remedios caseiros"] },
];

/** Minúsculas, sem acento e sem emoji/pontuação. */
export function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function achar(texto: string): CursoArtigo | null {
  const t = ` ${normalizarTexto(texto)} `;
  if (!t.trim()) return null;
  for (const { curso, palavras } of CURSOS) {
    if (palavras.some((p) => t.includes(` ${p} `))) return curso;
  }
  return null;
}

/** Curso do artigo: primeiro pelas tags (uma a uma), depois pelo título; o resto vai para Alimentação. */
export function cursoDoArtigo(tags: string | null | undefined, titulo: string | null | undefined): CursoArtigo {
  for (const tg of (tags || "").split(",")) {
    const c = achar(tg);
    if (c) return c;
  }
  return achar(titulo || "") ?? CURSOS[0].curso;
}

/** Data de atualização (atualizado_em, ou created_at quando vazio). */
export function dataAtualizacao(a: { atualizado_em?: string | null; created_at?: string | null }): string | null {
  return a.atualizado_em || a.created_at || null;
}

/** dd/mm/aaaa no horário de Brasília. */
export function dataBRArtigo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}
