import { Link } from "react-router-dom";
import { Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              className="h-10 w-auto brightness-0 invert mb-4 mx-auto sm:mx-0"
            />
            <p className="text-sm text-white/70 max-w-xs">
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
            <a
              href="https://www.youtube.com/@portalayurveda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-white/80 hover:text-white transition-colors"
            >
              <Youtube className="h-5 w-5" />
              YouTube — Portal Ayurveda
            </a>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Portal Ayurveda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
