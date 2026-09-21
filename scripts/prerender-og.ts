// Pós-build: escreve o HTML de cada rota com título, descrição, OG, canonical e JSON-LD.
// Roda como `postbuild` no package.json.
//
// REGRA DE URL (vale também para a edge function `sitemap`)
// Uma URL só existe para o Google se tiver linha no banco (ou for rota fixa de src/App.tsx)
// E este script escrever dist/<rota>/index.html para ela. Toda rota nova entra em
// `staticRoutes` AQUI e em `staticEntries` na função `sitemap` no MESMO patch. No fim da
// build, `conferirSitemap()` derruba a build se sobrar URL do sitemap sem arquivo.
//
// ENDEREÇO DE VÍDEO: existe UM só, o slug longo de `videos_canonicos`. Os endereços antigos
// (slug curto e id do YouTube) continuam existindo, com canonical apontando para o longo.
// O canonical gravado aqui leva data-rota; src/hooks/useCanonical.ts respeita esse valor
// quando a rota carimbada é a URL aberta.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { limparDescricaoVideo } from "../src/lib/videoDescricao";
import { lerFontes, BASE_URL, DEFAULT_OG, SITEMAP_SOURCE, AUTOR_NOME, type LinhaVideo } from "./seo/fontes";

interface Route {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "profile" | "product" | "video.other";
  jsonld?: Record<string, any>;
  /** Quando a URL canônica é outra (endereço antigo). */
  canonicalPath?: string;
}

