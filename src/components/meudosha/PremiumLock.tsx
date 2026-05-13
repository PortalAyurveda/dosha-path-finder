import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PremiumLockProps {
  children: React.ReactNode;
}

const PremiumLock = ({ children }: PremiumLockProps) => {
  return (
    <div className="relative">
      {/* Conteúdo desfocado abaixo */}
      <div
        aria-hidden
        className="pointer-events-none select-none blur-sm opacity-60"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Conteúdo exclusivo para membros Premium
          </p>
          <Button asChild className="w-full">
            <Link to="/assinar">Assinar agora</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumLock;
