import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, LogIn, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, doshaResult, profile, signOut } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const doshaId = searchParams.get("id");
  const showAkasha = Boolean(doshaResult || user);
  const akashaId = doshaResult?.idPublico || doshaId || localStorage.getItem("activeDoshaId");
  const akashaLink = akashaId ? `/akasha?id=${akashaId}` : "/akasha";

  const navLinks = [
    { label: "Início", to: "/" },
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Blog", to: "/blog" },
    { label: "Cursos", to: "/cursos" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
    ...(showAkasha ? [{ label: "✨ Akasha IA", to: akashaLink }] : []),
  ];

  const firstName = doshaResult?.nome?.split(" ")[0] 
    || profile?.nome?.split(" ")[0] 
    || user?.email?.split("@")[0] 
    || "";

  const profileLink = doshaResult?.idPublico
    ? `/meu-dosha?id=${doshaResult.idPublico}`
    : "/meu-dosha";

  const userInitial = profile?.nome?.[0] || user?.email?.[0] || "?";

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* LEFT — Hamburger menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="bg-white text-primary font-semibold hover:bg-white/90 gap-1.5">
              <Menu className="h-5 w-5" />
              <span className="text-sm font-medium">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-12 bg-primary text-primary-foreground border-primary">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    link.label.includes("Akasha")
                      ? "bg-akasha/30 text-white font-bold border border-akasha/40"
                      : isActive(link.to)
                        ? "bg-white/20 text-white font-bold"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="border-t border-white/20 my-2" />
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* CENTER — Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <img
            src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/b8f47f-6144676c30ec476dbc1f8c5c8812eb1dmv2-1.png"
            alt="Portal Ayurveda"
            className="h-10 w-auto hidden sm:block"
          />
          <img
            src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/simbolo-positivo.png"
            alt="Portal Ayurveda"
            className="h-9 w-auto block sm:hidden"

          />
        </Link>

        {/* RIGHT — Login or Profile */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1.5">
            {doshaResult ? (
              <>
                <Link
                  to={profileLink}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors border border-white/20"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-[100px]">
                    {firstName}
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-bold">
                    <span style={{ color: "#93C5FD" }}>V:{doshaResult.vatascore ?? 0}</span>
                    <span style={{ color: "#FCA5A5" }}>P:{doshaResult.pittascore ?? 0}</span>
                    <span style={{ color: "#86EFAC" }}>K:{doshaResult.kaphascore ?? 0}</span>
                  </span>
                </Link>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={signOut}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                      aria-label="Sair"
                    >
                      <LogOut className="h-4 w-4 text-white/70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Sair</TooltipContent>
                </Tooltip>
              </>
            ) : user ? (
              <>
                <Link
                  to="/meu-dosha"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-colors"
                >
                  {userInitial.toUpperCase()}
                </Link>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={signOut}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                      aria-label="Sair"
                    >
                      <LogOut className="h-4 w-4 text-white/70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Sair</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Link to="/entrar">
                <Button
                  size="sm"
                  className="bg-white text-primary font-semibold hover:bg-white/90 gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;
