import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, LogIn, LogOut, ShoppingBag, ShoppingCart, Home, CalendarHeart, ChevronDown, Search, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { useImmersive } from "@/contexts/ImmersiveContext";
import { useEscolaAluno } from "@/hooks/useEscolaAluno";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import samkhyaLogo from "@/assets/samkhya-logo-cropped.png";
import GlobalSearch from "@/components/GlobalSearch";


const PIE_COLORS: Record<string, string> = {
  Vata: '#6B8AFF',
  Pitta: '#FF7676',
  Kapha: '#9ED88B',
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [temCursos, setTemCursos] = useState(false);


  const location = useLocation();
  const navigate = useNavigate();
  const { user, doshaResult, profile, signOut } = useUser();
  const { totalItens, abrirCarrinho } = useCart();
  const { immersive } = useImmersive();
  const { aluno: escolaAluno } = useEscolaAluno();


  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setTemCursos(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("curso_matriculas")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "ativa")
        .limit(1);
      if (!cancelled) setTemCursos((data ?? []).length > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isSamkhya = location.pathname.startsWith("/samkhya");

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const isPremium = profile?.is_premium === true;

  const temAcessoRotina =
    profile?.is_premium === true ||
    (profile?.subscription_status === "active" &&
     ["rotina","mensal","anual"].includes(profile?.plano ?? "") &&
     (!profile?.premium_until || new Date(profile.premium_until) > new Date()));

  const fezTeste = !!doshaResult?.idPublico;

  const profileLink = doshaResult?.idPublico
    ? `/meu-dosha?id=${doshaResult.idPublico}`
    : "/meu-dosha";

  const jornadaLinks = [
    { label: "Meu Dosha", to: profileLink },
    { label: "Minha Rotina", to: "/minha-rotina" },
    { label: "Revisão Mensal", to: "/revisao" },
  ];
  const aprenderLinks = [
    { label: "Biblioteca", to: "/biblioteca" },
    { label: "Cursos", to: "/cursos" },
  ];
  const cuidarLinks = [
    { label: "Loja Samkhya", to: "/samkhya" },
    { label: "Terapeutas", to: "/terapeutas-do-brasil" },
  ];


  const firstName = doshaResult?.nome?.split(" ")[0] 
    || profile?.nome?.split(" ")[0] 
    || user?.email?.split("@")[0] 
    || "";


  const userInitial = profile?.nome?.[0] || user?.email?.[0] || "?";

  // Estilo dinâmico para fundo do header
  const headerBg = isSamkhya
    ? { background: samkhyaTokens.roxo }
    : undefined;
  const sheetBg = isSamkhya
    ? { background: samkhyaTokens.roxo }
    : undefined;
  const buttonTextColor = isSamkhya ? samkhyaTokens.roxo : undefined;

  if (immersive) {
    return (
      <header
        className={`sticky top-0 z-50 w-full text-primary-foreground shadow-md ${isSamkhya ? "" : "bg-primary"}`}
        style={headerBg}
      >
        <div className="max-w-6xl mx-auto grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
          <div className="justify-self-start">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 hover:text-white gap-1.5 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Button>
          </div>
          <div className="justify-self-center flex items-center h-full">
            <img
              src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg"
              alt="Portal Ayurveda"
              width={28}
              height={28}
              className="h-7 w-auto"
            />
          </div>
          <div className="justify-self-end" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full text-primary-foreground shadow-md ${isSamkhya ? "" : "bg-primary"}`}
      style={headerBg}
    >
      <div className="max-w-6xl mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
        {/* LEFT — Hamburger (mobile) + Mobile search trigger + Desktop nav */}
        <div className="flex items-center gap-1.5 justify-self-start min-w-0">
          {/* Mobile: search trigger (icon) on the LEFT — opens fixed overlay */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Pesquisar"
            aria-expanded={searchOpen}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm"
          >
            <Search className="h-[18px] w-[18px] text-primary" strokeWidth={2.2} />
          </button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="bg-white font-semibold hover:bg-white/90 gap-1.5 lg:hidden"
                style={buttonTextColor ? { color: buttonTextColor } : undefined}
              >
                <Menu className="h-5 w-5 bg-primary-foreground text-primary" />
                <span className="text-sm font-medium">Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className={`w-72 pt-12 text-primary-foreground border-primary overflow-y-auto ${isSamkhya ? "" : "bg-primary"}`}
              style={sheetBg}
            >
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <nav className="flex flex-col gap-4">
                {!user && (
                  <Link
                    to="/teste-de-dosha"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-bold bg-white text-primary hover:bg-white/90 transition-colors text-center"
                  >
                    Fazer Teste de Dosha
                  </Link>
                )}

                {user && (
                  <div className="flex flex-col gap-1">
                    <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">Minha Jornada</div>
                    {jornadaLinks.map((link) => {
                      const active = isActive(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${active ? "bg-secondary/30 text-white font-bold" : "bg-secondary/20 text-white hover:bg-secondary/30"}`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">Aprender</div>
                  {aprenderLinks.map((link) => {
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${active ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">Cuidar</div>
                  {cuidarLinks.map((link) => {
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${active ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                {escolaAluno && (
                  <Link
                    to="/escola/aluno"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-semibold bg-[#FACC15] text-[#352F54] hover:bg-[#EAB308] transition-colors text-center"
                  >
                    Escola
                  </Link>
                )}

                <Link
                  to="/assinar"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-bold bg-white text-primary hover:bg-white/90 transition-colors text-center"
                >
                  Assinar
                </Link>

                {user && (
                  <>
                    <div className="border-t border-white/20 my-1" />
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-3 whitespace-nowrap">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2 py-2 rounded-lg text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1 whitespace-nowrap">
                    Minha Jornada
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white">
                  {jornadaLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/teste-de-dosha"
                className="px-3 py-2 rounded-lg text-sm font-bold bg-white text-primary hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Teste de Dosha
              </Link>
            )}
            {aprenderLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active ? "bg-white/20 text-white" : "text-white/85 hover:text-white hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Loja sempre visível */}
            <Link
              to="/samkhya"
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive("/samkhya") ? "bg-white/20 text-white" : "text-white/85 hover:text-white hover:bg-white/10"}`}
            >
              Loja
            </Link>
            {escolaAluno && (
              <Link
                to="/escola/aluno"
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive("/escola/aluno") ? "bg-white/20 text-white" : "text-white/85 hover:text-white hover:bg-white/10"}`}
              >
                Escola
              </Link>
            )}

          </nav>
        </div>



        {/* CENTER — Logo (swap when in /samkhya/*) */}
        <div className="flex min-w-0 justify-center justify-self-center items-center h-full overflow-visible">
          <Link
            to={isSamkhya ? "/samkhya" : (location.pathname.startsWith("/aula") ? "/curso/alimentacao" : "/")}
            className="flex items-center justify-center animate-fade-in"
          >
            <img
              src={samkhyaLogo}
              alt="Loja Samkhya"
              width={140}
              height={46}
              className={`h-[46px] w-auto brightness-0 invert ${isSamkhya ? "block" : "hidden"}`}
            />
            <img
              src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-6144676c30ec476dbc1f8c5c8812eb1dmv2-1.png"
              alt="Portal Ayurveda"
              width={160}
              height={40}
              className={`h-10 w-auto ${isSamkhya ? "hidden" : "hidden sm:block"}`}
            />
            <img
              src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg"
              alt="Portal Ayurveda"
              width={36}
              height={36}
              className={`h-9 w-auto ${isSamkhya ? "hidden" : "block sm:hidden"}`}
            />
          </Link>
        </div>

        {/* RIGHT — Search + cart + agenda + profile */}
        <div className="flex items-center gap-1.5 justify-self-end justify-end w-full">
          {/* Desktop: inline expanded search takes cart/agenda space */}
          {searchOpen && (
            <div className="hidden lg:flex flex-1 min-w-0 justify-end">
              <div className="w-full max-w-md">
                <GlobalSearch open layout="inline" onOpenChange={setSearchOpen} />
              </div>
            </div>
          )}

          {/* Desktop: compact search icon when closed */}
          {!searchOpen && (
            <div className="hidden lg:block ml-auto">
              <GlobalSearch open={false} onOpenChange={setSearchOpen} />
            </div>
          )}


          <button
            type="button"
            onClick={abrirCarrinho}
            aria-label={`Abrir carrinho (${totalItens} itens)`}
            className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm ${searchOpen ? "lg:hidden" : ""}`}
            style={buttonTextColor ? { color: buttonTextColor } : { color: "hsl(var(--primary))" }}
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.2} />
            {totalItens > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white"
                style={{ background: samkhyaTokens.ouro }}
              >
                {totalItens}
              </span>
            )}
          </button>
          {temAcessoRotina && (
            <Link
              to="/minha-rotina"
              aria-label="Minha rotina"
              className={`flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm ${searchOpen ? "lg:hidden" : ""}`}
            >
              <CalendarHeart className="h-[18px] w-[18px] text-secondary" strokeWidth={2.2} />
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {doshaResult ? (
                  <button className="flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-full bg-white hover:bg-white/90 transition-colors border border-border/30 shadow-sm">
                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[80px] sm:max-w-[120px] leading-none">
                      {firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : ""}
                    </span>
                    <span className="shrink-0 inline-flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <HeaderDoshaPie
                          vata={doshaResult.vatascore ?? 0}
                          pitta={doshaResult.pittascore ?? 0}
                          kapha={doshaResult.kaphascore ?? 0}
                          size={20}
                        />
                      )}
                    </span>
                  </button>
                ) : (
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white font-bold text-sm hover:bg-white/90 transition-colors shadow-sm overflow-hidden"
                    style={buttonTextColor ? { color: buttonTextColor } : { color: "hsl(var(--primary))" }}
                    aria-label="Minha conta"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" width={36} height={36} className="w-9 h-9 object-cover" />
                    ) : (
                      userInitial.toUpperCase()
                    )}
                  </button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {doshaResult && (
                  <DropdownMenuItem asChild>
                    <Link to={profileLink}>Meu dosha</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/minha-rotina">Minha rotina</Link>
                </DropdownMenuItem>
                {temCursos && (
                  <DropdownMenuItem asChild>
                    <Link to="/meu-perfil?section=cursos">
                      <BookOpen className="h-4 w-4 mr-2" /> Meus cursos
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/meu-perfil">Minha conta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/entrar">
              <Button
                size="sm"
                className="bg-white text-primary font-semibold hover:bg-white/90 hover:text-primary gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: full-screen search overlay (fixed, above header) */}
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/40" onClick={() => setSearchOpen(false)}>
          <div
            className="absolute top-0 left-0 right-0 bg-primary px-3 pt-3 pb-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GlobalSearch open layout="inline" onOpenChange={setSearchOpen} />
          </div>
        </div>
      )}

    </header>
  );
};


export default Header;
