import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // O canonical é escrito por DOM pelo hook global useCanonical (em RoutedApp, o pai
  // desta página). Como o efeito do pai roda DEPOIS do efeito do filho, o setTimeout
  // é obrigatório: sem ele o canonical volta logo em seguida.
  useEffect(() => {
    const remover = () =>
      document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    remover();
    const t = window.setTimeout(remover, 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <Helmet defer={false}>
        <title>Página não encontrada — Portal Ayurveda</title>
        <meta name="description" content="Este endereço não existe ou foi movido. Volte para a página inicial do Portal Ayurveda." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Página não encontrada</h1>
          <p className="mb-4 text-xl text-muted-foreground">Este endereço não existe ou foi movido.</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
