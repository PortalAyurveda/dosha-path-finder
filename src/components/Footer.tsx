import { Youtube, Instagram, ShoppingBag } from "lucide-react";
import { useLocation } from "react-router-dom";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const Footer = () => {
  const { pathname } = useLocation();
  const isSamkhya = pathname.startsWith("/samkhya");

  const bgStyle = isSamkhya ? { background: samkhyaTokens.roxo } : undefined;
  const textColor = isSamkhya ? samkhyaTokens.footerTexto : undefined;
  const linkClass = isSamkhya
    ? "inline-flex items-center gap-2 text-sm transition-colors hover:opacity-100"
    : "inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors";

  // Para hover em ouro nos links Samkhya, usamos onMouseOver inline (estilo dinâmico simples)
  const linkStyle = isSamkhya ? { color: textColor } : undefined;

  return (
    <footer
      className={`mt-16 text-primary-foreground ${isSamkhya ? "" : "bg-primary"}`}
      style={bgStyle}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              width={160}
              height={40}
              className="h-10 w-auto brightness-0 invert mb-4 mx-auto sm:mx-0"
            />
            <p className="text-sm max-w-xs" style={isSamkhya ? { color: textColor, opacity: 0.85 } : { color: "rgba(255,255,255,0.7)" }}>
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-4 items-center sm:items-start">
              <a
                href="https://www.youtube.com/@portalayurveda"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                style={linkStyle}
                onMouseEnter={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.ouro) : undefined}
                onMouseLeave={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.footerTexto) : undefined}
              >
                <Youtube className="h-5 w-5" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/edson_ayurveda"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                style={linkStyle}
                onMouseEnter={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.ouro) : undefined}
                onMouseLeave={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.footerTexto) : undefined}
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
              <a
                href="https://samkhya.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                style={linkStyle}
                onMouseEnter={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.ouro) : undefined}
                onMouseLeave={isSamkhya ? (e) => (e.currentTarget.style.color = samkhyaTokens.footerTexto) : undefined}
              >
                <ShoppingBag className="h-5 w-5" />
                Loja Samkhya
              </a>
            </div>
          </div>

          <p className="text-xs" style={isSamkhya ? { color: textColor, opacity: 0.7 } : { color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} portalayurveda.com — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
