/**
 * Domínio público para servir imagens do Supabase Storage.
 * O bucket continua sendo o mesmo no Supabase, mas as URLs são reescritas
 * para o domínio customizado api.portalayurveda.com (que faz proxy/redirect
 * para o endpoint original do projeto Supabase).
 */
const LEGACY_SUPABASE_HOST = "https://fwezkasjfguarjmjxifh.supabase.co";
const PUBLIC_IMAGE_HOST = "https://api.portalayurveda.com";

/**
 * Reescreve uma URL de imagem do Supabase para usar o domínio público
 * api.portalayurveda.com. Se a URL não for do host antigo do Supabase,
 * retorna como está.
 */
export function rewriteImageHost(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith(LEGACY_SUPABASE_HOST)) {
    return PUBLIC_IMAGE_HOST + url.slice(LEGACY_SUPABASE_HOST.length);
  }
  return url;
}

/**
 * Retorna a URL da imagem já reescrita para o domínio público e, quando for
 * uma imagem do Supabase Storage, usando o endpoint de transformação
 * (`/render/image/public/...?width=...&quality=...`) no tamanho de exibição.
 * Formatos que não suportam transform (svg/gif) e URLs externas passam direto.
 */
export function getTransformedImageUrl(
  url: string | null | undefined,
  width = 600,
  quality = 75,
): string {
  const base = rewriteImageHost(url);
  if (!base) return "";
  if (!base.includes("/storage/v1/object/public/")) return base;
  if (/\.(svg|gif)(\?|$)/i.test(base)) return base;
  if (base.includes("/render/image/")) return base;

  const [path, existingQuery] = base.split("?");
  const rendered = path.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const params = new URLSearchParams(existingQuery ?? "");
  params.set("width", String(Math.round(width)));
  params.set("quality", String(quality));
  return `${rendered}?${params.toString()}`;
}

