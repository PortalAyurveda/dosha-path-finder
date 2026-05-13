import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

export type ViewedContentType = "video" | "artigo";

export function useViewedContent(contentType: ViewedContentType) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: viewedIds } = useQuery({
    queryKey: ["user-content-views", contentType, user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data, error } = await supabase
        .from("user_content_views" as any)
        .select("content_id")
        .eq("user_id", user.id)
        .eq("content_type", contentType);
      if (error || !data) return new Set<string>();
      return new Set((data as any[]).map((r: any) => r.content_id));
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const markAsViewed = async (contentId: string) => {
    if (!user) return;
    await supabase
      .from("user_content_views" as any)
      .upsert(
        { user_id: user.id, content_type: contentType, content_id: contentId } as any,
        { onConflict: "user_id,content_type,content_id" }
      );
    queryClient.invalidateQueries({ queryKey: ["user-content-views", contentType, user.id] });
    // Also invalidate the legacy key used by VideosPersonalizadoTab
    queryClient.invalidateQueries({ queryKey: ["user-content-views", user.id] });
  };

  return { viewedIds: viewedIds || new Set<string>(), markAsViewed };
}
