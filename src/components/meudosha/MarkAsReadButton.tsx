import { Check } from "lucide-react";
import { useViewedContent } from "@/hooks/useViewedContent";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MarkAsReadButtonProps {
  contentId: string;
  contentType: "artigo" | "video";
  className?: string;
}

const MarkAsReadButton = ({ contentId, contentType, className }: MarkAsReadButtonProps) => {
  const { user } = useUser();
  const { markAsViewed } = useViewedContent(contentType);

  if (!user) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsViewed(contentId);
    toast({ description: contentType === "artigo" ? "Artigo marcado como lido" : "Vídeo marcado como visto" });
  };

  return (
    <button
      onClick={handleClick}
      title={contentType === "artigo" ? "Marcar como lido" : "Marcar como visto"}
      aria-label={contentType === "artigo" ? "Marcar como lido" : "Marcar como visto"}
      className={cn(
        "shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full border border-border bg-background/80 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors",
        className
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
};

export default MarkAsReadButton;
