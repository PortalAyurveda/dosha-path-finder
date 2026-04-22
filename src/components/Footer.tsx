import { Youtube, Instagram, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const Footer = () => {
  const { pathname } = useLocation();
  const isSamkhya = pathname.startsWith("/samkhya");

  const bgStyle = isSamkhya ? { background: samkhyaTokens.roxo } : undefined;
  const textColor = isSamkhya ? samkhyaTokens.footerTexto : undefined;
  const linkClass = isSamkhya
    ? "inline-flex items-center gap-2 text-sm transition-colors hover:opacity-100"
    : "inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors";
  const linkStyle = isSamkhya ? { color: textColor } : undefined;

  const socialEnter = isSamkhya
    ? (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = samkhyaTokens.ouro)
    : undefined;
  const socialLeave = isSamkhya
    ? (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = samkhyaTokens.footerTexto)
    : undefined;

  return (
    <footer
      className={`mt-16 text-primary-foreground ${isSamkhya ? "" : "bg-primary"}`}
      style={bgStyle}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Top row: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          {/* Left: tagline */}
          <div className="text-center md:text-left">
            <p
              className="text-sm max-w-xs mx-auto md:mx-0"
              style={
                isSamkhya
                  ? { color: textColor, opacity: 0.85 }
                  : { color: "rgba(255,255,255,0.8)" }
              }
            >
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
          </div>

          {/* Center: logo */}
          <div className="flex justify-center">
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              width={180}
              height={48}
              className="h-12 w-auto brightness-0 invert"
            />
          </div>

          {/* Right: socials */}
          <div className="flex justify-center md:justify-end gap-5">
            <a
              href="https://www.youtube.com/@portalayurveda"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
              onMouseEnter={socialEnter}
              onMouseLeave={socialLeave}
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/edson_ayurveda"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
              onMouseEnter={socialEnter}
              onMouseLeave={socialLeave}
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <Link
              to="/samkhya"
              className={linkClass}
              style={linkStyle}
              onMouseEnter={socialEnter}
              onMouseLeave={socialLeave}
              aria-label="Loja Samkhya"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div
          className="mt-8 pt-6 border-t text-center"
          style={{
            borderColor: isSamkhya
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.15)",
          }}
        >
          <p
            className="text-xs"
            style={
              isSamkhya
                ? { color: textColor, opacity: 0.7 }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            © {new Date().getFullYear()} portalayurveda.com — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
