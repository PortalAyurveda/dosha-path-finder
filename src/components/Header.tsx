import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, LogIn, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { PieChart, Pie, Cell } from "recharts";

const DOSHA_COLORS = {
  vata: "#93C5FD",
  pitta: "#FCA5A5",
  kapha: "#86EFAC",
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, doshaResult, profile } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const doshaId = searchParams.get("id");
  const showAkasha = Boolean(doshaResult || user);
  const akashaId = doshaResult?.idPublico || doshaId || localStorage.getItem("activeDoshaId");
  const akashaLink = akashaId ? `/akasha?id=${akashaId}` : "/akasha";

  const navLinks = [
    { label: "Início", to: "/" },
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Cursos", to: "/cursos" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
    ...(showAkasha ? [{ label: "✨ Akasha IA", to: akashaLink }] : []),
  ];

  // Mini pie chart data
  const pieData = doshaResult
    ? [
        { name: "Vata", value: doshaResult.vatascore || 0 },
        { name: "Pitta", value: doshaResult.pittascore || 0 },
        { name: "Kapha", value: doshaResult.kaphascore || 0 },
      ]
    : [];

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
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
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
            </nav>
          </SheetContent>
        </Sheet>

        {/* CENTER — Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <img
            src="https://static.wixstatic.com/media/b8f47f_6144676c30ec476dbc1f8c5c8812eb1d~mv2.png"
            alt="Portal Ayurveda"
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>

        {/* RIGHT — Login or Profile */}
        <div className="flex items-center gap-2">
          {doshaResult ? (
            <Link
              to={profileLink}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <PieChart width={32} height={32}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx={16}
                  cy={16}
                  innerRadius={6}
                  outerRadius={14}
                  strokeWidth={0}
                >
                  <Cell fill={DOSHA_COLORS.vata} />
                  <Cell fill={DOSHA_COLORS.pitta} />
                  <Cell fill={DOSHA_COLORS.kapha} />
                </Pie>
              </PieChart>
              <span className="hidden sm:inline text-sm font-semibold text-white">
                {doshaResult.doshaprincipal || "Dosha"}
              </span>
            </Link>
          ) : user ? (
            <Link
              to="/meu-dosha"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-colors"
            >
              {userInitial.toUpperCase()}
            </Link>
          ) : (
            <Link to="/entrar">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
