import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ParedeCadastroProps {
  idPublico: string;
}

const ParedeCadastro = ({ idPublico }: ParedeCadastroProps) => {
  const navigate = useNavigate();

  const abrirCadastro = () => {
    localStorage.setItem("activeDoshaId", idPublico);
    localStorage.setItem("pendingClaimIdPublico", idPublico);
    const destino = `/meu-dosha?id=${idPublico}`;
    navigate(`/entrar?claim=${idPublico}&redirect=${encodeURIComponent(destino)}`);
  };

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Seu diagnóstico completo está pronto
        </h2>
      </div>

      <p className="text-base sm:text-lg text-foreground leading-relaxed">
        Você já viu qual é o seu dosha agravado. Falta o mais importante: o que está causando o seu desequilíbrio, o que fazer nos próximos 30 dias e quais plantas combinam com o seu corpo.
      </p>

      <p className="text-base sm:text-lg text-foreground leading-relaxed">
        Não precisa criar senha. A gente já sabe o seu e-mail: você recebe um código de 6 números e entra na hora.
      </p>

      <Button
        onClick={abrirCadastro}
        className="w-full min-h-[60px] text-base font-semibold"
      >
        Ver meu diagnóstico completo
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="text-sm text-center text-foreground">
        É de graça e leva menos de 1 minuto.
      </p>
    </div>
  );
};

export default ParedeCadastro;
