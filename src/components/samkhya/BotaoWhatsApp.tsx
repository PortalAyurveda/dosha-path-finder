import { MessageCircle } from "lucide-react";
import { samkhyaTokens } from "./tokens";

interface BotaoWhatsAppProps {
  produtoNome: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const WHATSAPP = "5511998076111";

const BotaoWhatsApp = ({ produtoNome, size = "md", fullWidth = false }: BotaoWhatsAppProps) => {
  const text = encodeURIComponent(`Olá! Tenho interesse: ${produtoNome}`);
  const href = `https://wa.me/${WHATSAPP}?text=${text}`;

  const padding =
    size === "lg"
      ? "px-5 py-3 text-sm"
      : size === "sm"
        ? "px-3 py-2 text-xs"
        : "px-4 py-2.5 text-sm";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium text-white transition-colors ${padding} ${fullWidth ? "w-full" : ""}`}
      style={{ background: samkhyaTokens.roxo }}
      onMouseEnter={(e) => (e.currentTarget.style.background = samkhyaTokens.roxoDark)}
      onMouseLeave={(e) => (e.currentTarget.style.background = samkhyaTokens.roxo)}
    >
      <MessageCircle className="h-4 w-4" />
      Comprar via WhatsApp
    </a>
  );
};

export default BotaoWhatsApp;
