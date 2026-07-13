import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ClaimLockProps {
  idPublico: string;
  children: React.ReactNode;
  titulo?: string;
  microtexto?: string;
}

const ClaimLock = ({
  idPublico,
  children,
  titulo = "Salve seu resultado para desbloquear",
  microtexto = "Leva 30 segundos. Sem senha.",
}: ClaimLockProps) => {
  const navigate = useNavigate();

  const handleClaim = () => {
    localStorage.setItem("activeDoshaId", idPublico);
    localStorage.setItem("pendingClaimIdPublico", idPublico);
    navigate(`/entrar?claim=${idPublico}`);
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-sm opacity-60"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <p className="text-base font-serif font-bold text-foreground">
            {titulo}
          </p>
          <Button
            onClick={handleClaim}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            Criar minha conta grátis
          </Button>
          <p className="text-xs text-muted-foreground">{microtexto}</p>
        </div>
      </div>
    </div>
  );
};

export default ClaimLock;
