import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, ListTodo, ImageIcon, FileText, Store, Library, MessageCircle, Users, ClipboardList, Video, ListChecks, ShoppingCart, Inbox, Crown, History, Soup, LayoutDashboard, Package, Tag, Megaphone, Ticket, GraduationCap, RefreshCw, Network, LayoutTemplate, DollarSign, BookOpen, Sparkles, Mail, Menu, ChevronDown } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/dashboard-2", label: "Dashboard 2.0", icon: Network },
  { to: "/admin/akasha", label: "Akasha", icon: MessageCircle },
  { to: "/admin/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/admin/blog", label: "Artigos", icon: FileText },
  { to: "/admin/vendas/akasha", label: "Assinaturas Premium", icon: Crown },
  { to: "/admin/aula", label: "Aulas", icon: Video },
  { to: "/admin/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/admin/banners", label: "Banners", icon: LayoutTemplate },
  { to: "/admin/certificados", label: "Certificados", icon: Award },
  { to: "/admin/cobranca", label: "Cobranças", icon: DollarSign },
  { to: "/admin/cupons", label: "Cupons", icon: Ticket },
  { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { to: "/admin/escola", label: "Escola", icon: GraduationCap },
  { to: "/admin/emails", label: "Emails", icon: Mail },
  { to: "/admin/devlog", label: "Devlog", icon: History },
  { to: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/admin/estoque", label: "Estoque & Produção", icon: Package },
  { to: "/admin/imagens", label: "Imagens", icon: ImageIcon },
  { to: "/admin/loja", label: "Loja Samkhya", icon: Store },
  { to: "/admin/mensagens", label: "Mensagens", icon: Inbox },
  { to: "/admin/mockups", label: "Mockups", icon: Sparkles },
  { to: "/admin/revisoes", label: "Revisões", icon: RefreshCw },
  { to: "/admin/rotinas", label: "Rotinas", icon: Soup },
  { to: "/admin/terapeutas", label: "Terapeutas", icon: Users },
  { to: "/admin/teste", label: "Teste — Conteúdo", icon: ClipboardList },
  { to: "/admin/teste/registros", label: "Teste — Registros", icon: ListChecks },
  { to: "/admin/tags", label: "Tags", icon: Tag },
  { to: "/admin/tarefas", label: "Tarefas", icon: ListTodo },
  { to: "/admin/loja/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/admin/webinars", label: "Webinars", icon: Megaphone },
];

const AdminNav = () => {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const atual = links.find((l) => l.to === pathname);

  return (
    <nav className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 shrink-0"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
        >
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">{atual ? atual.label : "Admin"}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
        </Button>

        {!aberto && (
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide flex gap-1.5 py-0.5">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Button
                  key={to}
                  asChild
                  size="sm"
                  variant={active ? "default" : "ghost"}
                  className="gap-1.5 shrink-0 text-xs h-8"
                >
                  <Link to={to}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {aberto && (
        <div className="max-w-6xl mx-auto px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 max-h-[60vh] overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Button
                key={to}
                asChild
                size="sm"
                variant={active ? "default" : "outline"}
                className="gap-2 justify-start text-xs h-8"
                onClick={() => setAberto(false)}
              >
                <Link to={to}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default AdminNav;

