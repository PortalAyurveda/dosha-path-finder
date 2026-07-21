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
const SUPABASE_URL = "https://api.portalayurveda.com";
const SITEMAP_SOURCE = `${SUPABASE_URL}/functions/v1/sitemap`;
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZXprYXNqZmd1YXJqbWp4aWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDI3MjEsImV4cCI6MjA4MzgxODcyMX0.sceKx2-SX8HZT_UaI2cHPnqkFZUmVPXaZwI9051Mzms";

interface Route {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "profile" | "product" | "video.other";
  jsonld?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

// FAQ da página /assinar — precisa ficar sincronizado com src/pages/Assinar.tsx
const ASSINAR_FAQ: { q: string; a: string }[] = [
  { q: "Preciso já entender de Ayurveda?", a: "Você só precisa fazer o teste de dosha gratuito — leva 5 minutos. O Portal traduz todo o resto em passos simples: o que comer, quando, por quê. O Ayurveda parece complicado porque você vê o resultado pronto; aqui você aprende passo a passo, no seu ritmo." },
  { q: "Como recebo o curso incluso no plano anual?", a: "A matrícula é automática: assinou o anual, o curso Rotinas Diárias aparece liberado na sua conta, para assistir quando quiser, quantas vezes quiser." },
  { q: "O que acontece logo depois que eu assino?", a: "Você entra e sua rotina já está lá, montada para o resultado do seu teste. No primeiro domingo, chega sua primeira 'Semana Ayurveda' por email. E a Akasha já te conhece pelo nome." },
  { q: "Funciona bem no celular?", a: "Sim — o Portal inteiro foi feito para o celular, das receitas às conversas com a Akasha." },
  { q: "Posso mudar de plano depois?", a: "Pode, a qualquer momento, direto nesta página — quem assina a Rotina sobe para o Premium pagando só a diferença proporcional." },
  { q: "Posso cancelar quando quiser?", a: "Sim, direto no Portal, na sua conta — sem ligação e sem burocracia. O acesso vai até o fim do período já pago." },
  { q: "O que é a revisão mensal?", a: "Todo mês seu quadro é refeito e a rotina se ajusta ao momento do seu corpo. Uma rotina que não se ajusta envelhece — a sua acompanha você." },
  { q: "A Akasha funciona de madrugada?", a: "Sim, a qualquer hora. Ela está disponível dia e noite, e conhece o seu dosha e o histórico das suas conversas." },
  { q: "Já assino a Rotina, como faço para subir de plano?", a: "Clique em Fazer upgrade no card do plano desejado. Você paga só a diferença proporcional pelo tempo que resta do ciclo atual — nenhuma cobrança em dobro." },
];

const ASSINAR_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ASSINAR_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};


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
    jsonld: ASSINAR_FAQ_JSONLD,
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
  {
    path: "/cursos",
    title: "Cursos de Ayurveda — Portal Ayurveda",
    description:
      "Todos os cursos do Portal Ayurveda: formação, alimentação, rotinas e trilhas curtas para você aprofundar sua prática.",
  },
  {
    path: "/samkhya/produto",
    title: "Produtos Samkhya — Portal Ayurveda",
    description: "Produtos ayurvédicos selecionados: óleos, ervas e ferramentas para sua prática diária.",
  },
  {
    path: "/samkhya/categoria",
    title: "Categorias Samkhya — Portal Ayurveda",
    description: "Explore categorias de produtos ayurvédicos na loja Samkhya do Portal Ayurveda.",
  },
  {
    path: "/artigos",
    title: "Artigos de Ayurveda — Portal Ayurveda",
    description:
      "Artigos práticos de Ayurveda por dosha: alimentação, rotina, digestão, sono e equilíbrio no dia a dia.",
  },
];

