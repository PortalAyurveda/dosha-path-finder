import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, LogIn, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const PIE_COLORS: Record<string, string> = {
  Vata: '#4F75FF',
  Pitta: '#FF5C5C',
  Kapha: '#22C55E',
};

const HeaderDoshaPie = ({ vata, pitta, kapha, size = 18 }: { vata: number; pitta: number; kapha: number; size?: number }) => {
  const total = (vata || 0) + (pitta || 0) + (kapha || 0);
  if (total === 0) return null;
  const r = size / 2;
  const slices = [
    { pct: (vata || 0) / total, color: PIE_COLORS.Vata },
    { pct: (pitta || 0) / total, color: PIE_COLORS.Pitta },
    { pct: (kapha || 0) / total, color: PIE_COLORS.Kapha },
  ].filter(s => s.pct > 0);

  // Single dosha covers 100% — render full circle (SVG arc can't draw 360°)
  if (slices.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 rounded-full">
        <circle cx={r} cy={r} r={r} fill={slices[0].color} />
      </svg>
    );
  }

  // Start at 0° (3 o'clock), go counterclockwise to match Recharts
  let cumAngle = 0;
  const paths = slices.map((s, i) => {
    const angle = s.pct * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle - angle) * Math.PI) / 180;
    cumAngle -= angle;
    const x1 = r + r * Math.cos(startRad);
    const y1 = r - r * Math.sin(startRad);
    const x2 = r + r * Math.cos(endRad);
    const y2 = r - r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return <path key={i} d={`M${r},${r} L${x1},${y1} A${r},${r} 0 ${large} 0 ${x2},${y2} Z`} fill={s.color} />;
  });
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 rounded-full">{paths}</svg>;
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, doshaResult, profile, signOut } = useUser();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const doshaId = searchParams.get("id");
  const akashaId = doshaResult?.idPublico || doshaId || localStorage.getItem("activeDoshaId");
  const akashaLink = akashaId ? `/akasha?id=${akashaId}` : "/akasha";

  const navLinks = [
    { label: "Início", to: "/" },
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Blog", to: "/blog" },
    { label: "Cursos", to: "/cursos" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
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
                    isActive(link.to)
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
                    onClick={() => { setOpen(false); handleSignOut(); }}
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
            src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/simbolo-positivo.svg"
            alt="Portal Ayurveda"
            className="h-9 w-auto block sm:hidden"
          />
        </Link>

        {/* RIGHT — Profile with pie favicon */}
        <div className="flex items-center gap-1.5">
            {doshaResult ? (
              <Link
                to={profileLink}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white backdrop-blur-sm hover:bg-white/90 transition-colors border border-border/30"
              >
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[60px] sm:max-w-[100px]">
                  {firstName}
                </span>
                <HeaderDoshaPie
                  vata={doshaResult.vatascore ?? 0}
                  pitta={doshaResult.pittascore ?? 0}
                  kapha={doshaResult.kaphascore ?? 0}
                  size={20}
                />
              </Link>
            ) : user ? (
              <Link
                to="/meu-dosha"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors"
              >
                {userInitial.toUpperCase()}
              </Link>
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
      </div>
    </header>
  );
};

export default Header;
