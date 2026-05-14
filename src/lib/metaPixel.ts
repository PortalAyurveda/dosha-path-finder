// Helper seguro para disparar eventos do Meta Pixel.
// Não quebra em ambientes onde o Pixel não está carregado.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackPixel = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", event, params);
    } catch {
      /* ignore */
    }
  }
};
