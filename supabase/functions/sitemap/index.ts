// Edge Function: sitemap
// Gera /sitemap.xml dinâmico (rotas estáticas + portal_conteudo + aulas_ao_vivo + portal_terapeutas)
import { createClient } from "npm:@supabase/supabase-js@2";

const BASE_URL = "https://portalayurveda.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Entry = {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/teste-de-dosha", changefreq: "monthly", priority: "0.9" },
  { path: "/biblioteca", changefreq: "weekly", priority: "0.8" },
  { path: "/biblioteca/horarios", priority: "0.5" },
  ...(["vata", "pitta", "kapha"].flatMap((d) => [
    { path: `/biblioteca/${d}`, changefreq: "monthly" as const, priority: "0.7" },
    { path: `/biblioteca/${d}/horarios`, priority: "0.5" },
    { path: `/biblioteca/${d}/alimentacao`, priority: "0.5" },
    { path: `/biblioteca/${d}/remedios`, priority: "0.5" },
    { path: `/biblioteca/${d}/videos`, priority: "0.5" },
    { path: `/biblioteca/${d}/avancado`, priority: "0.5" },
  ])),
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/curso/alimentacao", changefreq: "monthly", priority: "0.7" },
  { path: "/curso/formacao", changefreq: "monthly", priority: "0.7" },
  { path: "/curso/rotinas", changefreq: "monthly", priority: "0.7" },
  { path: "/terapeutas-do-brasil", changefreq: "weekly", priority: "0.8" },
  { path: "/terapeutas-do-brasil/cadastro", priority: "0.5" },
  { path: "/samkhya", changefreq: "weekly", priority: "0.8" },
  { path: "/samkhya/kits", changefreq: "weekly", priority: "0.7" },
  { path: "/samkhya/todos", changefreq: "weekly", priority: "0.7" },
  { path: "/assinar", changefreq: "monthly", priority: "0.8" },
  { path: "/contato", changefreq: "monthly", priority: "0.5" },
  { path: "/politica-de-privacidade", priority: "0.3" },
  { path: "/termos-de-uso", priority: "0.3" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function iso(date: unknown): string | undefined {
  if (!date || typeof date !== "string") return undefined;
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function renderUrl(e: Entry): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(BASE_URL + e.path)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

type DynResult = { entries: Entry[]; complete: boolean };

async function dynamicEntries(): Promise<DynResult> {
  // Usa service role para bypass de RLS e garantir leitura consistente
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const entries: Entry[] = [];
  let complete = true;

  // Artigos publicados
  try {
    const { data, error } = await supabase
      .from("portal_conteudo")
      .select("link_do_artigo, created_at")
      .eq("status", "published")
      .not("link_do_artigo", "is", null)
      .limit(5000);
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length === 0) {
      console.warn("portal_conteudo retornou 0 linhas — marcando resposta como incompleta");
      complete = false;
    }
    for (const row of rows) {
      if (!row.link_do_artigo) continue;
      entries.push({
        path: `/blog/${row.link_do_artigo}`,
        lastmod: iso(row.created_at),
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  } catch (err) {
    console.error("portal_conteudo error", err);
    complete = false;
  }

  // Aulas ao vivo
  try {
    const { data, error } = await supabase
      .from("aulas_ao_vivo")
      .select("slug, created_at")
      .limit(500);
    if (error) throw error;
    for (const row of data ?? []) {
      if (!row.slug) continue;
      entries.push({
        path: `/aula/${row.slug}`,
        lastmod: iso(row.created_at),
        changefreq: "monthly",
        priority: "0.7",
      });
    }
  } catch (err) {
    console.error("aulas_ao_vivo error", err);
    complete = false;
  }

  // Terapeutas aprovados (mantém URLs já indexadas)
  try {
    const { data, error } = await supabase
      .from("portal_terapeutas")
      .select("*")
      .eq("status", "aprovado")
      .limit(2000);
    if (error) throw error;
    for (const t of (data ?? []) as Record<string, unknown>[]) {
      const slug = t["terapeutas(dinamica)"];
      if (!slug || typeof slug !== "string") continue;
      entries.push({
        path: `/terapeutas-do-brasil/${slug}`,
        lastmod: iso(t["updated date"]),
        changefreq: "monthly",
        priority: "0.6",
      });
    }
  } catch (err) {
    console.error("portal_terapeutas error", err);
    complete = false;
  }

  return { entries, complete };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { entries: dyn, complete } = await dynamicEntries();
  const all = [...staticEntries, ...dyn];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...all.map(renderUrl),
    "</urlset>",
  ].join("\n");

  // Se algo falhou ou veio vazio, NÃO permitir que a CDN cache a resposta capenga.
  const cacheControl = complete
    ? "public, max-age=600, s-maxage=600, stale-while-revalidate=3600"
    : "no-store";

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
});
