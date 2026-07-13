import { Youtube, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const Footer = () => {
  const { pathname } = useLocation();
  const isSamkhya = pathname.startsWith("/samkhya");

  const bgStyle = isSamkhya ? { background: samkhyaTokens.roxo } : undefined;
  const textColor = isSamkhya ? samkhyaTokens.footerTexto : undefined;

  const textStyle = isSamkhya
    ? { color: textColor, opacity: 0.85 }
    : { color: "rgba(255,255,255,0.85)" };
  const mutedStyle = isSamkhya
    ? { color: textColor, opacity: 0.6 }
    : { color: "rgba(255,255,255,0.6)" };
  const headingStyle = isSamkhya
    ? { color: textColor, opacity: 1 }
    : { color: "#fff" };

  const socialEnter = isSamkhya
    ? (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = samkhyaTokens.ouro)
    : undefined;
  const socialLeave = isSamkhya
    ? (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = samkhyaTokens.footerTexto)
    : undefined;

  const jornada = [
    { label: "Teste de Dosha", to: "/teste-de-dosha" },
    { label: "Meu Dosha", to: "/meu-dosha" },
    { label: "Minha Rotina", to: "/minha-rotina" },
    { label: "Revisão Mensal", to: "/revisao" },
  ];
  const conteudo = [
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Artigos", to: "/blog" },
    { label: "Cursos", to: "/cursos" },
    { label: "Métricas do Portal", to: "/metricas" },
  ];
  const portal = [
    { label: "Loja Samkhya", to: "/samkhya" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
    { label: "Assinar", to: "/assinar" },
    { label: "Política de Privacidade", to: "/politica-de-privacidade" },
  ];

  const ColumnLink = ({ to, label }: { to: string; label: string }) => (
    <li>
      <Link
        to={to}
        className="text-sm hover:underline transition-opacity hover:opacity-100"
        style={textStyle}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <footer
      className={`mt-16 text-primary-foreground ${isSamkhya ? "" : "bg-primary"}`}
      style={bgStyle}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Top: brand + 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              width={160}
              height={44}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm max-w-xs" style={textStyle}>
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.youtube.com/@portalayurveda"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex items-center transition-colors"
                style={textStyle}
                onMouseEnter={socialEnter}
                onMouseLeave={socialLeave}
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/edson_ayurveda"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center transition-colors"
                style={textStyle}
                onMouseEnter={socialEnter}
                onMouseLeave={socialLeave}
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Sua Jornada */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={headingStyle}>
              Sua Jornada
            </h3>
            <ul className="space-y-2">
              {jornada.map((l) => (
                <ColumnLink key={l.to} to={l.to} label={l.label} />
              ))}
            </ul>
          </div>

          {/* Conteúdo */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={headingStyle}>
              Conteúdo
            </h3>
            <ul className="space-y-2">
              {conteudo.map((l) => (
                <ColumnLink key={l.to} to={l.to} label={l.label} />
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={headingStyle}>
              Portal
            </h3>
            <ul className="space-y-2">
              {portal.map((l) => (
                <ColumnLink key={l.to} to={l.to} label={l.label} />
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <p className="text-xs" style={mutedStyle}>
            © {new Date().getFullYear()} portalayurveda.com — Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <Link to="/contato" className="hover:underline" style={mutedStyle}>
              Contato & Sugestões
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <Link to="/termos-de-uso" className="hover:underline" style={mutedStyle}>
              Termos de Uso
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <Link to="/devlog" className="hover:underline" style={mutedStyle}>
              Devlog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
