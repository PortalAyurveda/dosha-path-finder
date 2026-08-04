// Detecção de navegador embutido (in-app) de Instagram / Facebook.
// Mesmo teste de user agent usado para marcar `in_app` em `login_eventos`.
export const IN_APP_UA_REGEX = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i;

export function isInAppBrowser(ua?: string): boolean {
  const agent = ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return IN_APP_UA_REGEX.test(agent);
}
