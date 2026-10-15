import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface MemoriaBadgeProps {
  onNavigate?: () => void;
  className?: string;
}

const TOOLTIP =
  "Hoje a Akasha lembra das suas conversas de 24h. Assinantes têm memória de 7 dias.";

const MemoriaBadge = ({ onNavigate, className }: MemoriaBadgeProps) => {
  const { profile } = useUser();
  const ativo = profile?.subscription_status === "active";

  if (ativo) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-akasha/10 px-2 py-0.5 text-[10px] font-medium text-akasha ${className ?? ""}`}
        title="Sua memória de conversa dura 7 dias."
      >
        <Sparkles className="h-2.5 w-2.5" />
        Memória de 7 dias ativa
      </span>
    );
  }

  return (
    <Link
      to="/assinar"
      onClick={() => onNavigate?.()}
      title={TOOLTIP}
      aria-label={TOOLTIP}
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:border-akasha/40 hover:text-akasha ${className ?? ""}`}
    >
      Memória de 7 dias
      <Lock className="h-2.5 w-2.5" />
    </Link>
  );
};

export default MemoriaBadge;
