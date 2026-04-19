import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, LogIn, LogOut, ShoppingBag, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const SAMKHYA_LOGO = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/samkhya/lg-samkhya.png";

const PIE_COLORS: Record<string, string> = {
  Vata: '#4F75FF',
  Pitta: '#FF5C5C',
  Kapha: '#22C55E',
};

const HeaderDoshaPie = ({ vata, pitta, kapha, size = 22 }: { vata: number; pitta: number; kapha: number; size?: number }) => {
  const total = (vata || 0) + (pitta || 0) + (kapha || 0);
  if (total === 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const innerR = r * 0.45;
  const slices = [
    { pct: (vata || 0) / total, color: PIE_COLORS.Vata },
    { pct: (pitta || 0) / total, color: PIE_COLORS.Pitta },
    { pct: (kapha || 0) / total, color: PIE_COLORS.Kapha },
  ].filter((s) => s.pct > 0);

  if (slices.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block shrink-0 overflow-visible">
        <circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
        <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" />
      </svg>
    );
  }

  let cumAngle = -90;
  const paths = slices.map((s, i) => {
    const angle = s.pct * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    const x1Outer = cx + r * Math.cos(startRad);
    const y1Outer = cy + r * Math.sin(startRad);
    const x2Outer = cx + r * Math.cos(endRad);
    const y2Outer = cy + r * Math.sin(endRad);
    const x1Inner = cx + innerR * Math.cos(endRad);
    const y1Inner = cy + innerR * Math.sin(endRad);
    const x2Inner = cx + innerR * Math.cos(startRad);
    const y2Inner = cy + innerR * Math.sin(startRad);
    const large = angle > 180 ? 1 : 0;
    const d = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${r} ${r} 0 ${large} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x2Inner} ${y2Inner}`,
      "Z",
    ].join(" ");
    cumAngle += angle;
    return <path key={i} d={d} fill={s.color} />;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block shrink-0 overflow-visible">
      {paths}
    </svg>
  );
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, doshaResult, profile, signOut } = useUser();

  const isSamkhya = location.pathname.startsWith("/samkhya");

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
    { label: "Loja Samkhya", to: "/samkhya" },
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Artigos", to: "/blog" },
    { label: "Cursos", to: "/cursos" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
    { label: "Métricas", to: "/metricas" },
  ];

  const firstName = doshaResult?.nome?.split(" ")[0] 
    || profile?.nome?.split(" ")[0] 
    || user?.email?.split("@")[0] 
    || "";

  const profileLink = doshaResult?.idPublico
    ? `/meu-dosha?id=${doshaResult.idPublico}`
    : "/meu-dosha";

  const userInitial = profile?.nome?.[0] || user?.email?.[0] || "?";

  // Estilo dinâmico para fundo do header
  const headerBg = isSamkhya
    ? { background: samkhyaTokens.roxo }
    : undefined;
  const sheetBg = isSamkhya
    ? { background: samkhyaTokens.roxo }
    : undefined;
  const buttonTextColor = isSamkhya ? samkhyaTokens.roxo : undefined;

  return (
    <header
      className={`sticky top-0 z-50 w-full text-primary-foreground shadow-md ${isSamkhya ? "" : "bg-primary"}`}
      style={headerBg}
    >
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* LEFT — Hamburger menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="bg-white font-semibold hover:bg-white/90 gap-1.5"
              style={buttonTextColor ? { color: buttonTextColor } : undefined}
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm font-medium">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={`w-72 pt-12 text-primary-foreground border-primary ${isSamkhya ? "" : "bg-primary"}`}
            style={sheetBg}
          >
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

        {/* CENTER — Logo (swap when in /samkhya/*) */}
        {isSamkhya ? (
          <Link to="/samkhya" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <img
              src={SAMKHYA_LOGO}
              alt="Loja Samkhya"
              className="h-16 w-auto brightness-0 invert"
              style={{ maxWidth: "276px" }}
            />
          </Link>
        ) : (
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
        )}

        {/* RIGHT — Profile with pie favicon */}
        <div className="flex items-center gap-1.5">
            {doshaResult ? (
              <Link
                to={profileLink}
                className="flex items-center gap-2 pl-3 pr-2.5 py-1 rounded-full bg-white hover:bg-white/90 transition-colors border border-border/30 shadow-sm"
              >
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[80px] sm:max-w-[120px] leading-none">
                  {firstName}
                </span>
                <span className="shrink-0 inline-flex items-center justify-center">
                  <HeaderDoshaPie
                    vata={doshaResult.vatascore ?? 0}
                    pitta={doshaResult.pittascore ?? 0}
                    kapha={doshaResult.kaphascore ?? 0}
                    size={20}
                  />
                </span>
              </Link>
            ) : user ? (
              <Link
                to="/meu-dosha"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white font-bold text-sm hover:bg-white/90 transition-colors"
                style={buttonTextColor ? { color: buttonTextColor } : undefined}
              >
                {userInitial.toUpperCase()}
              </Link>
            ) : (
              <Link to="/entrar">
                <Button
                  size="sm"
                  className="bg-white font-semibold hover:bg-white/90 gap-1.5"
                  style={buttonTextColor ? { color: buttonTextColor } : undefined}
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
