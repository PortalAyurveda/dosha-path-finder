import { useState } from "react";
import { Heart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [animating, setAnimating] = useState(false);

  const { data: likeData } = useQuery({
    queryKey: ["content-like", contentType, contentId, user?.id || "anon"],
    queryFn: async () => {
      const { count } = await supabase
        .from("content_likes" as any)
        .select("id", { count: "exact", head: true })
        .eq("content_type", contentType)
        .eq("content_id", contentId);

      let liked = false;
      if (user) {
        const { data } = await supabase
          .from("content_likes" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("content_type", contentType)
          .eq("content_id", contentId)
          .maybeSingle();
        liked = !!data;
      }

      return { count: count || 0, liked };
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const liked = likeData?.liked ?? false;
  const likeCount = likeData?.count ?? 0;

  const toggle = async () => {
    if (!user) return;

    const cacheKey = ["content-like", contentType, contentId, user.id];

    if (liked) {
      // Optimistic update
      queryClient.setQueryData(cacheKey, { count: Math.max(0, likeCount - 1), liked: false });
      await supabase
        .from("content_likes" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId);
    } else {
      queryClient.setQueryData(cacheKey, { count: likeCount + 1, liked: true });
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
          <span className="absolute inset-0 animate-ping">
            <Heart className="h-5 w-5 fill-red-500 text-red-500 opacity-40" />
          </span>
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