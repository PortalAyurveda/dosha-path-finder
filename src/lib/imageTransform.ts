/**
 * Domínio público para servir imagens do Supabase Storage.
 * O bucket continua sendo o mesmo no Supabase, mas as URLs são reescritas
 * para o domínio customizado api.portalayurveda.com (que faz proxy/redirect
 * para o endpoint original do projeto Supabase).
 *
 * As imagens são servidas sempre pelo arquivo original, sem transformação:
 * nada de endpoint /render/image/, que consome a cota paga
 * "Storage Image Transformations".
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
 * Devolve a URL da imagem com o domínio público api.portalayurveda.com.
 * Serve sempre o arquivo original: as imagens já são publicadas leves (WebP),
 * e o endpoint /render/image/ do Supabase consome a cota paga
 * "Storage Image Transformations". Os parâmetros width e quality ficam
 * na assinatura só para compatibilidade com quem chama.
 */
export function getTransformedImageUrl(
  url: string | null | undefined,
  _width = 600,
  _quality = 75,
): string {
  return rewriteImageHost(url);
}