// Rotas privadas: entregam o SPA fallback, mas devem sinalizar noindex ao Google
// e nunca ter canonical apontando para a home. A safeguard em index.html cuida
// do canonical; aqui listamos os prefixos para o script client-side aplicar noindex.
const PRIVATE_ROUTE_PREFIXES = [
  "/minha-rotina",
  "/meu-dosha",
  "/entrar",
  "/admin",
  "/metricas",
  "/registros",
  "/samkhya/obrigado",
  "/samkhya/pedido",
  "/samkhya/compras",
  "/samkhya/carrinho",
  "/aovivo",
  "/preview-loading",
];



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
      // Ruidoso de propósito: silêncio antes deixou o blog inteiro sem prerender.
      console.error(
        `\n[prerender] ✗ REST ${res.status} em ${query}${schema ? ` (schema ${schema})` : ""}\n         corpo: ${body.slice(0, 300)}\n`
      );
      return [];
    }
    const data = (await res.json()) as T[];
    console.log(`[prerender] ✓ REST ${query.split("?")[0]}${schema ? ` (${schema})` : ""} → ${Array.isArray(data) ? data.length : "?"} itens`);
    return data;
  } catch (err) {
    console.error(`[prerender] ✗ REST ${query} exceção`, err);
    return [];
  }
}

