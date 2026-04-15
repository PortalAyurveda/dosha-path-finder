import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

interface HeartButtonProps {
  contentType: "video" | "artigo";
  contentId: string;
  className?: string;
}

const HeartButton = ({ contentType, contentId, className }: HeartButtonProps) => {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    // Get count
    supabase
      .from("content_likes" as any)
      .select("id", { count: "exact", head: true })
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .then(({ count }) => setLikeCount(count || 0));

    // Check if user liked
    if (user) {
      supabase
        .from("content_likes" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [user, contentType, contentId]);

  const toggle = async () => {
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await supabase
        .from("content_likes" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      await supabase
        .from("content_likes" as any)
        .insert({ user_id: user.id, content_type: contentType, content_id: contentId } as any);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={!user}
      className={cn(
        "inline-flex items-center gap-1.5 transition-all group",
        !user && "opacity-50 cursor-default",
        className
      )}
      title={user ? (liked ? "Remover curtida" : "Curtir") : "Faça login para curtir"}
    >
      <span className={cn("relative", animating && "animate-heart-burst")}>
        <Heart
          className={cn(
            "h-5 w-5 transition-all duration-200",
            liked
              ? "fill-red-500 text-red-500 scale-110"
              : "text-muted-foreground group-hover:text-red-400"
          )}
        />
        {animating && (
          <>
            <span className="absolute inset-0 animate-ping">
              <Heart className="h-5 w-5 fill-red-500 text-red-500 opacity-40" />
            </span>
          </>
        )}
      </span>
      {likeCount > 0 && (
        <span className={cn("text-xs font-medium", liked ? "text-red-500" : "text-muted-foreground")}>
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default HeartButton;
