import { ShoppingCart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BotaoStripeProps {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const CINZA_DESABILITADO = "#9CA3AF";

const BotaoStripe = ({ size = "md", fullWidth = false }: BotaoStripeProps) => {
  const padding = size === "lg" ? "px-6 py-4 text-base" : size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-not-allowed ${padding} ${fullWidth ? "w-full" : ""}`}
            style={{ background: CINZA_DESABILITADO, color: "#fff" }}
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar Online
          </button>
        </TooltipTrigger>
        <TooltipContent>Em breve — pagamento via Stripe</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BotaoStripe;