// Baixa o sitemap e extrai o conjunto de slugs presentes em cada família de URL.
// Usado para limitar o volume de arquivos gerados (evita escrever 929 vídeos
// quando o sitemap só lista 433) e para nunca gerar rota que já não é indexável.
async function fetchSitemapSlugs(): Promise<{
  video: Set<string>;
  blog: Set<string>;
  terapeuta: Set<string>;
  produto: Set<string>;
  kit: Set<string>;
  categoria: Set<string>;
  all: Set<string>;
}> {
  const empty = {
    video: new Set<string>(),
    blog: new Set<string>(),
    terapeuta: new Set<string>(),
    produto: new Set<string>(),
    kit: new Set<string>(),
    categoria: new Set<string>(),
    all: new Set<string>(),
  };
  try {
    const res = await fetch(SITEMAP_SOURCE, { headers: { Accept: "application/xml,*/*" } });
    if (!res.ok) {
      console.warn(`[prerender] sitemap fetch ${res.status}; sem filtro por slug`);
      return empty;
    }
    const xml = await res.text();
    const out = { ...empty };
    const re = /<loc>\s*https?:\/\/[^/<]+(\/[^<\s]*)\s*<\/loc>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const path = m[1].replace(/\/$/, "");
      out.all.add(path);
      const parts = path.split("/").filter(Boolean);
      if (parts[0] === "video" && parts[1]) out.video.add(parts[1]);
      else if (parts[0] === "blog" && parts[1]) out.blog.add(parts[1]);
      else if (parts[0] === "terapeutas" && parts[1]) out.terapeuta.add(parts[1]);
      else if (parts[0] === "terapeutas-do-brasil" && parts[1] && parts[1] !== "cadastro") out.terapeuta.add(parts[1]);
      else if (parts[0] === "samkhya" && parts[1] === "produto" && parts[2]) out.produto.add(parts[2]);
      else if (parts[0] === "samkhya" && parts[1] === "kits" && parts[2]) out.kit.add(parts[2]);
      else if (parts[0] === "samkhya" && parts[1] === "categoria" && parts[2]) out.categoria.add(parts[2]);
    }
    console.log(
      `[prerender] sitemap: ${out.all.size} URLs (video=${out.video.size} blog=${out.blog.size} terapeuta=${out.terapeuta.size} produto=${out.produto.size} kit=${out.kit.size} categoria=${out.categoria.size})`
    );
    return out;
  } catch (err) {
    console.warn("[prerender] sitemap fetch falhou:", err);
    return empty;
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
    created_at: string | null;
    autor?: string | null;
  }>(
    "portal_conteudo?select=title,summary,meta_description,image_url,link_do_artigo,created_at,autor&link_do_artigo=not.is.null&limit=500"
  );
  for (const p of posts) {
    if (!p.link_do_artigo) continue;
    const desc = clean(p.meta_description || p.summary, 160);
    if (!p.title || !desc) continue;
    const url = `${BASE_URL}/blog/${p.link_do_artigo}`;
    const image = p.image_url || DEFAULT_OG;
    routes.push({
      path: `/blog/${p.link_do_artigo}`,
      title: `${clean(p.title, 80)} — Portal Ayurveda`,
      description: desc,
      image,
      type: "article",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: clean(p.title, 110),
        description: desc,
        image,
        datePublished: p.created_at || undefined,
        mainEntityOfPage: url,
        author: { "@type": "Person", name: clean(p.autor, 80) || "Edson Osorio" },
        publisher: {
          "@type": "Organization",
          name: "Portal Ayurveda",
          logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.jpg` },
        },
      },
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
    const tRoute: Route = {
      path: `/terapeutas-do-brasil/${slug}`,
      title: `${nome}${local ? " (" + local + ")" : ""} — Terapeuta Ayurveda`,
      description: desc.slice(0, 200),
      image: t.imagem || t["imagem.1"] || DEFAULT_OG,
      type: "profile",
    };
    routes.push(tRoute);
    // Alias curto /terapeutas/{slug} (rota também existe no App)
    routes.push({ ...tRoute, path: `/terapeutas/${slug}` });
  }

  // Vídeos canônicos (schema public)
  const videos = await fetchRest<{
    video_id: string;
    slug: string;
    novo_titulo: string;
    mini_resumo: string;
    nova_descricao: string;
    criado_em: string | null;
  }>(
    "videos_canonicos?select=video_id,slug,novo_titulo,mini_resumo,nova_descricao,criado_em&slug=not.is.null&limit=1000"
  );
  for (const v of videos) {
    if (!v.slug || !v.novo_titulo) continue;
    const desc = clean(v.mini_resumo || v.nova_descricao, 200) ||
      `Assista "${clean(v.novo_titulo, 80)}" no Portal Ayurveda.`;
    const thumb = v.video_id
      ? `https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg`
      : DEFAULT_OG;
    routes.push({
      path: `/video/${v.slug}`,
      title: `${clean(v.novo_titulo, 90)} — Portal Ayurveda`,
      description: desc,
      image: thumb,
      type: "video.other",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: clean(v.novo_titulo, 110),
        description: desc,
        thumbnailUrl: thumb,
        uploadDate: v.criado_em || undefined,
        embedUrl: v.video_id ? `https://www.youtube.com/embed/${v.video_id}` : undefined,
      },
    });
  }

  // Loja Samkhya — produtos (schema loja)
  const produtos = await fetchRest<{
    slug: string;
    nome_display: string;
    resumo_curto: string | null;
    imagem_url: string | null;
    preco_pix: number | null;
    preco_normal: number | null;
  }>(
    "produtos?select=slug,nome_display,resumo_curto,imagem_url,preco_pix,preco_normal&ativo=eq.true&limit=500",
    "loja"
  );
  for (const p of produtos) {
    if (!p.slug || !p.nome_display) continue;
    const desc =
      clean(p.resumo_curto, 200) ||
      `${clean(p.nome_display, 90)} — produto ayurvédico da loja Samkhya do Portal Ayurveda.`;
    const url = `${BASE_URL}/samkhya/produto/${p.slug}`;
    const image = p.imagem_url || DEFAULT_OG;
    const preco = p.preco_pix ?? p.preco_normal;
    routes.push({
      path: `/samkhya/produto/${p.slug}`,
      title: `${clean(p.nome_display, 90)} — Samkhya | Portal Ayurveda`,
      description: desc,
      image,
      type: "product",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: clean(p.nome_display, 110),
        description: desc,
        image,
        brand: { "@type": "Brand", name: "Samkhya" },
        url,
        ...(preco != null
          ? {
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "BRL",
                price: Number(preco).toFixed(2),
                availability: "https://schema.org/InStock",
                seller: { "@type": "Organization", name: "Portal Ayurveda" },
              },
            }
          : {}),
      },
    });
  }

  // Loja Samkhya — kits (schema loja)
  const kits = await fetchRest<{
    slug: string;
    nome: string;
    descricao_curta: string | null;
    imagem_url: string | null;
    preco_pix: number | null;
    preco_normal: number | null;
  }>(
    "kits?select=slug,nome,descricao_curta,imagem_url,preco_pix,preco_normal&ativo=eq.true&limit=200",
    "loja"
  );
  for (const k of kits) {
    if (!k.slug || !k.nome) continue;
    const desc =
      clean(k.descricao_curta, 200) ||
      `${clean(k.nome, 90)} — kit ayurvédico da loja Samkhya do Portal Ayurveda.`;
    const url = `${BASE_URL}/samkhya/kits/${k.slug}`;
    const image = k.imagem_url || DEFAULT_OG;
    const preco = k.preco_pix ?? k.preco_normal;
    routes.push({
      path: `/samkhya/kits/${k.slug}`,
      title: `${clean(k.nome, 90)} — Samkhya | Portal Ayurveda`,
      description: desc,
      image,
      type: "product",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: clean(k.nome, 110),
        description: desc,
        image,
        brand: { "@type": "Brand", name: "Samkhya" },
        url,
        ...(preco != null
          ? {
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "BRL",
                price: Number(preco).toFixed(2),
                availability: "https://schema.org/InStock",
                seller: { "@type": "Organization", name: "Portal Ayurveda" },
              },
            }
          : {}),
      },
    });
  }

  // Loja Samkhya — categorias (schema loja)
  const categorias = await fetchRest<{
    slug: string;
    nome: string;
    descricao: string | null;
  }>("categorias?select=slug,nome,descricao&limit=100", "loja");
  for (const c of categorias) {
    if (!c.slug || !c.nome) continue;
    const desc =
      clean(c.descricao, 200) ||
      `${clean(c.nome, 90)} — categoria de produtos ayurvédicos na loja Samkhya do Portal Ayurveda.`;
    routes.push({
      path: `/samkhya/categoria/${c.slug}`,
      title: `${clean(c.nome, 90)} — Samkhya | Portal Ayurveda`,
      description: desc,
      image: DEFAULT_OG,
    });
  }


  return routes;
}


