// Pós-build: gera HTML estático por rota com OG/title/description corretos.
// Crawlers (WhatsApp, Facebook, LinkedIn, Slack, Telegram, X) não executam JS,
// então recebem o HTML cru. Sem isto, todos os links compartilhados mostram
// o mesmo título/descrição genérico do index.html.
//
// Roda como `postbuild` em package.json. Para cada rota listada (estática ou
// dinâmica via Supabase), escreve dist/<rota>/index.html com tags substituídas.
// Usuários reais continuam recebendo o SPA normalmente.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const BASE_URL = "https://portalayurveda.com";
const DEFAULT_OG = `${BASE_URL}/og-image.jpg`;
const SUPABASE_URL = "https://fwezkasjfguarjmjxifh.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZXprYXNqZmd1YXJqbWp4aWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDI3MjEsImV4cCI6MjA4MzgxODcyMX0.sceKx2-SX8HZT_UaI2cHPnqkFZUmVPXaZwI9051Mzms";

interface Route {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "profile" | "product";
}

const staticRoutes: Route[] = [
  {
    path: "/",
    title: "Portal Ayurveda — Teste de Dosha, Vídeos, Artigos e Akasha IA",
    description:
      "Descubra seu dosha em 5 minutos e receba um portal de Ayurveda personalizado: vídeos, artigos, rotinas, alimentação e a inteligência Akasha guiando seus próximos passos.",
  },
  {
    path: "/teste-de-dosha",
    title: "Teste de Dosha gratuito — Portal Ayurveda",
    description:
      "Faça o teste de dosha do Portal Ayurveda em 5 minutos e descubra seu tipo (Vata, Pitta ou Kapha). Receba conteúdo personalizado de alimentação, rotinas e equilíbrio.",
  },
  {
    path: "/biblioteca",
    title: "Biblioteca Ayurveda — vídeos, artigos e rotinas por dosha",
    description:
      "Explore a biblioteca completa do Portal Ayurveda: vídeos, artigos, rotinas, alimentação e remédios organizados por dosha (Vata, Pitta, Kapha).",
  },
  { path: "/biblioteca/vata", title: "Biblioteca Vata — Portal Ayurveda", description: "Conteúdo, rotinas, alimentação e vídeos para equilibrar o dosha Vata." },
  { path: "/biblioteca/pitta", title: "Biblioteca Pitta — Portal Ayurveda", description: "Conteúdo, rotinas, alimentação e vídeos para equilibrar o dosha Pitta." },
  { path: "/biblioteca/kapha", title: "Biblioteca Kapha — Portal Ayurveda", description: "Conteúdo, rotinas, alimentação e vídeos para equilibrar o dosha Kapha." },
  {
    path: "/blog",
    title: "Blog — Portal Ayurveda",
    description:
      "Artigos sobre Ayurveda em português: doshas, alimentação, rotinas, plantas, terapias e filosofia. Atualizado semanalmente.",
  },
  {
    path: "/contato",
    title: "Contato — Portal Ayurveda",
    description:
      "Entre em contato com o Portal Ayurveda. Tire dúvidas, envie sugestões ou fale sobre parcerias.",
  },
  {
    path: "/assinar",
    title: "Akasha Premium — Portal Ayurveda",
    description:
      "Assine o Akasha Premium e tenha acesso ilimitado à biblioteca, rotinas personalizadas e à inteligência Akasha do Portal Ayurveda.",
  },
  {
    path: "/curso/alimentacao",
    title: "Curso de Alimentação Ayurvédica — Portal Ayurveda",
    description:
      "Aprenda a base da alimentação ayurvédica: rasas, qualidades, como cozinhar para seu dosha e equilibrar agni.",
  },
  {
    path: "/curso/formacao",
    title: "Formação em Ayurveda — Portal Ayurveda",
    description:
      "Conheça a formação completa em Ayurveda do Portal: estrutura, módulos, certificação e próximos passos.",
  },
  {
    path: "/curso/rotinas",
    title: "Rotinas Ayurvédicas (Dinacharya) — Portal Ayurveda",
    description:
      "Construa sua rotina diária ayurvédica passo a passo: despertar, higiene, alimentação, trabalho, sono.",
  },
  {
    path: "/terapeutas-do-brasil",
    title: "Terapeutas do Brasil — Portal Ayurveda",
    description:
      "Encontre terapeutas ayurvédicos no Brasil. Filtre por estado, cidade e especialidade.",
  },
  {
    path: "/samkhya",
    title: "Samkhya — Loja do Portal Ayurveda",
    description:
      "Produtos selecionados de Ayurveda: óleos, ervas, kits e ferramentas para sua prática diária.",
  },
  { path: "/samkhya/kits", title: "Kits Samkhya — Portal Ayurveda", description: "Kits ayurvédicos curados para começar sua prática." },
  { path: "/samkhya/todos", title: "Todos os produtos — Samkhya", description: "Catálogo completo de produtos ayurvédicos da loja Samkhya." },
  { path: "/politica-de-privacidade", title: "Política de Privacidade — Portal Ayurveda", description: "Como o Portal Ayurveda coleta, usa e protege seus dados pessoais." },
  { path: "/termos-de-uso", title: "Termos de Uso — Portal Ayurveda", description: "Termos e condições de uso do Portal Ayurveda." },
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
      console.warn(`[prerender] fetch ${query} → ${res.status}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.warn(`[prerender] fetch ${query} failed`, err);
    return [];
  }
}

function clean(text: unknown, max = 200): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function dynamicRoutes(): Promise<Route[]> {
  const routes: Route[] = [];

  // Artigos publicados (portal_conteudo com link_do_artigo, tipo artigo)
  const posts = await fetchRest<{
    title: string;
    summary: string;
    meta_description: string;
    image_url: string;
    link_do_artigo: string;
  }>(
    "portal_conteudo?select=title,summary,meta_description,image_url,link_do_artigo&status=eq.publicado&link_do_artigo=not.is.null"
  );
  for (const p of posts) {
    if (!p.link_do_artigo) continue;
    const desc = clean(p.meta_description || p.summary, 160);
    if (!p.title || !desc) continue;
    routes.push({
      path: `/blog/${p.link_do_artigo}`,
      title: `${clean(p.title, 80)} — Portal Ayurveda`,
      description: desc,
      image: p.image_url || DEFAULT_OG,
      type: "article",
    });
  }

  // Terapeutas aprovados
  const terapeutas = await fetchRest<Record<string, any>>(
    `portal_terapeutas?select=*&status=eq.aprovado`
  );
  for (const t of terapeutas) {
    const slug = t["terapeutas(dinamica)"];
    if (!slug || typeof slug !== "string") continue;
    const nome = clean(t.nome, 80) || "Terapeuta Ayurveda";
    const especialidade = clean(t.especialidade, 80);
    const cidade = clean(t.cidade, 60);
    const estado = clean(t.estado, 30);
    const local = [cidade, estado].filter(Boolean).join("/");
    const resumo = clean(t.resumo, 160);
    const desc =
      resumo ||
      `${nome}${especialidade ? " — " + especialidade : ""}${local ? " em " + local : ""}. Encontre terapeutas ayurvédicos no Portal Ayurveda.`;
    routes.push({
      path: `/terapeutas-do-brasil/${slug}`,
      title: `${nome}${local ? " (" + local + ")" : ""} — Terapeuta Ayurveda`,
      description: desc.slice(0, 200),
      image: t.imagem || t["imagem.1"] || DEFAULT_OG,
      type: "profile",
    });
  }

  return routes;
}

function renderHtml(template: string, route: Route): string {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const image = escapeHtml(route.image || DEFAULT_OG);
  const type = route.type || "website";

  let html = template;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // meta name=description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`
  );

  // og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`
  );

  // og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`
  );

  // og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`
  );

  // og:image (+ secure_url)
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${image}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image:secure_url" content="${image}" />`
  );

  // og:type
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${type}" />`
  );

  // twitter:title / description / image
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${image}" />`
  );

  // canonical: injetar no <head>
  html = html.replace(
    /<\/head>/,
    `    <link rel="canonical" href="${url}" />\n  </head>`
  );

  return html;
}

