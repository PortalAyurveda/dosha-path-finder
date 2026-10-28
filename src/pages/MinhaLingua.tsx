import { useEffect, useRef } from "react";
import PageContainer from "@/components/PageContainer";

const SCRIPT_URL =
  "https://api.portalayurveda.com/storage/v1/object/public/lingua-filtros/app/minha-lingua.js";

declare global {
  interface Window {
    MinhaLingua?: { montar: (el: HTMLElement) => void };
  }
}

const MinhaLingua = () => {
  const alvo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const montar = () => {
      if (alvo.current && window.MinhaLingua) {
        window.MinhaLingua.montar(alvo.current);
      }
    };

    // Script já carregado antes (a pessoa voltou para a página): monta direto.
    if (window.MinhaLingua) {
      montar();
      return;
    }

    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_URL}"]`
    );
    if (existente) {
      existente.addEventListener("load", montar, { once: true });
      return () => existente.removeEventListener("load", montar);
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", montar, { once: true });
    document.body.appendChild(script);
    return () => script.removeEventListener("load", montar);
  }, []);

  return (
    <PageContainer
      title="Minha língua"
      description="Acompanhe as fotos e a evolução da sua língua."
      noindex
    >
      <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
        Minha língua
      </h1>
      <div id="minha-lingua-app" ref={alvo} />
    </PageContainer>
  );
};

export default MinhaLingua;