async function writeSitemap(distDir: string): Promise<void> {
  try {
    const res = await fetch(SITEMAP_SOURCE, {
      headers: { Accept: "application/xml,text/xml,*/*" },
    });
    const xml = await res.text();
    const urlCount = (xml.match(/<url>/g) || []).length;
    const articleCount = (xml.match(/<loc>https:\/\/portalayurveda\.com\/blog\//g) || []).length;

    if (!res.ok || urlCount < 250 || articleCount < 250) {
      console.warn(
        `[prerender] sitemap dinâmico incompleto (${res.status}, ${urlCount} URLs, ${articleCount} artigos). Mantendo fallback estático se existir.`
      );
      return;
    }

    writeFileSync(resolve(distDir, "sitemap.xml"), xml);
    console.log(`[prerender] sitemap.xml escrito (${urlCount} URLs, ${articleCount} artigos)`);
  } catch (err) {
    console.warn("[prerender] falha ao gerar sitemap.xml dinâmico", err);
  }
}

function renderHtml(template: string, route: Route): string {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const image = escapeHtml(route.image || DEFAULT_OG);
  const type = route.type || "website";

  let html = template;

  // <title> (tolerante a atributos como data-rh="true")
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // meta name=description (tolerante a atributos e ordem)
  html = html.replace(
    /<meta\b[^>]*\bname=["']description["'][^>]*\/?>/i,
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

  // canonical + noindex + JSON-LD: injetar no <head>
  const extras: string[] = [`    <link rel="canonical" href="${url}" />`];
  if (route.noindex) {
    extras.push(`    <meta name="robots" content="noindex, follow" />`);
  }
  if (route.jsonld) {
    const blocks = Array.isArray(route.jsonld) ? route.jsonld : [route.jsonld];
    for (const b of blocks) {
      // JSON dentro de <script>: escapar </ para evitar fechar o script cedo
      const safe = JSON.stringify(b).replace(/</g, "\\u003c");
      extras.push(`    <script type="application/ld+json">${safe}</script>`);
    }
  }
  html = html.replace(/<\/head>/, `${extras.join("\n")}\n  </head>`);

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

  await writeSitemap(distDir);

  await bakeHome(distDir);

  console.log(
    `[prerender] ${written} rotas escritas (${staticRoutes.length - 1} estáticas + ${dynamic.length} dinâmicas)`
  );
}

const HOME_SOURCE = "https://home-fixo-teste.portalayurveda.workers.dev/";

async function bakeHome(distDir: string): Promise<void> {
  const outPath = resolve(distDir, "index.html");
  if (!existsSync(outPath)) {
    console.warn("[bake-home] dist/index.html não existe. Pulando.");
    return;
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(HOME_SOURCE, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[bake-home] status ${res.status}, pulando.`);
      return;
    }
    html = await res.text();
  } catch (err) {
    console.warn("[bake-home] falha ao baixar home fixa:", err);
    return;
  }

  if (
    html.length < 30_000 ||
    !html.includes("Seu guia completo") ||
    !html.includes("window.__PORTAL_ESTADO_RQ__")
  ) {
    console.warn(
      `[bake-home] conteúdo baixado não passou nas verificações (len=${html.length}). Pulando.`
    );
    return;
  }

  // (a) inner da <div id="root">
  const rootOpen = html.match(/<div\s+id=["']root["'][^>]*>/i);
  if (!rootOpen || rootOpen.index === undefined) {
    console.warn("[bake-home] não achei <div id=\"root\">. Pulando.");
    return;
  }
  const afterOpen = rootOpen.index + rootOpen[0].length;
  const bodyClose = html.lastIndexOf("</body>");
  if (bodyClose < 0) {
    console.warn("[bake-home] não achei </body>. Pulando.");
    return;
  }
  const beforeBody = html.slice(0, bodyClose);
  const lastDivClose = beforeBody.lastIndexOf("</div>");
  if (lastDivClose < afterOpen) {
    console.warn("[bake-home] não achei </div> de fechamento do root. Pulando.");
    return;
  }
  const rootInner = html.slice(afterOpen, lastDivClose);

  // (b) script inline com __PORTAL_ESTADO_RQ__
  const estadoMatch = html.match(
    /<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?window\.__PORTAL_ESTADO_RQ__[\s\S]*?<\/script>/i
  );
  if (!estadoMatch) {
    console.warn("[bake-home] não achei script inline do __PORTAL_ESTADO_RQ__. Pulando.");
    return;
  }
  const estadoScript = estadoMatch[0];

  // (c) preload/preconnect do head baixado
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headSrc = headMatch ? headMatch[1] : "";
  const rawLinks =
    headSrc.match(
      /<link\b[^>]*\brel=["'](?:preload|preconnect)["'][^>]*\/?>/gi
    ) || [];

  // Injetar no dist/index.html
  let dist = readFileSync(outPath, "utf8");
  const beforeSize = dist.length;

  const filteredLinks = rawLinks.filter((tag) => {
    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : "";
    if (!href) return false;
    // descarta fontes do google que só bloqueiam o render
    if (/fonts\.(googleapis|gstatic)\.com/i.test(href)) return false;
    // dedupe: não injeta link cujo href já existe no dist
    if (dist.includes(`href="${href}"`) || dist.includes(`href='${href}'`)) return false;
    return true;
  });
  const linkTags = filteredLinks.join("\n    ");

  if (linkTags) {
    dist = dist.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n    ${linkTags}`);
  }

  const firstModuleScript = dist.search(/<script\b[^>]*type=["']module["'][^>]*>/i);
  if (firstModuleScript >= 0) {
    dist =
      dist.slice(0, firstModuleScript) +
      `${estadoScript}\n    ` +
      dist.slice(firstModuleScript);
  } else {
    dist = dist.replace(/<\/body>/i, `  ${estadoScript}\n  </body>`);
  }

  dist = dist.replace(
    /(<div\s+id=["']root["'][^>]*>)[\s\S]*?(<\/div>)(?=\s*<script|\s*<\/body>)/i,
    (_m, open, close) => `${open}${rootInner}${close}`
  );

  writeFileSync(outPath, dist);
  console.log(
    `[bake-home] home assada: ${(beforeSize / 1024).toFixed(1)}KB → ${(dist.length / 1024).toFixed(1)}KB`
  );
}


main().catch((err) => {
  console.error("[prerender] falhou", err);
  process.exit(0); // não quebrar o build
});