async function main() {
  const distDir = resolve("dist");
  const templatePath = resolve(distDir, "index.html");

  if (!existsSync(templatePath)) {
    console.warn("[prerender] dist/index.html não existe. Pulando.");
    return;
  }

  const template = readFileSync(templatePath, "utf8");

  const dynamic = await dynamicRoutes();
  const all = [...staticRoutes, ...dynamic];

  let written = 0;
  for (const route of all) {
    if (route.path === "/") continue; // index.html já é o root

    const outDir = resolve(distDir, route.path.replace(/^\//, ""));
    const outFile = resolve(outDir, "index.html");

    try {
      mkdirSync(dirname(outFile), { recursive: true });
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, renderHtml(template, route));
      written++;
    } catch (err) {
      console.warn(`[prerender] falha em ${route.path}:`, err);
    }
  }

  // Também sobrescreve dist/index.html com tags da home (caso o template não esteja com a home explicitamente)
  const home = staticRoutes.find((r) => r.path === "/");
  if (home) {
    writeFileSync(templatePath, renderHtml(template, home));
  }

  console.log(
    `[prerender] ${written} rotas escritas (${staticRoutes.length - 1} estáticas + ${dynamic.length} dinâmicas)`
  );
}

main().catch((err) => {
  console.error("[prerender] falhou", err);
  process.exit(0); // não quebrar o build
});
