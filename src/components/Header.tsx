import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", to: "/" },
  { label: "Teste de Dosha", to: "/teste-de-dosha" },
  { label: "Biblioteca", to: "/biblioteca" },
  { label: "Cursos", to: "/cursos" },
  { label: "Terapeutas", to: "/terapeutas-do-brasil" },
  { label: "Akasha IA", to: "/akasha" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
            alt="Portal Ayurveda"
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-white/20 text-white font-bold"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 pt-12 bg-primary text-primary-foreground border-primary">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-white/20 text-white font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
