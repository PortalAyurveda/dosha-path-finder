import { useMemo } from "react";

interface AdvancedVideoCardProps {
  videoId: string;
  title: string;
  textoParaEmbedding: string;
  searchTerm: string;
  onClick: (initialSeconds: number) => void;
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

const AdvancedVideoCard = ({ videoId, title, textoParaEmbedding, searchTerm, onClick }: AdvancedVideoCardProps) => {
  const matches = useMemo(() => {
    const timestamps = parseTimestamps(textoParaEmbedding);
    return timestamps.filter((e) => e.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [textoParaEmbedding, searchTerm]);

  const firstMatch = matches[0];

  return (
    <button
      onClick={() => onClick(firstMatch?.seconds ?? 0)}
      className="group text-left w-full rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-serif text-base md:text-lg font-semibold text-primary line-clamp-2">
          {title}
        </h3>
        {firstMatch && (
          <p className="text-sm text-foreground font-bold underline">
            {firstMatch.timestamp} — {firstMatch.label}
          </p>
        )}
        {matches.length > 1 && (
          <p className="text-xs text-muted-foreground">
            +{matches.length - 1} {matches.length - 1 === 1 ? "menção" : "menções"}
          </p>
        )}
      </div>
    </button>
  );
};

export default AdvancedVideoCard;
