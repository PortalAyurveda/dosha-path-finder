import { createClient } from "npm:@supabase/supabase-js@2";
const BASE_URL = "https://portalayurveda.com";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
type Entry = { loc: string; lastmod?: string; changefreq?: "always"|"hourly"|"daily"|"weekly"|"monthly"|"yearly"|"never"; priority?: string; };
const staticEntries: Entry[] = [
  { loc: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/teste-de-dosha`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/terapeutas-do-brasil`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/samkhya`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/biblioteca`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/cursos`, changefreq: "weekly", priority: "1.0" },
];
function escapeXml(s: string): string { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"); }
function isoDate(date: unknown): string | undefined { if (!date || typeof date !== "string") return undefined; const d = new Date(date); if (isNaN(d.getTime())) return undefined; return d.toISOString().slice(0,10); }
function slugifyNome(input: string): string { return input.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,""); }
function videoSlug(title: string): string { if (!title) return ""; const base = title.includes(":") ? title.split(":")[0] : title.split(/\s+/).slice(0,5).join(" "); return base.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,""); }
function renderUrl(e: Entry): string { return ["  <url>", `    <loc>${escapeXml(e.loc)}</loc>`, e.lastmod?`    <lastmod>${e.lastmod}</lastmod>`:null, e.changefreq?`    <changefreq>${e.changefreq}</changefreq>`:null, e.priority?`    <priority>${e.priority}</priority>`:null, "  </url>"].filter(Boolean).join("\n"); }
async function dynamicEntries(): Promise<Entry[]> {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!);
  const VIDEO_TABLES = ["portal_oficial","portal_receitas","portal_lives","portal_vata","portal_pitta","portal_kapha"];
  const [artigosRes, terapeutasRes, ...videosResults] = await Promise.all([
    supabase.from("portal_conteudo").select("link_do_artigo, created_at").eq("status","published").not("link_do_artigo","is",null).limit(10000),
    supabase.from("portal_terapeutas").select("nome, status").eq("status","aprovado").not("nome","is",null).limit(5000),
    ...VIDEO_TABLES.map((t) => supabase.from(t).select("video_id, novo_titulo, criado_em").not("novo_titulo","is",null).limit(10000)),
  ]);
  const entries: Entry[] = [];
  for (const row of artigosRes.data ?? []) { if (!row.link_do_artigo) continue; entries.push({ loc: `${BASE_URL}/blog/${row.link_do_artigo}`, lastmod: isoDate(row.created_at), changefreq: "weekly", priority: "0.8" }); }
  const bySlug = new Map<string, string | undefined>();
  videosResults.forEach((res) => { if (res.error) return; for (const row of res.data ?? []) { const titulo = (row as any).novo_titulo as string | null; if (!titulo) continue; const slug = videoSlug(titulo); if (!slug) continue; const lm = isoDate((row as any).criado_em); const prev = bySlug.get(slug); if (prev === undefined || (lm && (!prev || lm > prev))) bySlug.set(slug, lm ?? prev); else if (!bySlug.has(slug)) bySlug.set(slug, lm); } });
  for (const [slug, lm] of bySlug) entries.push({ loc: `${BASE_URL}/video/${slug}`, lastmod: lm, changefreq: "monthly", priority: "0.7" });
  const seenSlugs = new Set<string>();
  for (const row of terapeutasRes.data ?? []) { const nome = (row as any).nome as string | null; if (!nome) continue; const slug = slugifyNome(nome); if (!slug || seenSlugs.has(slug)) continue; seenSlugs.add(slug); entries.push({ loc: `${BASE_URL}/terapeutas/${slug}`, changefreq: "monthly", priority: "0.6" }); }
  return entries;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const dyn = await dynamicEntries();
    const all = [...staticEntries, ...dyn];
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...all.map(renderUrl), "</urlset>"].join("\n");
    return new Response(xml, { headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=3600" } });
  } catch (err) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', { status: 500, headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" } });
  }
});
