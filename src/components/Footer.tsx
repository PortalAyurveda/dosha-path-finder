import { Youtube, Instagram, ShoppingBag } from "lucide-react";

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
              width={160}
              height={40}
              className="h-10 w-auto brightness-0 invert mb-4 mx-auto sm:mx-0"
            />
            <p className="text-sm text-white/70 max-w-xs">
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-4 items-center sm:items-start">
              <a
                href="https://www.youtube.com/@portalayurveda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/edson_ayurveda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
              <a
                href="https://samkhya.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                Loja Samkhya
              </a>
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} portalayurveda.com — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
