import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slugify";
import HeartButton from "@/components/HeartButton";
import MarkAsReadButton from "@/components/meudosha/MarkAsReadButton";

interface VideoResultCardProps {
  videoId: string;
  title: string;
  summary: string;
  tags: string | null;
  onClick?: () => void;
  showActions?: boolean;
}

const doshaColors: Record<string, string> = {
  vata: "bg-vata/20 text-vata border-vata/30",
  pitta: "bg-secondary/20 text-secondary border-secondary/30",
  kapha: "bg-kapha/20 text-kapha border-kapha/30",
};

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function getTagColor(tag: string): string {
  const lower = tag.toLowerCase();
  if (lower.includes("vata")) return doshaColors.vata;
  if (lower.includes("pitta")) return doshaColors.pitta;
  if (lower.includes("kapha")) return doshaColors.kapha;
  return "bg-accent/20 text-accent-foreground border-accent/30";
}

const VideoResultCard = ({ videoId, title, summary, tags, onClick, showActions = true }: VideoResultCardProps) => {
  const navigate = useNavigate();
  const tagList = parseTags(tags);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/video/${slugify(title)}`, { state: { videoId } });
    }
  };

  return (
    <div className="group relative rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <button
        onClick={handleClick}
        className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-base md:text-lg font-semibold text-primary line-clamp-2 mb-2 pr-16">
            {title}
          </h3>
          <p className="font-sans text-sm text-muted-foreground line-clamp-3 mb-3">
            {summary}
          </p>
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tagList.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </button>
      {showActions && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <HeartButton contentType="video" contentId={videoId} />
          <MarkAsReadButton contentType="video" contentId={videoId} />
        </div>
      )}
    </div>
  );
};

export default VideoResultCard;
