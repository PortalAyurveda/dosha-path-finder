// SITEMAP DO PORTAL AYURVEDA — v26 (20/09/2026)
//
// REGRA-RAIZ (não quebrar sem ler):
// Uma URL só entra aqui se as TRÊS coisas forem verdade ao mesmo tempo:
//   1. a página existe de verdade (tem linha no banco, ou é rota fixa do App.tsx);
//   2. o build (scripts/prerender-og.ts no Lovable) escreve um HTML próprio pra ela;
//   3. nada no site marca ela como "não indexe".
// Corolário: toda rota nova entra AQUI e em `staticRoutes` do prerender no MESMO patch.
// O prerender confere no fim da build que toda URL daqui tem arquivo, e derruba a build se faltarem muitos.
//
// ESTE ARQUIVO TEM QUE SER IGUAL AO QUE ESTÁ IMPLANTADO. A Lovable reimplanta as funções a
// partir do repositório ao publicar (aconteceu em 28/06/2026). Mudança feita só no Supabase
// volta atrás na publicação seguinte.
//
// MUDANÇAS DA v25 -> v26:
// - UMA REGRA SÓ DE ENDEREÇO DE VÍDEO: a view `videos_canonicos` (slug longo, único). A função
//   `videoSlug()` que montava o endereço curto foi APAGADA daqui de propósito. Os endereços
//   antigos (curto e id do YouTube) continuam como página com canonical para o longo e NÃO
//   entram no sitemap.
// - TERAPEUTA vem da coluna "terapeutas(dinamica)", a mesma que o prerender usa.
// - PAGINAÇÃO de 500 em 500 em todas as leituras (o PostgREST corta em 1.000 em silêncio).
// - RECEITAS entram (view v_receitas, /receita/{slug}).
// - 13 rotas fixas novas, todas com HTML próprio no mesmo patch: /biblioteca/horarios,
//   /textos-classicos, /curso/diagnostico, /curso/dravya-guna e as 9 abas dos guias.
//
// DECISÃO GRAVADA (23/08/2026): os /registros-akashikos NÃO entram aqui.

import { createClient } from "npm:@supabase/supabase-js@2";

const BASE_URL = "https://portalayurveda.com";

