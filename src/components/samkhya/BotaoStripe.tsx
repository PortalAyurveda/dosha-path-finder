import { ShoppingCart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { samkhyaTokens } from "./tokens";

interface BotaoStripeProps {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const BotaoStripe = ({ size = "md", fullWidth = false }: BotaoStripeProps) => {
  const padding =
    size === "lg"
      ? "px-5 py-3 text-sm"
      : size === "sm"
        ? "px-3 py-2 text-xs"
        : "px-4 py-2.5 text-sm";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={`inline-flex items-center justify-center gap-2 rounded-md font-medium cursor-not-allowed ${padding} ${fullWidth ? "w-full" : ""}`}
            style={{
              background: "transparent",
              color: samkhyaTokens.roxo,
              border: `1px solid ${samkhyaTokens.roxo}`,
              opacity: 0.7,
            }}
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
