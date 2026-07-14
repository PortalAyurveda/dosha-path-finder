import { useState } from "react";
import { Heart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

interface HeartButtonProps {
  contentType: "video" | "artigo";
  contentId: string;
  className?: string;
  variant?: "compact" | "destaque";
}

const HeartButton = ({ contentType, contentId, className, variant = "compact" }: HeartButtonProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
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
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/entrar?redirect=${redirect}`);
      return;
    }

    const cacheKey = ["content-like", contentType, contentId, user.id];

    if (liked) {
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
      const { error } = await supabase
        .from("content_likes" as any)
        .insert({ user_id: user.id, content_type: contentType, content_id: contentId } as any);
      if (!error) {
        try {
          const { data } = await (supabase.rpc as any)("evolucao_registrar", {
            p_tipo: "retorno_diario",
            p_ref: `${contentType}:${contentId}`,
          });
          if (data?.ok && (data?.pontos_ganhos ?? 0) > 0) {
            toast.success("✓ Registrado no seu dia");
            queryClient.invalidateQueries({ queryKey: ["minha-evolucao", user.id] });
          }
        } catch {
          /* silencioso */
        }
      }
    }
  };

  const isDestaque = variant === "destaque";
  const iconSize = isDestaque ? "h-6 w-6" : "h-5 w-5";
  const countSize = isDestaque ? "text-sm" : "text-xs";

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 transition-all group bg-transparent border-0 p-0",
        className
      )}
      title={user ? (liked ? "Remover curtida" : "Curtir") : "Entrar para curtir"}
      aria-label={liked ? "Remover curtida" : "Curtir"}
    >
      <span className={cn("relative", animating && "animate-heart-burst")}>
        <Heart
          className={cn(
            iconSize,
            "transition-all duration-200",
            liked
              ? "fill-red-500 text-red-500 scale-110"
              : "text-muted-foreground group-hover:text-red-400"
          )}
        />
        {animating && (
          <span className="absolute inset-0 animate-ping">
            <Heart className={cn(iconSize, "fill-red-500 text-red-500 opacity-40")} />
          </span>
        )}
      </span>
      {likeCount > 0 && (
        <span className={cn(countSize, "font-medium", liked ? "text-red-500" : "text-muted-foreground")}>
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default HeartButton;
