import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isInAppBrowser } from "@/lib/inAppBrowser";

type DadosCertificado = {
  liberado: boolean;
  erro?: string;
  nome_exibicao?: string;
  nome_aluno?: string;
  nome_no_perfil?: string | null;
  html?: string;
};

const CertificadoCurso = () => {
  const { slug = "" } = useParams();
  const { user, loading } = useUser();
  const [dados, setDados] = useState(null as DadosCertificado | null);
  const [nome, setNome] = useState("");
  const [nomeSalvo, setNomeSalvo] = useState("");
  const rolagemRef = useRef(null as HTMLDivElement | null);
  const escalaRef = useRef(null as HTMLDivElement | null);
  const folhaRef = useRef(null as HTMLDivElement | null);
  const dentroDeAplicativo = isInAppBrowser();

  useEffect(() => {
    document.body.style.background = "#EDEBE6";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    if (loading || !user || !slug) return;
    (supabase.rpc as any)("certificado_para_imprimir", { p_slug: slug }).then(({ data }: any) => {
      const d = (data ?? { liberado: false }) as DadosCertificado;
      setDados(d);
      setNome(d.nome_aluno ?? "");
      setNomeSalvo((d.nome_no_perfil ?? "").trim());
    });
  }, [loading, user?.id, slug]);

  const htmlLimpo = useMemo(
    () =>
      dados?.html
        ? (DOMPurify.sanitize(dados.html, { ADD_TAGS: ["style"], ADD_ATTR: ["target", "rel"], FORCE_BODY: true }) as string)
        : "",
    [dados?.html],
  );

  const ajustar = () => {
    const folha = folhaRef.current;
    const escala = escalaRef.current;
    const rolagem = rolagemRef.current;
    if (!folha || !escala || !rolagem) return;
    folha.querySelectorAll("[data-campo='nome_aluno']").forEach((el) => {
      el.textContent = nome.trim();
    });
    escala.style.zoom = "1";
    folha.querySelectorAll("[data-caber-max]").forEach((no) => {
      const el = no as HTMLElement;
      const max = parseFloat(el.getAttribute("data-caber-max") || "0");
      const min = parseFloat(el.getAttribute("data-caber-min") || "10");
      let tam = max;
      el.style.fontSize = tam + "pt";
      const limite = el.parentElement ? el.parentElement.clientWidth : 0;
      while (el.offsetWidth > limite && tam > min) {
        tam -= 0.5;
        el.style.fontSize = tam + "pt";
      }
    });
    const natural = folha.offsetWidth;
    const largura = rolagem.clientWidth;
    escala.style.zoom = String(natural > largura && natural > 0 ? largura / natural : 1);
  };

  useEffect(() => {
    ajustar();
    const aoMudar = () => ajustar();
    window.addEventListener("resize", aoMudar);
    (document as any).fonts?.ready?.then(aoMudar);
    (document as any).fonts?.addEventListener?.("loadingdone", aoMudar);
    const t = setTimeout(aoMudar, 800);
    return () => {
      window.removeEventListener("resize", aoMudar);
      (document as any).fonts?.removeEventListener?.("loadingdone", aoMudar);
      clearTimeout(t);
    };
  }, [htmlLimpo, nome]);

  const imprimir = () => {
    const limpo = nome.trim().replace(/\s+/g, " ");
    if (limpo && limpo !== nomeSalvo) {
      setNomeSalvo(limpo);
      supabase.rpc("atualizar_meus_dados", { p_nome_completo: limpo });
    }
    window.print();
  };

  if (loading || (user && dados === null)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to={`/cursos/${slug}/estudar`} replace />;
  if (!dados || !dados.liberado) return <Navigate to={`/cursos/${slug}/estudar?tab=certificado`} replace />;

  return (
    <div id="pagina-impressao" style={{ background: "#EDEBE6", minHeight: "100vh", padding: "16px 8px 40px" }}>
      <Helmet>
        <title>{`Certificado · ${dados.nome_exibicao}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <style>{`
@media print {
  body * { visibility: hidden !important; }
  .no-print { display: none !important; }
  #folha-impressao, #folha-impressao * { visibility: visible !important; }
  #pagina-impressao { padding: 0 !important; min-height: 0 !important; background: none !important; }
  #rolagem-impressao { overflow: visible !important; }
  #escala-certificado { zoom: 1 !important; margin: 0 !important; }
  #folha-impressao { position: static !important; margin: 0 !important; }
}
`}</style>
      <div
        className="no-print"
        style={{ background: "#fff", border: "1px solid #352F54", borderRadius: 12, maxWidth: "210mm", margin: "0 auto 20px", padding: 20 }}
      >
        <Link
          to={`/cursos/${slug}/estudar?tab=certificado`}
          className="flex items-center underline text-[#352F54]"
          style={{ minHeight: 60, fontSize: 17 }}
        >
          ← Voltar para o curso
        </Link>
        <h1 className="font-serif" style={{ fontSize: 22, margin: "4px 0 12px", color: "#352F54" }}>
          Seu certificado
        </h1>
        <label
          htmlFor="nome-certificado"
          style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 6, color: "#352F54" }}
        >
          Seu nome no certificado
        </label>
        <Input
          id="nome-certificado"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="h-14 text-lg border-2 border-[#3F3A52] rounded-[10px]"
        />
        <p style={{ fontSize: 16, margin: "8px 0 16px" }}>
          Escreva seu nome completo, do jeito que deve sair no papel.
        </p>
        {dentroDeAplicativo ? (
          <p style={{ fontSize: 17, margin: 0 }}>
            Você está dentro do aplicativo do Instagram ou do Facebook, e aqui não dá para imprimir. Toque nos três
            pontinhos (⋮) no canto e escolha "Abrir no navegador". Lá o botão Imprimir funciona.
          </p>
        ) : (
          <>
            <Button
              type="button"
              onClick={imprimir}
              disabled={!nome.trim()}
              className="w-full h-14 text-lg gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Printer style={{ width: 24, height: 24 }} />
              Imprimir
            </Button>
            <p style={{ fontSize: 16, marginTop: 10 }}>No celular, esse botão salva em PDF.</p>
          </>
        )}
      </div>
      <div id="rolagem-impressao" ref={rolagemRef} style={{ overflow: "hidden" }}>
        <div id="escala-certificado" ref={escalaRef} style={{ width: "max-content", margin: "0 auto" }}>
          <div id="folha-impressao" ref={folhaRef} dangerouslySetInnerHTML={{ __html: htmlLimpo }} />
        </div>
      </div>
    </div>
  );
};

export default CertificadoCurso;
