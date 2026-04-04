import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-surface-sky mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img
              src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
              alt="Portal Ayurveda"
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Saúde integrativa personalizada com base na sabedoria milenar do Ayurveda.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold mb-3">Navegação</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/teste-de-dosha" className="hover:text-primary transition-colors">Teste de Dosha</Link>
              <Link to="/biblioteca" className="hover:text-primary transition-colors">Biblioteca</Link>
              <Link to="/cursos" className="hover:text-primary transition-colors">Cursos</Link>
              <Link to="/terapeutas-do-brasil" className="hover:text-primary transition-colors">Terapeutas</Link>
            </nav>
          </div>

          {/* Loja */}
          <div>
            <h4 className="text-sm font-bold mb-3">Loja</h4>
            <a
              href="https://www.lojasamkhya.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:underline font-medium"
            >
              Loja Samkhya →
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              © {new Date().getFullYear()} Portal Ayurveda. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
