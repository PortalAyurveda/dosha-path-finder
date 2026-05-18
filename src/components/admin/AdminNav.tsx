import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageIcon, FileText, Store, Library, MessageCircle, Users, ClipboardList, Video, ListChecks, ShoppingCart, Inbox, Crown, History, Soup } from "lucide-react";

const links = [
  { to: "/admin", label: "Imagens", icon: ImageIcon },
  { to: "/admin/blog", label: "Artigos", icon: FileText },
  { to: "/admin/akasha", label: "Akasha", icon: MessageCircle },
  { to: "/admin/mensagens", label: "Mensagens", icon: Inbox },
  { to: "/admin/teste", label: "Teste — Conteúdo", icon: ClipboardList },
  { to: "/admin/teste/registros", label: "Teste — Registros", icon: ListChecks },
  { to: "/admin/loja", label: "Loja Samkhya", icon: Store },
  { to: "/admin/loja/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/admin/vendas/akasha", label: "Assinaturas Premium", icon: Crown },
  { to: "/admin/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/admin/terapeutas", label: "Terapeutas", icon: Users },
  { to: "/admin/aula", label: "Aulas", icon: Video },
  { to: "/admin/rotinas", label: "Rotinas", icon: Soup },
  { to: "/admin/devlog", label: "Devlog", icon: History },
];

const AdminNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Button
              key={to}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
              className="gap-2"
            >
              <Link to={to}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminNav;
