import { Link } from "react-router-dom";
import { Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm text-white/70">
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

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-white">Navegação</h4>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/teste-de-dosha" className="hover:text-white transition-colors">Teste de Dosha</Link>
              <Link to="/biblioteca" className="hover:text-white transition-colors">Biblioteca</Link>
              <Link to="/cursos" className="hover:text-white transition-colors">Cursos</Link>
              <Link to="/terapeutas-do-brasil" className="hover:text-white transition-colors">Terapeutas</Link>
            </nav>
            <h4 className="text-sm font-bold mb-2 mt-4 text-white">Doshas</h4>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/dosha/vata" className="hover:text-white transition-colors">🌬️ Vata</Link>
              <Link to="/dosha/pitta" className="hover:text-white transition-colors">☀️ Pitta</Link>
              <Link to="/dosha/kapha" className="hover:text-white transition-colors">⛰️ Kapha</Link>
            </nav>
          </div>

          {/* Loja */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-white">Loja</h4>
            <a
              href="https://www.lojasamkhya.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:underline font-medium"
            >
              Loja Samkhya →
            </a>
            <p className="text-xs text-white/50 mt-4">
              © {new Date().getFullYear()} Portal Ayurveda. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
