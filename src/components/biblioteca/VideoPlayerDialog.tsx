import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Play } from "lucide-react";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string | null;
  title: string;
  description: string;
  textoParaEmbedding?: string;
  initialSeconds?: number;
  searchTerm?: string;
}

function parseTimestamps(text: string) {
  const regex = /((\d{1,2}:)?\d{1,2}:\d{2})\s*[-–]\s*(.+)/g;
  const entries: { timestamp: string; seconds: number; label: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split(":").map(Number);
    const seconds = parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1];
    entries.push({ timestamp: match[1], seconds, label: match[3].trim() });
  }
  return entries;
}

const VideoPlayerDialog = ({ open, onOpenChange, videoId, title, description, textoParaEmbedding, initialSeconds, searchTerm }: VideoPlayerDialogProps) => {
  const [startSeconds, setStartSeconds] = useState<number | null>(initialSeconds ?? null);

  // Reset startSeconds when dialog opens with new initialSeconds
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStartSeconds(null);
    }
    onOpenChange(isOpen);
  };

  const timestamps = useMemo(() => {
    if (!textoParaEmbedding) return [];
    return parseTimestamps(textoParaEmbedding);
  }, [textoParaEmbedding]);

  const isHighlighted = (label: string) =>
    searchTerm ? label.toLowerCase().includes(searchTerm.toLowerCase()) : false;

  if (!videoId) return null;

  const currentStart = startSeconds ?? initialSeconds ?? null;
  const iframeSrc = currentStart !== null
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${currentStart}`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm max-h-[90vh] flex flex-col">
        <div className="aspect-video w-full flex-shrink-0">
          <iframe
            key={currentStart ?? "init"}
            src={iframeSrc}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-3">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl md:text-2xl text-primary">
                {title}
              </DialogTitle>
            </DialogHeader>

            {timestamps.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-sun p-3">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Índice de Minutos
                </h3>
                <div className="space-y-0.5">
                  {timestamps.map((entry) => {
                    const highlighted = isHighlighted(entry.label);
                    return (
                      <button
                        key={entry.timestamp}
                        onClick={() => setStartSeconds(entry.seconds)}
                        className={`w-full text-left flex items-start gap-3 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors group ${highlighted ? "bg-primary/5" : ""}`}
                      >
                        <span className="flex items-center gap-1 text-secondary font-mono text-xs font-semibold whitespace-nowrap mt-0.5">
                          <Play className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {entry.timestamp}
                        </span>
                        <span className={`text-xs leading-relaxed ${highlighted ? "font-bold underline text-foreground" : "text-foreground"}`}>
                          {entry.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {description && (
              <DialogDescription className="text-xs text-muted-foreground font-sans whitespace-pre-line leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
