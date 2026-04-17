import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "https://www.portalayurveda.com";

export function useCanonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href = `${BASE}${pathname}`;
  }, [pathname]);
}