const editora = {
  "@type": "Organization",
  name: "Portal Ayurveda",
  logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.jpg` },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clean(text: unknown, max = 200): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function jsonParaScript(obj: unknown): string {
  // "</script>" dentro do JSON fecharia a tag cedo. Escapar "<" resolve.
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/** ingredientes e modo_preparo são jsonb: aceita lista de texto, lista de objeto ou texto. */
function listaDeJson(valor: unknown): string[] {
  if (!valor) return [];
  if (typeof valor === "string") return valor.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const partes = ["quantidade", "qtd", "medida", "nome", "item", "ingrediente", "texto", "passo", "descricao"]
          .map((k) => (typeof o[k] === "string" ? (o[k] as string).trim() : ""))
          .filter(Boolean);
        return partes.length ? [...new Set(partes)].join(" ") : Object.values(o).filter((x) => typeof x === "string").join(" ").trim();
      }
      return "";
    })
    .filter(Boolean);
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

// -------------------------------------------------------------- rotas fixas
// Os títulos das páginas que já estão certas no ar ficam iguais, letra por letra.

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
    description: "Artigos sobre Ayurveda em português: doshas, alimentação, rotinas, plantas, terapias e filosofia. Atualizado semanalmente.",
  },
  { path: "/contato", title: "Contato — Portal Ayurveda", description: "Entre em contato com o Portal Ayurveda. Tire dúvidas, envie sugestões ou fale sobre parcerias." },
  {
    path: "/assinar",
    title: "Akasha Premium — Portal Ayurveda",
    description: "Assine o Akasha Premium e tenha acesso ilimitado à biblioteca, rotinas personalizadas e à inteligência Akasha do Portal Ayurveda.",
    jsonld: ASSINAR_FAQ_JSONLD,
  },
  { path: "/curso/alimentacao", title: "Curso de Alimentação Ayurvédica — Portal Ayurveda", description: "Aprenda a base da alimentação ayurvédica: rasas, qualidades, como cozinhar para seu dosha e equilibrar agni." },
  { path: "/curso/formacao", title: "Formação em Ayurveda — Portal Ayurveda", description: "Conheça a formação completa em Ayurveda do Portal: estrutura, módulos, certificação e próximos passos." },
  { path: "/curso/rotinas", title: "Rotinas Ayurvédicas (Dinacharya) — Portal Ayurveda", description: "Construa sua rotina diária ayurvédica passo a passo: despertar, higiene, alimentação, trabalho, sono." },
  { path: "/terapeutas-do-brasil", title: "Terapeutas do Brasil — Portal Ayurveda", description: "Encontre terapeutas ayurvédicos no Brasil. Filtre por estado, cidade e especialidade." },
  { path: "/samkhya", title: "Samkhya — Loja do Portal Ayurveda", description: "Produtos selecionados de Ayurveda: óleos, ervas, kits e ferramentas para sua prática diária." },
  { path: "/samkhya/kits", title: "Kits Samkhya — Portal Ayurveda", description: "Kits ayurvédicos curados para começar sua prática." },
  { path: "/samkhya/todos", title: "Todos os produtos — Samkhya", description: "Catálogo completo de produtos ayurvédicos da loja Samkhya." },
  { path: "/politica-de-privacidade", title: "Política de Privacidade — Portal Ayurveda", description: "Como o Portal Ayurveda coleta, usa e protege seus dados pessoais." },
  { path: "/termos-de-uso", title: "Termos de Uso — Portal Ayurveda", description: "Termos e condições de uso do Portal Ayurveda." },
  { path: "/cursos", title: "Cursos de Ayurveda — Portal Ayurveda", description: "Todos os cursos do Portal Ayurveda: formação, alimentação, rotinas e trilhas curtas para você aprofundar sua prática." },

  // Páginas que hoje entregam o HTML da home. Título e descrição são os que a própria
  // página declara no Helmet.
  {
    path: "/biblioteca/horarios",
    title: "Relógio dos Doshas & Dinacharya — Portal Ayurveda",
    description: "Guia profundo e completo sobre o ciclo natural de 24 horas dos Doshas, englobando sono, rotinas, alimentação e fisiologia clínica.",
  },
  {
    path: "/textos-classicos",
    title: "Textos Clássicos — Portal Ayurveda",
    description: "Biblioteca clássica de Ayurveda: verso do dia, roteiro de estudo e pesquisa nos tratados sânscritos com tradução em português.",
  },
  {
    path: "/curso/diagnostico",
    title: "Diagnóstico e Autocuidado Ayurveda | Portal Ayurveda",
    description: "Quantas consultas até alguém te ensinar a olhar pra você mesmo? Aprenda Pareeksha, o método ayurvédico de diagnóstico por observação (língua, unhas, olhos, pulso), e o curso de Autocuidado, juntos num só programa. 40h de curso, 2 anos de acesso.",
  },
  {
    path: "/curso/dravya-guna",
    title: "Curso de Dravya Guna - Remédios Caseiros do Ayurveda | Portal Ayurveda",
    description: "Aprenda a formular seus próprios remédios ayurvédicos com base na herbologia brasileira e indiana. 26 ervas e óleos estudados um a um, 26 aulas de receitas ayurvédicas passo a passo, certificado de 40h e bônus de Diagnóstico da Língua.",
  },
];

// As 9 abas dos guias, com o título e a descrição que DoshaVata/Pitta/Kapha declaram no Helmet.
// A aba de remédios responde em /remedios e /alquimia; o canônico é /remedios.
const GUIAS: Record<string, { title: string; description: string }> = {
  vata: {
    title: "Guia do Dosha Vata — Portal Ayurveda",
    description: "Tudo sobre o dosha Vata: corpo físico, órgãos sede, os 5 ventos (Vayus), sabores, nutrição e hábitos de ouro para equilibrar Ar e Éter.",
  },
  pitta: {
    title: "Guia do Dosha Pitta — Portal Ayurveda",
    description: "Tudo sobre o dosha Pitta: corpo físico, órgãos sede, os 5 fogos, sabores, nutrição e hábitos de ouro para equilibrar Fogo e Água.",
  },
  kapha: {
    title: "Guia do Dosha Kapha — Portal Ayurveda",
    description: "Tudo sobre o dosha Kapha: corpo físico, órgãos sede, as 5 mucosas do corpo, sabores, nutrição e hábitos de ouro para equilibrar Terra e Água.",
  },
};
for (const [dosha, meta] of Object.entries(GUIAS)) {
  for (const aba of ["horarios", "alimentacao", "remedios"]) {
    staticRoutes.push({ path: `/biblioteca/${dosha}/${aba}`, title: meta.title, description: meta.description });
  }
  staticRoutes.push({ path: `/biblioteca/${dosha}/alquimia`, title: meta.title, description: meta.description, canonicalPath: `/biblioteca/${dosha}/remedios` });
}

// ----------------------------------------------------------- rotas dinâmicas

type Contagens = Record<string, number>;

async function dynamicRoutes(): Promise<{ routes: Route[]; counts: Contagens }> {
  const routes: Route[] = [];
  const counts: Contagens = {};
  const bump = (k: string) => (counts[k] = (counts[k] || 0) + 1);

  const { artigos, videos, curtos, receitas, terapeutas, produtos, kits, categorias } = await lerFontes();

  // ---------------------------------------------------------------- artigos
  // Mais novo vence quando o slug se repete, mesma regra do React.
  const porSlug = new Map<string, (typeof artigos)[number]>();
  for (const p of artigos) {
    if (!p.link_do_artigo) continue;
    const atual = porSlug.get(p.link_do_artigo);
    if (!atual || (Date.parse(p.created_at ?? "") || 0) > (Date.parse(atual.created_at ?? "") || 0)) porSlug.set(p.link_do_artigo, p);
  }
  for (const p of porSlug.values()) {
    if (!p.title) continue;
    const desc = clean(p.meta_description || p.summary, 160) || clean(p.title, 160);
    const rota = `/blog/${p.link_do_artigo}`;
    const image = p.image_url || DEFAULT_OG;
    routes.push({
      path: rota,
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
        mainEntityOfPage: `${BASE_URL}${rota}`,
        inLanguage: "pt-BR",
        author: { "@type": "Person", name: AUTOR_NOME },
        publisher: editora,
      },
    });
    bump("blog");
  }

  // ----------------------------------------------------------------- vídeos
  const porVideoId = new Map<string, LinhaVideo>();
  const slugsLongos = new Set<string>();

  const metaVideo = (v: LinhaVideo) => {
    const desc = clean(limparDescricaoVideo(v.mini_resumo || v.nova_descricao), 200) || `Assista "${clean(v.novo_titulo, 80)}" no Portal Ayurveda.`;
    const thumb = v.video_id ? `https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg` : DEFAULT_OG;
    return { desc, thumb, titulo: `${clean(v.novo_titulo, 90)} — Portal Ayurveda` };
  };

  for (const v of videos) {
    if (!v.slug || !v.novo_titulo || slugsLongos.has(v.slug)) continue;
    porVideoId.set(v.video_id, v);
    slugsLongos.add(v.slug);
    const { desc, thumb, titulo } = metaVideo(v);
    routes.push({
      path: `/video/${v.slug}`,
      title: titulo,
      description: desc,
      image: thumb,
      type: "video.other",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: clean(v.novo_titulo, 110),
        description: desc,
        thumbnailUrl: thumb,
        inLanguage: "pt-BR",
        embedUrl: v.video_id ? `https://www.youtube.com/embed/${v.video_id}` : undefined,
        publisher: editora,
      },
    });
    bump("video");
  }

  // Endereço por id do YouTube (/video/{video_id}), com canonical para o slug longo.
  // src/pages/Video.tsx já redireciona esse formato quando o JavaScript roda.
  for (const v of porVideoId.values()) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(v.video_id) || slugsLongos.has(v.video_id)) continue;
    const { desc, thumb, titulo } = metaVideo(v);
    routes.push({ path: `/video/${v.video_id}`, title: titulo, description: desc, image: thumb, type: "video.other", canonicalPath: `/video/${v.slug}` });
    bump("videoPorId");
  }

  // Endereços curtos antigos (videos_sitemap): mesmo vídeo de sempre, canonical para o longo.
  const curtosUsados = new Set<string>();
  for (const c of curtos) {
    if (!c.slug || curtosUsados.has(c.slug) || slugsLongos.has(c.slug)) continue;
    const v = porVideoId.get(c.video_id);
    if (!v) continue;
    curtosUsados.add(c.slug);
    const { desc, thumb, titulo } = metaVideo(v);
    routes.push({ path: `/video/${c.slug}`, title: titulo, description: desc, image: thumb, type: "video.other", canonicalPath: `/video/${v.slug}` });
    bump("videoAlias");
  }

  // ---------------------------------------------------------------- receitas
  for (const r of receitas) {
    if (!r.slug || !r.titulo) continue;
    const desc = clean(r.resumo, 160) || `${clean(r.titulo, 90)}: receita ayurvédica do Portal Ayurveda.`;
    const image = r.imagem_url || DEFAULT_OG;
    const ing = listaDeJson(r.ingredientes);
    const passos = listaDeJson(r.modo_preparo);
    routes.push({
      path: `/receita/${r.slug}`,
      title: `${clean(r.titulo, 90)} — Portal Ayurveda`,
      description: desc,
      image,
      type: "article",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: clean(r.titulo, 110),
        description: desc,
        image,
        inLanguage: "pt-BR",
        author: { "@type": "Person", name: AUTOR_NOME },
        ...(ing.length ? { recipeIngredient: ing.map((i) => clean(i, 200)) } : {}),
        ...(passos.length ? { recipeInstructions: passos.map((p) => ({ "@type": "HowToStep", text: clean(p, 400) })) } : {}),
      },
    });
    bump("receita");
  }

  // ------------------------------------------------------------- terapeutas
  const vistosTerapeuta = new Set<string>();
  for (const t of terapeutas) {
    const slug = t["terapeutas(dinamica)"];
    if (!slug || typeof slug !== "string" || vistosTerapeuta.has(slug)) continue;
    vistosTerapeuta.add(slug);
    const nome = clean(t.nome, 80) || "Terapeuta Ayurveda";
    const especialidade = clean(t.especialidade, 80);
    const cidade = clean(t.cidade, 60);
    const estado = clean(t.estado, 30);
    const local = [cidade, estado].filter(Boolean).join("/");
    const desc = clean(t.resumo, 160) || `${nome}${especialidade ? ", " + especialidade : ""}${local ? " em " + local : ""}. Encontre terapeutas ayurvédicos no Portal Ayurveda.`;
    const imagem = t.imagem || t["imagem.1"] || DEFAULT_OG;
    const titulo = `${nome}${local ? " (" + local + ")" : ""} — Terapeuta Ayurveda`;
    routes.push({
      path: `/terapeutas/${slug}`,
      title: titulo,
      description: desc.slice(0, 200),
      image: imagem,
      type: "profile",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: nome,
        url: `${BASE_URL}/terapeutas/${slug}`,
        jobTitle: "Terapeuta ayurvédico",
        image: imagem,
        description: clean(t.resumo, 300) || desc,
        ...(local ? { address: { "@type": "PostalAddress", addressLocality: cidade, addressRegion: estado, addressCountry: "BR" } } : {}),
        ...(especialidade ? { knowsAbout: clean(t.especialidade, 300) } : {}),
      },
    });
    bump("terapeuta");
    // Endereço longo: o App já redireciona; a página só declara o curto.
    routes.push({ path: `/terapeutas-do-brasil/${slug}`, title: titulo, description: desc.slice(0, 200), image: imagem, type: "profile", canonicalPath: `/terapeutas/${slug}` });
    bump("terapeutaAlias");
  }

  // ------------------------------------------------------------------ loja
  const ofertaJsonld = (nome: string, desc: string, image: string, url: string, preco: number | null) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: clean(nome, 110),
    description: desc,
    image,
    brand: { "@type": "Brand", name: "Samkhya" },
    url,
    ...(preco != null
      ? { offers: { "@type": "Offer", url, priceCurrency: "BRL", price: Number(preco).toFixed(2), availability: "https://schema.org/InStock", seller: { "@type": "Organization", name: "Portal Ayurveda" } } }
      : {}),
  });
  for (const p of produtos) {
    if (!p.slug || !p.nome_display) continue;
    const desc = clean(p.resumo_curto, 200) || `${clean(p.nome_display, 90)} — produto ayurvédico da loja Samkhya do Portal Ayurveda.`;
    const url = `${BASE_URL}/samkhya/produto/${p.slug}`;
    const image = p.imagem_url || DEFAULT_OG;
    routes.push({ path: `/samkhya/produto/${p.slug}`, title: `${clean(p.nome_display, 90)} — Samkhya | Portal Ayurveda`, description: desc, image, type: "product", jsonld: ofertaJsonld(p.nome_display, desc, image, url, p.preco_pix ?? p.preco_normal) });
    bump("produto");
  }
  for (const k of kits) {
    if (!k.slug || !k.nome) continue;
    const desc = clean(k.descricao_curta, 200) || `${clean(k.nome, 90)} — kit ayurvédico da loja Samkhya do Portal Ayurveda.`;
    const url = `${BASE_URL}/samkhya/kits/${k.slug}`;
    const image = k.imagem_url || DEFAULT_OG;
    routes.push({ path: `/samkhya/kits/${k.slug}`, title: `${clean(k.nome, 90)} — Samkhya | Portal Ayurveda`, description: desc, image, type: "product", jsonld: ofertaJsonld(k.nome, desc, image, url, k.preco_pix ?? k.preco_normal) });
    bump("kit");
  }
  for (const c of categorias) {
    if (!c.slug || !c.nome) continue;
    routes.push({ path: `/samkhya/categoria/${c.slug}`, title: `${clean(c.nome, 90)} — Samkhya | Portal Ayurveda`, description: clean(c.descricao, 200) || `${clean(c.nome, 90)} — categoria de produtos ayurvédicos na loja Samkhya do Portal Ayurveda.`, image: DEFAULT_OG });
    bump("categoria");
  }

  console.log(`[prerender] dinâmicas: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  return { routes, counts };
}

// ------------------------------------------------------------------ escrita

/** Troca uma tag do template. Devolve false quando a tag não existe no template (aviso, não erro). */
function trocar(html: string, re: RegExp, novo: string): [string, boolean] {
  if (!re.test(html)) return [html, false];
  return [html.replace(re, () => novo), true];
}

function renderHtml(template: string, route: Route, faltando: Set<string>): string {
  const canonical = `${BASE_URL}${route.canonicalPath ?? route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const image = escapeHtml(route.image || DEFAULT_OG);
  const type = route.type || "website";
  const imageType = /\.png(\?|$)/i.test(image) ? "image/png" : /\.webp(\?|$)/i.test(image) ? "image/webp" : "image/jpeg";

  let html = template;
  let ok = true;
  const passos: [string, RegExp, string][] = [
    ["title", /<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`],
    ["description", /<meta\b[^>]*\bname=["']description["'][^>]*\/?>/i, `<meta name="description" content="${description}" />`],
    ["og:title", /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`],
    ["og:description", /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`],
    ["og:url", /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`],
    ["og:image", /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`],
    ["og:image:secure_url", /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image:secure_url" content="${image}" />`],
    ["og:image:type", /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image:type" content="${imageType}" />`],
    ["og:type", /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${type}" />`],
    ["twitter:title", /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`],
    ["twitter:description", /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`],
    ["twitter:image", /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`],
  ];
  for (const [nome, re, novo] of passos) {
    [html, ok] = trocar(html, re, novo);
    if (!ok) faltando.add(nome);
  }

  // Tira o canonical que já vem no template (duas tags de canonical fazem o Google ignorar
  // as duas) e grava um só, carimbado com a rota do arquivo.
  html = html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*\/?>\s*/gi, "");
  const extras: string[] = [`    <link rel="canonical" href="${canonical}" data-rota="${route.path}" />`];
  if (route.jsonld) extras.push(`    <script type="application/ld+json">${jsonParaScript(route.jsonld)}</script>`);
  html = html.replace(/<\/head>/, () => `${extras.join("\n")}\n  </head>`);

  // O boot-shell é a cortina de carregamento. Sem trocar o texto dele, o HTML de todas as
  // rotas mostraria o h1 da home. A home fica de fora.
  if (route.path !== "/") {
    const tituloCurto = route.title.replace(/\s*—\s*Portal Ayurveda\s*$/, "").replace(/\s*\|\s*Portal Ayurveda\s*$/, "").replace(/\s*—\s*Samkhya\s*$/, "").trim() || route.title;
    // Substituição por função (não por string) para que um "$" no texto não seja lido
    // como referência de grupo pelo replace.
    html = html.replace(/(<div id="bs-main">\s*<h1>)[\s\S]*?(<\/h1>)/, (_m, a, b) => `${a}${escapeHtml(tituloCurto)}${b}`);
    html = html.replace(/(<div id="bs-main">[\s\S]*?<p>)[\s\S]*?(<\/p>)/, (_m, a, b) => `${a}${escapeHtml(route.description.slice(0, 110))}${b}`);
  }
  return html;
}

type Sitemap = { estado: "gerado" | "indisponivel" | "errado"; motivo: string; xml: string };

/** Baixa o sitemap da edge function. Indisponível ou errado não é gravado e não derruba a build. */
async function baixarSitemap(): Promise<Sitemap> {
  try {
    const res = await fetch(SITEMAP_SOURCE, { headers: { Accept: "application/xml,text/xml,*/*" } });
    const xml = await res.text();
    const estadoFn = res.headers.get("x-sitemap-estado") ?? "";
    if (!res.ok || estadoFn === "ultimo-bom" || estadoFn === "sem-nada" || /ultima versao boa/i.test(xml)) {
      return { estado: "indisponivel", motivo: `status=${res.status} X-Sitemap-Estado=${estadoFn || "?"}`, xml: "" };
    }
    const urls = (xml.match(/<url>/g) || []).length;
    const blog = (xml.match(/https:\/\/portalayurveda\.com\/blog\//g) || []).length;
    const video = (xml.match(/https:\/\/portalayurveda\.com\/video\//g) || []).length;
    const receita = (xml.match(/https:\/\/portalayurveda\.com\/receita\//g) || []).length;
    const v26 = xml.includes("/samkhya/produto/");
    if (urls < 800 || blog < 250 || video < 300 || !v26) {
      return { estado: "errado", motivo: `urls=${urls} blog=${blog} video=${video} receita=${receita} samkhya-produto=${v26 ? "ok" : "ausente"}`, xml: "" };
    }
    return { estado: "gerado", motivo: `${urls} URLs (blog ${blog}, vídeo ${video}, receita ${receita})`, xml };
  } catch (err) {
    return { estado: "indisponivel", motivo: String(err), xml: "" };
  }
}

/** Derruba a build se o sitemap mandar uma URL que este script não escreveu:
 *  URL do sitemap sem dist/<rota>/index.html é 404 na cara do Google. */
function conferirSitemap(xml: string, distDir: string): void {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const faltando: string[] = [];
  for (const loc of locs) {
    if (!loc.startsWith(`${BASE_URL}/`)) continue;
    const rota = loc.slice(BASE_URL.length).replace(/\/+$/, "");
    if (rota === "") continue; // a home é o próprio dist/index.html
    // strip do "/" inicial: path.resolve com segmento absoluto descartaria o distDir.
    if (!existsSync(resolve(distDir, rota.replace(/^\//, ""), "index.html"))) faltando.push(loc);
  }
  if (faltando.length) {
    console.error(`\n[prerender] ❌ BUILD INTERROMPIDA — ${faltando.length} URLs do sitemap sem dist/<rota>/index.html:`);
    for (const f of faltando.slice(0, 20)) console.error(`  ${f}`);
    if (faltando.length > 20) console.error(`  ... e mais ${faltando.length - 20}`);
    console.error(`\n[prerender] REGRA DE URL: toda URL do sitemap precisa ter rota AQUI e arquivo em dist/.`);
    console.error(`[prerender] Alinhe a edge function \`sitemap\` (mesma fonte de endereço que este script).\n`);
    process.exit(1);
  }
  console.log(`[prerender] ✓ sitemap conferido: ${locs.length} URLs, todas com arquivo em dist/.`);
}

/** Escreve dist/sitemap.xml. Quando a edge function não entrega, grava a cópia de reserva. */
async function writeSitemap(distDir: string): Promise<string> {
  const s = await baixarSitemap();
  const destino = resolve(distDir, "sitemap.xml");
  if (s.estado === "gerado") {
    writeFileSync(destino, s.xml);
    console.log(`[prerender] ✓ sitemap.xml escrito (${s.motivo})`);
    return s.xml;
  }
  console.error(`[prerender] ⚠️  sitemap ${s.estado} (${s.motivo}). Gravando a cópia de reserva public/sitemap.xml.`);
  const reserva = resolve("public", "sitemap.xml");
  if (existsSync(reserva)) {
    writeFileSync(destino, readFileSync(reserva, "utf8"));
    console.log("[prerender] sitemap.xml = cópia de reserva.");
  } else {
    console.error("[prerender] ✗ public/sitemap.xml (reserva) não existe — o site vai servir o sitemap que vier no build.");
  }
  return "";
}

async function main() {
  const distDir = resolve("dist");
  const templatePath = resolve(distDir, "index.html");

  if (!existsSync(templatePath)) {
    console.warn("[prerender] dist/index.html não existe. Pulando.");
    return;
  }

  const template = readFileSync(templatePath, "utf8");

  // O h1 por rota do item 7 só funciona enquanto o boot-shell tiver esta forma.
  if (!/<div id="bs-main">\s*<h1>[\s\S]*?<\/h1>[\s\S]*?<p>/.test(template)) {
    console.error(`\n[prerender] ❌ O boot-shell mudou de forma: o h1 por rota não vai ser aplicado e todas as páginas voltariam a ter o corpo da home. Ajuste as expressões em renderHtml.\n`);
    process.exit(1);
  }

  const { routes } = await dynamicRoutes();
  const all = [...staticRoutes, ...routes];

  let written = 0;
  const writtenBy: Record<string, number> = {};
  const failed: { path: string; err: string }[] = [];
  const faltando = new Set<string>();
  for (const route of all) {
    if (route.path === "/") continue; // index.html já é o root

    const outDir = resolve(distDir, route.path.replace(/^\//, ""));
    const outFile = resolve(outDir, "index.html");

    try {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, renderHtml(template, route, faltando));
      written++;
      const family = route.path.split("/").filter(Boolean)[0] || "root";
      writtenBy[family] = (writtenBy[family] || 0) + 1;
    } catch (err) {
      failed.push({ path: route.path, err: String(err) });
    }
  }

  // Também sobrescreve dist/index.html com tags da home (caso o template não esteja com a home explicitamente)
  const home = staticRoutes.find((r) => r.path === "/");
  if (home) {
    writeFileSync(templatePath, renderHtml(template, home, faltando));
  }

  await bakeHome(distDir);

  const sitemapXml = await writeSitemap(distDir);
  if (sitemapXml) conferirSitemap(sitemapXml, distDir);

  console.log(
    `[prerender] ${written} rotas escritas (${staticRoutes.length - 1} estáticas + ${routes.length} dinâmicas)`
  );
  console.log(
    `[prerender] escritas por família: ${Object.entries(writtenBy).map(([k, v]) => `${k}=${v}`).join(" ")}`
  );
  if (faltando.size) {
    console.error(`[prerender] ⚠️  tags do template não encontradas para troca: ${[...faltando].join(", ")}`);
  }
  if (failed.length) {
    console.error(`[prerender] ✗ ${failed.length} rotas falharam ao escrever:`);
    for (const f of failed.slice(0, 20)) console.error(`  ${f.path}: ${f.err}`);
    if (failed.length > 20) console.error(`  ... e mais ${failed.length - 20}`);
  }

  // blog e video são o corpo do site: sair com zero aqui já desindexou o site uma vez.
  // Os mínimos são baixos de propósito — servem para pegar "zero" e "quase zero",
  // não para vigiar o número exato (isso é papel do vigia diário no Supabase).
  const FAMILIAS_CRITICAS: Record<string, number> = { blog: 100, video: 150 };
  const IGNORAR_MINIMO = process.env.PRERENDER_IGNORAR_MINIMO === "1";
  const criticasFaltando: string[] = [];
  for (const [fam, minimo] of Object.entries(FAMILIAS_CRITICAS)) {
    const n = writtenBy[fam] || 0;
    if (n < minimo) criticasFaltando.push(`${fam}: ${n} arquivos (mínimo ${minimo})`);
  }
  // terapeutas gera duas rotas por pessoa (a curta e a longa), então são duas chaves.
  const nTerapeutas = (writtenBy["terapeutas"] || 0) + (writtenBy["terapeutas-do-brasil"] || 0);
  if (nTerapeutas < 10) console.error(`\n[prerender] ⚠️  terapeutas: só ${nTerapeutas} arquivos. Confira a permissão da tabela.\n`);
  if ((writtenBy["samkhya"] || 0) < 20) console.error(`\n[prerender] ⚠️  samkhya: só ${writtenBy["samkhya"] || 0} arquivos. Confira a permissão do schema loja.\n`);
  if (criticasFaltando.length && IGNORAR_MINIMO) {
    console.error(`\n[prerender] ⚠️  Mínimos abaixo do piso, mas PRERENDER_IGNORAR_MINIMO=1 — publicando assim mesmo.\n  ${criticasFaltando.join("\n  ")}\n`);
  } else if (criticasFaltando.length) {
    console.error(`\n[prerender] ❌ BUILD INTERROMPIDA — famílias essenciais abaixo do mínimo:\n  ${criticasFaltando.join("\n  ")}\n`);
    console.error(`[prerender] Publicar assim faz o Google receber o HTML da home nessas URLs.\n`);
    console.error(`[prerender] Para publicar mesmo assim (emergência), defina PRERENDER_IGNORAR_MINIMO=1.\n`);
    process.exit(1);
  }
}

// Fonte da home pré-renderizada. Pode ser sobrescrita por env (HOME_BAKE_URL).
// Se a URL estiver 404/vazia, o build segue com o index.html padrão — mas
// gritamos alto para não passar batido de novo.
const HOME_SOURCE = process.env.HOME_BAKE_URL || "off";
const HOME_BAKE_DISABLED = HOME_SOURCE === "off";

async function bakeHome(distDir: string): Promise<void> {
  const outPath = resolve(distDir, "index.html");
  if (!existsSync(outPath)) {
    console.error("[bake-home] ✗ dist/index.html não existe. Pulando.");
    return;
  }
  if (HOME_BAKE_DISABLED) {
    console.log("[bake-home] desativado por HOME_BAKE_URL=off. Pulando.");
    return;
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(HOME_SOURCE, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[bake-home] ✗ ${HOME_SOURCE} respondeu ${res.status}. Home NÃO foi assada. Ajuste HOME_BAKE_URL ou defina =off.`);
      return;
    }
    html = await res.text();
  } catch (err) {
    console.error(`[bake-home] ✗ falha ao baixar ${HOME_SOURCE}:`, err);
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
