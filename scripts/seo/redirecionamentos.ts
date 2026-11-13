import { Parser } from "htmlparser2";

export interface PreviaRedirecionamento {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  image: string;
}

interface RotaPrevia {
  path: string;
  title: string;
  description: string;
  image?: string;
}

export const LIMITE_PREVIA_MS = 10_000;

export function extrairPrevia(html: string, alvo: string, padrao: PreviaRedirecionamento): PreviaRedirecionamento {
  const metas = new Map<string, string>();
  let titulo = "";
  let noTitulo = false;
  const parser = new Parser({
    onopentag(nome, attrs) {
      if (nome === "title") noTitulo = true;
      if (nome === "meta") {
        const chave = (attrs.property || attrs.name || "").toLowerCase();
        if (!metas.has(chave) && attrs.content?.trim()) metas.set(chave, attrs.content.trim());
      }
    },
    ontext(texto) { if (noTitulo) titulo += texto; },
    onclosetag(nome) { if (nome === "title") noTitulo = false; },
  }, { decodeEntities: true });
  parser.end(html);
  let image = padrao.image;
  const imagem = metas.get("og:image");
  if (imagem) {
    try {
      const url = new URL(imagem, alvo);
      if (url.protocol === "https:" || url.protocol === "http:") image = url.href;
    } catch { /* Imagem inválida: manter a padrão. */ }
  }
  return {
    title: titulo.trim() || padrao.title,
    description: metas.get("description") || padrao.description,
    ogTitle: metas.get("og:title") || padrao.ogTitle,
    ogDescription: metas.get("og:description") || padrao.ogDescription,
    image,
  };
}

export async function previaDoDestino(
  alvo: string,
  base: string,
  rotas: readonly RotaPrevia[],
  padrao: PreviaRedirecionamento,
): Promise<PreviaRedirecionamento> {
  try {
    const url = new URL(alvo, base);
    const rota = url.origin === new URL(base).origin
      ? rotas.find((r) => r.path === (url.pathname.replace(/\/+$/, "") || "/"))
      : undefined;
    if (rota) return {
      title: rota.title || padrao.title,
      description: rota.description || padrao.description,
      ogTitle: rota.title || padrao.ogTitle,
      ogDescription: rota.description || padrao.ogDescription,
      image: rota.image || padrao.image,
    };
    // Apenas endereços completos são baixados; uma rota local desconhecida usa a reserva.
    if (!/^https?:\/\//i.test(alvo)) return { ...padrao };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LIMITE_PREVIA_MS);
    try {
      const resposta = await fetch(url.href, { signal: controller.signal });
      if (!resposta.ok) return { ...padrao };
      return extrairPrevia(await resposta.text(), resposta.url || url.href, padrao);
    } finally { clearTimeout(timer); }
  } catch {
    return { ...padrao };
  }
}

export function htmlRedirecionamento(alvo: string, curto: string, previa: PreviaRedirecionamento): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const a = escape(alvo);
  const alvoJs = JSON.stringify(alvo).replace(/</g, "\\u003c");
  const tags = [
    ["name", "description", previa.description],
    ["property", "og:title", previa.ogTitle],
    ["property", "og:description", previa.ogDescription],
    ["property", "og:image", previa.image],
    ["property", "og:image:secure_url", previa.image],
    ["property", "og:url", curto],
    ["property", "og:type", "website"],
    ["property", "og:site_name", "Portal Ayurveda"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", previa.ogTitle],
    ["name", "twitter:description", previa.ogDescription],
    ["name", "twitter:image", previa.image],
  ].map(([atributo, nome, valor]) => `<meta ${atributo}="${nome}" content="${escape(valor)}">`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escape(previa.title)}</title>${tags}<link rel="canonical" href="${a}"><meta http-equiv="refresh" content="0; url=${a}"><script>(function(){var d=${alvoJs};var q=location.search;if(q){d+=(d.indexOf("?")>=0?"&":"?")+q.slice(1);}location.replace(d);})();</script></head><body style="background:#f0ede8"></body></html>`;
}