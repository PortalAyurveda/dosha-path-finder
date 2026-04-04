import { useState, useMemo } from "react";
import { Clock, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdvancedVideoResultProps {
  videoId: string;
  title: string;
  textoParaEmbedding: string;
}

function parseTimestamps(text: string) {
  const regex = /(\d{2}:\d{2}:\d{2})\s*[-–]\s*(.+)/g;
  const entries: { timestamp: string; seconds: number; label: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [h, m, s] = match[1].split(":").map(Number);
    entries.push({
      timestamp: match[1],
      seconds: h * 3600 + m * 60 + s,
      label: match[2].trim(),
    });
  }
  return entries;
}

const AdvancedVideoResult = ({ videoId, title, textoParaEmbedding }: AdvancedVideoResultProps) => {
  const [startSeconds, setStartSeconds] = useState<number | null>(null);

  const timestamps = useMemo(() => parseTimestamps(textoParaEmbedding), [textoParaEmbedding]);

  const iframeSrc = startSeconds !== null
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startSeconds}`
    : `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="space-y-6">
      {/* Player */}
      <div className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden border border-border bg-black">
        <div className="aspect-video w-full">
          <iframe
            key={startSeconds ?? "init"}
            src={iframeSrc}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Title */}
      <h2 className="font-serif text-xl md:text-2xl font-bold text-primary">{title}</h2>

      {/* Timestamps */}
      {timestamps.length > 0 && (
        <div className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border border-border bg-surface-sun p-4 md:p-6">
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Índice de Minutos
          </h3>
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-1">
              {timestamps.map((entry) => (
                <button
                  key={entry.timestamp}
                  onClick={() => setStartSeconds(entry.seconds)}
                  className="w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <span className="flex items-center gap-1.5 text-secondary font-mono text-sm font-semibold whitespace-nowrap mt-0.5">
                    <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {entry.timestamp}
                  </span>
                  <span className="text-foreground text-sm leading-relaxed">
                    {entry.label}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default AdvancedVideoResult;
