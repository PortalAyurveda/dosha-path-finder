import { ShoppingCart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { samkhyaTokens } from "./tokens";

interface BotaoStripeProps {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

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
            className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-not-allowed opacity-60 ${padding} ${fullWidth ? "w-full" : ""}`}
            style={{ background: samkhyaTokens.ouro, color: "#fff" }}
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
