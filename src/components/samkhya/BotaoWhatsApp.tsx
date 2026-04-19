import { MessageCircle } from "lucide-react";

interface BotaoWhatsAppProps {
  produtoNome: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const WHATSAPP = "5511998076111";

const BotaoWhatsApp = ({ produtoNome, size = "md", fullWidth = false }: BotaoWhatsAppProps) => {
  const text = encodeURIComponent(`Olá! Tenho interesse: ${produtoNome}`);
  const href = `https://wa.me/${WHATSAPP}?text=${text}`;

  const padding = size === "lg" ? "px-6 py-4 text-base" : size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold text-white transition-colors hover:brightness-110 ${padding} ${fullWidth ? "w-full" : ""}`}
      style={{ background: "#25D366" }}
    >
      <MessageCircle className="h-4 w-4" />
      Comprar via WhatsApp
    </a>
  );
};

export default BotaoWhatsApp;