// Pisos por família: pegam "zero" e "quase zero", não vigiam o número exato.
const PISOS: Record<string, number> = {
  blog: 250,       // hoje: 346
  video: 800,      // hoje: 937
  receita: 100,    // hoje: 128
  terapeuta: 10,   // hoje: 16
  loja: 20,        // hoje: 26
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Entry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

// Só entram rotas que o prerender-og.ts realmente assa (lista staticRoutes de lá).
const staticEntries: Entry[] = [
  { loc: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/teste-de-dosha`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/detox`, changefreq: "daily", priority: "0.9" },
  { loc: `${BASE_URL}/assinar`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/blog`, changefreq: "daily", priority: "0.9" },
  { loc: `${BASE_URL}/biblioteca`, changefreq: "weekly", priority: "0.9" },
  { loc: `${BASE_URL}/biblioteca/vata`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/biblioteca/vata/horarios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/vata/alimentacao`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/vata/remedios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/pitta`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/biblioteca/pitta/horarios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/pitta/alimentacao`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/pitta/remedios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/kapha`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/biblioteca/kapha/horarios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/kapha/alimentacao`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/kapha/remedios`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/biblioteca/horarios`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/textos-classicos`, changefreq: "weekly", priority: "0.7" },
  { loc: `${BASE_URL}/cursos`, changefreq: "weekly", priority: "0.9" },
  { loc: `${BASE_URL}/curso/formacao`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/curso/alimentacao`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/curso/rotinas`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/curso/diagnostico`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/curso/dravya-guna`, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/terapeutas-do-brasil`, changefreq: "weekly", priority: "0.9" },
  { loc: `${BASE_URL}/samkhya`, changefreq: "weekly", priority: "0.9" },
  { loc: `${BASE_URL}/samkhya/todos`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/samkhya/kits`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/contato`, changefreq: "monthly", priority: "0.5" },
  { loc: `${BASE_URL}/politica-de-privacidade`, changefreq: "yearly", priority: "0.3" },
  { loc: `${BASE_URL}/termos-de-uso`, changefreq: "yearly", priority: "0.3" },
];

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/\u003c/g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function isoDate(date: unknown): string | undefined {
  if (!date || typeof date !== "string") return undefined;
  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function renderUrl(e: Entry): string {
  return [
    "  \u003curl>",
    `    \u003cloc>${escapeXml(e.loc)}\u003c/loc>`,
    e.lastmod ? `    \u003clastmod>${e.lastmod}\u003c/lastmod>` : null,
    e.changefreq ? `    \u003cchangefreq>${e.changefreq}\u003c/changefreq>` : null,
    e.priority ? `    \u003cpriority>${e.priority}\u003c/priority>` : null,
    "  \u003c/url>",
  ].filter(Boolean).join("\n");
}

type Resultado = { entries: Entry[]; counts: Record<string, number>; erros: string[] };

// Lê a tabela inteira de 500 em 500. O PostgREST corta em 1.000 e o corte é SILENCIOSO.
async function lerTudo<T = Record<string, unknown>>(
  nome: string,
  fazer: (de: number, ate: number) => PromiseLike<{ data: unknown; error: unknown }>,
  erros: string[],
): Promise<T[]> {
  const PAGINA = 500;
  const LIMITE = 40000;
  const out: T[] = [];
  for (let de = 0; de < LIMITE; de += PAGINA) {
    const res = await fazer(de, de + PAGINA - 1);
    if (res && res.error) {
      erros.push(`${nome}: ${String((res.error as { message?: string })?.message ?? res.error).slice(0, 160)}`);
      return out;
    }
    const linhas = (res?.data ?? []) as T[];
    out.push(...linhas);
    if (linhas.length < PAGINA) return out;
  }
  erros.push(`${nome}: passou de ${LIMITE} linhas, paginação interrompida`);
  return out;
}

async function dynamicEntries(supabase: ReturnType<typeof createClient>): Promise<Resultado> {
  const loja = supabase.schema("loja");
  const erros: string[] = [];
  // A data de cada endereço é a data desta geração: o HTML dessas famílias muda a cada publicação.
  const hoje = new Date().toISOString().slice(0, 10);

  const [artigos, videos, receitas, terapeutas, produtos, kits, categorias] = await Promise.all([
    lerTudo<{ link_do_artigo?: string; created_at?: string; id?: string }>(
      "portal_conteudo",
      (de, ate) => supabase.from("portal_conteudo").select("id, link_do_artigo, created_at").eq("status", "published").not("link_do_artigo", "is", null).order("id", { ascending: true }).range(de, ate),
      erros,
    ),
    // ÚNICA fonte de endereço de vídeo do Portal.
    lerTudo<{ slug?: string }>(
      "videos_canonicos",
      (de, ate) => supabase.from("videos_canonicos").select("slug").not("slug", "is", null).order("slug", { ascending: true }).range(de, ate),
      erros,
    ),
    lerTudo<{ slug?: string }>(
      "v_receitas",
      (de, ate) => supabase.from("v_receitas").select("slug").not("slug", "is", null).order("slug", { ascending: true }).range(de, ate),
      erros,
    ),
    // Mesma coluna que o prerender usa. Não recalcular a partir do nome.
    lerTudo<Record<string, unknown>>(
      "portal_terapeutas",
      (de, ate) => supabase.from("portal_terapeutas").select('"terapeutas(dinamica)", id').eq("status", "aprovado").order("id", { ascending: true }).range(de, ate),
      erros,
    ),
    lerTudo<{ slug?: string; created_at?: string }>(
      "loja.produtos",
      (de, ate) => loja.from("produtos").select("slug, created_at").eq("ativo", true).not("slug", "is", null).order("slug", { ascending: true }).range(de, ate),
      erros,
    ),
    lerTudo<{ slug?: string; created_at?: string }>(
      "loja.kits",
      (de, ate) => loja.from("kits").select("slug, created_at").eq("ativo", true).not("slug", "is", null).order("slug", { ascending: true }).range(de, ate),
      erros,
    ),
    lerTudo<{ slug?: string }>(
      "loja.categorias",
      (de, ate) => loja.from("categorias").select("slug").not("slug", "is", null).order("slug", { ascending: true }).range(de, ate),
      erros,
    ),
  ]);

  const entries: Entry[] = [];
  const counts: Record<string, number> = { blog: 0, video: 0, receita: 0, terapeuta: 0, produto: 0, kit: 0, categoria: 0, loja: 0 };

  const vistosBlog = new Set<string>();
  for (const row of artigos) {
    const slug = row.link_do_artigo;
    if (!slug || vistosBlog.has(slug)) continue;
    vistosBlog.add(slug);
    entries.push({ loc: `${BASE_URL}/blog/${slug}`, lastmod: hoje, changefreq: "weekly", priority: "0.8" });
    counts.blog++;
  }

  const vistosVideo = new Set<string>();
  for (const row of videos) {
    const slug = row.slug;
    if (!slug || vistosVideo.has(slug)) continue;
    vistosVideo.add(slug);
    entries.push({ loc: `${BASE_URL}/video/${slug}`, lastmod: hoje, changefreq: "monthly", priority: "0.7" });
    counts.video++;
  }

  const vistosReceita = new Set<string>();
  for (const row of receitas) {
    const slug = row.slug;
    if (!slug || vistosReceita.has(slug)) continue;
    vistosReceita.add(slug);
    entries.push({ loc: `${BASE_URL}/receita/${slug}`, lastmod: hoje, changefreq: "monthly", priority: "0.7" });
    counts.receita++;
  }

  const vistosTerapeuta = new Set<string>();
  for (const row of terapeutas) {
    const slug = row["terapeutas(dinamica)"];
    if (!slug || typeof slug !== "string" || vistosTerapeuta.has(slug)) continue;
    vistosTerapeuta.add(slug);
    entries.push({ loc: `${BASE_URL}/terapeutas/${slug}`, lastmod: hoje, changefreq: "monthly", priority: "0.6" });
    counts.terapeuta++;
  }

  const empurrarLoja = (rows: { slug?: string; created_at?: string }[], prefixo: string, chave: string, prio: string) => {
    const vistos = new Set<string>();
    for (const row of rows ?? []) {
      const slug = row.slug;
      if (!slug || vistos.has(slug)) continue;
      vistos.add(slug);
      entries.push({ loc: `${BASE_URL}${prefixo}/${slug}`, lastmod: isoDate(row.created_at), changefreq: "weekly", priority: prio });
      counts[chave]++;
      counts.loja++;
    }
  };
  empurrarLoja(produtos, "/samkhya/produto", "produto", "0.8");
  empurrarLoja(kits, "/samkhya/kits", "kit", "0.8");
  empurrarLoja(categorias, "/samkhya/categoria", "categoria", "0.6");

  return { entries, counts, erros };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  // Serve a última versão boa quando a geração de agora não passou nos pisos.
  const servirUltimoBom = async (motivo: string): Promise<Response> => {
    const { data } = await supabase.from("sitemap_ultimo_bom").select("xml, urls, gravado_em").eq("id", 1).maybeSingle();
    const guardado = data as { xml?: string; urls?: number; gravado_em?: string } | null;
    if (guardado?.xml) {
      const aviso = `\u003c!-- ATENCAO: esta e a ultima versao boa, de ${guardado.gravado_em}, com ${guardado.urls} URLs. A geracao de agora foi recusada. Motivo: ${motivo.replace(/--/g, "-")} -->`;
      const xml = guardado.xml.replace("\u003curlset", `${aviso}\n\u003curlset`);
      return new Response(xml, {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Sitemap-Estado": "ultimo-bom", "X-Sitemap-Motivo": motivo.slice(0, 300) },
      });
    }
    return new Response(
      `\u003c?xml version="1.0" encoding="UTF-8"?>\n\u003c!-- sitemap recusado e sem versao boa guardada. Motivo: ${motivo.replace(/--/g, "-")} -->`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "X-Sitemap-Estado": "sem-nada" } },
    );
  };

  try {
    const { entries, counts, erros } = await dynamicEntries(supabase);

    const abaixo: string[] = [];
    for (const [familia, piso] of Object.entries(PISOS)) {
      if ((counts[familia] ?? 0) < piso) abaixo.push(`${familia}=${counts[familia] ?? 0} (piso ${piso})`);
    }
    if (erros.length || abaixo.length) {
      const motivo = [erros.length ? `erros de leitura: ${erros.join(" | ")}` : "", abaixo.length ? `abaixo do piso: ${abaixo.join(", ")}` : ""].filter(Boolean).join(" ; ");
      return await servirUltimoBom(motivo);
    }

    const all = [...staticEntries, ...entries];
    const resumo = Object.entries(counts).filter(([k]) => k !== "loja").map(([k, v]) => `${k}=${v}`).join(" ");
    const xml = [
      '\u003c?xml version="1.0" encoding="UTF-8"?>',
      '\u003curlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...all.map(renderUrl),
      "\u003c/urlset>",
      `\u003c!-- v26 | ${all.length} URLs | ${staticEntries.length} fixas | ${resumo} -->`,
    ].join("\n");

    await supabase.from("sitemap_ultimo_bom").upsert({ id: 1, xml, urls: all.length, contagens: counts, gravado_em: new Date().toISOString() });

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=3600",
        "X-Sitemap-Estado": "gerado",
        "X-Sitemap-Versao": "v26",
        "X-Sitemap-Counts": resumo.replace(/ /g, ";"),
      },
    });
  } catch (err) {
    return await servirUltimoBom(`excecao: ${String(err).slice(0, 200)}`);
  }
});
