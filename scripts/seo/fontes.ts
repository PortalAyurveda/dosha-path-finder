// Leitura do banco no momento da build (postbuild), pela chave anônima.
//
// Este arquivo só LÊ e devolve dado cru. Quem escreve arquivo é scripts/prerender-og.ts.
//
// REGRA DE OURO DAS CONSULTAS: nunca acrescente uma coluna sem conferir no schema. Um nome
// errado vira HTTP 400, o 400 vira lista vazia, e a lista vazia vira "o site inteiro perdeu
// os HTMLs". Cada consulta abaixo traz a lista literal de colunas.

const SUPABASE_URL = "https://api.portalayurveda.com";

const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZXprYXNqZmd1YXJqbWp4aWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDI3MjEsImV4cCI6MjA4MzgxODcyMX0.sceKx2-SX8HZT_UaI2cHPnqkFZUmVPXaZwI9051Mzms";

export const BASE_URL = "https://portalayurveda.com";

export const DEFAULT_OG = `${BASE_URL}/og-image.jpg`;

export const SITEMAP_SOURCE = `${SUPABASE_URL}/functions/v1/sitemap`;

export const AUTOR_NOME = "Edson Osorio";

/** Linha de portal_conteudo (colunas conferidas no schema em 18/09/2026). */
export type LinhaArtigo = {
  id: string;
  created_at: string | null;
  image_url: string | null;
  title: string;
  summary: string | null;
  link_do_artigo: string;
  meta_description: string | null;
};

/** Linha da view videos_canonicos (as mesmas colunas da RPC find_video_canonico). */
export type LinhaVideo = {
  video_id: string;
  slug: string;
  novo_titulo: string;
  nova_descricao: string | null;
  mini_resumo: string | null;
};

/** Linha da view v_receitas (colunas conferidas no schema em 20/09/2026). */
export type LinhaReceita = {
  slug: string;
  titulo: string;
  resumo: string | null;
  ingredientes: unknown;
  modo_preparo: unknown;
  imagem_url: string | null;
};

export type LinhaCurto = { slug: string; video_id: string };

export type LinhaRedirecionamento = { de_path: string; para_path: string };

export type LinhaRegistro = { id: number; titulo: string | null };

export type LinhaLoja = Record<string, any>;

async function fetchRest<T = any>(query: string, schema?: string): Promise<T[]> {
  try {
    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    };
    if (schema) headers["Accept-Profile"] = schema;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, { headers });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `\n[prerender] ✗ REST ${res.status} em ${query}${schema ? ` (schema ${schema})` : ""}\n         corpo: ${body.slice(0, 300)}\n`
      );
      return [];
    }

    const data = (await res.json()) as T[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`[prerender] ✗ REST ${query} exceção`, err);
    return [];
  }
}

/**
 * Lê a tabela inteira, de 500 em 500, até vir uma página curta.
 * O PostgREST corta a resposta em 1.000 linhas e o corte é silencioso (HTTP 200 com a lista
 * pela metade). `ordem` tem que ser coluna única e sem nulo, senão a paginação repete e pula linhas.
 */
export async function lerTudo<T = any>(base: string, ordem: string, schema?: string): Promise<T[]> {
  const PAGINA = 500;
  const LIMITE = 40000;
  const out: T[] = [];
  const juntar = base.includes("?") ? "&" : "?";

  for (let offset = 0; offset < LIMITE; offset += PAGINA) {
    const pagina = await fetchRest<T>(`${base}${juntar}order=${ordem}&limit=${PAGINA}&offset=${offset}`, schema);
    out.push(...pagina);
    if (pagina.length < PAGINA) break;
  }

  const nome = base.split("?")[0];
  console.log(`[prerender] ✓ ${nome}${schema ? ` (${schema})` : ""} → ${out.length} linhas`);

  if (out.length === 0) {
    console.error(`\n[prerender] ⚠️  ZERO linhas em ${nome}. Quase sempre é permissão (RLS) barrando a chave anônima.\n`);
  }

  return out;
}

export type Fontes = {
  artigos: LinhaArtigo[];
  videos: LinhaVideo[];
  curtos: LinhaCurto[];
  receitas: LinhaReceita[];
  terapeutas: LinhaLoja[];
  produtos: LinhaLoja[];
  kits: LinhaLoja[];
  categorias: LinhaLoja[];
  redirecionamentos: LinhaRedirecionamento[];
  registros: LinhaRegistro[];

};

export async function lerFontes(): Promise<Fontes> {
  const [artigos, videos, curtos, receitas, terapeutas, produtos, kits, categorias, redirecionamentos, registros] = await Promise.all([
    lerTudo<LinhaArtigo>(
      "portal_conteudo?select=id,created_at,image_url,title,summary,link_do_artigo,meta_description&status=eq.published&link_do_artigo=not.is.null",
      "id.asc"
    ),

    // ÚNICA fonte de endereço de vídeo.
    lerTudo<LinhaVideo>("videos_canonicos?select=video_id,slug,novo_titulo,nova_descricao,mini_resumo", "slug.asc"),

    // Só para continuar servindo os endereços curtos que já existiam, cada um com o mesmo vídeo.
    lerTudo<LinhaCurto>("videos_sitemap?select=slug,video_id", "slug.asc"),

    // Receitas públicas: v_receitas.
    lerTudo<LinhaReceita>("v_receitas?select=slug,titulo,resumo,ingredientes,modo_preparo,imagem_url", "slug.asc"),

    lerTudo<LinhaLoja>("portal_terapeutas?select=*&status=eq.aprovado", "id.asc"),

    lerTudo<LinhaLoja>(
      "produtos?select=slug,nome_display,resumo_curto,imagem_url,preco_pix,preco_normal&ativo=eq.true",
      "slug.asc",
      "loja"
    ),

    lerTudo<LinhaLoja>(
      "kits?select=slug,nome,descricao_curta,imagem_url,preco_pix,preco_normal&ativo=eq.true",
      "slug.asc",
      "loja"
    ),

    lerTudo<LinhaLoja>("categorias?select=slug,nome,descricao", "slug.asc", "loja"),

    // Endereços antigos que mudaram: cada um ganha uma página que manda para o novo.
    lerTudo<LinhaRedirecionamento>("redirecionamentos?select=de_path,para_path&ativo=eq.true", "de_path.asc"),

    // Registros akáshicos: página própria com noindex escrito no HTML.
    lerTudo<LinhaRegistro>("registros_akashikos_publicos?select=id,titulo", "id.asc"),
  ]);

  return { artigos, videos, curtos, receitas, terapeutas, produtos, kits, categorias, redirecionamentos, registros };
}
