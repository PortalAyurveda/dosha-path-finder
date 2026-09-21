import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "https://portalayurveda.com";

// O build (scripts/prerender-og.ts) grava em cada página um canonical carimbado com a rota
// do arquivo (atributo data-rota), que pode apontar para outro endereço (ex.: vídeo curto -> longo).
// Lido UMA vez, na carga do módulo, antes de qualquer efeito: se fosse lido dentro do efeito,
// o hook leria de volta o que ele mesmo escreveu.
// Regra: o valor do build só vale quando a rota carimbada é a URL aberta. Em navegação
// interna a página passa a declarar a própria URL, como sempre foi.
const ASSADO: { rota: string; href: string } | null = (() => {
  if (typeof document === "undefined") return null;
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"][data-rota]');
  if (!link) return null;
  const rota = link.getAttribute("data-rota") || "";
  const href = link.getAttribute("href") || "";
  return rota && href ? { rota, href } : null;
})();

function normalizar(caminho: string): string {
  if (!caminho) return "/";
  return caminho.length > 1 && caminho.endsWith("/") ? caminho.slice(0, -1) : caminho;
}

export function useCanonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    if (ASSADO && normalizar(ASSADO.rota) === normalizar(pathname)) {
      link.href = ASSADO.href;
      return;
    }

    link.href = `${BASE}${pathname}`;
  }, [pathname]);
}
