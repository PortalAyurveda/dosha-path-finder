// Edge Function: sitemap
// Gera /sitemap.xml dinâmico (rotas fixas + portal_conteudo + videos_seo + portal_terapeutas)
import { createClient } from "npm:@supabase/supabase-js@2";

const BASE_URL = "https://portalayurveda.com";

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

const staticEntries: Entry[] = [
  { loc: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/teste-de-dosha`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/terapeutas-do-brasil`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/samkhya`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/biblioteca`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/cursos`, changefreq: "weekly", priority: "1.0" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(date: unknown): string | undefined {
  if (!date || typeof date !== "string") return undefined;
  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderUrl(e: Entry): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(e.loc)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ].filter(Boolean).join("\n");
}

async function dynamicEntries(): Promise<Entry[]> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const [artigosRes, videosRes, terapeutasRes] = await Promise.all([
    supabase
      .from("portal_conteudo")
      .select("link_do_artigo, created_at")
      .eq("status", "published")
      .not("link_do_artigo", "is", null)
      .limit(10000),
    supabase
      .from("videos_seo")
      .select("video_id, criado_em")
      .not("video_id", "is", null)
      .limit(10000),
    supabase
      .from("portal_terapeutas")
      .select("nome, status")
      .eq("status", "aprovado")
      .not("nome", "is", null)
      .limit(5000),
  ]);

  const entries: Entry[] = [];

  if (artigosRes.error) console.error("portal_conteudo error", artigosRes.error);
  for (const row of artigosRes.data ?? []) {
    if (!row.link_do_artigo) continue;
    entries.push({
      loc: `${BASE_URL}/blog/${row.link_do_artigo}`,
      lastmod: isoDate(row.created_at),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  if (videosRes.error) console.error("videos_seo error", videosRes.error);
  for (const row of videosRes.data ?? []) {
    if (!row.video_id) continue;
    entries.push({
      loc: `${BASE_URL}/video/${row.video_id}`,
      lastmod: isoDate((row as any).criado_em),
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  if (terapeutasRes.error) console.error("portal_terapeutas error", terapeutasRes.error);
  const seenSlugs = new Set<string>();
  for (const row of terapeutasRes.data ?? []) {
    const nome = (row as any).nome as string | null;
    if (!nome) continue;
    const slug = slugify(nome);
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    entries.push({
      loc: `${BASE_URL}/terapeutas/${slug}`,
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  return entries;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const dyn = await dynamicEntries();
    const all = [...staticEntries, ...dyn];
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...all.map(renderUrl),
      "</urlset>",
    ].join("\n");

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("sitemap error", err);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }
});
