// Gera public/sitemap.xml com rotas estáticas + conteúdo dinâmico do Supabase.
// Roda automaticamente nos hooks predev/prebuild do package.json.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://portalayurveda.com";
const SUPABASE_URL = "https://fwezkasjfguarjmjxifh.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZXprYXNqZmd1YXJqbWp4aWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDI3MjEsImV4cCI6MjA4MzgxODcyMX0.sceKx2-SX8HZT_UaI2cHPnqkFZUmVPXaZwI9051Mzms";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always" | "hourly" | "daily" | "weekly"
    | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/teste-de-dosha", changefreq: "monthly", priority: "0.9" },
  { path: "/biblioteca", changefreq: "weekly", priority: "0.8" },
  { path: "/biblioteca/vata", changefreq: "monthly", priority: "0.7" },
  { path: "/biblioteca/vata/horarios", priority: "0.5" },
  { path: "/biblioteca/vata/alimentacao", priority: "0.5" },
  { path: "/biblioteca/vata/remedios", priority: "0.5" },
  { path: "/biblioteca/vata/videos", priority: "0.5" },
  { path: "/biblioteca/vata/avancado", priority: "0.5" },
  { path: "/biblioteca/pitta", changefreq: "monthly", priority: "0.7" },
  { path: "/biblioteca/pitta/horarios", priority: "0.5" },
  { path: "/biblioteca/pitta/alimentacao", priority: "0.5" },
  { path: "/biblioteca/pitta/remedios", priority: "0.5" },
  { path: "/biblioteca/pitta/videos", priority: "0.5" },
  { path: "/biblioteca/pitta/avancado", priority: "0.5" },
  { path: "/biblioteca/kapha", changefreq: "monthly", priority: "0.7" },
  { path: "/biblioteca/kapha/horarios", priority: "0.5" },
  { path: "/biblioteca/kapha/alimentacao", priority: "0.5" },
  { path: "/biblioteca/kapha/remedios", priority: "0.5" },
  { path: "/biblioteca/kapha/videos", priority: "0.5" },
  { path: "/biblioteca/kapha/avancado", priority: "0.5" },
  { path: "/biblioteca/horarios", priority: "0.5" },
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
  { path: "/politica-de-privacidade", priority: "0.3" },
  { path: "/termos-de-uso", priority: "0.3" },
];

async function fetchRest<T = any>(query: string): Promise<T[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] fetch ${query} → ${res.status}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.warn(`[sitemap] fetch ${query} failed`, err);
    return [];
  }
}

function iso(date: unknown): string | undefined {
  if (!date || typeof date !== "string") return undefined;
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function dynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  const posts = await fetchRest<{ link_do_artigo: string; created_at?: string }>(
    "portal_conteudo?select=link_do_artigo,created_at&status=eq.publicado&link_do_artigo=not.is.null"
  );
  for (const p of posts) {
    if (!p.link_do_artigo) continue;
    entries.push({
      path: `/blog/${p.link_do_artigo}`,
      lastmod: iso(p.created_at),
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  // Terapeutas: as colunas têm parênteses/espaços, então pegamos tudo
  const terapeutas = await fetchRest<Record<string, any>>(
    `portal_terapeutas?select=*&status=eq.aprovado`
  );
  for (const t of terapeutas) {
    const slug = t["terapeutas(dinamica)"];
    if (!slug || typeof slug !== "string") continue;
    entries.push({
      path: `/terapeutas-do-brasil/${slug}`,
      lastmod: iso(t["updated date"]),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const dynamic = await dynamicEntries();
  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all));
  console.log(
    `sitemap.xml written (${all.length} entries: ${staticEntries.length} static + ${dynamic.length} dynamic)`
  );
}

main().catch((err) => {
  console.error("[sitemap] failed", err);
  process.exit(0); // não quebrar o build se o Supabase estiver fora
});
