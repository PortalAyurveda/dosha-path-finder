import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Lock } from "lucide-react";
import { getPaletteBranding } from "@/data/landingPalettes";
import { useEscolaAluno, type AlunoRow } from "@/hooks/useEscolaAluno";

const branding = getPaletteBranding("formacao-azul");

export const escolaBranding = branding;

type ShellProps = {
  children: (aluno: AlunoRow) => ReactNode;
};

const EscolaAlunoShell = ({ children }: ShellProps) => {
  const { loading, needsLogin, notApproved, aluno } = useEscolaAluno();

  return (
    <div
      className="min-h-screen"
      style={{ background: branding.warmBg, color: branding.darkColor }}
    >
      <Helmet>
        <title>Formação em Ayurveda — Área do Aluno</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Cabeçalho discreto */}
      <header
        className="w-full border-b"
        style={{ borderColor: `${branding.primaryColor}22`, background: "#fff" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white"
            style={{ background: branding.primaryColor }}
          >
            <GraduationCap className="w-5 h-5" />
          </span>
          <div>
            <p
              className="font-serif font-bold italic leading-tight text-base"
              style={{ color: branding.darkColor }}
            >
              Formação em Ayurveda
            </p>
            <p className="text-xs text-muted-foreground">Área do aluno</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : needsLogin ? (
          <DeniedCard
            title="Entre na sua conta"
            message="Esta área é exclusiva para alunos da Formação. Faça login com o e-mail que você usou na inscrição."
            cta={{ label: "Entrar", to: "/entrar?redirect=/escola/aluno" }}
          />
        ) : notApproved || !aluno ? (
          <DeniedCard
            title="Acesso restrito"
            message="Esta área é exclusiva para alunos da Formação."
          />
        ) : (
          children(aluno)
        )}
      </main>
    </div>
  );
};

const DeniedCard = ({
  title,
  message,
  cta,
}: {
  title: string;
  message: string;
  cta?: { label: string; to: string };
}) => (
  <div
    className="max-w-md mx-auto bg-white rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border p-8 text-center space-y-4"
    style={{ borderColor: `${branding.primaryColor}33` }}
  >
    <span
      className="inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto"
      style={{ background: `${branding.primaryColor}1A`, color: branding.primaryColor }}
    >
      <Lock className="w-5 h-5" />
    </span>
    <h1 className="font-serif text-xl font-bold italic" style={{ color: branding.darkColor }}>
      {title}
    </h1>
    <p className="text-sm text-muted-foreground">{message}</p>
    {cta && (
      <Button
        asChild
        className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
        style={{ background: branding.primaryColor, color: "#fff" }}
      >
        <Link to={cta.to}>{cta.label}</Link>
      </Button>
    )}
  </div>
);

export default EscolaAlunoShell;
