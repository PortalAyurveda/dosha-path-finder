import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string | null;
  title: string;
  description: string;
}

const VideoPlayerDialog = ({ open, onOpenChange, videoId, title, description }: VideoPlayerDialogProps) => {
  if (!videoId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-primary">
              {title}
            </DialogTitle>
          </DialogHeader>
          {description && (
            <ScrollArea className="max-h-40 mt-3">
              <DialogDescription className="text-sm text-muted-foreground font-sans whitespace-pre-line">
                {description}
              </DialogDescription>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
