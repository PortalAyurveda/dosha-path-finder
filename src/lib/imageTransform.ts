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
 * Returns the image URL as-is (sem transform), mas reescrevendo o host
 * para o domínio público de imagens.
 */
export function getTransformedImageUrl(
  url: string | null | undefined,
  _width = 600,
  _quality = 80,
): string {
  return rewriteImageHost(url);
}
